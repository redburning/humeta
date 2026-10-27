<script setup>
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'

const emit = defineEmits(['initialization-error', 'ready', 'structure-change'])

const editorHost = ref(null)
const composerRef = shallowRef(null)
const kekuleRef = shallowRef(null)
const isLoading = ref(true)
const initializationFailed = ref(false)

let editorInstance = null
let resizeObserver = null
let resizeFrame = 0
let summaryTimer = 0
let activeBlobUrl = ''
let isUnmounted = false

const EMPTY_SUMMARY = Object.freeze({
  hasStructure: false,
  atomCount: 0,
  bondCount: 0,
  moleculeCount: 0,
  smiles: '',
  molfile: '',
})

function getCurrentMolecules() {
  const composer = composerRef.value
  const Kekule = kekuleRef.value

  if (!composer || !Kekule) return []

  try {
    const molecules = composer.exportObjs(Kekule.Molecule)
    return Array.isArray(molecules) ? molecules.filter(Boolean) : []
  } catch {
    // Kekule 1.0.4 throws when exportObjs is called before an empty ChemSpace exists.
    return []
  }
}

function getCurrentMolecule() {
  return getCurrentMolecules()[0] || null
}

function serializeMolecule(molecule, format) {
  const Kekule = kekuleRef.value
  if (!Kekule || !molecule) return ''

  const output = Kekule.IO.saveFormatData(molecule, format)
  return Array.isArray(output) ? output[0] || '' : output || ''
}

function createSummary() {
  const molecules = getCurrentMolecules()
  const molecule = molecules[0]

  if (!molecule) return { ...EMPTY_SUMMARY }

  const atomCount = typeof molecule.getNodeCount === 'function' ? molecule.getNodeCount() : 0
  const bondCount = typeof molecule.getConnectorCount === 'function' ? molecule.getConnectorCount() : 0
  const hasStructure = atomCount > 0 || bondCount > 0

  if (!hasStructure) return { ...EMPTY_SUMMARY }

  let smiles = ''
  let molfile = ''

  try {
    smiles = serializeMolecule(molecule, 'smi')
  } catch {
    // An unfinished structure may not be serializable while the user is drawing.
  }

  try {
    molfile = serializeMolecule(molecule, 'mol')
  } catch {
    // Keep counts available even when an unfinished structure can not be exported.
  }

  return {
    hasStructure,
    atomCount,
    bondCount,
    moleculeCount: molecules.length,
    smiles,
    molfile,
  }
}

function emitSummary() {
  if (isUnmounted) return
  emit('structure-change', createSummary())
}

function scheduleSummary() {
  window.clearTimeout(summaryTimer)
  summaryTimer = window.setTimeout(emitSummary, 300)
}

function handleOperationChange() {
  scheduleSummary()
}

function scheduleResize() {
  window.cancelAnimationFrame(resizeFrame)
  resizeFrame = window.requestAnimationFrame(() => {
    const composer = composerRef.value
    if (composer && !isUnmounted) composer.resized()
  })
}

function extractMolecules(chemObj) {
  const Kekule = kekuleRef.value
  if (!Kekule || !chemObj) return []
  if (chemObj instanceof Kekule.Molecule) return [chemObj]

  const children = Kekule.ChemStructureUtils.getChildStructureObjs(chemObj, true) || []
  return children.filter((item) => item instanceof Kekule.Molecule)
}

function loadMolecule(molecule) {
  const composer = composerRef.value
  if (!composer || !molecule) throw new Error('Kekule.js is not ready yet.')

  composer.setChemObj(molecule)
  // Keep the parent summary in sync before a fast subsequent Search click.
  // The delayed frame below is only needed for visual resize/reset work.
  emitSummary()
  window.requestAnimationFrame(() => {
    if (isUnmounted || !composerRef.value) return
    editorInstance?.resetDisplay()
    composer.resized()
  })
}

function importStructure(data, format, invalidMessage) {
  const Kekule = kekuleRef.value
  if (!Kekule || !composerRef.value) throw new Error('Kekule.js is not ready yet.')

  let chemObj
  try {
    chemObj = Kekule.IO.loadFormatData(data, format)
  } catch {
    throw new Error(invalidMessage)
  }

  const molecules = extractMolecules(chemObj)
  let molecule = molecules[0]

  if (format === 'smi' && molecule) {
    // Generate coordinates synchronously with the already loaded module, so no
    // Kekule worker or additional structure-generation asset is requested.
    molecule = Kekule.OpenBabel.StructUtils.generate2DStructure(molecule, {}) || molecule
  }

  const atomCount = molecule && typeof molecule.getNodeCount === 'function' ? molecule.getNodeCount() : 0

  if (!molecule || atomCount === 0) throw new Error(invalidMessage)

  loadMolecule(molecule)
  return { multiple: molecules.length > 1 }
}

function enableOpenBabelIo(Kekule) {
  // Kekule 1.0.4 includes a native SMILES writer, but its SMILES reader is
  // registered by the bundled OpenBabel adapter.
  const basePath = import.meta.env.BASE_URL.endsWith('/')
    ? import.meta.env.BASE_URL
    : `${import.meta.env.BASE_URL}/`

  Kekule.environment.setEnvVar('openbabel.path', `${basePath}kekule/openbabel/`)

  const openBabelInitOptions = Kekule.OpenBabel.getObInitOptions()
  openBabelInitOptions.creationOptions = {
    print(message) {
      if (String(message).includes('FS.trackingDelegate error on read file: /dev/stdin')) return
      console.log(message)
    },
    // OpenBabel writes parser diagnostics to stderr even when the caller handles
    // the failure. The page surfaces those failures as inline validation instead.
    printErr() {},
  }

  return new Promise((resolve, reject) => {
    Kekule.OpenBabel.loadObScript(document, (error) => {
      if (error) {
        reject(new Error('OpenBabel SMILES reader could not be loaded.'))
        return
      }

      try {
        if (!Kekule.OpenBabel.AdaptUtils.isAvailable()) {
          throw new Error('OpenBabel SMILES reader is unavailable.')
        }

        const registrationHelper = new Kekule.OpenBabel.IORegHelper()
        const converter = new (Kekule.OpenBabel.getClassCtor('ObConversionWrapper'))()

        try {
          const inputFormats = registrationHelper.listFormatInfo('in', converter)
          registrationHelper.registerByInfos(inputFormats, 'in')
        } finally {
          converter.delete()
        }

        resolve()
      } catch (registrationError) {
        reject(registrationError)
      }
    })
  })
}

function importSmiles(smiles) {
  const value = smiles.trim()
  if (!value) throw new Error('Please enter a SMILES string.')
  return importStructure(value, 'smi', 'Invalid or unsupported SMILES.')
}

function getFirstCompleteMolRecord(source, format) {
  const value = source.trim()
  if (!value) throw new Error('Please enter MOL data.')

  const lines = value.split(/\r?\n/)
  const recordBoundary = format === 'sd'
    ? lines.findIndex((line) => /^\s*\$\$\$\$\s*$/.test(line))
    : -1
  const firstRecordLines = recordBoundary >= 0 ? lines.slice(0, recordBoundary) : lines
  const terminatorIndex = firstRecordLines.findIndex((line) => /^\s*M\s+END\s*$/.test(line))

  if (terminatorIndex < 0) throw new Error('Invalid MOL data.')

  return firstRecordLines.slice(0, terminatorIndex + 1).join('\n')
}

function importMol(molText, format = 'mol') {
  const firstRecord = getFirstCompleteMolRecord(molText, format)
  return importStructure(firstRecord, 'mol', 'Invalid MOL data.')
}

function loadExample() {
  return importSmiles('C1=CC=C2C(=C1)C(=CN2)C[C@@H](C(=O)O)N')
}

function clearStructure() {
  const composer = composerRef.value
  const Kekule = kekuleRef.value
  if (!composer || !Kekule) throw new Error('Kekule.js is not ready yet.')

  window.clearTimeout(summaryTimer)
  composer.setChemObj(new Kekule.ChemSpace())
  emit('structure-change', { ...EMPTY_SUMMARY })
}

function exportSmiles() {
  const molecule = getCurrentMolecule()
  if (!molecule) throw new Error('Draw or import a structure first.')

  const smiles = serializeMolecule(molecule, 'smi')
  if (!smiles) throw new Error('Unable to export SMILES.')

  emitSummary()
  return smiles
}

function downloadMol() {
  const molecule = getCurrentMolecule()
  if (!molecule) throw new Error('Draw or import a structure first.')

  const molfile = serializeMolecule(molecule, 'mol')
  if (!molfile) throw new Error('Unable to export MOL data.')

  if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl)
  activeBlobUrl = URL.createObjectURL(new Blob([molfile], { type: 'chemical/x-mdl-molfile;charset=utf-8' }))

  const downloadLink = document.createElement('a')
  downloadLink.href = activeBlobUrl
  downloadLink.download = 'humeta-structure.mol'
  downloadLink.hidden = true
  document.body.appendChild(downloadLink)
  downloadLink.click()
  downloadLink.remove()

  URL.revokeObjectURL(activeBlobUrl)
  activeBlobUrl = ''
  emitSummary()
  return molfile
}

async function initializeComposer() {
  try {
    const [module] = await Promise.all([
      import('kekule'),
      import('kekule/theme/default'),
    ])
    const Kekule = module.Kekule || module.default?.Kekule || module.default

    if (!Kekule?.Editor?.Composer || isUnmounted) {
      throw new Error('Kekule Composer is unavailable.')
    }

    await new Promise((resolve) => Kekule._ready(resolve))
    if (isUnmounted || !editorHost.value) return

    await enableOpenBabelIo(Kekule)
    if (isUnmounted || !editorHost.value) return

    kekuleRef.value = Kekule

    const composer = new Kekule.Editor.Composer(editorHost.value)
    const componentNames = Kekule.ChemWidget.ComponentWidgetNames

    composer.setPredefinedSetting('molOnly')
    composer.setAutoSetMinDimension(false)
    composer.setEnableOperHistory(true)
    composer.setEnableLoadNewFile(false)
    composer.setEnableCreateNewDoc(false)
    composer.setAllowCreateNewChild(false)
    composer.setEnableStyleToolbar(false)
    composer.setEnableObjModifierToolbar(false)
    composer.setShowObjInspector(false)
    composer.setShowIssueInspector(false)
    composer.setCommonToolButtons([
      componentNames.undo,
      componentNames.redo,
      componentNames.zoomIn,
      componentNames.zoomOut,
      componentNames.resetZoom,
    ])
    composer.setChemToolButtons([
      {
        name: componentNames.manipulate,
        hint: 'Select',
        attached: [
          { name: componentNames.manipulateMarquee, hint: 'Rectangle selection' },
          { name: componentNames.manipulateLasso, hint: 'Lasso selection' },
          { name: componentNames.dragScroll, hint: 'Pan canvas' },
        ],
      },
      { name: componentNames.erase, hint: 'Erase' },
      {
        name: componentNames.molBond,
        hint: 'Bond',
        attached: [
          { name: componentNames.molBondSingle, hint: 'Single bond' },
          { name: componentNames.molBondDouble, hint: 'Double bond' },
          { name: componentNames.molBondTriple, hint: 'Triple bond' },
          { name: componentNames.molBondWedgeUp, hint: 'Solid wedge bond' },
          { name: componentNames.molBondWedgeDown, hint: 'Hashed wedge bond' },
          { name: componentNames.molChain, hint: 'Chain' },
        ],
      },
      {
        name: componentNames.molAtomAndFormula,
        hint: 'Atom / Formula',
        attached: [
          { name: componentNames.molAtom, hint: 'Atom' },
          { name: componentNames.molFormula, hint: 'Formula' },
        ],
      },
      {
        name: componentNames.molRing,
        hint: 'Ring',
        attached: [
          { name: componentNames.molRing5, hint: '5-member ring' },
          { name: componentNames.molRing6, hint: '6-member ring' },
          { name: componentNames.molRingAr6, hint: 'Aromatic 6-member ring' },
          { name: componentNames.molFlexRing, hint: 'Flexible ring' },
          { name: componentNames.molRepCyclopentaneHaworth1, hint: 'Haworth 5-member ring' },
          { name: componentNames.molRepCyclohexaneHaworth1, hint: 'Haworth 6-member ring' },
          { name: componentNames.molRepCyclohexaneChair1, hint: '6-member chair conformation' },
        ],
      },
      {
        name: componentNames.molCharge,
        hint: 'Charge',
        attached: [
          { name: componentNames.molChargeClear, hint: 'Clear charge' },
          { name: componentNames.molChargePositive, hint: 'Positive charge' },
          { name: componentNames.molChargeNegative, hint: 'Negative charge' },
        ],
      },
    ])

    const nativeActionHints = [
      [componentNames.undo, 'Undo'],
      [componentNames.redo, 'Redo'],
      [componentNames.zoomIn, 'Zoom in'],
      [componentNames.zoomOut, 'Zoom out'],
      [componentNames.resetZoom, 'Reset zoom'],
      [componentNames.manipulate, 'Select'],
      [componentNames.erase, 'Erase'],
      [componentNames.molBond, 'Bond'],
      [componentNames.molAtomAndFormula, 'Atom / Formula'],
      [componentNames.molRing, 'Ring'],
      [componentNames.molCharge, 'Charge'],
      [componentNames.manipulateMarquee, 'Rectangle selection'],
      [componentNames.manipulateLasso, 'Lasso selection'],
      [componentNames.dragScroll, 'Pan canvas'],
      [componentNames.molBondSingle, 'Single bond'],
      [componentNames.molBondDouble, 'Double bond'],
      [componentNames.molBondTriple, 'Triple bond'],
      [componentNames.molBondWedgeUp, 'Solid wedge bond'],
      [componentNames.molBondWedgeDown, 'Hashed wedge bond'],
      [componentNames.molChain, 'Chain'],
      [componentNames.molAtom, 'Atom'],
      [componentNames.molFormula, 'Formula'],
      [componentNames.molRing5, '5-member ring'],
      [componentNames.molRing6, '6-member ring'],
      [componentNames.molRingAr6, 'Aromatic 6-member ring'],
      [componentNames.molFlexRing, 'Flexible ring'],
      [componentNames.molRepCyclopentaneHaworth1, 'Haworth 5-member ring'],
      [componentNames.molRepCyclohexaneHaworth1, 'Haworth 6-member ring'],
      [componentNames.molRepCyclohexaneChair1, '6-member chair conformation'],
      [componentNames.molChargeClear, 'Clear charge'],
      [componentNames.molChargePositive, 'Positive charge'],
      [componentNames.molChargeNegative, 'Negative charge'],
    ]

    for (const [name, hint] of nativeActionHints) {
      const actionClass = composer.getCompActionClass(name)
      const action = actionClass ? composer.getActionMap().get(actionClass) : null
      if (action) action.setHint(hint)
    }

    composer.setDimension('100%', '100%')
    composer.setObserveElemResize(false)

    composerRef.value = composer
    editorInstance = composer.getEditor()
    editorInstance.addEventListener('operChange', handleOperationChange)

    resizeObserver = new ResizeObserver(scheduleResize)
    resizeObserver.observe(editorHost.value)
    scheduleResize()

    isLoading.value = false
    emit('ready')
    emitSummary()
  } catch (error) {
    if (isUnmounted) return
    isLoading.value = false
    initializationFailed.value = true
    emit('initialization-error', error)
  }
}

onMounted(initializeComposer)

onBeforeUnmount(() => {
  isUnmounted = true
  window.clearTimeout(summaryTimer)
  window.cancelAnimationFrame(resizeFrame)
  resizeObserver?.disconnect()
  resizeObserver = null

  if (editorInstance) {
    editorInstance.removeEventListener('operChange', handleOperationChange)
    editorInstance = null
  }

  const composer = composerRef.value
  if (composer) composer.finalize()
  composerRef.value = null
  kekuleRef.value = null

  if (activeBlobUrl) URL.revokeObjectURL(activeBlobUrl)
  activeBlobUrl = ''
})

defineExpose({
  clearStructure,
  downloadMol,
  exportSmiles,
  getKekule: () => kekuleRef.value,
  getCurrentMolecule,
  getCurrentMolecules,
  importMol,
  importSmiles,
  loadExample,
})
</script>

<template>
  <div class="editor-shell">
    <div ref="editorHost" class="editor-host" aria-label="Kekule chemical structure composer" />

    <div v-if="isLoading" class="editor-state" role="status">
      <span class="editor-state__spinner" aria-hidden="true" />
      <p>Loading Kekule.js...</p>
    </div>

    <div v-else-if="initializationFailed" class="editor-state editor-state--error" role="alert">
      <span class="editor-state__error-icon" aria-hidden="true">!</span>
      <p>Kekule.js initialization failed.</p>
    </div>
  </div>
</template>

<style scoped>
.editor-shell {
  position: relative;
  width: 100%;
  height: 550px;
  min-width: 0;
  overflow: auto hidden;
  border: 1px solid #cbdde7;
  border-radius: 5px;
  background: #fff;
}

.editor-host {
  width: 100%;
  min-width: 660px;
  height: 100%;
  margin: 0;
}

.editor-host:deep(.K-Chem-Composer) {
  width: 100% !important;
  height: 100% !important;
  margin: 0;
  border: 0;
}

.editor-host:deep(.K-Chem-Composer-Top-Region),
.editor-host:deep(.K-Chem-Composer-Left-Region),
.editor-host:deep(.K-Chem-Composer-Common-Toolbar),
.editor-host:deep(.K-Chem-Composer-Chem-Toolbar) {
  background: #f5f7f8;
}

.editor-host:deep(.K-Chem-Composer-Bottom-Region) {
  background: #fbfcfd;
  box-shadow: inset 0 1px 0 #d5e2e8;
}

.editor-host:deep(.K-Chem-Composer-Assoc-Toolbar) {
  background: #f7f9fa;
}

.editor-host:deep(.K-Chem-Composer-Zoom-Toolbar) {
  background: #f2f5f7;
  box-shadow: inset 1px 0 0 #d5e2e8;
}

.editor-host:deep(.K-Chem-Composer-Toolbar > .K-Button) {
  border-color: #d5e2e8;
  border-radius: 0;
  box-shadow: none;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    box-shadow 160ms ease;
}

.editor-host:deep(.K-Chem-Composer-Common-Toolbar > .K-Button),
.editor-host:deep(.K-Chem-Composer-Chem-Toolbar > .K-Button) {
  background: #f5f7f8;
}

.editor-host:deep(.K-Chem-Composer-Assoc-Toolbar > .K-Button) {
  background: #f7f9fa;
}

.editor-host:deep(.K-Chem-Composer-Zoom-Toolbar > .K-Button) {
  background: #f2f5f7;
}

.editor-host:deep(.K-Chem-Composer-Toolbar > .K-Button:hover:not(.K-State-Disabled)),
.editor-host:deep(.K-Chem-Composer-Toolbar > .K-Button.K-State-Hover:not(.K-State-Disabled)) {
  border-color: #b9d7e6;
  background: #eef6fa;
}

.editor-host:deep(.K-Chem-Composer-Chem-Toolbar > .K-Button.K-State-Active) {
  border-color: #5ea8cf;
  background: #e5f2f9;
  box-shadow: inset 2px 0 0 var(--humeta-brand-primary, #087fbe);
}

.editor-host:deep(.K-Chem-Composer-Assoc-Toolbar > .K-Button.K-State-Active) {
  border-color: #7fb4d0;
  background: #e8f3f9;
  box-shadow: inset 0 0 0 1px rgba(8, 127, 190, 0.22);
}

.editor-host:deep(.K-Chem-Composer-Toolbar > .K-Button:active:not(.K-State-Disabled)) {
  border-color: #8cbdd6;
  background: #dfeef6;
}

.editor-host:deep(.K-Chem-Composer-Toolbar > .K-Button:focus-visible) {
  outline: 2px solid rgba(8, 127, 190, 0.72) !important;
  outline-offset: -2px;
}

.editor-host:deep(.K-Chem-Composer-Toolbar > .K-Button.K-State-Disabled) {
  opacity: 0.48;
}

.editor-host:deep(
    .K-Chem-RepositoryStructureFragmentIaController-CyclopentaneHaworth1
      > .K-Pri-Glyph-Content
  ),
.editor-host:deep(
    .K-Chem-RepositoryStructureFragmentIaController-CyclohexaneHaworth1
      > .K-Pri-Glyph-Content
  ),
.editor-host:deep(
    .K-Chem-RepositoryStructureFragmentIaController-CyclohexaneChair1
      > .K-Pri-Glyph-Content
  ) {
  filter: brightness(0.72) contrast(1.15);
}

.editor-host:deep(
    .K-Chem-RepositoryStructureFragmentIaController-CyclohexaneChair1
      > .K-Pri-Glyph-Content
  ) {
  transform: translateY(-1px);
}

.editor-state {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 14px;
  color: #4e6877;
  background: #f8fbfd;
  font-size: 14px;
}

.editor-state__spinner {
  width: 30px;
  height: 30px;
  border: 3px solid #d8eaf2;
  border-top-color: var(--primary-blue);
  border-radius: 50%;
  animation: spin 800ms linear infinite;
}

.editor-state--error {
  color: #a13c3c;
  background: #fffafa;
}

.editor-state__error-icon {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 2px solid currentColor;
  border-radius: 50%;
  font-weight: 700;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 767px) {
  .editor-shell {
    height: 420px;
  }
}
</style>

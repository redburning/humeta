let kekuleRuntimePromise = null
const openBabelTasks = new WeakMap()
const OPEN_BABEL_TIMEOUT = 5 * 60 * 1000

export function loadKekuleRuntime() {
  if (!kekuleRuntimePromise) {
    kekuleRuntimePromise = Promise.all([
      import('kekule'),
      import('kekule/theme/default'),
    ]).then(([module]) => {
      const Kekule = module.Kekule || module.default?.Kekule || module.default
      if (!Kekule?.Editor?.Composer) throw new Error('Kekule Composer is unavailable.')
      return new Promise((resolve) => Kekule._ready(() => resolve(Kekule)))
    }).catch((error) => {
      kekuleRuntimePromise = null
      throw error
    })
  }
  return kekuleRuntimePromise
}

export function enableOpenBabelIo(Kekule) {
  let entry = openBabelTasks.get(Kekule)
  if (!entry) {
    entry = { wait: null, task: null }
    entry.task = startOpenBabelIo(Kekule).catch((error) => {
      // A fatal WASM abort cannot be repaired by reusing the vendor's cached
      // Module. A fresh document can retry; ordinary script failures can retry here.
      if (!error.requiresReload && openBabelTasks.get(Kekule) === entry) {
        openBabelTasks.delete(Kekule)
      }
      throw error
    })
    openBabelTasks.set(Kekule, entry)
  }

  if (!entry.wait) {
    const wait = new Promise((resolve, reject) => {
      const timeout = window.setTimeout(() => {
        reject(new Error('OpenBabel SMILES reader initialization timed out.'))
      }, OPEN_BABEL_TIMEOUT)
      entry.task.then(() => {
        window.clearTimeout(timeout)
        resolve()
      }, (error) => {
        window.clearTimeout(timeout)
        reject(error)
      })
    }).catch((error) => {
      if (entry.wait === wait) entry.wait = null
      throw error
    })
    entry.wait = wait
  }
  // A timed-out waiter must not restart a script/runtime still loading below it.
  return entry.wait
}

function startOpenBabelIo(Kekule) {
  return new Promise((resolve, reject) => {
    let settled = false
    const finish = (error) => {
      if (settled) return
      settled = true
      // The Emscripten Module is a thenable: never resolve this Promise with it.
      if (error) reject(error)
      else resolve()
    }

    try {
      const publicBase = import.meta.env?.BASE_URL || '/'
      const basePath = publicBase.endsWith('/') ? publicBase : `${publicBase}/`
      Kekule.environment.setEnvVar('openbabel.path', `${basePath}kekule/openbabel/`)
      const options = Kekule.OpenBabel.getObInitOptions()
      options.creationOptions = {
        print(message) {
          if (String(message).includes('FS.trackingDelegate error on read file: /dev/stdin')) return
          console.log(message)
        },
        printErr() {},
        instantiateWasm(imports, receiveInstance) {
          // The bundled glue omits a rejection handler for its initial WASM
          // fetch. Use its supported hook so network errors reach the page.
          Promise.resolve().then(async () => {
            const scriptUrl = new URL(Kekule.OpenBabel.getObScriptUrl(), document.baseURI)
            const wasmUrl = new URL('openbabel.wasm', scriptUrl)
            const response = await fetch(wasmUrl.href, { credentials: 'same-origin' })
            if (!response.ok) throw new Error(`OpenBabel WASM request failed (${response.status}).`)

            const mimeType = (response.headers.get('content-type') || '').split(';')[0].trim().toLowerCase()
            let output
            if (mimeType === 'application/wasm' && typeof WebAssembly.instantiateStreaming === 'function') {
              try {
                output = await WebAssembly.instantiateStreaming(response.clone(), imports)
              } catch {
                // Reuse the original response instead of fetching WASM again.
                output = await WebAssembly.instantiate(await response.arrayBuffer(), imports)
              }
            } else {
              output = await WebAssembly.instantiate(await response.arrayBuffer(), imports)
            }
            receiveInstance(output.instance, output.module)
          }).catch((cause) => {
            const error = new Error('OpenBabel WASM could not be initialized. Reload this page to retry.')
            error.requiresReload = true
            error.cause = cause
            finish(error)
          })
          // Emscripten keeps its run dependency pending until receiveInstance.
          return {}
        },
        onAbort() {
          const error = new Error('OpenBabel SMILES reader could not be loaded. Reload this page to retry.')
          error.requiresReload = true
          finish(error)
        },
      }

      Kekule.OpenBabel.loadObScript(document, (error) => {
        if (settled) return
        if (error) {
          finish(new Error('OpenBabel SMILES reader could not be loaded.'))
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
          finish()
        } catch (registrationError) {
          finish(registrationError)
        }
      })
    } catch (error) {
      finish(error)
    }
  })
}

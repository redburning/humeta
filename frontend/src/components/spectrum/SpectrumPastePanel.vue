<script setup>
defineProps({
  modelValue: { type: String, required: true },
  errors: { type: Array, default: () => [] },
})
defineEmits(['update:modelValue', 'load-example', 'parse', 'clear'])
</script>

<template>
  <div class="paste-panel">
    <label for="spectrum-peak-list">Peak list</label>
    <textarea
      id="spectrum-peak-list"
      :value="modelValue"
      rows="9"
      spellcheck="false"
      placeholder="74.0964 12&#10;91.0542 28&#10;118.0651 45"
      :aria-invalid="errors.length ? 'true' : undefined"
      :aria-describedby="errors.length ? 'spectrum-peak-errors' : 'spectrum-peak-help'"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p id="spectrum-peak-help" class="paste-panel__help">Use m/z and intensity pairs separated by spaces, tabs, commas, or semicolons. Lines beginning with # are comments.</p>
    <ul v-if="errors.length" id="spectrum-peak-errors" class="paste-panel__errors" role="alert">
      <li v-for="item in errors" :key="`${item.line}-${item.message}`">{{ item.message }}</li>
    </ul>
    <div class="paste-panel__actions">
      <button type="button" @click="$emit('load-example')">Load Tryptophan Example</button>
      <button type="button" class="paste-panel__primary" @click="$emit('parse')">Parse peaks</button>
      <button type="button" @click="$emit('clear')">Clear</button>
    </div>
  </div>
</template>

<style scoped>
.paste-panel { display: grid; gap: 7px; }
.paste-panel label { color: #365764; font-size: 11px; font-weight: 700; }
.paste-panel textarea { width: 100%; min-width: 0; resize: vertical; padding: 11px 12px; border: 1px solid #c8dbe4; border-radius: 4px; color: #36515d; background: #fff; font: 11px/1.6 Consolas, "SFMono-Regular", monospace; }
.paste-panel textarea[aria-invalid='true'] { border-color: #c96f6f; }
.paste-panel textarea:focus-visible { outline: 2px solid rgba(8, 127, 190, .4); outline-offset: 2px; border-color: var(--primary-blue); }
.paste-panel__help { color: #84939a; font-size: 9px; line-height: 1.5; }
.paste-panel__errors { display: grid; gap: 3px; padding: 8px 10px 8px 25px; border-left: 3px solid #c86b6b; color: #9d3f3f; background: #fff5f5; font-size: 10px; }
.paste-panel__actions { display: flex; flex-wrap: wrap; gap: 7px; }
.paste-panel__actions button { min-height: 34px; padding: 7px 11px; border: 1px solid #8bbbd0; border-radius: 4px; color: #176f99; background: #fff; font-size: 10px; font-weight: 700; cursor: pointer; }
.paste-panel__actions .paste-panel__primary { color: #fff; border-color: var(--primary-blue); background: var(--primary-blue); }
@media (max-width: 520px) { .paste-panel__actions { display: grid; grid-template-columns: 1fr; } }
</style>

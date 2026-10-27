export function formatDetailLabel(label) {
  return String(label ?? '').replace(/\s*:\s*$/, '').trim()
}

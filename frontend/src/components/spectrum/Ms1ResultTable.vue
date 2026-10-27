<script setup>
defineProps({
  results: { type: Array, required: true },
  rankOffset: { type: Number, default: 0 },
})

function signed(value, digits) {
  const number = Number(value)
  return `${number >= 0 ? '+' : ''}${number.toFixed(digits)}`
}
</script>

<template>
  <div class="ms1-results">
    <div class="ms1-table-wrap">
      <table>
        <thead><tr><th scope="col">Rank</th><th scope="col">Humeta ID</th><th scope="col">Compound</th><th scope="col">Chinese name</th><th scope="col">Formula</th><th scope="col">Monoisotopic mass</th><th scope="col">Polarity</th><th scope="col">Adduct</th><th scope="col">Reference m/z</th><th scope="col">Delta Da</th><th scope="col">Delta ppm</th><th scope="col">Details</th></tr></thead>
        <tbody>
          <tr v-for="(result, index) in results" :key="result.record.id">
            <td>{{ rankOffset + index + 1 }}</td><td><strong>{{ result.record.id }}</strong></td><td>{{ result.record.name }}</td><td>{{ result.record.nameZh }}</td><td>{{ result.record.formula }}</td><td>{{ result.record.monoisotopicMass.toFixed(4) }}</td><td>{{ result.record.polarity }}</td><td>{{ result.record.adduct }}</td><td>{{ result.record.precursorMz.toFixed(4) }}</td><td>{{ signed(result.deltaDa, 6) }}</td><td>{{ signed(result.deltaPpm, 2) }}</td>
            <td><RouterLink v-if="result.record.detailsAvailable" :to="`/metabolites/${result.record.id}`">Details</RouterLink><span v-else title="Details unavailable">Unavailable</span></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="ms1-mobile-cards">
      <article v-for="(result, index) in results" :key="result.record.id" class="ms1-card">
        <header><span>#{{ rankOffset + index + 1 }}</span><div><strong>{{ result.record.name }}</strong><small>{{ result.record.nameZh }} · {{ result.record.id }}</small></div></header>
        <dl><div><dt>Formula</dt><dd>{{ result.record.formula }}</dd></div><div><dt>Reference m/z</dt><dd>{{ result.record.precursorMz.toFixed(4) }}</dd></div><div><dt>Ion</dt><dd>{{ result.record.polarity }} · {{ result.record.adduct }}</dd></div><div><dt>Delta Da</dt><dd>{{ signed(result.deltaDa, 6) }}</dd></div><div><dt>Delta ppm</dt><dd>{{ signed(result.deltaPpm, 2) }}</dd></div></dl>
        <RouterLink v-if="result.record.detailsAvailable" :to="`/metabolites/${result.record.id}`">Details</RouterLink><button v-else type="button" disabled title="Details unavailable">Details unavailable</button>
      </article>
    </div>
  </div>
</template>

<style scoped>
.ms1-table-wrap { width: 100%; overflow-x: auto; }
table { width: 100%; min-width: 1160px; border-collapse: collapse; font-size: 9px; }
th, td { padding: 9px 8px; border-bottom: 1px solid #e3ebef; text-align: left; vertical-align: middle; white-space: nowrap; }
th { color: #506b78; background: #f1f7fa; font-size: 8px; letter-spacing: .03em; text-transform: uppercase; }
td { color: #445c67; }
td strong { color: var(--primary-blue); }
td small { display: block; margin-top: 2px; color: #84939a; }
td a { color: var(--primary-blue); font-weight: 700; }
td > span { color: #9aa5aa; }
.ms1-mobile-cards { display: none; }
@media (max-width: 700px) {
  .ms1-table-wrap { display: none; }
  .ms1-mobile-cards { display: grid; gap: 10px; }
  .ms1-card { min-width: 0; padding: 12px; border: 1px solid #d4e3e9; border-radius: 5px; background: #fff; }
  .ms1-card header { display: flex; gap: 9px; align-items: center; }
  .ms1-card header > span { min-width: 31px; height: 31px; display: grid; place-items: center; border-radius: 50%; color: #fff; background: var(--primary-blue); font-size: 10px; }
  .ms1-card header strong, .ms1-card header small { display: block; }
  .ms1-card header strong { color: #26576d; font-size: 13px; }
  .ms1-card header small { margin-top: 2px; color: #7b8e97; font-size: 9px; }
  .ms1-card dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1px; margin: 10px 0; background: #e3ebef; }
  .ms1-card dl div { min-width: 0; padding: 7px; background: #f8fbfc; }
  .ms1-card dt { color: #8a989f; font-size: 8px; text-transform: uppercase; }
  .ms1-card dd { margin: 3px 0 0; color: #3e5e6b; font-size: 9px; font-weight: 700; overflow-wrap: anywhere; }
  .ms1-card a, .ms1-card button { min-height: 31px; display: inline-grid; place-items: center; padding: 5px 9px; border: 1px solid #7eb8d1; border-radius: 3px; color: var(--primary-blue); background: #fff; font-size: 9px; font-weight: 700; text-decoration: none; }
  .ms1-card button:disabled { color: #98a6ac; border-color: #d6e0e4; }
}
</style>

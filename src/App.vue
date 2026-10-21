<script setup>
import { computed, reactive, ref, shallowRef, watchEffect } from 'vue'
import QRCode from 'qrcode'
import Button from 'primevue/button'
import Card from 'primevue/card'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import folgenSvg from './assets/vorderseite-folgen.svg?raw'
import fediverseSvg from './assets/vorderseite-fediverse.svg?raw'
import frameSvg from './assets/rueckseite-rahmen.svg?raw'
import { saveImage, savePdf, saveSvg, serializeSvg } from './export.js'

const fronts = [
  { id: 'folgen', title: 'Ich würde euch gerne folgen', svg: folgenSvg },
  { id: 'fediverse', title: 'Kommt ins Fediverse', svg: fediverseSvg },
]
const front = shallowRef(fronts[0])

const blocks = reactive([
  { key: 'name', label: 'Name (nach "Hey")', value: '', x: 60, y: 31, size: 13, maxWidth: 125 },
  { key: 'intro', label: 'Einleitung', value: 'wollt ihr nicht auch ins Fediverse?', x: 39, y: 50.5, size: 13, maxWidth: 180 },
  { key: 'heading', label: 'Überschrift', value: 'Fediverse? Was ist das?', x: 34, y: 73, size: 14, maxWidth: 185 },
  {
    key: 'text',
    label: 'Text',
    value: [
      'Das Fediverse, zusammengesetzt',
      'aus "Federation" (föderiert) und',
      '"Universe" (Universum), ist ein',
      'riesiges Netzwerk mit sehr vielen',
      'untereinander vernetzten Servern',
      '(Instanzen), auf denen unterschiedliche',
      'Dienste bzw. Software läuft. Dank',
      'eingesetzter Protokolle können diese',
      'Instanzen aber untereinander alle',
      'miteinander kommunizieren.',
    ].join('\n'),
    rows: 10,
    x: 40,
    y: 90.5,
    size: 11.5,
    maxWidth: 180,
    lineHeight: 14.6,
  },
  { key: 'closing', label: 'Abschluss', value: 'Macht\nihr mit?', rows: 2, x: 38, y: 239, size: 14.5, maxWidth: 65, lineHeight: 13.5 },
  { key: 'link', label: 'Link (Text und QR-Code)', value: 'fediversum.info', x: 106, y: 256, size: 13.5, maxWidth: 80 },
  {
    key: 'address',
    label: 'Adresse (max. 5 Zeilen)',
    value: '',
    rows: 5,
    x: 247,
    lineYs: [151, 174, 196, 219, 247],
    size: 12,
    maxWidth: 140,
  },
])

function lines(block) {
  const all = block.value.split('\n')
  return block.lineYs ? all.slice(0, block.lineYs.length) : all
}

function lineY(block, index) {
  return block.lineYs ? block.lineYs[index] : block.y + index * (block.lineHeight ?? 0)
}

function fontSize(block) {
  const longestLine = Math.max(...lines(block).map((line) => line.length))
  return Math.min(block.size, block.maxWidth / (0.4 * longestLine))
}

const link = computed(() => blocks.find((block) => block.key === 'link'))
const qr = ref('')
watchEffect(async () => {
  const url = 'https://' + link.value.value.replace(/^https?:\/\//, '')
  qr.value = await QRCode.toString(url, { type: 'svg', margin: 0, color: { light: '#0000' } })
})

const backElement = ref(null)

const downloads = computed(() => [
  {
    title: 'Vorderseite',
    name: `postkarte-vorderseite-${front.value.id}`,
    getSvg: () => front.value.svg,
    originalPdf: `original/postkarte_a6_${front.value.id}.pdf`,
  },
  {
    title: 'Rückseite',
    name: 'postkarte-rueckseite',
    getSvg: () => serializeSvg(backElement.value),
  },
])
</script>

<template>
  <main>
    <h1>Fediverse-Postkarten-Generator</h1>
    <p>
      Du möchtest Menschen in deinem Umfeld das <a href="https://fediversum.info">Fediverse</a> zeigen, ganz analog oder digital. Mit diesem kleinen Generator gestaltest
      du eine Postkarte (A6, quer) zum Ausdrucken oder Verschicken.
    </p>
    <p>
      Wähle eine Vorderseite, passe die Rückseite mit deinem Text und der Adresse an und lade die Karte
      herunter. Alles läuft in deinem Browser, es wird nichts hochgeladen. Fragen, Feedback oder Ideen? Schreib mir auf Mastodon:
      <a href="https://hachyderm.io/@sabrinkmann" rel="me">@sabrinkmann@hachyderm.io</a>. Die Postkarten-Vorlagen und die damit erzeugten Postkarten stehen unter
      <a href="https://creativecommons.org/licenses/by-sa/4.0/deed.de" target="_blank" rel="license noopener">CC BY-SA 4.0</a>
      (Namensnennung: postcards.fedw.eu).
    </p>

    <h2>1. Vorderseite wählen</h2>
    <div class="row">
      <Card v-for="option in fronts" :key="option.id">
        <template #header><div v-html="option.svg" /></template>
        <template #title>{{ option.title }}</template>
        <template #footer>
          <Button
            :label="front === option ? 'Ausgewählt' : 'Auswählen'"
            :outlined="front !== option"
            @click="front = option"
          />
        </template>
      </Card>
    </div>

    <h2>2. Rückseite anpassen</h2>
    <div class="row">
      <form @submit.prevent>
        <p v-for="block in blocks" :key="block.key">
          <label :for="block.key">{{ block.label }}</label>
          <Textarea v-if="block.rows" :id="block.key" v-model="block.value" :rows="block.rows" fluid />
          <InputText v-else :id="block.key" v-model="block.value" fluid />
        </p>
      </form>

      <svg
        ref="backElement"
        xmlns="http://www.w3.org/2000/svg"
        width="419.76"
        height="297.84"
        viewBox="0 0 419.76 297.84"
        font-family="'Patrick Hand'"
        fill="#363433"
      >
        <g v-html="frameSvg" />
        <text x="39" y="33" font-size="13">Hey</text>
        <text x="189" y="33" font-size="13">,</text>
        <text x="106" y="242.5" font-size="13.5">Weitere Infos:</text>
        <text v-for="block in blocks" :key="block.key" :font-size="fontSize(block)">
          <tspan
            v-for="(line, index) in lines(block)"
            :key="index"
            :x="block.x"
            :y="lineY(block, index)"
          >{{ line }}</tspan>
        </text>
        <svg x="184" y="221" width="39" height="39" v-html="qr" />
      </svg>
    </div>

    <h2>3. Herunterladen</h2>
    <section v-for="download in downloads" :key="download.title">
      <h3>{{ download.title }}</h3>
      <div class="buttons">
        <Button
          v-for="format in ['png', 'jpg', 'webp']"
          :key="format"
          :label="format.toUpperCase()"
          @click="saveImage(download.getSvg(), format, download.name)"
        />
        <Button label="SVG" @click="saveSvg(download.getSvg(), download.name)" />
        <Button v-if="download.originalPdf" as="a" label="PDF (Original)" :href="download.originalPdf" download />
        <Button v-else label="PDF" @click="savePdf([download.getSvg()], download.name)" />
      </div>
    </section>
    <section>
      <h3>Vorder- und Rückseite zusammen</h3>
      <Button label="PDF mit 2 Seiten" @click="savePdf([front.svg, serializeSvg(backElement)], 'postkarte')" />
    </section>
  </main>

  <footer class="layout-footer">
    <div class="footer-grid">
      <div class="footer-col">
        Von: <a href="https://54gradsoftware.de/" target="_blank" rel="noopener">54 Grad Software GmbH</a>
      </div>
      <div class="footer-col">
        <a href="https://github.com/54GradSoftware/postcard-generator">GitHub (Software)</a> |
        <a href="https://github.com/54GradSoftware/postcard-generator/blob/main/LICENSE">MIT-Lizenz (Software)</a>
      </div>
      <div class="footer-col">
        <a href="https://www.54gradsoftware.de/impressum">Impressum</a> |
        <a href="https://www.54gradsoftware.de/datenschutz">Datenschutz</a>
      </div>
    </div>
    <p class="footer-license">
      Die Software steht unter MIT.
    </p>
  </footer>
</template>

<style>
body { margin: 0; font-family: system-ui, sans-serif; }
main { max-width: 64rem; margin: 0 auto; padding: 1rem; }
.row { display: flex; flex-wrap: wrap; gap: 1rem; align-items: flex-start; }
.row > * { flex: 1 1 20rem; min-width: 0; }
.row > svg, .p-card-header svg { width: 100%; height: auto; border: 1px solid #ccc; }
.row > svg { order: -1; } /* mobil: Vorschau über dem Formular */
@media (min-width: 48rem) {
  .row > svg { order: 0; position: sticky; top: 1rem; } /* Desktop: Vorschau bleibt beim Tippen sichtbar */
}
.buttons { display: flex; flex-wrap: wrap; gap: 0.5rem; }
a.p-button { text-decoration: none; }
label { display: block; margin-bottom: 0.25rem; }

/* Footer, übernommen vom Mastodon Account Checker */
.layout-footer { margin-top: 2rem; padding: 1.5rem; background: var(--p-surface-100); border-top: 1px solid var(--p-surface-200); }
.footer-grid { display: grid; grid-template-columns: 1fr; gap: 1rem; max-width: 1200px; margin: 0 auto; text-align: center; }
.footer-col a { color: inherit; text-decoration: none; }
.footer-col a:hover { text-decoration: underline; }
.footer-license { max-width: 1200px; margin: 1rem auto 0; text-align: center; }
@media (min-width: 48rem) {
  .footer-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>

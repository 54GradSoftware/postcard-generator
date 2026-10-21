import { saveAs } from 'file-saver'
import fontDataUrl from '@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff2?inline'

// A6 quer bei 300 dpi
const WIDTH = 1748
const HEIGHT = 1240

const MIME_TYPES = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }

// Postkarten und Vorlagen stehen unter CC BY-SA 4.0 (siehe src/assets/README.md).
const AUTHOR = '54 Grad Software GmbH'
const SOURCE_URL = 'https://postcards.fedw.eu'
const LICENSE_URL = 'https://creativecommons.org/licenses/by-sa/4.0/'

const SVG_LICENSE_METADATA = `<metadata><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" xmlns:cc="http://creativecommons.org/ns#" xmlns:dc="http://purl.org/dc/elements/1.1/"><cc:Work rdf:about=""><dc:title>Fediverse-Postkarte</dc:title><cc:attributionName>${AUTHOR}</cc:attributionName><cc:attributionURL rdf:resource="${SOURCE_URL}"/><cc:license rdf:resource="${LICENSE_URL}"/></cc:Work></rdf:RDF></metadata>`

// Lizenzangabe direkt hinter das Wurzelelement, damit sie in jeder heruntergeladenen SVG-Datei steht.
function withLicense(svgText) {
  return svgText.replace(/<svg\b[^>]*>/, (root) => root + SVG_LICENSE_METADATA)
}

// SVG-Element der Rückseite -> SVG-Text.
// Die Schrift wird mit eingebettet, sonst fehlt sie in der Datei und beim Zeichnen auf das Canvas.
export function serializeSvg(svgElement) {
  const copy = svgElement.cloneNode(true)
  copy.insertAdjacentHTML(
    'afterbegin',
    `<style>@font-face { font-family: 'Patrick Hand'; src: url(${fontDataUrl}); }</style>`,
  )
  return new XMLSerializer().serializeToString(copy)
}

function svgToCanvas(svgText) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = WIDTH
      canvas.height = HEIGHT
      const context = canvas.getContext('2d')
      context.fillStyle = 'white'
      context.fillRect(0, 0, WIDTH, HEIGHT)
      context.drawImage(image, 0, 0, WIDTH, HEIGHT)
      resolve(canvas)
    }
    image.onerror = reject
    image.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svgText)
  })
}

export function saveSvg(svgText, name) {
  saveAs(new Blob([withLicense(svgText)], { type: 'image/svg+xml' }), `${name}.svg`)
}

export async function saveImage(svgText, format, name) {
  const canvas = await svgToCanvas(svgText)
  canvas.toBlob((blob) => saveAs(blob, `${name}.${format}`), MIME_TYPES[format], 0.95)
}

export async function savePdf(svgTexts, name) {
  const { jsPDF } = await import('jspdf') 
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a6' })
  pdf.setProperties({
    subject: `Design: ${AUTHOR}, ${SOURCE_URL}, Lizenz: CC BY-SA 4.0 (${LICENSE_URL})`,
    creator: SOURCE_URL,
  })
  for (const [index, svgText] of svgTexts.entries()) {
    if (index > 0) pdf.addPage()
    const canvas = await svgToCanvas(svgText)
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 148, 105, undefined, 'FAST')
  }
  pdf.save(`${name}.pdf`)
}

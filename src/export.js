import { saveAs } from 'file-saver'
import fontDataUrl from '@fontsource/patrick-hand/files/patrick-hand-latin-400-normal.woff2?inline'

// A6 quer bei 300 dpi
const WIDTH = 1748
const HEIGHT = 1240

const MIME_TYPES = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' }

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
  saveAs(new Blob([svgText], { type: 'image/svg+xml' }), `${name}.svg`)
}

export async function saveImage(svgText, format, name) {
  const canvas = await svgToCanvas(svgText)
  canvas.toBlob((blob) => saveAs(blob, `${name}.${format}`), MIME_TYPES[format], 0.95)
}

export async function savePdf(svgTexts, name) {
  const { jsPDF } = await import('jspdf') 
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a6' })
  for (const [index, svgText] of svgTexts.entries()) {
    if (index > 0) pdf.addPage()
    const canvas = await svgToCanvas(svgText)
    pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 148, 105, undefined, 'FAST')
  }
  pdf.save(`${name}.pdf`)
}

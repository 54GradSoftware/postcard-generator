import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primeuix/themes/aura'
import { definePreset } from '@primeuix/themes'
import '@fontsource/patrick-hand'
import App from './App.vue'

// Aura-Standard: weißer Text auf Emerald-500 hat nur 2,5:1 Kontrast (WCAG AA braucht 4,5:1).
// Mit Emerald-700 sind es 5,5:1, beim Darüberfahren und Klicken (800/900) noch mehr.
const Theme = definePreset(Aura, {
  semantic: {
    colorScheme: {
      light: { primary: { color: '{primary.700}', hoverColor: '{primary.800}', activeColor: '{primary.900}' } },
    },
  },
})

// darkModeSelector 'none': Die Karte ist immer weiß, die Seite soll dazu passen.
createApp(App)
  .use(PrimeVue, { theme: { preset: Theme, options: { darkModeSelector: 'none' } } })
  .mount('#app')

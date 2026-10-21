# Fediverse Postkarten Generator

Simpler Generator für Fediverse Postkarten im Web mit Vue. Läuft unter <https://postcards.fedw.eu>.

## Starten

```sh
npm install
npm run dev       # Entwicklungsserver
npm run build    
npm run preview  
```
## Lizenz

| Was                                                                             | Lizenz                                  |
| ------------------------------------------------------------------------------- | --------------------------------------- |
| Quellcode (alles außer `src/assets/`)                                           | [MIT](LICENSE)                          |
| Postkarten-Vorlagen in `src/assets/` (SVG) und die damit erzeugten Postkarten   | [CC BY-SA 4.0](src/assets/LICENSE)      |

**Die Dateien in `src/assets/` stehen nicht unter der MIT-Lizenz**, sondern unter
[CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.de). Dasselbe gilt für die
Postkarten, die der Generator daraus erzeugt (SVG, PNG, JPG, WebP, PDF).
Details und Namensnennung: [src/assets/README.md](src/assets/README.md).

Die in die exportierten SVGs eingebettete Schrift [Patrick Hand](https://fontsource.org/fonts/patrick-hand)
steht unabhängig davon unter der [SIL Open Font License 1.1](https://openfontlicense.org/).

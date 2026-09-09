# JetTask Calculator

Un calcolatore a pagina singola che converte una retribuzione annua lorda (RAL)
italiana nella stima dello stipendio netto mensile, realizzato per il task di
Jet HR.

Si inserisce la RAL, si sceglie la regione di residenza e il numero di mensilità
previste dal contratto, e l'applicazione restituisce il netto insieme alla
scomposizione di dove finisce davvero il lordo: contributi previdenziali,
imposte e quanto resta in busta.

## Requisiti

- Node.js `^20.19.0 || >=22.12.0` (richiesto da Vite 8)
- npm

## Avvio

L'applicazione si trova nella cartella `JetTask/`:

```bash
cd JetTask
npm install
npm run dev
```

| Script | Cosa fa |
|---|---|
| `npm run dev` | Avvia il server di sviluppo Vite |
| `npm run build` | Compila il bundle di produzione in `dist/` |
| `npm run preview` | Serve in locale il bundle compilato |
| `npm run lint` | Esegue oxlint sui sorgenti |

## Stack tecnologico

React 19.2 con Vite 8, stile affidato a Tailwind CSS 4.3 (con il plugin
`@tailwindcss/forms`) e linting con oxlint. Non ci sono librerie di gestione
dello stato né una suite di test: tutto lo stato è in `useState` dentro
`App.jsx`.

## Struttura del progetto

```
JetTask/
├─ index.html                    
└─ src/
   ├─ App.jsx                    Tutto lo stato e l'intero calcolo fiscale
   ├─ index.css                  Token del tema, modalità scura, setup Tailwind
   ├─ data/const.js              Parametri fiscali, tabelle regionali, formato valuta
   └─ components/
      ├─ Header.jsx              Titolo e sottotitolo
      ├─ ThemeToggle.jsx         Interruttore chiaro/scuro, salvato in localStorage
      ├─ InfoGrid.jsx            Tutti i controlli di input
      ├─ Selector.jsx            <select> a tema, usato per regione e mensilità
      ├─ Result.jsx              Riquadro del netto, contiene il grafico
      └─ Graphic.jsx             Grafico a torta della scomposizione del lordo
```

Il calcolo è tenuto deliberatamente in `App.jsx` e i suoi parametri in
`data/const.js`. I componenti ricevono valori e setter come props e non
contengono logica di business.

## Input

| Controllo | Effetto |
|---|---|
| **Gross annual salary (RAL)** | La base imponibile. Accetta la virgola come separatore decimale. |
| **Region** | Seleziona l'aliquota dell'addizionale regionale dalla tabella di 20 voci in `const.js`. |
| **Months** | 12, 13 o 14. Divide il netto annuo nelle mensilità. |
| **Contract type** | `Indeterminato` o `Determinato`. Determina il minimo applicato alla detrazione. |
| **Working days** | 1–365. Riproporziona detrazione e trattamento integrativo. Bloccato a 365 sul tempo indeterminato, che copre sempre l'anno intero. |
| **Include "Renzi" Bonus** | Include o esclude il trattamento integrativo. |

Il risultato viene ricalcolato solo premendo **Calculate net salary**.

## Come viene calcolato il netto

Tutti i valori citati provengono da `src/data/const.js`.

1. **Reddito imponibile** — si sottraggono i contributi previdenziali dal lordo:
   `imponibile = RAL × (1 − 0,0919)`.
2. **IRPEF lorda** — gli scaglioni si applicano progressivamente, ogni aliquota
   solo sulla porzione di reddito che ricade al suo interno: 23% fino a
   28.000 €, 33% da 28.000 a 50.000 €, 43% oltre.
3. **Detrazione da lavoro dipendente** — 1.955 € fino a 15.000 € di reddito, poi
   `1.910 + 1.190 × (28.000 − reddito) / 13.000` fino a 28.000 €, poi
   `1.910 × (50.000 − reddito) / 22.000` fino a 50.000 €, e zero oltre.
   L'importo viene interamente riproporzionato per `giorni lavorati / 365`.
4. **Minimo della detrazione** — nella prima fascia il risultato non può
   scendere sotto 690 € a tempo indeterminato o 1.380 € a tempo determinato. Il
   minimo *non* viene riproporzionato sui giorni lavorati: è l'unico motivo per
   cui il tipo di contratto incide sul risultato.
5. **IRPEF netta** — `max(0, IRPEF lorda − detrazione)`. Le detrazioni sono un
   credito d'imposta: possono azzerare l'imposta ma non trasformarsi in un
   rimborso, e l'eccedenza si perde.
6. **Addizionale regionale** — `imponibile × aliquota regionale`, con
   un'aliquota unica per regione.
7. **Trattamento integrativo** — fino a 1.200 €, riproporzionati sui giorni
   lavorati. Fino a 15.000 € di reddito spetta quando l'IRPEF lorda supera
   1.880 € (la detrazione di prima fascia ridotta di 75 €); tra 15.000 € e
   28.000 € copre solo la detrazione che l'imposta non è riuscita ad assorbire;
   oltre è zero.
8. **Risultato** —
   `netto annuo = imponibile − IRPEF netta − addizionale regionale + trattamento integrativo`,
   diviso per il numero di mensilità.

Il trattamento integrativo è erogato *in aggiunta* alla retribuzione e non
sottratto da essa: per questo il grafico a torta divide il lordo in tre fette
che sommano esattamente alla RAL — netto, imposte (IRPEF più addizionale
regionale) e contributi INPS — e riporta il trattamento integrativo a parte,
sotto la legenda.

### Valori di riferimento

Lombardia, 13 mensilità, anno intero, tempo indeterminato:

| RAL | Netto mensile |
|---|---|
| 15.000 € | 1.025,30 € |
| 30.000 € | 1.717,47 € |
| 50.000 € | 2.505,49 € |

## Parametri fiscali

Sono tutti nel blocco `Tax parameters` di `src/data/const.js`: un cambio nella
legge di bilancio si riflette modificando un solo file.

| Costante | Valore | Significato |
|---|---|---|
| `INPS_RATE` | `0.0919` | Contributi previdenziali a carico del lavoratore |
| `IRPEF_BRACKETS` | 23% / 33% / 43% | Scaglioni progressivi a 28.000 € e 50.000 € |
| `DEDUCTION_FIRST` | `1955` | Detrazione fissa fino a 15.000 € |
| `DEDUCTION_BASE` / `DEDUCTION_EXTRA` | `1910` / `1190` | Termini delle due fasce superiori |
| `DEDUCTION_MIN` | `690` / `1380` | Minimo della detrazione per tipo di contratto |
| `BONUS_MAX` | `1200` | Trattamento integrativo massimo |
| `BONUS_THRESHOLD` | `DEDUCTION_FIRST - 75` | IRPEF lorda richiesta perché spetti |
| `DAYS_IN_YEAR` | `365` | Denominatore della quota giornaliera |
| `ALIQUOTE` | 20 aliquote | Addizionale regionale, allineata per indice a `REGIONS` |

## Assunzioni e limiti

Questa è una stima, non una busta paga. In particolare:

- **I contributi sono fissati al 9,19%**, l'aliquota ordinaria per un lavoratore
  dipendente. Non copre apprendisti, dirigenti o altre gestioni contributive.
- **L'addizionale comunale non è modellata**, solo quella regionale, e
  l'aliquota regionale è trattata come unica anche dove la regione applica
  scaglioni.
- **È modellata solo la detrazione da lavoro dipendente.** Le detrazioni per
  familiari a carico, interessi sul mutuo e simili sono ignorate, il che rende
  anche il trattamento integrativo più raro di quanto sia nella realtà: tra
  15.000 € e 28.000 € di reddito spetta solo quando il totale delle detrazioni
  supera l'imposta.
- **Il trattamento integrativo è diverso da zero solo per una RAL compresa tra
  circa 9.002 € e 16.518 €** (a 365 giorni). Fuori da quell'intervallo
  l'interruttore correttamente non cambia nulla.
- **La RAL è trattata come il reddito effettivamente percepito nell'anno**, non
  come una retribuzione contrattuale annua da riscalare sui giorni lavorati. Chi
  ha lavorato solo parte dell'anno deve inserire quanto ha davvero guadagnato.
- **I parametri seguono la riforma IRPEF a tre scaglioni in vigore dal 2024** e
  vanno verificati rispetto all'anno d'imposta che si vuole rappresentare. Le
  ulteriori misure introdotte dalla legge di bilancio 2025 sotto i 40.000 € di
  reddito non sono implementate.
- **Gli arrotondamenti non seguono alcuna regola ufficiale**: gli importi sono
  calcolati a precisione piena e arrotondati solo al momento di mostrarli.

## Tema

L'applicazione segue la preferenza del sistema operativo finché non si usa
l'interruttore accanto all'intestazione; quella scelta viene applicata su
`<html data-theme>`, salvata in `localStorage` e riapplicata da uno script
inline in `index.html` prima del primo paint, così chi usa il tema scuro non
vede un lampo bianco a ogni caricamento.

## Fonti

- [Detrazioni da lavoro dipendente](https://it.indeed.com/guida-alla-carriera/retribuzione-stipendio/come-calcolare-detrazioni-lavoro-dipendente)
- [Aliquote e calcolo dell'IRPEF — Agenzia delle Entrate](https://www.agenziaentrate.gov.it/portale/imposta-sul-reddito-delle-persone-fisiche-irpef-/aliquote-e-calcolo-dell-irpef)
- [Tabella addizionali regionali — Agenzia delle Entrate](https://www.agenziaentrate.gov.it/portale/documents/20143/3111282/Tabella+addizionali+regionali_PF.pdf/6bc7b6f3-a08d-fe92-9104-10550243c01c)
- [Calcolo dello stipendio netto dalla RAL](https://contachiaro.it/guide/calcolo-stipendio-netto-da-ral)
- [Trattamento integrativo ("bonus Renzi")](https://www.enacinforma.it/bonus-100-euro-luglio-2026/)

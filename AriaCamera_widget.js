// ═══════════════════════════════════════════════
//  WIDGET "ARIA CAMERA" per Scriptable
//  Mostra temperatura + stato del condizionatore camera
//  Tap → apre la pagina Aria Camera
// ═══════════════════════════════════════════════

const WORKER = "https://ha-worker.f-castiglioni.workers.dev"
const ENTITY = "climate.camera_da_letto_condizionatore_camera"
const CONSUMO = "sensor.camera_da_letto_condizionatore_camera_consumo_energetico_giornaliero"
const APP_URL = "https://fly98.github.io/HomeAssistant/clima.html"

// Etichette modalità
const MODE_LABELS = {
  off: "Spento", cool: "Freddo", heat: "Caldo",
  dry: "Deumidifica", fan_only: "Ventola", auto: "Auto / AI"
}
// Colori per modalità (sfondo gradiente)
const MODE_COLORS = {
  off:      ["#9aa5ad", "#6b7a85"],
  cool:     ["#5eb8e8", "#2176ab"],
  dry:      ["#4bb2c9", "#2a8fa5"],
  fan_only: ["#7aa8c4", "#5a86a0"],
  auto:     ["#5aa9b8", "#3a8494"],
  heat:     ["#e8925f", "#cf6b3a"]
}
const MODE_ICON = {
  off: "power", cool: "snowflake", heat: "flame.fill",
  dry: "humidity.fill", fan_only: "fanblades.fill", auto: "sparkles"
}

async function getData() {
  try {
    const req = new Request(WORKER + "/states")
    req.timeoutInterval = 8
    const all = await req.loadJSON()
    let climate = null, consumo = null
    for (const e of all) {
      if (e.entity_id === ENTITY) climate = e
      if (e.entity_id === CONSUMO) consumo = e
    }
    return { climate, consumo }
  } catch (e) {
    return null
  }
}

function createWidget(data) {
  const w = new ListWidget()
  w.url = APP_URL   // tap sul widget → apre la pagina

  let mode = "off", target = "--", current = "--", cons = "--"
  if (data && data.climate) {
    mode = data.climate.state
    target = data.climate.attributes.temperature ?? "--"
    current = data.climate.attributes.current_temperature ?? "--"
  }
  if (data && data.consumo) cons = parseFloat(data.consumo.state).toFixed(1)

  // Sfondo gradiente in base alla modalità
  const cols = MODE_COLORS[mode] || MODE_COLORS.cool
  const grad = new LinearGradient()
  grad.colors = [new Color(cols[0]), new Color(cols[1])]
  grad.locations = [0, 1]
  grad.startPoint = new Point(0, 0)
  grad.endPoint = new Point(1, 1)
  w.backgroundGradient = grad
  w.setPadding(16, 16, 16, 16)

  // Riga alto: titolo + icona modalità
  const top = w.addStack()
  top.centerAlignContent()
  const title = top.addText("Aria Camera")
  title.font = Font.semiboldSystemFont(13)
  title.textColor = Color.white()
  title.textOpacity = 0.9
  top.addSpacer()
  const sym = SFSymbol.named(MODE_ICON[mode] || "snowflake")
  if (sym) {
    const img = top.addImage(sym.image)
    img.imageSize = new Size(18, 18)
    img.tintColor = Color.white()
  }

  w.addSpacer(6)

  // TEMPERATURA AMBIENTE grande
  const tempStack = w.addStack()
  tempStack.bottomAlignContent()
  const tTemp = tempStack.addText(`${current}`)
  tTemp.font = Font.boldSystemFont(46)
  tTemp.textColor = Color.white()
  const tDeg = tempStack.addText("°C")
  tDeg.font = Font.mediumSystemFont(18)
  tDeg.textColor = Color.white()
  tDeg.textOpacity = 0.8

  const amb = w.addText("temperatura ambiente")
  amb.font = Font.systemFont(10)
  amb.textColor = Color.white()
  amb.textOpacity = 0.75

  w.addSpacer()

  // RIGA BASSO: stato + target + consumo
  const bottom = w.addStack()
  bottom.centerAlignContent()

  // stato/modalità
  const modeLabel = bottom.addText(MODE_LABELS[mode] || mode)
  modeLabel.font = Font.semiboldSystemFont(13)
  modeLabel.textColor = Color.white()

  bottom.addSpacer()

  // target (se non spento)
  if (mode !== "off") {
    const tgt = bottom.addText(`◎ ${target}°`)
    tgt.font = Font.mediumSystemFont(13)
    tgt.textColor = Color.white()
    tgt.textOpacity = 0.9
  } else {
    const tgt = bottom.addText(`${cons} kWh`)
    tgt.font = Font.mediumSystemFont(12)
    tgt.textColor = Color.white()
    tgt.textOpacity = 0.85
  }

  return w
}

// ── MAIN ──
const data = await getData()
const widget = createWidget(data)

if (config.runsInWidget) {
  Script.setWidget(widget)
} else {
  // anteprima quando lo apri dentro Scriptable
  widget.presentSmall()
}
Script.complete()

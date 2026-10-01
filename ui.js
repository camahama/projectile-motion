const elements = {
  metaTopic: document.getElementById("meta-topic"),
  pageTitle: document.getElementById("page-title"),
  pageSubtitle: document.getElementById("page-subtitle"),
  pageIntro: document.getElementById("page-intro"),
  pageInstructions: document.getElementById("page-instructions"),
  statusBanner: document.getElementById("status-banner"),
  controlsTitle: document.getElementById("controls-title"),
  speedLabel: document.getElementById("speed-label"),
  speedInput: document.getElementById("speed-input"),
  speedValue: document.getElementById("speed-value"),
  speedHelp: document.getElementById("speed-help"),
  angleLabel: document.getElementById("angle-label"),
  angleInput: document.getElementById("angle-input"),
  angleValue: document.getElementById("angle-value"),
  angleHelp: document.getElementById("angle-help"),
  startButton: document.getElementById("start-button"),
  pauseButton: document.getElementById("pause-button"),
  resetButton: document.getElementById("reset-button"),
  graphTitle: document.getElementById("graph-title"),
  resultsTitle: document.getElementById("results-title"),
  elapsedTimeLabel: document.getElementById("elapsed-time-label"),
  elapsedTimeValue: document.getElementById("elapsed-time-value"),
  elapsedTimeDescription: document.getElementById("elapsed-time-description"),
  positionXLabel: document.getElementById("position-x-label"),
  positionXValue: document.getElementById("position-x-value"),
  positionXDescription: document.getElementById("position-x-description"),
  positionYLabel: document.getElementById("position-y-label"),
  positionYValue: document.getElementById("position-y-value"),
  positionYDescription: document.getElementById("position-y-description"),
  rangeLabel: document.getElementById("range-label"),
  rangeValue: document.getElementById("range-value"),
  rangeDescription: document.getElementById("range-description"),
  assumptionsTitle: document.getElementById("assumptions-title"),
  assumptionsList: document.getElementById("assumptions-list"),
  formulaTitle: document.getElementById("formula-title"),
  formulaBody: document.getElementById("formula-body"),
  teachingTitle: document.getElementById("teaching-title"),
  teachingList: document.getElementById("teaching-list"),
  canvas: document.getElementById("trajectory-canvas"),
};

const canvasContext = elements.canvas.getContext("2d");

const SHOT_COLORS = [
  "#d96a2b",
  "#2c7a7b",
  "#8a4fff",
  "#bc4749",
  "#4361ee",
  "#6a994e",
  "#f4a261",
  "#c77dff",
];

const state = {
  content: null,
  summary: null,
  axisBounds: null,
  currentTime: 0,
  animationFrameId: null,
  lastFrameTime: null,
  isRunning: false,
  activeStatus: "ready",
  trajectoryHistory: [],
  currentShot: null,
  nextShotColorIndex: 0,
};

function formatNumber(value, decimals) {
  return new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

function setTextContent(element, text) {
  element.textContent = text;
}

function setStatus(statusKey) {
  state.activeStatus = statusKey;
  setTextContent(elements.statusBanner, state.content.status[statusKey]);
}

function getControlValue(controlName) {
  return Number.parseFloat(elements[`${controlName}Input`].value);
}

function getSimulationInput() {
  return {
    speed: getControlValue("speed"),
    angle: getControlValue("angle"),
  };
}

function updateControlDisplays() {
  const { controls } = state.content;
  setTextContent(elements.speedValue, `${formatNumber(getControlValue("speed"), 1)} ${controls.speed.unit}`);
  setTextContent(elements.angleValue, `${formatNumber(getControlValue("angle"), 0)} ${controls.angle.unit}`);
}

function refreshSummary() {
  const { speed, angle } = getSimulationInput();
  state.summary = window.ProjectilePhysics.getProjectileSummary(speed, angle);
}

function calculateAxisBounds() {
  const { speed, angle } = state.content.controls;
  const maxSpeed = Number(speed.max);
  const minAngle = Number(angle.min);
  const maxAngle = Number(angle.max);
  const angleStep = Math.max(Number(angle.step) || 1, 1);

  let maxRange = 1;
  let maxHeight = 1;

  for (let currentAngle = minAngle; currentAngle <= maxAngle; currentAngle += angleStep) {
    maxRange = Math.max(maxRange, window.ProjectilePhysics.getRange(maxSpeed, currentAngle));
    maxHeight = Math.max(maxHeight, window.ProjectilePhysics.getMaxHeight(maxSpeed, currentAngle));
  }

  return {
    maxX: maxRange * 1.08,
    maxY: maxHeight * 1.12,
  };
}

function getNextShotColor() {
  const color = SHOT_COLORS[state.nextShotColorIndex % SHOT_COLORS.length];
  state.nextShotColorIndex += 1;
  return color;
}

function createShotRecord() {
  return {
    summary: { ...state.summary },
    color: getNextShotColor(),
  };
}

function updateResults() {
  const { results } = state.content;
  const position = window.ProjectilePhysics.getPositionAtTime(
    state.summary.speed,
    state.summary.angleDegrees,
    state.currentTime
  );
  const safeHeight = Math.max(0, position.y);

  setTextContent(elements.elapsedTimeValue, `${formatNumber(state.currentTime, 2)} ${results.elapsedTime.unit}`);
  setTextContent(elements.positionXValue, `${formatNumber(position.x, 2)} ${results.positionX.unit}`);
  setTextContent(elements.positionYValue, `${formatNumber(safeHeight, 2)} ${results.positionY.unit}`);
  setTextContent(elements.rangeValue, `${formatNumber(state.summary.range, 2)} ${results.range.unit}`);
}

function stopAnimation() {
  if (state.animationFrameId !== null) {
    cancelAnimationFrame(state.animationFrameId);
    state.animationFrameId = null;
  }

  state.lastFrameTime = null;
  state.isRunning = false;
}

function resetSimulation(statusKey = "ready") {
  stopAnimation();
  state.currentTime = 0;
  state.currentShot = null;
  refreshSummary();
  updateResults();
  drawScene();
  setStatus(statusKey);
  syncButtons();
}

function handleParameterChange() {
  updateControlDisplays();
  resetSimulation("changed");
}

function syncButtons() {
  elements.startButton.disabled = state.isRunning;
  elements.pauseButton.disabled = !state.isRunning;
  elements.resetButton.disabled = false;
}

function tick(frameTimestamp) {
  if (!state.isRunning) {
    return;
  }

  if (state.lastFrameTime === null) {
    state.lastFrameTime = frameTimestamp;
  }

  const deltaSeconds = (frameTimestamp - state.lastFrameTime) / 1000;
  state.lastFrameTime = frameTimestamp;
  state.currentTime = Math.min(state.currentTime + deltaSeconds, state.summary.flightTime);

  updateResults();
  drawScene();

  if (state.currentTime >= state.summary.flightTime) {
    stopAnimation();
    setStatus("finished");
    syncButtons();
    return;
  }

  state.animationFrameId = requestAnimationFrame(tick);
}

function startSimulation() {
  if (state.isRunning) {
    return;
  }

  if (state.currentTime >= state.summary.flightTime) {
    state.currentTime = 0;
    state.currentShot = null;
  }

  if (state.currentShot === null) {
    state.currentShot = createShotRecord();
    state.trajectoryHistory.push(state.currentShot);
  }

  state.isRunning = true;
  state.lastFrameTime = null;
  setStatus("running");
  syncButtons();
  drawScene();
  state.animationFrameId = requestAnimationFrame(tick);
}

function pauseSimulation() {
  if (!state.isRunning) {
    return;
  }

  stopAnimation();
  setStatus("paused");
  syncButtons();
}

function resizeCanvasToDisplaySize() {
  const { canvas } = elements;
  const displayWidth = Math.round(canvas.clientWidth * window.devicePixelRatio);
  const displayHeight = Math.round(canvas.clientHeight * window.devicePixelRatio);

  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
}

function getDrawingMetrics() {
  const width = elements.canvas.width;
  const height = elements.canvas.height;
  const padding = {
    top: 28 * window.devicePixelRatio,
    right: 26 * window.devicePixelRatio,
    bottom: 54 * window.devicePixelRatio,
    left: 64 * window.devicePixelRatio,
  };
  const drawableWidth = width - padding.left - padding.right;
  const drawableHeight = height - padding.top - padding.bottom;

  return {
    width,
    height,
    padding,
    drawableWidth,
    drawableHeight,
    maxX: state.axisBounds.maxX,
    maxY: state.axisBounds.maxY,
    groundY: height - padding.bottom,
  };
}

function toCanvasPoint(xMeters, yMeters, metrics) {
  return {
    x: metrics.padding.left + (xMeters / metrics.maxX) * metrics.drawableWidth,
    y: metrics.groundY - (yMeters / metrics.maxY) * metrics.drawableHeight,
  };
}

function drawAxes(metrics) {
  const { graph } = state.content;
  canvasContext.save();
  canvasContext.strokeStyle = "#375b63";
  canvasContext.lineWidth = 2 * window.devicePixelRatio;
  canvasContext.beginPath();
  canvasContext.moveTo(metrics.padding.left, metrics.padding.top);
  canvasContext.lineTo(metrics.padding.left, metrics.groundY);
  canvasContext.lineTo(metrics.width - metrics.padding.right, metrics.groundY);
  canvasContext.stroke();

  canvasContext.strokeStyle = "#7f8b4b";
  canvasContext.lineWidth = 4 * window.devicePixelRatio;
  canvasContext.beginPath();
  canvasContext.moveTo(metrics.padding.left, metrics.groundY);
  canvasContext.lineTo(metrics.width - metrics.padding.right, metrics.groundY);
  canvasContext.stroke();

  canvasContext.fillStyle = "#1f2f2b";
  canvasContext.font = `${16 * window.devicePixelRatio}px Georgia`;
  canvasContext.textAlign = "center";
  canvasContext.fillText(graph.xAxis, metrics.padding.left + metrics.drawableWidth / 2, metrics.height - 16 * window.devicePixelRatio);

  canvasContext.save();
  canvasContext.translate(18 * window.devicePixelRatio, metrics.padding.top + metrics.drawableHeight / 2);
  canvasContext.rotate(-Math.PI / 2);
  canvasContext.fillText(graph.yAxis, 0, 0);
  canvasContext.restore();

  canvasContext.textAlign = "right";
  canvasContext.fillStyle = "#61703d";
  canvasContext.fillText(graph.ground, metrics.width - metrics.padding.right, metrics.groundY - 10 * window.devicePixelRatio);
  canvasContext.restore();
}

function drawTrajectoryForShot(summary, color, metrics, isActiveShot = false) {
  const samples = window.ProjectilePhysics.getTrajectorySamples(summary.speed, summary.angleDegrees, 120);

  canvasContext.save();
  canvasContext.strokeStyle = color;
  canvasContext.lineWidth = (isActiveShot ? 3.5 : 2.5) * window.devicePixelRatio;
  canvasContext.globalAlpha = isActiveShot ? 1 : 0.82;
  canvasContext.beginPath();

  samples.forEach((sample, index) => {
    const point = toCanvasPoint(sample.x, sample.y, metrics);
    if (index === 0) {
      canvasContext.moveTo(point.x, point.y);
    } else {
      canvasContext.lineTo(point.x, point.y);
    }
  });

  canvasContext.stroke();
  canvasContext.restore();
}

function drawStoredTrajectories(metrics) {
  state.trajectoryHistory.forEach((shot) => {
    drawTrajectoryForShot(shot.summary, shot.color, metrics, shot === state.currentShot);
  });
}

function drawMarkers(metrics) {
  const currentPosition = window.ProjectilePhysics.getPositionAtTime(
    state.summary.speed,
    state.summary.angleDegrees,
    state.currentTime
  );
  const projectilePoint = toCanvasPoint(currentPosition.x, Math.max(0, currentPosition.y), metrics);
  const startPoint = toCanvasPoint(0, 0, metrics);
  const landingPoint = toCanvasPoint(state.summary.range, 0, metrics);

  canvasContext.save();
  canvasContext.fillStyle = "#27454d";
  canvasContext.beginPath();
  canvasContext.arc(startPoint.x, startPoint.y, 5 * window.devicePixelRatio, 0, Math.PI * 2);
  canvasContext.fill();

  canvasContext.fillStyle = "#6d7b3f";
  canvasContext.beginPath();
  canvasContext.arc(landingPoint.x, landingPoint.y, 5 * window.devicePixelRatio, 0, Math.PI * 2);
  canvasContext.fill();

  canvasContext.fillStyle = state.currentShot ? state.currentShot.color : "#a34717";
  canvasContext.beginPath();
  canvasContext.arc(projectilePoint.x, projectilePoint.y, 8 * window.devicePixelRatio, 0, Math.PI * 2);
  canvasContext.fill();

  canvasContext.font = `${15 * window.devicePixelRatio}px Georgia`;
  canvasContext.fillStyle = "#1f2f2b";
  canvasContext.textAlign = "left";
  canvasContext.fillText(state.content.graph.launchPoint, startPoint.x + 10 * window.devicePixelRatio, startPoint.y - 10 * window.devicePixelRatio);
  canvasContext.fillText(state.content.graph.projectile, projectilePoint.x + 12 * window.devicePixelRatio, projectilePoint.y - 12 * window.devicePixelRatio);

  canvasContext.textAlign = "right";
  canvasContext.fillText(state.content.graph.landingPoint, landingPoint.x - 10 * window.devicePixelRatio, landingPoint.y - 10 * window.devicePixelRatio);
  canvasContext.restore();
}

function drawGuideValues(metrics) {
  canvasContext.save();
  canvasContext.fillStyle = "rgba(31, 47, 43, 0.8)";
  canvasContext.font = `${14 * window.devicePixelRatio}px Georgia`;
  canvasContext.textAlign = "left";
  canvasContext.fillText("0", metrics.padding.left - 10 * window.devicePixelRatio, metrics.groundY + 22 * window.devicePixelRatio);
  canvasContext.fillText(
    `${formatNumber(metrics.maxY, 1)} m`,
    metrics.padding.left + 6 * window.devicePixelRatio,
    metrics.padding.top + 16 * window.devicePixelRatio
  );
  canvasContext.textAlign = "right";
  canvasContext.fillText(
    `${formatNumber(metrics.maxX, 1)} m`,
    metrics.width - metrics.padding.right,
    metrics.groundY + 22 * window.devicePixelRatio
  );
  canvasContext.restore();
}

function drawScene() {
  resizeCanvasToDisplaySize();
  const metrics = getDrawingMetrics();
  canvasContext.clearRect(0, 0, metrics.width, metrics.height);
  drawAxes(metrics);
  drawStoredTrajectories(metrics);
  drawMarkers(metrics);
  drawGuideValues(metrics);
}

function populateTextContent(content) {
  setTextContent(elements.metaTopic, `${content.meta.audience} · ${content.meta.topic}`);
  setTextContent(elements.pageTitle, content.page.title);
  setTextContent(elements.pageSubtitle, content.page.subtitle);
  setTextContent(elements.pageIntro, content.page.intro);
  setTextContent(elements.pageInstructions, content.page.instructions);
  setTextContent(elements.controlsTitle, content.controls.title);
  setTextContent(elements.speedLabel, content.controls.speed.label);
  setTextContent(elements.speedHelp, content.controls.speed.help);
  setTextContent(elements.angleLabel, content.controls.angle.label);
  setTextContent(elements.angleHelp, content.controls.angle.help);
  setTextContent(elements.startButton, content.controls.start.label);
  setTextContent(elements.pauseButton, content.controls.pause.label);
  setTextContent(elements.resetButton, content.controls.reset.label);
  setTextContent(elements.graphTitle, content.graph.title);
  setTextContent(elements.resultsTitle, content.results.title);
  setTextContent(elements.elapsedTimeLabel, content.results.elapsedTime.label);
  setTextContent(elements.elapsedTimeDescription, content.results.elapsedTime.description);
  setTextContent(elements.positionXLabel, content.results.positionX.label);
  setTextContent(elements.positionXDescription, content.results.positionX.description);
  setTextContent(elements.positionYLabel, content.results.positionY.label);
  setTextContent(elements.positionYDescription, content.results.positionY.description);
  setTextContent(elements.rangeLabel, content.results.range.label);
  setTextContent(elements.rangeDescription, content.results.range.description);
  setTextContent(elements.assumptionsTitle, content.assumptions.title);
  setTextContent(elements.formulaTitle, content.formulaText.title);
  setTextContent(elements.teachingTitle, content.teaching.title);

  elements.assumptionsList.innerHTML = "";
  content.assumptions.items.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    elements.assumptionsList.appendChild(listItem);
  });

  elements.formulaBody.innerHTML = "";
  content.formulaText.body.forEach((paragraph) => {
    const paragraphElement = document.createElement("p");
    paragraphElement.textContent = paragraph;
    elements.formulaBody.appendChild(paragraphElement);
  });

  elements.teachingList.innerHTML = "";
  content.teaching.prompts.forEach((item) => {
    const listItem = document.createElement("li");
    listItem.textContent = item;
    elements.teachingList.appendChild(listItem);
  });
}

function configureControls(content) {
  elements.speedInput.min = String(content.controls.speed.min);
  elements.speedInput.max = String(content.controls.speed.max);
  elements.speedInput.step = String(content.controls.speed.step);
  elements.speedInput.value = String(content.controls.speed.default);

  elements.angleInput.min = String(content.controls.angle.min);
  elements.angleInput.max = String(content.controls.angle.max);
  elements.angleInput.step = String(content.controls.angle.step);
  elements.angleInput.value = String(content.controls.angle.default);
}

function registerEvents() {
  elements.speedInput.addEventListener("input", handleParameterChange);
  elements.angleInput.addEventListener("input", handleParameterChange);
  elements.startButton.addEventListener("click", startSimulation);
  elements.pauseButton.addEventListener("click", pauseSimulation);
  elements.resetButton.addEventListener("click", () => {
    configureControls(state.content);
    updateControlDisplays();
    resetSimulation("ready");
  });
  window.addEventListener("resize", drawScene);
}

async function loadContent() {
  const response = await fetch("./content.json");

  if (!response.ok) {
    throw new Error(`Kunde inte lasa content.json: ${response.status}`);
  }

  return response.json();
}

async function initialize() {
  state.content = await loadContent();
  populateTextContent(state.content);
  configureControls(state.content);
  state.axisBounds = calculateAxisBounds();
  updateControlDisplays();
  refreshSummary();
  updateResults();
  drawScene();
  registerEvents();
  setStatus("ready");
  syncButtons();
}

initialize().catch((error) => {
  document.body.innerHTML = `<main class="app-shell"><section class="hero-panel"><h1>Fel</h1><p>${error.message}</p></section></main>`;
});
(function () {
  "use strict";

  const { calculateTrajectory, positionAtTime } = window.ProjectilePhysics;
  const { defaults, chart, text } = window.ProjectileContent;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const plot = { left: 56, right: 764, top: 24, bottom: 392 };
  const historyColors = ["#ec4899", "#0891b2", "#ca8a04", "#16a34a", "#dc2626", "#7c3aed"];
  const number = new Intl.NumberFormat("sv-SE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  });

  const elements = {
    speed: document.querySelector("#speed"),
    angle: document.querySelector("#angle"),
    gravity: document.querySelector("#gravity"),
    speedValue: document.querySelector("#speed-value"),
    angleValue: document.querySelector("#angle-value"),
    gravityValue: document.querySelector("#gravity-value"),
    flightTime: document.querySelector("#flight-time"),
    range: document.querySelector("#range"),
    maxHeight: document.querySelector("#max-height"),
    path: document.querySelector("#path"),
    ball: document.querySelector("#ball"),
    velocityVector: document.querySelector("#velocity-vector"),
    vectorHead: document.querySelector("#vector-head"),
    apexLabel: document.querySelector("#apex-label"),
    rangeLine: document.querySelector("#range-line"),
    rangeLabel: document.querySelector("#range-label"),
    xTicks: document.querySelector("#x-ticks"),
    yTicks: document.querySelector("#y-ticks"),
    previousPaths: document.querySelector("#previous-paths"),
    axisDialog: document.querySelector("#axis-dialog"),
    axisForm: document.querySelector("#axis-form"),
    axisDialogLabel: document.querySelector("#axis-dialog-label"),
    axisMaximum: document.querySelector("#axis-maximum"),
    axisError: document.querySelector("#axis-error"),
    axisCancel: document.querySelector("#axis-cancel"),
    play: document.querySelector("#play-button"),
    playLabel: document.querySelector("#play-button [data-text='play']"),
    playIcon: document.querySelector(".play-icon"),
    reset: document.querySelector("#reset-button"),
    time: document.querySelector("#time-output")
  };

  let trajectory;
  let scale;
  let animationFrame = null;
  let animationStart = 0;
  let currentTime = 0;
  let state = "idle";
  let interactionStarted = false;
  const previousTrajectories = [];
  let editingAxis = null;

  function applyText() {
    document.querySelectorAll("[data-text]").forEach((element) => {
      const key = element.dataset.text;
      element.textContent = text[key] || "";
    });

    const assumptions = document.querySelector("#assumptions-list");
    assumptions.replaceChildren(...text.assumptions.map(createListItem));
    const challenges = document.querySelector("#challenge-list");
    challenges.replaceChildren(...text.challenges.map(createListItem));
    const equations = document.querySelector("[data-equations]");
    equations.replaceChildren(...text.equations.map((equation) => {
      const wrapper = document.createElement("div");
      wrapper.className = "equation";
      const math = document.createElementNS("http://www.w3.org/1998/Math/MathML", "math");
      math.setAttribute("display", "block");
      math.setAttribute("aria-label", equation.description);
      math.innerHTML = equation.math;
      wrapper.append(math);
      return wrapper;
    }));
  }

  function createListItem(value) {
    const item = document.createElement("li");
    item.textContent = value;
    return item;
  }

  function updateScale() {
    scale = {
      maxX: chart.maxX,
      maxY: chart.maxY,
      x: (plot.right - plot.left) / chart.maxX,
      y: (plot.bottom - plot.top) / chart.maxY
    };
  }

  function configureAxisEndpoint(label, axis) {
    if (!label) {
      return;
    }
    label.classList.add("axis-end");
    label.setAttribute("role", "button");
    label.setAttribute("tabindex", "0");
    label.setAttribute("aria-label", `${axis === "x" ? text.xAxisMaximum : text.yAxisMaximum}: ${number.format(scale[`max${axis.toUpperCase()}`])} m. ${text.axisEditHint}.`);
    label.addEventListener("dblclick", () => openAxisDialog(axis));
    label.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        openAxisDialog(axis);
      }
    });
  }

  function toScreen(position) {
    return {
      x: plot.left + position.x * scale.x,
      y: plot.bottom - position.y * scale.y
    };
  }

  function createTicks(group, axis, max) {
    const fragment = document.createDocumentFragment();
    const count = 4;

    for (let index = 0; index <= count; index += 1) {
      const fraction = index / count;
      const line = document.createElementNS(SVG_NS, "line");
      const label = document.createElementNS(SVG_NS, "text");
      label.classList.add("tick-label");

      if (axis === "x") {
        const x = plot.left + fraction * (plot.right - plot.left);
        line.setAttribute("x1", x);
        line.setAttribute("x2", x);
        line.setAttribute("y1", plot.bottom);
        line.setAttribute("y2", plot.bottom + 6);
        label.setAttribute("x", x);
        label.setAttribute("y", plot.bottom + 22);
        label.setAttribute("text-anchor", "middle");
      } else {
        const y = plot.bottom - fraction * (plot.bottom - plot.top);
        line.setAttribute("x1", plot.left - 6);
        line.setAttribute("x2", plot.left);
        line.setAttribute("y1", y);
        line.setAttribute("y2", y);
        label.setAttribute("x", plot.left - 12);
        label.setAttribute("y", y + 4);
        label.setAttribute("text-anchor", "end");
      }

      line.classList.add("tick");
      label.textContent = number.format(max * fraction);
      if (index === count) {
        configureAxisEndpoint(label, axis);
      }
      fragment.append(line, label);
    }

    group.replaceChildren(fragment);
  }

  function trajectoryPath(item) {
    const points = [];
    const samples = 100;

    for (let index = 0; index <= samples; index += 1) {
      const time = item.flightTime * index / samples;
      const point = toScreen(positionAtTime(item, time));
      points.push(`${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`);
    }

    return points.join(" ");
  }

  function drawPreviousTrajectories() {
    elements.previousPaths.replaceChildren(...previousTrajectories.map((item, index) => {
      const path = document.createElementNS(SVG_NS, "path");
      path.classList.add("previous-path");
      path.setAttribute("d", trajectoryPath(item));
      path.setAttribute("stroke", historyColors[index % historyColors.length]);
      path.setAttribute("aria-label", `Tidigare kast ${index + 1}`);
      return path;
    }));
  }

  function rememberCurrentTrajectory() {
    previousTrajectories.push(trajectory);
    drawPreviousTrajectories();
  }

  function drawTrajectory() {
    elements.path.setAttribute("d", trajectoryPath(trajectory));
    const apex = toScreen({ x: trajectory.range / 2, y: trajectory.maxHeight });
    elements.apexLabel.setAttribute("x", apex.x);
    elements.apexLabel.setAttribute("y", Math.max(apex.y - 13, 18));
    elements.apexLabel.textContent = `H = ${number.format(trajectory.maxHeight)} m`;

    const landing = toScreen({ x: trajectory.range, y: 0 });
    elements.rangeLine.setAttribute("x2", landing.x);
    elements.rangeLabel.setAttribute("x", (plot.left + landing.x) / 2);
    elements.rangeLabel.setAttribute("y", plot.bottom - 10);
    elements.rangeLabel.textContent = `R = ${number.format(trajectory.range)} m`;
    createTicks(elements.xTicks, "x", scale.maxX);
    createTicks(elements.yTicks, "y", scale.maxY);
    drawPreviousTrajectories();
  }

  function updateBall(time) {
    const position = positionAtTime(trajectory, time);
    const point = toScreen(position);
    elements.ball.setAttribute("cx", point.x);
    elements.ball.setAttribute("cy", point.y);

    const vectorLength = Math.min(58, Math.hypot(position.velocityX * scale.x, position.velocityY * scale.y) * 0.22);
    const speed = Math.hypot(position.velocityX, position.velocityY);
    const dx = speed ? position.velocityX / speed * vectorLength : 0;
    const dy = speed ? -position.velocityY / speed * vectorLength : 0;
    const endX = point.x + dx;
    const endY = point.y + dy;
    elements.velocityVector.setAttribute("x1", point.x);
    elements.velocityVector.setAttribute("y1", point.y);
    elements.velocityVector.setAttribute("x2", endX);
    elements.velocityVector.setAttribute("y2", endY);

    const perpendicularX = -dy;
    const perpendicularY = dx;
    const vectorMagnitude = Math.hypot(dx, dy) || 1;
    const headSize = 6;
    const backX = endX - dx / vectorMagnitude * headSize;
    const backY = endY - dy / vectorMagnitude * headSize;
    const points = [
      `${endX},${endY}`,
      `${backX + perpendicularX / vectorMagnitude * headSize * 0.65},${backY + perpendicularY / vectorMagnitude * headSize * 0.65}`,
      `${backX - perpendicularX / vectorMagnitude * headSize * 0.65},${backY - perpendicularY / vectorMagnitude * headSize * 0.65}`
    ];
    elements.vectorHead.setAttribute("points", points.join(" "));
    elements.time.textContent = `t = ${time.toFixed(2).replace(".", ",")} s`;
  }

  function setPlayState(nextState) {
    state = nextState;
    const labels = {
      idle: text.play,
      playing: text.pause,
      paused: text.resume,
      finished: text.replay
    };
    elements.playLabel.textContent = labels[state];
    elements.playIcon.textContent = state === "playing" ? "Ⅱ" : "▶";
    elements.play.classList.toggle("replay-button", state === "finished");
  }

  function stopAnimation() {
    if (animationFrame !== null) {
      cancelAnimationFrame(animationFrame);
      animationFrame = null;
    }
  }

  function animate(timestamp) {
    if (!animationStart) {
      animationStart = timestamp - currentTime * 1000;
    }
    currentTime = Math.min((timestamp - animationStart) / 1000, trajectory.flightTime);
    updateBall(currentTime);

    if (currentTime < trajectory.flightTime) {
      animationFrame = requestAnimationFrame(animate);
    } else {
      animationFrame = null;
      animationStart = 0;
      setPlayState("finished");
    }
  }

  function resetAnimation() {
    stopAnimation();
    animationStart = 0;
    currentTime = 0;
    setPlayState("idle");
    updateBall(0);
  }

  function openAxisDialog(axis) {
    editingAxis = axis;
    elements.axisDialogLabel.textContent = axis === "x" ? text.xAxisMaximum : text.yAxisMaximum;
    elements.axisMaximum.value = chart[axis === "x" ? "maxX" : "maxY"];
    elements.axisError.textContent = "";
    elements.axisDialog.showModal();
    elements.axisMaximum.select();
  }

  function saveAxisMaximum(event) {
    event.preventDefault();
    const value = Number(elements.axisMaximum.value);
    if (!Number.isFinite(value) || value <= 0) {
      elements.axisError.textContent = text.axisPositiveError;
      elements.axisMaximum.focus();
      return;
    }

    chart[editingAxis === "x" ? "maxX" : "maxY"] = value;
    updateScale();
    drawTrajectory();
    updateBall(currentTime);
    elements.axisDialog.close();
  }

  function recalculate({ reset = true } = {}) {
    trajectory = calculateTrajectory(
      Number(elements.speed.value),
      Number(elements.angle.value),
      Number(elements.gravity.value)
    );
    updateScale();
    elements.speedValue.textContent = `${elements.speed.value} m/s`;
    elements.angleValue.textContent = `${elements.angle.value}°`;
    elements.gravityValue.textContent = `${number.format(trajectory.gravity)} m/s²`;
    elements.flightTime.textContent = number.format(trajectory.flightTime);
    elements.range.textContent = number.format(trajectory.range);
    elements.maxHeight.textContent = number.format(trajectory.maxHeight);
    drawTrajectory();
    if (reset) {
      resetAnimation();
    } else {
      currentTime = Math.min(currentTime, trajectory.flightTime);
      updateBall(currentTime);
    }
  }

  elements.speed.value = defaults.speed;
  elements.angle.value = defaults.angle;
  elements.gravity.value = defaults.gravity;
  applyText();
  recalculate();

  [elements.speed, elements.angle, elements.gravity].forEach((control) => {
    control.addEventListener("input", () => {
      if (!interactionStarted) {
        rememberCurrentTrajectory();
        interactionStarted = true;
      }
      recalculate();
    });
    control.addEventListener("change", () => {
      interactionStarted = false;
    });
  });

  elements.play.addEventListener("click", () => {
    if (state === "playing") {
      stopAnimation();
      setPlayState("paused");
      return;
    }

    if (state === "finished") {
      currentTime = 0;
    }
    animationStart = 0;
    setPlayState("playing");
    animationFrame = requestAnimationFrame(animate);
  });

  elements.reset.addEventListener("click", resetAnimation);
  elements.axisCancel.addEventListener("click", () => elements.axisDialog.close());
  elements.axisForm.addEventListener("submit", saveAxisMaximum);
})();

/*
 * Ideal kastrorelse i två dimensioner, utan luftmotstand.
 *
 * Antaganden:
 * - SI-enheter används genomgående.
 * - g är konstant och lika med 9.81 m/s^2.
 * - Start- och landningshojd är samma.
 * - Ingen energi forloras till luftmotstand eller rotation.
 *
 * Filen exponerar funktionerna via window.ProjectilePhysics sa att de kan
 * användas direkt i en vanlig webbsida utan byggsteg eller ramverk.
 */

(function attachProjectilePhysics(globalObject) {
  const GRAVITY = 9.81;

  /**
   * Konverterar grader till radianer.
   * @param {number} angleDegrees Vinkel i grader.
   * @returns {number} Vinkel i radianer.
   */
  function degreesToRadians(angleDegrees) {
    return (angleDegrees * Math.PI) / 180;
  }

  /**
   * Säkerställer att indata är fysikaliskt rimliga för modellen.
   * @param {number} speed Initialhastighet i meter per sekund, m/s.
   * @param {number} angleDegrees Utskjutningsvinkel i grader.
   */
  function validateLaunch(speed, angleDegrees) {
    if (!Number.isFinite(speed) || speed < 0) {
      throw new Error("Starthastigheten maste vara ett andligt tal i m/s och minst 0.");
    }

    if (!Number.isFinite(angleDegrees) || angleDegrees < 0 || angleDegrees > 90) {
      throw new Error("Vinkeln maste vara ett andligt tal mellan 0 och 90 grader.");
    }
  }

  /**
   * Delar upp initialhastigheten i horisontell och vertikal komponent.
   * @param {number} speed Initialhastighet i m/s.
   * @param {number} angleDegrees Vinkel i grader.
   * @returns {{ vx: number, vy: number }} Hastighetskomponenter i m/s.
   */
  function getVelocityComponents(speed, angleDegrees) {
    validateLaunch(speed, angleDegrees);

    const angleRadians = degreesToRadians(angleDegrees);

    return {
      vx: speed * Math.cos(angleRadians),
      vy: speed * Math.sin(angleRadians),
    };
  }

  /**
   * Beraknar total flygtid tills projektilen ater ar pa markniva.
   * Formel: t = 2 * vy / g
   * @param {number} speed Initialhastighet i m/s.
   * @param {number} angleDegrees Vinkel i grader.
   * @returns {number} Flygtid i sekunder, s.
   */
  function getFlightTime(speed, angleDegrees) {
    const { vy } = getVelocityComponents(speed, angleDegrees);
    return (2 * vy) / GRAVITY;
  }

  /**
   * Beraknar projektilens maximala hojd relativt startpunkten.
   * Formel: h = vy^2 / (2g)
   * @param {number} speed Initialhastighet i m/s.
   * @param {number} angleDegrees Vinkel i grader.
   * @returns {number} Maxhojd i meter, m.
   */
  function getMaxHeight(speed, angleDegrees) {
    const { vy } = getVelocityComponents(speed, angleDegrees);
    return (vy * vy) / (2 * GRAVITY);
  }

  /**
   * Beraknar den horisontella rackvidden.
   * Formel: R = vx * flygtid
   * @param {number} speed Initialhastighet i m/s.
   * @param {number} angleDegrees Vinkel i grader.
   * @returns {number} Rackvidd i meter, m.
   */
  function getRange(speed, angleDegrees) {
    const { vx } = getVelocityComponents(speed, angleDegrees);
    return vx * getFlightTime(speed, angleDegrees);
  }

  /**
   * Beraknar projektilens position vid en given tidpunkt.
   *
   * x(t) = vx * t
   * y(t) = vy * t - 0.5 * g * t^2
   *
   * @param {number} speed Initialhastighet i m/s.
   * @param {number} angleDegrees Vinkel i grader.
   * @param {number} time Tid efter start i sekunder, s.
   * @returns {{ x: number, y: number }} Position i meter.
   */
  function getPositionAtTime(speed, angleDegrees, time) {
    validateLaunch(speed, angleDegrees);

    if (!Number.isFinite(time) || time < 0) {
      throw new Error("Tiden maste vara ett andligt tal i sekunder och minst 0.");
    }

    const { vx, vy } = getVelocityComponents(speed, angleDegrees);

    return {
      x: vx * time,
      y: vy * time - 0.5 * GRAVITY * time * time,
    };
  }

  /**
   * Skapar provpunkter langs hela banan, inklusive start och landning.
   * @param {number} speed Initialhastighet i m/s.
   * @param {number} angleDegrees Vinkel i grader.
   * @param {number} sampleCount Antal delintervall. Minst 1.
   * @returns {Array<{ time: number, x: number, y: number }>} Banan som lista av punkter.
   */
  function getTrajectorySamples(speed, angleDegrees, sampleCount) {
    validateLaunch(speed, angleDegrees);

    const steps = Number.isFinite(sampleCount) && sampleCount > 0 ? Math.floor(sampleCount) : 100;
    const flightTime = getFlightTime(speed, angleDegrees);
    const samples = [];

    for (let index = 0; index <= steps; index += 1) {
      const time = (flightTime * index) / steps;
      const position = getPositionAtTime(speed, angleDegrees, time);

      samples.push({
        time,
        x: position.x,
        y: Math.max(0, position.y),
      });
    }

    return samples;
  }

  /**
   * Samlar de viktigaste resultaten for undervisning och UI.
   * @param {number} speed Initialhastighet i m/s.
   * @param {number} angleDegrees Vinkel i grader.
   * @returns {{
   *   speed: number,
   *   angleDegrees: number,
   *   gravity: number,
   *   vx: number,
   *   vy: number,
   *   flightTime: number,
   *   maxHeight: number,
   *   range: number
   * }}
   */
  function getProjectileSummary(speed, angleDegrees) {
    const { vx, vy } = getVelocityComponents(speed, angleDegrees);

    return {
      speed,
      angleDegrees,
      gravity: GRAVITY,
      vx,
      vy,
      flightTime: getFlightTime(speed, angleDegrees),
      maxHeight: getMaxHeight(speed, angleDegrees),
      range: getRange(speed, angleDegrees),
    };
  }

  globalObject.ProjectilePhysics = {
    GRAVITY,
    degreesToRadians,
    getVelocityComponents,
    getFlightTime,
    getMaxHeight,
    getRange,
    getPositionAtTime,
    getTrajectorySamples,
    getProjectileSummary,
  };
})(window);
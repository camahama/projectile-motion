(function (global) {
  "use strict";

  const toRadians = (degrees) => degrees * Math.PI / 180;

  function calculateTrajectory(speed, angleDegrees, gravity) {
    if (speed <= 0 || gravity <= 0) {
      throw new RangeError("Hastighet och tyngdacceleration måste vara större än noll.");
    }

    const angle = toRadians(angleDegrees);
    const velocityX = speed * Math.cos(angle);
    const velocityY = speed * Math.sin(angle);
    const flightTime = 2 * velocityY / gravity;

    return {
      speed,
      angleDegrees,
      gravity,
      velocityX,
      velocityY,
      flightTime,
      range: velocityX * flightTime,
      maxHeight: velocityY ** 2 / (2 * gravity)
    };
  }

  function positionAtTime(trajectory, time) {
    const clampedTime = Math.max(0, Math.min(time, trajectory.flightTime));
    return {
      x: trajectory.velocityX * clampedTime,
      y: trajectory.velocityY * clampedTime - 0.5 * trajectory.gravity * clampedTime ** 2,
      velocityX: trajectory.velocityX,
      velocityY: trajectory.velocityY - trajectory.gravity * clampedTime
    };
  }

  global.ProjectilePhysics = {
    calculateTrajectory,
    positionAtTime
  };
})(window);

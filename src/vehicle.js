class Vehicle {
  static maxForce = 0.25;
  static maxRotation = 0.05;
  static maxBrake = 0.05;
  static friction = 0.015;
  static range = 300;
  static fov = 180;
  static numSensors = 7;
  static mutationRate = 0.512;

  constructor(neuralNetwork) {
    this.setInitialPosition();
    this.setInitialRays();
    this.rayColor = color(200);
    this.bodyColor = color(0, 200);
    const numInputs = this.rays.length + 2;
    if (neuralNetwork) {
      this.neuralNetwork = neuralNetwork;
    } else {
      this.neuralNetwork = new NeuralNetwork({ numInputs });
    }
    this.totalDistanceTraveled = 0;
  }

  reset() {
    this.setInitialPosition();
    this.setInitialRays();
    this.totalDistanceTraveled = 0;
  }

  setInitialPosition() {
    this.pos = createVector(width * 4/8, height * 15/16);
    this.vel = createVector(1, 0);
    this.heading = PI / 2;
    this.dead = false;
  }

  setInitialRays() {
    this.rays = [];
    for (let a = -Vehicle.fov / 2; a < Vehicle.fov / 2; a += Vehicle.fov / (Vehicle.numSensors - 1)) {
      this.rays.push(new Ray(this.pos, radians(a - 90)));
    }
    this.rays.push(new Ray(this.pos, radians(Vehicle.fov / 2 - 90)));
  }

  getFitness() {
    return this.totalDistanceTraveled;
  }

  updateManually(keys) {
    const forceVector = createVector();
    if (keys.includes(LEFT_ARROW)) {
      this.rotate(-Vehicle.maxRotation);
    }
    if (keys.includes(RIGHT_ARROW)) {
      this.rotate(Vehicle.maxRotation);
    }
    if (keys.includes(UP_ARROW)) {
      forceVector.add(createVector(0, -Vehicle.maxForce));
    }
    forceVector.rotate(this.heading);
    this.move(forceVector);
    if (keys.includes(DOWN_ARROW)) {
      this.brake(Vehicle.maxBrake);
    }
  }

  brake(val) {
    this.vel.setMag(this.vel.mag() * (1 - val));
  }

  updateAI() {
    if (this.dead) {
      this.move(0);
    } else {
      const { outputs: [
        forwards,
        rotateLeft,
        rotateRight,
      ] } = this.decision();
      const rotationValue = map(
        rotateLeft - rotateRight, 0, 1, 0, Vehicle.maxRotation
      );
      this.rotate(rotationValue);
      const forceVector = createVector(
        0, map(forwards, 0, 1, 0, -Vehicle.maxForce),
      );
      forceVector.rotate(this.heading);
      this.move(forceVector);
    }
  }

  move(force) {
    if (!this.dead && (
      this.pos.x > width ||
      this.pos.x < 0 ||
      this.pos.y > height ||
      this.pos.y < 0
    )) this.kill();
    
    const oldPos = this.pos.copy();
    this.vel.add(force);
    this.vel.mult(1 - Vehicle.friction);
    this.pos.add(this.vel);

    if (this.dead) {
      this.vel.setMag(this.vel.mag() * 0.5);
    } else {
      const distanceTraveled = p5.Vector.dist(oldPos, this.pos);
      this.totalDistanceTraveled += distanceTraveled;
    }
  }

  getRelativeSpeedVector() {
    return this.vel.copy().rotate(PI - this.heading);
  }

  rotate(val) {
    if (!this.dead) {
      this.heading += val;
      for(let ray of this.rays) {
        ray.rotate(this.heading);
      }
    }
  }

  decision() {
    const inputs = [];
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const distToPt = p5.Vector.dist(this.pos, pt);
          if (distToPt < Vehicle.range) {
            if (!closest) {
              closest = pt;
            } else if (distToPt < p5.Vector.dist(this.pos, closest)) {
              closest = pt;
            }
          }
        }
      }
      if (closest) {
        inputs.push(
          map(p5.Vector.dist(this.pos, closest), 0, Vehicle.range, 0, 1)
        );
      } else {
        inputs.push(1);
      }
    }
    const relativeSpeedVector = this.getRelativeSpeedVector();
    inputs.push(
      map(relativeSpeedVector.x, -5, 5, -1, 1)
    );
    inputs.push(
      map(relativeSpeedVector.y, -5, 5, -1, 1)
    );
    const outputs = this.neuralNetwork.predict(inputs);
    return { outputs, inputs };
  }

  show() {
    push();
    if (this.dead) {
      const value = alpha(this.bodyColor) * 0.975;
      this.bodyColor.setAlpha(value);
    }
    stroke(this.bodyColor);
    translate(this.pos);
    rotate(this.heading);
    line(0, -10, -5, 10);
    line(0, -10, 5, 10);
    line(-5, 10, 0, 7);
    line(5, 10, 0, 7);
    pop();
  }

  kill() {
    this.dead = true;
    this.bodyColor = color(255, 0, 0, 127);
  }

  dispose() {
    this.neuralNetwork.dispose();
  }

  mutate() {
    this.neuralNetwork.mutate(Vehicle.mutationRate);
    return this;
  }

  showRays(walls) {
    if (this.dead) {
      return;
    }
    for (let i = 0; i < this.rays.length; i++) {
      const ray = this.rays[i];
      let closest = null;
      for (let wall of walls) {
        const pt = ray.cast(wall);
        if (pt) {
          const distToPt = p5.Vector.dist(this.pos, pt);
          if (distToPt < Vehicle.range) {
            if (!closest) {
              closest = pt;
            } else if (distToPt < p5.Vector.dist(this.pos, closest)) {
              closest = pt;
            }
          }
        }
      }
      if (closest) {
        const dist = p5.Vector.dist(this.pos, closest);
        push();
        strokeWeight(2);
        const c = this.rayColor;
        c.setAlpha(map(dist, 0, Vehicle.range, 100, 0));
        stroke(c);
        noFill();
        push();
        translate(closest);
        pop();
        line(this.pos.x, this.pos.y, closest.x, closest.y);
        pop();
      }
    }
  }

  isWallHit(walls) {
    for (let wall of walls) {
      if (wall.isIntersecting(this.pos)) {
        return true;
      }
    }
    return false;
  }

  clone() {
    const clone = new Vehicle(this.neuralNetwork.copy());
    clone.rayColor = this.rayColor;
    return clone;
  }

  setEliteColor() {
    this.bodyColor = color(0, 255, 255);
  }

  setRandomRayColor() {
    this.rayColor = color(
      randomGaussian(Math.min(Math.max(parseInt(this.rayColor.levels[0]), 0), 220), 15),
      randomGaussian(Math.min(Math.max(parseInt(this.rayColor.levels[1]), 0), 220), 15),
      randomGaussian(Math.min(Math.max(parseInt(this.rayColor.levels[2]), 0), 220), 15),
    );
  }
}
const vehicles = [];
const walls = [];
const foods = [];
const populationSize = 1;
const numElites = 0;
const selectionSplit = 0.5;
const targetMutationRate = 0.001;
const targetLifeTime = 800;
let lifeTime = 800;
let frameCount = 0;
let generationCount = 0;
let isPaused = false;

tf.setBackend('cpu');

function getKeysIsDown() {
  const keys = [LEFT_ARROW, UP_ARROW, RIGHT_ARROW, DOWN_ARROW];
  return keys.filter(key => keyIsDown(key));
}

function setWalls(config = {}) {
  walls.push(new Boundary(0, 0, width - 0, 0));
  walls.push(new Boundary(width - 1, 0, width - 1, height));
  walls.push(new Boundary(width, height - 1, 0, height - 1));
  walls.push(new Boundary(0, 0, 0, height));
  
  const { type } = config;
  switch (type) {
    case 'cornered-square':
      walls.push(new Boundary(width * 3/8, height * 1/8, width * 5/8, height * 1/8)); // 1
      walls.push(new Boundary(width * 5/8, height * 1/8, width * 7/8, height * 3/8)); // 2
      walls.push(new Boundary(width * 7/8, height * 3/8, width * 7/8, height * 5/8)); // 3
      walls.push(new Boundary(width * 7/8, height * 5/8, width * 5/8, height * 7/8)); // 4
      walls.push(new Boundary(width * 5/8, height * 7/8, width * 3/8, height * 7/8)); // 5
      walls.push(new Boundary(width * 3/8, height * 7/8, width * 1/8, height * 5/8)); // 6
      walls.push(new Boundary(width * 1/8, height * 5/8, width * 1/8, height * 3/8)); // 7
      walls.push(new Boundary(width * 1/8, height * 3/8, width * 3/8, height * 1/8)); // 8
      walls.push(new Boundary(width * 7/8, height * 0/8, width * 8/8, height * 3/8)); // 1
      walls.push(new Boundary(width * 8/8, height * 5/8, width * 7/8, height * 8/8)); // 2
      walls.push(new Boundary(width * 1/8, height * 8/8, width * 0/8, height * 5/8)); // 3
      walls.push(new Boundary(width * 1/8, height * 0/8, width * 0/8, height * 3/8)); // 4
      break;

    case 'square':
      walls.push(new Boundary(10, 10, width - 10, 10));
      walls.push(new Boundary(width - 10, 10, width - 10, height - 10));
      walls.push(new Boundary(width - 10, height - 10, 10, height - 10));
      walls.push(new Boundary(10, 10, 10, height - 10));
      walls.push(new Boundary(150, 150, width - 150, 150));
      walls.push(new Boundary(width - 150, 150, width - 150, height - 150));
      walls.push(new Boundary(width - 150, height - 150, 150, height - 150));
      walls.push(new Boundary(150, 150, 150, height - 150));
      break;

    case 'template1':
      walls.push(new Boundary(width * 1/6, height * 5/6, width * 5/6, height * 5/6));
      walls.push(new Boundary(width * 1/6, height * 3/6, width * 5/6, height * 3/6));
      walls.push(new Boundary(width * 1/6, height * 1/6, width * 5/6, height * 1/6));
      walls.push(new Boundary(width * 3/6, height * 1/6, width * 3/6, height * 5/6));
      walls.push(new Boundary(width * 0/6, height * 4/6, width * 2/6, height * 4/6));
      walls.push(new Boundary(width * 0/6, height * 2/6, width * 2/6, height * 2/6));
      walls.push(new Boundary(width * 4/6, height * 4/6, width * 6/6, height * 4/6));
      walls.push(new Boundary(width * 4/6, height * 2/6, width * 6/6, height * 2/6));
      break;

    case 'template2':
      walls.push(new Boundary(width * 1/6, height * 1/6, width * 1/6, height * 5/6));
      walls.push(new Boundary(width * 3/6, height * 1/6, width * 3/6, height * 5/6));
      walls.push(new Boundary(width * 5/6, height * 1/6, width * 5/6, height * 5/6));
      walls.push(new Boundary(width * 2/6, height * 0/6, width * 2/6, height * 4/6));
      walls.push(new Boundary(width * 4/6, height * 0/6, width * 4/6, height * 4/6));
      walls.push(new Boundary(width * 1/6, height * 5/6, width * 5/6, height * 5/6));
      break;

    case 'template3':
      walls.push(new Boundary(width * 1/6, height * 5/6, width * 5/6, height * 5/6));
      walls.push(new Boundary(width * 1/6, height * 1/6, width * 5/6, height * 1/6));
      walls.push(new Boundary(width * 6/6, height * 5/6, width * 5/6, height * 6/6));
      walls.push(new Boundary(width * 6/6, height * 5/6, width * 5/6, height * 3/6));
      walls.push(new Boundary(width * 5/6, height * 5/6, width * 4/6, height * 3/6));
      walls.push(new Boundary(width * 4/6, height * 3/6, width * 5/6, height * 1/6));
      walls.push(new Boundary(width * 5/6, height * 3/6, width * 6/6, height * 1/6));
      walls.push(new Boundary(width * 6/6, height * 1/6, width * 5/6, height * 0/6));
      walls.push(new Boundary(width * 1/6, height * 1/6, width * 2/6, height * 3/6));
      walls.push(new Boundary(width * 2/6, height * 3/6, width * 1/6, height * 5/6));
      walls.push(new Boundary(width * 1/6, height * 0/6, width * 0/6, height * 1/6));
      walls.push(new Boundary(width * 0/6, height * 1/6, width * 1/6, height * 3/6));
      walls.push(new Boundary(width * 1/6, height * 3/6, width * 0/6, height * 5/6));
      walls.push(new Boundary(width * 0/6, height * 5/6, width * 1/6, height * 6/6));
      break;
      
    case 'random':
    default:
      walls.push(new Boundary(10, 10, width - 10, 10));
      walls.push(new Boundary(width - 10, 10, width - 10, height - 10));
      walls.push(new Boundary(width - 10, height - 10, 10, height - 10));
      walls.push(new Boundary(10, 10, 10, height - 10));
      
      for(let i = 0; i < 4; i++) {
        walls.push(new Boundary(random(width), random(height), random(width), random(height)));
      }
  }
}

function setEnvironment() {
  background('#fff');
}

function showWalls() {
  for (let wall of walls) {
    wall.show();
  }
}

function setVehicles() {
  for(let i = 0; i < populationSize; i++) {
    vehicles.push(new Vehicle());
  }
}

function setFood() {
  for(let i = 0; i < 100; i++) {
    foods.push(new Food());
  }
}

function showFood() {
  for(let food of foods) {
    food.show();
  }
}

function setScore() {
  const currentScore = vehicles[0].getFitness().toFixed(1);
  const previousScore = parseFloat(document.getElementById('current-score-value').innerText);
  if (currentScore > previousScore) {
    document.getElementById('current-score-value').innerText = currentScore;
    document.getElementById('previous-score-value').innerText = previousScore;
    document.getElementById('score-increased-arrow').innerText = '->';
  } else {
    document.getElementById('previous-score-value').innerText = '';
    document.getElementById('score-increased-arrow').innerText = '';
  }
}

function sortVehicles() {
  vehicles.sort((v1, v2) => {
    if (v1.getFitness() > v2.getFitness()) {
      return -1;
    }
    if (v1.getFitness() < v2.getFitness()) {
      return 1;
    }
    return 0;
  });
}

function printEliteFitness() {
  const eliteFitness = (() => {
    let accumulatedScore = 0;
    for (let i = 0; i < numElites; i++) {
      accumulatedScore += vehicles[i].getFitness();
    }
    return accumulatedScore;
  })() / numElites;
  console.log('Average elite fitness:', eliteFitness.toFixed(1));
}

function decreaseVehicleMutationRate() {
  if (generationCount % 5 != 0) {
    return;
  }

  if (Vehicle.mutationRate > targetMutationRate) {
    Vehicle.mutationRate /= 2;
    return;
  }

  Vehicle.mutationRate = targetMutationRate;
}

function increaseGenerationCount() {
  generationCount++;
}

function displayGenerationCount() {
  document.getElementById('generation-count').innerText = generationCount;
}

function setNewGeneration() {
  sortVehicles();
  setScore();
  printEliteFitness();

  const newVehicles = [];
  const elites = vehicles.slice(0, numElites);
  elites.forEach(elite => {
    const clone = elite.clone()
    clone.setEliteColor();
    newVehicles.push(clone);
  });

  for (let i = 0; newVehicles.length < populationSize; i++) {
    const index = i % (parseInt(populationSize * abs(selectionSplit)) || 1);
    const parent = vehicles[index];
    const clone = parent.clone();
    clone.mutate();
    clone.setRandomRayColor();
    newVehicles.unshift(clone);
  }
  
  for (let i = 0; i < vehicles.length; i++) {
    vehicles[i].dispose();
    vehicles[i] = newVehicles[i];
  }

  increaseGenerationCount();
  displayGenerationCount();
  frameCount = 0;
}

function isAnyVehicleAlive() {
  for(let vehicle of vehicles) {
    if (!vehicle.dead) {
      return true;
    }
  }
  return false;
}

function showProgressBar() {
  push();
  stroke(color(230, 50, 50));
  strokeWeight(1);
  translate(0, height - 1);
  const progress = map(lifeTime - frameCount, 0, lifeTime, 1, 0);
  line(0, 0, width * progress, 0);
  pop();
}

async function loadElite() {
  const eliteModel = await tf.loadLayersModel('https://fjern-proxy.herokuapp.com/elite.json');
  const elite = new Vehicle();
  elite.decision();
  elite.dispose();
  elite.rayColor = color(0, 255, 0);
  elite.neuralNetwork.model = eliteModel;
  setNewGeneration();
  vehicles[0].dispose();
  vehicles[0] = elite;
}

function increaseLifeTime() {
  if (lifeTime < targetLifeTime) {
    lifeTime += 16;
  } else {
    lifeTime = targetLifeTime;
  }
}

function displayVehicleMutationRate() {
  document.getElementById('mutation-rate').innerText = Vehicle.mutationRate;
}

function displayLifeTime() {
  document.getElementById('life-time').innerText = lifeTime;
}

function togglePause() {
  if (isPaused) {
    loop();
  } else {
    noLoop();
  }
  isPaused = !isPaused;
}

function keyPressed() {
  if (keyCode == 32) {
    togglePause();
  }
}

function setup() {
  createCanvas(960, 540);
  setEnvironment();

  setWalls({ type: 'cornered-square' });
  setVehicles();
  displayVehicleMutationRate();
  displayLifeTime();
}

function draw() {
  if (++frameCount > lifeTime || !isAnyVehicleAlive()) {
    setNewGeneration();
    increaseLifeTime();
    decreaseVehicleMutationRate();
    displayVehicleMutationRate();
    displayLifeTime();
  }
  
  setEnvironment();
  
  for(let vehicle of vehicles) {
    vehicle.showRays(walls);
  }
  for(let vehicle of vehicles) {
    vehicle.show();
  }
  for(let vehicle of vehicles) {
    vehicle.updateManually(getKeysIsDown());
    // vehicle.updateAI();
    if (vehicle.isWallHit(walls)) {
      if (!vehicle.dead) {
        vehicle.kill();
      }
    }
  }

  showWalls();
  showProgressBar();
}
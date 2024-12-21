// Variables globales
let ship;
let lasers = [];
let asteroids = [];
let score = 0;
let lives = 3;
let gameOver = false;

function setup() {
  createCanvas(800, 600);
  initGame();
}

function initGame() {
  ship = new Ship();
  score = 0;
  lives = 3;
  gameOver = false;
  asteroids = [];
  lasers = [];
  // Crear asteroides iniciales
  spawnAsteroids(5);
}

function spawnAsteroids(count) {
  for (let i = 0; i < count; i++) {
    // Evitar crear asteroides muy cerca de la nave
    let pos;
    do {
      pos = createVector(random(width), random(height));
    } while (dist(pos.x, pos.y, ship.pos.x, ship.pos.y) < 100);
    
    asteroids.push(new Asteroid(pos));
  }
}

function draw() {
  if (gameOver) {
    displayGameOver();
    return;
  }

  background(0);
  displayHUD();
  updateGameState();
  checkCollisions();
}

function updateGameState() {
  // Actualizar y mostrar la nave
  if (!ship.isDestroyed) {
    ship.update();
    ship.edges();
    ship.display();
  }

  // Actualizar y mostrar los disparos
  for (let i = lasers.length - 1; i >= 0; i--) {
    lasers[i].update();
    lasers[i].display();
    if (lasers[i].offscreen()) {
      lasers.splice(i, 1);
    }
  }

  // Actualizar y mostrar los asteroides
  asteroids.forEach(asteroid => {
    asteroid.update();
    asteroid.display();
  });
}

function checkCollisions() {
  // Colisiones entre disparos y asteroides
  for (let i = asteroids.length - 1; i >= 0; i--) {
    for (let j = lasers.length - 1; j >= 0; j--) {
      if (asteroids[i].hit(lasers[j])) {
        // Añadir puntuación basada en el tamaño del asteroide
        score += floor(1000 / asteroids[i].radius);
        
        // Crear asteroides más pequeños
        let newAsteroids = asteroids[i].break();
        asteroids.push(...newAsteroids);
        
        // Eliminar el asteroide y el láser
        asteroids.splice(i, 1);
        lasers.splice(j, 1);
        break;
      }
    }
  }

  // Colisiones entre nave y asteroides
  if (!ship.isDestroyed && !ship.invulnerable) {
    for (let asteroid of asteroids) {
      if (ship.hits(asteroid)) {
        ship.destroy();
        break;
      }
    }
  }
}

function displayHUD() {
  fill(255);
  noStroke();
  textAlign(LEFT);
  textSize(20);
  text(`Score: ${score}`, 20, 30);
  
  // Mostrar vidas restantes
  for (let i = 0; i < lives; i++) {
    push();
    translate(30 + i * 25, 80);
    fill(255);
    noStroke();
    triangle(0, -5, -5, 5, 5, 5);
    pop();
  }
}

function displayGameOver() {
  background(0);
  fill(255);
  textAlign(CENTER);
  textSize(40);
  text('GAME OVER', width/2, height/2);
  textSize(20);
  text(`Final Score: ${score}`, width/2, height/2 + 40);
  text('Press ENTER to restart', width/2, height/2 + 80);
}

class Ship {
  constructor() {
    this.pos = createVector(width/2, height/2);
    this.vel = createVector(0, 0);
    this.heading = 0;
    this.rotation = 0;
    this.isBoosting = false;
    this.isDestroyed = false;
  }

  hits(asteroid) {
    let d = dist(this.pos.x, this.pos.y, asteroid.pos.x, asteroid.pos.y);
    return d < asteroid.radius + 10;
  }

  destroy() {
    lives--;
    if (lives > 0) {
      this.respawn();
    } else {
      gameOver = true;
    }
  }

  respawn() {
    this.pos = createVector(width/2, height/2);
    this.vel = createVector(0, 0);
    this.heading = 0;
  }

  boosting(b) {
    this.isBoosting = b;
  }

  setRotation(angle) {
    this.rotation = angle;
  }

  update() {
    this.heading += this.rotation;

    if (this.isBoosting) {
      let force = p5.Vector.fromAngle(this.heading - HALF_PI);
      force.mult(0.1);
      this.vel.add(force);
    }

    this.pos.add(this.vel);
    this.vel.mult(0.99);
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    else if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    else if (this.pos.y < 0) this.pos.y = height;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    
    fill(255);
    noStroke();
    beginShape();
    vertex(0, -10);
    vertex(-5, 10);
    vertex(5, 10);
    endShape(CLOSE);
    
    pop();
  }
}

class Laser {
  constructor(pos, angle) {
    this.pos = createVector(pos.x, pos.y);
    this.vel = p5.Vector.fromAngle(angle);
    this.vel.mult(10);
  }

  update() {
    this.pos.add(this.vel);
  }

  display() {
    push();
    stroke(255);
    strokeWeight(4);
    point(this.pos.x, this.pos.y);
    pop();
  }

  offscreen() {
    return (this.pos.x < 0 || this.pos.x > width || 
            this.pos.y < 0 || this.pos.y > height);
  }
}

class Asteroid {
  constructor(pos, radius) {
    this.pos = pos || createVector(random(width), random(height));
    this.vel = p5.Vector.random2D();
    this.vel.mult(random(1, 2));
    this.radius = radius || random(30, 50);
    
    // Crear forma irregular
    this.vertices = [];
    let total = floor(random(7, 12));
    for (let i = 0; i < total; i++) {
      let angle = map(i, 0, total, 0, TWO_PI);
      let r = this.radius + random(-5, 5);
      let x = r * cos(angle);
      let y = r * sin(angle);
      this.vertices.push(createVector(x, y));
    }
  }

  update() {
    this.pos.add(this.vel);
    this.edges();
  }

  edges() {
    if (this.pos.x > width + this.radius) this.pos.x = -this.radius;
    else if (this.pos.x < -this.radius) this.pos.x = width + this.radius;
    if (this.pos.y > height + this.radius) this.pos.y = -this.radius;
    else if (this.pos.y < -this.radius) this.pos.y = height + this.radius;
  }

  break() {
    let newAsteroids = [];
    if (this.radius > 15) {
      for (let i = 0; i < 2; i++) {
        newAsteroids.push(new Asteroid(
          createVector(this.pos.x, this.pos.y),
          this.radius / 2
        ));
      }
    }
    return newAsteroids;
  }

  display() {
    push();
    translate(this.pos.x, this.pos.y);
    noFill();
    stroke(255);
    beginShape();
    for (let v of this.vertices) {
      vertex(v.x, v.y);
    }
    endShape(CLOSE);
    pop();
  }

  hit(laser) {
    let d = dist(this.pos.x, this.pos.y, laser.pos.x, laser.pos.y);
    return d < this.radius;
  }
}

function keyPressed() {
  if (gameOver && keyCode === ENTER) {
    initGame();
    return;
  }

  if (keyCode === RIGHT_ARROW) {
    ship.setRotation(0.1);
  } else if (keyCode === LEFT_ARROW) {
    ship.setRotation(-0.1);
  } else if (keyCode === UP_ARROW) {
    ship.boosting(true);
  } else if (key === ' ') {
    lasers.push(new Laser(ship.pos, ship.heading - HALF_PI));
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    ship.setRotation(0);
  } else if (keyCode === UP_ARROW) {
    ship.boosting(false);
  }
}
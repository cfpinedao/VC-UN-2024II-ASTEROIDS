
let ship; // Variable para la nave
let lasers = []; // Lista para los disparos
let asteroids = []; // Lista para los asteroides

function setup() {
  createCanvas(800, 600);
  ship = new Ship();
  // Crear asteroides iniciales
  for (let i = 0; i < 5; i++) {
    asteroids.push(new Asteroid());
  }
}

function draw() {
  background(0);

  // Actualizar y dibujar la nave
  ship.update();
  ship.edges();
  ship.display();

  // Actualizar y mostrar los disparos
  for (let i = lasers.length - 1; i >= 0; i--) {
    lasers[i].update();
    lasers[i].display();

    // Eliminar el láser si sale de la pantalla
    if (lasers[i].offscreen()) {
      lasers.splice(i, 1);
    }
  }

  // Actualizar y mostrar los asteroides
  for (let i = asteroids.length - 1; i >= 0; i--) {
    asteroids[i].update();
    asteroids[i].display();

    // Verificar colisiones entre disparos y asteroides
    for (let j = lasers.length - 1; j >= 0; j--) {
      if (asteroids[i].hit(lasers[j])) {
        // Si un láser impacta un asteroide, eliminar ambos
        lasers.splice(j, 1);
        asteroids.splice(i, 1);
        break; // Salir del bucle interno
      }
    }
  }
}

function keyPressed() {
  if (keyCode === RIGHT_ARROW) {
    ship.setRotation(0.1); // Gira a la derecha
  } else if (keyCode === LEFT_ARROW) {
    ship.setRotation(-0.1); // Gira a la izquierda
  } else if (keyCode === UP_ARROW) {
    ship.boosting(true); // Activa el propulsor
  } else if (key === ' ') {
    lasers.push(new Laser(ship.pos, ship.heading - HALF_PI)); // Dispara un láser
  }
}

function keyReleased() {
  if (keyCode === RIGHT_ARROW || keyCode === LEFT_ARROW) {
    ship.setRotation(0); // Deja de rotar
  } else if (keyCode === UP_ARROW) {
    ship.boosting(false); // Desactiva el propulsor
  }
}

// Clase para la nave
class Ship {
  constructor() {
    this.pos = createVector(width / 2, height / 2); // Posición inicial
    this.vel = createVector(0, 0); // Velocidad inicial
    this.heading = 0; // Dirección en la que apunta
    this.rotation = 0; // Velocidad de rotación
    this.isBoosting = false; // Indica si está usando el propulsor
  }

  boosting(b) {
    this.isBoosting = b;
  }

  setRotation(angle) {
    this.rotation = angle;
  }

  update() {
    // Rotar la nave
    this.heading += this.rotation;

    // Si el propulsor está activo, añadir aceleración en la dirección correcta
    if (this.isBoosting) {
      let force = p5.Vector.fromAngle(this.heading - HALF_PI); // Corregido: apunta hacia la punta de la nave
      force.mult(0.1); // Magnitud del empuje
      this.vel.add(force);
    }

    // Actualizar la posición y añadir inercia
    this.pos.add(this.vel);

    // Fricción para que eventualmente se detenga
    this.vel.mult(0.99);
  }

  edges() {
    // Permitir que la nave reaparezca en los bordes
    if (this.pos.x > width) this.pos.x = 0;
    else if (this.pos.x < 0) this.pos.x = width;

    if (this.pos.y > height) this.pos.y = 0;
    else if (this.pos.y < 0) this.pos.y = height;
  }

  display() {
    // Dibujar la nave
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.heading);
    fill(255);
    noStroke();
    // Triángulo que representa la nave
    beginShape();
    vertex(0, -10); // Punta de la nave
    vertex(-5, 10); // Lado izquierdo
    vertex(5, 10); // Lado derecho
    endShape(CLOSE);
    pop();
  }
}

// Clase para los disparos
class Laser {
  constructor(pos, angle) {
    this.pos = createVector(pos.x, pos.y); // Comienza en la posición actual de la nave
    this.vel = p5.Vector.fromAngle(angle); // Dirección del disparo
    this.vel.mult(10); // Velocidad del disparo
  }

  update() {
    this.pos.add(this.vel); // Mover el disparo
  }

  display() {
    // Dibujar el láser
    push();
    stroke(255);
    strokeWeight(4);
    point(this.pos.x, this.pos.y);
    pop();
  }

  offscreen() {
    // Verificar si el láser está fuera de la pantalla
    return (this.pos.x < 0 || this.pos.x > width || this.pos.y < 0 || this.pos.y > height);
  }
}

// Clase para los asteroides
class Asteroid {
  constructor() {
    this.pos = createVector(random(width), random(height)); // Posición aleatoria
    this.vel = p5.Vector.random2D(); // Dirección aleatoria
    this.radius = random(15, 50); // Tamaño aleatorio
  }

  update() {
    this.pos.add(this.vel);

    // Reaparecer en el borde opuesto si sale de la pantalla
    if (this.pos.x > width) this.pos.x = 0;
    else if (this.pos.x < 0) this.pos.x = width;

    if (this.pos.y > height) this.pos.y = 0;
    else if (this.pos.y < 0) this.pos.y = height;
  }

  display() {
    push();
    noFill();
    stroke(255);
    translate(this.pos.x, this.pos.y);
    ellipse(0, 0, this.radius * 2);
    pop();
  }

  hit(laser) {
    let d = dist(this.pos.x, this.pos.y, laser.pos.x, laser.pos.y);
    return d < this.radius;
  }
}

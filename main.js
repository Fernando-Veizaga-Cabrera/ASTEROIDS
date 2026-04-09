const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// CONSTANTES DE FÍSICA Y NAVE
const FPS = 60;
const FRICTION = 0.7; 
const SHIP_SIZE = 30;
const SHIP_THRUST = 5; 
const TURN_SPEED = 360; 

// ESTADO DE LA NAVE
const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI, 
    rot: 0, 
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
};

// CONTROLES (Event Listeners)
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(/** @type {KeyboardEvent} */ ev) {
    switch(ev.key) {
        case "ArrowLeft":  ship.rot = TURN_SPEED / 180 * Math.PI / FPS; break;
        case "ArrowRight": ship.rot = -TURN_SPEED / 180 * Math.PI / FPS; break;
        case "ArrowUp":    ship.thrusting = true; break;
    }
}

function keyUp(/** @type {KeyboardEvent} */ ev) {
    switch(ev.key) {
        case "ArrowLeft":  if (ship.rot > 0) ship.rot = 0; break;
        case "ArrowRight": if (ship.rot < 0) ship.rot = 0; break;
        case "ArrowUp":    ship.thrusting = false; break;
    }
}

// EL GAME LOOP
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // 1. Rotar la nave
    ship.a += ship.rot;

    // 2. Calcular el empuje
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // 3. Mover la nave
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    // 4. LÍMITES DE LA PANTALLA (NUEVO)

    // Eje X (Izquierda / Derecha)
    if (ship.x < 0 - ship.r) {
        ship.x = canvas.width + ship.r;
    } else if (ship.x > canvas.width + ship.r) {
        ship.x = 0 - ship.r;
    }

    // Eje Y (Arriba / Abajo)
    if (ship.y < 0 - ship.r) {
        ship.y = canvas.height + ship.r;
    } else if (ship.y > canvas.height + ship.r) {
        ship.y = 0 - ship.r;
    }
}

function draw() {
    // Limpiar pantalla
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar la nave (Un triángulo usando trazados del Canvas)
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    // Punta de la nave
    ctx.moveTo(
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    // Vértice trasero izquierdo
    ctx.lineTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    // Vértice trasero derecho
    ctx.lineTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

    // Opcional: Dibujar el propulsor si está acelerando
    if (ship.thrusting) {
        ctx.fillStyle = 'red';
        ctx.strokeStyle = 'yellow';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - 0.5 * Math.cos(ship.a))
        );
        ctx.lineTo(
            ship.x - ship.r * 5 / 3 * Math.cos(ship.a),
            ship.y + ship.r * 5 / 3 * Math.sin(ship.a)
        );
        ctx.lineTo(
            ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - 0.5 * Math.sin(ship.a)),
            ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + 0.5 * Math.cos(ship.a))
        );
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
    }
}

gameLoop();
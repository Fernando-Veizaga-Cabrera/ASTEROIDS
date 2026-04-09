const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// ==========================================
// CONSTANTES DE FÍSICA Y NAVE
// ==========================================
const FPS = 60;
const FRICTION = 0.7; // Fricción en el espacio (0 = sin fricción, 1 = mucha fricción)
const SHIP_SIZE = 30; // Altura de la nave en píxeles
const SHIP_THRUST = 5; // Aceleración en píxeles por segundo
const TURN_SPEED = 360; // Velocidad de giro en grados por segundo

// ==========================================
// ESTADO DE LA NAVE
// ==========================================
const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI, // Ángulo en radianes (90 grados para apuntar hacia arriba)
    rot: 0, // Dirección de rotación (-1 izquierda, 1 derecha)
    thrusting: false,
    thrust: {
        x: 0,
        y: 0
    }
};

// ==========================================
// CONTROLES (Event Listeners)
// ==========================================
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

// ==========================================
// EL GAME LOOP
// ==========================================
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    // 1. Rotar la nave
    ship.a += ship.rot;

    // 2. Calcular el empuje (Física vectorial)
    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
    } else {
        // Aplicar fricción para que frene poco a poco
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    // 3. Mover la nave
    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;
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
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

const FPS = 60;
const FRICTION = 0.7;
const SHIP_SIZE = 30;
const SHIP_THRUST = 5;
const TURN_SPEED = 360;
const LASER_MAX = 10;
const LASER_SPD = 500;
const LASER_DIST = 0.5;

const ship = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    r: SHIP_SIZE / 2,
    a: 90 / 180 * Math.PI,
    rot: 0,
    thrusting: false,
    thrust: { x: 0, y: 0 },
    lasers: []
};

document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(ev) {
    switch(ev.key) {
        case " ":          shootLaser(); break;
        case "ArrowLeft":  ship.rot = TURN_SPEED / 180 * Math.PI / FPS; break;
        case "ArrowRight": ship.rot = -TURN_SPEED / 180 * Math.PI / FPS; break;
        case "ArrowUp":    ship.thrusting = true; break;
    }
}

function keyUp(ev) {
    switch(ev.key) {
        case "ArrowLeft":  if (ship.rot > 0) ship.rot = 0; break;
        case "ArrowRight": if (ship.rot < 0) ship.rot = 0; break;
        case "ArrowUp":    ship.thrusting = false; break;
    }
}

function shootLaser() {
    if (ship.lasers.length < LASER_MAX) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0
        });
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

function update() {
    ship.a += ship.rot;

    if (ship.thrusting) {
        ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
        ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
    } else {
        ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
        ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
    }

    ship.x += ship.thrust.x;
    ship.y += ship.thrust.y;

    handleScreenWrap(ship);

    for (let i = ship.lasers.length - 1; i >= 0; i--) {
        const laser = ship.lasers[i];
        
        laser.x += laser.xv;
        laser.y += laser.yv;
        laser.dist += Math.sqrt(Math.pow(laser.xv, 2) + Math.pow(laser.yv, 2));

        if (laser.dist > canvas.width * LASER_DIST) {
            ship.lasers.splice(i, 1);
            continue;
        }

        handleScreenWrap(laser);
    }
}

function handleScreenWrap(entity) {
    const radius = entity.r || 0; 
    
    if (entity.x < 0 - radius) {
        entity.x = canvas.width + radius;
    } else if (entity.x > canvas.width + radius) {
        entity.x = 0 - radius;
    }

    if (entity.y < 0 - radius) {
        entity.y = canvas.height + radius;
    } else if (entity.y > canvas.height + radius) {
        entity.y = 0 - radius;
    }
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawShip();
    drawLasers();
}

function drawShip() {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    
    ctx.moveTo(
        ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
        ship.y - 4 / 3 * ship.r * Math.sin(ship.a)
    );
    ctx.lineTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) + Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) - Math.cos(ship.a))
    );
    ctx.lineTo(
        ship.x - ship.r * (2 / 3 * Math.cos(ship.a) - Math.sin(ship.a)),
        ship.y + ship.r * (2 / 3 * Math.sin(ship.a) + Math.cos(ship.a))
    );
    ctx.closePath();
    ctx.stroke();

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

function drawLasers() {
    for (let i = 0; i < ship.lasers.length; i++) {
        ctx.fillStyle = 'salmon';
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 15, 0, Math.PI * 2, false);
        ctx.fill();
    }
}

gameLoop();
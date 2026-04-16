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

const ROIDS_NUM = 5;
const ROIDS_SIZE = 100;
const ROIDS_SPD = 50;
const ROIDS_VERT = 10;
const ROIDS_JAG = 0.4;

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

let asteroids = [];

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

function createAsteroidBelt() {
    asteroids = [];
    let x, y;
    for (let i = 0; i < ROIDS_NUM; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
        
        asteroids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
}

function newAsteroid(x, y, r) {
    const roid = {
        x: x,
        y: y,
        xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        r: r,
        a: Math.random() * Math.PI * 2,
        vert: Math.floor(Math.random() * (ROIDS_VERT + 1) + ROIDS_VERT / 2),
        offs: []
    };

    for (let i = 0; i < roid.vert; i++) {
        roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    }

    return roid;
}

function destroyAsteroid(index) {
    const x = asteroids[index].x;
    const y = asteroids[index].y;
    const r = asteroids[index].r;

    if (r > Math.ceil(ROIDS_SIZE / 4)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(r / 2)));
        asteroids.push(newAsteroid(x, y, Math.ceil(r / 2)));
    }

    asteroids.splice(index, 1);
}

function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
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

    for (let i = 0; i < asteroids.length; i++) {
        asteroids[i].x += asteroids[i].xv;
        asteroids[i].y += asteroids[i].yv;
        handleScreenWrap(asteroids[i]);
    }

    for (let i = asteroids.length - 1; i >= 0; i--) {
        const roid = asteroids[i];
        
        for (let j = ship.lasers.length - 1; j >= 0; j--) {
            const laser = ship.lasers[j];
            
            if (distBetweenPoints(roid.x, roid.y, laser.x, laser.y) < roid.r) {
                ship.lasers.splice(j, 1);
                destroyAsteroid(i);
                break; 
            }
        }
    }
}

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawShip();
    drawLasers();
    drawAsteroids();
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
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(ship.lasers[i].x, ship.lasers[i].y, SHIP_SIZE / 6, 0, Math.PI * 2, false);
        ctx.fill();
    }
}

function drawAsteroids() {
    ctx.strokeStyle = 'slategray';
    ctx.lineWidth = 1.5;
    for (let i = 0; i < asteroids.length; i++) {
        const { x, y, r, a, vert, offs } = asteroids[i];
        
        ctx.beginPath();
        for (let j = 0; j < vert; j++) {
            ctx.lineTo(
                x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
            );
        }
        ctx.closePath();
        ctx.stroke();
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

createAsteroidBelt();
gameLoop();
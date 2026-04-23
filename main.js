const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// CONFIGURACIÓN CONSTANTE
const FPS = 60;
const FRICTION = 0.7;
const SHIP_SIZE = 30;
const SHIP_THRUST = 5;
const TURN_SPEED = 360;
const SHIP_EXPLODE_DUR = 0.8; // Aumentado un poco para que las partículas floten más tiempo
const SHIP_INV_DUR = 3; 
const SHIP_BLINK_DUR = 0.1; 
const LASER_MAX = 10;
const LASER_SPD = 500;
const LASER_DIST = 0.5;
const ROIDS_NUM = 5;
const ROIDS_SIZE = 100;
const ROIDS_SPD = 50;
const ROIDS_JAG = 0.4;
const GAME_LIVES = 3;
const PTS_LGE = 20; 
const PTS_MED = 50; 
const PTS_SML = 100;

// VARIABLES DE ESTADO
let asteroids, lives, score, level, ship, gameOver;
let showMenu = true; 

// INICIO DEL JUEGO
function newGame() {
    level = 0;
    score = 0;
    lives = GAME_LIVES;
    gameOver = false;
    newShip();
    createAsteroidBelt();
}

function newShip() {
    ship = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        r: SHIP_SIZE / 2,
        a: 90 / 180 * Math.PI,
        rot: 0,
        thrusting: false,
        thrust: { x: 0, y: 0 },
        explodeTime: 0,
        blinkTime: 0,
        blinkOn: true,
        invTime: Math.ceil(SHIP_INV_DUR * FPS),
        lasers: [],
        particles: [] // NUEVO: Arreglo para guardar los fragmentos de la explosión
    };
}

// EVENTOS DE TECLADO
document.addEventListener("keydown", keyDown);
document.addEventListener("keyup", keyUp);

function keyDown(ev) {
    if (showMenu) {
        if (ev.key === " ") { showMenu = false; newGame(); }
        return;
    }
    if (gameOver) {
        if (ev.key === "Enter") newGame();
        return;
    }
    if (ship && ship.explodeTime > 0) return;

    switch(ev.key) {
        case " ":          shootLaser(); break;
        case "ArrowLeft":  ship.rot = TURN_SPEED / 180 * Math.PI / FPS; break;
        case "ArrowRight": ship.rot = -TURN_SPEED / 180 * Math.PI / FPS; break;
        case "ArrowUp":    ship.thrusting = true; break;
    }
}

function keyUp(ev) {
    if (showMenu || gameOver || (ship && ship.explodeTime > 0)) return;
    switch(ev.key) {
        case "ArrowLeft":  if (ship.rot > 0) ship.rot = 0; break;
        case "ArrowRight": if (ship.rot < 0) ship.rot = 0; break;
        case "ArrowUp":    ship.thrusting = false; break;
    }
}

// LÓGICA DE ASTEROIDES
function createAsteroidBelt() {
    asteroids = [];
    let x, y;
    for (let i = 0; i < ROIDS_NUM + level; i++) {
        do {
            x = Math.floor(Math.random() * canvas.width);
            y = Math.floor(Math.random() * canvas.height);
        } while (ship && distBetweenPoints(ship.x, ship.y, x, y) < ROIDS_SIZE * 2 + ship.r);
        asteroids.push(newAsteroid(x, y, Math.ceil(ROIDS_SIZE / 2)));
    }
}

function newAsteroid(x, y, r) {
    let vert = Math.floor(Math.random() * 7 + 8);
    const roid = {
        x, y, r, vert,
        xv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        yv: Math.random() * ROIDS_SPD / FPS * (Math.random() < 0.5 ? 1 : -1),
        a: Math.random() * Math.PI * 2,
        offs: []
    };
    for (let i = 0; i < vert; i++) roid.offs.push(Math.random() * ROIDS_JAG * 2 + 1 - ROIDS_JAG);
    return roid;
}

function destroyAsteroid(index) {
    const { x, y, r } = asteroids[index];
    if (r > Math.ceil(ROIDS_SIZE / 8)) {
        asteroids.push(newAsteroid(x, y, Math.ceil(r / 2)));
        asteroids.push(newAsteroid(x, y, Math.ceil(r / 2)));
    }
    asteroids.splice(index, 1);
    if (asteroids.length === 0) { level++; createAsteroidBelt(); }
}

// UTILIDADES
function distBetweenPoints(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function handleScreenWrap(obj) {
    if (obj.x < 0 - obj.r) obj.x = canvas.width + obj.r;
    else if (obj.x > canvas.width + obj.r) obj.x = 0 - obj.r;
    if (obj.y < 0 - obj.r) obj.y = canvas.height + obj.r;
    else if (obj.y > canvas.height + obj.r) obj.y = 0 - obj.r;
}

function shootLaser() {
    if (ship.lasers.length < LASER_MAX) {
        ship.lasers.push({
            x: ship.x + 4 / 3 * ship.r * Math.cos(ship.a),
            y: ship.y - 4 / 3 * ship.r * Math.sin(ship.a),
            xv: LASER_SPD * Math.cos(ship.a) / FPS,
            yv: -LASER_SPD * Math.sin(ship.a) / FPS,
            dist: 0, r: SHIP_SIZE / 15
        });
    }
}

// MOTOR DE ACTUALIZACIÓN
function update() {
    if (showMenu) {
        for (let a of asteroids) { a.x += a.xv; a.y += a.yv; handleScreenWrap(a); }
        return; 
    }

    if (gameOver) return;

    const exploding = ship.explodeTime > 0;

    // Nave y Sistema de Partículas
    if (!exploding) {
        if (ship.invTime > 0) {
            ship.invTime--;
            ship.blinkTime--;
            if (ship.blinkTime <= 0) {
                ship.blinkTime = Math.ceil(SHIP_BLINK_DUR * FPS);
                ship.blinkOn = !ship.blinkOn;
            }
        } else ship.blinkOn = true;

        ship.a += ship.rot;
        if (ship.thrusting) {
            ship.thrust.x += SHIP_THRUST * Math.cos(ship.a) / FPS;
            ship.thrust.y -= SHIP_THRUST * Math.sin(ship.a) / FPS;
        } else {
            ship.thrust.x -= FRICTION * ship.thrust.x / FPS;
            ship.thrust.y -= FRICTION * ship.thrust.y / FPS;
        }
        ship.x += ship.thrust.x; ship.y += ship.thrust.y;
        handleScreenWrap(ship);
    } else {
        ship.explodeTime--;
        
        // Desplazar los fragmentos de la explosión
        for (let p of ship.particles) {
            p.x += p.xv;
            p.y += p.yv;
        }

        if (ship.explodeTime === 0) {
            lives--;
            if (lives === 0) gameOver = true;
            else newShip();
        }
    }

    // Láseres
    for (let i = ship.lasers.length - 1; i >= 0; i--) {
        let l = ship.lasers[i];
        l.x += l.xv; l.y += l.yv;
        l.dist += Math.sqrt(Math.pow(l.xv, 2) + Math.pow(l.yv, 2));
        if (l.dist > canvas.width * LASER_DIST) { ship.lasers.splice(i, 1); continue; }
        handleScreenWrap(l);
    }

    // Asteroides
    for (let a of asteroids) { a.x += a.xv; a.y += a.yv; handleScreenWrap(a); }

    // Colisiones Nave
    if (!exploding && ship.invTime === 0) {
        for (let i = 0; i < asteroids.length; i++) {
            if (distBetweenPoints(ship.x, ship.y, asteroids[i].x, asteroids[i].y) < ship.r + asteroids[i].r) {
                ship.explodeTime = Math.ceil(SHIP_EXPLODE_DUR * FPS);
                
                // Generar 30 partículas apuntando en direcciones aleatorias
                for(let k = 0; k < 30; k++) {
                    ship.particles.push({
                        x: ship.x, 
                        y: ship.y,
                        xv: (Math.random() - 0.5) * (Math.random() * 8), // Velocidad X
                        yv: (Math.random() - 0.5) * (Math.random() * 8), // Velocidad Y
                        r: Math.random() * 3 // Tamaño de la partícula
                    });
                }
                
                destroyAsteroid(i);
                break;
            }
        }
    }

    // Colisiones Láser
    for (let i = asteroids.length - 1; i >= 0; i--) {
        for (let j = ship.lasers.length - 1; j >= 0; j--) {
            if (distBetweenPoints(asteroids[i].x, asteroids[i].y, ship.lasers[j].x, ship.lasers[j].y) < asteroids[i].r) {
                let r = asteroids[i].r;
                score += r >= ROIDS_SIZE / 2 ? PTS_LGE : r >= ROIDS_SIZE / 4 ? PTS_MED : PTS_SML;
                ship.lasers.splice(j, 1);
                destroyAsteroid(i);
                break;
            }
        }
    }
}

// MOTOR DE RENDERIZADO
function draw() {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "slategray"; ctx.lineWidth = 1.5;
    for (let a of asteroids) {
        ctx.beginPath();
        for (let j = 0; j < a.vert; j++) 
            ctx.lineTo(a.x + a.r * a.offs[j] * Math.cos(a.a + j * Math.PI * 2 / a.vert), a.y + a.r * a.offs[j] * Math.sin(a.a + j * Math.PI * 2 / a.vert));
        ctx.closePath(); ctx.stroke();
    }

    if (showMenu) {
        ctx.fillStyle = "white"; ctx.textAlign = "center";
        ctx.font = "80px Courier"; ctx.fillText("ASTEROIDS", canvas.width / 2, canvas.height / 2 - 20);
        ctx.font = "20px Courier"; ctx.fillText("PRESS SPACE TO PLAY", canvas.width / 2, canvas.height / 2 + 40);
        return; 
    }

    // Dibujar Sistema de Partículas Vectoriales
    if (ship.explodeTime > 0) {
        // Calcular el desvanecimiento (Alpha)
        let alpha = ship.explodeTime / Math.ceil(SHIP_EXPLODE_DUR * FPS);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; 
        
        for (let p of ship.particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }
    } else if (ship.blinkOn && !gameOver) {
        ctx.strokeStyle = "white"; ctx.beginPath();
        ctx.moveTo(ship.x + 4/3 * ship.r * Math.cos(ship.a), ship.y - 4/3 * ship.r * Math.sin(ship.a));
        ctx.lineTo(ship.x - ship.r * (2/3 * Math.cos(ship.a) + Math.sin(ship.a)), ship.y + ship.r * (2/3 * Math.sin(ship.a) - Math.cos(ship.a)));
        ctx.lineTo(ship.x - ship.r * (2/3 * Math.cos(ship.a) - Math.sin(ship.a)), ship.y + ship.r * (2/3 * Math.sin(ship.a) + Math.cos(ship.a)));
        ctx.closePath(); ctx.stroke();
    }

    ctx.fillStyle = "white";
    for (let l of ship.lasers) { ctx.beginPath(); ctx.arc(l.x, l.y, SHIP_SIZE / 8, 0, Math.PI * 2); ctx.fill(); }

    ctx.font = "30px Courier"; ctx.textAlign = "right"; ctx.fillText(score, canvas.width - 20, 40);
    for (let i = 0; i < lives; i++) {
        let x = 30 + i * 35;
        ctx.strokeStyle = "white"; ctx.beginPath();
        ctx.moveTo(x, 30); ctx.lineTo(x-10, 50); ctx.lineTo(x+10, 50); ctx.closePath(); ctx.stroke();
    }

    if (gameOver) {
        ctx.textAlign = "center"; ctx.font = "60px Courier";
        ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2);
        ctx.font = "20px Courier";
        ctx.fillText("PRESIONA ENTER PARA REINICIAR", canvas.width / 2, canvas.height / 2 + 50);
    }
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

level = 0;
createAsteroidBelt(); 
gameLoop();
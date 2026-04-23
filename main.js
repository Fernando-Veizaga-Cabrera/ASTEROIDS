const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 600;

// ==========================================
// CONFIGURACIÓN GLOBAL
// ==========================================
const CONFIG = {
    FPS: 60, FRICTION: 0.7, SHIP_SIZE: 30, SHIP_THRUST: 5, TURN_SPEED: 360,
    EXPLODE_DUR: 0.8, INV_DUR: 3, BLINK_DUR: 0.1, LASER_MAX: 10, LASER_SPD: 500, LASER_DIST: 0.5,
    ROIDS_NUM: 5, ROIDS_SIZE: 100, ROIDS_SPD: 50, ROIDS_JAG: 0.4,
    LIVES: 3, PTS_LGE: 20, PTS_MED: 50, PTS_SML: 100
};

// ==========================================
// 1. MODELO (Manejo de Datos y Lógica/Física)
// ==========================================
class GameModel {
    constructor() {
        this.showMenu = true;
        this.resetGame();
    }

    resetGame() {
        this.level = 0;
        this.score = 0;
        this.lives = CONFIG.LIVES;
        this.gameOver = false;
        this.resetShip();
        this.createAsteroidBelt();
    }

    resetShip() {
        this.ship = {
            x: canvas.width / 2, y: canvas.height / 2, r: CONFIG.SHIP_SIZE / 2,
            a: 90 / 180 * Math.PI, rot: 0, thrusting: false, thrust: { x: 0, y: 0 },
            explodeTime: 0, blinkTime: 0, blinkOn: true,
            invTime: Math.ceil(CONFIG.INV_DUR * CONFIG.FPS),
            lasers: [], particles: []
        };
    }

    createAsteroidBelt() {
        this.asteroids = [];
        let x, y;
        for (let i = 0; i < CONFIG.ROIDS_NUM + this.level; i++) {
            do {
                x = Math.floor(Math.random() * canvas.width);
                y = Math.floor(Math.random() * canvas.height);
            } while (this.ship && this.distBetweenPoints(this.ship.x, this.ship.y, x, y) < CONFIG.ROIDS_SIZE * 2 + this.ship.r);
            this.asteroids.push(this.newAsteroid(x, y, Math.ceil(CONFIG.ROIDS_SIZE / 2)));
        }
    }

    newAsteroid(x, y, r) {
        let vert = Math.floor(Math.random() * 7 + 8);
        const roid = {
            x, y, r, vert,
            xv: Math.random() * CONFIG.ROIDS_SPD / CONFIG.FPS * (Math.random() < 0.5 ? 1 : -1),
            yv: Math.random() * CONFIG.ROIDS_SPD / CONFIG.FPS * (Math.random() < 0.5 ? 1 : -1),
            a: Math.random() * Math.PI * 2, offs: []
        };
        for (let i = 0; i < vert; i++) roid.offs.push(Math.random() * CONFIG.ROIDS_JAG * 2 + 1 - CONFIG.ROIDS_JAG);
        return roid;
    }

    distBetweenPoints(x1, y1, x2, y2) { return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)); }

    handleScreenWrap(obj) {
        if (obj.x < 0 - obj.r) obj.x = canvas.width + obj.r;
        else if (obj.x > canvas.width + obj.r) obj.x = 0 - obj.r;
        if (obj.y < 0 - obj.r) obj.y = canvas.height + obj.r;
        else if (obj.y > canvas.height + obj.r) obj.y = 0 - obj.r;
    }

    shootLaser() {
        if (this.ship.lasers.length < CONFIG.LASER_MAX) {
            this.ship.lasers.push({
                x: this.ship.x + 4 / 3 * this.ship.r * Math.cos(this.ship.a),
                y: this.ship.y - 4 / 3 * this.ship.r * Math.sin(this.ship.a),
                xv: CONFIG.LASER_SPD * Math.cos(this.ship.a) / CONFIG.FPS,
                yv: -CONFIG.LASER_SPD * Math.sin(this.ship.a) / CONFIG.FPS,
                dist: 0, r: CONFIG.SHIP_SIZE / 15
            });
        }
    }

    update() {
        if (this.showMenu) {
            for (let a of this.asteroids) { a.x += a.xv; a.y += a.yv; this.handleScreenWrap(a); }
            return;
        }

        if (this.gameOver) return;

        const exploding = this.ship.explodeTime > 0;

        // Físicas de la Nave y Partículas
        if (!exploding) {
            if (this.ship.invTime > 0) {
                this.ship.invTime--;
                this.ship.blinkTime--;
                if (this.ship.blinkTime <= 0) {
                    this.ship.blinkTime = Math.ceil(CONFIG.BLINK_DUR * CONFIG.FPS);
                    this.ship.blinkOn = !this.ship.blinkOn;
                }
            } else this.ship.blinkOn = true;

            this.ship.a += this.ship.rot;
            if (this.ship.thrusting) {
                this.ship.thrust.x += CONFIG.SHIP_THRUST * Math.cos(this.ship.a) / CONFIG.FPS;
                this.ship.thrust.y -= CONFIG.SHIP_THRUST * Math.sin(this.ship.a) / CONFIG.FPS;
            } else {
                this.ship.thrust.x -= CONFIG.FRICTION * this.ship.thrust.x / CONFIG.FPS;
                this.ship.thrust.y -= CONFIG.FRICTION * this.ship.thrust.y / CONFIG.FPS;
            }
            this.ship.x += this.ship.thrust.x; this.ship.y += this.ship.thrust.y;
            this.handleScreenWrap(this.ship);
        } else {
            this.ship.explodeTime--;
            for (let p of this.ship.particles) { p.x += p.xv; p.y += p.yv; }
            if (this.ship.explodeTime === 0) {
                this.lives--;
                if (this.lives === 0) this.gameOver = true;
                else this.resetShip();
            }
        }

        // Láseres
        for (let i = this.ship.lasers.length - 1; i >= 0; i--) {
            let l = this.ship.lasers[i];
            l.x += l.xv; l.y += l.yv;
            l.dist += Math.sqrt(Math.pow(l.xv, 2) + Math.pow(l.yv, 2));
            if (l.dist > canvas.width * CONFIG.LASER_DIST) { this.ship.lasers.splice(i, 1); continue; }
            this.handleScreenWrap(l);
        }

        // Asteroides
        for (let a of this.asteroids) { a.x += a.xv; a.y += a.yv; this.handleScreenWrap(a); }

        // Colisiones
        if (!exploding && this.ship.invTime === 0) {
            for (let i = 0; i < this.asteroids.length; i++) {
                if (this.distBetweenPoints(this.ship.x, this.ship.y, this.asteroids[i].x, this.asteroids[i].y) < this.ship.r + this.asteroids[i].r) {
                    this.ship.explodeTime = Math.ceil(CONFIG.EXPLODE_DUR * CONFIG.FPS);
                    for(let k = 0; k < 30; k++) {
                        this.ship.particles.push({
                            x: this.ship.x, y: this.ship.y,
                            xv: (Math.random() - 0.5) * (Math.random() * 8),
                            yv: (Math.random() - 0.5) * (Math.random() * 8),
                            r: Math.random() * 3
                        });
                    }
                    this.destroyAsteroid(i);
                    break;
                }
            }
        }

        for (let i = this.asteroids.length - 1; i >= 0; i--) {
            for (let j = this.ship.lasers.length - 1; j >= 0; j--) {
                if (this.distBetweenPoints(this.asteroids[i].x, this.asteroids[i].y, this.ship.lasers[j].x, this.ship.lasers[j].y) < this.asteroids[i].r) {
                    let r = this.asteroids[i].r;
                    this.score += r >= CONFIG.ROIDS_SIZE / 2 ? CONFIG.PTS_LGE : r >= CONFIG.ROIDS_SIZE / 4 ? CONFIG.PTS_MED : CONFIG.PTS_SML;
                    this.ship.lasers.splice(j, 1);
                    this.destroyAsteroid(i);
                    break;
                }
            }
        }
    }

    destroyAsteroid(index) {
        const { x, y, r } = this.asteroids[index];
        if (r > Math.ceil(CONFIG.ROIDS_SIZE / 8)) {
            this.asteroids.push(this.newAsteroid(x, y, Math.ceil(r / 2)));
            this.asteroids.push(this.newAsteroid(x, y, Math.ceil(r / 2)));
        }
        this.asteroids.splice(index, 1);
        if (this.asteroids.length === 0) { this.level++; this.createAsteroidBelt(); }
    }
}

// ==========================================
// 2. VISTA (Renderizado Gráfico)
// ==========================================
class GameView {
    constructor(ctx, canvas) {
        this.ctx = ctx;
        this.canvas = canvas;
    }

    render(model) {
        this.ctx.fillStyle = "black";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawAsteroids(model.asteroids);

        if (model.showMenu) {
            this.drawMenu();
            return;
        }

        this.drawShip(model.ship, model.gameOver);
        this.drawLasers(model.ship.lasers);
        
        // Fíjate que ahora también le pasamos model.level a la interfaz
        this.drawUI(model.score, model.lives, model.level, model.gameOver); 
    }

    drawAsteroids(asteroids) {
        this.ctx.strokeStyle = "slategray"; this.ctx.lineWidth = 1.5;
        for (let a of asteroids) {
            this.ctx.beginPath();
            for (let j = 0; j < a.vert; j++) 
                this.ctx.lineTo(a.x + a.r * a.offs[j] * Math.cos(a.a + j * Math.PI * 2 / a.vert), a.y + a.r * a.offs[j] * Math.sin(a.a + j * Math.PI * 2 / a.vert));
            this.ctx.closePath(); this.ctx.stroke();
        }
    }

    drawMenu() {
        this.ctx.fillStyle = "white"; this.ctx.textAlign = "center";
        this.ctx.font = "80px Courier"; this.ctx.fillText("ASTEROIDS", this.canvas.width / 2, this.canvas.height / 2 - 20);
        this.ctx.font = "20px Courier"; this.ctx.fillText("PRESS SPACE TO PLAY", this.canvas.width / 2, this.canvas.height / 2 + 40);
    }

    drawShip(ship, gameOver) {
        if (ship.explodeTime > 0) {
            let alpha = ship.explodeTime / Math.ceil(CONFIG.EXPLODE_DUR * CONFIG.FPS);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`; 
            for (let p of ship.particles) {
                this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); this.ctx.fill();
            }
        } else if (ship.blinkOn && !gameOver) {
            this.ctx.strokeStyle = "white"; this.ctx.beginPath();
            this.ctx.moveTo(ship.x + 4/3 * ship.r * Math.cos(ship.a), ship.y - 4/3 * ship.r * Math.sin(ship.a));
            this.ctx.lineTo(ship.x - ship.r * (2/3 * Math.cos(ship.a) + Math.sin(ship.a)), ship.y + ship.r * (2/3 * Math.sin(ship.a) - Math.cos(ship.a)));
            this.ctx.lineTo(ship.x - ship.r * (2/3 * Math.cos(ship.a) - Math.sin(ship.a)), ship.y + ship.r * (2/3 * Math.sin(ship.a) + Math.cos(ship.a)));
            this.ctx.closePath(); this.ctx.stroke();
        }
    }

    drawLasers(lasers) {
        this.ctx.fillStyle = "white";
        for (let l of lasers) { this.ctx.beginPath(); this.ctx.arc(l.x, l.y, CONFIG.SHIP_SIZE / 8, 0, Math.PI * 2); this.ctx.fill(); }
    }

   // Actualizamos los parámetros que recibe la función
    drawUI(score, lives, level, gameOver) {
        // 1. Dibujar el Puntaje (Arriba a la derecha)
        this.ctx.font = "30px Courier"; 
        this.ctx.textAlign = "right"; 
        this.ctx.fillText(score, this.canvas.width - 20, 40);
        
        // 2. NUEVO: Dibujar el Nivel (Abajo a la izquierda)
        this.ctx.textAlign = "left"; 
        // Le sumamos 1 al nivel visualmente para que el jugador empiece en "LEVEL: 1" y no en "0"
        this.ctx.fillText("LEVEL: " + (level + 1), 20, this.canvas.height - 20);

        // 3. Dibujar las Vidas
        for (let i = 0; i < lives; i++) {
            let x = 30 + i * 35;
            this.ctx.strokeStyle = "white"; this.ctx.beginPath();
            this.ctx.moveTo(x, 30); this.ctx.lineTo(x-10, 50); this.ctx.lineTo(x+10, 50); this.ctx.closePath(); this.ctx.stroke();
        }

        // 4. Dibujar Game Over
        if (gameOver) {
            this.ctx.textAlign = "center"; this.ctx.font = "60px Courier";
            this.ctx.fillText("GAME OVER", this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = "20px Courier";
            this.ctx.fillText("PRESIONA ENTER PARA REINICIAR", this.canvas.width / 2, this.canvas.height / 2 + 50);
        }
    }
}

// ==========================================
// 3. CONTROLADOR (Gestión de Inputs y Bucle)
// ==========================================
class GameController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.bindEvents();
    }

    bindEvents() {
        document.addEventListener("keydown", (ev) => this.handleKeyDown(ev));
        document.addEventListener("keyup", (ev) => this.handleKeyUp(ev));
    }

    handleKeyDown(ev) {
        if (this.model.showMenu) {
            if (ev.key === " ") { this.model.showMenu = false; this.model.resetGame(); }
            return;
        }
        if (this.model.gameOver) {
            if (ev.key === "Enter") this.model.resetGame();
            return;
        }
        if (this.model.ship && this.model.ship.explodeTime > 0) return;

        switch(ev.key) {
            case " ":          this.model.shootLaser(); break;
            case "ArrowLeft":  this.model.ship.rot = CONFIG.TURN_SPEED / 180 * Math.PI / CONFIG.FPS; break;
            case "ArrowRight": this.model.ship.rot = -CONFIG.TURN_SPEED / 180 * Math.PI / CONFIG.FPS; break;
            case "ArrowUp":    this.model.ship.thrusting = true; break;
        }
    }

    handleKeyUp(ev) {
        if (this.model.showMenu || this.model.gameOver || (this.model.ship && this.model.ship.explodeTime > 0)) return;
        switch(ev.key) {
            case "ArrowLeft":  if (this.model.ship.rot > 0) this.model.ship.rot = 0; break;
            case "ArrowRight": if (this.model.ship.rot < 0) this.model.ship.rot = 0; break;
            case "ArrowUp":    this.model.ship.thrusting = false; break;
        }
    }

    start() {
        const loop = () => {
            this.model.update();
            this.view.render(this.model);
            requestAnimationFrame(loop);
        };
        loop();
    }
}

// ==========================================
// ARRANQUE DE LA APLICACIÓN
// ==========================================
const app = new GameController(new GameModel(), new GameView(ctx, canvas));
app.start();
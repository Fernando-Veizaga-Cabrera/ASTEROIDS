class Model {
    constructor() {
        this.score = 0;
        this.start = false;
        this.meteorites = [];
        this.bullets = [];
        this.spaceship_data = {
            vx: 0,
            vy: 0,
            x: 600,
            y: 300,
            angle: 0,
            boost: 0.12,
        };
    }

    applyBoost() {
        let radians = (this.spaceship_data.angle - 90) * (Math.PI / 180);
        this.spaceship_data.vx += Math.cos(radians) * this.spaceship_data.boost;
        this.spaceship_data.vy += Math.sin(radians) * this.spaceship_data.boost;
    }

    shot() {
        let radianes = (this.spaceship_data.angle - 90) * (Math.PI / 180);
        const template = document.querySelector('.bullet_hidden');
        const element = template.cloneNode(true);
        
        const next_bullet = {
            x: this.spaceship_data.x,
            y: this.spaceship_data.y,
            vx: Math.cos(radianes) * 10,
            vy: Math.sin(radianes) * 10,
            new_bullet: element,
        };

        element.style.display = "block";
        document.querySelector('.world').appendChild(next_bullet.new_bullet);
        this.bullets.push(next_bullet);
    }

    create() {
        const template = document.querySelector('.meteorite');
        const element = template.cloneNode(true);
        let x, y;
        let side = Math.floor(Math.random() * 4);

        if (side === 0) { x = 0; y = Math.random() * 600; } 
        else if (side === 1) { x = 1200; y = Math.random() * 600; } 
        else if (side === 2) { y = 0; x = Math.random() * 1200; } 
        else if (side === 3) { y = 600; x = Math.random() * 1200; }

        const next_meteorite = {
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 5,
            vy: (Math.random() - 0.5) * 5,
            new_meteorite: element,
        };

        element.style.display = "block";
        document.querySelector('.world').appendChild(next_meteorite.new_meteorite);
        this.meteorites.push(next_meteorite);
    }

    range(a_x, a_y, b_x, b_y) {
        let distance_x = b_x - a_x;
        let distance_y = b_y - a_y;
        return Math.sqrt(distance_x * distance_x + distance_y * distance_y);
    }

    limit(thing, max_width, max_height) {
        if (thing.x > max_width) thing.x = 0;
        if (thing.y > max_height) thing.y = 0;
        if (thing.x < 0) thing.x = max_width;
        if (thing.y < 0) thing.y = max_height;
    }

    refresh_frame() {
        this.spaceship_move_x = this.spaceship_data.x - 600;
        this.spaceship_move_y = this.spaceship_data.y - 300;
    }
}

class View {
    constructor() {
        this.menu = document.querySelector('.menu');
        this.world = document.querySelector('.world');
        this.rate = document.querySelector('.header_rate');
        this.spaceship = document.querySelector('.spaceship');
    }

    hideMenu() { this.menu.style.display = 'none'; }

    render(model) {
        let tx = model.spaceship_data.x - 600;
        let ty = model.spaceship_data.y - 300;
        
        this.spaceship.setAttribute('transform', 
            `translate(${tx}, ${ty}) rotate(${model.spaceship_data.angle}, 600, 320)`);
        
        this.rate.innerText = model.score;
        if (model.score >= 200) this.world.style.background = "var(--blood)";
    }

    showAlert(score) {
        alert("GAME OVER! Score: " + score);
        location.reload();
    }
}

class Controller {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.keys = {};

        window.addEventListener('keydown', (e) => this.keys[e.key] = true);
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
        
        document.querySelector('.menu_button').addEventListener('click', () => {
            this.model.start = true;
            this.view.hideMenu();
        });

        this.init();
    }

    init() {
        this.model.create(); this.model.create(); this.model.create(); this.model.create();
        this.gameLoop();
    }

    gameLoop() {
        if (this.model.start) {
            this.update();
            this.view.render(this.model);
        }
        requestAnimationFrame(() => this.gameLoop());
    }

    update() {
        const data = this.model.spaceship_data;

        if (this.keys['ArrowUp']) this.model.applyBoost();
        if (this.keys['ArrowRight']) data.angle += 5;
        if (this.keys['ArrowLeft']) data.angle -= 5;
        if (this.keys[' ']) { this.model.shot(); this.keys[' '] = false; }

        this.model.bullets.forEach((bullet, bullet_index) => {
            bullet.x += bullet.vx;
            bullet.y += bullet.vy;
            bullet.new_bullet.setAttribute("cx", bullet.x);
            bullet.new_bullet.setAttribute("cy", bullet.y);

            this.model.meteorites.forEach((meteorite, meteorite_index) => {
                let distance = this.model.range(bullet.x, bullet.y, meteorite.x, meteorite.y);

                if (distance < 45) {
                    bullet.new_bullet.remove();
                    meteorite.new_meteorite.remove();
                    this.model.bullets.splice(bullet_index, 1);
                    this.model.meteorites.splice(meteorite_index, 1);
                    this.model.score += 100;
                    this.model.create();
                }
            });

            if (bullet.x < 0 || bullet.x > 1200 || bullet.y < 0 || bullet.y > 600) {
                bullet.new_bullet.remove();
                this.model.bullets.splice(bullet_index, 1);
            }
        });

        this.model.meteorites.forEach((meteorite) => {
            meteorite.x += meteorite.vx;
            meteorite.y += meteorite.vy;
            this.model.limit(meteorite, 1200, 600);
            
            let distance = this.model.range(data.x, data.y, meteorite.x, meteorite.y);

            if (distance < 60) {
                this.model.start = false;
                this.view.showAlert(this.model.score);
            }

            let move_x = meteorite.x - 100;
            let move_y = meteorite.y - 100; 
            meteorite.new_meteorite.setAttribute('transform', `translate(${move_x}, ${move_y})`);
        });

        data.x += data.vx;
        data.y += data.vy;
        data.vx *= 0.98;
        data.vy *= 0.98;
        this.model.limit(data, 1200, 600);
        this.model.refresh_frame();
    }
}

const app = new Controller(new Model(), new View());
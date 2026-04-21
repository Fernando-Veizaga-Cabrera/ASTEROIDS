const menu = document.querySelector('.menu');
const button = document.querySelector('.menu_button');
const world = document.querySelector('.world');
const rate = document.querySelector('.header_rate');
const spaceship = document.querySelector('.spaceship');
let score = 0;
let start = false;
let meteorites = [];
const bullets = [];
const spaceship_data = {
    vx : 0,
    vy : 0,
    x : 600,
    y : 300,
    angle : 0,
    boost : 0.12,
}
const keys = {
    ' ' : false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
}

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);
button.addEventListener('click', () => { start = true; menu.style.display = 'none'; });

function frame() {
    if (!start) {
        requestAnimationFrame(frame);
        return;
    }

    if (keys['ArrowUp']) {
        let radians = (spaceship_data.angle - 90) * (Math.PI / 180);
        spaceship_data.vx += Math.cos(radians) * spaceship_data.boost;
        spaceship_data.vy += Math.sin(radians) * spaceship_data.boost;
    }
    if (keys['ArrowRight']) {
        spaceship_data.angle += 5;
    }
    if (keys['ArrowLeft']) {
        spaceship_data.angle -= 5;
    }
    if (keys[' ']) {
        shot();
        keys[' '] = false;
    }

    bullets.forEach((bullet, bullet_index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.new_bullet.setAttribute("cx", bullet.x);
        bullet.new_bullet.setAttribute("cy", bullet.y);

        meteorites.forEach((meteorite, meteorite_index) => {
            let distance = range(bullet.x, bullet.y, meteorite.x, meteorite.y);

            if (distance < 45) {
                bullet.new_bullet.remove();
                meteorite.new_meteorite.remove();

                bullets.splice(bullet_index, 1);
                meteorites.splice(meteorite_index, 1);
                
                score += 100;
                rate.innerHTML = score;

                if (score >= 200) {
                    world.style.background = "var(--blood)";
                }

                create();
            }
        });
        
        if (bullet.x < 0 || bullet.x > 1200 || bullet.y < 0 || bullet.y > 600) {
            bullet.new_bullet.remove();
            bullets.splice(bullet_index, 1);
        }
    });

    meteorites.forEach((meteorite) => {
        meteorite.x += meteorite.vx;
        meteorite.y += meteorite.vy;
        limit(meteorite, 1200, 600);

        let distance = range(spaceship_data.x, spaceship_data.y, meteorite.x, meteorite.y);

        if (distance < 60) {
            start = false;
            alert("GAME OVER! Score: " + score);
            location.reload();
            return;
        }

        let move_x = meteorite.x - 100;
        let move_y = meteorite.y - 100; 
        meteorite.new_meteorite.setAttribute('transform', `translate(${move_x}, ${move_y})`);
});

    spaceship_data.x += spaceship_data.vx;
    spaceship_data.y += spaceship_data.vy;

    spaceship_data.vx *= 0.98;
    spaceship_data.vy *= 0.98;

    limit(spaceship_data, 1200, 600);

    refresh_frame();
    requestAnimationFrame(frame);
}

function refresh_frame() {
    let spaceship_move_x = spaceship_data.x - 600;
    let spaceship_move_y = spaceship_data.y - 300;

    spaceship.setAttribute('transform', `translate(${spaceship_move_x}, ${spaceship_move_y}) rotate(${spaceship_data.angle}, 600, 320)`);
}

function shot() {
    let radianes = (spaceship_data.angle - 90) * (Math.PI / 180);
    const template = document.querySelector('.bullet_hidden');
    const element = template.cloneNode(true);
    const next_bullet = {
        x : spaceship_data.x,
        y : spaceship_data.y,
        vx : Math.cos(radianes) * 10,
        vy : Math.sin(radianes) * 10,
        new_bullet : element,
    }

    element.style.display = "block";
    world.appendChild(next_bullet.new_bullet);
    bullets.push(next_bullet);
}

function create() {
    const template = document.querySelector('.meteorite');
    const element = template.cloneNode(true);
    let x, y;
    let side = Math.floor(Math.random() * 4);

    if (side === 0) {
        x = 0;
        y = Math.random() * 600;
    } else if (side === 1) {
        x = 1200;
        y = Math.random() * 600;
    } else if (side === 2) {
        y = 0;
        x = Math.random() * 1200;
    } else if (side === 3) {
        y = 600;
        x = Math.random() * 1200;
    }

    const next_meteorite = {
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5,
        new_meteorite : element,
    }

    element.style.display = "block";
    world.appendChild(next_meteorite.new_meteorite);
    meteorites.push(next_meteorite);
}

function range(a_x, a_y, b_x, b_y) {
    let distance_x = b_x - a_x;
    let distance_y = b_y - a_y;
    return Math.sqrt(distance_x * distance_x + distance_y * distance_y);
}

function limit(thing, max_width, max_height) {
    if (thing.x > max_width) { 
        thing.x = 0;
    }
    if (thing.y > max_height) { 
        thing.y = 0;
    }
    if (thing.x < 0) { 
        thing.x = max_width;
    }
    if (thing.y < 0) { 
        thing.y = max_height;
    }
}

create(); create(); create(); create();
refresh_frame();
frame();
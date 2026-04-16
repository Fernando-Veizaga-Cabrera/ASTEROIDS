const world = document.querySelector('.world');
const rate = document.querySelector('.header_rate');
const spaceship = document.querySelector('.spaceship');
const meteorite = document.querySelector('.meteorite');
let score = 0;
const bullets = [];
const spaceship_data = {
    x : 600,
    y : 300,
    angle : 0,
}
const meteorite_data = {
    vx : 2,
    vy : 2,
    x : 100,
    y : 100,
}
const keys = {
    ' ' : false,
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
}

window.addEventListener('keydown', (e) => keys[e.key] = true);
window.addEventListener('keyup', (e) => keys[e.key] = false);

function frame() {
    if (keys['ArrowUp']) {
        let radians = (spaceship_data.angle - 90) * (Math.PI / 180);
        spaceship_data.x += Math.cos(radians) * 5;
        spaceship_data.y += Math.sin(radians) * 5;
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

    bullets.forEach((bullet, index) => {
        bullet.x += bullet.vx;
        bullet.y += bullet.vy;
        bullet.new_bullet.setAttribute("cx", bullet.x);
        bullet.new_bullet.setAttribute("cy", bullet.y);

        let distance = range(bullet.x, bullet.y, meteorite_data.x, meteorite_data.y);

        if (distance < 45) {
            bullet.new_bullet.remove();
            bullets.splice(index, 1)
            smash();
        }
        
        if (bullet.x < 0 || bullet.x > 1200 || bullet.y < 0 || bullet.y > 600) {
            bullet.new_bullet.remove();
            bullets.splice(index, 1);
        }
    });

    meteorite_data.x += meteorite_data.vx;
    meteorite_data.y += meteorite_data.vy;

    limit(spaceship_data, 1200, 600);
    limit(meteorite_data, 1200, 600);

    refresh_frame();
    requestAnimationFrame(frame);
}

function refresh_frame() {
    let spaceship_move_x = spaceship_data.x - 600;
    let spaceship_move_y = spaceship_data.y - 300;

    spaceship.setAttribute('transform', `translate(${spaceship_move_x}, ${spaceship_move_y}) rotate(${spaceship_data.angle}, 600, 320)`);
    
    let meteorite_move_x = meteorite_data.x - 100;
    let meteorite_move_y = meteorite_data.y - 100;

    meteorite.setAttribute('transform', `translate(${meteorite_move_x}, ${meteorite_move_y})`);
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

function range(a_x, a_y, b_x, b_y) {
    let distance_x = b_x - a_x;
    let distance_y = b_y - a_y;
    return Math.sqrt(distance_x * distance_x + distance_y * distance_y);
}

function smash() {
    score += 100;
    rate.innerHTML = score;

    meteorite_data.x = Math.random() * 1200;
    meteorite_data.y = Math.random() * 600;
    meteorite_data.vx = (Math.random() - 0.5) * 10;
    meteorite_data.vy = (Math.random() - 0.5) * 10;
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

refresh_frame();
frame()
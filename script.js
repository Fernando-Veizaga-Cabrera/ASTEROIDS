const nave = document.getElementById('nave');
const asteroide = document.getElementById('asteroide');
const aceleracion = 0.2;
const velRotacion = 4;
const friccion = 0.98;
const teclas = {
    ArrowUp: false,
    ArrowLeft: false,
    ArrowRight: false,
};

let velX = 0;
let velY = 0;
let angulo = 0;
let naveX = 400;
let naveY = 300;
let asteroideX = 100;
let asteroideY = 100;

window.addEventListener('keydown', (e) => {
    if (teclas.hasOwnProperty(e.key)) teclas[e.key] = true;
});

window.addEventListener('keyup', (e) => {
    if (teclas.hasOwnProperty(e.key)) teclas[e.key] = false;
});

function actualizarJuego() {

    if (teclas.ArrowUp) {
        let radianes = (angulo - 90) * (Math.PI / 180); 
        velX += Math.cos(radianes) * aceleracion;
        velY += Math.sin(radianes) * aceleracion;
    }
    if (teclas.ArrowLeft)  angulo -= velRotacion;
    if (teclas.ArrowRight) angulo += velRotacion;

    if (asteroideX < 0) asteroideX = 800;
    if (asteroideY < 0) asteroideY = 600;
    if (asteroideX > 800) asteroideX = 0;
    if (asteroideY > 600) asteroideY = 0;

    if (naveX < 0)   naveX = 800;
    if (naveY < 0)   naveY = 600;
    if (naveX > 800) naveX = 0;
    if (naveY > 600) naveY = 0;

    velX *= friccion;
    velY *= friccion;
    naveX += velX;
    naveY += velY;

    asteroideX += 1;
    asteroideY += 0.5;

    asteroide.setAttribute('cx', asteroideX);
    asteroide.setAttribute('cy', asteroideY);
    nave.setAttribute('transform', `translate(${naveX}, ${naveY}) rotate(${angulo})`);

    requestAnimationFrame(actualizarJuego);
}

actualizarJuego();
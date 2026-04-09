const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Configuración de la resolución del juego clásico
canvas.width = 800;
canvas.height = 600;

// ==========================================
// EL GAME LOOP (BUCLE PRINCIPAL)
// ==========================================
function gameLoop() {
    // 1. Actualizar la lógica y físicas (posiciones, colisiones)
    update();

    // 2. Dibujar todo en el Canvas
    draw();

    // 3. Pedirle al navegador que ejecute esta función en el próximo frame
    requestAnimationFrame(gameLoop);
}

function update() {
    // Aquí calcularemos cómo se mueve la nave y los asteroides.
    // Por ahora está vacío.
}

function draw() {
    // A. Limpiar el canvas entero en cada frame
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // B. Texto de prueba para confirmar que funciona
    ctx.fillStyle = 'white';
    ctx.font = '20px "Courier New", Courier, monospace'; // Fuente retro
    ctx.textAlign = "center";
    ctx.fillText('Aqui es donde inicia la magia, espera nuestras actualizaciones futuras', canvas.width / 2, canvas.height / 2);
}

// Arrancar el motor por primera vez
gameLoop();
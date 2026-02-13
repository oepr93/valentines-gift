// ========== CONFIGURACIÓN INICIAL ==========
const canvas = document.getElementById('universe-canvas');
const effectsCanvas = document.getElementById('effects-canvas');
const constellationCanvas = document.getElementById('constellation-canvas');
const ctx = canvas.getContext('2d');
const effectsCtx = effectsCanvas.getContext('2d');
const constellationCtx = constellationCanvas ? constellationCanvas.getContext('2d') : null;
let stars = [];
let particles = [];

const isMobile = window.innerWidth < 768;
let constellationRafId = null;
// Reducir estrellas drásticamente en móvil
const numStars = isMobile ? 50 : 150;

// Fecha de inicio de la relación
const relationshipStart = new Date('2025-12-06T00:00:00');

let isPaused = false;


// ========== CONFIGURACIÓN DE CANVAS ==========
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    effectsCanvas.width = window.innerWidth;
    effectsCanvas.height = window.innerHeight;
    if (constellationCanvas) {
        constellationCanvas.width = window.innerWidth;
        constellationCanvas.height = window.innerHeight;
    }
    const DPR = Math.min(window.devicePixelRatio || 1, 1.25);

    canvas.width = Math.floor(window.innerWidth * DPR);
    canvas.height = Math.floor(window.innerHeight * DPR);
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// ========== CONTADOR DE DÍAS JUNTOS ==========
function updateDaysCounter() {
    const now = new Date();
    const diff = now - relationshipStart;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const daysEl = document.getElementById('days');
    const hoursEl = document.getElementById('hours');
    const minutesEl = document.getElementById('minutes');
    const secondsEl = document.getElementById('seconds');

    if (daysEl) daysEl.textContent = days;
    if (hoursEl) hoursEl.textContent = hours;
    if (minutesEl) minutesEl.textContent = minutes;
    if (secondsEl) secondsEl.textContent = seconds;
}

// ========== CONSTELACIÓN PERSONALIZADA (14 NOV 2025, MEDELLÍN) ==========
function createConstellation() {
    if (!constellationCtx) return;

    // Estrellas reales visibles en Medellín el 14 de noviembre de 2025
    // Coordenadas aproximadas para crear las iniciales S y O
    const constellationStars = [
        // Letra S
        { x: 0.25, y: 0.3, brightness: 1, size: 4 },
        { x: 0.27, y: 0.32, brightness: 0.9, size: 3 },
        { x: 0.29, y: 0.34, brightness: 1, size: 3.5 },
        { x: 0.28, y: 0.36, brightness: 0.9, size: 3 },
        { x: 0.26, y: 0.38, brightness: 1, size: 3.5 },
        { x: 0.28, y: 0.40, brightness: 0.9, size: 3 },
        { x: 0.30, y: 0.42, brightness: 1, size: 4 },

        // Letra O (corazón)
        { x: 0.70, y: 0.28, brightness: 1, size: 4 },
        { x: 0.68, y: 0.32, brightness: 1, size: 3.5 },
        { x: 0.67, y: 0.36, brightness: 0.9, size: 3 },
        { x: 0.68, y: 0.40, brightness: 1, size: 3.5 },
        { x: 0.70, y: 0.44, brightness: 1, size: 4 },
        { x: 0.72, y: 0.40, brightness: 1, size: 3.5 },
        { x: 0.73, y: 0.36, brightness: 0.9, size: 3 },
        { x: 0.72, y: 0.32, brightness: 1, size: 3.5 },

        // Estrellas conectoras (formando línea de corazón)
        { x: 0.40, y: 0.35, brightness: 0.7, size: 2.5 },
        { x: 0.48, y: 0.33, brightness: 0.8, size: 2.8 },
        { x: 0.56, y: 0.35, brightness: 0.7, size: 2.5 },
    ];

    const width = constellationCanvas.width;
    const height = constellationCanvas.height;

    // Animación de parpadeo
    let twinklePhase = 0;

    function animateConstellation() {
        constellationCtx.clearRect(0, 0, width, height);

        // Dibujar las estrellas de la constelación
        constellationStars.forEach((star, index) => {
            const x = star.x * width;
            const y = star.y * height;

            // Efecto de parpadeo sutil
            const twinkle = Math.sin(twinklePhase + index * 0.5) * 0.2 + 0.8;
            const currentBrightness = star.brightness * twinkle;

            // Anillo de brillo exterior
            constellationCtx.beginPath();
            constellationCtx.arc(x, y, star.size * 3, 0, Math.PI * 2);
            const outerGradient = constellationCtx.createRadialGradient(x, y, 0, x, y, star.size * 3);
            outerGradient.addColorStop(0, `rgba(255, 220, 180, ${currentBrightness * 0.3})`);
            outerGradient.addColorStop(1, 'rgba(255, 220, 180, 0)');
            constellationCtx.fillStyle = outerGradient;
            constellationCtx.fill();

            // Estrella principal con brillo intenso
            constellationCtx.beginPath();
            constellationCtx.arc(x, y, star.size, 0, Math.PI * 2);
            constellationCtx.fillStyle = `rgba(255, 255, 255, ${currentBrightness})`;
            constellationCtx.shadowBlur = 25;
            constellationCtx.shadowColor = `rgba(255, 220, 150, ${currentBrightness})`;
            constellationCtx.fill();

            // Efecto de destello para estrellas principales
            if (star.brightness >= 0.9) {
                constellationCtx.beginPath();
                constellationCtx.arc(x, y, star.size * 2.5, 0, Math.PI * 2);
                const glowGradient = constellationCtx.createRadialGradient(x, y, 0, x, y, star.size * 2.5);
                glowGradient.addColorStop(0, `rgba(255, 255, 255, ${currentBrightness * 0.4})`);
                glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
                constellationCtx.fillStyle = glowGradient;
                constellationCtx.fill();

                // Cruz de luz
                constellationCtx.strokeStyle = `rgba(255, 255, 255, ${currentBrightness * 0.6})`;
                constellationCtx.lineWidth = 1;
                constellationCtx.shadowBlur = 15;
                constellationCtx.beginPath();
                constellationCtx.moveTo(x - star.size * 4, y);
                constellationCtx.lineTo(x + star.size * 4, y);
                constellationCtx.moveTo(x, y - star.size * 4);
                constellationCtx.lineTo(x, y + star.size * 4);
                constellationCtx.stroke();
            }
        });

        // Dibujar líneas conectoras brillantes
        constellationCtx.strokeStyle = `rgba(255, 220, 150, ${0.5 + Math.sin(twinklePhase) * 0.2})`;
        constellationCtx.lineWidth = 1.5;
        constellationCtx.shadowBlur = 10;
        constellationCtx.shadowColor = 'rgba(255, 220, 150, 0.8)';

        // Conectar S
        constellationCtx.beginPath();
        for (let i = 0; i < 7; i++) {
            const x = constellationStars[i].x * width;
            const y = constellationStars[i].y * height;
            if (i === 0) {
                constellationCtx.moveTo(x, y);
            } else {
                constellationCtx.lineTo(x, y);
            }
        }
        constellationCtx.stroke();

        // Conectar O (cerrado)
        constellationCtx.beginPath();
        for (let i = 7; i <= 14; i++) {
            const x = constellationStars[i].x * width;
            const y = constellationStars[i].y * height;
            if (i === 7) {
                constellationCtx.moveTo(x, y);
            } else {
                constellationCtx.lineTo(x, y);
            }
        }
        constellationCtx.closePath();
        constellationCtx.stroke();

        // Texto brillante de fecha
        constellationCtx.shadowBlur = 20;
        constellationCtx.shadowColor = 'rgba(255, 220, 150, 0.8)';
        constellationCtx.font = '16px Montserrat';
        constellationCtx.fillStyle = `rgba(255, 255, 255, ${0.7 + Math.sin(twinklePhase) * 0.2})`;
        constellationCtx.textAlign = 'center';
        constellationCtx.fillText('✨ 14 de Noviembre, 2025 - Medellín ✨', width / 2, height - 40);

        constellationCtx.font = '14px Dancing Script';
        constellationCtx.fillStyle = `rgba(255, 200, 150, ${0.6 + Math.sin(twinklePhase) * 0.2})`;
        constellationCtx.fillText('El cielo de la noche que nos conocimos', width / 2, height - 15);

        twinklePhase += 0.02;
        constellationRafId = requestAnimationFrame(animateConstellation);
    }

    // Iniciar la animación siempre
    if (!constellationRafId) animateConstellation();

}

// ========== CORAZONES FLOTANTES CON "TE AMO" EN MÚLTIPLES IDIOMAS ==========
const teAmoIdiomas = [
    "Te amo", // Español
    "I love you", // Inglés
    "Je t'aime", // Francés
    "Ti amo", // Italiano
    "Ich liebe dich", // Alemán
    "Eu te amo", // Portugués
    "愛してる (Aishiteru)", // Japonés
    "사랑해 (Saranghae)", // Coreano
    "我爱你 (Wǒ ài nǐ)", // Chino
    "Я люблю тебя (Ya lyublyu tebya)", // Ruso
    "Σ'αγαπώ (S'agapo)", // Griego
    "אני אוהב אותך (Ani ohev otakh)", // Hebreo
    "أحبك (Uhibbuk)", // Árabe
    "Mahal kita", // Tagalog
    "Nakupenda", // Swahili
    "Te iubesc", // Rumano
    "Kocham cię", // Polaco
    "Ik hou van jou", // Holandés
    "Jag älskar dig", // Sueco
    "Jeg elsker deg", // Noruego
    "Rakastan sinua", // Finlandés
    "Miluji tě", // Checo
    "Szeretlek", // Húngaro
    "Volim te", // Croata
    "Σε αγαπώ (Se agapó)", // Griego moderno
    "사랑합니다 (Saranghamnida)", // Coreano formal
    "Aloha au iā 'oe", // Hawaiano
    "Bahibak", // Árabe dialectal
    "Main tumse pyar karta hoon", // Hindi
    "আমি তোমায় ভালোবাসি (Ami tomay bhalobashi)" // Bengalí
];

class FloatingHeart {
    constructor() {
        this.x = Math.random() * window.innerWidth;
        this.y = window.innerHeight + 100;
        this.targetY = Math.random() * (window.innerHeight - 200) - 100;
        this.speed = Math.random() * 2 + 1;
        this.sway = Math.random() * 2 - 1;
        this.size = Math.random() * 30 + 20;
        this.opacity = 0;
        this.fadeInSpeed = 0.02;
        this.maxOpacity = Math.random() * 0.4 + 0.6;
        this.text = teAmoIdiomas[Math.floor(Math.random() * teAmoIdiomas.length)];
        this.rotation = Math.random() * 20 - 10;
        this.element = this.createElement();
    }

    createElement() {
        const heart = document.createElement('div');
        heart.className = 'floating-heart-love';
        heart.innerHTML = `
            <div class="heart-symbol">❤️</div>
            <div class="heart-text">${this.text}</div>
        `;
        heart.style.cssText = `
            position: fixed;
            left: ${this.x}px;
            top: ${this.y}px;
            font-size: ${this.size}px;
            opacity: ${this.opacity};
            transform: rotate(${this.rotation}deg);
            pointer-events: none;
            z-index: 1205;
            text-align: center;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(heart);
        return heart;
    }

    update() {
        // Subir
        this.y -= this.speed;
        
        // Balanceo horizontal
        this.x += Math.sin(this.y * 0.01) * this.sway;
        
        // Fade in hasta llegar a la posición objetivo
        if (this.y > this.targetY && this.opacity < this.maxOpacity) {
            this.opacity += this.fadeInSpeed;
        }
        
        // Fade out cuando pasa el objetivo
        if (this.y < this.targetY) {
            this.opacity -= this.fadeInSpeed * 2;
        }
        
        // Actualizar posición y opacidad
        this.element.style.left = this.x + 'px';
        this.element.style.top = this.y + 'px';
        this.element.style.opacity = this.opacity;
        
        // Retornar true si debe eliminarse
        return this.opacity <= 0 || this.y < -100;
    }

    remove() {
        this.element.remove();
    }
}

let floatingHearts = [];
let heartsAnimationId = null;
let isHeartsActive = false;
let heartsCreateInterval = null;

function startFloatingHearts() {
    if (isHeartsActive) return;
    isHeartsActive = true;
    
    // Crear nuevos corazones periódicamente
    heartsCreateInterval = setInterval(() => {
        if (!isHeartsActive) {
            clearInterval(heartsCreateInterval);
            return;
        }
        
        // Crear 2-3 corazones a la vez
        const count = Math.random() > 0.3 ? 3 : 2;
        for (let i = 0; i < count; i++) {
            floatingHearts.push(new FloatingHeart());
        }
    }, 1200); // Cada 1.2 segundos
    
    // Animación de actualización
    function animateHearts() {
        if (!isHeartsActive) {
            heartsAnimationId = null;
            return;
        }
        
        // Actualizar y filtrar corazones
        floatingHearts = floatingHearts.filter(heart => {
            const shouldRemove = heart.update();
            if (shouldRemove) {
                heart.remove();
                return false;
            }
            return true;
        });
        
        heartsAnimationId = requestAnimationFrame(animateHearts);
    }
    
    animateHearts();
}

function stopFloatingHearts() {
    isHeartsActive = false;
    
    // Eliminar todos los corazones
    floatingHearts.forEach(heart => heart.remove());
    floatingHearts = [];
    
    if (heartsAnimationId) {
        cancelAnimationFrame(heartsAnimationId);
        heartsAnimationId = null;
    }
    
    if (heartsCreateInterval) {
        clearInterval(heartsCreateInterval);
        heartsCreateInterval = null;
    }
}

// Función para mostrar la sección
function mostrarTeAmoIdiomas() {
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) {
        loveLetter.classList.add('hidden');
        loveLetter.style.zIndex = '900';
    }

    setTimeout(() => {
        const teAmoSection = document.getElementById('te-amo-idiomas-section');
        if (teAmoSection) {
            teAmoSection.classList.remove('hidden');
            teAmoSection.style.zIndex = '1200';
            
            // Iniciar los corazones flotantes
            startFloatingHearts();
        }
    }, 300);
}

// Función para cerrar la sección
function cerrarTeAmoIdiomas() {
    const teAmoSection = document.getElementById('te-amo-idiomas-section');
    if (teAmoSection) {
        teAmoSection.classList.add('hidden');
        teAmoSection.style.zIndex = '900';
    }
    
    // Detener los corazones
    stopFloatingHearts();
    
    // Volver a mostrar la carta
    setTimeout(() => {
        const loveLetter = document.getElementById('love-letter');
        if (loveLetter) {
            loveLetter.classList.remove('hidden');
            loveLetter.style.zIndex = '1000';
        }
    }, 300);
}

// ========== CLASE ESTRELLA ROMÁNTICA ==========
class Star {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.radius = Math.random() * 1.2 + 0.3;
        this.velocity = {
            x: (Math.random() - 0.5) * 0.05,
            y: Math.random() * 0.3 + 0.1
        };
        this.opacity = Math.random() * 0.5 + 0.3;
        this.twinkleSpeed = Math.random() * 0.02 + 0.01;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.isHeart = Math.random() > 0.85;
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);

        if (this.isHeart) {
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = `rgba(255, 107, 157, ${this.opacity})`;
            ctx.beginPath();
            ctx.moveTo(0, -this.radius);
            ctx.bezierCurveTo(
                this.radius * 2, -this.radius * 2,
                this.radius * 2, this.radius,
                0, this.radius * 2
            );
            ctx.bezierCurveTo(
                -this.radius * 2, this.radius,
                -this.radius * 2, -this.radius * 2,
                0, -this.radius
            );
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(255, 255, 255, ${this.opacity * 0.5})`;
            ctx.fill();
        }

        ctx.restore();
    }

    update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;

        this.twinklePhase += this.twinkleSpeed;
        this.opacity = 0.3 + Math.sin(this.twinklePhase) * 0.2;

        if (this.y > canvas.height) {
            this.reset();
        }
    }

    reset() {
        this.x = Math.random() * canvas.width;
        this.y = -10;
        this.velocity.y = Math.random() * 0.3 + 0.1;
        this.isHeart = Math.random() > 0.85;
    }
}

// ========== PARTÍCULAS ESPECIALES ==========
class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 1;
        this.speedX = Math.random() * 2 - 1;
        this.speedY = Math.random() * 2 - 1;
        this.life = 100;
        this.color = Math.random() > 0.5 ? '#ff6b9d' : '#ffcc00';
        this.type = Math.random() > 0.7 ? 'heart' : 'circle';
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.life--;
        this.size *= 0.97;
    }

    draw() {
        effectsCtx.save();
        effectsCtx.translate(this.x, this.y);

        if (this.type === 'heart') {
            effectsCtx.fillStyle = this.color;
            effectsCtx.beginPath();
            effectsCtx.moveTo(0, -this.size / 2);
            effectsCtx.bezierCurveTo(
                this.size, -this.size,
                this.size, this.size / 2,
                0, this.size
            );
            effectsCtx.bezierCurveTo(
                -this.size, this.size / 2,
                -this.size, -this.size,
                0, -this.size / 2
            );
            effectsCtx.fill();
        } else {
            effectsCtx.fillStyle = this.color;
            effectsCtx.beginPath();
            effectsCtx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
            effectsCtx.fill();
        }

        effectsCtx.restore();
    }
}

// ========== 52 RAZONES POR LAS QUE TE AMO ==========
const razones52 = [
    "Entre tantas personas en el mundo, tú me viste a mí de verdad",
    "Porque no solo eres increíble, eres real conmigo",
    "Amo tu alma, esa que pocos conocen pero yo tengo el privilegio de abrazar",
    "Tu forma de ver la vida me enseña a sentir más profundo",
    "Mientras otros ven lo que muestras al mundo, yo veo a Sarah, la que respira detrás de la pantalla",
    "Tu sonrisa tiene el poder de desarmar todos mis miedos",
    "Tus ojos no solo brillan, cuentan historias que quiero escuchar toda mi vida",
    "Porque incluso en la distancia, haces que todo se sienta cercano",
    "Contigo aprendí que 'hogar' no es un lugar, es una persona",
    "Tu risa es mi sonido favorito en todo el universo",
    "Amo cómo sientes todo con intensidad y sin miedo",
    "Tu fuerza silenciosa me inspira a ser mejor hombre",
    "Porque me elegiste… y sigues eligiéndome",
    "Amo cuando bajas las defensas y solo eres tú",
    "Tu forma de moverte cuando estás feliz, sin darte cuenta",
    "Porque me enseñaste que el amor no es perfecto, es verdadero",
    "Tus abrazos son mi lugar seguro aunque estén hechos de kilómetros",
    "Amo cómo dices mi nombre, como si tuviera un significado distinto",
    "Tu pasión, esa que te hace brillar cuando hablas de lo que amas",
    "Porque ves en mí cosas que yo aún estoy aprendiendo a reconocer",
    "Amo tus pequeñas manías, incluso cuando finges que no las tienes",
    "Tu voz cuando me dices 'te amo' cambia completamente mi día",
    "Porque compartes tus sueños conmigo como si ya fueran nuestros",
    "Amo tu valentía de sentir, incluso cuando da miedo",
    "Tu manera de cuidarme cuando mi mente se llena de dudas",
    "Porque eres mi persona favorita en cualquier universo posible",
    "Amo cómo me haces sentir importante sin intentarlo",
    "Tu inteligencia… no solo la que piensa, sino la que entiende",
    "Porque contigo el tiempo no pesa, fluye",
    "Amo tu espontaneidad cuando decides abrir el corazón",
    "Tu apoyo incluso cuando el mundo me pesa encima",
    "Porque me haces querer construir un futuro, no solo soñarlo",
    "Amo cómo te sonrojas cuando te digo algo que te toca el alma",
    "Tu determinación incluso cuando nadie más la nota",
    "Porque eres mi 505, el lugar al que siempre quiero volver",
    "Amo imaginar tus abrazos en las mañanas que aún no vivimos",
    "Tu forma de entender mis silencios",
    "Porque contigo aprendí que el amor puede ser paciente",
    "Amo tus mensajes inesperados que llegan justo cuando los necesito",
    "Tu capacidad de tocar mi corazón sin tocarme físicamente",
    "Porque eres mi mejor amiga y mi amor al mismo tiempo",
    "Amo cómo te preocupas por los demás, incluso cuando estás cansada",
    "Tu corazón tan grande que a veces no cabe en tu pecho",
    "Porque incluso en días difíciles, sigues intentando",
    "Amo que me incluyas en tus planes, aunque el mundo aún no lo sepa",
    "Tu forma de bailar cuando te sientes libre",
    "Porque eres esa oración que nunca supe cómo pedir pero siempre necesité",
    "Amo cómo te emocionas cuando estoy hablando de algo que me apasiona",
    "Tu paciencia conmigo cuando mis miedos quieren sabotearme",
    "Porque nuestra historia no fue fácil… y aun así aquí estamos",
    "Amo que seamos Sarah y Octavio, sin máscaras, sin filtros",
    "Porque contigo quiero elegir el amor todos los días, por siempre"
];


let razonesShown = [];
let favoriteReasons = [];
let specialReasonShown = false;
let currentReasonCounter = 0; // Nuevo contador secuencial

function mostrarNuevaRazon() {
    const cardNumber = document.getElementById('current-card-number');
    const cardText = document.getElementById('current-card-text');
    const cardsShown = document.getElementById('cards-shown');
    const cardFront = document.querySelector('.card-front');

    // --- ESCENARIO 1: YA SE MOSTRÓ LA CARTA INFINITA, REINICIAR ---
    if (currentReasonCounter >= razones52.length && specialReasonShown) {
        razonesShown = [];
        specialReasonShown = false;
        currentReasonCounter = 0; // Resetear contador

        // Resetear estilos visuales
        if (cardFront) {
            cardFront.classList.remove('infinity-card');
            cardFront.classList.remove('gold-glow');
        }
        alert("¡Volvamos a empezar! 💕");
        mostrarNuevaRazon(); // Mostrar la primera de nuevo inmediatamente
        return;
    }

    // --- ESCENARIO 2: SE ACABARON LAS 52, MOSTRAR LA INFINITA ---
    if (currentReasonCounter >= razones52.length && !specialReasonShown) {
        specialReasonShown = true;

        // Animación de salida
        cardText.style.opacity = '0';
        cardText.style.transform = 'rotateY(90deg)';

        setTimeout(() => {
            // CAMBIOS VISUALES PARA LA CARTA FINAL
            if (cardNumber) cardNumber.innerHTML = '∞'; // Símbolo infinito
            if (cardFront) {
                cardFront.classList.add('infinity-card');
                cardFront.classList.add('gold-glow');
            }

            // EL MENSAJE FINAL
            cardText.innerHTML = `
                <span class="infinity-title">Y aun así...</span><br><br>
                Me faltarían vidas para terminar de escribir todas las razones por las que te amo.<br>
                Mi amor por ti no tiene número final.<br>
                <br>Es infinito. ✨
            `;

            // Animación de entrada
            cardText.style.opacity = '1';
            cardText.style.transform = 'rotateY(0deg)';

            // Lluvia masiva de partículas doradas
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;
            for (let i = 0; i < 100; i++) {
                setTimeout(() => createParticles(centerX, centerY, 2), i * 20);
            }
        }, 300);

        return;
    }

    // --- ESCENARIO 3: MOSTRAR CARTA NORMAL (1-52) SECUENCIALMENTE ---
    // Asegurarse de quitar estilos especiales si veníamos de la infinita
    if (cardFront) cardFront.classList.remove('infinity-card');

    // Usar el contador secuencial en lugar de aleatorio
    const currentIndex = currentReasonCounter;

    // Agregar a las mostradas
    if (!razonesShown.includes(currentIndex)) {
        razonesShown.push(currentIndex);
    }

    // Incrementar contador para la siguiente
    currentReasonCounter++;

    if (cardNumber) cardNumber.textContent = currentReasonCounter;
    if (cardText) {
        cardText.textContent = razones52[currentIndex];

        // Animación de flip standard
        cardText.style.opacity = '0';
        cardText.style.transform = 'rotateY(90deg)';

        setTimeout(() => {
            cardText.style.opacity = '1';
            cardText.style.transform = 'rotateY(0deg)';
        }, 300);
    }
    if (cardsShown) cardsShown.textContent = `${currentReasonCounter}`;

    // Partículas normales
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    for (let i = 0; i < 10; i++) {
        createParticles(centerX, centerY, 1);
    }
}

function marcarFavorita() {
    if (currentReasonCounter === 0) return;

    const currentReasonIndex = currentReasonCounter - 1; // Usar el contador - 1 porque ya se incrementó
    const reason = razones52[currentReasonIndex];

    if (!favoriteReasons.includes(reason)) {
        favoriteReasons.push(reason);

        const favoritesSection = document.getElementById('favorites-section');
        const favoritesList = document.getElementById('favorites-list');

        if (favoritesSection) favoritesSection.classList.remove('hidden');

        const favItem = document.createElement('div');
        favItem.className = 'favorite-item';
        favItem.innerHTML = `<i class="fas fa-star"></i> ${reason}`;
        favoritesList.appendChild(favItem);

        // Notificación visual
        alert("💕 ¡Añadida a favoritas!");
    } else {
        alert("Esta razón ya está en tus favoritas 💕");
    }
}

// ========== MENSAJES DE CÁPSULA DEL TIEMPO ==========
const capsulaMessages = [
    {
        title: "Para Cada Día",
        content: `<h3>Mi Amor Diario Para Ti</h3>
                 <p>Sarah, prometo elegirte cada día. No solo una vez, sino en cada momento, en cada decisión, en cada respiración.</p>
                 <p>Prometo hacerte sentir amada. Que nunca, ni por un segundo, dudes de cuánto significas para mí.</p>
                 <p>Prometo cuidarte, protegerte, y estar a tu lado en cada paso de este camino.</p>
                 <p class="signature">❤️ Tu Octavio</p>`
    },
    {
        title: "En Los Días Difíciles",
        content: `<h3>Cuando El Mundo No Entienda</h3>
                 <p>Mi amor, sé que como modelo muchas personas te ven, te juzgan, te demandan. Pero quiero que sepas algo:</p>
                 <p><strong>Yo te admiro.</strong> Admiro tu valentía, tu autenticidad, tu fuerza para ser quien eres.</p>
                 <p>Mientras otros ven números y seguidores, yo veo a la mujer más increíble del mundo. Veo tu alma, tu corazón, tu esencia verdadera.</p>
                 <p>Cuando el mundo te critique, recuerda que tienes a alguien que te ama por quien realmente eres.</p>
                 <p class="signature">Siempre contigo, Octavio 💕</p>`
    },
    {
        title: "Para Nuestro Futuro",
        content: `<h3>Nuestros Sueños Por Cumplir</h3>
                 <p>Sarah, cuando leas esto, quiero que imagines todo lo que viviremos juntos:</p>
                 <p>🌍 Los lugares que conoceremos juntos<br>
                 💑 Las aventuras que compartiremos<br>
                 🏡 El hogar que construiremos<br>
                 ⭐ Los sueños que haremos realidad</p>
                 <p>Cada día contigo es un regalo. Cada momento a tu lado es un sueño hecho realidad.</p>
                 <p>Y apenas estamos comenzando nuestra historia.</p>
                 <p class="signature">Con todo mi amor, tu Octavio ♾️</p>`
    },
    {
        title: "Mi Promesa Eterna",
        content: `<h3>Sarah y Octavio, Por Siempre y Para Siempre</h3>
                 <p>Entre tantas personas en este mundo, entre millones de almas, tú me viste. Y yo te vi a ti.</p>
                 <p>No solo vi a la influencer que todos conocen. Vi más allá. Vi a Sarah.</p>
                 <p>Vi a la mujer que se ríe con todo el corazón, que sueña en grande, que ama con intensidad.</p>
                 <p>Vi a mi persona favorita. Vi al amor de mi vida.</p>
                 <p><strong>Esta es mi promesa:</strong> Verte siempre así. Ver tu alma, tu esencia, tu verdadero ser.</p>
                 <p>Elegirte en cada amanecer. Amarte en cada atardecer.</p>
                 <p>Sarah y Octavio. Por siempre y para siempre.</p>
                 <p class="signature">Tuyo eternamente, Octavio 💕✨</p>`
    }
];

function abrirMensaje(element, index) {
    const modal = document.getElementById('capsule-modal');
    const modalBody = document.getElementById('capsule-modal-body');

    if (modal && modalBody) {
        modalBody.innerHTML = capsulaMessages[index].content;
        modal.classList.remove('hidden');

        // Animación de apertura
        element.classList.add('opened');

        // Partículas de celebración
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 50; i++) {
            createParticles(centerX, centerY, 1);
        }
    }
}

function cerrarModal() {
    const modal = document.getElementById('capsule-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// ========== FUNCIONES PRINCIPALES ==========
function initUniverse() {
    stars = [];
    for (let i = 0; i < numStars; i++) {
        stars.push(new Star());
    }
}

function createParticles(x, y, count = 10) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y));
    }
}

function createLoveMessage() {
    const messages = [
        "Te amo, Sarah",
        "Eres mi todo",
        "Mi corazón es tuyo",
        "Para siempre",
        "Mi 505",
        "Eres perfecta",
        "Mi sueño hecho realidad",
        "Sarah y Octavio ♾️",
        "Mi persona favorita",
        "Entre tantas, tú me viste"
    ];

    const message = messages[Math.floor(Math.random() * messages.length)];
    const messageEl = document.createElement('div');
    messageEl.className = 'floating-message';
    messageEl.textContent = message;
    messageEl.style.left = `${Math.random() * 80 + 10}%`;
    messageEl.style.fontSize = `${Math.random() * 0.5 + 1.2}rem`;

    document.getElementById('floating-love-messages').appendChild(messageEl);

    setTimeout(() => {
        messageEl.remove();
    }, 15000);
}

function animate() {

    if (isPaused) {
        requestAnimationFrame(animate);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effectsCtx.clearRect(0, 0, effectsCanvas.width, effectsCanvas.height);

    stars.forEach(star => {
        star.update();
        star.draw();
    });

    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }

    requestAnimationFrame(animate);
}

// ========== FUNCIONALIDADES INTERACTIVAS ==========
function iniciarUniverso() {
    console.log("Función iniciarUniverso() ejecutada");

    const heart = document.querySelector('.heart');
    const heartContainer = document.getElementById('heart-container');

    if (!heart) {
        console.error("No se pudo encontrar el corazón");
        return;
    }

    heart.style.pointerEvents = 'none';
    heartContainer.style.pointerEvents = 'none';
    heart.style.cursor = 'default';
    heartContainer.style.zIndex = '1';

    heart.style.transform = 'rotate(-45deg) scale(1.5)';
    heart.style.opacity = '0.3';

    const heartX = window.innerWidth / 2;
    const heartY = window.innerHeight / 2;

    console.log(`Creando explosión en posición: ${heartX}, ${heartY}`);

    for (let i = 0; i < 100; i++) {
        createParticles(heartX, heartY, 1);
    }

    const music = document.getElementById('valentines-song');
    if (music) {
        music.volume = 0.2;
        music.play().then(() => {
            console.log("Música reproducida correctamente");
        }).catch(error => {
            console.log("Esperando interacción del usuario para audio:", error);
            document.addEventListener('click', function playAudioOnce() {
                music.play();
                document.removeEventListener('click', playAudioOnce);
            }, { once: true });
        });
    }

    setTimeout(() => {
        if (heartContainer) {
            heartContainer.style.opacity = '0';
            heartContainer.style.visibility = 'hidden';
            heartContainer.style.transform = 'translate(-50%, -50%) scale(0)';
        }

        initUniverse();
        animate();

        // Mostrar contador de días
        const daysCounter = document.getElementById('days-counter');
        if (daysCounter) {
            daysCounter.classList.remove('hidden');
            setInterval(updateDaysCounter, 1000);
            updateDaysCounter();
        }

        // Crear y animar constelación
        createConstellation();

        setTimeout(() => {
            const loveLetter = document.getElementById('love-letter');
            if (loveLetter) {
                loveLetter.classList.remove('hidden');
                loveLetter.style.zIndex = '1000';
                console.log("Carta de amor mostrada");
            }

            setTimeout(() => {
                const floatingPhoto = document.getElementById('special-photo-floating');
                if (floatingPhoto) {
                    floatingPhoto.classList.remove('hidden');
                    floatingPhoto.style.zIndex = '9999';
                    console.log("Foto flotante mostrada");
                }

                setInterval(createLoveMessage, 3000);
                createLoveMessage();

            }, 2000);
        }, 1000);
    }, 800);
}

function mostrarNuestrosMomentos() {
    isPaused = true;
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) {
        loveLetter.classList.add('hidden');
        loveLetter.style.zIndex = '900';
    }

    setTimeout(() => {
        const momentsGallery = document.getElementById('moments-gallery');
        if (momentsGallery) {
            momentsGallery.classList.remove('hidden');
            momentsGallery.style.zIndex = '1200';
        }
    }, 300);
}

function mostrarPromesas() {
    isPaused = true;
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) {
        loveLetter.classList.add('hidden');
        loveLetter.style.zIndex = '900';
    }

    setTimeout(() => {
        const promisesContainer = document.getElementById('promises-container');
        if (promisesContainer) {
            promisesContainer.classList.remove('hidden');
            promisesContainer.style.zIndex = '1200';
        }
    }, 300);
}

function mostrar52Razones() {
    isPaused = true;
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) {
        loveLetter.classList.add('hidden');
        loveLetter.style.zIndex = '900';
    }

    setTimeout(() => {
        const reasons52 = document.getElementById('reasons-52');
        if (reasons52) {
            reasons52.classList.remove('hidden');
            reasons52.style.zIndex = '1200';
        }
    }, 300);
}

function mostrarCapsulaDelTiempo() {
    isPaused = true;
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) {
        loveLetter.classList.add('hidden');
        loveLetter.style.zIndex = '900';
    }

    setTimeout(() => {
        const timeCapsule = document.getElementById('time-capsule');
        if (timeCapsule) {
            timeCapsule.classList.remove('hidden');
            timeCapsule.style.zIndex = '1200';
        }
    }, 300);
}

function mostrarHiloRojo() {
    isPaused = true;
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) {
        loveLetter.classList.add('hidden');
        loveLetter.style.zIndex = '900';
    }

    setTimeout(() => {
        const redThreadMap = document.getElementById('red-thread-map');
        if (redThreadMap) {
            redThreadMap.classList.remove('hidden');
            redThreadMap.style.zIndex = '1200';
            drawRedThread();
        }
    }, 300);
}

function drawRedThread() {
    // Verificar si Globe está cargado
    if (typeof Globe === 'undefined') {
        console.error("Librería Globe.gl no cargada");
        return;
    }

    const container = document.getElementById('globe-container');
    if (!container) return;

    // Limpiar contenedor por si se abre dos veces
    container.innerHTML = '';

    // Datos de las ciudades
    const places = [
        { name: "CDMX (Octavio)", lat: 19.4326, lng: -99.1332, color: '#4169e1', size: 1.2 },
        { name: "Medellín (Sarah)", lat: 6.2476, lng: -75.5658, color: '#ff1493', size: 1.2 }
    ];

    // Datos del arco (Hilo Rojo)
    const arcs = [{
        startLat: 19.4326,
        startLng: -99.1332,
        endLat: 6.2476,
        endLng: -75.5658,
        color: ['#ff1493', '#ffd700', '#ff1493']
    }];

    // Inicializar el Globo
    const world = Globe()
        (container)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg') // Textura nocturna
        .backgroundColor('rgba(0,0,0,0)') // Fondo transparente
        .width(container.offsetWidth)
        .height(container.offsetHeight)
        .arcsData(arcs)
        .arcColor('color')
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(1500) // Animación del hilo viajando
        .arcStroke(3)
        .arcAltitudeAutoScale(0.3)
        .pointsData(places)
        .pointColor('color')
        .pointAltitude(0.05)
        .pointRadius(d => d.size)
        .labelsData(places)
        .labelLat(d => d.lat)
        .labelLng(d => d.lng)
        .labelText(d => d.name)
        .labelSize(1.8)
        .labelDotRadius(1)
        .labelColor(() => 'rgba(255, 255, 255, 0.9)')
        .labelResolution(2);

    // Ajustar la vista inicial para que se vean Colombia y México
    world.pointOfView({ lat: 12, lng: -88, altitude: 2.2 }, 1000);

    // Hacer que gire suavemente (autorotate)
    world.controls().autoRotate = true;
    world.controls().autoRotateSpeed = 0.3;
    world.controls().enableZoom = true;

    // Añadir información de distancia como HTML overlay
    setTimeout(() => {
        const infoDiv = document.createElement('div');
        infoDiv.className = 'globe-info-overlay';
        infoDiv.innerHTML = `
            <div class="globe-distance">
                <i class="fas fa-route"></i>
                <span>3,462 km de distancia</span>
                <div class="globe-subtitle">Conectados por el hilo rojo del destino</div>
            </div>
        `;
        container.appendChild(infoDiv);
    }, 500);
}

function volverACarta() {
    const momentsGallery = document.getElementById('moments-gallery');
    const promisesContainer = document.getElementById('promises-container');
    const reasons52 = document.getElementById('reasons-52');
    const timeCapsule = document.getElementById('time-capsule');
    const redThreadMap = document.getElementById('red-thread-map');
    const teAmoSection = document.getElementById('te-amo-idiomas-section');

    if (momentsGallery) {
        momentsGallery.classList.add('hidden');
        momentsGallery.style.zIndex = '900';
    }

    if (promisesContainer) {
        promisesContainer.classList.add('hidden');
        promisesContainer.style.zIndex = '900';
    }

    if (reasons52) {
        reasons52.classList.add('hidden');
        reasons52.style.zIndex = '900';
    }

    if (timeCapsule) {
        timeCapsule.classList.add('hidden');
        timeCapsule.style.zIndex = '900';
    }

    if (redThreadMap) {
        redThreadMap.classList.add('hidden');
        redThreadMap.style.zIndex = '900';
    }
    if (redThreadMap) {
        // AGREGA ESTO: Destruir el globo para liberar memoria GPU
        setTimeout(() => {
            const container = document.getElementById('globe-container');
            if (container) container.innerHTML = '';
        }, 500); // Espera a que termine la animación de cierre
    }

    if (teAmoSection) {
        teAmoSection.classList.add('hidden');
        teAmoSection.style.zIndex = '900';
        stopFloatingHearts(); // Detener corazones si estaban activos
    }

    setTimeout(() => {
        const loveLetter = document.getElementById('love-letter');
        if (loveLetter) {
            loveLetter.classList.remove('hidden');
            loveLetter.style.zIndex = '1100';
        }
        isPaused = false;
    }, 300);
}

// ========== INICIALIZACIÓN ==========
console.log("Script cargado correctamente");

const heart = document.querySelector('.heart');
const heartContainer = document.getElementById('heart-container');

if (heart) {
    console.log("Corazón encontrado en el DOM");

    heart.addEventListener('click', function (event) {
        console.log("¡Clic detectado en el corazón!");
        event.stopPropagation();
        iniciarUniverso();
    });

    heart.onclick = iniciarUniverso;

    heartContainer.addEventListener('click', function (event) {
        console.log("Clic en el contenedor del corazón");
        if (!event.target.closest('.heart')) {
            iniciarUniverso();
        }
    });
} else {
    console.error("❌ ERROR: No se encontró el corazón en el DOM");
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM completamente cargado");

    const elementsToCheck = [
        { id: 'heart-container', name: 'Contenedor del corazón' },
        { id: 'universe-canvas', name: 'Canvas del universo' },
        { id: 'effects-canvas', name: 'Canvas de efectos' },
        { id: 'constellation-canvas', name: 'Canvas de constelación' },
        { id: 'love-letter', name: 'Carta de amor' },
        { id: 'days-counter', name: 'Contador de días' }
    ];

    elementsToCheck.forEach(element => {
        const el = document.getElementById(element.id);
        if (el) {
            console.log(`✅ ${element.name} encontrado`);
        } else {
            console.error(`❌ ${element.name} NO encontrado`);
        }
    });
});

initUniverse();

document.addEventListener('mousemove', (e) => {
    if (Math.random() > 0.8) {
        createParticles(e.clientX, e.clientY, 1);
    }
});

// ========== PÉTALOS DE ROSA CAYENDO ==========
function createRosePetals() {
    const container = document.getElementById('rose-petals-container');
    if (!container) return;

    setInterval(() => {
        const petal = document.createElement('div');
        petal.className = 'rose-petal';
        petal.style.left = `${Math.random() * 100}%`;
        petal.style.animationDuration = `${Math.random() * 3 + 4}s`;
        petal.style.opacity = Math.random() * 0.6 + 0.4;

        // Diferentes formas de pétalos
        const petalTypes = ['🌹', '🌸', '💮', '🏵️'];
        petal.textContent = petalTypes[Math.floor(Math.random() * petalTypes.length)];

        container.appendChild(petal);

        setTimeout(() => {
            petal.remove();
        }, 7000);
    }, 300);
}

// ========== RELOJES EN TIEMPO REAL ==========
function updateClocks() {
    // Medellín (UTC-5)
    const medellinTime = new Date().toLocaleTimeString('es-CO', {
        timeZone: 'America/Bogota',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // CDMX (UTC-6)
    const cdmxTime = new Date().toLocaleTimeString('es-MX', {
        timeZone: 'America/Mexico_City',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const medellinEl = document.getElementById('medellin-time');
    const cdmxEl = document.getElementById('cdmx-time');

    if (medellinEl) medellinEl.textContent = medellinTime;
    if (cdmxEl) cdmxEl.textContent = cdmxTime;
}

// ========== MODO CONSTELACIÓN ==========
let constellationModeActive = false;

function toggleConstellationMode() {
    const panel = document.getElementById('constellation-mode-panel');
    const loveLetter = document.getElementById('love-letter');

    // Cerrar todos los paneles abiertos antes de abrir constelación
    const momentsGallery = document.getElementById('moments-gallery');
    const promisesContainer = document.getElementById('promises-container');
    const reasons52 = document.getElementById('reasons-52');
    const timeCapsule = document.getElementById('time-capsule');
    const redThreadMap = document.getElementById('red-thread-map');
    const heartGallery = document.getElementById('heart-photo-gallery');
    const lettersSection = document.getElementById('letters-poems-section');
    const specialThings = document.getElementById('special-things-section');
    const realSkyPanel = document.getElementById('real-sky-panel');
    const PhactModal = document.getElementById('Phact-modal');
    const cartaModal = document.getElementById('carta-modal');

    // Cerrar todos
    if (momentsGallery) momentsGallery.classList.add('hidden');
    if (promisesContainer) promisesContainer.classList.add('hidden');
    if (reasons52) reasons52.classList.add('hidden');
    if (timeCapsule) timeCapsule.classList.add('hidden');
    if (redThreadMap) redThreadMap.classList.add('hidden');
    if (heartGallery) heartGallery.classList.add('hidden');
    if (lettersSection) lettersSection.classList.add('hidden');
    if (specialThings) specialThings.classList.add('hidden');
    if (realSkyPanel) realSkyPanel.classList.add('hidden');
    if (PhactModal) PhactModal.classList.add('hidden');
    if (cartaModal) cartaModal.classList.add('hidden');

    if (panel) {
        panel.classList.toggle('hidden');
        loveLetter.classList.add('hidden');
        constellationModeActive = !constellationModeActive;
    }
}

function cerrarConstellationMode() {
    const panel = document.getElementById('constellation-mode-panel');
    const loveLetter = document.getElementById('love-letter');
    if (panel) {
        panel.classList.add('hidden');

        constellationModeActive = false;
    }
    loveLetter.classList.remove('hidden');
}

function mostrarPhact() {
    const modal = document.getElementById('Phact-modal');
    if (modal) {
        modal.classList.remove('hidden');

        // Verificar si la imagen existe
        const img = document.getElementById('Phact-certificate');
        img.onerror = function () {
            // Si no existe, mostrar el placeholder
            this.style.display = 'none';
            this.nextElementSibling.style.display = 'flex';
        };
        img.onload = function () {
            // Si existe, ocultar el placeholder
            this.style.display = 'block';
            this.nextElementSibling.style.display = 'none';
        };
    }
}

function cerrarPhactModal() {
    const modal = document.getElementById('Phact-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function descargarCertificado() {
    const link = document.createElement('a');
    link.href = './static/images/Phact-certificate.pdf';
    link.download = 'Phact-Certificado-Sarah.pdf';
    link.click();
}

// ========== GALERÍA DE FOTOS EN CORAZÓN ==========
function mostrarGaleriaCorazon() {
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) {
        loveLetter.classList.add('hidden');
        loveLetter.style.zIndex = '900';
    }

    setTimeout(() => {
        const gallery = document.getElementById('heart-photo-gallery');
        if (gallery) {
            gallery.classList.remove('hidden');
            gallery.style.zIndex = '1200';

            // Verificar y manejar placeholders de imágenes
            const photoSpots = document.querySelectorAll('.photo-spot img');
            photoSpots.forEach(img => {
                img.onerror = function () {
                    this.style.display = 'none';
                    this.nextElementSibling.style.display = 'flex';
                };
                img.onload = function () {
                    this.style.display = 'block';
                    this.nextElementSibling.style.display = 'none';
                };
            });
        }
    }, 300);
}

// ========== CARTAS Y POEMAS ==========
function mostrarCartasPoemas() {
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) {
        loveLetter.classList.add('hidden');
        loveLetter.style.zIndex = '900';
    }

    setTimeout(() => {
        const letters = document.getElementById('letters-poems-section');
        if (letters) {
            letters.classList.remove('hidden');
            letters.style.zIndex = '1200';
        }
    }, 300);
}

// Datos de las cartas - PERSONALIZA AQUÍ TUS CARTAS
const cartasData = [
    {
        titulo: "Mi carta especial para ti",
        fecha: "14 de Febrero, 2026",
        contenido: `
            <p>Sarah,</p>
            <p>Siendo honesto, me cuesta empezar. Tú sabes mejor que nadie que mi mente a veces es un lugar ruidoso, lleno de cosas que van a mil por hora. Pero cuando pienso en ti, todo ese ruido se calla y solo existes tú.</p>
            <p>A veces pienso en el momento en que coincidimos y me parece casi imposible.
            Dos mundos distintos, dos historias distintas… y aun así, aquí estamos.
            Y no dejo de preguntarme cómo fue que la vida, entre todo lo que podía pasar, decidió cruzarnos.
            <br><br>
            Desde que llegaste, algo en mí cambió.
            No de golpe, no como en las historias o películas, sino lento… profundo… inevitable.
            Te fuiste quedando.
            Y yo, sin darme cuenta, empecé a sentirme en casa contigo. Por que solo me bastó un minuto para saber que eras tu y tres días para querer quedame a tu lado</p>
            <p>Tengo que confesarte algo que quizás ya intuyes, es la primera vez que entiendo a la gente.
            Durante años, veía el 14 de febrero o las canciones de amor y me parecían exageraciones, rituales sociales sin sentido. Me sentía un espectador, alguien mirando desde fuera un idioma que no sabía hablar. Hoy, es mi primer 14 de febrero acompañado. Es la primera vez que no estoy solo con mi soledad. Y ahora entiendo por qué la humanidad le da tanta importancia a esto, porque tener a alguien que te mire y realmente te vea, cambia los colores del mundo. La primera vez que entiendo por qué el amor le importa tanto a la gente.
            <br>
            Para otros puede parecer pequeño, pero para mí es inmenso,
            esta es la primera vez que este día no se siente vacío.
            La primera vez que tengo a alguien… y eres tú.

            Es la primera vez que hago tantas cosas.
            La primera vez que me permito sentir sin huir.
            Antes miraba todo esto desde fuera.
            Hoy lo vivo contigo.
            </p>
            <p>Yo no amo de manera sencilla.
            Eso ya lo sabes.
            Siento todo demasiado.
            El amor, el miedo, la ausencia, la esperanza. Cuando me duele algo, me destruye, pero cuando amo, Sarah, amo con una intensidad que a veces me asusta hasta a mí mismo. Lo que siento por ti, no es algo superficial, es algo que me atraviesa el pecho, que me cambia, que me destruye pero magicamente, me vuelve a construir, me permite descubrir quien soy yo. Y aun así… tú te quedas. No sé si alguna vez podré agradecerte lo suficiente por eso.
            Por elegirme sin garantías.
            Por no soltarme cuando habría sido más fácil hacerlo.</p>
            <p>No sé qué nos depare el futuro, no sé si podremos superar todo lo que está por venir, pero lo que sí sé es que quiero intentarlo contigo. Quiero seguir descubriendo el mundo a tu lado, quiero seguir aprendiendo de ti, quiero seguir amándote cada día más. No sé si seré capaz de darte todo lo que mereces,
            no sé si seré capaz de hacerte feliz,
            no sé si seré capaz de amarte como te mereces…
            pero te prometo que lo intentaré con todas mis fuerzas.</p>
            <p>
            Pase lo que pase, siempre vas a vivir en mí.
            En el lugar más honesto de mi corazón.
            En donde guardo lo que me cambió para siempre.

            Gracias por existir.
            Gracias por quedarte.
            Gracias por enseñarme que el amor puede ser intenso, imperfecto… y real.</p>
            <p>Quiero que sepas que te amo más de lo que las palabras pueden expresar. Eres mi todo, mi razón de ser, mi felicidad, mi amor, mi vida.</p>
        `,
        pregunta: "¿Quisieras caminar conmigo hacia el futuro?",
        respuestaSi: "¡Eso me hace el hombre más feliz del universo! Caminaremos juntos hacia todo lo que soñamos. 💕"
    },
    {
        title: "Infinito de Infinitos",
        date: "14 Febrero 2026",
        contenido: `<p>Sarah, amor mío…<br><br>
            Hay verdades que no necesitan explicación,<br>
            porque habitan en un lugar más profundo que el lenguaje,<br>
            más silencioso que el tiempo,<br>
            más real que cualquier historia que intentemos contar.<br>
            <strong>Lo nuestro es una de esas verdades.</strong></p>

            <p>No sé en qué coordenada exacta<br>tus palabras se volvieron mi casa,<br>
            ni en qué instante tu voz<br>comenzó a ordenar el caos de mis heridas,<br>
            ni cómo fue que tu ternura<br>encontró esos rincones en mí<br>
            que yo creí perdidos para siempre.</p>

            <p>Pero sí tengo una certeza absoluta:<br>
            <strong>lo que siento contigo no cabe en un solo infinito.</strong></p>

            <p>Por eso te hablo de un <em>infinito de infinitos</em>.<br>
            Porque uno solo se queda corto,<br>las matemáticas no alcanzan<br>
            para explicar la manera en la que este amor crece,<br>
            se expande, respira, late,<br>y se transforma.</p>

            <p>Necesito un infinito por lo que somos hoy.<br>
            Un infinito por lo que estamos aprendiendo a ser.<br>
            Un infinito por cada vez que, a pesar del miedo, me eliges<br>
            y yo, sin dudarlo, vuelvo a elegirte a ti.<br>
            Un infinito por cada versión futura de nosotros<br>que todavía no existe,<br>
            pero que ya late en nuestra forma de reconocernos.</p>

            <p>Porque este amor —nuestro amor—<br>
            no es una promesa vacía, ni una esperanza ciega.<br>
            Es materia real.<br>Es algo que existe.<br>
            Algo que construimos a diario con las manos,<br>
            con nuestras grietas, con nuestras ganas,<br>
            con nuestra absoluta verdad.</p>

            <p>No quiero un destino escrito en ningún lugar.<br>
            No lo quiero predefinido.<br>
            Lo quiero vivo,<br>creciendo como una galaxia propia.<br>
            Lo quiero siendo exactamente<br>lo que nosotros decidamos que sea.</p>

            <p>Porque tú y yo no seguimos líneas trazadas:<br><strong>las creamos.</strong><br>
            No obedecemos al destino:<br><strong>lo escribimos.</strong><br>
            No repetimos historias pasadas:<br><strong>las reinventamos.</strong></p>

            <p>Y en cada palabra tuya,<br>en cada silencio cómodo,<br>
            en cada forma en que me salvas sin saberlo,<br>
            veo un pedazo de ese universo que estamos armando.</p>

            <p>Un infinito que no grita, que no exige.<br>
            Un infinito que crece<br>porque tú eres mi calma en la tormenta<br>
            y yo intento ser tu certeza en la duda.<br>
            Porque tú me iluminas<br>y yo te sostengo.</p>

            <p>Si algún día alguien, quien sea, pregunta qué fue lo nuestro,<br>
            quiero responderles así:<br>
            Fue un amor tan inmenso, tan complejo y tan simple,<br>
            que un solo infinito no alcanzó para contenerlo.</p>

            <p>Y entonces decidimos crear el nuestro:<br>
            <strong>Un infinito de infinitos.</strong></p>

            <p>Uno para cada día.<br>Uno para cada sueño.<br>
            Uno para cada vez que nuestras almas se reconocieron<br>
            y se dijeron en silencio:<br><em>“quédate, es aquí”</em>.</p>

            <p>Y aquí estoy, Sarah.<br>Aquí sigo.<br>Aquí te elijo.<br>
            Aquí construyo contigo, por siempre y para siempre,<br>
            nuestro infinito de infinitos.</p>`,
        pregunta: "¿Seguirías construyendo esta relación conmigo?",
        respuestaSi: "¡Juntos construiremos el amor más hermoso del mundo! Cada día será un nuevo ladrillo en nuestra historia. ❤️"
    },
    {
        titulo: "¿Quién es Sarah?",
        fecha: "14 de Febrero, 2026",
        contenido: `
            <p>Sarah es muchas cosas.<br>
            Pero para mí, es una sola verdad con muchas formas.</p>

            <p>Para el mundo, eres Sarah Joy.<br>
            La chica de TikTok. La que aparece en las pantallas.<br>
            La imagen que miles de personas ven y siguen.</p>

            <p>Pero yo… yo tengo el privilegio de conocer a la otra Sarah.<br>
            La que existe cuando se apaga la cámara.<br>
            La que no necesita un lente para ser real.</p>

            <p>Es la chica que un día apareció en mi pantalla<br>
            y, sin saberlo, empezó a quedarse en mi vida.<br>
            Es mi novia.<br>
            <strong>Y poder llamarle así es un orgullo que no me cabe en el pecho.</strong><br>
            La persona que elegí. La persona que me eligió.</p>

            <p>Es mi primer pensamiento al despertar<br>
            y el último que me acompaña cuando el mundo se apaga<br>
            y solo quedan mis latidos repitiendo su nombre.</p>

            <p>Yo conozco a la mujer cuya sonrisa no nace de un like,<br>
            sino de una alegría honesta.<br>
            Conozco esos ojos profundos donde se pueden ver universos enteros<br>
            cuando me ves con intensidad.</p>

            <p>Y quiero agradecerle por eso.<br>
            Gracias por permitirme descubrirte.<br>
            Gracias por confiarme la parte de ti que no está hecha para el mundo,<br>
            sino para quien sabe quedarse.</p>

            <p>Porque al final del día, Sarah, no importan los fans.<br>
            No importan los números. No importa el ruido.<br>
            Lo único que importa es la mujer que eres.</p>

            <p>La mujer profundamente inteligente que me desafía y me hace crecer.<br>
            <strong>Estoy tan orgulloso de quien eres y de todo lo que logras.</strong><br>
            La mujer carismática que ilumina todo sin intentarlo.<br>
            La mujer cariñosa y amorosa que, sin darse cuenta, me hace sentir que tengo un lugar en el universo.</p>

            <p>Si alguien me pregunta quién es Sarah para mí, no hablaré de apariencias.<br>
            Diré esto:<br>
            Sarah es mi lugar seguro.<br>
            Sarah es mi elección diaria.<br>
            Sarah es la persona con la que entendí por qué amar importa tanto.<br>
            <strong>Amarla, es el honor más grande de mi vida.</strong></p>

            <p>No la amo por quien es para el mundo.<br>
            La amo por lo que piensa. Por su forma única de ver la vida.<br>
            Por su sensibilidad. Por su verdad.<br>
            La amo por lo que es cuando nadie mira.</p>

            <p>Y si algún día dudo, si el miedo aparece,<br>
            si el camino se vuelve confuso, sé algo con absoluta certeza:<br>
            Mientras su nombre siga latiendo en mi pecho,<br>
            sé exactamente hacia dónde voy.</p>

            <p>Esa es la Sarah que elijo.<br>
            <strong>Esa es la mujer que admiro.</strong><br>
            Esa es la Sarah que amo <strong>con toda mi alma</strong>.<br>
            Esa es la Sarah que vale más que todo.</p>`,
        pregunta: "¿Te imaginas un futuro juntos, para siempre?",
        respuestaSi: "¡Ese futuro juntos es mi mayor sueño! Tú y yo, por siempre, enfrentando la vida de la mano. 💖"
    }
];

// Variable para tracking de la carta actual
let cartaActual = 0;

// Abrir modal de carta
function abrirCartaModal(index) {
    cartaActual = index;
    const carta = cartasData[index];
    const modal = document.getElementById('carta-modal');

    // Llenar contenido
    document.getElementById('carta-titulo').textContent = carta.titulo;
    document.getElementById('carta-fecha').textContent = carta.fecha;
    document.getElementById('carta-contenido').innerHTML = carta.contenido;
    document.getElementById('carta-pregunta').textContent = carta.pregunta;

    // Reset respuesta
    document.getElementById('respuesta-mensaje').classList.add('hidden');
    document.querySelector('.carta-question').classList.remove('hidden');

    // Mostrar modal con animación
    modal.classList.remove('hidden');
    setTimeout(() => {
        modal.querySelector('.carta-modal-content').style.opacity = '1';
        modal.querySelector('.carta-modal-content').style.transform = 'scale(1)';
    }, 10);

    // Animación del sobre
    setTimeout(() => {
        const envelope = document.querySelector('.envelope');
        envelope.classList.add('open');
    }, 500);
}

// Responder a la pregunta de la carta
function responderCarta(respuesta) {
    if (respuesta === 'si') {
        const carta = cartasData[cartaActual];
        const respuestaMensaje = document.getElementById('respuesta-mensaje');
        const respuestaTexto = document.getElementById('respuesta-texto');

        respuestaTexto.textContent = carta.respuestaSi;

        // Ocultar pregunta y mostrar respuesta
        document.querySelector('.carta-question').classList.add('hidden');
        respuestaMensaje.classList.remove('hidden');

        // Cerrar automáticamente después de 4 segundos
        setTimeout(() => {
            cerrarCartaModal();
        }, 4000);
    } else {
        cerrarCartaModal();
    }
}

// Cerrar modal de carta
function cerrarCartaModal() {
    const modal = document.getElementById('carta-modal');
    const envelope = document.querySelector('.envelope');

    // Animación de cierre
    modal.querySelector('.carta-modal-content').style.opacity = '0';
    modal.querySelector('.carta-modal-content').style.transform = 'scale(0.9)';
    envelope.classList.remove('open');

    setTimeout(() => {
        modal.classList.add('hidden');
    }, 300);
}

// ========== NUESTRAS COSAS ESPECIALES ==========
function mostrarCosasEspeciales() {
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) {
        loveLetter.classList.add('hidden');
        loveLetter.style.zIndex = '900';
    }

    setTimeout(() => {
        const things = document.getElementById('special-things-section');
        if (things) {
            things.classList.remove('hidden');
            things.style.zIndex = '1200';
        }
    }, 300);
}

// ========== AUDIO EN CÁPSULA DEL TIEMPO ==========
// Rutas de audio para cada mensaje (placeholders)
const audioPromises = [
    './static/audio/promesa1.mp3',  // Para Cada Día
    './static/audio/promesa2.mp3',  // En Los Días Difíciles
    './static/audio/promesa3.mp3',  // Para Nuestro Futuro
    './static/audio/promesa4.mp3'   // Mi Promesa Eterna
];

// Actualizar la función abrirMensaje para incluir audio
const abrirMensajeOriginal = abrirMensaje;
abrirMensaje = function (element, index) {
    abrirMensajeOriginal(element, index);

    // Agregar botón de audio si existe
    const audioContainer = document.getElementById('audio-player-container');
    const audioElement = document.getElementById('promise-audio');

    if (audioContainer && audioElement && audioPromises[index]) {
        audioElement.src = audioPromises[index];
        audioContainer.classList.remove('hidden');

        // NO reproducir automáticamente, solo mostrar el reproductor
        audioElement.load(); // Cargar pero no reproducir

        // Manejar error si el audio no existe
        audioElement.onerror = function () {
            audioContainer.classList.add('hidden');
        };
    }
};

// Actualizar volverACarta para incluir nuevas secciones
const volverACartaOriginal = volverACarta;
volverACarta = function () {
    const heartGallery = document.getElementById('heart-photo-gallery');
    const lettersSection = document.getElementById('letters-poems-section');
    const specialThings = document.getElementById('special-things-section');
    const teAmoSection = document.getElementById('te-amo-idiomas-section');

    if (heartGallery) {
        heartGallery.classList.add('hidden');
        heartGallery.style.zIndex = '900';
    }

    if (lettersSection) {
        lettersSection.classList.add('hidden');
        lettersSection.style.zIndex = '900';
    }

    if (specialThings) {
        specialThings.classList.add('hidden');
        specialThings.style.zIndex = '900';
    }

    if (teAmoSection) {
        teAmoSection.classList.add('hidden');
        teAmoSection.style.zIndex = '900';
        stopFloatingHearts(); // Detener corazones
    }

    volverACartaOriginal();
};

// ========== INICIALIZACIÓN DE NUEVAS FUNCIONES ==========
// Variable para guardar la instancia de VirtualSky
let planetarium = null;

function mostrarMapaEstelar() {
    // 1. Ocultar la carta principal
    const loveLetter = document.getElementById('love-letter');
    if (loveLetter) loveLetter.classList.add('hidden');

    // 2. Cerrar panel de biblioteca si está abierto
    const constellationPanel = document.getElementById('constellation-mode-panel');
    if (constellationPanel) constellationPanel.classList.add('hidden');

    // 3. Mostrar el panel del mapa
    const panel = document.getElementById('real-sky-panel');
    const container = document.getElementById('starmap-container');

    if (panel && container) {
        panel.classList.remove('hidden');

        // AQUÍ ESTÁ EL TRUCO: Usamos el visualizador oficial embebido
        // Lat/Lon de Medellín, Fecha 14 Nov 2025 20:00
        const mapUrl = "https://virtualsky.lco.global/embed/index.html?longitude=-75.5658&latitude=6.2476&clock=2025-11-14T20:00:00&constellations=true&constellationlabels=true&showstarlabels=true&live=false&az=180";

        container.innerHTML = `<iframe 
            width="100%" 
            height="100%" 
            frameborder="0" 
            scrolling="no" 
            marginheight="0" 
            marginwidth="0" 
            src="${mapUrl}" 
            allowTransparency="true">
        </iframe>`;
    }
}

function cerrarMapaEstelar() {
    const panel = document.getElementById('real-sky-panel');
    const container = document.getElementById('starmap-container');
    const constellationPanel = document.getElementById('constellation-mode-panel');

    // Ocultar panel
    if (panel) panel.classList.add('hidden');

    // Limpiar el iframe para que no consuma memoria en segundo plano
    if (container) container.innerHTML = '';

    // Volver a mostrar el menú anterior
    if (constellationPanel) constellationPanel.classList.remove('hidden');
}
document.addEventListener('DOMContentLoaded', function () {
    // Iniciar pétalos de rosa
    createRosePetals();

    // Iniciar relojes
    setInterval(updateClocks, 1000);
    updateClocks();

    // Mostrar corazones laterales y toggle de constelación cuando inicie el universo
    const originalIniciarUniverso = iniciarUniverso;
    window.iniciarUniverso = function () {
        originalIniciarUniverso();

        setTimeout(() => {
            const sideHearts = document.querySelector('.side-hearts');
            const constellationToggle = document.getElementById('constellation-toggle');

            if (sideHearts) {
                sideHearts.classList.add('visible');
            }

            if (constellationToggle) {
                constellationToggle.classList.remove('hidden');
            }
        }, 2000);
    };
});
document.addEventListener("visibilitychange", () => {
    const hidden = document.hidden;
    isPaused = hidden; // ya tienes isPaused en tu script :contentReference[oaicite:6]{index=6}
    constellationModeActive = constellationModeActive && !hidden;
});
/************************************************/
/*  1) Grab references from the DOM             */
/************************************************/
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

// MAIN MENU references
const mainMenuOverlay = document.getElementById('mainMenuOverlay');
const playGameText    = document.getElementById('playGameText');
const guideText       = document.getElementById('guideText');
const leaderboardText = document.getElementById('leaderboardText');

// GUIDE references
const guideOverlay = document.getElementById('guideOverlay');
const guideGoBack  = document.getElementById('guideGoBack');

// START references
const startOverlay = document.getElementById('startOverlay');
const startTitle   = document.getElementById('startTitle');
const startGoBack  = document.getElementById('startGoBack');

// COUNTDOWN references
const countdownOverlay   = document.getElementById('countdownOverlay');
const countdownNumberEl  = document.getElementById('countdownNumber');

// GAME OVER references
const gameOverOverlay    = document.getElementById('gameOverOverlay');
const finalScoreDisplay  = document.getElementById('finalScoreDisplay');
const gameOverGoBack     = document.getElementById('gameOverGoBack');
const playerNameInput    = document.getElementById('playerNameInput');
const saveScoreBtn       = document.getElementById('saveScoreBtn');

// LEADERBOARD references
const leaderboardOverlay = document.getElementById('leaderboardOverlay');
const leaderboardGoBack  = document.getElementById('leaderboardGoBack');
const leaderboardTable   = document.getElementById('leaderboardTable');

/************************************************/
/*  1.1) AUDIO SETUP (Web Audio API)            */
/************************************************/
const bgMusic     = new Audio('sounds/soundtrack.mp3');
bgMusic.volume    = 0.25;
bgMusic.loop      = true;

const hitCursorSound = new Audio('sounds/hit-cursor.mp3');
const hitWallSound   = new Audio('sounds/hit-wall.mp3');
const powerUpSound   = new Audio('sounds/powerup.mp3');
const countdownBeep  = new Audio('sounds/beep.mp3');
const countdownFinal = new Audio('sounds/final-count.mp3');

let audioCtx         = null;
let bgMusicSource    = null;
let lowpassFilter    = null;
let audioInitialized = false;

function initAudioContextIfNeeded() {
    if (!audioInitialized) {
        audioCtx      = new (window.AudioContext || window.webkitAudioContext)();
        bgMusicSource = audioCtx.createMediaElementSource(bgMusic);

        lowpassFilter = audioCtx.createBiquadFilter();
        lowpassFilter.type = 'lowpass';
        lowpassFilter.frequency.setValueAtTime(22000, audioCtx.currentTime);

        bgMusicSource.connect(lowpassFilter).connect(audioCtx.destination);
        audioInitialized = true;
    }
}

function setMenuAudioFilter() {
    if (lowpassFilter) {
        lowpassFilter.frequency.setValueAtTime(800, audioCtx.currentTime);
    }
}

function setGameAudioFilter() {
    if (lowpassFilter) {
        lowpassFilter.frequency.setValueAtTime(22000, audioCtx.currentTime);
    }
}

/************************************************/
/*  1.5) Navigation / Overlay Logic             */
/************************************************/
playGameText.addEventListener('click', () => {
    mainMenuOverlay.style.display = 'none';
    startOverlay.style.display    = 'flex';

    initAudioContextIfNeeded();
    setMenuAudioFilter();

    bgMusic.play().catch(err => console.log('bgMusic blocked', err));
});

guideText.addEventListener('click', () => {
    mainMenuOverlay.style.display = 'none';
    guideOverlay.style.display    = 'flex';

    initAudioContextIfNeeded();
    setMenuAudioFilter();
});

leaderboardText.addEventListener('click', () => {
    // If you have a separate 'leaderboard.php' to fetch from DB, do a fetch() here
    mainMenuOverlay.style.display = 'none';
    leaderboardOverlay.style.display= 'flex';

    initAudioContextIfNeeded();
    setMenuAudioFilter();
});

// GUIDE Overlay
guideGoBack.addEventListener('click', () => {
    guideOverlay.style.display    = 'none';
    mainMenuOverlay.style.display = 'flex';
    setMenuAudioFilter();
});

// START Overlay
startGoBack.addEventListener('click', () => {
    startOverlay.style.display    = 'none';
    mainMenuOverlay.style.display = 'flex';
    setMenuAudioFilter();
});

startOverlay.addEventListener('click', (e) => {
    if (e.target === startTitle) {
        startOverlay.style.display = 'none';
        startCountdown();

        initAudioContextIfNeeded();
        setMenuAudioFilter();
        bgMusic.play().catch(err => console.log(err));
    }
});

// GAME OVER Overlay
gameOverGoBack.addEventListener('click', () => {
    gameOverOverlay.classList.remove('show');
    setTimeout(() => {
        gameOverOverlay.style.display = 'none';
    }, 700);
    mainMenuOverlay.style.display   = 'flex';
    setMenuAudioFilter();
});
gameOverOverlay.addEventListener('click', (e) => {
    if (e.target === document.getElementById('gameOverSub') || e.target === gameOverOverlay) {
        gameOverOverlay.classList.remove('show');
        startCountdown();
        initAudioContextIfNeeded();
        setMenuAudioFilter();
    }
});

/************************************************/
/*  2) Ball & Physics Properties                */
/************************************************/
let ballX         = canvas.width / 2;
let ballY         = canvas.height / 2;
let ballRadius    = 125;
let ballDX        = 0;
let ballDY        = 0.01;
let speedFactor   = 1;
const gravity     = 0.3;

let isBallFrozen  = false;
let freezePrevDX  = 0;
let freezePrevDY  = 0;

let ballAngle     = 0;
const ballRotationSpeed = 0.02;

/************************************************/
/*  3) Cursor / \"Head\" Properties             */
/************************************************/
let headX = canvas.width / 2;
let headY = canvas.height / 2;
let headRadius = 40;

const headImageBlue = new Image();
headImageBlue.src   = 'pics/cursorpic1.png';
const headImageRed  = new Image();
headImageRed.src    = 'pics/cursorpic2.png';

let currentHeadImage  = headImageBlue;
let colorChangeFrames = 0;

/************************************************/
/*  4) Ball Images                              */
/************************************************/
const ballImagePaths = [
    'pics/sportsball1.png',
    'pics/sportsball2.png',
    'pics/sportsball3.png',
    'pics/sportsball4.png',
    'pics/sportsball5.png',
    'pics/sportsball6.png',
    'pics/sportsball7.png'
];
const ballImages = ballImagePaths.map(src => {
    const img = new Image();
    img.src   = src;
    return img;
});
let ballImageIndex    = 0;
let currentBallImage  = ballImages[ballImageIndex];

/************************************************/
/*  5) Score & Game Over, Single-Hit Lock       */
/************************************************/
let score     = 0;
let gameOver  = false;
let isColliding= false;

/************************************************/
/*  6) Power-Ups: slow / freeze / double        */
/************************************************/
const powerUpImageSlow   = new Image();
powerUpImageSlow.src     = 'pics/powerup-slowmotion.png';

const powerUpImageFreeze = new Image();
powerUpImageFreeze.src   = 'pics/powerup-freeze.png';
let doubleScoreActive    = false;

/************************************************/
/*  7) Power-Up Object                          */
/************************************************/
const powerUp = {
    x: 0,
    y: 0,
    radius: 20,
    isActive: false,
    isSpawning: false,
    isDespawning: false,
    scale: 0,
    type: ''
};
let powerUpSpawnTimer = null;
let powerUpSpawnTime  = 0;
const POWERUP_LIFETIME= 3000;

/************************************************/
/*  8) Save Score to DB via submit-score.php    */
/************************************************/
function postScoreToDB(playerName, finalScore) {
    return fetch('submit-score.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: playerName, score: finalScore })
    })
        .then(res => res.json())
        .catch(err => {
            console.error('Error fetching submit-score:', err);
            return { success: false, message: 'Fetch error' };
        });
}

/************************************************/
/*  9) Save Score Button => calls postScoreToDB */
/************************************************/
saveScoreBtn.addEventListener('click', async () => {
    const name = playerNameInput.value.trim();
    if (!name) {
        alert('Please enter your name!');
        return;
    }
    const finalScore = score;

    const response = await postScoreToDB(name, finalScore);
    if(response.success) {
        alert("Score saved!");
        // Optionally load scoreboard from 'leaderboard.php' if you want
    } else {
        alert("Failed to save score: " + (response.message || 'Unknown error'));
    }

    // Clear name input
    playerNameInput.value = '';
    // Hide gameOver overlay
    gameOverOverlay.classList.remove('show');
    gameOverOverlay.style.display = 'none';

    // Show leaderboard overlay or main menu
    leaderboardOverlay.style.display = 'flex';
    setMenuAudioFilter();
});

/************************************************/
/* 10) Start => triggers countdown              */
/************************************************/
function startCountdown() {
    countdownOverlay.style.display = 'flex';
    let timeLeft = 3;
    countdownNumberEl.textContent = timeLeft;

    const intervalId = setInterval(() => {
        countdownBeep.play().catch(err => console.log('countdown beep blocked', err));

        timeLeft--;
        if (timeLeft > 0) {
            countdownNumberEl.textContent = timeLeft;
        } else {
            countdownNumberEl.textContent = 'Go!';
            countdownFinal.play().catch(err => console.log('countdown final blocked', err));

            setTimeout(() => {
                countdownOverlay.style.display = 'none';
                clearInterval(intervalId);

                setGameAudioFilter();
                resetGame();
            }, 500);
        }
    }, 1000);
}

/************************************************/
/* 11) Reset Game => re-initialize everything   */
/************************************************/
function resetGame() {
    score          = 0;
    gameOver       = false;
    isColliding    = false;
    speedFactor    = 1;
    isBallFrozen   = false;
    doubleScoreActive = false;

    ballX          = canvas.width / 2;
    ballY          = canvas.height / 2;
    ballRadius     = 125;
    ballDX         = 0;
    ballDY         = 0.01;
    ballAngle      = 0;

    ballImageIndex = 0;
    currentBallImage = ballImages[ballImageIndex];
    currentHeadImage  = headImageBlue;
    colorChangeFrames  = 0;

    powerUp.isActive     = false;
    powerUp.isSpawning   = false;
    powerUp.isDespawning = false;
    powerUp.scale        = 0;
    powerUp.type         = '';
    if (powerUpSpawnTimer) {
        clearTimeout(powerUpSpawnTimer);
    }
    scheduleNextPowerUpSpawn();

    gameLoop();
}

/************************************************/
/* 12) Mouse => update cursor position          */
/************************************************/
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    headX = e.clientX - rect.left;
    headY = e.clientY - rect.top;
});

/************************************************/
/* 13) Main Update (Gravity, Collisions, etc.)  */
/************************************************/
function update() {
    if (gameOver) return;

    if (!isBallFrozen) {
        ballDY += gravity;
        ballX  += ballDX * speedFactor;
        ballY  += ballDY * speedFactor;
        ballAngle += 0.02;
    }

    // bounce top
    if (ballY - ballRadius < 0) {
        ballY = ballRadius;
        ballDY= -ballDY;
        hitWallSound.play().catch(err => console.log(err));
    }
    // bounce sides
    if (ballX - ballRadius < 0) {
        ballX = ballRadius;
        ballDX= -ballDX;
        hitWallSound.play().catch(err => console.log(err));
    } else if (ballX + ballRadius > canvas.width) {
        ballX = canvas.width - ballRadius;
        ballDX= -ballDX;
        hitWallSound.play().catch(err => console.log(err));
    }

    if (!isBallFrozen) {
        handleBallCursorCollision();
    }

    // If ball goes below => gameOver
    if (ballY - ballRadius > canvas.height) {
        endGame();
    }

    // Red cursor countdown
    if (colorChangeFrames > 0) {
        colorChangeFrames--;
        if (colorChangeFrames === 0) {
            currentHeadImage = headImageBlue;
        }
    }

    updatePowerUp();
}

/************************************************/
/* 14) Ball-Cursor Collision (with doubleScore) */
/************************************************/
function handleBallCursorCollision() {
    const distX    = headX - ballX;
    const distY    = headY - ballY;
    const distance = Math.sqrt(distX*distX + distY*distY);

    if (!isColliding && distance < (headRadius + ballRadius)) {
        hitCursorSound.play().catch(err => console.log(err));

        score += (doubleScoreActive ? 2 : 1);

        ballDY = -(Math.abs(ballDY) + 0.5);
        ballDX = distX * 0.2;

        currentHeadImage  = headImageRed;
        colorChangeFrames = 15;

        // shrink ball every 15 hits
        if (score % 15 === 0) {
            if (ballDY > 0) {
                ballDY += 0.1;
            } else {
                ballDY -= 0.1;
            }
            ballRadius = Math.max(10, ballRadius - 20);

            if (ballImageIndex < ballImages.length - 1) {
                ballImageIndex++;
                currentBallImage = ballImages[ballImageIndex];
            }
        }
        isColliding = true;
    } else if (isColliding && distance >= (headRadius + ballRadius)) {
        isColliding = false;
    }
}

/************************************************/
/* 15) End Game                                 */
/************************************************/
function endGame() {
    gameOver = true;
    countUpFinalScore(score);
    gameOverOverlay.classList.add('show');
    setMenuAudioFilter();
}

/************************************************/
/* 16) Final Score Count-up                     */
/************************************************/
function countUpFinalScore(finalScore) {
    let currentValue = 0;
    if (finalScore < 1) {
        finalScoreDisplay.textContent = 0;
        return;
    }
    const step         = Math.ceil(finalScore / 50);
    const intervalSpeed= 50;

    const intervalId = setInterval(() => {
        currentValue += step;
        if (currentValue >= finalScore) {
            currentValue = finalScore;
            clearInterval(intervalId);
        }
        finalScoreDisplay.textContent = currentValue;
    }, intervalSpeed);
}

/************************************************/
/* 17) Draw Everything                          */
/************************************************/
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // big semi-transparent score behind ball & cursor
    ctx.save();
    ctx.font         = '200px Arial';
    ctx.fillStyle    = 'rgba(255,255,255,0.2)';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(score, canvas.width/2, canvas.height/2);
    ctx.restore();

    // draw the ball (with rotation)
    ctx.save();
    ctx.translate(ballX, ballY);
    ctx.rotate(ballAngle);
    ctx.drawImage(
        currentBallImage,
        -ballRadius,
        -ballRadius,
        ballRadius*2,
        ballRadius*2
    );
    ctx.restore();

    // power-up if spawning/active/despawning
    if (powerUp.isSpawning || powerUp.isActive || powerUp.isDespawning) {
        ctx.save();
        ctx.translate(powerUp.x, powerUp.y);
        ctx.scale(powerUp.scale, powerUp.scale);

        const pw = 60, ph = 60;
        if (powerUp.type === 'freeze') {
            ctx.drawImage(powerUpImageFreeze, -pw/2, -ph/2, pw, ph);
        } else if (powerUp.type === 'slow') {
            ctx.drawImage(powerUpImageSlow, -pw/2, -ph/2, pw, ph);
        } else {
            // double => "2x"
            ctx.font      = 'bold 40px Arial';
            ctx.fillStyle = 'gold';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('2x', 0, 0);
        }
        ctx.restore();
    }

    // custom "head" cursor
    const imgW = 80, imgH = 80;
    ctx.drawImage(
        currentHeadImage,
        headX - imgW/2,
        headY - imgH/2,
        imgW,
        imgH
    );
}

/************************************************/
/* 18) Game Loop                                */
/************************************************/
function gameLoop() {
    if (!gameOver) {
        update();
        draw();
        requestAnimationFrame(gameLoop);
    }
}

/************************************************/
/* 19) Power-Up Spawning                        */
/************************************************/
function scheduleNextPowerUpSpawn() {
    const minSpawnTime = 3000;
    const maxSpawnTime = 7000;
    const delay        = Math.floor(Math.random()*(maxSpawnTime-minSpawnTime+1)) + minSpawnTime;

    powerUpSpawnTimer = setTimeout(() => {
        spawnPowerUp();
        scheduleNextPowerUpSpawn();
    }, delay);
}

function spawnPowerUp() {
    if (powerUp.isSpawning || powerUp.isActive || powerUp.isDespawning || gameOver) return;

    // freeze=40%, slow=40%, doubleScore=20%
    const chance = Math.random();
    if (chance < 0.4) {
        powerUp.type = 'freeze';
    } else if (chance < 0.8) {
        powerUp.type = 'slow';
    } else {
        powerUp.type = 'doubleScore';
    }

    const margin = powerUp.radius;
    powerUp.x = Math.random()*(canvas.width - margin*2)+ margin;
    powerUp.y = Math.random()*(canvas.height- margin*2)+ margin;

    powerUp.isActive     = false;
    powerUp.isSpawning   = true;
    powerUp.isDespawning = false;
    powerUp.scale        = 0;
}

/************************************************/
/* 20) Power-Up Update & Collision Check        */
/************************************************/
function updatePowerUp() {
    if (powerUp.isSpawning) {
        powerUp.scale += 0.1;
        if (powerUp.scale >= 1) {
            powerUp.scale   = 1;
            powerUp.isSpawning = false;
            powerUp.isActive   = true;
            powerUpSpawnTime   = performance.now();
        }
    } else if (powerUp.isDespawning) {
        powerUp.scale -= 0.1;
        if (powerUp.scale <= 0) {
            powerUp.scale        = 0;
            powerUp.isDespawning = false;
            powerUp.isActive     = false;
        }
    } else if (powerUp.isActive) {
        if (performance.now() - powerUpSpawnTime > 3000) {
            powerUp.isActive     = false;
            powerUp.isDespawning = true;
        } else {
            checkPowerUpCollision();
        }
    }
}

function checkPowerUpCollision() {
    const distX = headX - powerUp.x;
    const distY = headY - powerUp.y;
    const dist  = Math.sqrt(distX*distX + distY*distY);
    if (dist < headRadius + powerUp.radius * powerUp.scale) {
        powerUpSound.play().catch(err => console.log(err));

        powerUp.isActive     = false;
        powerUp.isDespawning = true;

        if (powerUp.type === 'freeze') {
            applyFreezePowerUp();
        } else if (powerUp.type === 'slow') {
            applySlowDownPowerUp();
        } else {
            applyDoubleScorePowerUp();
        }
    }
}

/************************************************/
/* 21) Power-Up Effects                         */
/************************************************/
function applySlowDownPowerUp() {
    speedFactor = 0.5;
    setTimeout(() => {
        speedFactor = 1;
    }, 4000);
}

function applyFreezePowerUp() {
    freezePrevDX = ballDX;
    freezePrevDY = ballDY;
    ballDX=0;
    ballDY=0;
    isBallFrozen=true;
    setTimeout(() => {
        ballDX= freezePrevDX;
        ballDY= freezePrevDY;
        isBallFrozen=false;
    }, 1500);
}

function applyDoubleScorePowerUp() {
    doubleScoreActive= true;
    setTimeout(() => {
        doubleScoreActive= false;
    }, 5000);
}

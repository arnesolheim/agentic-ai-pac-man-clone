const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const highScoreElement = document.getElementById('high-score');
const statusElement = document.getElementById('game-status');

class SoundManager {
    constructor() {
        this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }

    playMunch() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(100, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(300, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playPowerPellet() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playEatGhost() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(500, this.ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(1000, this.ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playDeath() {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 1.5);
        gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.01, this.ctx.currentTime + 1.5);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 1.5);
    }
}

const sounds = new SoundManager();

const TILE_SIZE = 16;
const COLS = 28;
const ROWS = 31;

const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,2,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,2,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,3,1,1,3,1,1,1,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,1,1,1,3,1,1,3,1,1,1,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,3,3,3,3,3,3,3,3,3,3,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,3,1,1,1,4,4,1,1,1,3,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,3,1,5,5,5,5,5,5,1,3,1,1,0,1,1,1,1,1,1],
    [3,3,3,3,3,3,0,3,3,3,1,5,5,5,5,5,5,1,3,3,3,0,3,3,3,3,3,3],
    [1,1,1,1,1,1,0,1,1,3,1,5,5,5,5,5,5,1,3,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,3,1,1,1,1,1,1,1,1,3,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,3,3,3,3,3,3,3,3,3,3,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,3,1,1,1,1,1,1,1,1,3,1,1,0,1,1,1,1,1,1],
    [1,1,1,1,1,1,0,1,1,3,1,1,1,1,1,1,1,1,3,1,1,0,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,0,1,1,1,1,0,1,1,1,1,1,0,1,1,0,1,1,1,1,1,0,1,1,1,1,0,1],
    [1,2,0,0,1,1,0,0,0,0,0,0,0,3,3,0,0,0,0,0,0,0,1,1,0,0,2,1],
    [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
    [1,1,1,0,1,1,0,1,1,0,1,1,1,1,1,1,1,1,0,1,1,0,1,1,0,1,1,1],
    [1,0,0,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,1,1,0,0,0,0,0,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,1,1,1,1,1,1,1,1,1,1,0,1,1,0,1,1,1,1,1,1,1,1,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

let score = 0;
let highScore = 0;
let lives = 3;
let gameRunning = false;
let frightenedMode = false;
let frightenedTimer = null;
let dotsRemaining = 0;

function initGame() {
    dotsRemaining = 0;
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            if (map[row][col] === 0 || map[row][col] === 2) dotsRemaining++;
        }
    }
    updateLivesUI();
}

function updateLivesUI() {
    const container = document.getElementById('lives-container');
    container.innerHTML = '';
    for (let i = 0; i < lives; i++) {
        const life = document.createElement('div');
        life.style.width = '15px';
        life.style.height = '15px';
        life.style.backgroundColor = '#FFFF00';
        life.style.borderRadius = '50%';
        container.appendChild(life);
    }
}

function resetPositions() {
    pacman.x = 14 * TILE_SIZE + TILE_SIZE / 2;
    pacman.y = 23 * TILE_SIZE + TILE_SIZE / 2;
    pacman.dir = { x: 0, y: 0 };
    pacman.nextDir = { x: 0, y: 0 };

    ghosts[0].x = 14 * TILE_SIZE + TILE_SIZE / 2; ghosts[0].y = 11 * TILE_SIZE + TILE_SIZE / 2;
    ghosts[1].x = 14 * TILE_SIZE + TILE_SIZE / 2; ghosts[1].y = 14 * TILE_SIZE + TILE_SIZE / 2;
    ghosts[2].x = 12 * TILE_SIZE + TILE_SIZE / 2; ghosts[2].y = 14 * TILE_SIZE + TILE_SIZE / 2;
    ghosts[3].x = 16 * TILE_SIZE + TILE_SIZE / 2; ghosts[3].y = 14 * TILE_SIZE + TILE_SIZE / 2;}

class Ghost {
    constructor(x, y, color, name) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.name = name;
        this.radius = TILE_SIZE / 2 - 1;
        this.speed = 1;
        this.dir = { x: 1, y: 0 };
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, Math.PI, 0);
        ctx.lineTo(this.x + this.radius, this.y + this.radius);
        ctx.lineTo(this.x - this.radius, this.y + this.radius);
        ctx.fillStyle = frightenedMode ? '#2121DE' : this.color;
        ctx.fill();
        ctx.closePath();

        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(this.x - 3, this.y - 2, 2, 0, Math.PI * 2);
        ctx.arc(this.x + 3, this.y - 2, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(this.x - 3 + this.dir.x, this.y - 2 + this.dir.y, 1, 0, Math.PI * 2);
        ctx.arc(this.x + 3 + this.dir.x, this.y - 2 + this.dir.y, 1, 0, Math.PI * 2);
        ctx.fill();
    }

    update() {
        const currentSpeed = frightenedMode ? 1.0 : this.speed;
        
        if (Number.isInteger((this.x - TILE_SIZE / 2) / TILE_SIZE) && 
            Number.isInteger((this.y - TILE_SIZE / 2) / TILE_SIZE)) {
            
            const availableDirs = this.getAvailableDirs();
            const filteredDirs = availableDirs.filter(d => !(d.x === -this.dir.x && d.y === -this.dir.y));
            
            if (filteredDirs.length > 0) {
                this.dir = filteredDirs[Math.floor(Math.random() * filteredDirs.length)];
            } else if (availableDirs.length > 0) {
                this.dir = availableDirs[0];
            }
        }

        this.x += this.dir.x * currentSpeed;
        this.y += this.dir.y * currentSpeed;

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
    }

    getAvailableDirs() {
        const dirs = [
            { x: 1, y: 0 }, { x: -1, y: 0 },
            { x: 0, y: 1 }, { x: 0, y: -1 }
        ];
        return dirs.filter(d => this.canMove(d));
    }

    canMove(dir) {
        const col = Math.floor((this.x + dir.x * TILE_SIZE / 2) / TILE_SIZE) + dir.x;
        const row = Math.floor((this.y + dir.y * TILE_SIZE / 2) / TILE_SIZE) + dir.y;

        if (map[row] && map[row][col] === 1) {
            return false;
        }
        return true;
    }}

const ghosts = [
    new Ghost(14 * TILE_SIZE + TILE_SIZE/2, 11 * TILE_SIZE + TILE_SIZE/2, '#FF0000', 'Blinky'),
    new Ghost(14 * TILE_SIZE + TILE_SIZE/2, 14 * TILE_SIZE + TILE_SIZE/2, '#FFB8FF', 'Pinky'),
    new Ghost(12 * TILE_SIZE + TILE_SIZE/2, 14 * TILE_SIZE + TILE_SIZE/2, '#00FFFF', 'Inky'),
    new Ghost(16 * TILE_SIZE + TILE_SIZE/2, 14 * TILE_SIZE + TILE_SIZE/2, '#FFB852', 'Clyde')
];

class Pacman {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = TILE_SIZE / 2 - 1;
        this.speed = 2;
        this.dir = { x: 0, y: 0 };
        this.nextDir = { x: 0, y: 0 };
        this.mouthOpen = 0;
        this.mouthSpeed = 0.1;
    }

    draw() {
        const angle = Math.atan2(this.dir.y, this.dir.x);
        const mouthWidth = 0.2 * Math.PI * Math.sin(this.mouthOpen);

        ctx.beginPath();
        if (this.dir.x === 0 && this.dir.y === 0) {
            ctx.arc(this.x, this.y, this.radius, 0.2 * Math.PI, 1.8 * Math.PI);
        } else {
            ctx.arc(this.x, this.y, this.radius, angle + mouthWidth, angle + 2 * Math.PI - mouthWidth);
        }
        ctx.lineTo(this.x, this.y);
        ctx.fillStyle = '#FFFF00';
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.mouthOpen += this.mouthSpeed;
        if (this.mouthOpen > Math.PI || this.mouthOpen < 0) this.mouthSpeed *= -1;

        if (this.nextDir.x !== 0 || this.nextDir.y !== 0) {
            if (this.nextDir.x !== this.dir.x || this.nextDir.y !== this.dir.y) {
                if (this.nextDir.x === -this.dir.x && this.nextDir.y === -this.dir.y) {
                    this.dir = { ...this.nextDir };
                } else {
                    const isCenteredX = Number.isInteger((this.x - TILE_SIZE / 2) / TILE_SIZE);
                    const isCenteredY = Number.isInteger((this.y - TILE_SIZE / 2) / TILE_SIZE);
                    if (isCenteredX && isCenteredY) {
                        if (this.canMove(this.nextDir)) {
                            this.dir = { ...this.nextDir };
                        }
                    } else if (!this.canMove(this.dir)) {
                        const centerX = Math.round((this.x - TILE_SIZE / 2) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
                        const centerY = Math.round((this.y - TILE_SIZE / 2) / TILE_SIZE) * TILE_SIZE + TILE_SIZE / 2;
                        if (Math.abs(this.x - centerX) <= 4 && Math.abs(this.y - centerY) <= 4) {
                            const originalX = this.x;
                            const originalY = this.y;
                            this.x = centerX;
                            this.y = centerY;
                            if (this.canMove(this.nextDir)) {
                                this.dir = { ...this.nextDir };
                            } else {
                                this.x = originalX;
                                this.y = originalY;
                            }
                        }
                    }
                }
            }
        }

        if (this.canMove(this.dir)) {
            this.x += this.dir.x * this.speed;
            this.y += this.dir.y * this.speed;
        }

        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;

        this.eat();
        this.checkGhostCollision();
    }

    canMove(dir) {
        const nextX = this.x + dir.x * this.speed;
        const nextY = this.y + dir.y * this.speed;
        const margin = 2;
        const checkPoints = [
            { x: nextX - this.radius + margin, y: nextY - this.radius + margin },
            { x: nextX + this.radius - margin, y: nextY - this.radius + margin },
            { x: nextX - this.radius + margin, y: nextY + this.radius - margin },
            { x: nextX + this.radius - margin, y: nextY + this.radius - margin }
        ];

        for (const pt of checkPoints) {
            const col = Math.floor(pt.x / TILE_SIZE);
            const row = Math.floor(pt.y / TILE_SIZE);
            if (map[row] && (map[row][col] === 1 || map[row][col] === 4)) return false;
        }
        return true;
    }

    eat() {
        const col = Math.floor(this.x / TILE_SIZE);
        const row = Math.floor(this.y / TILE_SIZE);

        if (map[row][col] === 0) {
            map[row][col] = 3;
            score += 10;
            dotsRemaining--;
            updateUI();
            sounds.playMunch();
        } else if (map[row][col] === 2) {
            map[row][col] = 3;
            score += 50;
            dotsRemaining--;
            updateUI();
            sounds.playPowerPellet();
            activateFrightenedMode();
        }

        if (dotsRemaining === 0) {
            gameRunning = false;
            statusElement.innerText = 'YOU WIN!';
        }
    }

    checkGhostCollision() {
        ghosts.forEach(ghost => {
            const dx = this.x - ghost.x;
            const dy = this.y - ghost.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < this.radius + ghost.radius) {
                if (frightenedMode) {
                    score += 200;
                    updateUI();
                    sounds.playEatGhost();
                    ghost.x = 14 * TILE_SIZE + TILE_SIZE / 2;
                    ghost.y = 14 * TILE_SIZE + TILE_SIZE / 2;
                } else {
                    lives--;
                    updateLivesUI();
                    sounds.playDeath();
                    if (lives > 0) {
                        gameRunning = false;
                        statusElement.innerText = 'READY!';
                        setTimeout(() => {
                            resetPositions();
                            gameRunning = true;
                            statusElement.innerText = '';
                        }, 2000);
                    } else {
                        gameRunning = false;
                        statusElement.innerText = 'GAME OVER';
                    }
                }
            }
        });
    }
}

const pacman = new Pacman(14 * TILE_SIZE + TILE_SIZE / 2, 23 * TILE_SIZE + TILE_SIZE / 2);

function activateFrightenedMode() {
    frightenedMode = true;
    if (frightenedTimer) clearTimeout(frightenedTimer);
    frightenedTimer = setTimeout(() => {
        frightenedMode = false;
    }, 7000);
}

function updateUI() {
    scoreElement.innerText = score.toString().padStart(2, '0');
    if (score > highScore) {
        highScore = score;
        highScoreElement.innerText = highScore.toString().padStart(2, '0');
    }
}

function drawMap() {
    for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
            const tile = map[row][col];
            const x = col * TILE_SIZE;
            const y = row * TILE_SIZE;

            if (tile === 1) {
                ctx.fillStyle = '#2121DE';
                ctx.fillRect(x, y, TILE_SIZE, TILE_SIZE);
                ctx.fillStyle = 'black';
                ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            } else if (tile === 0) {
                ctx.fillStyle = '#FFB8AE';
                ctx.fillRect(x + TILE_SIZE / 2 - 1, y + TILE_SIZE / 2 - 1, 2, 2);
            } else if (tile === 2) {
                ctx.fillStyle = '#FFB8AE';
                ctx.beginPath();
                ctx.arc(x + TILE_SIZE / 2, y + TILE_SIZE / 2, 4, 0, Math.PI * 2);
                ctx.fill();
            } else if (tile === 4) {
                ctx.fillStyle = '#FFB8FF';
                ctx.fillRect(x, y + TILE_SIZE / 2 - 1, TILE_SIZE, 2);
            }
        }
    }
}

window.addEventListener('keydown', (e) => {
    if (sounds.ctx.state === 'suspended') {
        sounds.ctx.resume();
    }

    if (!gameRunning && lives > 0 && dotsRemaining > 0) {
        gameRunning = true;
        statusElement.innerText = '';
    }

    switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            pacman.nextDir = { x: 0, y: -1 }; break;
        case 'ArrowDown':
        case 's':
        case 'S':
            pacman.nextDir = { x: 0, y: 1 }; break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            pacman.nextDir = { x: -1, y: 0 }; break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            pacman.nextDir = { x: 1, y: 0 }; break;
    }
});

function draw() {
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawMap();
    pacman.draw();
    ghosts.forEach(ghost => ghost.draw());
}

function update() {
    if (gameRunning) {
        pacman.update();
        ghosts.forEach(ghost => ghost.update());
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();
initGame();

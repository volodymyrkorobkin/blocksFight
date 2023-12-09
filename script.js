
calcDistance = (x1, y1, x2, y2) => {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}


class Entity {
    constructor(x, y, width, height, color) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
    }
}


class Enemy extends Entity {
    constructor(x, y, width, height, color, type) {
        super(x, y, width, height, color);
        this.type = type;
        this.moveVector = {x: 0, y: 0};
    }
}


class Score {
    constructor() {
        this.highscore = this.readHighscore();
        this.score = 0;
    }

    addScore(amont) {
        this.score += amont;
    }

    readHighscore() {
        let highscore = localStorage.getItem("highscore");
        if (highscore === null) {
            highscore = 0;
        }
        return highscore;
    }

    saveScore() {
        if (this.score > this.highscore) {
            localStorage.setItem("highscore", this.score);      
        }
    }

}


class Game {
    constructor() {
        this.ENTITY_SIZE = 30;
        this.playerSpeed = 10;

        this.player = new Entity(10, 10, this.ENTITY_SIZE, this.ENTITY_SIZE, "blue"); 
        
        this.scoreContainer = document.getElementById("score");
        this.highscoreContainer = document.getElementById("highscore");
        this.tickContainer = document.getElementById("gametick");

        this.initCanvas();
        this.resetGame();
        this.initEventListeners();
    }

    initCanvas() {
        this.canvas = document.getElementById("game-canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 1200;
        this.canvas.height = 800;
    }

    isColliding(entity1, entity2) {
        if (entity1.x < entity2.x + entity2.width &&
            entity1.x + entity1.width > entity2.x &&
            entity1.y < entity2.y + entity2.height &&
            entity1.y + entity1.height > entity2.y) {
            return true;
        }
        return false;
    }

    initEventListeners() {
        const handledKeys = {"ArrowUp": "up", "ArrowDown": "down" , "ArrowLeft": "left", "ArrowRight": "right", "w": "up", "s": "down", "a": "left", "d": "right"};
        document.addEventListener("keydown", (event) => {
            if (event.key in handledKeys) {
                this.buttonsPressed[handledKeys[event.key]] = true;
            }
        });
        document.addEventListener("keyup", (event) => {
            if (event.key in handledKeys) {
                this.buttonsPressed[handledKeys[event.key]] = false;
            }
        });
    }

    tryToMove(entity, x = 0, y = 0) {
        if (entity.x + x >= 0 && entity.x + entity.width + x <= this.canvas.width) {
            entity.x += x;
        }
        if (entity.y + y >= 0 && entity.y + entity.height + y <= this.canvas.height) {
            entity.y += y;
        }
    }

    handlePlayerKeybordMove() {
        for (let key in this.buttonsPressed) {
            if (this.buttonsPressed[key]) {
                switch(key) {
                    case "up":
                        this.tryToMove(this.player, 0, -this.playerSpeed);
                        break;
                    case "down":
                        this.tryToMove(this.player, 0, this.playerSpeed);
                        break;
                    case "left":
                        this.tryToMove(this.player, -this.playerSpeed, 0);
                        break;
                    case "right":
                        this.tryToMove(this.player, this.playerSpeed, 0);
                        break;
                }
            }
        }
    }

    autoMoveEnemys() {
        const MAX_SPEED = 5;
        const ACCELERATION = 0.15;
        const RANDOM_MOLTIPILER = 2;

        for (let enemy of this.enemys) {
            this.tryToMove(enemy, enemy.moveVector.x, enemy.moveVector.y);


            if (enemy.type == "normal") {
                if (enemy.x + this.ENTITY_SIZE/2 < this.player.x) {
                        enemy.moveVector.x += ACCELERATION;
                    } else if (enemy.x - this.ENTITY_SIZE/2 > this.player.x) {
                        enemy.moveVector.x -= ACCELERATION;
                    }
                    if (enemy.y + this.ENTITY_SIZE/2 < this.player.y) {
                        enemy.moveVector.y += ACCELERATION;
                    } else if (enemy.y - this.ENTITY_SIZE/2 > this.player.y) {
                        enemy.moveVector.y -= ACCELERATION;
                    }
            }

            if (enemy.type == "blind") {
                if (Math.random() < 0.03) {
                    if (enemy.x + this.ENTITY_SIZE/2 < this.player.x) {
                        enemy.moveVector.x += ACCELERATION;
                    } else if (enemy.x - this.ENTITY_SIZE/2 > this.player.x) {
                        enemy.moveVector.x -= ACCELERATION;
                    }
                    if (enemy.y + this.ENTITY_SIZE/2 < this.player.y) {
                        enemy.moveVector.y += ACCELERATION;
                    } else if (enemy.y - this.ENTITY_SIZE/2 > this.player.y) {
                        enemy.moveVector.y -= ACCELERATION;
                    }
                }
            }

            // Add some randomness to the movement
            enemy.moveVector.x += (Math.random() * 0.5 - 0.25) * RANDOM_MOLTIPILER;
            enemy.moveVector.y += (Math.random() * 0.5 - 0.25) * RANDOM_MOLTIPILER;
        }
    }

    summonEnemy() {
        let enemy;
        do {
            let x = Math.random() * (this.canvas.width - this.ENTITY_SIZE);
            let y = Math.random() * (this.canvas.height - this.ENTITY_SIZE);

            if (Math.random() < 0.5) {
                enemy = new Enemy(x, y, this.ENTITY_SIZE, this.ENTITY_SIZE, "red", "normal");
            } else {
                enemy = new Enemy(x, y, this.ENTITY_SIZE, this.ENTITY_SIZE, "green", "blind");
            }
        } while (calcDistance(this.player.x, this.player.y, enemy.x, enemy.y) < 400);




        this.enemys.push(enemy);
    }


    update() {
        this.handlePlayerKeybordMove();

        this.autoMoveEnemys();

        if (this.gameTicks % 100 == 0) {
            this.summonEnemy();
        }

        this.score.addScore(this.enemys.length);

        for (let enemy of this.enemys) {
            if (!this.isColliding(this.player, enemy)) {
                continue;
            }
            alert("Game Over!");
            this.score.saveScore();
            this.resetGame();
        }


        this.gameTicks++;
    }

    cleanScreen() {
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = "lightgrey";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "black";
        this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
    }

    resetGame(){
        this.score = new Score();

        this.player.x = this.canvas.width/2 - this.ENTITY_SIZE/2;
        this.player.y = this.canvas.height/2 - this.ENTITY_SIZE/2;
        this.enemys = [];

        this.buttonsPressed = {};
        this.mousePositon = {x: this.player.x + this.ENTITY_SIZE/2, y: this.player.y + this.ENTITY_SIZE/2};
        this.gameTicks = 0;
    }

    drawEntity(entity) {
        this.ctx.lineWidth = 2;
        this.ctx.fillStyle = entity.color;
        this.ctx.fillRect(entity.x, entity.y, entity.width, entity.height);
    }

    draw() {
        this.cleanScreen();

        this.drawEntity(this.player);

        this.enemys.forEach(entity => {
            this.drawEntity(entity);
        });

        this.scoreContainer.innerHTML = this.score.score;
        this.highscoreContainer.innerHTML = this.score.highscore;
        
    }

    loop() {
        this.update();
        this.draw();
    }
}



let game = new Game();

setInterval(function() {
    game.loop();
}, 10);
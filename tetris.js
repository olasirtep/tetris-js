/*
 *   Author      : Petri Salo
 *   Description : Tetris clone
 *   Last Update : 26th October 2017
 */


// Array of different Tetris blocks and their different states
// Example
//  000010111 :
//                  000
//           X      010
//          XXX     111
//
//  If There is a empty row, like above, it must be the first row. Empty bottom row will cause broken hitdetection.

var formations = [
    ["000000111", "010010010", "000000111", "010010010"],
    ["000100111", "011010010", "000111001", "010010110"],
    ["000001111", "010010011", "000111100", "110010010"],
    ["000011011", "000011011", "000011011", "000011011"],
    ["000010111", "010011010", "000111010", "010110010"],
    ["000110011", "001011010", "000110011", "001011010"],
    ["000011110", "010011001", "000011110", "100110010"]
];

var colors = [
    "red",
    "green",
    "blue",
    "yellow",
    "pink",
    "cyan",
    "brown",
];

class gameWorld {
    constructor(width, height, block_width, block_height) {
        this.map = new Array(width).fill(null).map(() => new Array(height).fill(null)); // Creates 2D array of the gamemap
        this.w = width;
        this.h = height;
        this.bw = block_width;
        this.bh = block_height;
        this.updateCycle = 0;
        this.nextBlock = new Array(3).fill(null).map(() => new Array(3).fill(null));
    }

    update() {
        this.updateCycle++;
        // This for-loop goes the map over from bottom-right corner to top-left corner
        for (let y = this.h - 1; y > -1; y--) {
            for (let x = this.w - 1; x > -1; x--) {
                // If the block has not yet been updated on this cycle, update it
                if (this.map[x][y] && this.map[x][y].updateCycle < this.updateCycle) this.map[x][y].update();
            }
        }
    }
    drawMap() {
        gtx.clearRect(0, 0, c.width, c.height);
        for (let y = this.h - 1; y > -1; y--) {
            for (let x = this.w - 1; x > -1; x--) {
                if (this.map[x][y]) this.map[x][y].draw();
            }
        }
        gtx.drawImage(template, 0,0,c.width,c.height);
        gtx.fillStyle = "lime";
        let scoreX = 365;
        let tempScore = score;
        while(tempScore>10) {
            tempScore /= 10;
            scoreX -= 5;
        }
        gtx.fillText(score,scoreX,395,90);
        
        for (let y = 2; y > -1; y--) {
            for (let x = 2; x > -1; x--) {
                if (this.nextBlock[x][y]) this.nextBlock[x][y].draw();
            }
        }
    }
    // Method checks if there are full rows
    checkRows() {
        let blockCount = 0;
        let fullRows = 0;
        for (let y = this.h - 1; y > 0; y--) {
            for (let x = 0; x < this.w; x++) {
                if (this.map[x][y]) {
                    blockCount++;
                }
            }
            if (blockCount == this.w) {
                this.delRow(y);
                fullRows++;
                y++;
            }
            blockCount = 0;
        }
        if (fullRows > 0) score += (Math.pow(2, fullRows)) * 100;
    }
    // Method deletes full rows and moves others down
    delRow(y) {
        clearInterval(hitANDrun);
        for (let x = 0; x < this.w; x++) {
            this.map[x][y] = null;
        }
        for (y; y > 0; y--) {
            let yy = y - 1;
            for (let x = 0; x < this.w; x++) {

                if (!this.map[x][y]) {
                    this.map[x][y] = this.map[x][yy];
                    if (this.map[x][y]) {
                        this.map[x][y].x = x;
                        this.map[x][y].y = y;
                    }
                    this.map[x][yy] = null;
                }
                else if (this.map[x][yy].iteration != latestIteration) {
                    this.map[x][y] = this.map[x][yy];
                    if (this.map[x][y]) {
                        this.map[x][y].x = x;
                        this.map[x][y].y = y;
                    }
                    this.map[x][yy] = null;
                }
                else {}
            }
        }
        hitANDrun = setInterval(gravity, delay);
    }
    showNext() {
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                this.nextBlock[x][y] = null;
            }
        }
        
        let format = formations[nextForm][0];
        let i = 0;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (format[i] != "0") {
                    this.nextBlock[x][y] = new Block("white", nextForm, x+(345/this.bw), y+(80/this.bh), 0, y);
                }
                i++;
            }
        }
    }
}

class Block {
    constructor(color, colorCode, x, y, iteration, row) {
        this.color = color;
        this.colorCode = colorCode;
        this.x = x;
        this.y = y;
        this.updateCycle = 0;
        this.iteration = iteration;
        this.row = row;
    }

    update() {
        this.updateCycle++;
        // Following if-statements handle movement of objects downwards and handles hitdetection
        try {
            // If block is not in the bottom of map and there is not any other block under it (also block must be the currently playable one)
            if (!game.map[this.x][this.y + 1] && this.y < game.h - 1 && this.iteration == latestIteration) {
                game.map[this.x][this.y] = null;
                game.map[this.x][this.y + 1] = this;
                this.y++;
                if (this.row == 2) players[players.length - 1].bottomPos = this.y;
            }
            else if (this.iteration == latestIteration - 1 && this.y < players[players.length - 2].bottomPos && this.row == 2) {
                game.map[this.x][this.y] = null;
                game.map[this.x][this.y + 1] = this;
                this.y++;
            }
            else if (this.iteration == latestIteration - 1 && this.row == 1 && this.y < players[players.length - 2].bottomPos - 1) {
                game.map[this.x][this.y] = null;
                game.map[this.x][this.y + 1] = this;
                this.y++;
            }
            else if (this.iteration == latestIteration - 1 && this.row == 0 && this.y < players[players.length - 2].bottomPos - 2) {
                game.map[this.x][this.y] = null;
                game.map[this.x][this.y + 1] = this;
                this.y++;
            }

            if (checkRowsNext > 100) {
                game.checkRows();
                checkRowsNext = 0;
            }
            else if (checkRowsNext > 0) checkRowsNext++;

            if (this.y == game.h - 1 && this.iteration == latestIteration) {
                players.push(new Formation(nextForm, colors[nextForm]));
                nextForm = Math.floor(Math.random() * 7);
                game.showNext();
                checkRowsNext = 1;
                movePrevious = 1;
            }
            if (game.map[this.x][this.y + 1] && this.y < game.h - 1 && game.map[this.x][this.y + 1].iteration != this.iteration && this.iteration == latestIteration) {
                players.push(new Formation(nextForm, colors[nextForm]));
                nextForm = Math.floor(Math.random() * 7);
                game.showNext();
                checkRowsNext = 1;
                movePrevious = 1;
                // Game will end if the hit happened less than 4(index 3) blocks from the top
                if (this.y < 3) gameOver();
            }
        }
        catch (exception) {
            console.log(exception.name + " : " + exception.message)
        }
    }
    draw() {
        // Use the commented code if you're not using the sprites
        /*gtx.fillStyle = this.color;
        gtx.fillRect(this.x * game.bw, this.y * game.bh, game.bw, game.bh);*/
        gtx.drawImage(block_sprite, this.colorCode * 50, 0, 50, 50, this.x * game.bw, this.y * game.bh, game.bw, game.bh);

    }
}

class Formation {
    constructor(formationID, color) {
        this.body = Array();
        this.vx = 0;
        this.format = formations[formationID][0];
        this.formationID = formationID;
        this.bottomPos = 1;
        this.formation = 0;
        this.leftmost = game.w - 1;
        this.leftmostY = 0;
        this.rightmost = 0;
        this.rightmostY = 0;
        var startX = Math.floor(Math.random() * (game.w - 4));
        let i = 0;
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (this.format[i] != "0") {
                    game.map[startX + x][y] = new Block(color, formationID, startX + x, y, latestIteration + 1, y);
                    this.body.push(game.map[startX + x][y]);
                }
                i++;
            }
        }
        latestIteration++;
        this.iteration = latestIteration;
    }

    move() {
        this.leftmost = game.w-1;
        this.rightmost = 0;
        for (let j = 0; j < this.body.length; j++) {
            if (this.body[j].x < this.leftmost) {
                this.leftmost = this.body[j].x;
                this.leftmostY = this.body[j].y;
            }
            else if (this.body[j].x > this.rightmost) {
                this.rightmost = this.body[j].x;
                this.rightmostY = this.body[j].y;
            }
        }
        // MOVEMENT TO LEFT
        if (this.leftmost > 0) {
            if (game.map[this.leftmost - 1][this.leftmostY]) console.log("Movement to left blocked");
            else {
                if (this.vx < 0) {
                    let i = 0;
                    let part = this.body[i];
                    while (part) {
                        if (this.leftmost > 0) {
                            let x, y;
                            x = part.x;
                            y = part.y;
                            game.map[x][y] = null;
                            game.map[x + this.vx][y] = part;
                            part.x = x + this.vx;
                        }
                        i++;
                        part = this.body[i];
                    }
                }
            }
        }
        // MOVEMENT TO RIGHT
        if (this.rightmost < game.w - 1) {
            if (game.map[this.rightmost + 1][this.rightmostY]) console.log("Movement to right blocked");
            else {
                if (this.vx > 0) {
                    let i = this.body.length - 1;
                    let part = this.body[i];
                    while (part) {
                        if (this.rightmost < game.w - 1) {
                            let x, y;
                            x = part.x;
                            y = part.y;
                            game.map[x][y] = null;
                            game.map[x + this.vx][y] = part;
                            part.x = x + this.vx;
                        }
                        i--;
                        part = this.body[i];
                    }
                }
            }
        }
    }
    turn() {
        this.leftmost = game.w-1;
        this.rightmost = 0;
        for (let j = 0; j < this.body.length; j++) {
            if (this.body[j].x < this.leftmost) {
                this.leftmost = this.body[j].x;
                this.leftmostY = this.body[j].y;
            }
            else if (this.body[j].x > this.rightmost) {
                this.rightmost = this.body[j].x;
                this.rightmostY = this.body[j].y;
            }
        }
        if (this.rightmost < game.w - 1) {
            if (this.formation < 3) this.formation++;
            else this.formation = 0;
            for (let i = 0; i < this.body.length; i++) {
                game.map[this.body[i].x][this.body[i].y] = null;
            }
            let startX = this.body[0].x;
            let startY = this.body[0].y;
            let i = 0;
            let p = 0;
            let format = formations[this.formationID][this.formation];
            for (let y = 0; y < 3; y++) {
                for (let x = 0; x < 3; x++) {
                    if (format[i] != "0") {
                        game.map[startX + x][startY + y] = this.body[p];
                        this.body[p].x = startX + x;
                        this.body[p].y = startY + y;
                        this.body[p].row = y;
                        p++;
                    }
                    i++;
                }
            }
        }
    }
}

var latestIteration = 0;
window.addEventListener("keydown", KeyDown);
window.addEventListener("keyup", KeyUp);
var game = new gameWorld(15, 30, 20, 20);
let randomize = Math.floor(Math.random() * 5);
var nextForm = Math.floor(Math.random() * 7);
game.showNext();
var players = Array();
players.push(new Formation(randomize, colors[randomize]));
var c = document.createElement("canvas");
document.body.appendChild(c);
var gtx = c.getContext("2d");
var block_sprite = new Image();
var template = new Image();
var hitANDrun, refresh;

c.width = (game.w * game.bw) +150;
c.height = game.h * game.bh;
c.setAttribute("style", "background:black;border-radius:10px;");
var score = 0;
var checkRowsNext = 0;
gtx.font = "18px Monospace";

var speedUp = false;
var turnActive = false;
var delay = 200;
var movePrevious = 0;

template.onload = function () {
   refresh();

    hitANDrun = setInterval(gravity, delay);
    refresh = setInterval(refresh, delay / 2);
}
block_sprite.src = "assets/sprites/Tetris_sprite4.png";
template.src = "assets/images/Tetris_template.png";

function KeyDown(event) {
    if([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
        event.preventDefault();
    }
    var key = event.keyCode;
    let lastPlayer = players.length - 1;
    if (movePrevious > 0 && movePrevious < 2) {
        lastPlayer--;
    }
    if (key == 38) {
        players[lastPlayer].vx = 0;
        if (!turnActive && movePrevious == 0) {
            players[lastPlayer].turn();
            turnActive = true;
        }
    } // UP
    if (key == 40) {
        players[lastPlayer].vx = 0;
        if (!speedUp) {
            clearInterval(hitANDrun);
            hitANDrun = setInterval(gravity, delay / 4);
            speedUp = true;
        }
    } // DOWN
    if (key == 37) {
        players[lastPlayer].vx = -1;
    } // LEFT
    if (key == 39) {
        players[lastPlayer].vx = 1;
    } // RIGHT
}

function KeyUp(event) {
    var key = event.keyCode;
    let lastPlayer = players.length - 1;
    if (key == 38) {
        turnActive = false;
    } // UP
    if (key == 40) {
        clearInterval(hitANDrun);
        hitANDrun = setInterval(gravity, delay);
        speedUp = false;
    } // DOWN
    if (key == 37) {
        if (players[lastPlayer].vx < 0) players[lastPlayer].vx = 0;
    } // LEFT
    if (key == 39) {
        if (players[lastPlayer].vx > 0) players[lastPlayer].vx = 0;
    } // RIGHT
}


function refresh() {
    let lastPlayer = players.length - 1;
    if (movePrevious > 0 && movePrevious < 2) {
        lastPlayer--;
        movePrevious++;
    }
    else if (movePrevious > 1) movePrevious = 0;
    players[lastPlayer].move();
    game.drawMap();

}

function gravity() {
    game.update();
}

function gameOver() {
    clearInterval(hitANDrun);
    clearInterval(refresh)
    Theme.pause();
    Theme.removeEventListener("ended", function() {});
    alert("Score : "+score);
}

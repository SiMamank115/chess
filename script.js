let board,
    gameStart = true,
    marginX,
    marginY,
    test;
const pieceType = ["pawn", "rook", "knight", "bishop", "queen", "king"],
    images = {};
async function preload() {
    loadJSON("./list.json", (e) => {
        e.piece.forEach((i, x) => {
            images[e.index[x]] = loadImage(i);
        });
    });
}
function setup() {
    createCanvas(600, 600);
    board = new Board();
    marginX = board.tileWidth * 0.2;
    marginY = board.tileHeight * 0.2;
    test = new Piece(7, 7, "bishop", true);
}
function draw() {
    background("#252422");
    board.draw();
    test.draw();
}
class Board {
    constructor() {
        this.tileWidth = width * 0.125;
        this.tileHeight = height * 0.125;
    }
    draw() {
        fill("#e9ecef").strokeWeight(0);
        for (let i = 0; i < 8; i += 2) {
            for (let o = 0; o < 8; o += 1) {
                rect(this.tileWidth * (o % 2 ? i + 1 : i), this.tileHeight * o, this.tileWidth, this.tileHeight);
            }
        }
        return true;
    }
}
class Piece {
    constructor(x, y, type = "pawn", black = false) {
        this.pos = createVector(x, y);
        this.type = type;
        this.color = black ? "black" : "white";
        this.index = `${this.type}_${this.color}`;
        this.width = (board?.tileWidth ?? width * 0.125) - marginX ?? 0;
        this.height = (board?.tileHeight ?? height * 0.125) - marginY ?? 0;
    }
    draw() {
        image(images[this.index], this.getPosition().x, this.getPosition().y, this.width, this.height);
    }
    getPosition() {
        return {
            x: (this.pos.x * board?.tileWidth ?? width * 0.125) + marginX * 0.5,
            y: (this.pos.y * board?.tileHeight ?? width * 0.125) + marginY * 0.5,
        };
    }
}
let gameStart = true,
    marginX,
    marginY,
    board = [],
    focusOn = false;
const PieceType = ["pawn", "rook", "knight", "bishop", "queen", "king"],
    Images = {},
    Pieces = {
        black: [],
        white: [],
    },
    BLACK = "#252422",
    WHITE = "#e9ecef";
async function preload() {
    loadJSON("./assets/json/list.json", (e) => {
        e.piece.forEach((i, x) => {
            Images[e.index[x]] = loadImage(i);
        });
    });
}
function setup() {
    createCanvas(600, 600);
    window.TILE_WIDTH = width * 0.125;
    window.TILE_HEIGHT = height * 0.125;
    marginX = TILE_WIDTH * 0.3;
    marginY = TILE_HEIGHT * 0.3;
    boardInitialize();
    // "76543210".split("").forEach((e, x) => {
    //     Pieces.white.push(new Bishop(x, parseInt(e), false));
    // });
    Pieces.white.push(new Knight(2, 4, false));
    Pieces.black.push(new Rook(0, 1, true));
    Pieces.black.push(new Queen(1, 6, true));
    // Pieces.white.push(new Pawn(3, 3, true));
}
function draw() {
    if (frameCount % 3 == 0) document.title = "Chess | " + frameRate().toFixed(1);
    board.forEach((tile) => tile.draw());
    Pieces.black.forEach((piece) => piece.draw());
    Pieces.white.forEach((piece) => piece.draw());
    if (focusOn) {
        push();
        fill("#0466c8").strokeWeight(0);
        focusOn.getMovement().forEach((e) => {
            rect(TILE_WIDTH * e.x + marginX * 1.3, TILE_HEIGHT * e.y + marginY * 1.3, TILE_WIDTH - marginX * 2.6, TILE_HEIGHT - marginY * 2.6, 1000);
        });
        let border = 3;
        fill("#00000000")
            .strokeWeight(border * 2)
            .stroke("#0466c8")
            .rect(TILE_WIDTH * focusOn.pos.x + border, TILE_HEIGHT * focusOn.pos.y + border, TILE_WIDTH - border * 2, TILE_HEIGHT - border * 2);
        pop();
    }
}
function boardInitialize() {
    let wd = TILE_WIDTH;
    let hg = TILE_HEIGHT;
    for (let i = 0; i < 8; i++) {
        for (let o = 0; o < 8; o++) {
            let a = getClickable(wd * i, hg * o, wd, hg, (o % 2 == 0 && i % 2 == 1) || (o % 2 == 1 && i % 2 == 0) ? BLACK : WHITE); // hitam putih
            a.onRelease = () => {
                focusOn = boardClicked(i, o);
            };
            board.push(a);
        }
    }
}
function getClickable(x, y, w, d, c = WHITE) {
    let res = new Clickable();
    res.locate(x, y);
    res.resize(w, d);
    res.color = c;
    res.cornerRadius = 0;
    res.strokeWeight = 0;
    res.text = "";
    return res;
}
function boardClicked(x, y) {
    let pos = createVector(x, y),
        exist = false;
    Pieces.black.forEach((e) => {
        if (!exist && e.pos.x == pos.x && e.pos.y == pos.y) {
            exist = e;
        }
    });
    Pieces.white.forEach((e) => {
        if (!exist && e.pos.x == pos.x && e.pos.y == pos.y) {
            exist = e;
        }
    });
    return exist;
}
function piecePositionMatcher(vector = new p5.Vector()) {
    let pieceExist = false;
    Pieces.black.forEach((e) => {
        if (!pieceExist && e.pos.x == vector.x && e.pos.y == vector.y) {
            pieceExist = e;
        }
    });
    Pieces.white.forEach((e) => {
        if (!pieceExist && e.pos.x == vector.x && e.pos.y == vector.y) {
            pieceExist = e;
        }
    });
    return pieceExist;
}
class Piece {
    constructor(x, y, type = "pawn", black = false) {
        this.pos = createVector(x, y);
        this.type = type;
        this.color = black ? "black" : "white";
        this.index = `${this.type}_${this.color}`;
        this.width = TILE_WIDTH - marginX ?? 0;
        this.height = TILE_HEIGHT - marginY ?? 0;
    }
    draw() {
        image(Images[this.index], this.getPosition().x, this.getPosition().y, this.width, this.height);
    }
    getPosition() {
        return {
            x: this.pos.x * TILE_WIDTH + marginX * 0.5,
            y: this.pos.y * TILE_HEIGHT + marginY * 0.5,
        };
    }
}
class Pawn extends Piece {
    constructor(x, y, black = false) {
        super(x, y, "pawn", black);
    }
    getMovement() {
        let move = [],
            up = this.color == "black",
            eq = up ? 1 : -1; // black and white equation
        if ((this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) && !((this.pos.y < 7 && up) || (this.pos.y > 0 && !up))) return;
        let straight1 = piecePositionMatcher(createVector(this.pos.x, this.pos.y + 1 * eq));
        let straight2 = piecePositionMatcher(createVector(this.pos.x, this.pos.y + 2 * eq));
        if (this.pos.y == (up ? 1 : 6) && !straight1 && !straight2) move.push(createVector(this.pos.x, this.pos.y + 2 * eq));
        if (!straight1) move.push(createVector(this.pos.x, this.pos.y + 1 * eq));
        let enemyLeftSide = piecePositionMatcher(createVector(this.pos.x + 1 * eq, this.pos.y + 1 * eq));
        if (enemyLeftSide && enemyLeftSide.color != this.color) move.push(createVector(this.pos.x + 1 * eq, this.pos.y + 1 * eq));
        let enemyRightSide = piecePositionMatcher(createVector(this.pos.x - 1 * eq, this.pos.y + 1 * eq));
        if (enemyRightSide && enemyRightSide.color != this.color) move.push(createVector(this.pos.x - 1 * eq, this.pos.y + 1 * eq));
        return move;
    }
}
class Bishop extends Piece {
    constructor(x, y, black = true) {
        super(x, y, "bishop", black);
    }
    getMovement() {
        let move = [];
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return;
        let quad1 = false,
            quad2 = false,
            quad3 = false,
            quad4 = false;
        for (let i = 1; i <= 7; i++) {
            if (!(quad4 || this.pos.x + i > 7 || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y + i));
                if (!posMatch) move.push(createVector(this.pos.x + i, this.pos.y + i));
                if (posMatch) quad4 = true;
            }
            if (!(quad3 || this.pos.x - i < 0 || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y + i));
                if (!posMatch) move.push(createVector(this.pos.x - i, this.pos.y + i));
                if (posMatch) quad3 = true;
            }
            if (!(quad2 || this.pos.x - i < 0 || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y - i));
                if (!posMatch) move.push(createVector(this.pos.x - i, this.pos.y - i));
                if (posMatch) quad2 = true;
            }
            if (!(quad1 || this.pos.x + i > 7 || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y - i));
                if (!posMatch) move.push(createVector(this.pos.x + i, this.pos.y - i));
                if (posMatch) quad1 = true;
            }
        }
        return move;
    }
}
class Rook extends Piece {
    constructor(x, y, black = true) {
        super(x, y, "rook", black);
    }
    getMovement() {
        let move = [];
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return;
        let up = false,
            left = false,
            bottom = false,
            right = false;
        for (let i = 1; i <= 7; i++) {
            if (!(right || this.pos.x + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y));
                if (!posMatch) move.push(createVector(this.pos.x + i, this.pos.y));
                if (posMatch) right = true;
            }
            if (!(bottom || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x, this.pos.y + i));
                if (!posMatch) move.push(createVector(this.pos.x, this.pos.y + i));
                if (posMatch) bottom = true;
            }
            if (!(left || this.pos.x - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y));
                if (!posMatch) move.push(createVector(this.pos.x - i, this.pos.y));
                if (posMatch) left = true;
            }
            if (!(up || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x, this.pos.y - i));
                if (!posMatch) move.push(createVector(this.pos.x, this.pos.y - i));
                if (posMatch) up = true;
            }
        }
        return move;
    }
}
class Queen extends Piece {
    constructor(x, y, black = true) {
        super(x, y, "queen", black);
    }
    getMovement() {
        let move = [];
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return;
        let up = false,
            left = false,
            bottom = false,
            right = false;
        for (let i = 1; i <= 7; i++) {
            if (!(right || this.pos.x + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y));
                if (!posMatch) move.push(createVector(this.pos.x + i, this.pos.y));
                if (posMatch) right = true;
            }
            if (!(bottom || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x, this.pos.y + i));
                if (!posMatch) move.push(createVector(this.pos.x, this.pos.y + i));
                if (posMatch) bottom = true;
            }
            if (!(left || this.pos.x - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y));
                if (!posMatch) move.push(createVector(this.pos.x - i, this.pos.y));
                if (posMatch) left = true;
            }
            if (!(up || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x, this.pos.y - i));
                if (!posMatch) move.push(createVector(this.pos.x, this.pos.y - i));
                if (posMatch) up = true;
            }
        }
        let quad1 = false,
            quad2 = false,
            quad3 = false,
            quad4 = false;
        for (let i = 1; i <= 7; i++) {
            if (!(quad4 || this.pos.x + i > 7 || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y + i));
                if (!posMatch) move.push(createVector(this.pos.x + i, this.pos.y + i));
                if (posMatch) quad4 = true;
            }
            if (!(quad3 || this.pos.x - i < 0 || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y + i));
                if (!posMatch) move.push(createVector(this.pos.x - i, this.pos.y + i));
                if (posMatch) quad3 = true;
            }
            if (!(quad2 || this.pos.x - i < 0 || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y - i));
                if (!posMatch) move.push(createVector(this.pos.x - i, this.pos.y - i));
                if (posMatch) quad2 = true;
            }
            if (!(quad1 || this.pos.x + i > 7 || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y - i));
                if (!posMatch) move.push(createVector(this.pos.x + i, this.pos.y - i));
                if (posMatch) quad1 = true;
            }
        }
        return move;
    }
}
class King extends Piece {
    constructor(x, y, black = true) {
        super(x, y, "king", black);
    }
    getMovement() {
        let move = [];
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return;
        let algoritm = [
            [this.pos.x + 1, this.pos.y],
            [this.pos.x + 1, this.pos.y - 1],
            [this.pos.x, this.pos.y - 1],
            [this.pos.x - 1, this.pos.y - 1],
            [this.pos.x - 1, this.pos.y],
            [this.pos.x - 1, this.pos.y + 1],
            [this.pos.x, this.pos.y + 1],
            [this.pos.x + 1, this.pos.y + 1],
        ];
        algoritm.forEach((e) => {
            if (e[0] >= 0 && e[0] <= 7 && e[1] >= 0 && e[1] <= 7) {
                let posMatch = piecePositionMatcher(createVector(e[0], e[1]));
                if (!posMatch  || posMatch.color != this.color) move.push(createVector(e[0], e[1]));
            }
        });
        return move;
    }
}
class Knight extends Piece {
    constructor(x, y, black = true) {
        super(x, y, "knight", black);
    }
    getMovement() {
        let move = [];
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return;
        let algoritm = [
            [this.pos.x + 2, this.pos.y + 1],
            [this.pos.x + 2, this.pos.y - 1],
            [this.pos.x + 1, this.pos.y - 2],
            [this.pos.x - 1, this.pos.y - 2],
            [this.pos.x - 2, this.pos.y - 1],
            [this.pos.x - 2, this.pos.y + 1],
            [this.pos.x + 1, this.pos.y + 2],
            [this.pos.x - 1, this.pos.y + 2],
        ];
        algoritm.forEach((e) => {
            if (e[0] >= 0 && e[0] <= 7 && e[1] >= 0 && e[1] <= 7) {
                let posMatch = piecePositionMatcher(createVector(e[0], e[1]));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(e[0], e[1]));
            }
        });
        return move;
    }
}

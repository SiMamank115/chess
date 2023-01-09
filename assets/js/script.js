let gameStart = true,
    marginX,
    marginY,
    board = [],
    onMoveAnimation = false,
    playing = false,
    turn = "white",
    promotionTarget,
    focusOn = false;
const PieceType = ["pawn", "rook", "knight", "bishop", "queen", "king"],
    Images = {},
    Pieces = {
        black: [],
        white: [],
    },
    Check = {
        mate: false,
        white: false,
        black: false,
    },
    ActionHeight = 50,
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
    Check.white.__proto__.piece = [];
    Check.black.__proto__.piece = [];
    createCanvas(560, 660);
    window.TILE_WIDTH = width * 0.125;
    window.TILE_HEIGHT = (height - ActionHeight * 2) * 0.125;
    marginX = TILE_WIDTH * 0.3;
    marginY = TILE_HEIGHT * 0.3;
    boardInitialize();
    start();
}
function start() {
    playing = true;
    turn = "white";
    Pieces.black = [];
    Pieces.white = [];
    let addBlack = (e) => Pieces.black.push(e);
    let addWhite = (e) => Pieces.white.push(e);
    for (let i = 0; i < 8; i++) {
        i == 4 && (addWhite(new King(i, 7, false)), addBlack(new King(i, 0, true)));
        i == 3 && (addWhite(new Queen(i, 7, false)), addBlack(new Queen(i, 0, true)));
        (i == 0 || i == 7) && (addWhite(new Rook(i, 7, false)), addBlack(new Rook(i, 0, true)));
        (i == 1 || i == 6) && (addWhite(new Knight(i, 7, false)), addBlack(new Knight(i, 0, true)));
        (i == 2 || i == 5) && (addWhite(new Bishop(i, 7, false)), addBlack(new Bishop(i, 0, true)));
        addWhite(new Pawn(i, 6, false));
        addBlack(new Pawn(i, 1, true));
    }
}
function draw() {
    background("#ced4da")
    if (frameCount % 100 == 0) {
        let a = (a, b) => (a.type == "pawn" || b.type == "king" || (a.type == "queen" && b.type == "rook") || (a.type == "rook" && b.type == "bishop") || (a.type == "bishop" && b.type == "knight") ? -1 : 1);
        Pieces.black.sort(a);
        Pieces.white.sort(a);
    }
    if (frameCount % 3 == 0) document.title = "Chess | " + frameRate().toFixed(1);
    board.forEach((tile) => tile.draw());
    Pieces.black = Pieces.black.filter((piece) => !piece.died);
    Pieces.white = Pieces.white.filter((piece) => !piece.died);
    if (focusOn) {
        let border = 2.5;
        push();
        focusOn.getMovement().forEach((e) => {
            if (piecePositionMatcher(e) || e?.castling) {
                fill("#ffffff00").strokeWeight(0).stroke("#0466c8c9");
                strokeWeight(border * 22);
                rect(TILE_WIDTH * e.x + marginX * 1.5, TILE_HEIGHT * e.y + marginY * 1.5 + ActionHeight, TILE_WIDTH - marginX * 3, TILE_HEIGHT - marginY * 3, 1000);
            } else {
                fill("#0466c8c9").strokeWeight(0);
                rect(TILE_WIDTH * e.x + marginX * 1.3, TILE_HEIGHT * e.y + marginY * 1.3 + ActionHeight, TILE_WIDTH - marginX * 2.6, TILE_HEIGHT - marginY * 2.6, 1000);
            }
        });
        fill("#00000000")
            .strokeWeight(border * 2)
            .stroke("#0466c8")
            .rect(TILE_WIDTH * focusOn.pos.x + border, TILE_HEIGHT * focusOn.pos.y + border + ActionHeight, TILE_WIDTH - border * 2, TILE_HEIGHT - border * 2);
        pop();
    }
    Pieces.black.forEach((piece) => piece.draw());
    Pieces.white.forEach((piece) => piece.draw());
}
function boardInitialize() {
    let wd = TILE_WIDTH;
    let hg = TILE_HEIGHT;
    for (let i = 0; i < 8; i++) {
        for (let o = 0; o < 8; o++) {
            let a = getClickable(wd * i, hg * o + ActionHeight, wd, hg, (o % 2 == 0 && i % 2 == 1) || (o % 2 == 1 && i % 2 == 0) ? BLACK : WHITE); // hitam putih
            a.onRelease = () => {
                let clickedPiece = piecePositionMatcher(createVector(i, o)),
                    clickedMove = movePositionMatcher(createVector(i, o));
                if (onMoveAnimation || !playing || (playing && clickedPiece && !clickedMove && clickedPiece?.color != turn)) return;
                if (focusOn && clickedMove) {
                    focusOn.move(clickedMove);
                    clickedMove?.castling?.move(createVector(i - (i == 2 ? -1 : 1), o), true);
                    clickedPiece?.die?.();
                    focusOn = undefined;
                    turn = turn == "black" ? "white" : "black";
                    return;
                }
                focusOn = clickedPiece;
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
function movePositionMatcher(vector = new p5.Vector()) {
    let moveExist;
    if (focusOn) {
        focusOn.getMovement().forEach((e) => {
            if (!moveExist && e.x == vector.x && e.y == vector.y) {
                moveExist = e;
            }
        });
    }
    return moveExist;
}
function piecePositionMatcher(vector = new p5.Vector()) {
    let pieceExist;
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
function promotion(type = "queen") {
    let output = type == "queen" ? Queen : type == "rook" ? Rook : type == "bishop" ? Bishop : type == "knight" ? Knight : undefined;

    Swal?.close();
    let { pos, color } = promotionTarget;
    promotionTarget.die(true);
    Pieces[color].push(new output(pos.x, pos.y, color == "black"));
}
class Piece {
    constructor(x, y, type = "pawn", black = false) {
        this.pos = createVector(x, y);
        this.type = type;
        this.color = black ? "black" : "white";
        this.index = `${this.type}_${this.color}`;
        this.width = TILE_WIDTH - marginX ?? 0;
        this.height = TILE_HEIGHT - marginY ?? 0;
        this.moveDuration = 0.25;
        this.died = false;
        this.moved = false;
    }
    draw() {
        image(Images[this.index], this.getPosition().x, this.getPosition().y, this.width, this.height);
    }
    move(vector = new p5.Vector(), force = false) {
        if (onMoveAnimation && !force) return;
        this.moved = true;
        onMoveAnimation = true;
        let oncomp = () => (onMoveAnimation = false);
        // promotion
        if (this.type == "pawn" && vector.y == (this.color == "black" ? 7 : 0)) {
            oncomp = () => {
                onMoveAnimation = false;
                promotionTarget = this;
                Swal.fire({
                    title: "<strong>Promotion</strong>",
                    html: `
                        <div class="promotion ${this.color}">
                            <div onClick="promotion('queen')" class="queen-option"></div>
                            <div onClick="promotion('rook')" class="rook-option"></div>
                            <div onClick="promotion('bishop')" class="bishop-option"></div>
                            <div onClick="promotion('knight')" class="knight-option"></div>
                        </div>
                        `,
                    focusConfirm: false,
                    customClass: {
                        confirmButton: "hidden",
                    },
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    allowEnterKey: false,
                });
            };
        }
        return gsap.to(this.pos, {
            x: vector.x,
            y: vector.y,
            duration: this.moveDuration,
            ease: "power1.out",
            onComplete: oncomp,
        });
    }
    async die(auto = false) {
        await new Promise((r) => setTimeout(r, auto ? 0 : this.moveDuration * 250));
        this.pos = new p5.Vector(-1, -1);
        this.died = true;
    }
    getPosition() {
        return {
            x: this.pos.x * TILE_WIDTH + marginX * 0.5,
            y: this.pos.y * TILE_HEIGHT + marginY * 0.5 + ActionHeight,
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
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0 || (this.pos.y - 1 < 0 && !up) || (this.pos.y + 1 > 8 && up)) return move;
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
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return move;
        let [quad1, quad2, quad3, quad4] = [![], ![], ![], ![]];
        for (let i = 1; i <= 7; i++) {
            if (!(quad4 || this.pos.x + i > 7 || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y + i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x + i, this.pos.y + i));
                if (posMatch) quad4 = true;
            }
            if (!(quad3 || this.pos.x - i < 0 || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y + i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x - i, this.pos.y + i));
                if (posMatch) quad3 = true;
            }
            if (!(quad2 || this.pos.x - i < 0 || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y - i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x - i, this.pos.y - i));
                if (posMatch) quad2 = true;
            }
            if (!(quad1 || this.pos.x + i > 7 || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y - i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x + i, this.pos.y - i));
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
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return move;
        let up = false,
            left = false,
            bottom = false,
            right = false;
        for (let i = 1; i <= 7; i++) {
            if (!(right || this.pos.x + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x + i, this.pos.y));
                if (posMatch) right = true;
            }
            if (!(bottom || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x, this.pos.y + i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x, this.pos.y + i));
                if (posMatch) bottom = true;
            }
            if (!(left || this.pos.x - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x - i, this.pos.y));
                if (posMatch) left = true;
            }
            if (!(up || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x, this.pos.y - i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x, this.pos.y - i));
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
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return move;
        let up = false,
            left = false,
            bottom = false,
            right = false;
        for (let i = 1; i <= 7; i++) {
            if (!(right || this.pos.x + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x + i, this.pos.y));
                if (posMatch) right = true;
            }
            if (!(bottom || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x, this.pos.y + i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x, this.pos.y + i));
                if (posMatch) bottom = true;
            }
            if (!(left || this.pos.x - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x - i, this.pos.y));
                if (posMatch) left = true;
            }
            if (!(up || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x, this.pos.y - i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x, this.pos.y - i));
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
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x + i, this.pos.y + i));
                if (posMatch) quad4 = true;
            }
            if (!(quad3 || this.pos.x - i < 0 || this.pos.y + i > 7)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y + i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x - i, this.pos.y + i));
                if (posMatch) quad3 = true;
            }
            if (!(quad2 || this.pos.x - i < 0 || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x - i, this.pos.y - i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x - i, this.pos.y - i));
                if (posMatch) quad2 = true;
            }
            if (!(quad1 || this.pos.x + i > 7 || this.pos.y - i < 0)) {
                let posMatch = piecePositionMatcher(createVector(this.pos.x + i, this.pos.y - i));
                if (!posMatch || posMatch.color != this.color) move.push(createVector(this.pos.x + i, this.pos.y - i));
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
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return move;
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
                if (!posMatch || posMatch.color != this.color) move.push(createVector(e[0], e[1]));
            }
        });
        // castling
        let rookPos =
                "black" == this.color
                    ? [
                          [0, 0],
                          [7, 0],
                      ]
                    : [
                          [0, 7],
                          [7, 7],
                      ],
            p = piecePositionMatcher,
            leftRook = p(createVector(...rookPos[0])),
            rightRook = p(createVector(...rookPos[1]));
        if (!this.moved && (leftRook || rightRook)) {
            if (rightRook && !rightRook.moved && !p(createVector(this.pos.x + 1, this.pos.y)) && !p(createVector(this.pos.x + 2, this.pos.y))) {
                let castlingMove = createVector(this.pos.x + 2, this.pos.y);
                castlingMove.castling = rightRook;
                move.push(castlingMove);
            }
            if (leftRook && !leftRook.moved && !p(createVector(this.pos.x - 1, this.pos.y)) && !p(createVector(this.pos.x - 2, this.pos.y)) && !p(createVector(this.pos.x - 3, this.pos.y))) {
                let castlingMove = createVector(this.pos.x - 2, this.pos.y);
                castlingMove.castling = leftRook;
                move.push(castlingMove);
            }
        }
        return move;
    }
}
class Knight extends Piece {
    constructor(x, y, black = true) {
        super(x, y, "knight", black);
    }
    getMovement() {
        let move = [];
        if (this.pos.x > 7 || this.pos.x < 0 || this.pos.y > 7 || this.pos.y < 0) return move;
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
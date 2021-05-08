// BOARD COLUMN NAMES
const files = ['a','b','c','d','e','f','g', 'h'];
// THE ORIENTATION OF PIECES from column a to column h, plus pawn at the end
const pieces = ['R','N','B','Q','K','B','N','R','p'];

// A class representing a game of chess
export default class ChessGame {
    // Create a new game, given the initial parameter of what color one is choosing
    constructor(mode, color) {
        this.listeners = [];
        // Define the game mode
        this.mode = mode;
        // Define the player's color and opponent's color
        this.player = color;
        this.opponent = color === 'w' ? 'b' : 'w';
        // Other variables
        this.turn = '';
        // Create a game log
        this.log = [];
        // Reset the board
        this.resetBoard();
    }

    // Resets the game board
    resetBoard() {
        // Defines if a square is toggled and which square is toggled
        this.toggled = '';
        // Defines whose turn it is, which is always white initially
        this.turn = 'w';
        this.log = [];
        // Defines the location of a pawn that can be captured by "en passant"
        this.enpassant = '';
        // Defines the location of a pawn awaiting promotion
        this.inpromotion = '';
        // Defines whether the game is over or not
        this.over = false;
        // Defines whether the game has a winner or not
        this.winner = '';
        // The game is represented by a 64 length array of squares, each square given an id, piece value, and piece color
        this.board = [];
        // Determines if the king and queenside castles are available for black and white
        this.canCastleQueen = {w: true, b: true};
        this.canCastleKing = {w: true, b: true};
        // Initialize the board id values and pieces
        for (let r=0; r<8; r++) {
            for (let c=0; c<8; c++) {
                // If player is white, then start with a8 and black pieces, otherwise start with a1 and white pieces
                this.board.push({
                    id: `${files[c]}${this.player==='w' ? (8-r) : (r)}`,
                    color: r<2 ? this.opponent : r>5 ? this.player : "",
                    value: r===0 || r===7 ? pieces[c] : r===1 || r===6 ? 'p' : '',
                });
            }
        }
        this.update({event: 'reset', board: this.board, player: this.player});
    }
    
    // Toggle a specific square on the board
    toggleSquare(id) {
        if (this.getSquare(id).color === this.turn) {
            if (this.toggled !== '') {
                this.update({event: 'detoggle', id: this.toggled});
            }
            if (this.toggled !== id) {
                this.toggled = id;
                this.update({event: 'toggle', id: id});
            } else {
                this.toggled = '';
            }  
        } else if (this.toggled !== '') {
            this.update({event: 'detoggle', id: this.toggled});
            this.move(this.toggled, id);        
            this.toggled = '';
        }  
    }

    // HASMOVE
    // Returns an array of if a basic move, enpassant move, and castle are possible (without considering check)
    isPotentialMove(start, end) {
        // Variables used to check for moves
        let piece = this.getSquare(start).value;
        let fs = this.fileValue(start[0]);
        let fe = this.fileValue(end[0]);
        let rs = parseInt(start[1]);
        let re = parseInt(end[1]);
        // Start and end must exist on the board
        if (rs < 1 || rs > 8 || fs < 0 || fs > 8) return [false,false,false];
        if (re < 1 || re > 8 || fe < 1 || fe > 8) return [false,false,false];
        // End square clicked must not be same color as start square
        if (this.getSquare(end).color === this.getSquare(start).color) return [false,false,false];
        // Variables measuring distance traveled
        let dr = re-rs;
        let df = fe-fs;
        // Boolean Variables
        let passant = false;
        let castle = false;
        // CHECK IF THE PIECE CAN MOVE: Eliminate bad moves as early as possible (helps when checking for checkmate)
        if (piece === 'p') {
            // Use multiplication to always treat a proper move as being "positive" and thus prevent backwards moves
            let pdr = dr * (this.turn === 'w' ? 1 : -1);
            if (pdr < 1 || pdr > 2 || df < -1 || df > 1) {
                return {withoutCheck: false, };
            } else if (this.getSquare(end).color !== '') {
                if (pdr === 2 || df === 0) return [false,false,false];
            } else {
                if (pdr === 2 && rs!==2 && rs!==7) return [false,false,false];
                if (df !== 0) {
                    if (this.enpassant === `${files[fe-1]}${rs}`) {
                        passant = true;
                    } else {
                        return [false,false,false];
                    }
                }
            }    
        } else if (piece === 'N') {
            if (df=== 2 || df=== -2) {
                if (dr !== 1 && dr !== -1) return [false,false,false];
            } else if (df=== 1 || df=== -1) {
                if (dr !== 2 && dr !== -2) return [false,false,false];
            } else {
                return [false,false,false];
            }
        } else if (piece === 'R') {
            if (dr !== 0 && df!== 0) return [false,false,false];
            if (! this.isEmptyBetween(rs,re,fs,fe)) return [false,false,false];
        } else if (piece === 'B') {
            if (dr === 0 || df=== 0) return [false,false,false];
            if (Math.abs(fe-fs) !== Math.abs(re-rs)) return [false,false,false];
            if (! this.isEmptyBetween(rs,re,fs,fe)) return [false,false,false];
        } else if (piece === 'Q') {
            if (dr !== 0 && df !== 0 && Math.abs(fe-fs) !== Math.abs(re-rs)) return [false,false,false];
            if (! this.isEmptyBetween(rs,re,fs,fe)) return [false,false,false];
        } else {
            if (dr > 1 || dr < -1) return [false,false,false];
            if (df > 1 || df< -1) {
                if (this.isCastleAvailable(start,end)) {
                    castle = true;
                } else {
                    return [false,false,false]
                }
            }
        }

        return [true,passant,castle];
    }

    // Models a move and returns the state of the move success as well, if en-passant capture was performed, if castling was performed, and the updated board
    modelMove(start, end) {
        let potential_move = this.isPotentialMove(start,end);
        if (! potential_move[0]) return [false,false,false,this.board];

        // First, create a DEEP copy of the board (since items of the board are objects)
        let board = this.board.map((sq) => ({...sq}));
        // Model the basic move operations
        this.getBoardSquare(board,end).value = this.getSquare(start).value;
        this.getBoardSquare(board,end).color = this.turn;
        this.getBoardSquare(board,start).value = '';
        this.getBoardSquare(board,start).color = '';

        // Perform additional en-passant functionality if needed
        if (potential_move[1]) {
            this.getBoardSquare(board,end[0]+start[1]).value = '';
            this.getBoardSquare(board,end[0]+start[1]).color = '';
        }

        // Perform additional castling functionality if needed
        if (potential_move[2]) {
            this.getBoardSquare(board, this.shift(start,0,(end[0] === 'g' ? 1 : -1))).value = 'R';
            this.getBoardSquare(board, this.shift(start,0,(end[0] === 'g' ? 1 : -1))).color = this.turn;
            this.getBoardSquare(board, this.shift(start,0,(end[0] === 'g' ? 3 : -4))).value = '';
            this.getBoardSquare(board, this.shift(start,0,(end[0] === 'g' ? 3 : -4))).color = '';
        }

        // Test for check
        let king_pos = board.find((sq) => sq.value === 'K' && sq.color === this.turn).id;
        if (this.inCheck(board,king_pos)) return [false,false,false,this.board];

        // If the king is safe, then all is good, and can return true, if castle performed, and the updated value
        return [true, potential_move[1],potential_move[2], board];
    }

    // Converts a valid move on the current board to basic chess notation
    basicNotation(start,end) {
        let value = this.getSquare(start).value;
        // Notation for pawn moves
        if (value === 'p') {
            if (start[0] === end[0]) {
                return end;
            } else {
                return start[0]+'x'+end;
            }
        } 
        // Notation for pieces where ambiguity cannot exist
        if (value === 'Q' || value === 'K' || value === 'B') {
            if (this.getSquare(end).color === '') {
                return value+end;
            } else {
                return value+'x'+end;
            }
            // Notation for all other pieces (where ambiguity could exist)
        } else {
            let note = (this.getSquare(end).color !== '' ? 'x' : '') + end ;
            let pieces = this.getSquaresByVC(value,this.turn);
            if (pieces.length > 1) {
                let other = pieces.map((sq) => sq.id).find((id) => id !== start);
                console.log(other);
                if (this.modelMove(other,end)[0]) {
                    if (other[0] === start[0]) {
                        return value+start[1]+note;
                    } else {
                        return value+start[0]+note;
                    }
                }
            } 
            return value+note;
        }
    }

    // Models a move and implements if the model is successful
    move(start,end) {
        let model = this.modelMove(start,end);
        if (! model[0]) return;

        // Create a chess notation representation of the move
        let note = '' 
        if (! model[2]) {
            note = this.basicNotation(start,end);
        }

        // Update the board, whose turn it is, and other information if needed
        // Sends updates to the view
        this.board = model[3];
        this.update({event: 'empty', id: start});
        this.update({
            event: 'setValue', 
            id: end, 
            value: this.getSquare(end).value,
            color: this.getSquare(end).color,
        });

        
        // If a pawn reached rank 8, update the view about promotion and return
        if (this.getSquare(end).value === 'p') {
            if ((end[1] === '1' && this.turn === 'b') || (end[1] === '8' && this.turn === 'w')) {
                this.update({event: 'promote', id: end, color: this.turn});
                this.inpromotion = end;
                return;
            }
        }
        
        // Performs an additional update if an en-passant capture occured
        if (model[1]) {
            this.update({event: 'empty', id: end[0]+start[1]});
        }
        // Updates the en-passant value
        if (this.getSquare(end).value === 'p' && Math.abs(parseInt(start[1])-parseInt(end[1]))>1) {
            this.enpassant = end;
        } else {
            this.enpassant = '';
        }

        // Updates the view and notation if castling was performed
        if (model[2]) {
            this.canCastleKing[this.turn] = false;
            this.canCastleQueen[this.turn] = false;
            note = end[0] === 'g' ? 'O-O' : 'O-O-O'
            this.update({event: 'empty', id: (end[0] === 'g' ? 'h' : 'a')+end[1]});
            this.update({
                event: 'setValue',
                id: (end[0] === 'g' ? 'f' : 'd')+end[1],
                value: 'R',
                color: this.turn,
            });
        }
        
        // Update castling information and the notation if the king or rook moved
        if (this.canCastleKing[this.turn]) {
            if (start === (this.turn === 'w' ? 'e1' : 'e8') || start === (this.turn === 'w' ? 'h1' : 'h8')) {
                this.canCastleKing[this.turn] = false;
            }
        } else if (this.canCastleQueen[this.turn]) {
            if (start === (this.turn === 'w' ? 'e1' : 'e8') || start === (this.turn === 'w' ? 'a1' : 'a8')) {
                this.canCastleQueen[this.turn] = false;
            }
        }

        // Updates the turn
        this.turn = this.turn === 'w' ? 'b' : 'w';

        // Test for mate and check
        note = this.testChecks(note);
        // Log the notation on at the end
        this.log.push(note);
        console.log(this.log);
    }

    // Promotes a square at a given square
    // No need to update the view since the view initiated the promotion
    // However, with the new piece promoted, update turn, check for mate, and update notation
    promote(value) {
        let note = this.inpromotion+"="+value;
        this.getSquare(this.inpromotion).value = value;
        this.inpromotion = "";
        this.turn = this.turn === 'w' ? 'b' : 'w';
        this.testChecks(note)
        this.log.push(note);
        console.log(this.log);
    }

    deployMate() {
        // If a mate has occured, then game is over
        this.over = true;
        // Retrieve the king position
        let king_pos = this.board.find((sq) => sq.value === 'K' && sq.color === this.turn).id; 
        // If king is in check, then set the winner of the game to be the person who just went
        if (this.inCheck(this.board, king_pos)) this.winner = this.turn === 'w' ? 'b' : 'w';
        // Update the view that the game is over
        this.update({event: 'end', winner: this.winner});
    }

    testChecks(note) {
        // Test for mate and check
        if (this.testMate()) {
            this.deployMate(); 
            if (this.winner !== '') note = note + "#";
            // Test for non-mate check (for notation purposes)
        } else {
            let king_pos = this.getSquaresByVC('K',this.turn).pop().id;
            if (this.inCheck(this.board, king_pos)) note = note + "+";
        }
        return note;
    }

    // Test for checkmate/statemate
    testMate() {
        // Create a boolean 
        let moveExists = false;
        // First, test to see if the king can move
        let king = this.getSquaresByVC('K',this.turn).pop().id;
        for (let dr=-1; dr<2; dr++) {
            for (let df=-1; df<2; df++) {
                if (this.validShift(king,dr,df)) {
                    if (this.modelMove(king,this.shift(king,dr,df))[0]) {
                        moveExists = true;
                        break;
                    }
                }
            }
            if (moveExists) break;
        }
        if (moveExists) return false;

        // Next, test to see if any of the pawns can move
        let pawns = this.getSquaresByVC('p',this.turn);
        for (const p of pawns.map((p) => p.id)) {
            // No need to test for "move up two" moves: if a pawn can't move forward 1, then can't move forward 2
            for (const df of [0,-1,1]) {
                let dr = this.turn === 'w' ? 1 : -1;
                if (this.validShift(p,dr,df)) {
                    if (this.modelMove(p,this.shift(p,dr,df))[0]) {
                        moveExists = true;
                        break;
                    }
                } 
            }
            if (moveExists) {
                break;
            }
        }
        if (moveExists) return false;

        // Next, test the knights
        let knights = this.getSquaresByVC('N',this.turn);
        for (const n of knights.map((n) => n.id)) {
            for (let dr=-2; dr<3; dr++) {
                for (let df=-2; df<3; df++) {
                    if (this.validShift(n,dr,df)) {
                        if (this.modelMove(n,this.shift(n,dr,df))[0]) {
                            moveExists = true;
                            break;
                        }
                    } 
                }
            }
            if (moveExists) break;
        }
        if (moveExists) return false;

        // Finally, test all of the other pieces by seeing if they have a move in any given direction
        let pieces = this.getSquaresByVC('Q',this.turn).concat(this.getSquaresByVC('R',this.turn)).concat(this.getSquaresByVC('B',this.turn));
        for (const p of pieces.map((p) => p.id)) {
            for (let dr=-1; dr<2; dr++) {
                for (let df=-1; df<2; df++) {
                    // If a piece can move one square in a direction, then they can move any squares in that direction
                    if (this.validShift(p,dr,df)) {
                        if (this.modelMove(p,this.shift(p,dr,df))[0]) {
                            moveExists = true;
                            break;
                        }
                    }
                }
            }
            if (moveExists) break;
        }
        // If none of the pieces can move, return true
        return ! moveExists;
    }

    // Tests to see if a piece is "in check" within a given board
    inCheck(board, king_pos) {
        // Now that the move has been modeled on the board, see if the king is under attack afterwards
        let kf = this.fileValue(king_pos[0]);
        let kr = parseInt(king_pos[1]);
        let checked = false;
        for (let dr=-1; dr<2; dr++) {
            for (let df=-1; df<2; df++) {
                // This if statement is needed to prevent an infinite "safe in direction" loop
                if (dr !== 0 || df !== 0) {
                    if (! this.safeInDirection(board, kr, kf, dr, df)) {
                        checked = true;
                        break; 
                    }
                }
            }
            if (checked) break;
        }
        
        if (checked) return true;
        return ! this.safeFromKnights(board,king_pos)
    }
    
    // Given a board, starting position and direction, sees if the position is under attack by an opponent
    safeInDirection(board, rs, fs, dr, df) {
        let r = rs+dr;
        let f = fs+df;
        while (r > 0 && r < 9 && f > 0 && f < 9) {
            let square = this.getBoardSquare(board,files[f-1]+r);
            if (square.color !== '') {
                // Return if a like-colored square is found
                if (square.color === this.turn) {
                    return true;
                    // Otherwise, test for specific square values
                } else {
                    let attackers = ['Q']
                    if (dr !== 0 && df !== 0) {
                        attackers.push('B');
                    } else {
                        attackers.push('R');
                    }
                    if (Math.abs(f-fs) < 2 && Math.abs(r-rs) < 2) {
                        attackers.push('K');
                        if (Math.abs(f-fs) === 1 && (this.turn === 'w' ? (r-rs) === 1 : (r-rs) === -1)) {
                            attackers.push('p')
                        }
                    }
                    return ! attackers.includes(square.value);
                }
            }
            r += dr;
            f += df;
        }
        return true;
    }

    // Given a starting position and board, sees if the position is under attack by knights
    safeFromKnights(board, pos) {
        // Retrieve the ids of all knights with same color as king
        let knights = board.filter((sq) => sq.value === 'N' && sq.color !== this.turn);
        if (knights.length === 0) return true;
        return ! (knights.map((sq) => this.isPotentialMove(sq.id,pos)[0]).reduce((a,b) => a || b));
    }
    
    // Checks to see if there are only empty squares on a path between two squares
    isEmptyBetween(rs, re, fs, fe) {
        let dr = (re-rs > 0 ? 1 : re-rs < 0 ? -1 : 0);
        let df = (fe-fs > 0 ? 1 : fe-fs < 0 ? -1 : 0);
        let r = rs+dr;
        let f = fs+df;
        let empty = true;
        while (r !== re || f !== fe) {
            empty = this.getSquare(files[f-1]+r).value === '';
            r += dr;
            f += df;
        }
        return empty;
    }

    // Checks to see if a castle is possible
    isCastleAvailable(start,end) {
        // King cannot castle while in check
        if (this.inCheck(this.board,start)) return false;
        let color = this.getSquare(start).color;
        if (start === 'e1' && color === 'w') {
            if (end === 'g1' && this.canCastleKing.w) {
                if (this.isEmptyBetween(1,1,5,7)) {
                    // King cannot be attacked in square f1 (modelMove later checks for square g1)
                    return ! this.inCheck(this.board,'f1');
                }
            } else if (end === 'c1' && this.canCastleQueen.w) {
                if (this.isEmptyBetween(1,1,5,3)) {
                    // King cannot be attacked in square d1 (modelMove later checks for square b1)
                    return ! this.inCheck(this.board,'d1');
                }
            }
        } else if (start === 'e8' && color === 'b') {
            if (end === 'g8' && this.canCastleKing.b) {
                if (this.isEmptyBetween(8,8,5,7)) {
                    // King cannot be attacked in square f1 (modelMove later checks for square g1)
                    return ! this.inCheck(this.board,'f8');
                }
            } else if (end === 'c8' && this.canCastleQueen.b) {
                if (this.isEmptyBetween(8,8,5,3)) {
                    // King cannot be attacked in square d1 (modelMove later checks for square b1)
                    return ! this.inCheck(this.board,'d8');
                }
            }
        }
        return false;
    }

    // Returns the id of the current toggled square
    getToggledSquare() {
        return this.toggled;
    }

    // Return an object representing the state of the game
    getState() {
        return { mode: this.mode, player: this.player, turn: this.turn, toggled: this.toggled, board: this.board };
    }

    // Gets the square with a given id
    getSquare(id) {
        return this.board.find((square) => square.id === id);
    }

    getBoardSquare(new_board,id) {
        return new_board.find((square) => square.id === id);
    }

    // Returns an array of squares with a given value
    getSquaresByVC(value, color) {
        return this.board.filter((sq) => sq.value === value && sq.color === color);
    }

    // Returns the number corresponding to a filename
    fileValue(file) {
        return files.findIndex((f) => f === file)+1;
    }
    
    emptySquare(id) {
        this.getSquare(id).color = '';
        this.getSquare(id).value = '';
        this.update({event: 'empty', id: id});
    }

    // LISTENER METHODS
    update(info) {
        this.listeners.forEach((l) => l(info));
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    removeListener(listener) {
        let i = this.listeners.findIndex((l) => l === listener);
        if (i !== -1) this.listeners.splice(i, 1);
    }
    
    // Shifts a square by a given rank and file increment
    shift(id,dr,df) {
        return files[this.fileValue(id[0])+df-1] + (parseInt(id[1])+dr);
    }

    // Returns true if the shift is valid, false otherwise
    validShift(id,dr,df) {
        let nf = this.fileValue(id[0])+df;
        let nr = parseInt(id[1]) + dr;
        return (nf > 0 && nf < 9 && nr > 0 && nr < 9);
    }
}
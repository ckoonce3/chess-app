import React from 'react';
import ReactDOM from 'react-dom'
import './index.css';

// CHESS UNICODE SEQUENCES
const codes = {
    K: {w: '\u2654', b: '\u265A'}, 
    Q: {w: '\u2655', b: '\u265B'},
    R: {w: '\u2656', b: '\u265C'},
    B: {w: '\u2657', b: '\u265D'},
    N: {w: '\u2658', b: '\u265E'},
    p: {w: '\u2659', b: '\u265F'}
};
// COLUMN NAMES OF THE BOARD
const columns = ['a','b','c','d','e','f','g','h'];

export default class ChessView {
    // Set up the view based on the game
    constructor(game) {
        // Save the game
        this.game = game;
        // Initialize the list of listeners
        this.listeners = []
        // Add this view's update method as an event listener of the game
        game.addListener((info) => this.update(info));
        // Go ahead and setup the login screen
        this.createLoginScreen();
        // Create a new game
    }

    createLoginScreen() {
        createLoginReact();
        document.getElementById('login').addEventListener('click',(e) => this.createLoginForm(e));
        document.getElementById('signup').addEventListener('click',(e) => this.createSignupForm(e));
    }
    
    createLoginForm() {
        createLoginFormReact();
        document.getElementById('login').addEventListener('click',(e) => {
            e.preventDefault();
            this.updateListeners(e);
        });
        document.getElementById('cancel').addEventListener('click',(e) => this.createLoginScreen(e));
    }

    createSignupForm() {
        createSignupFormReact();
        document.getElementById('signup').addEventListener('click',(e) => {
            e.preventDefault();
            this.updateListeners(e);
        });
        document.getElementById('cancel').addEventListener('click',(e) => this.createLoginScreen(e));
    }

    createGameOptions() {
        createOptionsReact('load');
        document.getElementById('new').addEventListener('click',(e) => this.createColorSelect(e));
        document.getElementById('load').addEventListener('click',(e) => this.updateListeners(e));
    }

    resetGame(event) {
        this.listeners.forEach((l) => l(event));
        this.createNewGame(this.game.player);
    }

    loadGames(games) {
        loadGamesReact(games);
        document.getElementById('back').addEventListener('click',(e) => this.createGameOptions(e));
        document.getElementById('logout').addEventListener('click',(e) => this.updateListeners(e));
    }

    createNewGame(color) {
        // Set the player color of the game
        this.game.setPlayer(color);
        // Reset the game board
        this.game.resetBoard();
        // Load all elements into the DOM initially using React
        createNewChessView(this.game.getState());
        // Add click event listeners to all squares
        let squares = document.getElementsByClassName('square');
        for (let i=0; i<squares.length; i++) {
            squares[i].addEventListener('click', (e) => this.updateListeners(e));
        }
        // Add listeners to the buttons
        document.getElementById('reset').addEventListener('click', (e) => this.resetGame(e));
        document.getElementById('save').addEventListener('click',(e) => this.updateListeners(e));
        document.getElementById('newgame').addEventListener('click',(e) => this.createGameOptions(e));
        document.getElementById('logout').addEventListener('click',(e) => this.updateListeners(e));
        document.getElementById('cat').addEventListener('click',(e) => this.updateListeners(e));
        document.getElementById('dog').addEventListener('click',(e) => this.updateListeners(e));
    }

    createColorSelect() {
        createOptionsReact('color');
        document.getElementById('white').addEventListener('click',(e) => this.createNewGame('w'));
        document.getElementById('black').addEventListener('click',(e) => this.createNewGame('b'));
    }

    addImage(url) {
        console.log(url);
        document.getElementById('randimg').src = url;
    }

    updateListeners(event) {
        this.listeners.forEach((l) => l(event));
    }

    addListener(listener) {
        this.listeners.push(listener);
    }

    removeListener(listener) {
        let i = this.listeners.findIndex((l) => l === listener);
        if (i !== -1) this.listeners.splice(i, 1);
    }

    // Updates the game according to certain info parameters passed down.
    update(info) {
        if (info.event === 'toggle') {
            document.getElementById(info.id).classList.add('toggled');
        } else if (info.event === 'detoggle') {
            document.getElementById(info.id).classList.remove('toggled');
        } else if (info.event === 'empty') {
            console.log(`Empty At ${info.id}`);
            document.getElementById(info.id).firstChild.innerText = "";
        } else if (info.event === 'setValue') {
            document.getElementById(info.id).firstChild.innerText = codes[info.value][info.color];
        } else if (info.event === 'end') {
            console.log("Game Over");
            console.log(`${info.winner} Wins!`);
        } else if (info.event === 'promote') {
            createPromotionRibbon(info.color);
            let promos = document.getElementsByClassName('promo')
            for (let i=0; i<promos.length; i++) {
                promos[i].addEventListener('mouseover', (e) => e.target.classList.add('toggled'));                
                promos[i].addEventListener('click',(e) => {
                    this.updateListeners(e);
                    document.getElementById(info.id).firstChild.innerText = codes[e.target.id[1]][info.color];
                    removePromotionRibbon();
                });
                
            }
        }
    }
}

function loadGamesReact(games) {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
    ReactDOM.render(
       <div className="flex">
           <table>
                <thead>
               <tr key="headers">
                   <th key="idh" width="75px">Game ID</th>
                   <th key="colorh" width="50px">Color</th>
                   <th key="dateh" width="100px">Date</th>
                   <th key="logh" width="200px">Game Log</th>
                </tr>
                </thead>
                <tbody>
               {games.map((game) =>
                   <tr key={game['id']}>
                       <td key={game['id']+"id"}>{game['id']}</td>
                       <td key={game['id']+"color"}>{game['color']}</td>
                       <td key={game['id']+"date"}>{game['date']}</td>
                       <td key={game['id']+"log"}>{game['log']}</td>
                    </tr>
               )}
               </tbody>
           </table>
           <div>
            <button id='back'>Go Back</button>
            <button id='logout'>Logout</button>
           </div>
       </div>,
       document.getElementById('root')
    );
}

function createOptionsReact(type) {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
    ReactDOM.render(
        <div className="flex">
            <h1>{type === 'load' ? 'Select an Option' : 'Select Color'}</h1>
            <div>
                <button id={type === 'load' ? 'load' : 'white'}>
                    {type === 'load' ? 'View Existing Games' : 'White'}
                </button>
                <button id={type === 'load' ? 'new' : 'black'}>
                    {type === 'load' ? 'Create New Game' : 'Black'}
                </button>
            </div>
        </div>,
        document.getElementById('root')
    );
}


function createLoginFormReact() {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
    ReactDOM.render(
        <div className="flex">
            <h1>Login to Chess10</h1>
        <form className = "flex">
            <label htmlFor="username">Username: </label>
            <input type="text" name="username" id="username"></input><br />
            <label htmlFor="password">Password:  </label>
            <input type="password" name="password" id="password"></input><br />
            <div>
                <button type="submit" id="login">Submit</button>
                <button id="cancel">Cancel</button>
            </div>
        </form>
        </div>,
        document.getElementById('root')
    );
}

function createSignupFormReact() {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'))
    ReactDOM.render(
        <div className="flex">
            <h1>Login to Chess10</h1>
        <form className = "flex">
            <label htmlFor="username">Username: </label>
            <input type="text" name="username" id="username"></input><br />
            <label htmlFor="password">Password:  </label>
            <input type="password" name="password" id="password"></input><br />
            <label htmlFor="confirm">Confirm Password:  </label>
            <input type="password" name="confirm" id="confirm"></input><br />
            <div>
                <button type="submit" id="signup">Submit</button>
                <button id="cancel">Cancel</button>
            </div>
        </form>
        </div>,
        document.getElementById('root')
    );
}


function createLoginReact() {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'))
    ReactDOM.render(
        <div className="flex">
            <h1>Welcome to Chess10</h1>
            <div>
                <button id="login">Login</button>
                <button id="signup">Signup</button>
            </div>
        </div>,
        document.getElementById('root')
    );
}

function removePromotionRibbon() {
    ReactDOM.unmountComponentAtNode(document.getElementById('promodiv'));
}

function createPromotionRibbon(color) {
    ReactDOM.render(
        <div>
            <p>Select Promotion Piece</p>
            <div className = "promos">
                <div className = "promo" id="pQ">{codes['Q'][color]}</div>
                <div className = "promo" id="pN">{codes['N'][color]}</div>
                <div className = "promo" id="pB">{codes['B'][color]}</div>
                <div className = "promo" id="pR">{codes['R'][color]}</div>
            </div>
        </div>,
        document.getElementById('promodiv')
    );
}

function createNewChessView(props) {
    ReactDOM.unmountComponentAtNode(document.getElementById('root'));
    ReactDOM.render(
      <ChessViewReact
        board = {props.board}
        player = {props.player}
        toggled = {props.toggled}
      />,
      document.getElementById('root')
    );
  }

class ChessViewReact extends React.Component {
    render() {
      return (
        <div id="game">
            <div><h1>Play Chess</h1></div>
            <div className="player">
                <Player
                    player = {this.props.player === 'w' ? 'b' : 'w'}             
                />
            </div>
            <div id ="promodiv"></div>
            <div className = "board">
                <Board
                    board = {this.props.board}
                    player = {this.props.player}
                    toggled = {this.props.toggled}
                />
            </div>
            <div className="player">
                <Player
                    player = {this.props.player}             
                />
            </div>
            <div className = "ribbon">
                <button id="reset">Reset Board</button>
                <button id="save">Save Game</button>
                <button id="newgame">New Game</button>
                <button id="logout">Logout</button>
            </div>
            <div>
                <button id="cat">I'm a Cat Person</button>
                <button id="dog">I'm a Dog Person</button>
            </div>
            <div>
                <img id='randimg' src ='' alt=''></img>
            </div>
        </div>
      )
    }
}
  
function Board(props) {
    return props.board.map((square) => {
        let r = square.id[1];
        let c = columns.findIndex((c) => c === square.id[0]);
        let color = (
            r % 2 ^ c % 2 ? 'dark' : 'light'
        );
        let sq_class = `square ${color} ${props.toggled === square.id ? 'toggled' : ''}`
        return (
        <div 
            key = {square.id}
            className = {sq_class}
            id = {square.id}
        >
            <Square 
                value={square.value}
                color={square.color}
            />
        </div>
        );
    });
}

function Square(props) {
    return (
        <span className = "value">
            {props.value === "" ? "" : codes[props.value][props.color]} 
        </span>
    )
}

function Player(props) {
    return <div></div>
}
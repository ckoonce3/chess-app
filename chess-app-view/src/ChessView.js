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
        // Initialize the list of listeners
        this.listeners = []
        // Add this view's update method as an event listener of the game
        game.addListener(this.update);
        // Load all elements into the DOM initially using React
        createNewChessView(game.getState());

        // Add click event listeners to all squares
        let squares = document.getElementsByClassName('square');
        for (let i=0; i<squares.length; i++) {
            squares[i].addEventListener('click', (e) => this.updateListeners(e));
        }
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
        }
    }

}


function createNewChessView(props) {
    ReactDOM.render(
      <div id = "game">
      <ChessViewReact
        board = {props.board}
        player = {props.player}
        toggled = {props.toggled}
      />
      </div>,
      document.getElementById('root')
    );
  }

class ChessViewReact extends React.Component {
    render() {
      return (
        <div className = "board">
          <Board
            board = {this.props.board}
            player = {this.props.player}
            toggled = {this.props.toggled}
          />
        </div>
      )
    }
}
  
function Board(props) {
    return props.board.map((square) => {
        let r = square.id[1];
        let c = columns.findIndex((c) => c === square.id[0]);
        let color = (
            r % 2 ^ c % 2 ?
            props.player === 'w' ? 'dark' : 'light' :
            props.player === 'w' ? 'light' : 'dark'
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
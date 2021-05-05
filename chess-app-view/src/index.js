import './index.css';
import reportWebVitals from './reportWebVitals';
import ChessGame from './ChessGame';
import ChessController from './ChessController'
import ChessView from './ChessView.js';


window.addEventListener('load', () => {
  // Create the game
  let game = new ChessGame('singleplayer','w');
  // Retrieve the reference to the view root
  let view = new ChessView(game);
  // Create a new controller given the model and view
  let controller = new ChessController(game, view);
  // Configure the controller to set up the new game's event handlers
  controller.configure();
});



// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

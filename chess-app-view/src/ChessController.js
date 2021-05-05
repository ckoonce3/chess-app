import axios from 'axios';

export default class ChessController {
    constructor(game, view) {
        this.game = game;
        this.view = view;
    }

    // Configures a game based on the current model and view
    configure() {
        // Add update method as a listener of the view
        this.view.addListener((e) => this.update(e));
        console.log(fn1());
    }

    update(event) {
        if(event.type === 'click') {
            // If clicking on a square or a piece value, instruct the model to toggle a square
            if (/square*|value*/.test(event.target.className)) {
                this.game.toggleSquare(event.target.closest('.square').id);
            }
        }
    }
}

export async function fn1() {
    const result = await axios({
        method: 'get',
        url: 'http://localhost:8080/test'
    });
    return result.data;
};
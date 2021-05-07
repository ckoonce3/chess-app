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
        fn1();
        fn2();
        fn3();
    }

    update(event) {
        if(event.type === 'click') {
            // If clicking on a square or a piece value, instruct the model to toggle a square
            if (/square*|value*/.test(event.target.className)) {
                this.game.toggleSquare(event.target.closest('.square').id);
            } else if (event.target.id === 'reset') {
                this.game.resetBoard();
            } else if (event.target.className === 'promo toggled') {
                console.log("point reached x");
                this.game.promote(event.target.id[1]);
            }
        }
    }
}

export async function fn1() {
    const result = await axios({
        method: 'get',
        url: 'http://localhost:5000/'
    });
    console.log(result.data);
    return result.data;
};

export async function fn2() {
    const result = await axios({
        method: 'get',
        url: 'http://localhost:5000/signup?username=ckoonce&password=nivlac&confirm=nivlac'
    });
    console.log(result.data);
}

export async function fn3() {
    const result = await axios({
        method: 'post',
        url: 'http://localhost:5000/login',
        data: {
            'username': 'ckoonce',
            'password': 'nivlac'
        }
    });
    console.log(result.data);
}
import axios from 'axios';

export default class ChessController {
    constructor(game, view, username) {
        this.game = game;
        this.view = view;
        this.username = '';
    }

    // Configures a game based on the current model and view
    configure() {
        // Add update method as a listener of the view
        this.view.addListener((e) => this.update(e));
        // Check to see if the user is logged in or not
        fn1();
        //fn2();
        //fn3();
           //fn4();
        //fn5();
        //fn6()
        //fn7();
    }

    async update(event) {
        if(event.type === 'click') {
            // If clicking on a square or a piece value, instruct the model to toggle a square
            if (/square*|value*/.test(event.target.className)) {
                this.game.toggleSquare(event.target.closest('.square').id);
            } else if (event.target.id === 'reset') {
                this.game.resetBoard();
            } else if (event.target.className === 'promo toggled') {
                this.game.promote(event.target.id[1]);
            } else if (event.target.id === 'login') {
                let username = event.target.closest('form').querySelector('#username').value;
                let password = event.target.closest('form').querySelector('#password').value;
                 if (await logIn(username,password)) {
                     this.username = username;
                     this.view.createGameOptions();
                 } else {
                    alert('Invalid username or password');
                 }
            } else if (event.target.id === 'signup') {
                let username = event.target.closest('form').querySelector('#username').value;
                let password = event.target.closest('form').querySelector('#password').value;
                let confirm = event.target.closest('form').querySelector('#confirm').value;
                if (password === confirm) {
                    if (await signIn(username,password,confirm)) {
                        this.view.createLoginScreen();
                        alert('Signup Successful! Ready to login.');
                    } else {
                        alert('Username already exists');
                    }
                } else {
                    alert('Password does not match confirmed password value');
                }
            } else if (event.target.id === 'logout') {
                await logOut(this.username);
                this.username = '';
                this.view.createLoginScreen();
            } else if (event.target.id === 'save') {
                let date = new Date();
                let month = date.getUTCMonth() < 9 ? '0'+(date.getUTCMonth()+1) : date.getUTCMonth()+1
                let day = date.getUTCDate() < 9 ? '0'+(date.getUTCDate()+1) : date.getUTCDate()+1
                if (await saveGame(
                    this.username,
                    this.game.player,
                    `${date.getUTCFullYear()}-${month}-${day}`,
                    this.game.log.toString()
                )) alert('Game saved');
            } else if (event.target.id === 'load') {
                executeLoadGame(this.view, this.username);
            }
        }
    }

}

export async function executeLoadGame(view, username) {
    let games = await loadGames(username);
    console.log(games);
}

export async function fn1() {
    const result = await axios({
        method: 'get',
        url: 'http://localhost:5000/'
    });
    console.log(result.data);
    return result.data;
};

export async function signIn(username,password,confirm) {
    try {
        await axios({
            method: 'get',
            url: `http://localhost:5000/signup?username=${username}&password=${password}&confirm=${confirm}`,
        });
    } catch (error) {
        return false;
    }
    return true;
}

export async function logIn(username,password) {
    try {
        await axios({
            method: 'post',
            url: 'http://localhost:5000/login',
            data: {
                'username': username,
                'password': password,
            }
        });
    } catch(error) {
        return false;
    }
    return true;
}

export async function logOut(username) {
    await axios({
        method: 'get',
        url: `http://localhost:5000/logout?username=${username}`,
    });
}

export async function fn5() {
    const result = await axios({
        method: 'post',
        url: 'http://localhost:5000/save',
        data: {
            'username': 'ckoonce',
            'color': 'w',
            'date': '2020-06-10',
            'log': '[e4, e5]'
        }
    })
    console.log(result.data)
}

export async function saveGame(username,color,date,log) {
    await axios({
        method: 'post',
        url: 'http://localhost:5000/save',
        data: {
            'username': username,
            'color': color,
            'date': date,
            'log': log
        }
    });
    return true;
}

export async function loadGames(username) {
    const result = await axios({
        method: 'get',
        url: `http://localhost:5000/load?username=${username}`,
    });
    return result.data;
}

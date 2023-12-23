function Cell() {
    let value = '_';

    const getValue = () => value;
    
    const addMark = (mark) => {
        value = mark;
    }

    return {getValue, addMark};
}

function Gameboard () {
    const board = [];

    for(let i = 0; i < 9; i++) {
        const cell = Cell();
        cell.addMark(i);
        board.push(cell);
    }

    const getBoard = () => board;

    const printBoard = () => {
        const boardWithValues = board.map(cell => cell.getValue());
        console.log(boardWithValues);
        return boardWithValues;
    }

    const addMark = (cell, mark) => {
        if(typeof board[cell].getValue() !== 'number') {
            return;
        }
        board[cell].addMark(mark);
        return true;
    }

    const resetBoard = () => {
        for(let i = 0; i < 9; i++) {
            board[i].addMark(i);
        }
    }

    const getEmptyCells = () => {
        return board.filter(cell => typeof cell.getValue() !== 'number');
    }

    return {getBoard, printBoard, addMark, resetBoard ,getEmptyCells};
}

function GameController(
    playerOneName = 'Player One',
    playerTwoName = 'Player Two'
) {
    const players = [
        {name: playerOneName, marker: 'X'},
        {name: playerTwoName, marker: 'O'}
    ];
    const board = Gameboard();

    let activePlayer = players[0];

    const getActivePlayer = () => activePlayer;

    let winner = null;

    const getWinner = () => winner;

    const switchActivePlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0]; 
    }

    const printNewRound = () => {
        console.log(`${getActivePlayer().name}'s turn.`);
        board.printBoard();
    }

    const playRound = (cell) => {
        if(!board.addMark(cell, getActivePlayer().marker)) return;

        console.log(`Adding ${getActivePlayer().name}'s mark at cell ${cell}.`);

        const result = checkWin(board);
        handleWin(result);
        if(!result) {
            switchActivePlayer();
        } else {
            activePlayer = players[0];
        }
        printNewRound();
    }

    const checkWin = (board) => {
        const boardWithValues = board.printBoard();
        let gameWon = null;
        const activePlayerMarker = getActivePlayer().marker;
        const plays = boardWithValues.reduce((acc, elem, index) => {
            return elem === activePlayerMarker ? acc.concat(index) : acc;
        }, [])
        const winConditions = [
            [0,1,2],
            [3,4,5],
            [6,7,8],
            [0,3,6],
            [1,4,7],
            [2,5,8],
            [0,4,8],
            [2,4,6]
        ]

        if(board.getEmptyCells().length === 0) {
            gameWon = 'tie';
        }

        for(const [index, win] of winConditions.entries()) {
            if(win.every(elem => plays.indexOf(elem) > -1)) {
                gameWon = {index : index, player : activePlayer};
            }
        }
        return gameWon;
    }
    
    const handleWin = (check) => {
        if(check === 'tie') {
            console.log('tie');
            return 'This is a Tie Match!';
        } else if(check) {
            winner = check.player;
            console.log(`${check.player} wins this Match!`);
            return `${check.player} wins this Match!`;
        } else {
            winner = null;
        }
    }
    
    printNewRound();

    return {getActivePlayer, playRound, getBoard: board.getBoard, getWinner};
}

function ScreenController() {
    let game = null;
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const result = document.querySelector('.result');
    const startGameBtn = document.querySelector('#startGame');
    const gameContainer = document.querySelector('.game-container');
    const playerOneInput = document.querySelector('#playerOne');
    const playerTwoInput = document.querySelector('#playerTwo');

    startGameBtn.addEventListener('click', () => {
        game = GameController(playerOneInput.value || undefined, playerTwoInput.value || undefined);
        console.log(playerOneInput, playerTwoInput)
        gameContainer.style.display = 'block';
        updateScreen();
    })

    const updateScreen = () => {
        boardDiv.textContent = "";

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        playerTurnDiv.textContent = `It's ${activePlayer.name}'s turn.`;

        result.textContent = '';
        if(game.getWinner() === 'tie') result.textContent = `This game is a Tie !`;
        else if(game.getWinner()) result.textContent = `${game.getWinner().name} wins this match !`;

        board.forEach(cell => {
            const cellButton = document.createElement('button');
            cellButton.classList.add('cell');
            cellButton.dataset.index = cell.getValue();
            cellButton.textContent = typeof cell.getValue() !== 'number' ? cell.getValue() : '';
            boardDiv.appendChild(cellButton);
        })
    }

    function clickHandlerBoard(e) {
        const index = e.target.dataset.index;
    
        if(!index) return;
    
        game.playRound(index);
        updateScreen();
    }
    boardDiv.addEventListener('click', clickHandlerBoard);

}


ScreenController();


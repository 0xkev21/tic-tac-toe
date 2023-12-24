function Cell(initialValue) {

    let value = initialValue;

    const getValue = () => value;
    
    const addMark = (mark) => {
        value = mark;
    }

    return {getValue, addMark};
}

function Gameboard () {

    const board = Array.from({ length: 9 }, (_, index) => Cell(index));


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
        return board.filter(cell => typeof cell.getValue() === 'number');
    }

    return {getBoard, printBoard, addMark, resetBoard ,getEmptyCells};
}

function GameController(
    playerOneName = 'Player One',
    playerTwoName = 'Player Two',
    isPlayerOneBot = false,
    isPlayerTwoBot = false
) {
    const players = [
        {name: playerOneName, marker: 'X', isBot: isPlayerOneBot},
        {name: playerTwoName, marker: 'O', isBot: isPlayerTwoBot}
    ];

    const board = Gameboard();

    let bot1, bot2;

    if(isPlayerOneBot) {
        bot1 = Bot('X', board);
    }
    if(isPlayerTwoBot) {
        bot2 = Bot('O', board);
    }

    let activePlayer = players[0];

    const getActivePlayer = () => activePlayer;

    let winner = null;

    const getWinner = () => winner;

    const switchActivePlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0]; 
        if(activePlayer.isBot) {
            playBotMove();
        }
    }

    function Bot (marker) {

        const botMarker = marker;
    
        const makeMove = (origBoard) => {
            const emptyCells = origBoard.getEmptyCells().map(cell => cell.getValue());
            if(emptyCells.length > 0) {
                const randomIndex = Math.floor(Math.random() * emptyCells.length);
                console.log(emptyCells);
                return emptyCells[randomIndex];
            }
            return null;
        }
        return {makeMove};
    }

    const playBotMove = () => {
        if (bot1) {
            const move = bot1.makeMove(board);
            if(move) playRound(move);
        } else if(bot2) {
            const move = bot2.makeMove(board);
            if(move) playRound(move);
        }
    }

    const printNewRound = () => {
        console.log(`${getActivePlayer().name}'s turn.`);
        board.printBoard();
        if(activePlayer.isBot) return;
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

        if(board.getEmptyCells().length === 0 && gameWon === null) {
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
            cellButton.dataset.index = board.indexOf(cell);
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


// ScreenController();
const game = GameController('Kev', 'Bot', false, true);

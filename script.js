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

    let bot;

    let activePlayer = players[0];

    let winner = null;

    const getActivePlayer = () => activePlayer;

    const getWinner = () => winner;

    const switchActivePlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0]; 
    }

    const printNewRound = () => {
        console.log(`${getActivePlayer().name}'s turn.`);
        board.printBoard();
        if(activePlayer.isBot) {
            playBotMove();
        }
    }

    const playRound = (cell) => {
        if(!board.addMark(cell, getActivePlayer().marker)) return;

        console.log(`Adding ${getActivePlayer().name}'s mark at cell ${cell}.`);

        const result = checkWin(board.printBoard(), getActivePlayer().marker);
        handleWin(result);
        if(!result) {
            switchActivePlayer();
        } else {
            activePlayer = players[0];
        }
        printNewRound();
    }

    function checkWin (board, marker) {
        let gameWon = null;
        const plays = board.reduce((acc, elem, index) => {
            return elem === marker ? acc.concat(index) : acc;
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

        const emptyCells = board.filter(cell => typeof cell === 'number');

        if(emptyCells.length === 0 && gameWon === null) {
            gameWon = 'tie';
        }

        for(const [index, win] of winConditions.entries()) {
            if(win.every(elem => plays.indexOf(elem) > -1)) {
                gameWon = {index : index, player : getActivePlayer()};
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
            console.log(`${check.player.name} wins this Match!`);
            return `${check.player.name} wins this Match!`;
        } else {
            winner = null;
        }
    }

    const findBotMove = (board, marker) => {
        const origBoard = board;
        const botMarker = marker;
        const playerMarker = players[0].isBot ? players[1].marker : players[0].marker;


        // minmax algorithm for bot
        const minmax = (board, marker) => {
            // get empty cells
            const emptyCellIndices = board.filter(cell => typeof cell === 'number');

            // terminal states
            if(checkWin(board, botMarker)) {
                return {score: 10};
            } else if(checkWin(board, playerMarker)) {
                return {score: -10};
            } else if(emptyCellIndices.length === 0) {
                return {score: 0};
            }

            // array to store all the test plays
            const allTestPlays = [];

            // loop through all the empty cells
            for(let i = 0 ; i < emptyCellIndices.length; i ++) {

                //current test play
                const currentTestPlay = {};
                currentTestPlay.index = board[emptyCellIndices[i]];

                //make a move
                board[emptyCellIndices[i]] = marker;

                //another moves until reaches terminal states
                if(marker === botMarker) {
                    const result = minmax(board, playerMarker);
                    currentTestPlay.score = result.score;
                } else {
                    const result = minmax(board, botMarker);
                    currentTestPlay.score = result.score;
                }

                //reset the board
                board[emptyCellIndices[i]] = currentTestPlay.index;

                //push current test play to the all test plays
                allTestPlays.push(currentTestPlay);
            }

            // find the best play
            let bestScore, bestPlayIndex;
            if(marker === botMarker) {
                bestScore = -Infinity;
                for(let i = 0; i < allTestPlays.length; i++) {
                    if(allTestPlays[i].score > bestScore) {
                        bestScore = allTestPlays[i].score;
                        bestPlayIndex = i;
                    }
                }
            } else {
                bestScore = Infinity;
                for(let i = 0; i < allTestPlays.length; i++) {
                    if(allTestPlays[i].score < bestScore) {
                        bestScore = allTestPlays[i].score;
                        bestPlayIndex = i;
                    }
                }
            }

            return allTestPlays[bestPlayIndex];
        }

        return minmax(origBoard, botMarker).index;
    }

    const playBotMove = () => {
        const move = findBotMove(board.printBoard() ,getActivePlayer().marker);
        console.log(move);
        playRound(move);
    }

    printNewRound();

    return {getActivePlayer, playRound, getBoard: board.getBoard, resetBoard: board.resetBoard, getWinner};
}

function ScreenController() {
    // game section containers
    const startMenuContainer = document.querySelector('.start-menu');
    const gameContainer = document.querySelector('.game-container');
    const inGameMenuContainer = document.querySelector('.ingame-menu');
    const gameOverContainer = document.querySelector('.game-over-container');

    // buttons
    const startGameBtn = document.querySelector('#startGame');

    let game = null;
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const result = document.querySelector('.result');
    
    const playerOneInput = document.querySelector('#playerOne');
    const playerTwoInput = document.querySelector('#playerTwo');
    const isPlayerOneBot = document.querySelector('#bot-x');
    const isPlayerTwoBot = document.querySelector('#bot-o');

    // create board
    for(let i = 0; i  < 9; i++) {
        const cellButton = document.createElement('button');
        cellButton.classList.add('cell');
        cellButton.dataset.index = i;
        cellButton.textContent = '';
        boardDiv.appendChild(cellButton);
    }

    startGameBtn.addEventListener('click', () => {
        game = GameController(playerOneInput.value || undefined, playerTwoInput.value || undefined, isPlayerOneBot.checked, isPlayerTwoBot.checked);
        console.log(playerOneInput, playerTwoInput)
        gameContainer.style.display = 'block';
        updateScreen();
    })

    const updateScreen = () => {
        boardDiv.textContent = "";

        const boardWithValues = game.getBoard();
        const activePlayer = game.getActivePlayer();

        playerTurnDiv.textContent = `It's ${activePlayer.name}'s turn.`;

        result.textContent = '';
        
        if(game.getWinner() === 'tie') {
            result.textContent = `This game is a Tie !`;
            game.resetBoard();
        }
        else if(game.getWinner()) {
            result.textContent = `${game.getWinner().name} wins this match !`;
            game.resetBoard();
        }
    }

    function clickHandlerBoard(e) {
        const index = e.target.dataset.index;
    
        if(!index) return;
    
        game.playRound(index);
        updateScreen();
    }
    boardDiv.addEventListener('click', clickHandlerBoard);

}


ScreenController()
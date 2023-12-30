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

    const printBoard = () => {
        const boardWithValues = board.map(cell => cell.getValue());
        return boardWithValues;
    }

    const addMark = (cell, mark) => {
        board[cell].addMark(mark);
    }

    const resetBoard = () => {
        for(let i = 0; i < 9; i++) {
            board[i].addMark(i);
        }
    }

    const getEmptyCells = () => {
        return board.filter(cell => typeof cell.getValue() === 'number').map(cell => cell.getValue());
    }

    return {printBoard, addMark, resetBoard ,getEmptyCells};
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

    players.forEach(player => {
        if(player.isBot) {
            player.name = 'The Computer';
        }
    })

    const board = Gameboard();

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
        if(activePlayer.isBot && checkTie(board) !== 'tie') {
            playBotMove();
        }
    }

    const playRound = (cell) => {
        board.addMark(cell, getActivePlayer().marker);

        console.log(`Adding ${getActivePlayer().name}'s mark at cell ${cell}.`);

        const result = checkWin(board.printBoard(), getActivePlayer().marker) || checkTie(board);
        handleWin(result);
        if(!result) {
            switchActivePlayer();
            printNewRound();
        } else {
            activePlayer = players[0];
        }
    }

    function checkTie (board) {
        const emptyCells = board.getEmptyCells();
        if(emptyCells.length === 0) {
            return 'tie';
        }
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

        for(const [index, win] of winConditions.entries()) {
            if(win.every(elem => plays.indexOf(elem) > -1)) {
                gameWon = {indexRow : winConditions[index], player : getActivePlayer()};
            }
        }
        return gameWon;
    }
    
    const handleWin = (check) => {
        if(check === 'tie') {
            winner = 'tie';
            console.log('This is a Tie Match!');
            return 'This is a Tie Match!';
        } else if(check) {
            winner = check;
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

            // make random move if the bot got first move for better performance
            if(emptyCellIndices.length === 9) return {score: 0, index: Math.floor(Math.random()* 9)};

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
        playRound(move);
    }

    printNewRound();

    return {getActivePlayer, playRound, printBoard: board.printBoard, resetBoard: board.resetBoard, getWinner};
}

function ScreenController() {
    // game section containers
    const gameSections = document.querySelectorAll('.game-section');
    const inGameMenuContainer = document.querySelector('.ingame-menu');

    // buttons
    const startGameBtn = document.querySelector('#startGame');
    const menuBtn = document.querySelector('#menuButton');
    const restartBtns = document.querySelectorAll('.restart-button');
    const homeBtns = document.querySelectorAll('.home-button');

    // get inputs
    const playerOneInput = document.querySelector('#playerOne');
    const playerTwoInput = document.querySelector('#playerTwo');
    const isPlayerOneBot = document.querySelector('#bot-x');
    const isPlayerTwoBot = document.querySelector('#bot-o');
    const botContainers = document.querySelectorAll('.bot-container');
    
    // to show result
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');
    const result = document.querySelector('.result');

    let game = null;

    // create board
    for(let i = 0; i  < 9; i++) {
        const cellButton = document.createElement('button');
        cellButton.classList.add('cell');
        cellButton.dataset.index = i;
        cellButton.textContent = '';
        boardDiv.appendChild(cellButton);
    }
    const cells = boardDiv.querySelectorAll('.cell');

    const startGame = () => {
        resetGame();
        gameSections.forEach(section => section.classList.add('inGame'));
        game = GameController(playerOneInput.value || undefined, playerTwoInput.value || undefined, isPlayerOneBot.checked, isPlayerTwoBot.checked);
        updateScreen();
    }

    const resetGame = () => {
        cells.forEach(cell => cell.classList.remove('animate-scaleDown'));
        cells.forEach(cell => cell.classList.remove('winIndex'));
        gameSections.forEach(section => section.classList.remove('gameOver'));
        gameSections.forEach(section => section.classList.remove('inGame'));
    }

    const backToStart = () => {
        resetGame();
        game = null;
        updateScreen();
    }

    const updateScreen = () => {

        const updateBoard = () => {
            if(game === null) {
                cells.forEach(cell => cell.textContent = null);
            } else {
                for(let i = 0; i < game.printBoard().length; i++) {
                    if (typeof game.printBoard()[i] !== 'number') {
                        cells[i].textContent = game.printBoard()[i];
                        cells[i].classList.add('animate-scaleDown');
                    } else {
                        cells[i].textContent = '';
                    }
                }
            }
        }
        updateBoard();

        if(game) {
            const activePlayer = game.getActivePlayer();
            playerTurnDiv.textContent = `It's ${activePlayer.name}'s turn.`;
            boardDiv.dataset.active = activePlayer.marker;
            const winner = game.getWinner();
            if(winner) {
                gameSections.forEach(section => section.classList.remove('inGame'));
                gameSections.forEach(section => section.classList.add('gameOver'));
            }

            if(winner === 'tie') {
                result.textContent = `This match is a Tie !`;
            } else if(winner) {
                winner.indexRow.forEach(index => {
                    document.querySelector(`[data-index='${index}']`).classList.add('winIndex');
                })
                result.textContent = `${game.getWinner().player.name} wins this match !`;
            }
        }
        
        inGameMenuContainer.classList.remove('active');
    }

    function clickHandlerBoard(e) {
        const index = e.target.dataset.index;
        if(typeof game.printBoard()[index] === 'number') {
            game.playRound(index);
        }
        updateScreen();
    }

    // event listeners
    boardDiv.addEventListener('click', clickHandlerBoard);

    startGameBtn.addEventListener('click', startGame);
    restartBtns.forEach(btn => btn.addEventListener('click', startGame));
    homeBtns.forEach(btn => btn.addEventListener('click', backToStart));

    menuBtn.addEventListener('click', () => {
        inGameMenuContainer.classList.toggle('active');
    });

    botContainers.forEach(bot => bot.addEventListener('click', (e) => {
        makeOtherDisabled(e);
    }), true);

    function makeOtherDisabled (e) {

        const playerOneNameContainer = document.querySelector('.player-one-name-container');
        const playerTwoNameContainer = document.querySelector('.player-two-name-container');
        const playerOneBotContainer = document.querySelector(`[for='bot-x']`);
        const playerTwoBotContainer = document.querySelector(`[for='bot-o']`);
        const idClicked = e.target.id;

        switch(idClicked) {
            case 'bot-x':
                playerOneInput.value = '';
                playerOneNameContainer.classList.toggle('disabled');
                playerOneBotContainer.classList.toggle('checked');
                playerTwoBotContainer.classList.toggle('disabled');
                break;
            case 'bot-o':
                playerTwoInput.value = '';
                playerTwoNameContainer.classList.toggle('disabled');
                playerTwoBotContainer.classList.toggle('checked');
                playerOneBotContainer.classList.toggle('disabled');
            break;
        }
    }
}


ScreenController();
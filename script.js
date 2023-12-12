function Cell() {
    let value = '_';

    const getValue = () => value;
    
    const addMark = (mark) => {
        value = mark;
    }

    return {getValue, addMark};
}

function Gameboard () {
    const rows = 3;
    const cols = 3;
    const board = [];

    for(let i = 0; i < rows; i++) {
        board.push([]);
        for(let j = 0; j < cols; j++) {
            board[i].push(Cell());
        }
    }

    const getBoard = () => board;

    const printBoard = () => {
        const boardWithValues = board.map(row => row.map(cell => cell.getValue()));
        console.log(boardWithValues);
    }

    const addMark = (row, col, mark) => {
        if(board[row][col].getValue() !== '_') {
            return;
        }
        board[row][col].addMark(mark);
        return true;
    }

    const resetBoard = () => {
        for(let i = 0; i < rows; i++) {
            for(let j = 0; j < cols; j++) {
                board[i][j].addMark('_');
            }
        }
    }

    return {getBoard, printBoard, addMark, resetBoard};
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

    const switchActivePlayer = () => {
        activePlayer = activePlayer === players[0] ? players[1] : players[0]; 
    }

    const printNewRound = () => {
        console.log(`${getActivePlayer().name}'s turn.`);
        board.printBoard();
    }

    const playRound = (row, col) => {
        if(!board.addMark(row, col, getActivePlayer().marker)) return;

        console.log(`Adding ${getActivePlayer().name}'s mark at row ${row}, column ${col}.`);

        const result = checkWin();
        handleWin(result);
        if(!result) {
            switchActivePlayer();
        }
        printNewRound();
    }

    const checkWin = () => {
        const activePlayerMarker = getActivePlayer().marker;
        const boardWithValues = board.getBoard().map(row => row.map(cell => cell.getValue()));

        // Check rows
        if(boardWithValues.some(row => row.every(cell => cell === activePlayerMarker))) {
            return 'win';
        }

        // Check columns
        if(boardWithValues.some((_, col) => 
        boardWithValues.every(row => row[col] === activePlayerMarker))) {
            return 'win';
        }

        // Check diagonals
        // main diagonal
        if(boardWithValues.every((row, index) => row[index] === activePlayerMarker)) {
            return 'win';
        }
        // other diagonal
        if(boardWithValues.every((row, index) => row[boardWithValues.length - 1 - index] === activePlayerMarker)) {
            return 'win';
        }

        // Draw condition
        if(boardWithValues.every(row => row.every(cell => cell !== '_'))) {
            return 'draw';
        }
    }
    
    const handleWin = (check) => {
        switch(check) {
            case 'win':
                console.log(`${getActivePlayer().name} wins this match.`);
                board.resetBoard();
                break;
            case 'draw':
                console.log(`This match is a tie.`);
                board.resetBoard();
                break;
        }
    }
    

    printNewRound();

    return {getActivePlayer, playRound, getBoard: board.getBoard};
}

function ScreenController() {
    const game = GameController();
    const playerTurnDiv = document.querySelector('.turn');
    const boardDiv = document.querySelector('.board');

    const updateScreen = () => {
        boardDiv.textContent = "";

        const board = game.getBoard();
        const activePlayer = game.getActivePlayer();

        playerTurnDiv.textContent = `It's ${activePlayer.name}'s turn.`;

        board.forEach((row, ri) => {
            row.forEach((col, ci) => {
                const cellButton = document.createElement('button');
                cellButton.classList.add('cell');
                cellButton.dataset.row = ri;
                cellButton.dataset.column = ci;
                cellButton.textContent = col.getValue();
                boardDiv.appendChild(cellButton);
            })
        })
    }

    function clickHandlerBoard(e) {
        const row = e.target.dataset.row;
        const column = e.target.dataset.column;
    
        if(!row || !column) return;
    
        game.playRound(row, column);
        updateScreen();
    }
    boardDiv.addEventListener('click', clickHandlerBoard);

    updateScreen();
}


ScreenController();


document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".cell");
    const winnerDisplay = document.getElementById("winner");
    let currentPlayer = "X";
    let board = Array(9).fill(null);
    let scoreX = 0;
    let scoreO = 0;

    const winningCombinations = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6]
    ];

    const checkWinner = () => {
        for (const combination of winningCombinations) {
            const [a, b, c] = combination;
            if (board[a] && board[a] === board[b] && board[a] === board[c]) {
                return board[a];
            }
        }
        return board.includes(null) ? null : "Tie";
    };

    const updateScores = (winner) => {
        if (winner === "X") {
            scoreX++;
            document.getElementById("scoreX").textContent = scoreX;
        } else if (winner === "O") {
            scoreO++;
            document.getElementById("scoreO").textContent = scoreO;
        }
    };

    const makeComputerMove = () => {
        let availableCells = [];
        board.forEach((cell, index) => {
            if (!cell) availableCells.push(index);
        });
        if (availableCells.length > 0) {
            const randomIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
            board[randomIndex] = currentPlayer;
            cells[randomIndex].textContent = currentPlayer;
            const winner = checkWinner();
            if (winner) {
                winnerDisplay.textContent = winner === "Tie" ? "It's a tie!" : `${winner} wins!`;
                if (winner !== "Tie") {
                    updateScores(winner);
                }
            } else {
                currentPlayer = currentPlayer === "X" ? "O" : "X";
            }
        }
    };

    const handleClick = (e) => {
        const index = e.target.dataset.index;
        if (board[index] || winnerDisplay.textContent) return;

        board[index] = currentPlayer;
        e.target.textContent = currentPlayer;

        const winner = checkWinner();
        if (winner) {
            winnerDisplay.textContent = winner === "Tie" ? "It's a tie!" : `${winner} wins!`;
            if (winner !== "Tie") {
                updateScores(winner);
            }
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
            if (currentPlayer === "O") makeComputerMove();
        }
    };

    cells.forEach(cell => cell.addEventListener("click", handleClick));

    document.getElementById("restartButton").addEventListener("click", () => {
        board = Array(9).fill(null);
        cells.forEach(cell => cell.textContent = "");
        winnerDisplay.textContent = "";
        currentPlayer = "X";
    });
});

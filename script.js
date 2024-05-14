document.addEventListener("DOMContentLoaded", () => {
    const cells = document.querySelectorAll(".cell");
    const winnerDisplay = document.getElementById("winner");
    let currentPlayer = "X";
    let board = Array(9).fill(null);

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

    const handleClick = (e) => {
        const index = e.target.dataset.index;
        if (board[index] || winnerDisplay.textContent) return;

        board[index] = currentPlayer;
        e.target.textContent = currentPlayer;

        const winner = checkWinner();
        if (winner) {
            winnerDisplay.textContent = winner === "Tie" ? "It's a tie!" : `${winner} wins!`;
        } else {
            currentPlayer = currentPlayer === "X" ? "O" : "X";
        }
    };

    cells.forEach(cell => cell.addEventListener("click", handleClick));
});

document.addEventListener('DOMContentLoaded', function () {
	const dimensionButton = document.getElementById('dimension-button');
	const statusElement = document.getElementById('status');
	const restartButton = document.getElementById('restart-btn');
	const boardElement = document.getElementById('board');
	const backGame = document.getElementById('back-game')

	const dimensions = [16, 10, 12, 20];
	let dimensionIndex = 0;
	let dimension = dimensions[dimensionIndex];
	dimensionButton.textContent = `${dimension}x${dimension}`;
	let singlePlayerMode = false;
	let squares = Array(dimension).fill(Array(dimension).fill(null));
	let xIsNext = Math.random() < 0.5;
	let theWinner = null;
	let winningLine = [];
	let moveHistory = [];

	dimensionButton.addEventListener('click', function () {
		dimensionIndex = (dimensionIndex + 1) % dimensions.length;
		dimension = dimensions[dimensionIndex];
		dimensionButton.textContent = `${dimension}x${dimension}`;
		restartGame();
	});

	backGame.addEventListener('click', undoLastMove)

	restartButton.addEventListener('click', restartGame);

	function handleClick(row, col) {
		if (theWinner || squares[row][col]) {
			return;
		}

		console.log(row, col)

		moveHistory.push(squares.map((row) => [...row]));

		const newSquares = squares.map((row) => [...row]);
		newSquares[row][col] = xIsNext ? 'X' : 'O';
		squares = newSquares;
		xIsNext = !xIsNext;

		const winner = calculateWinner(newSquares, row, col);
		if (winner) {
			theWinner = winner;
			winningLine = findWinningLine(newSquares, row, col, winner);
		}

		renderBoard();
		updateStatus();

		if (singlePlayerMode && !theWinner && !xIsNext) {
			makeComputerMove();
		}
	}

	function undoLastMove() {
		if (moveHistory.length > 0) {
			squares = moveHistory.pop();
			xIsNext = !xIsNext;

			theWinner = null;
			winningLine = [];

			renderBoard();
			updateStatus();
		}
	}

	function renderBoard() {
		boardElement.innerHTML = '';
		for (let row = 0; row < dimension; row++) {

			const rowElement = document.createElement('div');
			rowElement.className = 'board-row';
			for (let col = 0; col < dimension; col++) {
				const value = squares[row][col];
				const isWinningSquare = winningLine.some(([winRow, winCol]) => winRow === row && winCol === col);

				const squareButton = document.createElement('button');
				squareButton.className = 'square';
				squareButton.style.backgroundColor = isWinningSquare ? '#838383' : '#ededed';
				squareButton.style.color = value === 'X' ? 'blue' : 'red';
				squareButton.style.fontWeight = isWinningSquare ? 'bold' : 'normal';
				squareButton.textContent = value;
				squareButton.addEventListener('click', () => {
					if (!singlePlayerMode || (singlePlayerMode && xIsNext)) {
						handleClick(row, col);
					}
				});

				rowElement.appendChild(squareButton);
			}

			boardElement.appendChild(rowElement);
		}
	}

	function updateStatus() {
		if (theWinner) {
			statusElement.textContent = `Winner: ${theWinner}`;
		} else {
			statusElement.textContent = `Player: ${xIsNext ? 'X' : 'O'}`;
		}
	}

	function restartGame() {
		squares = Array(dimension).fill(Array(dimension).fill(null));
		xIsNext = true;
		theWinner = null;
		winningLine = [];
		renderBoard();
		updateStatus();
	}


	function makeComputerMove() {
		if (!singlePlayerMode || theWinner) {
			return;
		}

		const availableMoves = [];
		const humanPlayer = xIsNext ? 'X' : 'O';
		const computerPlayer = xIsNext ? 'O' : 'X';

		squares.forEach((row, rowIndex) => {
			row.forEach((col, colIndex) => {
				if (!squares[rowIndex][colIndex]) {
					availableMoves.push([rowIndex, colIndex]);
				}
			});
		});

		if (availableMoves.length > 0) {
			for (let i = 0; i < availableMoves.length; i++) {
				const [row, col] = availableMoves[i];
				const newSquares = squares.map((row) => [...row]);
				newSquares[row][col] = computerPlayer;

				if (calculateWinner(newSquares, row, col) === computerPlayer) {
					handleClick(row, col);
					return;
				}
			}

			for (let i = 0; i < availableMoves.length; i++) {
				const [row, col] = availableMoves[i];
				const newSquares = squares.map((row) => [...row]);
				newSquares[row][col] = humanPlayer;

				if (calculateWinner(newSquares, row, col) === humanPlayer) {
					handleClick(row, col);
					return;
				}
			}

			const randomIndex = Math.floor(Math.random() * availableMoves.length);
			const [row, col] = availableMoves[randomIndex];

			if (availableMoves.length >= 3) {
				for (let i = 0; i < availableMoves.length; i++) {
					const [row, col] = availableMoves[i];
					const newSquares = squares.map((row) => [...row]);
					newSquares[row][col] = computerPlayer;

					if (isWinningMove(newSquares, computerPlayer)) {
						handleClick(row, col);
						return;
					}
				}
			}

			handleClick(row, col);
		}
	}

	function isWinningMove(currentSquares, player) {
		for (let row = 0; row < dimension; row++) {
			for (let col = 0; col < dimension; col++) {
				if (!currentSquares[row][col]) {
					const newSquares = currentSquares.map((row) => [...row]);
					newSquares[row][col] = player;
					if (calculateWinner(newSquares, row, col) === player) {
						return true;
					}
				}
			}
		}
		return false;
	}



	function calculateWinner(currentSquares, row, col) {
		const currentPlayer = currentSquares[row][col];

		let count = 1;
		let leftCol = col - 1;
		while (leftCol >= 0 && currentSquares[row][leftCol] === currentPlayer) {
			count++;
			leftCol--;
		}
		let rightCol = col + 1;
		while (rightCol < dimension && currentSquares[row][rightCol] === currentPlayer) {
			count++;
			rightCol++;
		}
		if (count >= 5) {
			return currentPlayer;
		}

		count = 1;
		let topRow = row - 1;
		while (topRow >= 0 && currentSquares[topRow][col] === currentPlayer) {
			count++;
			topRow--;
		}
		let bottomRow = row + 1;
		while (bottomRow < dimension && currentSquares[bottomRow][col] === currentPlayer) {
			count++;
			bottomRow++;
		}
		if (count >= 5) {
			return currentPlayer;
		}

		count = 1;
		let topLeftRow = row - 1;
		let topLeftCol = col - 1;
		while (topLeftRow >= 0 && topLeftCol >= 0 && currentSquares[topLeftRow][topLeftCol] === currentPlayer) {
			count++;
			topLeftRow--;
			topLeftCol--;
		}
		let bottomRightRow = row + 1;
		let bottomRightCol = col + 1;
		while (bottomRightRow < dimension && bottomRightCol < dimension && currentSquares[bottomRightRow][bottomRightCol] === currentPlayer) {
			count++;
			bottomRightRow++;
			bottomRightCol++;
		}
		if (count >= 5) {
			return currentPlayer;
		}

		count = 1;
		let topRightRow = row - 1;
		let topRightCol = col + 1;
		while (topRightRow >= 0 && topRightCol < dimension && currentSquares[topRightRow][topRightCol] === currentPlayer) {
			count++;
			topRightRow--;
			topRightCol++;
		}
		let bottomLeftRow = row + 1;
		let bottomLeftCol = col - 1;
		while (bottomLeftRow < dimension && bottomLeftCol >= 0 && currentSquares[bottomLeftRow][bottomLeftCol] === currentPlayer) {
			count++;
			bottomLeftRow++;
			bottomLeftCol--;
		}
		if (count >= 5) {
			return currentPlayer;
		}

		return null;
	}

	function findWinningLine(currentSquares, row, col, winner) {
		const currentPlayer = currentSquares[row][col];
		const lines = [];

		let leftCol = col - 1;
		while (leftCol >= 0 && currentSquares[row][leftCol] === currentPlayer) {
			lines.push([row, leftCol]);
			leftCol--;
		}
		lines.push([row, col]);
		let rightCol = col + 1;
		while (rightCol < dimension && currentSquares[row][rightCol] === currentPlayer) {
			lines.push([row, rightCol]);
			rightCol++;
		}
		if (lines.length >= 5) {
			return lines;
		}

		let topRow = row - 1;
		while (topRow >= 0 && currentSquares[topRow][col] === currentPlayer) {
			lines.push([topRow, col]);
			topRow--;
		}
		lines.push([row, col]);
		let bottomRow = row + 1;
		while (bottomRow < dimension && currentSquares[bottomRow][col] === currentPlayer) {
			lines.push([bottomRow, col]);
			bottomRow++;
		}
		if (lines.length >= 5) {
			return lines;
		}

		let topLeftRow = row - 1;
		let topLeftCol = col - 1;
		while (topLeftRow >= 0 && topLeftCol >= 0 && currentSquares[topLeftRow][topLeftCol] === currentPlayer) {
			lines.push([topLeftRow, topLeftCol]);
			topLeftRow--;
			topLeftCol--;
		}
		lines.push([row, col]);
		let bottomRightRow = row + 1;
		let bottomRightCol = col + 1;
		while (bottomRightRow < dimension && bottomRightCol < dimension && currentSquares[bottomRightRow][bottomRightCol] === currentPlayer) {
			lines.push([bottomRightRow, bottomRightCol]);
			bottomRightRow++;
			bottomRightCol++;
		}
		if (lines.length >= 5) {
			return lines;
		}

		let topRightRow = row - 1;
		let topRightCol = col + 1;
		while (topRightRow >= 0 && topRightCol < dimension && currentSquares[topRightRow][topRightCol] === currentPlayer) {
			lines.push([topRightRow, topRightCol]);
			topRightRow--;
			topRightCol++;
		}
		lines.push([row, col]);
		let bottomLeftRow = row + 1;
		let bottomLeftCol = col - 1;
		while (bottomLeftRow < dimension && bottomLeftCol >= 0 && currentSquares[bottomLeftRow][bottomLeftCol] === currentPlayer) {
			lines.push([bottomLeftRow, bottomLeftCol]);
			bottomLeftRow++;
			bottomLeftCol--;
		}
		if (lines.length >= 5) {
			return lines;
		}

		return [];
	}

	renderBoard();
	updateStatus();
});

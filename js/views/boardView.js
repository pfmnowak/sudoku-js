class BoardView {
	generateBoard(board) {
		document.querySelectorAll('.tile--small').forEach((tile, i) => {
			if (board.charAt(i) === '-') return;
			// Set tile text to correct number
			tile.textContent = board.charAt(i);
			tile.classList.add('disabled', `tile--${board.charAt(i)}`);
		});
	}

	addHandlerClick(handler) {
		document.querySelectorAll('.tile--small').forEach(tile => {
			tile.addEventListener('click', function () {
				handler(tile);
			});
		});
	}
}

export default new BoardView();

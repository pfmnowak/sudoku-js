import * as model from './model.js';
import boardView from './views/boardView.js';
import controlView from './views/controlView.js';
import digitsView from './views/digitsView.js';

function startGame() {
	// Choose board difficulty
	let board;
	if (document.querySelector('.easy').checked) board = model.easy[0];
	else if (document.querySelector('.medium').checked) board = model.medium[0];
	else board = model.hard[0];
	// Create board based on difficulty
	generateBoard(board);
	// Start the timer
	// ToDo

	// Show number container
	document.querySelector('.number-container').classList.remove('u-hidden');
}

function generateBoard(board) {
	// Clear previous board
	clearPrevious();

	// Select all tiles
	let tiles = document.querySelectorAll('.tile--small');

	for (let i = 0; i < tiles.length; i++) {
		let tile = tiles[i];
		if (board.charAt(i) != '-') {
			// Set tile text to correct number
			tile.textContent = board.charAt(i);
			tile.classList.add(`tile--${board.charAt(i)}`);
		} else {
			// clear tile
			tile.textContent = '';

			// Set a listener
			tile.addEventListener('click', function () {
				// If selecting is disabled
				if (model.state.disableSelect) return;
				// If there is no selected digit
				if (!model.state.selectedNum) return;

				// If the tile is already selected
				if (tile.classList.contains('selected')) {
					// Then remove selection
					tile.classList.remove('selected');
					model.state.selectedTile = null;
				} else {
					// Deselect all other tiles
					document
						.querySelectorAll('.tile--small')
						.forEach(t => t.classList.remove('selected'));

					// Select it and update selectedTile variable
					tile.classList.add('selected');
					model.state.selectedTile = this;
					updateMove();
				}

				console.log(`TILE ${model.state.selectedTile?.classList}`);
			});
		}
	}
}

const controlDigits = function (tile) {
	// If selecting is not disabled
	if (model.state.disableSelect) return;

	// If the tile is already selected
	if (tile.classList.contains('selected')) {
		// Then remove selection
		tile.classList.remove('selected');
		model.state.selectedNum = null;
	} else {
		// Deselect all other tiles
		document
			.querySelectorAll('.tile--big')
			.forEach(t => t.classList.remove('selected'));

		// Select it and update selectedNum variable
		tile.classList.add('selected');
		model.state.selectedNum = tile;
	}
	console.log(`DIGIT ${model.state.selectedNum?.classList}`);
};

function updateMove() {
	// If a tile and number is selected
	if (!model.state.selectedTile || !model.state.selectedNum) return;
	// Set the tile to the correct number
	if (model.state.selectedNum.textContent === 'X') {
		model.state.selectedTile.textContent = '';
	} else {
		model.state.selectedTile.textContent = model.state.selectedNum.textContent;
	}

	// Deselect the tiles
	model.state.selectedTile.classList.remove('selected');

	// Clear the selected tile
	model.state.selectedTile = null;
}

function clearPrevious() {
	// Access all of the tiles
	// let tiles = document.querySelectorAll('.tile--small');
	// Remove each tile
	// for (let i = 0; i < tiles.length; i++) {
	// 	tiles[i].remove();
	// }

	// If there is a Timer clear it
	//

	// Deselect any numbers
	for (
		let i = 0;
		i < document.querySelector('.number-container').children.length;
		i++
	) {
		document
			.querySelector('.number-container')
			.children[i].classList.remove('selected');
	}
	// Clear selected variables
	model.state.selectedNum = null;
	model.state.selectedTile = null;
}

const init = function () {
	boardView.addHandlerRender();
	controlView.addHandlerStart(startGame);
	digitsView.addHandlerClick(controlDigits);
};

init();

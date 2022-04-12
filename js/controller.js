import * as model from './model.js';
import boardView from './views/boardView.js';
import controlView from './views/controlView.js';
import digitsView from './views/digitsView.js';

let timer;

function startGame() {
	// Choose board difficulty
	let board;
	if (document.querySelector('.easy').checked) board = model.easy[0];
	else if (document.querySelector('.medium').checked) board = model.medium[0];
	else board = model.hard[0];

	// Clear previous board
	clearPrevious();

	// Update the board
	boardView.generateBoard(board);

	// Start the timer
	startTimer();

	// Show number container
	document.querySelector('.number-container').classList.remove('u-hidden');
}

const startTimer = function () {
	let i = 0;
	document.querySelector('.timer').textContent = convertTime(i);
	timer = setInterval(function () {
		document.querySelector('.timer').textContent = convertTime(++i);
	}, 1000);
};

const convertTime = function (time) {
	let minutes = Math.floor(time / 60);
	let seconds = time % 60;
	return `${(minutes = minutes < 10 ? `0${minutes}` : minutes)}:${
		seconds < 10 ? `0${seconds}` : seconds
	}`;
};

const controlTiles = function (tile) {
	// If selecting is disabled
	if (model.state.disableSelect) return;

	// If the tile is already selected
	if (tile.classList.contains('selected')) {
		// Then remove selection
		tile.classList.remove('selected');
		model.state.selectedTile = null;
		return;
	}

	// If there is no selected digit
	if (!model.state.selectedNum) {
		// If the tile is already highlighted
		const highlighted = tile.classList.contains('highlighted');

		// Remove highlight from all the tiles
		document
			.querySelectorAll('.tile')
			.forEach(t => t.classList.remove('highlighted'));

		if (highlighted) return;
		// Highlight all tiles with the given value
		document
			.querySelectorAll(`.tile--${tile.textContent}`)
			.forEach(t => t.classList.add('highlighted'));
		return;
	}

	// If the tile is disabled
	if (tile.classList.contains('disabled')) return;

	// Deselect all other tiles
	document
		.querySelectorAll('.tile--small')
		.forEach(t => t.classList.remove('selected'));

	// Select it and update selectedTile variable
	tile.classList.add('selected');
	model.state.selectedTile = tile;
	updateMove();
};

const controlDigits = function (tile) {
	// If selecting is not disabled
	if (model.state.disableSelect) return;

	// Remove highlight from all the tiles
	document
		.querySelectorAll('.tile')
		.forEach(t => t.classList.remove('highlighted'));

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

		// Highlight all tiles with the given value
		document
			.querySelectorAll(`.tile--${tile.textContent}`)
			.forEach(t => t.classList.add('highlighted'));
	}
};

function updateMove() {
	// If a tile and number is selected
	if (!model.state.selectedTile || !model.state.selectedNum) return;

	model.state.selectedTile.className = '';

	// Set the tile to the correct number
	if (model.state.selectedNum.textContent === 'X') {
		model.state.selectedTile.textContent = '';
		model.state.selectedTile.classList.add('tile', 'tile--small');
	} else {
		model.state.selectedTile.textContent = model.state.selectedNum.textContent;
		model.state.selectedTile.classList.add(
			'tile',
			'tile--small',
			`tile--${model.state.selectedNum.textContent}`,
			'highlighted'
		);
	}

	// Deselect the tiles
	model.state.selectedTile.classList.remove('selected');

	// Clear the selected tile
	model.state.selectedTile = null;
}

function clearPrevious() {
	// Access all of the tiles
	document.querySelectorAll('.tile--small').forEach(tile => {
		tile.className = '';
		tile.textContent = '';
		tile.classList.add('tile', 'tile--small');
		// Remove a listener
		tile.removeEventListener('click', controlTiles);
	});

	// Access all of the digits
	document.querySelectorAll('.tile--big').forEach(tile => {
		tile.classList.remove('selected', 'highlighted');
	});

	// Clear selected variables
	model.state.selectedNum = null;
	model.state.selectedTile = null;

	// If there is a Timer clear it
	if (timer) clearTimeout(timer);
}

const init = function () {
	// Set the listeners
	boardView.addHandlerClick(controlTiles);
	controlView.addHandlerStart(startGame);
	digitsView.addHandlerClick(controlDigits);
};

init();

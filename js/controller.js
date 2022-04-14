import * as model from './model.js';
import boardView from './views/boardView.js';
import controlView from './views/controlView.js';
import digitsView from './views/digitsView.js';

let timer;

const startGame = function () {
	getData();
	loadData();
};

const restartGame = function () {
	loadData();
};

const getData = function () {
	// Choose board difficulty
	let board;
	let solution;

	if (document.querySelector('.easy').checked)
		[board, solution] =
			model.data.easy[Math.floor(Math.random() * model.data.easy.length)];
	else if (document.querySelector('.medium').checked)
		[board, solution] =
			model.data.medium[Math.floor(Math.random() * model.data.medium.length)];
	else
		[board, solution] =
			model.data.hard[Math.floor(Math.random() * model.data.hard.length)];

	model.state.solution = solution;
	model.state.board = board;
};

const loadData = function () {
	// Show number container
	document.querySelector('.number-container').classList.remove('hidden');

	// Activate the board
	model.state.disableSelect = false;

	// ToDo: Reset will do these too
	// Clear previous board
	clearState();
	// Store current board
	model.state.currentBoard = [...model.state.board];
	// Update the board
	boardView.generateBoard(model.state.board);
	// Start the timer
	startTimer();
};

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

const updateMove = function () {
	let tile = model.state.selectedTile;
	let digit = model.state.selectedNum;

	// If a tile and number is selected
	if (!tile || !digit) return;

	// Update current board in a model
	model.state.currentBoard[tile.id] = digit.textContent;

	// Clear the tile
	tile.className = '';
	tile.textContent = '';
	tile.classList.add('tile', 'tile--small');

	if (digit.textContent === 'X') return;

	// Set the tile to the correct number
	tile.textContent = digit.textContent;
	tile.classList.add(
		'tile',
		'tile--small',
		`tile--${digit.textContent}`,
		'highlighted'
	);

	// Check if correct & if done
	checkCorrect(tile) && checkDone() && endGame();

	// Deselect the tiles
	tile.classList.remove('selected');

	// Clear the selected tile
	tile = null;
};

const checkCorrect = tile =>
	model.state.solution.charAt(tile.id) === tile.textContent;

const checkDone = () =>
	model.state.currentBoard.join('') === model.state.solution;

const endGame = () => {
	model.state.disableSelect = true;

	clearState(false);

	// Open modal
	toggleModal();
};

const clearState = (clearTiles = true) => {
	// Access all of the tiles
	document.querySelectorAll('.tile--small').forEach(tile => {
		clearTiles && (tile.textContent = '');
		tile.className = '';
		tile.classList.add('tile', 'tile--small');
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
};

const toggleModal = () => {
	document.querySelector('.overlay').classList.toggle('hidden');
	document.querySelector('.modal').classList.toggle('hidden');
};

const init = function () {
	// Set the listeners
	boardView.addHandlerClick(controlTiles);
	controlView.addHandlerStart(startGame);
	controlView.addHandlerReset(restartGame);
	digitsView.addHandlerClick(controlDigits);
	// ToDo: Create seperate view for modal later
	document
		.querySelector('.btn--close-modal')
		.addEventListener('click', toggleModal);
};

init();

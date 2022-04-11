import * as model from './model.js';
// import boardView from './views/boardView.js';
// import controlView from './views/controlView.js';
// import digitsView from './views/digitsView.js';

// Create variables
var selectedNum;
var selectedTile;
var disableSelect;

function startGame() {
	// Choose board difficulty
	let board;
	if (document.getElementById('easy').checked) board = model.easy[0];
	else if (document.getElementById('medium').checked) board = model.medium[0];
	else board = model.hard[0];
	disableSelect = false;
	// Create board based on difficulty
	generateBoard(board);
	// Start the timer
	// ToDo

	// Show number container
	document.getElementById('number-container').classList.remove('hidden');
}

function generateBoard(board) {
	// Clear previous board
	clearPrevious();

	// Select all tiles
	let tiles = document.querySelectorAll('.tile--small');

	for (let i = 0; i < tiles.length; i++) {
		if (board.charAt(i) != '-') {
			// Set tile text to correct number
			tiles[i].textContent = board.charAt(i);
		} else {
			// Set a listener
			// clear tile
			tiles[i].textContent = '';
		}
	}

	// old solution
	/* 
    
        // Let used to increment tile ids
        let idCount = 0;
        // Create 81 tiles
        for (let i = 0; i < 81; i++) {
            // Create a new paragraph element
            let tile = document.createElement('p');
            if (board.charAt(i) != '-') {
                // Set tile text to correct number
                tile.textContent = board.charAt(i);
            } else {
                // Leave the tile blank and add Click Event Listener
                //
            }
            // Assign tile id
            tile.id = idCount;
            idCount++;

            // WTF, we can use the "i" let you dummy
            // but whatever

            // Add tile class to tile
            tile.classList.add('tile');

            // Add t h i c c borders
            // (I can remove them in the SuperHard mode)


            if ((tile.id > 17 && tile.id < 27) || (tile.id > 44 && tile.id < 54)) {
                tile.classList.add('bottomBorder');
            }
            if ((tile.id + 1) % 9 == 3 || (tile.id + 1) % 9 == 6) {
                tile.classList.add('rightBorder');
            }

            // Add tiles to board
            id('board').appendChild(tile);
        }

    */
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
		i < document.getElementById('number-container').children.length;
		i++
	) {
		document
			.getElementById('number-container')
			.children[i].classList.remove('selected');
	}
	// Clear selected variables
	selectedNum = null;
	selectedTile = null;
}

const init = function () {
	window.onload = function () {
		// Run startgame function when button is clicked
		document.getElementById('start-btn').addEventListener('click', startGame);
	};
};

init();

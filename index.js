// Load boards from file or manually
const easy = [
  "6------7------5-2------1---362----81--96-----71--9-4-5-2---651---78----345-------",
  "685329174971485326234761859362574981549618732718293465823946517197852643456137298"
];
const medium = [
  "--9-------4----6-758-31----15--4-36-------4-8----9-------75----3-------1--2--3--",
  "619472583243985617587316924158247369926531478734698152891754236365829741472163895"
];
const hard = [
  "-1-5-------97-42----5----7-5---3---7-6--2-41---8--5---1-4------2-3-----9-7----8--",
  "712583694639714258845269173521436987367928415498175326184697532253841769976352841"
];

// Create variables
var selectedNum;
var selectedTile;
var disableSelect;

window.onload = function() {
    // Run startgame function when button is clicked
    id("start-btn").addEventListener("click", startGame);
}

function startGame() {
    // console.log("Start that Bitch!");
    // Choose board difficulty
    let board;
    if(id("easy").checked) board = easy[0];
    else if(id("medium").checked) board = medium[0];
    else board = hard[0];
    disableSelect = false;
    // Create board based on difficulty
    generateBoard(board);
    // Start the timer
    // Do that later, I am lazy af

    // Set theme based on input
    if(id("dark-theme").checked) {
        qs("body").classList.remove("light");
    } else {
        qs("body").classList.add("light");
    }
    // Show number container
    id("number-container").classList.remove("hidden");
}

function generateBoard(board) {
    // Clear previous board
    clearPrevious();
    // Let used to increment tile ids
    let idCount = 0;
    // Create 81 tiles
    for(let i = 0; i < 81; i++) {
        // Create a new paragraph element
        let tile = document.createElement("p");
        if(board.charAt(i) != "-") {
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
        tile.classList.add("tile");

        // Add t h i c c borders
        // (I can remove them in the SuperHard mode)

        if((tile.id > 17 && tile.id < 27) || (tile.id > 44 && tile.id < 54)) {
            tile.classList.add("bottomBorder");
        }
        if((tile.id + 1) % 9 == 3 || (tile.id + 1) % 9 == 6 ) {
            tile.classList.add("rightBorder");
        }
        // Add tiles  to board
        id("board").appendChild(tile);
    }
}

function clearPrevious() {
    // Access all of the tiles
    let tiles = qsa(".tile");
    // Remove each tile
    for(let i = 0; i < tiles.length; i++) {
        tiles[i].remove();
    }
    // If there is a Timer clear it
    //
    // Deselect any numbers
    for(let i = 0; i < id("number-container").children.length; i++) {
        id("number-container").children[i].classList.remove("selected");
    }
    // Clear selected variables
    selectedNum = null;
    selectedTile = null;
}


// Helper functions
function id(id) {
    return document.getElementById(id);
}

function qs(selector) {
    return document.querySelector(selector);
}

function qsa(selector) {
    return document.querySelectorAll(selector);
}
let img // Emoji image
let imgSec // Subsection for drawing
let sel = 16 // Selected emoji, default skeddle
let selX, selY // XY coords of selected emoji
let names // List of emoji names, must match order of image

let grid = [] // Grid object
let tileSize = 32 // Size of each tile in pixels
let imgTileSize = 32 // Size of the tiles in the input image
let gridWidth = 16 // Number of tiles in the x-axis
let gridHeight = 16 // Number of tiles in the y-axis
let numTiles // Number of valid emoji in the image/list

let fRate = 60
let fCount = fRate / 2 // Selection blink counter

let gridOn = true

function preload () {
  img = loadImage('assets/emoji.png')
  names = loadStrings('assets/names.txt')
}

function setup () {
  let canvas = createCanvas(1024, 600)
  canvas.elt.addEventListener('contextmenu', e => e.preventDefault()) // Stop right click menu
  canvas.parent('myContainer') // Insert into 'myContainer' div
  // Removes image filtering
  drawingContext.mozImageSmoothingEnabled = false
  drawingContext.webkitImageSmoothingEnabled = false
  drawingContext.msImageSmoothingEnabled = false
  drawingContext.imageSmoothingEnabled = false

  frameRate(fRate)
  stroke(255)
  noFill()
  // Create a 16x16 grid
  numTiles = names.length
  //Set up and populate grid with -1
  clearCanvas()
  // Set default selection tile
  imgSec = img.get(512, 32, imgTileSize, imgTileSize)
  
  // Create buttons for save/copy/clear
  button = createButton('Copy Discord Emoji')
  button.position(0, 552)
  button.mousePressed(makeText)

  button = createButton('Save Image')
  button.position(150, 552)
  button.mousePressed(screenshot)

  button = createButton('Clear Canvas')
  button.position(300, 552)
  button.mousePressed(clearCanvas)

  button = createButton('Toggle Grid')
  button.position(400, 552)
  button.mousePressed(toggleGrid)
}

function draw () {
  // Clear the screen
  background(49, 51, 56)
  // darkmode
  //fill(49, 51, 56)
  //rect(0, 0, 1024, 512)
  // Draw the emoji sheet on right
  image(img, 512, 0)
  stroke(127)
  // Draw canvas grid fully to make sure it's under all emoji
  if (gridOn) {
    for (let j = 0; j < gridHeight; j++) {
      for (let i = 0; i < gridWidth; i++) {
        rect(i * tileSize, j * tileSize, tileSize, tileSize)
      }
    }
  }
  // Draw the emoji on the canvas
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      //rect(i * tileSize, j * tileSize, tileSize, tileSize);
      if (grid[i][j] < numTiles) {
        image(
          img.get(
            (grid[i][j] % gridWidth) * imgTileSize,
            Math.floor(grid[i][j] / gridHeight) * imgTileSize,
            imgTileSize,
            imgTileSize
          ),
          j * tileSize,
          i * tileSize,
          tileSize,
          tileSize
        )
      }
    }
  }

  // Listen for mouse clicks
  if (mouseIsPressed) {
    // Draw only on left
    if (mouseX < 512 && mouseY < 512) {
      if (mouseButton === LEFT) {
        // Set the corresponding grid square to current selection, or :blank:
        grid[Math.floor(mouseY / tileSize)][Math.floor(mouseX / tileSize)] = sel
      }
      if (mouseButton === RIGHT) {
        grid[Math.floor(mouseY / tileSize)][Math.floor(mouseX / tileSize)] = -1
      }
    }
    // Selection functions
    if (mouseX > 512 && mouseY < 512) {
      sel =
        Math.floor((mouseX - 512) / imgTileSize) +
        Math.floor(mouseY / imgTileSize) * gridWidth
      if (sel > numTiles - 1) sel = -1
      selX = (sel % gridWidth) * imgTileSize // x position
      selY = Math.floor(sel / gridHeight) * imgTileSize // y position
      imgSec = img.get(selX, selY, imgTileSize, imgTileSize)
    }
    line(pmouseX, pmouseY, mouseX, mouseY)
  }
  // Draw selection rectangle for 0.5s or 15 frames
  if (fCount > fRate / 2) {
    stroke(192)
    noFill()
    rect(512 + selX, selY, imgTileSize, imgTileSize)
  } else if (fCount === 0) {
    fCount = fRate
  }
  fCount--
}

function setSelection (x, y) {}

function makeText () {
  let outStr = ''
  newGrid = trimToBoundingBox(grid)

  for (let i = 0; i < newGrid.length; i++) {
    for (let j = 0; j < newGrid[i].length; j++) {
      if (newGrid[i][j] === -1) {
        outStr = outStr.concat(':blank:')
      } else if (newGrid[i][j] < numTiles + 1) {
        //add each name to string one row at at time
        outStr = outStr.concat(':', names[newGrid[i][j]], ':')
      }
    }
    if (i < newGrid.length - 1) {
      outStr = outStr.concat('\n')
    }
  }
  // Strips EOL :blank: emoji and copies to clipboard
  //navigator.clipboard.writeText(outStr.replace(/(?::blank:)+$/gm, ''))
  navigator.clipboard.writeText(outStr)
}
function keyPressed () {
  if (keyCode === LEFT_ARROW) {
    makeText()
  } else if (keyCode === RIGHT_ARROW) {
    screenshot()
  }
}

function trimToBoundingBox (array) {
  let numRows = array.length
  let numCols = array[0].length

  let minX = numCols
  let minY = numRows
  let maxX = -1
  let maxY = -1

  // Find the minimum and maximum x, y coordinates of non-empty cells
  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (array[row][col] !== -1) {
        minX = Math.min(minX, col)
        minY = Math.min(minY, row)
        maxX = Math.max(maxX, col)
        maxY = Math.max(maxY, row)
      }
    }
  }

  // Create the trimmed array based on the bounding box
  let trimmedArray = []
  for (let row = minY; row <= maxY; row++) {
    let trimmedRow = array[row].slice(minX, maxX + 1)
    trimmedArray.push(trimmedRow)
  }

  return trimmedArray
}
function trimBlanks (array) {
  let numCols = array.length
  let maxX = -1

  // Find the minimum and maximum x, y coordinates of non-empty cells
  for (let col = 0; col < numCols; col++) {
    if (array[col] !== -1) {
      maxX = Math.max(maxX, col)
    }
  }

  // Create the trimmed array based on the bounding box
  let trimmedArray = array.slice(0, maxX + 1)

  return trimmedArray
}
function screenshot () {
  get(0, 0, 512, 512).save()
}
function toggleGrid () {
  gridOn = !gridOn
}
function clearCanvas () {
  // i for rows/height, j for cols/width
  for (let i = 0; i < gridHeight; i++) {
    grid[i] = []
    for (let j = 0; j < gridWidth; j++) {
      grid[i][j] = -1
    }
  }
}

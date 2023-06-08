let img
let imgSec
let sel = 0
let selX, selY
let names

let tileSize = 32 // Size of each tile in pixels
let imgTileSize = 32 // Size of the tiles in the input image
let gridWidth = 16 // Number of tiles in the x-axis
let gridHeight = 16 // Number of tiles in the y-axis
let numTiles

let fRate = 60
let fCount = fRate / 2

function preload () {
  img = loadImage('assets/emoji.png')
  names = loadStrings('assets/names.txt')
}

function setup () {
  const canvas = createCanvas(1024, 768)
  canvas.elt.addEventListener('contextmenu', e => e.preventDefault())

  
  drawingContext.mozImageSmoothingEnabled = false;
  drawingContext.webkitImageSmoothingEnabled = false;
  drawingContext.msImageSmoothingEnabled = false;
  drawingContext.imageSmoothingEnabled = false;

  frameRate(fRate)
  stroke(255)
  // Create a 16x16 grid
  numTiles = Math.floor(img.width / imgTileSize) ** 2
  grid = []
  for (let i = 0; i < gridWidth; i++) {
    grid[i] = []
    for (let j = 0; j < gridHeight; j++) {
      grid[i][j] = numTiles + 1
    }
  }
  imgSec = img.get(512, 0, imgTileSize, imgTileSize)

  button = createButton('Copy Discord Emoji');
  button.position(0, 552);
  button.mousePressed(makeText);
  button = createButton('Save Image');
  button.position(150, 552);
  button.mousePressed(screenshot);
}

function draw () {
  // Clear the screen
  background(255)
  // darkmode
  fill(49, 51, 56)
  rect(0, 0, 1024, 512)
  // Draw the emoji sheet on right
  image(img, 512, 0)

  // Draw the grid
  for (let i = 0; i < gridWidth; i++) {
    for (let j = 0; j < gridHeight; j++) {
      if (grid[i][j] < numTiles) {
        // Draw a filled square at the current position
        //fill(0);
        //rect(i * 16, j * 16, 15, 15);
        //image(imgSec, i * tileSize, j * tileSize, tileSize, tileSize)
        image(
          img.get(
            (grid[i][j] % gridWidth) * imgTileSize,
            Math.floor(grid[i][j] / gridHeight) * imgTileSize,
            imgTileSize,
            imgTileSize
          ),
          i * tileSize,
          j * tileSize,
          tileSize,
          tileSize
        )
      } else if (grid[i][j] === numTiles + 1) {
        // Draw an unfilled square at the current position
        //noFill();
        //rect(i * tileSize, j * tileSize, tileSize, tileSize);
      }
    }
  }

  // Listen for mouse clicks
  if (mouseIsPressed && mouseX < 1024) {
    // Draw only on left
    if (mouseX < 512 && mouseY < 512) {
      if (mouseButton === LEFT) {
        // Set the corresponding grid square to current selection, or :blank:
        grid[Math.floor(mouseX / tileSize)][Math.floor(mouseY / tileSize)] = sel
      }
      if (mouseButton === RIGHT) {
        grid[Math.floor(mouseX / tileSize)][Math.floor(mouseY / tileSize)] =
          numTiles + 1
      }
    }
    // Selection functions
    if (mouseX > 512 && mouseY < 512) {
      sel =
        Math.floor((mouseX - 512) / imgTileSize) +
        Math.floor(mouseY / imgTileSize) * gridWidth
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
  for (let i = 0; i < newGrid[0].length; i++) {
    for (let j = 0; j < newGrid.length; j++) {
      if (newGrid[j][i] === numTiles + 1) {
        outStr = outStr.concat(':blank:')
      } else if (newGrid[j][i] < numTiles + 1) {
        //add each name to string one row at at time
        outStr = outStr.concat(':', names[newGrid[j][i]], ':')
      }
    }
    if (i < newGrid[0].length - 1) {
      outStr = outStr.concat('\n')
    }
  }
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
      if (array[row][col] !== numTiles + 1) {
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

function screenshot () {
  get(0, 0, 512, 512).save()
}

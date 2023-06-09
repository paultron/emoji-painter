let img // Emoji image
let imgSec // Subsection for drawing
let sel = 16 // Selected emoji, default skeddle
let blankNum = 17 // ID of blank emoji
let selX, selY // XY coords of selected emoji
let names // List of emoji names, must match order of image

let grid = [] // Grid object
let tileSize = 32 // Size of each tile in pixels
let imgTileSize = 32 // Size of the tiles in the input image
let gridWidth = 16 // Number of tiles in the x-axis
let gridHeight = 16 // Number of tiles in the y-axis
let numTiles // Number of valid emoji in the image/list

let emojis = []

let fRate = 60
let fCount = fRate // Selection blink counter
let frameTimes = []
let frameTimesAmt = 120
let gridOn = true

function preload () {
  img = loadImage('assets/emoji.png')
  names = loadStrings('assets/names.txt')
}
p5.disableFriendlyErrors = true
function setup () {
  pixelDensity(1)
  numTiles = names.length
  emojis = []
  for (let i = 0; i < numTiles; i++) {
    emojis[i] = img.get(
      (i % gridWidth) * imgTileSize,
      Math.floor(i / gridHeight) * imgTileSize,
      tileSize,
      tileSize
    )
    //console.log(emojis[i].width)
  }
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
  //Set up and populate grid with blankNum
  clearCanvas()
  for (let i = 0; i < frameTimesAmt; i++) {
    frameTimes[i] = 0
  }
  // Set default selection tile
  imgSec = img.get(512, 32, imgTileSize, imgTileSize)

  // Create buttons for save/copy/clear
  button = createButton('Copy Discord Emoji')
  button.position(0, 552)
  button.mousePressed(makeText)

  button = createButton('Save PNG Image')
  button.position(150, 552)
  button.mousePressed(screenshot)

  button = createButton('Clear Canvas')
  button.position(300, 552)
  button.mousePressed(clearCanvas)

  button = createButton('Toggle Grid')
  button.position(400, 552)
  button.mousePressed(toggleGrid)

  updateSelection()
}

function draw () {
  background(49, 51, 56)
  // Draw the emoji sheet on right
  image(img, 512, 0)
  stroke(127)
  // Draw canvas grid fully to make sure it's under all emoji
  if (gridOn) {
    for (let j = 0; j < gridHeight; j++) {
      line(j * tileSize, 0, j * tileSize, 512)
    }
    for (let i = 0; i < gridWidth; i++) {
      line(0, i * tileSize, 512, i * tileSize)
    }
  }

  // Draw the emoji on the canvas
  for (let i = 0; i < gridHeight; i++) {
    for (let j = 0; j < gridWidth; j++) {
      image(emojis[grid[i][j]], j * tileSize, i * tileSize)
    }
  }
  
  // Listen for mouse clicks
  if (mouseIsPressed) {
    // Otherwise left
    if (mouseY > 0 && mouseX < 512 && mouseY < 512&& pmouseX<512 && pmouseY < 512) {
      if (mouseButton === LEFT ) {
        // Set the corresponding grid square to current selection, or :blank:
        //grid[Math.floor(mouseY / tileSize)][Math.floor(mouseX / tileSize)] = sel
        plotLine(
          Math.floor(pmouseX / tileSize),
          Math.floor(pmouseY / tileSize),
          Math.floor(mouseX / tileSize),
          Math.floor(mouseY / tileSize),
          sel
        )
      } else if (mouseButton === RIGHT) {
        //grid[Math.floor(mouseY / tileSize)][Math.floor(mouseX / tileSize)] = blankNum
        plotLine(
          Math.floor(pmouseX / tileSize),
          Math.floor(pmouseY / tileSize),
          Math.floor(mouseX / tileSize),
          Math.floor(mouseY / tileSize),
          blankNum
        )
      } else if (mouseButton === CENTER) {
        sel = grid[Math.floor(mouseY / tileSize)][Math.floor(mouseX / tileSize)]
        updateSelection()
      }
    }
    // Right half 2nd
    else if (mouseX > 512 && mouseX < 1024 && mouseY < 512) {
      sel =
        Math.floor((mouseX - 512) / imgTileSize) +
        Math.floor(mouseY / imgTileSize) * gridWidth
      updateSelection()
    }
    line(pmouseX, pmouseY, mouseX, mouseY)
  }
  
  // Draw selection rectangle for 0.5s or fRate/2 frames
  if (fCount > fRate / 2) {
    stroke(192)
    noFill()
    rect(512 + selX, selY, imgTileSize, imgTileSize)
  } else if (fCount === 0) {
    fCount = fRate
  }
  fCount--
  fill(192)
  noStroke()
  text(
    'Left click = draw | Right click = erase | Middle click = sample',
    10,
    530
  )
  noFill()
  
  let fps = frameRate()
  fill(255)
  stroke(0)
  text('FPS: ' + fps.toFixed(2), 10, height - 10)
  frameTimes.push(fps)
  frameTimes.shift()
  drawFpsCounter(96, height - 25, 120, 25)
  
}

function updateSelection () {
  if (sel > numTiles - 1) sel = blankNum
  selX = (sel % gridWidth) * imgTileSize // x position
  selY = Math.floor(sel / gridHeight) * imgTileSize // y position
  fcount = fRate // Reset selection square to ON
}

function makeText () {
  let outStr = ''
  newGrid = trimToBoundingBox(grid)

  for (let i = 0; i < newGrid.length; i++) {
    for (let j = 0; j < newGrid[i].length; j++) {
      if (newGrid[i][j] === blankNum) {
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
      grid[i][j] = blankNum
    }
  }
}
function plotLine (x0, y0, x1, y1, ID) {
  const dx = Math.abs(x1 - x0)
  const dy = Math.abs(y1 - y0)
  const sx = x0 < x1 ? 1 : -1
  const sy = y0 < y1 ? 1 : -1
  let err = dx - dy

  while (true) {
    // Plot the current point (x0, y0)
    //console.log('(' + x0 + ', ' + y0 + ')')
    grid[y0][x0] = ID
    if (x0 === x1 && y0 === y1) {
      break
    }

    const e2 = 2 * err

    if (e2 > -dy) {
      err -= dy
      x0 += sx
    }

    if (e2 < dx) {
      err += dx
      y0 += sy
    }
  }
}
function drawFpsCounter (x, y, w, h) {
  stroke(255)
  for (i = 0; i < frameTimesAmt; i++) {
    let x2 = map(i, 0, frameTimesAmt, x, x + w)
    let y2 = map(frameTimes[i], 0, fRate, y + h, y)
    point(x2, y2)
  }
}

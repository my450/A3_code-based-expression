let cometImg; // Variable to store the comet image
let activeComets = [];// Array to hold multiple comets
let bottomMargin = 100;
let lineSpacing = 20;
let leftPadding = 60;
let noteLines = [
  ["G", "D", "R", "E", "R", "E", "E", "F", "R", "D", "R", "R"],
  ["E", "D", "S", "D", "S", "G", "G", "D", "R", "E", "R", "E"],
  ["E", "F", "R", "D", "R", "R", "E", "D", "S", "D", "S", "D"],
];
let noteStatus = [];
let currentLineIndex = 0;
let currentNoteIndex = 0;
let solClef;
let board;
let animationInProgress = false;
let animationProgress = 0;
let bgImg;
let firstMiPlayed = false;
let miNoteCount = 0;
let reNoteCount = 0;
let doNoteCount = 0;
let solNoteCount = 0;
let showBoard = false;
let suggestion;
let bg2;
let currentMode = 1;
let notesCompleted = false;
let flower;
let flowerAnimation = [];
let welcomeBoard;
let showWelcomeBoard = true; // State for showing the board
let welcomeBoardPosition; // Position of the welcome board
let welcomeBoardOpacity = 0; // Opacity of the welcome board
let isSlidingOut = false;
let isWelcomeBoardClosed = false;
let isEscPressed = false; 

function preload() {
  // Load the comet image (replace 'comet.png' with your file path)
  cometImg = loadImage('img/comet.png');
  bgImg = loadImage("img/artboard 3.png");
  solClef = loadImage("img/treble-clef-1279909_640.png");
  board = loadImage("img/board.png");
  suggestion = loadImage("img/suggestion.png");
  bg2 = loadImage("img/artboard 4.png");
  flower = loadImage("img/flower.png");
  welcomeBoard = loadImage("img/welcome board.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight); // Canvas size
  margin = height - bottomMargin - 4 * lineSpacing;
  noteStatus = Array(noteLines[currentLineIndex].length).fill("pending");
  wiggleOffsets = Array(noteLines[currentLineIndex].length).fill(0);
  wiggleTimers = Array(noteLines[currentLineIndex].length).fill(0);
  welcomeBoardPosition = -653;

  noStroke();
  wrongSound = document.getElementById("wrongSound");

  noteSounds = {
    "D": document.getElementById("do"),
    "R": document.getElementById("re"),
    "E": document.getElementById("mi"),
    "F": document.getElementById("fa"),
    "G": document.getElementById("sol"),
    "A": document.getElementById("la"),
    "S": document.getElementById("si"),
  };
}

function draw() {
  if (currentMode === 2) {
    image(bgImg, 0, 0, width, height); 
    drawStaff();
    drawSolClef();
  } else if (currentMode === 1) {
    image(bg2, 0, 0, width, height); 
    drawStaff();
    drawSolClef();
  }

  if (animationInProgress) {
    handleLineTransition();
  } else {
    drawLineOfNotes(noteLines[currentLineIndex], noteStatus);
    drawSuggestion();
  }

  updateWiggle();

  if (showBoard) {
    applyBlurEffect(); // Add blur effect
    drawBoard();       // Display the board
  }

  // Draw active comets or petals
  if (currentMode === 2) {
    activeComets.forEach((comet, i) => {
      comet.update();
      comet.show();
      if (comet.isOffScreen()) activeComets.splice(i, 1);
    });
  } else if (currentMode === 1) {
    flowerAnimation.forEach((petal, i) => {
      petal.update();
      petal.show();
      if (petal.isOffScreen()) flowerAnimation.splice(i, 1);
    });
  }

  if (showWelcomeBoard) {
    // Add blur effect only if the welcome board is not sliding out
    if (!isSlidingOut) {
      applyBlurEffect();
    }
    drawWelcomeBoard(); // Display the welcome board
  }
}

function applyBlurEffect() {
  fill(0, 0, 0, 180); // Semi-transparent black overlay
  rect(0, 0, width, height); // Cover the entire canvas
}

// Comet Class
class Comet {
  constructor() {
    this.x = random(20, 800); // Start position (some off-screen to the left)
    this.y = random(-10, -70); // Start above the canvas
    this.speedX = random(4,8); // Horizontal speed
    this.speedY = this.speedX * 0.5; // Vertical speed (diagonal movement)
  }

  update() {
    // Move diagonally
    this.x += this.speedX;
    this.y += this.speedY;
  }

  isOffScreen() {
    return this.x > width + 50 || this.y > height + 50;
  }
  

  show() {
    // Draw the comet image
    image(cometImg, this.x, this.y, 351, 136); // Adjust size as needed
  }
}

class Petal {
  constructor() {
    this.x = width / 2.4; // Start position from left to right
    this.y = 0; // Starting at the top
    this.speedX = random(2, 4); // Horizontal speed
    this.speedY = random(-2, 2); // Vertical motion for more random movement
    this.alpha = 255; // Petal transparency
  }

  update() {
    this.x += this.speedX; // Move petal horizontally
    this.y += this.speedY; // Move petal vertically
    this.alpha -= 2; // Fade out effect for the petals

    // Ensure petals stay within bounds
    if (this.alpha <= 0) {
      this.alpha = 0;
    }
  }

  // Modify this condition to allow petals to move much further before disappearing
  isOffScreen() {
    return (
      this.x > width + 200 || // Allow the petal to move 200px off the right edge before disappearing
      this.y > height + 200 || // Allow the petal to move 200px off the bottom edge before disappearing
      this.x < -200 || // Allow the petal to move 200px off the left edge before disappearing
      this.y < -200 || // Allow the petal to move 200px off the top edge before disappearing
      this.alpha <= 0 // Fully faded out
    );
  }

  show() {
    // Draw the petal with transparency effect
    push();
    tint(255, this.alpha); // Apply transparency effect based on alpha
    image(flower, this.x, this.y, 800, 500); // Draw the flower image as the petal
    pop();
  }
}

function drawStaff() {
  stroke(175, 225, 240);
  strokeWeight(2);
  for (let i = 0; i < 5; i++) {
    line(50, margin + i * lineSpacing, width - 50, margin + i * lineSpacing);
  }
  line(50, margin, 50, margin + 4 * lineSpacing);
  line(width - 50, margin, width - 50, margin + 4 * lineSpacing);
}

function drawSolClef() {
  image(solClef, 70, margin - lineSpacing * 0.8, 40, 115);
}

function drawBoard() {
  let boardWidth = 1231;
  let boardHeight = 653;
  image(board, (width - boardWidth) / 2, (height - boardHeight) / 2, boardWidth, boardHeight);
}

function drawSuggestion() {
  let suggestionWidth = 204;
  let suggestionHeight = 19;
  image(suggestion, (width - suggestionWidth) /2, height - suggestionHeight - 10, suggestionWidth, suggestionHeight);
}

function drawWelcomeBoard() {
  const visibleTargetPosition = (height - 653) / 2; // Target position when fully visible
  const offScreenPosition = -653; // Target position when sliding out

  if (isSlidingOut) {
    // Slide out smoothly
    welcomeBoardPosition += (offScreenPosition - welcomeBoardPosition) * 0.1;
    welcomeBoardOpacity += (0 - welcomeBoardOpacity) * 0.1; // Fade out opacity
  } else if (showWelcomeBoard) {
    // Slide in smoothly
    welcomeBoardPosition += (visibleTargetPosition - welcomeBoardPosition) * 0.1;
    welcomeBoardOpacity += (255 - welcomeBoardOpacity) * 0.1; // Fade in opacity
  }

  // Clamp values to prevent overshooting
  welcomeBoardPosition = constrain(welcomeBoardPosition, offScreenPosition, visibleTargetPosition);
  welcomeBoardOpacity = constrain(welcomeBoardOpacity, 0, 255); // Ensure opacity stays within bounds

  // Draw the welcome board with updated position and opacity
  push();
  tint(255, welcomeBoardOpacity); // Apply the opacity value
  image(welcomeBoard, (width - 1231) / 2, welcomeBoardPosition, 1231, 653); // Draw the welcome board
  pop();
}

function drawLineOfNotes(notes, status) {
  let noteSpacing = 100;
  let noteRadius = 10;

  for (let i = 0; i < notes.length; i++) {
    let y = margin + getNoteVerticalOffset(notes[i]);
    let x = leftPadding + 100 + i * noteSpacing + wiggleOffsets[i];
    let textY = margin + 4 * lineSpacing + 30;

    if (status[i] === "correct") {
      noStroke();
      for (let glowSize = 1; glowSize <= 10; glowSize++) {
        fill(181, 238, 255, 22 - glowSize * 2); // Gradual fade
        ellipse(x, y, noteRadius * 2.5 + glowSize * 2, noteRadius * 1.6 + glowSize * 2);
      }
    }

    if (status[i] === "correct") {
      fill(181, 238,255);
      stroke(181, 238,255);
    } else {
      fill(123,197,247);
      stroke(123,197,247);
    }

    push();
    translate(x, y);
    rotate(radians(-20));
    ellipse(0, 0, noteRadius * 2.5, noteRadius * 1.6);
    pop();

    let stemX = (y === margin + lineSpacing * 0.5 || y === margin + lineSpacing * 1 || y === margin + lineSpacing * 1.5 || y === margin + lineSpacing * -0.1) 
      ? x + noteRadius - 21.8
      : x + noteRadius + 2.2;
    let stemY = (y === margin + lineSpacing * 0.5 || y === margin + lineSpacing * 1 || y === margin + lineSpacing * 1.5 || y === margin + lineSpacing * -0.1) 
      ? y + 60 
      : y - 60;

    strokeWeight(2);
    line(stemX, y, stemX, stemY);

    if ((currentLineIndex === 1 && i >= 6) || currentLineIndex === 2)  {
      continue; // Skip text drawing for these notes
    }

    fill(255);
    noStroke();
    textSize(16);
    textAlign(CENTER, CENTER);
    text(notes[i], x, textY);
  }
}

function getNoteVerticalOffset(note) {
  let noteOffsets = {
    "R": lineSpacing * 1,
    "D": lineSpacing * 1.5,
    "E": lineSpacing * 0.5,
    "A": lineSpacing * 2.5,
    "S": lineSpacing * 2,
    "G": lineSpacing * 3,
    "F": lineSpacing * -0.1,
  };
  return noteOffsets[note] || lineSpacing * 4; // Default to below the staff
}

function keyPressed() {
    if (keyCode === ESCAPE) {
        if (showWelcomeBoard) {
          isSlidingOut = true;
          showWelcomeBoard = false;
          isWelcomeBoardClosed = true;
    
          // Simulate animation completion (replace with your animation callback)
          setTimeout(() => {
            isSlidingOut = false;
            console.log("Welcome board slide-out completed.");
          }, 500); // Adjust time based on animation duration
        } else if (isWelcomeBoardClosed && !isSlidingOut) {
          console.log("Toggling suggestion board...");
          showBoard = !showBoard;
        }
        isEscPressed = true; // Set the flag to indicate ESC was pressed
        return; // Stop further execution to ensure wrongSound doesn't play
      }

  
  if (key === '1') { // Switch to Mode 2
    if (currentMode !== 1) { // Only act if switching to a new mode
      if (currentMode === 2 && notesCompleted) { 
        resetNotes(); // Reset notes only if in Mode 1 and notesCompleted is true
      }
    }
    currentMode = 1; // Switch to Mode 2
    activeComets = []; // Clear existing comets
    return;
  }

  if (key === '2') { // Switch to Mode 1
    if (currentMode !== 2) { // Only act if switching to a new mode
      if (currentMode === 1 && notesCompleted) { 
        resetNotes(); // Reset notes only if in Mode 2 and notesCompleted is true
      }
    }
    currentMode = 2; // Switch to Mode 1
    return;
  }

  if (animationInProgress || currentLineIndex >= noteLines.length) {
    return; // Ignore key presses during animation or after the last line
  }

  let expectedNote = noteLines[currentLineIndex][currentNoteIndex];
  
  if (key.toUpperCase() === expectedNote) {
    noteStatus[currentNoteIndex] = "correct"; // Mark as correct
    playCorrectSound(expectedNote); 
    generatePetals();
    currentNoteIndex++; // Move to the next note
  } else {
    noteStatus[currentNoteIndex] = "wrong"; // Mark as wrong
    startWiggle(currentNoteIndex); // Trigger wiggle
    playWrongSound(); // Play the wrong note sound
  }

  // Check if the current line is complete
  if (currentNoteIndex >= noteLines[currentLineIndex].length) {
    if (currentLineIndex < noteLines.length - 1) {
      animationInProgress = true; // Start transition to next line
    } else {
      notesCompleted = true; // Mark as completed when all lines are done
    }
  }
}

function generatePetals() {
  let numOfPetals = 1; // Number of petals to generate per correct note
  for (let i = 0; i < numOfPetals; i++) {
    flowerAnimation.push(new Petal()); // Create a new petal and add it to the array
  }
}

function resetNotes() {
  currentLineIndex = 0; // Reset to the first line
  currentNoteIndex = 0; // Reset the note index
  noteStatus = Array(noteLines[currentLineIndex].length).fill("pending"); // Reset the note status
  notesCompleted = true; // Reset the completion flag
}

function generateCometForNote(note) {
  // Logic to create and add a comet based on the note played
  activeComets.push({
    note: note,
    position: { x: random(width), y: 0 },
    speed: random(2, 5),
  });
}

function handleLineTransition() {
  animationProgress += 0.05;

  // Draw static elements (staff and clef)
  drawStaff();
  drawSolClef();

  // Draw only the next line during transition
  if (animationProgress < 1) {
    drawLineOfNotes(
      noteLines[currentLineIndex + 1],
      Array(noteLines[currentLineIndex + 1].length).fill("pending")
    );
  }

  // Complete the transition
  if (animationProgress >= 1) {
    animationInProgress = false;
    currentLineIndex++; // Move to the next line
    animationProgress = 0; // Reset animation progress
    currentNoteIndex = 0; // Reset note index
    noteStatus = Array(noteLines[currentLineIndex].length).fill("pending"); // Reset note statuses
  }
}

function startWiggle(index) {
  wiggleTimers[index] = 9; // Set wiggle timer (3 repetitions of left/right motion)
}

function updateWiggle() {
  for (let i = 0; i < wiggleTimers.length; i++) {
    if (wiggleTimers[i] > 0) {
      wiggleTimers[i]--; // Decrease the timer

      // Create left/right oscillation (-3, 3, -3, etc.)
      let phase = wiggleTimers[i] % 6;
      wiggleOffsets[i] = (phase % 2 === 0 ? -3 : 3);

      // Reset the offset when the animation ends
      if (wiggleTimers[i] === 0) {
        wiggleOffsets[i] = 0;
      }
    }
  }
}

function playCorrectSound(note) {
  let sound = noteSounds[note];
  if (sound) {
    sound.currentTime = 0; // Reset sound to the beginning
    sound.play().catch((error) => console.error("Error playing sound:", error));
  }

  if (currentMode === 2) {
    // Create and add a comet for the correct note in Mode 1
    activeComets.push(new Comet());
  }

  if (currentMode === 1) {
    // Create and add a comet for the correct note in Mode 1
    flowerAnimation.push(new Petal());
  }

  if (note === "E") {
    miNoteCount++; // Increment the counter for "Mi" notes
    if (miNoteCount === 1 || miNoteCount === 5) {
      let additionalSound = document.getElementById("d1"); // First additional sound
      if (additionalSound) {
        additionalSound.currentTime = 0; // Reset to the start
        additionalSound.play().catch((error) => console.error("Error playing additional sound:", error));
      }
    } else if (miNoteCount === 2 || miNoteCount === 6) {
      let additionalSound = document.getElementById("d2"); // Second additional sound
      if (additionalSound) {
        additionalSound.currentTime = 0; // Reset to the start
        additionalSound.play().catch((error) => console.error("Error playing additional sound:", error));
      }
    } 
  }

  // Check if it's the fourth "Re" note and play the additional sound
  if (note === "R") {
    reNoteCount++; // Increment the counter for "Re" notes
    if (reNoteCount === 4 || reNoteCount === 9) {
      let additionalSound = document.getElementById("d4"); // Fourth "Re" additional sound
      if (additionalSound) {
        additionalSound.currentTime = 0; // Reset to the start
        additionalSound.play().catch((error) => console.error("Error playing additional sound:", error));
      }
    } 
  }

  if (note === "D") {
    doNoteCount++; // Increment the counter for "Do" notes
    if (doNoteCount === 4) {
      let additionalSound = document.getElementById("d6"); // Third "Do" additional sound
      if (additionalSound) {
        additionalSound.currentTime = 0;
        additionalSound.play().catch((error) => console.error("Error playing additional sound:", error));
      }
    }
    else if (doNoteCount === 8) {
      let additionalSound = document.getElementById("d6"); // Second additional sound
      if (additionalSound) {
        additionalSound.currentTime = 0; // Reset to the start
        additionalSound.play().catch((error) => console.error("Error playing additional sound:", error));
      }
    } 
    else if (doNoteCount === 9) {
      let additionalSound = document.getElementById("d8"); // Second additional sound
      if (additionalSound) {
        additionalSound.currentTime = 0; // Reset to the start
        additionalSound.play().catch((error) => console.error("Error playing additional sound:", error));
      }
    } 
  }

  if (note === "G") {
    solNoteCount++; // Increment the counter for "Do" notes
    if (solNoteCount === 2) {
      let additionalSound = document.getElementById("d7"); // Third "Do" additional sound
      if (additionalSound) {
        additionalSound.currentTime = 0;
        additionalSound.play().catch((error) => console.error("Error playing additional sound:", error));
      }
    }
  }
}

function playWrongSound() {
  if (wrongSound) {
    wrongSound.currentTime = 0; // Reset to the start of the audio
    wrongSound.play().catch((error) => {
      console.error("Playback error:", error);
    });
  } else {
    console.error("wrongSound is not defined or loaded.");
  }
}
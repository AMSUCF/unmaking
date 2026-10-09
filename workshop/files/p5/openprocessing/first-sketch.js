// first-sketch.js: for OpenProcessing. Paste this whole file over the starter code in a new p5.js sketch.
// The same sketch runs offline as workshop/files/p5/first-sketch.html.

// setup() runs once when the page loads.
function setup() {
  createCanvas(windowWidth, windowHeight);
  background('#efe4cf');               // TRY: any CSS colour, or three numbers: background(20, 20, 40)
  textFont('Courier New');
  textAlign(CENTER, CENTER);
  textSize(28);
  fill('#2b2118');
  text('click to stamp, drag to draw, press S to save', width / 2, 40);
}

// draw() runs about 60 times a second, forever.
function draw() {
  if (mouseIsPressed) {
    stroke('#7b4fb3');                 // TRY: change the thread colour
    strokeWeight(6);                   // TRY: a thicker or thinner line
    line(pmouseX, pmouseY, mouseX, mouseY);
  }
}

// mouseClicked() runs once per click.
function mouseClicked() {
  noStroke();
  fill(random(['#c0544a', '#3f8f8a', '#e2b33c', '#ff4fb8']));  // TRY: your own palette
  const size = random(20, 80);         // TRY: make every stamp the same size
  rect(mouseX - size / 2, mouseY - size / 2, size, size);      // TRY: ellipse(mouseX, mouseY, size)
}

function keyPressed() {
  if (key === 's' || key === 'S') saveCanvas('my-first-sketch', 'png');
}

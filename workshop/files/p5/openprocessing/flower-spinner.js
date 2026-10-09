// flower-spinner.js: for OpenProcessing. Paste this whole file over the starter code in a new p5.js sketch.
// The same sketch runs offline as workshop/files/p5/flower-spinner.html.

// Same shape as files/tracery/spinner-grammar.json. Change the words; 3 to 12 per ring reads well.
const grammar = {
  "origin": ["#outer# meets #inner#"],
  "outer": ["DH", "Making", "Play", "Pedagogy", "Tech Comm", "Archives"],
  "inner": ["Twine", "Tracery", "p5.js", "Agents", "Bitsy", "Zines"]
};

const rings = [
  { words: grammar.outer, dist: 0.33, petal: 0.18, angle: 0, target: 0, colour: '#9fd8a8' },
  { words: grammar.inner, dist: 0.17, petal: 0.13, angle: 0, target: 0, colour: '#d7f2c9' },
];
let S;  // canvas size
let reading, spinButton;

function setup() {
  S = min(560, windowWidth - 32);
  const canvas = createCanvas(S, S);
  // This page has a slot, a reading line and a SPIN button. On OpenProcessing there's only the canvas, so make them.
  if (select('#sketch')) canvas.parent('sketch');
  reading = select('#reading') || createP('Press SPIN (or the space bar).').style('font', '20px Courier New, monospace');
  spinButton = select('#spin') || createButton('SPIN').style('font', '18px Courier New, monospace');
  spinButton.mouseClicked(spin);
  textFont('Courier New');
  textAlign(CENTER, CENTER);
}

function spin() {
  // Each ring lands on a random petal after a few full turns.
  rings.forEach((r) => {
    const step = TWO_PI / r.words.length;
    r.pick = floor(random(r.words.length));
    r.target = r.angle + TWO_PI * floor(random(2, 5)) + ((-r.pick * step - r.angle) % TWO_PI + TWO_PI) % TWO_PI;
  });
  reading.html('…');
}

function keyPressed() { if (key === ' ') { spin(); return false; } }

function draw() {
  background('#1c1430');
  translate(S / 2, S / 2);
  let settled = true;
  rings.forEach((r) => {
    r.angle = lerp(r.angle, r.target, 0.04);
    if (abs(r.target - r.angle) > 0.002) settled = false; else r.angle = r.target;
    drawRing(r);
  });
  // Knob, and a pointer above the rings (fixed, pointing down at the top petals).
  fill('#111'); stroke('#f2f2f2'); strokeWeight(3);
  circle(0, 0, S * 0.1);
  fill('#ffd84a'); noStroke();
  const tip = -S * (rings[0].dist + rings[0].petal * 0.69);
  triangle(-12, tip - 22, 12, tip - 22, 0, tip);
  if (settled && rings[0].pick !== undefined) {
    const line = grammar.origin[0].replace('#outer#', rings[0].words[rings[0].pick]).replace('#inner#', rings[1].words[rings[1].pick]);
    if (reading.html() !== line) reading.html(line);
  }
}

function drawRing(r) {
  const n = r.words.length;
  push();
  rotate(r.angle);
  for (let i = 0; i < n; i++) {
    push();
    rotate(i * TWO_PI / n - HALF_PI);   // word 0 starts under the pointer
    translate(r.dist * S, 0);
    // The petal under the pointer gets a gold outline.
    const up = ((r.angle + i * TWO_PI / n) % TWO_PI + TWO_PI) % TWO_PI;
    const top = min(up, TWO_PI - up) < PI / n;
    fill(r.colour); stroke(top ? '#ffd84a' : '#111'); strokeWeight(top ? 5 : 2);
    ellipse(0, 0, r.petal * S * 1.35, r.petal * S);
    noStroke(); fill('#111');
    textSize(max(11, S * 0.03));
    text(r.words[i], 0, 0);              // written outward from the centre, as in the print
    pop();
  }
  pop();
}

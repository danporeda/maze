const { Engine, Render, Runner, World, Bodies, Body, Events } = Matter;

const cells = 10;
const width = 600;
const height = 600;
const unitLength = width / cells;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: true,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true })
];
World.add(world, walls);

// Maze Generation

const shuffle = (arr) => {
  let counter = arr.length;

  while (counter > 0) {
    const index = Math.floor(Math.random() * counter);

    counter--;

    const temp = arr[counter];
    arr[counter] = arr[index];
    arr[index] = temp;
  }

  return arr;
}

const grid = Array(cells).fill(null).map(() => Array(cells).fill(false));

const verticals = Array(cells).fill(null).map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1).fill(null).map(() => Array(cells).fill(false))

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

// Create grid values, creating values for horizontals and verticals arrays
const stepThroughCell = (row, column) => {
  if (grid[row][column]) {
    return;
  }

  grid[row][column] = true;
  
  const neighbors = shuffle([
    [row - 1, column, 'up'],
    [row, column + 1, 'right'],
    [row + 1, column, 'down'],
    [row, column - 1, 'left']
  ]);
  
  for (let neighbor of neighbors) {
    const [nextRow, nextColumn, direction] = neighbor;
    
    if (nextRow < 0 || nextRow >= cells || nextColumn < 0 || nextColumn >= cells) {
      continue;
    }

    if (grid[nextRow][nextColumn]) {
      continue;
    }

    if (direction === 'left') {
      verticals[row][column - 1] = true;
    } else if (direction === 'right') {
      verticals[row][column] = true;
    } else if (direction === 'up') {
      horizontals[row - 1][column] = true;
    } else if (direction === 'down') {
      horizontals[row][column] = true;
    }
    
    // nested callback; when a grid cell has no moving options, it goes back to the prior
    // function call and searches for remaining moving options, until the first function call. 
    stepThroughCell(nextRow, nextColumn);
  }
};

stepThroughCell(startRow, startColumn);

// Generate Walls based on verticals & horizontals arrays 
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open){
      return;
    }

    const wall = Bodies.rectangle(
      columnIndex * unitLength + (unitLength / 2),
      rowIndex * unitLength + unitLength,
      unitLength,
      2, 
      { isStatic: true }
    );
    World.add(world, wall);
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) {
      return;
    }

    const wall = Bodies.rectangle(
      unitLength * columnIndex + unitLength,
      unitLength * rowIndex + (unitLength / 2),
      2,
      unitLength,
      { isStatic: true }
    );
    World.add(world, wall);
  });
});

const goal = Bodies.rectangle(
  width - (unitLength / 2),
  height - (unitLength / 2),
  unitLength * 0.75,
  unitLength * 0.75,
  { isStatic: true, label: 'goal' }
);
World.add(world, goal);

// Ball
const ball = Bodies.circle(
  unitLength / 2,
  unitLength / 2,
  unitLength / 4,
  { label: 'ball' }
);
World.add(world, ball);

document.addEventListener('keydown', event => {
  const { x, y } = ball.velocity;

  // Up
  if (event.keyCode === 87) {
    Body.setVelocity(ball, { x, y: y - 5 });
  }

  // Down
  if (event.keyCode === 83) {
    Body.setVelocity(ball, { x, y: y + 5 });
  }

  // Left
  if (event.keyCode === 65) {
    Body.setVelocity(ball, { x: x - 5, y });
  }

  // Right
  if (event.keyCode === 68) {
    Body.setVelocity(ball, { x: x + 5, y });
  };
});

// Win Condition
Events.on(engine, 'collisionStart', event => {
  event.pairs.forEach((collision) => {
    const labels = ['ball', 'goal'];

    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      console.log('User Won!!');
    }
  });
});


// Random Shapes
// for (let i = 0; i < 20; i++) {
//   let x = Math.floor(Math.random() * 700 + 51);
//   let y = Math.floor(Math.random() * 500 + 51);
//   World.add(world, Bodies.rectangle(x,y,50,50));
// };


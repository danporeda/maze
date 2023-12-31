const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = Matter;

const cellsVertical = 5;
const cellsHorizontal = 5;
const width = window.innerWidth;
const height = window.innerHeight;

const unitLengthX = width / cellsHorizontal;
const unitLengthY = height / cellsVertical;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: false,
    width,
    height
  }
});
Render.run(render);
Runner.run(Runner.create(), engine);

// Walls
const generateWalls = (world, width, height) => {
  const walls = [
    Bodies.rectangle(width / 2, 0, width, 20, { isStatic: true }),
    Bodies.rectangle(width / 2, height, width, 20, { isStatic: true }),
    Bodies.rectangle(0, height / 2, 20, height, { isStatic: true }),
    Bodies.rectangle(width, height / 2, 20, height, { isStatic: true })
  ];
  World.add(world, walls);
};

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

// Create grid values, creating values for horizontals and verticals arrays
const stepThroughCell = (row, column, grid, verticals, horizontals) => {
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
    
    if (nextRow < 0 || nextRow >= cellsVertical || nextColumn < 0 || nextColumn >= cellsHorizontal) {
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
    stepThroughCell(nextRow, nextColumn, grid, verticals, horizontals);
  }
};

const newMaze = (
  world, 
  width, 
  height, 
  unitLengthX, 
  unitLengthY, 
  cellsVertical, 
  cellsHorizontal
) => {
  setTimeout(() => {
    document.querySelector('.instructions').classList.add('hidden');
  }, 3000)
  generateWalls(world, width, height);

  const grid = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal).fill(false));

  const verticals = Array(cellsVertical).fill(null).map(() => Array(cellsHorizontal - 1).fill(false));

  const horizontals = Array(cellsVertical - 1).fill(null).map(() => Array(cellsHorizontal).fill(false));

  const startRow = Math.floor(Math.random() * cellsVertical);
  const startColumn = Math.floor(Math.random() * cellsHorizontal);

  stepThroughCell(startRow, startColumn, grid, verticals, horizontals);

  // Generate Walls based on verticals & horizontals arrays 
  horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open){
        return;
      }

      const wall = Bodies.rectangle(
        columnIndex * unitLengthX + (unitLengthX / 2),
        rowIndex * unitLengthY + unitLengthY,
        unitLengthX,
        2, 
        { isStatic: true, label: 'wall', render: { fillStyle: 'red' } }
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
        unitLengthX * columnIndex + unitLengthX,
        unitLengthY * rowIndex + (unitLengthY / 2),
        2,
        unitLengthY,
        { isStatic: true, label: 'wall', render: { fillStyle: 'red' } }
      );
      World.add(world, wall);
    });
  });

  const goal = Bodies.rectangle(
    width - (unitLengthX / 2),
    height - (unitLengthY / 2),
    unitLengthX * 0.75,
    unitLengthY * 0.75,
    { isStatic: true, label: 'goal', render: { fillStyle: 'green' } }
  );
  World.add(world, goal);

  // Ball
  const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
  const ball = Bodies.circle(
    unitLengthX / 2,
    unitLengthY / 2,
    ballRadius,
    { label: 'ball', render: { fillStyle: 'blue' } }
  );
  World.add(world, ball);

  // Keystrokes to move ball
  document.addEventListener('keydown', event => {
    const { x, y } = ball.velocity;

    // Up: w
    if (event.keyCode === 87) {
      Body.setVelocity(ball, { x, y: y - 5 });
    }

    // Down: s
    if (event.keyCode === 83) {
      Body.setVelocity(ball, { x, y: y + 5 });
    }

    // Left: a
    if (event.keyCode === 65) {
      Body.setVelocity(ball, { x: x - 5, y });
    }

    // Right: d
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
        document.querySelector('.winner').classList.remove('hidden');
        world.gravity.y = 1;
        world.bodies.forEach(body => {
          if (body.label === 'wall') {
            Body.setStatic(body, false);
          };
        });
      }
    });
  });
};

newMaze(world, width, height, unitLengthX, unitLengthY, cellsVertical, cellsHorizontal);

const gotIt = document.querySelector('#got-it');
gotIt.addEventListener('click', () => {
  document.querySelector('.instructions').classList.add('hidden');
});

const restartButton = document.querySelector('#restart');
restartButton.addEventListener('click', () => {
  document.querySelector('.winner').classList.add('hidden');
  Composite.clear(world);
  world.gravity.y = 0;
  document.querySelector('.instructions').classList.remove('hidden');
  newMaze(world, width, height, unitLengthX, unitLengthY, cellsVertical, cellsHorizontal);
});

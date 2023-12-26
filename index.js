const { Engine, Render, Runner, World, Bodies } = Matter;

const width = 600;
const height = 600;

const engine = Engine.create();
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
const walls = [
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 40, height, { isStatic: true })
];
World.add(world, walls);

// Maze Generation

const grid = Array(3).fill(null).map(() => Array(3).fill(false));

console.log(grid);

// Random Shapes
// for (let i = 0; i < 20; i++) {
//   let x = Math.floor(Math.random() * 700 + 51);
//   let y = Math.floor(Math.random() * 500 + 51);
//   World.add(world, Bodies.rectangle(x,y,50,50));
// };


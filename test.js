const { World, Engine, Render, Runner, Bodies } = Matter;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  engine: engine,
  element: document.body,
  options: {
    width: 800,
    height:600
  }
});
Render.run(render);
Runner.run(Runner.create(), engine)
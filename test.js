const { World, Engine, Runner, Render, Bodies } = Matter;

const engine = Engine.create();
const { world } = engine;
const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    height: 600,
    width: 800
  }
})
Render.run(render);
Runner.run(Runner.create(), engine)
import * as PIXI from 'pixi.js';
// import fit from 'math-fit';

window.PIXI = PIXI;

export default class Scene {
  constructor(container) {
    this.canvasContainer = container;

    this.app = new PIXI.Application({
      backgroundColor: 0xf1efe5,
    });
  }

  destroyListener = () => {
    this.app.stage.removeAllListeners();
  };
}
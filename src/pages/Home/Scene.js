/* eslint-disable */

import * as PIXI from 'pixi.js';
import gsap from 'gsap';

window.PIXI = PIXI;
export default class Scene {
  constructor(container, images) {
    this.canvasContainer = container;

    this.app = new PIXI.Application({
      backgroundColor: 0x000000,
      resizeTo: window,
    });

    this.imagesArray = images;

    this.loader = new PIXI.Loader();

    this.root = new PIXI.Container();
    this.app.stage.addChild(this.root);

    this.mouse = { x: 0, y: 0 };
    this.cursorPosition = { x: 0, y: 0 };
    this.prevPosition = { x: 0, y: 0 };
    this.currentIndex = 0;
    this.distanceLength = 120;

    this.canvasContainer.appendChild(this.app.view);

    this.preload();
  }

  destroyListener = () => {
    this.app.stage.removeAllListeners();
  };

  preload = () => {
    this.imagesArray.forEach(item => {
      this.loader.add(item, item);
    });

    this.loader.load().onComplete.add(() => {
      this.setup();
      this.render();
    });
  };

  imageAppear = (x, y) => {
    const imageTexture = new PIXI.Texture.from(
      this.imagesArray[this.currentIndex]
    );
    const imageSprite = new PIXI.Sprite(imageTexture);
    imageSprite.position.set(x, y);

    const circleSprite = new PIXI.Sprite.from(PIXI.Texture.WHITE);
    circleSprite.position.set(x, y);

    this.imageContainer.addChild(circleSprite);
    imageSprite.mask = circleSprite;
    circleSprite.anchor.set(0.5);

    imageSprite.width = 200;
    imageSprite.height = 200;

    imageSprite.anchor.set(0.5);

    this.imageContainer.addChild(imageSprite);

    this.tl = gsap
      .timeline()
      .to(circleSprite.scale, {
        x: 25,
        y: 25,
        duration: 0.6,
      })
      .to(imageSprite, {
        alpha: 0,
        duration: 0.6,
      })
      .add(() => {
        this.imageContainer.removeChild(imageSprite);
        this.imageContainer.removeChild(circleSprite);
      });

    gsap.to(imageSprite.position, {
      x: this.mouse.x,
      y: this.mouse.y,
      duration: 2,
    });
  };

  setup = () => {
    this.root.width = window.innerWidth;
    this.root.height = window.innerHeight;
    this.imageContainer = new PIXI.Container();
    this.root.addChild(this.imageContainer);

    this.app.stage.interactive = true;

    this.app.stage.on('mousemove', this.pointerMove);
  };

  distance = (x1, x2, y1, y2) => {
    return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5;
  };

  pointerMove = event => {
    this.mouse.x = event.data.global.x;
    this.mouse.y = event.data.global.y;
  };

  render = () => {
    this.app.ticker.add(() => {
      const dt = 1.0 - 0.85 ** gsap.ticker.deltaRatio();

      this.cursorPosition.x += (this.mouse.x - this.cursorPosition.x) * dt;
      this.cursorPosition.y += (this.mouse.y - this.cursorPosition.y) * dt;

      if (
        this.distance(
          this.prevPosition.x,
          this.cursorPosition.x,
          this.cursorPosition.y,
          this.prevPosition.y
        ) > this.distanceLength
      ) {
        this.prevPosition.x = this.cursorPosition.x;
        this.prevPosition.y = this.cursorPosition.y;
        this.currentIndex = (this.currentIndex + 1) % this.imagesArray.length;
        this.imageAppear(this.prevPosition.x, this.prevPosition.y);
      }
    });
  };
}

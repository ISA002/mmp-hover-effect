/* eslint-disable */

import * as PIXI from 'pixi.js';
import gsap from 'gsap';
import { ShockwaveFilter } from 'pixi-filters';

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
    this.cardSize = { width: 200, height: 200 };

    this.canvasContainer.appendChild(this.app.view);

    this.preload();
  }

  destroyListener = () => {
    this.app.stage.removeAllListeners();
    this.canvasContainer.removeEventListener(this.pointerMove);
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

  calculateSizeImage = (wWidth, wHeight, { orig }, cover) => {
    const { height: targetH, width: targetW } = orig;
    const rw = wWidth / targetW;
    const rh = wHeight / targetH;
    let r;
    if (cover) {
      r = rw > rh ? rw : rh;
    } else {
      r = rw < rh ? rw : rh;
    }
    return {
      left: (wWidth - targetW * r) >> 1,
      top: (wHeight - targetH * r) >> 1,
      width: targetW * r,
      height: targetH * r,
      scale: r,
      uvRate: {
        x: (targetW * r) / wWidth,
        y: (targetH * r) / wHeight,
      },
    };
  };

  imageAppear = (x, y) => {
    const imageTexture = new PIXI.Texture.from(
      this.imagesArray[this.currentIndex]
    );

    const imageContainer = new PIXI.Container();

    const bg = new PIXI.Graphics()
      .beginFill(0xde3249, 0)
      .drawRect(-250, -250, 500, 500)
      .endFill();

    imageContainer.addChild(bg);

    const imageSprite = new PIXI.Sprite(imageTexture);

    imageContainer.position.set(x, y);

    const radius = { x: 0 };
    const circle = new PIXI.Graphics()
      .beginFill(0xde3249, 1)
      .drawCircle(0, 0, radius.x)
      .endFill();
    const containValues = this.calculateSizeImage(
      this.cardSize.width,
      this.cardSize.height,
      imageTexture,
      false
    );

    imageSprite.scale.set(containValues.scale, containValues.scale);
    imageSprite.anchor.set(0.5);
    imageSprite.mask = circle;

    const waveFilter = new ShockwaveFilter([
      containValues.width / 2,
      containValues.height / 2,
    ]);

    imageSprite.filters = [waveFilter];

    imageContainer.addChild(imageSprite);
    imageContainer.addChild(circle);

    this.imagesWrapperContainer.addChild(imageContainer);

    const nextR =
      Math.sqrt(this.cardSize.width ** 2 + this.cardSize.height ** 2) / 2;

    waveFilter.uniforms.time = 0;
    waveFilter.uniforms.radius = nextR * 1.2;
    waveFilter.uniforms.amplitude = 20;
    waveFilter.wavelength = 0;

    const scaleX = (imageSprite.scale.x *= 1.2);
    const scaleY = (imageSprite.scale.y *= 1.2);

    this.tl = gsap
      .timeline()
      .to(radius, {
        x: nextR,
        duration: 0.7,
        onUpdate: () => {
          circle.clear();
          circle.beginFill(0xde3249, 1);
          circle.drawCircle(0, 0, radius.x);
          circle.endFill();
        },
      })
      .to(
        waveFilter,
        {
          duration: 0.8,
          time: 0.4,
          ease: 'power1.out',
          wavelength: 200,
        },
        0.01
      )
      .to(
        imageSprite.scale,
        {
          x: scaleX / 1.2,
          y: scaleY / 1.2,
          duration: 0.7,
          ease: 'power4.out',
        },
        0.1
      )
      .to(imageSprite, {
        alpha: 0,
        duration: 0.3,
      })
      .add(() => {
        this.imagesWrapperContainer.removeChild(imageContainer);
      });
    gsap.to(imageContainer.position, {
      x: this.mouse.x,
      y: this.mouse.y,
      duration: 2,
      ease: 'power3',
    });
  };

  setup = () => {
    this.root.width = window.innerWidth;
    this.root.height = window.innerHeight;
    this.imagesWrapperContainer = new PIXI.Container();
    this.root.addChild(this.imagesWrapperContainer);

    this.app.stage.interactive = true;

    this.canvasContainer.addEventListener('mousemove', this.pointerMove);
  };

  distance = (x1, x2, y1, y2) => {
    return ((x2 - x1) ** 2 + (y2 - y1) ** 2) ** 0.5;
  };

  pointerMove = event => {
    this.mouse.x = event.clientX;
    this.mouse.y = event.clientY;
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

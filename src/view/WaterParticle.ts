import { PlumberGame } from '../domain/PlumberGame';
import { Camera } from './Camera';
import { config } from './config.ts';
const GRID_SIZE = config.gridSize;

export class WaterParticle {
  game: PlumberGame;
  index = 0;
  sprites: { x: number; y: number; vx: number; vy: number; ax: number; ay: number; time: number; }[] = [];
  notConnectedDirections: {
    xIndex: number;
    yIndex: number;
    direction: "up" | "down" | "right" | "left";
  }[];
  constructor(game: PlumberGame, private camera:Camera, private p5:any) {
    this.game = game;
    this.notConnectedDirections = game.notConnectedDirections;
  }
  updateGame(game: PlumberGame) {
    this.game = game;
    this.notConnectedDirections = game.notConnectedDirections;
  }
  count = 0;
  draw() {
    this.count = (this.count + 1) % 5;
    const g = 0.00;
    const yokoRange = [-0.5, 0.5];
    const tateRange = [0.2, 1.0];
    if (this.count == 0) {
      this.notConnectedDirections.map(({ xIndex, yIndex, direction }) => {
        var p = { x: 0, y: 0, vx: 0, vy: 0, ax: 0, ay: 0, time: 0 };
        p.ay = g;
        this.p5.fill(50, 100, 255);
        var offsetX = 0;
        var offsetY = 0;
        if (direction == 'up') {
          offsetY = GRID_SIZE / 4;
          p.x = xIndex * GRID_SIZE + GRID_SIZE / 2;
          p.y = yIndex * GRID_SIZE + GRID_SIZE;
          p.vx = this.p5.random(yokoRange[0], yokoRange[1]);
          p.vy = -this.p5.random(tateRange[0], tateRange[1]);

        }
        if (direction == 'down') {
          offsetY = -GRID_SIZE / 4;
          p.x = xIndex * GRID_SIZE + GRID_SIZE / 2;
          p.y = yIndex * GRID_SIZE;
          p.vx = this.p5.random(yokoRange[0], yokoRange[1]);
          p.vy = this.p5.random(tateRange[0], tateRange[1]);
        }
        if (direction == 'right') {
          offsetX = GRID_SIZE / 4;
          p.x = xIndex * GRID_SIZE;
          p.y = yIndex * GRID_SIZE + GRID_SIZE / 2;
          p.vy = this.p5.random(yokoRange[0], yokoRange[1]);
          p.vx = this.p5.random(tateRange[0], tateRange[1]);
        }
        if (direction == 'left') {
          offsetX = -GRID_SIZE / 4;
          p.x = xIndex * GRID_SIZE + GRID_SIZE;
          p.y = yIndex * GRID_SIZE + GRID_SIZE / 2;
          p.vy = this.p5.random(yokoRange[0], yokoRange[1]);
          p.vx = -this.p5.random(tateRange[0], tateRange[1]);
        }
        this.sprites.push(p);
        // p5.square(xIndex * GRID_SIZE - mainCamera.x, yIndex * GRID_SIZE - mainCamera.y, GRID_SIZE, GRID_SIZE / 6)
      });
    }


    for (let i = this.sprites.length - 1; i >= 0; i--) {
      let p = this.sprites[i];
      p.vx += p.ax;
      p.vy += p.ay;
      p.x += p.vx;
      p.y += p.vy;
      p.time++;
      this.p5.fill(50, 100, 255, 255 / p.time * 3);
      this.camera.circle(p.x, p.y, p.time / 2)

      if (p.time > 50) {
        this.sprites.splice(i, 1);
      }
    }
  }
}

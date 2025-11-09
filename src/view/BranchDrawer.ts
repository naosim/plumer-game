import { Branch } from '../domain/domain';
import { Camera } from './Camera';
import { config } from './config.ts';
const GRID_SIZE = config.gridSize;

/**
 * ブランチ1マス分の描画
 */
export class BranchDrawer {
  constructor(private camera: Camera, private p5:any) { }
  isSelectedCardArea({ xIndex, yIndex }: { xIndex: number; yIndex: number; }, pointerPos: { x: number; y: number; }) {
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    return (
      pointerPos.x >= x - this.camera.x
      && pointerPos.y >= y - this.camera.y
      && pointerPos.x < x - this.camera.x + GRID_SIZE
      && pointerPos.y < y - this.camera.y + GRID_SIZE
    );
  }

  baseColor() {
    this.p5.fill(160, 160, 160);
  }
  highColor() {
    this.p5.fill(200, 200, 200);
  }
  darkColor() {
    this.p5.fill(120, 120, 120);
  }

  drawHilight({ xIndex, yIndex, branch }: { xIndex: number; yIndex: number; branch: Branch; }, checkCardFitResult: boolean) {
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    if (checkCardFitResult) {
      this.p5.fill(255, 255, 255);
    } else {
      this.p5.fill(255, 0, 0);
    }

    this.p5.square(x - this.camera.x - 2, y - this.camera.y - 2, GRID_SIZE + 4);
  }

  draw({ xIndex, yIndex, branch }: { xIndex: number; yIndex: number; branch: Branch; }) {
    const size = GRID_SIZE / 3;
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;

    this.p5.fill(0, 0, 0);
    this.p5.noStroke();
    this.camera.square(x, y, GRID_SIZE)

    if (branch.isStopWay()) {
      this.p5.fill(200, 100, 0);
      this.camera.square(x + size, y + size, size);
    } else {
      this.baseColor();
      var tl = 0;
      var tr = 0;
      var br = 0;
      var bl = 0;
      const corner = 4;
      if(!branch.up && !branch.left) {
        tl = corner;
      }
      if(!branch.up && !branch.right) {
        tr = corner;
      }
      if(!branch.down && !branch.right) {
        br = corner;
      }
      if(!branch.down && !branch.left) {
        bl = corner;
      }
      this.camera.square(x + size, y + size, size, tl, tr, br, bl);
    }
    
    if (branch.up) {
      this.baseColor();
      this.camera.square(x + size, y, size);
      this.highColor();
      this.camera.rect(x + size + 2, y, 3, size);
      this.darkColor();
      this.camera.rect(x + size - 2, y, size + 4, 2);
    }
    if (branch.right) {
      this.baseColor();
      this.camera.square(x + size * 2, y + size, size);
      this.highColor();
      this.camera.rect(x + size * 2, y + size + 2, size, 3);
      this.darkColor();
      this.camera.rect(x + GRID_SIZE - 2, y + size - 2, 2, size + 4);
    }
    if (branch.down) {
      this.baseColor();
      this.camera.square(x + size, y + size * 2, size);
      this.highColor();
      this.camera.rect(x + size + 2, y + size * 2, 3, size);
      this.darkColor();
      this.camera.rect(x + size - 2, y + GRID_SIZE - 2, size + 4, 2);
    }
    
    if (branch.left) {
      this.baseColor();
      this.camera.square(x, y + size, size);
      this.highColor();
      this.camera.rect(x, y + size + 2, size, 3);
      this.darkColor();
      this.camera.rect(x, y + size - 2, 2, size + 4);
    }

  }
}

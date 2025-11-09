export class Camera {
  constructor(public x: number, public y: number, private p5:any) { }
  startMousePos = { x: 0, y: 0 };
  moveStart(mouseX:number, mouseY:number) {
    this.startMousePos = { x: mouseX, y: mouseY };
    console.log(this.startMousePos);
  }
  moving(mouseX:number, mouseY:number) {
    this.x -= this.p5.mouseX - this.startMousePos.x;
    this.y -= this.p5.mouseY - this.startMousePos.y;
    this.startMousePos = { x: mouseX, y: mouseY };
  }
  mouseReleased() { }

  rect(x:number, y:number, w:number, h:number, tl?:number, tr?:number, br?:number, bl?:number) {
    this.p5.rect(x - this.x, y - this.y, w, h, tl, tr, br, bl)
  }

  square(x:number, y:number, size:number, tl?:number, tr?:number, br?:number, bl?:number) {
    this.p5.square(x - this.x, y - this.y, size, tl, tr, br, bl)
  }

  circle(x:number, y:number, r:number) {
    this.p5.circle(x - this.x, y - this.y, r);
  }
}

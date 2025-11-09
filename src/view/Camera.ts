const p5:any = window;
export class Camera {
  constructor(public x: number, public y: number) { }
  startMousePos = { x: 0, y: 0 };
  mousePressed() {
    this.startMousePos = { x: p5.mouseX, y: p5.mouseY };
    console.log(this.startMousePos);
  }
  mouseDragged() {
    this.x -= p5.mouseX - this.startMousePos.x;
    this.y -= p5.mouseY - this.startMousePos.y;
    this.startMousePos = { x: p5.mouseX, y: p5.mouseY };
  }
  mouseReleased() { }

  rect(x:number, y:number, w:number, h:number, tl?:number, tr?:number, br?:number, bl?:number) {
    p5.rect(x - this.x, y - this.y, w, h, tl, tr, br, bl)
  }

  square(x:number, y:number, size:number, tl?:number, tr?:number, br?:number, bl?:number) {
    p5.square(x - this.x, y - this.y, size, tl, tr, br, bl)
  }

  circle(x:number, y:number, r:number) {
    p5.circle(x, y, r);
  }

  static none() {
    return new Camera(0, 0);
  }
}

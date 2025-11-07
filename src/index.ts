import {Branch, Card, HandCards, branches, cards, centerCards } from './domain/domain.ts';
import { Field } from "./domain/Field.ts";
import { SelectedCard } from "./domain/SelectedCard.ts";
import { PlumberGame } from "./domain/PlumberGame.ts";


declare global {
  interface Window {
    fill:any;
    noStroke: any;
    square: any;
    createButton: any;
    createCanvas: any;
    randomSeed: any;
    setup: any;
    draw: any;
    background: any;
    mouseX:number;
    mouseY:number;
    mousePressed:any;
    mouseDragged:any;
    mouseReleased:any;
    width: number;
    height: number;
    textSize:any;
    text:any;
    rect:any;
    keyReleased:any;
    key:string;
    keyCode:number;
    random:any;
  }
}



const GRID_SIZE = 36;


// application layer

class FieldDrawer {
  constructor(
    private branchDrawer:BranchDrawer,
    private camera:Camera
  ) {
    this.branchDrawer = branchDrawer;
  }
  draw(field:Field) {
    field.branchAndPosList.forEach(({branch, xIndex, yIndex}) => {
      this.branchDrawer.draw({xIndex, yIndex, branch});
    });
  }
}

class BranchDrawer {
  constructor(private camera:Camera) {}
  isSelectedCardArea({xIndex, yIndex}:{xIndex:number, yIndex:number}, pointerPos: {x:number, y:number}) {
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    return (
       pointerPos.x >= x - this.camera.x 
    && pointerPos.y >= y - this.camera.y
    && pointerPos.x < x - this.camera.x + GRID_SIZE 
    && pointerPos.y < y - this.camera.y + GRID_SIZE
  );
  }

  drawHilight({xIndex, yIndex, branch}:{xIndex:number, yIndex:number, branch:Branch}, checkCardFitResult:boolean) {
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    if(checkCardFitResult) {
      window.fill(255, 255, 255);
    } else {
      window.fill(255, 0, 0);
    }
    
    window.square(x - this.camera.x - 2, y - this.camera.y - 2, GRID_SIZE + 4);
  }

  draw({xIndex, yIndex, branch}:{xIndex:number, yIndex:number, branch:Branch}) {
    const size = GRID_SIZE / 3;
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;

    window.fill(0, 0, 0);
    window.noStroke();
    window.square(x - this.camera.x, y - this.camera.y, GRID_SIZE);

    if(branch.hasWay()) {
      if(branch.isStopWay()) {
        window.fill(200, 100, 0)
      } else {
        window.fill(1, 168, 100)
      }
      window.square(x + size - this.camera.x, y + size - this.camera.y, size);
    }
    window.fill(1, 168, 100)
    if(branch.up) {
      window.square(x + size - this.camera.x, y - this.camera.y, size);
    }
    if(branch.right) {
     window.square(x + size * 2 - this.camera.x, y + size - this.camera.y, size);
    }
    if(branch.down) {
      window.square(x + size - this.camera.x, y + size * 2 - this.camera.y, size);
    }
    if(branch.left) {
      window.square(x - this.camera.x, y + size - this.camera.y, size);
    }
    
  }
}

class SelectedCardDrawer {
  constructor(
    private branchDrawer:BranchDrawer, 
    private camera: Camera
  ) {}

  isSelectedCardArea(selectedCard:SelectedCard, pointerPos: {x:number, y:number}) {
    const branchAndPoses = selectedCard.getBranchAndPosList()
    return branchAndPoses.some(({xIndex, yIndex, branch}) => this.branchDrawer.isSelectedCardArea({xIndex, yIndex}, pointerPos))
  }

  draw(selectedCard:SelectedCard, checkCardFitResult:boolean) {
    const branchAndPoses = selectedCard.getBranchAndPosList();
    branchAndPoses.forEach(({xIndex, yIndex, branch}) => {
      this.branchDrawer.drawHilight({xIndex, yIndex, branch}, checkCardFitResult);
    })
    branchAndPoses.forEach(({xIndex, yIndex, branch}) => {
      this.branchDrawer.draw({xIndex, yIndex, branch});
    })
  }
}

class HandCardsDrawer {
  branchDrawer:BranchDrawer;
  camera:Camera;
  constructor() {
    var cameraX = - HandCardsDrawer.leftMergin(3);
    var cameraY = - (window.height - GRID_SIZE)
    console.log(GRID_SIZE, cameraX);
    this.camera = new Camera(cameraX, cameraY);
    this.branchDrawer = new BranchDrawer(this.camera);
  }
  static leftMergin(cardCount:number) {
    return (window.width - (GRID_SIZE * (2 * cardCount + (cardCount - 1)))) / 2
  }
  draw(handCards:HandCards) {
    window.fill(0,0,0, 128)
    window.rect(0, window.height - GRID_SIZE * 1.2,window.width, GRID_SIZE * 1.2)

    handCards.cards.forEach((card:Card, cardIndex) => {
      card.branches.forEach((branch, i) => {
        this.branchDrawer.draw({xIndex:i + cardIndex * 3, yIndex:0, branch});
      })
    })

  }
}

class WaterParticle {
  game:PlumberGame;
  index = 0;
  sprites:{x:number,y:number,vx:number, vy:number, ax:number, ay:number, time:number}[] = [];
  notConnectedDirections:{
    xIndex: number;
    yIndex: number;
    direction: "up" | "down" | "right" | "left";
  }[]
  constructor(game:PlumberGame) {
    this.game = game;
    this.notConnectedDirections = game.notConnectedDirections
  }
  updateGame(game:PlumberGame) {
    this.game = game;
    this.notConnectedDirections = game.notConnectedDirections
  }
  count = 0;
  draw() {
    this.count = (this.count + 1) % 5;
    const g = 0.00;
    const yokoRange = [-0.5, 0.5]
    const tateRange = [0.2, 1.0]
    if(this.count == 0) {
      this.notConnectedDirections.map(({xIndex, yIndex, direction}) => {
        var p = {x:0, y:0, vx:0, vy:0, ax:0, ay:0, time:0}
        p.ay = g;
        window.fill(50, 100, 255);
        var offsetX = 0;
        var offsetY = 0;
        if(direction == 'up') {
          offsetY = GRID_SIZE / 4
          p.x = xIndex * GRID_SIZE + GRID_SIZE / 2;
          p.y = yIndex * GRID_SIZE + GRID_SIZE;
          p.vx = window.random(yokoRange[0], yokoRange[1])
          p.vy = -window.random(tateRange[0], tateRange[1]);
          
        }
        if(direction == 'down') {
          offsetY = - GRID_SIZE / 4
          p.x = xIndex * GRID_SIZE + GRID_SIZE / 2;
          p.y = yIndex * GRID_SIZE;
          p.vx = window.random(yokoRange[0], yokoRange[1])
          p.vy = window.random(tateRange[0], tateRange[1]);
        }
        if(direction == 'right') {
          offsetX = GRID_SIZE / 4
          p.x = xIndex * GRID_SIZE;
          p.y = yIndex * GRID_SIZE + GRID_SIZE / 2;
          p.vy = window.random(yokoRange[0], yokoRange[1])
          p.vx = window.random(tateRange[0], tateRange[1]);
        }
        if(direction == 'left') {
          offsetX = - GRID_SIZE / 4
          p.x = xIndex * GRID_SIZE + GRID_SIZE;
          p.y = yIndex * GRID_SIZE + GRID_SIZE / 2;
          p.vy = window.random(yokoRange[0], yokoRange[1])
          p.vx = -window.random(tateRange[0], tateRange[1]);
        }
        this.sprites.push(p)
        // window.square(xIndex * GRID_SIZE - mainCamera.x, yIndex * GRID_SIZE - mainCamera.y, GRID_SIZE, GRID_SIZE / 6)
      })
    }
    
    
    for(let i = this.sprites.length - 1; i >= 0; i--) {
      let p = this.sprites[i];
      p.vx += p.ax;
      p.vy += p.ay;
      p.x += p.vx;
      p.y += p.vy;
      p.time++;
      window.fill(50, 100, 255, 255/p.time * 3);
      window.circle(p.x - mainCamera.x, p.y - mainCamera.y, p.time/2)

      if(p.time > 50) {
        this.sprites.splice(i, 1)
      }
    }
  }
}


type ButtonCallback = {
  onSelected:(index:number) => void;
  onPressedArrow:(direction:'up'|'down'|'right'|'left') => void;
  onPressedRotate: () => void;
  onPut: () => void;
  onDraw: () => void;
  onResetHandCards: () => void;
  onUndo: () => void;
}

class ControlButtons {
  cb: ButtonCallback
  constructor(cb: ButtonCallback) {
    this.cb = cb;
  }
  init() {
    const buttonDefs:[string, ()=>void][] = [
      ['選択', () => {this.cb.onSelected(0)}],
      ['選択', () => {this.cb.onSelected(1)}],
      ['選択', () => {this.cb.onSelected(2)}],
      // ['◀', () => {this.cb.onPressedArrow('left')}],
      // ['▲', () => {this.cb.onPressedArrow('up')}],
      // ['▼', () => {this.cb.onPressedArrow('down')}],
      // ['▶', () => {this.cb.onPressedArrow('right')}],
      ['回転', () => {this.cb.onPressedRotate()}],
      ['置く', () => {this.cb.onPut()}],
      ['手札リセット', () => {this.cb.onResetHandCards()}],
      ['やり直し', () => {this.cb.onUndo()}],
      // ['ひく', () => {this.cb.onDraw()}],
    ];
    buttonDefs.forEach(([label, cb], i) => {
      const button = window.createButton(label);
      button.mouseReleased(cb);
      button.style('width', '72px');
      button.style('height', '36px');
      const leftMergin = HandCardsDrawer.leftMergin(3);
      if(i == 0) {
        button.position(leftMergin, window.height)
      }
      if(i == 1) {
        button.position(GRID_SIZE * 3 + leftMergin, window.height)
      }
      if(i == 2) {
        button.position(GRID_SIZE * 6 + leftMergin, window.height)
      }
      if(i > 2 && i <= 5) {
        button.position((i - 3) * 3 * GRID_SIZE + leftMergin, window.height + 48)
      }
      if(i > 5) {
        button.position((i - 6) * 3 * GRID_SIZE + leftMergin, window.height + 48 * 2)
      }
    })
    return this;
  }
}

class Camera {
  constructor(public x:number, public y:number) {}
  startMousePos = {x:0, y:0}
  mousePressed() {
    this.startMousePos = {x:window.mouseX, y:window.mouseY}
    console.log(this.startMousePos);
  }
  mouseDragged() {
    this.x -= window.mouseX - this.startMousePos.x;
    this.y -= window.mouseY - this.startMousePos.y;
    this.startMousePos = {x:window.mouseX, y:window.mouseY}
  }
  mouseReleased() {}

  static none() {
    return new Camera(0, 0);
  }
}

var _game:PlumberGame;
var statusText = "";
var context = {
  get game() { return _game},
  set game(g:PlumberGame) {
    _game = g;
    statusText = `残りカード：${_game.restCardCount}枚, 穴の数：${_game.wayCount}個`
    if(!waterParticle) {
      waterParticle = new WaterParticle(g);
    } else {
      waterParticle.updateGame(g);
    }
  }
}

var mainCamera:Camera;
var branchDrawer:BranchDrawer;
var fieldDrawer:FieldDrawer;
var selectedCardDrawer:SelectedCardDrawer;
// var cardSprite:CardSprite;
var handCardsDrawer:HandCardsDrawer;
var commandLogs:PlumberGame[] = [];
var buttonCallback:ButtonCallback;
var waterParticle:WaterParticle;
window.setup = function() {
  context.game = PlumberGame.initGame();
  commandLogs.push(context.game);
  console.log(context.game);
  console.log(context.game.deck.cards.length);

  window.createCanvas(400, 400);
  // window.randomSeed(99);
  mainCamera = new Camera(-200 + GRID_SIZE, -200 + GRID_SIZE);
  branchDrawer = new BranchDrawer(mainCamera);
  fieldDrawer = new FieldDrawer(branchDrawer, mainCamera);
  selectedCardDrawer = new SelectedCardDrawer(branchDrawer, mainCamera)
  handCardsDrawer = new HandCardsDrawer();
  buttonCallback = {
    onSelected: (index:number) => {
      console.log('selected', index);
      var xIndex = Math.floor((mainCamera.x + window.width / 2) / GRID_SIZE);
      var yIndex = Math.floor((mainCamera.y + window.height - GRID_SIZE * 3) / GRID_SIZE);
      context.game = context.game.selectCard({index, initPosIndex:{xIndex, yIndex}});
    },
    onPressedArrow: (direction) => {
      context.game = context.game.moveSelectedCard(direction);
    },
    onPressedRotate: () => {
      context.game = context.game.rotateSelectedCard();
    },
    onPut: () => {
      context.game = context.game.putCard().drawCardFromDeck();
      commandLogs.push(context.game);
    },
    onDraw: () => {
      context.game = context.game.drawCardFromDeck();
    },
    onResetHandCards: () => {
      context.game = context.game.resetHandCards();
    },
    onUndo: () => {
      if(commandLogs.length <= 1) {
        return;
      }
      commandLogs.pop();
      context.game = commandLogs.at(-1)!;
    }
  };
  new ControlButtons(buttonCallback).init();
}
window.draw = function() {
  window.background(220);

  const game = context.game;

  // 漏れる水
  waterParticle.draw();


  fieldDrawer.draw(game.field);

  // 選択中のカード
  if(game.selectedCard) {
    selectedCardDrawer.draw(game.selectedCard, game.checkCardFit());
  }

  // 手札
  handCardsDrawer.draw(game.handCards)
  
  // ゲームクリア
  if(game.isCompleted) {
    window.fill(0,0,0);
    window.textSize(30);
    window.text("ゲームクリア！", 100, 100)
  }

  // ステータス
  window.fill(0, 0, 0);
  window.textSize(16);
  window.text(statusText, 0, 16);
  
}

var cardDragMode = false;
var startMousePos = {x:0, y:0}
var movePos = {x:0, y:0}
var startPosIndex = {xIndex:0, yIndex:0}
window.mousePressed = function(){
  const game = context.game;
  var pointerPos = {x:window.mouseX, y:window.mouseY};
  cardDragMode = !!game.selectedCard && selectedCardDrawer.isSelectedCardArea(game.selectedCard, pointerPos)
  startMousePos = {x:window.mouseX, y:window.mouseY}
  if(cardDragMode) {
    startMousePos = {x:window.mouseX, y:window.mouseY}
    startPosIndex = {
      xIndex:game.selectedCard!.posIndex.xIndex,
      yIndex:game.selectedCard!.posIndex.yIndex
    }
    movePos = {x:0, y:0};
    
  } else {
    mainCamera.mousePressed();
  }
  
}
window.mouseDragged = function(){
  if(cardDragMode) {
    movePos.x += window.mouseX - startMousePos.x;
    movePos.y += window.mouseY - startMousePos.y;
    const posIndex = {
      xIndex: startPosIndex.xIndex + Math.floor(movePos.x / GRID_SIZE),
      yIndex: startPosIndex.yIndex + Math.floor(movePos.y / GRID_SIZE),
    }
    context.game = context.game.moveSelectedCardWithPosIndex(posIndex);
    startMousePos = {x:window.mouseX, y:window.mouseY}
  } else {
    mainCamera.mouseDragged();
  }
  
}
window.mouseReleased = function(){
  if(cardDragMode) {
    cardDragMode = false;
  } else {
    mainCamera.mouseReleased();
  }
  
}

window.keyReleased = function() {
  const key = window.key;
  const keyCode = window.keyCode;
  console.log(key, keyCode)
  if(context.game.selectedCard) {
    if(key == 'ArrowUp') {
      buttonCallback.onPressedArrow('up');
    } else if(key == 'ArrowDown') {
      buttonCallback.onPressedArrow('down');
    }
    if(key == 'ArrowRight') {
      buttonCallback.onPressedArrow('right');
    } else if(key == 'ArrowLeft') {
      buttonCallback.onPressedArrow('left');
    }
    if(key == ' ') {
      buttonCallback.onPressedRotate();
    } else if(key == 'Enter') {
      buttonCallback.onPut();
    }
  }
  if(key == '1') {
    buttonCallback.onSelected(0)
  } else if(key == '2') {
    buttonCallback.onSelected(1)
  } else if(key == '3') {
    buttonCallback.onSelected(2)
  }
  
}
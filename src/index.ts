import {Card, HandCards, branches, cards, centerCards } from './domain/domain.ts';
import { Field } from "./domain/Field.ts";
import { SelectedCard } from "./domain/SelectedCard.ts";
import { PlumberGame } from "./domain/PlumberGame.ts";
import { Camera } from './view/Camera.ts';
import { BranchDrawer } from './view/BranchDrawer.ts';
import { config } from './view/config.ts'
import { WaterParticle } from './view/WaterParticle.ts';
const GRID_SIZE = config.gridSize;
const p5:any = window;


// application layer

class FieldDrawer {
  constructor(
    private branchDrawer:BranchDrawer
  ) {
    this.branchDrawer = branchDrawer;
  }
  draw(field:Field) {
    field.branchAndPosList.forEach(({branch, xIndex, yIndex}) => {
      this.branchDrawer.draw({xIndex, yIndex, branch});
    });
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
    var cameraY = - (p5.height - GRID_SIZE)
    console.log(GRID_SIZE, cameraX);
    this.camera = new Camera(cameraX, cameraY, p5);
    this.branchDrawer = new BranchDrawer(this.camera, p5);
  }
  static leftMergin(cardCount:number) {
    return (p5.width - (GRID_SIZE * (2 * cardCount + (cardCount - 1)))) / 2
  }
  draw(handCards:HandCards) {
    p5.fill(0,0,0, 128)
    p5.rect(0, p5.height - GRID_SIZE * 1.2,p5.width, GRID_SIZE * 1.2)

    handCards.cards.forEach((card:Card, cardIndex) => {
      card.branches.forEach((branch, i) => {
        this.branchDrawer.draw({xIndex:i + cardIndex * 3, yIndex:0, branch});
      })
    })

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
      const button = p5.createButton(label);
      button.mouseReleased(cb);
      button.style('width', '72px');
      button.style('height', '36px');
      const leftMergin = HandCardsDrawer.leftMergin(3);
      if(i == 0) {
        button.position(leftMergin, p5.height)
      }
      if(i == 1) {
        button.position(GRID_SIZE * 3 + leftMergin, p5.height)
      }
      if(i == 2) {
        button.position(GRID_SIZE * 6 + leftMergin, p5.height)
      }
      if(i > 2 && i <= 5) {
        button.position((i - 3) * 3 * GRID_SIZE + leftMergin, p5.height + 48)
      }
      if(i > 5) {
        button.position(6 * GRID_SIZE + leftMergin, p5.height + 48 * 2)
      }
    })
    return this;
  }
}

var _game:PlumberGame;
var statusText = "";
var context = {
  get game() { return _game},
  set game(g:PlumberGame) {
    _game = g;
    statusText = `残りカード：${_game.restCardCount}枚, 穴の数：${_game.wayCount}個`
    if(waterParticle) {// 初回だけwaterParticleがnullのため
      waterParticle.updateGame(g);
    }
  }
}

export var mainCamera:Camera;
var branchDrawer:BranchDrawer;
var fieldDrawer:FieldDrawer;
var selectedCardDrawer:SelectedCardDrawer;
// var cardSprite:CardSprite;
var handCardsDrawer:HandCardsDrawer;
var commandLogs:PlumberGame[] = [];
var buttonCallback:ButtonCallback;
var waterParticle:WaterParticle;
p5.setup = function() {
  context.game = PlumberGame.initGame();
  commandLogs.push(context.game);
  console.log(context.game);
  console.log(context.game.deck.cards.length);

  p5.createCanvas(400, 400);
  // p5.randomSeed(99);
  mainCamera = new Camera(-200 + GRID_SIZE, -200 + GRID_SIZE, p5);
  waterParticle = new WaterParticle(context.game, mainCamera, p5);
  branchDrawer = new BranchDrawer(mainCamera, p5);
  fieldDrawer = new FieldDrawer(branchDrawer);
  selectedCardDrawer = new SelectedCardDrawer(branchDrawer, mainCamera)
  handCardsDrawer = new HandCardsDrawer();
  buttonCallback = {
    onSelected: (index:number) => {
      console.log('selected', index);
      var xIndex = Math.floor((mainCamera.x + p5.width / 2) / GRID_SIZE);
      var yIndex = Math.floor((mainCamera.y + p5.height - GRID_SIZE * 3) / GRID_SIZE);
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
p5.draw = function() {
  p5.background(220);

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
    p5.fill(0,0,0);
    p5.textSize(30);
    p5.text("ゲームクリア！", 100, 100)
  }

  // ステータス
  p5.fill(0, 0, 0);
  p5.textSize(16);
  p5.text(statusText, 0, 16);
  
}

var cardDragMode = false;
var startMousePos = {x:0, y:0}
var movePos = {x:0, y:0}
var startPosIndex = {xIndex:0, yIndex:0}
p5.mousePressed = function(){
  const game = context.game;
  var pointerPos = {x:p5.mouseX, y:p5.mouseY};
  cardDragMode = !!game.selectedCard && selectedCardDrawer.isSelectedCardArea(game.selectedCard, pointerPos)
  startMousePos = {x:p5.mouseX, y:p5.mouseY}
  if(cardDragMode) {
    startMousePos = {x:p5.mouseX, y:p5.mouseY}
    startPosIndex = {
      xIndex:game.selectedCard!.posIndex.xIndex,
      yIndex:game.selectedCard!.posIndex.yIndex
    }
    movePos = {x:0, y:0};
    
  } else {
    mainCamera.moveStart(p5.mouseX, p5.mouseY);
  }
  
}
p5.mouseDragged = function(){
  if(cardDragMode) {
    movePos.x += p5.mouseX - startMousePos.x;
    movePos.y += p5.mouseY - startMousePos.y;
    const posIndex = {
      xIndex: startPosIndex.xIndex + Math.floor(movePos.x / GRID_SIZE),
      yIndex: startPosIndex.yIndex + Math.floor(movePos.y / GRID_SIZE),
    }
    context.game = context.game.moveSelectedCardWithPosIndex(posIndex);
    startMousePos = {x:p5.mouseX, y:p5.mouseY}
  } else {
    mainCamera.moving(p5.mouseX, p5.mouseY);
  }
  
}
p5.mouseReleased = function(){
  if(cardDragMode) {
    cardDragMode = false;
  } else {
    mainCamera.mouseReleased();
  }
  
}

p5.keyReleased = function() {
  const key = p5.key;
  const keyCode = p5.keyCode;
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
import { Card, PosIndex, Branch, BranchAndPos } from "./domain";


export class SelectedCard {
  card: Card;
  posIndex: PosIndex;
  direction: '0' | '90' | '180' | '270'; // 0は横向き
  branches: Branch[];// lengthは必ず2
  constructor(card: Card, posIndex: PosIndex, branches: Branch[], direction:'0' | '90' | '180' | '270') {
    this.card = card;
    this.posIndex = posIndex;
    this.branches = branches;
    this.direction = direction;
  }

  move(moveDirection:'up'|'down'|'right'|'left') {
    var posIndex = {...this.posIndex};
    if(moveDirection == 'up') {
      posIndex.yIndex--;
    }
    if(moveDirection == 'down') {
      posIndex.yIndex++;
    }
    if(moveDirection == 'right') {
      posIndex.xIndex++;
    }
    if(moveDirection == 'left') {
      posIndex.xIndex--;
    }
    return this.moveWithPosIndex(posIndex)
  }

  moveWithPosIndex(posIndex:{xIndex:number, yIndex:number}) {
    return new SelectedCard(this.card, posIndex, this.branches, this.direction);
  }

  getNextDirection() {
    return {
      '0':'90',
      '90':'180',
      '180':'270',
      '270':'0',
    }[this.direction] as '0' | '90' | '180' | '270';
  }

  getBranchAndPosList() {
    const result: BranchAndPos[] = [];
    result.push({branch:this.branches[0], xIndex:this.posIndex.xIndex, yIndex:this.posIndex.yIndex});
    var xIndex = this.posIndex.xIndex;
    var yIndex = this.posIndex.yIndex;
    if(this.direction == '0') {
      xIndex++;
    } else if(this.direction == '90') {
      yIndex++;
    } else if(this.direction == '180') {
      xIndex--;
    } else if(this.direction == '270') {
      yIndex--;
    }
    result.push({branch:this.branches[1], xIndex, yIndex});
    return result;
  }

  rotate90() {
    const branches = this.branches.map(v => v.rotate90())
    return new SelectedCard(this.card, this.posIndex, branches, this.getNextDirection());
  }

  static create(card: Card, posIndex: PosIndex) {
    return new SelectedCard(card, posIndex, [...card.branches], '0');
  }
}

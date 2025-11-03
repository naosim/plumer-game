import { BranchAndPos, PosIndex, Card } from "./domain";
import { SelectedCard } from "./SelectedCard";


export class Field {
  branchAndPosList: BranchAndPos[];
  map:{[key:number]: {[key:number]:BranchAndPos}} = {}
  constructor(branchAndPosList: BranchAndPos[] = []) {
    this.branchAndPosList = branchAndPosList;
    this.branchAndPosList.forEach(v => {
      if(!this.map[v.xIndex]) {
        this.map[v.xIndex] = {};
      }
      this.map[v.xIndex][v.yIndex] = v;
    })
  }

  at({xIndex, yIndex}:PosIndex) {
    var obj = this.map[xIndex];
    if(!obj) {
      return;
    }
    return obj[yIndex];
  }

  getNotConnectedDirections() {
    const result:{xIndex:number, yIndex:number, direction:'up' | 'down' | 'right' | 'left'}[] = [];
    this.branchAndPosList.forEach(({xIndex, yIndex, branch}) => {
      if(branch.up && !this.at({xIndex, yIndex:yIndex - 1})) {
        result.push({xIndex, yIndex:yIndex - 1, direction:'up'})
      }
      if(branch.down && !this.at({xIndex, yIndex:yIndex + 1})) {
        result.push({xIndex, yIndex:yIndex + 1, direction:'down'})
      }
      if(branch.right && !this.at({xIndex:xIndex + 1, yIndex:yIndex})) {
        result.push({xIndex:xIndex + 1, yIndex, direction:'right'})
      }
      if(branch.left && !this.at({xIndex:xIndex - 1, yIndex:yIndex})) {
        result.push({xIndex:xIndex - 1, yIndex, direction:'left'})
      }
    })
    return result;
  }

  getFourDirectionBranches({xIndex, yIndex}:PosIndex) {
    return [
      {xIndex, yIndex:yIndex - 1},
      {xIndex, yIndex:yIndex + 1},
      {xIndex:xIndex + 1, yIndex},
      {xIndex:xIndex - 1, yIndex},
    ].map(posIndex => this.at(posIndex)).filter(v => v);
  }



  /**
   * 
   * @param card 
   * @returns おけるときはtrue、おけない時はfalse
   */
  checkCardFit(card: SelectedCard) {
    // すでにあるなら置けない
    const alreadyExists = card.getBranchAndPosList().some(({ xIndex, yIndex }) => this.at({xIndex, yIndex}))
    if(alreadyExists) {
      return false;
    }

    // 離れ小島には置けない
    var hasNext = card.getBranchAndPosList().some(({ xIndex, yIndex }) => {
      const up = this.at({xIndex, yIndex:yIndex - 1})
      if(up) {
        return true;
      }
      const down = this.at({xIndex, yIndex:yIndex + 1})
      if(down) {
        return true;
      }
      const right = this.at({xIndex:xIndex + 1, yIndex})
      if(right) {
        return true;
      }
      const left = this.at({xIndex:xIndex - 1, yIndex})
      if(left) {
        return true;
      }
      return false;
    })
    if(!hasNext) {
      return false;
    }

    var hasNotConnectedWay = card.getBranchAndPosList().some(({ xIndex, yIndex, branch }) => {
      // ダメなときにtrueを返す
      { 
        const b = this.at({xIndex, yIndex:yIndex - 1})
        if(b && branch.up != b!.branch.down) {
          return true;
        }
      }

      {
        const b = this.at({xIndex, yIndex:yIndex + 1})
        if(b && branch.down != b!.branch.up) {
          return true;
        }
      }

      {
        const b = this.at({xIndex:xIndex + 1, yIndex})
        if(b && branch.right != b!.branch.left) {
          return true;
        }
      }

      {
        const b = this.at({xIndex:xIndex - 1, yIndex})
        if(b && branch.left != b!.branch.right) {
          return true;
        }
      }
      return false;
    })

    if(hasNotConnectedWay) {
      return false;
    }

    var hasConnectedWay = card.getBranchAndPosList().some(({ xIndex, yIndex, branch }) => {
      // ダメなときにtrueを返す
      { 
        const b = this.at({xIndex, yIndex:yIndex - 1})
        if(b && branch.up && branch.up == b!.branch.down) {
          return true;
        }
      }

      {
        const b = this.at({xIndex, yIndex:yIndex + 1})
        if(b && branch.down && branch.down == b!.branch.up) {
          return true;
        }
      }

      {
        const b = this.at({xIndex:xIndex + 1, yIndex})
        if(b && branch.right && branch.right == b!.branch.left) {
          return true;
        }
      }

      {
        const b = this.at({xIndex:xIndex - 1, yIndex})
        if(b && branch.left && branch.left == b!.branch.right) {
          return true;
        }
      }
      return false;
    })
    return hasConnectedWay
  
  }
  putCard(card: SelectedCard) {
    // 同じ位置が埋まってないか確認
    if (!this.checkCardFit(card)) {
      throw new Error("位置が重複しています");
    }
    return new Field([...this.branchAndPosList, ...card.getBranchAndPosList()]);
  }
  putCenterCard(card: Card) {
    return new Field([
      { branch: card.branches[0], xIndex: 0, yIndex: 0 },
      { branch: card.branches[1], xIndex: 1, yIndex: 0 }
    ]);
  }
}

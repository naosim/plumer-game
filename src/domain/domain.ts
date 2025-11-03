
export type PosIndex = {
  xIndex: number;
  yIndex: number;
}

export type BranchAndPos = {
  branch: Branch;
  xIndex: number;
  yIndex: number;
}

export class Branch {
  up:boolean;
  down:boolean;
  right:boolean;
  left:boolean;
  constructor(up:boolean, right:boolean, down:boolean, left:boolean) {
    this.up = up;
    this.down = down;
    this.right = right;
    this.left = left;
  }
  hasWay() {
    return this.up || this.down || this.right || this.left;
  }
  isStopWay() {
    return [this.up, this.down, this.right, this.left].filter(v => v).length == 1;
  }
  rotate90() {
    return new Branch(this.left, this.up, this.right, this.down);
  }
  rotate360by90() {
    var r0 = this;
    var r90 = r0.rotate90();
    var r180 = r90.rotate90();
    var r270 = r180.rotate90();
    return [r0, r90, r180, r270];
  }
}

export class Card {
  id:string;
  branches;
  constructor(id:string, branches:Branch[]) {
    this.id = id;
    this.branches = branches;
  }
  static create(id:string, branchA:Branch, branchB:Branch) {
    return new Card(id, [branchA, branchB]);
  }

  times(n:2|3) {
    if(n == 2) {
      return [1,2].map(v => new Card(`${this.id}-${v}`, this.branches))
    } else if(n == 3) {
      return [1,2,3].map(v => new Card(`${this.id}-${v}`, this.branches))
    } else {
      throw new Error("Not supported");
    }
  }
}

export const branches = [
  ...new Branch(false, false, false, false).rotate360by90(),
  ...new Branch(true, false, false, false).rotate360by90(),
  ...new Branch(true, true, false, false).rotate360by90(),
  ...new Branch(true, false, true, false).rotate360by90(),
  ...new Branch(true, true, true, false).rotate360by90(),
  ...new Branch(true, true, true, true).rotate360by90(),
]

export class Deck {
  cards:Card[];
  constructor(cards:Card[]) {
    this.cards = cards;
  }

  shuffle() {
    const newCards = [...this.cards];
    for (let i = newCards.length - 1; i > 0; i--) {
      // const j = Math.floor(Math.random() * (i + 1));
      // @ts-ignore
      const j = Math.floor(window.random(0, i)); // p5.jsのrandomを使う場合
      [newCards[i], newCards[j]] = [newCards[j], newCards[i]];
    }
    return new Deck(newCards);
  }
  pickup() {
    const [first, ...rest] = this.cards;
    return {card: first, deck: new Deck(rest)};
  }

  returnCards(cards:Card[]) {
    return new Deck([...this.cards, ...cards])
  } 
}

export class HandCards {
  cards:Card[] = [];
  constructor(cards:Card[] = []) {
    this.cards = cards;
  }
  addCard(card:Card) {
    return new HandCards([...this.cards, card]);
  }
  removeCard(card:Card) {
    return new HandCards(this.cards.filter(c => c != card));
  }
}

export const cards = [
  [branches[15], branches[7]],
  [branches[8], branches[7]],
  [branches[9], branches[7]],

  [branches[15], branches[11]],
  [branches[8], branches[15]],
  [branches[15], branches[15]],
  [branches[8], branches[11]],
  [branches[19], branches[7]],
  [branches[5], branches[19]],
  [branches[8], branches[10]],
  [branches[9], branches[11]],// s
  [branches[16], branches[7]],

  [branches[8], branches[17]],
  [branches[17], branches[11]],
  [branches[19], branches[11]],
  [branches[8], branches[19]],// f
  [branches[20], branches[7]], 
  [branches[8], branches[18]],// 4
  [branches[16], branches[11]],
  [branches[13], branches[19]],
  [branches[19], branches[13]],
  [branches[16], branches[13]],

  [branches[20], branches[10]],
  [branches[20], branches[11]],
  [branches[20], branches[13]],
  [branches[16], branches[19]],
  [branches[19], branches[18]],
  [branches[19], branches[19]],
  [branches[19], branches[17]],
  [branches[17], branches[19]],
  [branches[16], branches[18]],
]
.map((v, i) => Card.create(`card-${i+1}`, v[0], v[1]))
.reduce((memo:Card[], card:Card) => {
  const times = card.branches.some(b => b.isStopWay()) ? 3 : 2;
  return [...memo, ...card.times(times)];
}, [])

export const centerCards = [
  Card.create('center-1', branches[20], branches[18]),
  Card.create('center-2', branches[20], branches[20])
]

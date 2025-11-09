// src/domain/domain.ts
var Branch = class _Branch {
  up;
  down;
  right;
  left;
  constructor(up, right, down, left) {
    this.up = up;
    this.down = down;
    this.right = right;
    this.left = left;
  }
  hasWay() {
    return this.up || this.down || this.right || this.left;
  }
  isStopWay() {
    return [
      this.up,
      this.down,
      this.right,
      this.left
    ].filter((v) => v).length == 1;
  }
  rotate90() {
    return new _Branch(this.left, this.up, this.right, this.down);
  }
  rotate360by90() {
    var r0 = this;
    var r90 = r0.rotate90();
    var r180 = r90.rotate90();
    var r270 = r180.rotate90();
    return [
      r0,
      r90,
      r180,
      r270
    ];
  }
};
var Card = class _Card {
  id;
  branches;
  constructor(id, branches2) {
    this.id = id;
    this.branches = branches2;
  }
  static create(id, branchA, branchB) {
    return new _Card(id, [
      branchA,
      branchB
    ]);
  }
  times(n) {
    if (n == 2) {
      return [
        1,
        2
      ].map((v) => new _Card(`${this.id}-${v}`, this.branches));
    } else if (n == 3) {
      return [
        1,
        2,
        3
      ].map((v) => new _Card(`${this.id}-${v}`, this.branches));
    } else {
      throw new Error("Not supported");
    }
  }
};
var branches = [
  ...new Branch(false, false, false, false).rotate360by90(),
  ...new Branch(true, false, false, false).rotate360by90(),
  ...new Branch(true, true, false, false).rotate360by90(),
  ...new Branch(true, false, true, false).rotate360by90(),
  ...new Branch(true, true, true, false).rotate360by90(),
  ...new Branch(true, true, true, true).rotate360by90()
];
var Deck = class _Deck {
  cards;
  constructor(cards2) {
    this.cards = cards2;
  }
  shuffle() {
    const newCards = [
      ...this.cards
    ];
    for (let i = newCards.length - 1; i > 0; i--) {
      const j = Math.floor(window.random(0, i));
      [newCards[i], newCards[j]] = [
        newCards[j],
        newCards[i]
      ];
    }
    return new _Deck(newCards);
  }
  pickup() {
    const [first, ...rest] = this.cards;
    return {
      card: first,
      deck: new _Deck(rest)
    };
  }
  returnCards(cards2) {
    return new _Deck([
      ...this.cards,
      ...cards2
    ]);
  }
};
var HandCards = class _HandCards {
  cards = [];
  constructor(cards2 = []) {
    this.cards = cards2;
  }
  addCard(card) {
    return new _HandCards([
      ...this.cards,
      card
    ]);
  }
  removeCard(card) {
    return new _HandCards(this.cards.filter((c) => c != card));
  }
};
var cards = [
  [
    branches[15],
    branches[7]
  ],
  [
    branches[8],
    branches[7]
  ],
  [
    branches[9],
    branches[7]
  ],
  [
    branches[15],
    branches[11]
  ],
  [
    branches[8],
    branches[15]
  ],
  [
    branches[15],
    branches[15]
  ],
  [
    branches[8],
    branches[11]
  ],
  [
    branches[19],
    branches[7]
  ],
  [
    branches[5],
    branches[19]
  ],
  [
    branches[8],
    branches[10]
  ],
  [
    branches[9],
    branches[11]
  ],
  [
    branches[16],
    branches[7]
  ],
  [
    branches[8],
    branches[17]
  ],
  [
    branches[17],
    branches[11]
  ],
  [
    branches[19],
    branches[11]
  ],
  [
    branches[8],
    branches[19]
  ],
  [
    branches[20],
    branches[7]
  ],
  [
    branches[8],
    branches[18]
  ],
  [
    branches[16],
    branches[11]
  ],
  [
    branches[13],
    branches[19]
  ],
  [
    branches[19],
    branches[13]
  ],
  [
    branches[16],
    branches[13]
  ],
  [
    branches[20],
    branches[10]
  ],
  [
    branches[20],
    branches[11]
  ],
  [
    branches[20],
    branches[13]
  ],
  [
    branches[16],
    branches[19]
  ],
  [
    branches[19],
    branches[18]
  ],
  [
    branches[19],
    branches[19]
  ],
  [
    branches[19],
    branches[17]
  ],
  [
    branches[17],
    branches[19]
  ],
  [
    branches[16],
    branches[18]
  ]
].map((v, i) => Card.create(`card-${i + 1}`, v[0], v[1])).reduce((memo, card) => {
  const times = card.branches.some((b) => b.isStopWay()) ? 3 : 2;
  return [
    ...memo,
    ...card.times(times)
  ];
}, []);
var centerCards = [
  Card.create("center-1", branches[20], branches[18]),
  Card.create("center-2", branches[20], branches[20])
];

// src/domain/Field.ts
var Field = class _Field {
  branchAndPosList;
  map = {};
  constructor(branchAndPosList = []) {
    this.branchAndPosList = branchAndPosList;
    this.branchAndPosList.forEach((v) => {
      if (!this.map[v.xIndex]) {
        this.map[v.xIndex] = {};
      }
      this.map[v.xIndex][v.yIndex] = v;
    });
  }
  at({ xIndex, yIndex }) {
    var obj = this.map[xIndex];
    if (!obj) {
      return;
    }
    return obj[yIndex];
  }
  getNotConnectedDirections() {
    const result = [];
    this.branchAndPosList.forEach(({ xIndex, yIndex, branch }) => {
      if (branch.up && !this.at({
        xIndex,
        yIndex: yIndex - 1
      })) {
        result.push({
          xIndex,
          yIndex: yIndex - 1,
          direction: "up"
        });
      }
      if (branch.down && !this.at({
        xIndex,
        yIndex: yIndex + 1
      })) {
        result.push({
          xIndex,
          yIndex: yIndex + 1,
          direction: "down"
        });
      }
      if (branch.right && !this.at({
        xIndex: xIndex + 1,
        yIndex
      })) {
        result.push({
          xIndex: xIndex + 1,
          yIndex,
          direction: "right"
        });
      }
      if (branch.left && !this.at({
        xIndex: xIndex - 1,
        yIndex
      })) {
        result.push({
          xIndex: xIndex - 1,
          yIndex,
          direction: "left"
        });
      }
    });
    return result;
  }
  getFourDirectionBranches({ xIndex, yIndex }) {
    return [
      {
        xIndex,
        yIndex: yIndex - 1
      },
      {
        xIndex,
        yIndex: yIndex + 1
      },
      {
        xIndex: xIndex + 1,
        yIndex
      },
      {
        xIndex: xIndex - 1,
        yIndex
      }
    ].map((posIndex) => this.at(posIndex)).filter((v) => v);
  }
  /**
   * 
   * @param card 
   * @returns おけるときはtrue、おけない時はfalse
   */
  checkCardFit(card) {
    const alreadyExists = card.getBranchAndPosList().some(({ xIndex, yIndex }) => this.at({
      xIndex,
      yIndex
    }));
    if (alreadyExists) {
      return false;
    }
    var hasNext = card.getBranchAndPosList().some(({ xIndex, yIndex }) => {
      const up = this.at({
        xIndex,
        yIndex: yIndex - 1
      });
      if (up) {
        return true;
      }
      const down = this.at({
        xIndex,
        yIndex: yIndex + 1
      });
      if (down) {
        return true;
      }
      const right = this.at({
        xIndex: xIndex + 1,
        yIndex
      });
      if (right) {
        return true;
      }
      const left = this.at({
        xIndex: xIndex - 1,
        yIndex
      });
      if (left) {
        return true;
      }
      return false;
    });
    if (!hasNext) {
      return false;
    }
    var hasNotConnectedWay = card.getBranchAndPosList().some(({ xIndex, yIndex, branch }) => {
      {
        const b = this.at({
          xIndex,
          yIndex: yIndex - 1
        });
        if (b && branch.up != b.branch.down) {
          return true;
        }
      }
      {
        const b = this.at({
          xIndex,
          yIndex: yIndex + 1
        });
        if (b && branch.down != b.branch.up) {
          return true;
        }
      }
      {
        const b = this.at({
          xIndex: xIndex + 1,
          yIndex
        });
        if (b && branch.right != b.branch.left) {
          return true;
        }
      }
      {
        const b = this.at({
          xIndex: xIndex - 1,
          yIndex
        });
        if (b && branch.left != b.branch.right) {
          return true;
        }
      }
      return false;
    });
    if (hasNotConnectedWay) {
      return false;
    }
    var hasConnectedWay = card.getBranchAndPosList().some(({ xIndex, yIndex, branch }) => {
      {
        const b = this.at({
          xIndex,
          yIndex: yIndex - 1
        });
        if (b && branch.up && branch.up == b.branch.down) {
          return true;
        }
      }
      {
        const b = this.at({
          xIndex,
          yIndex: yIndex + 1
        });
        if (b && branch.down && branch.down == b.branch.up) {
          return true;
        }
      }
      {
        const b = this.at({
          xIndex: xIndex + 1,
          yIndex
        });
        if (b && branch.right && branch.right == b.branch.left) {
          return true;
        }
      }
      {
        const b = this.at({
          xIndex: xIndex - 1,
          yIndex
        });
        if (b && branch.left && branch.left == b.branch.right) {
          return true;
        }
      }
      return false;
    });
    return hasConnectedWay;
  }
  putCard(card) {
    if (!this.checkCardFit(card)) {
      throw new Error("\u4F4D\u7F6E\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059");
    }
    return new _Field([
      ...this.branchAndPosList,
      ...card.getBranchAndPosList()
    ]);
  }
  putCenterCard(card) {
    return new _Field([
      {
        branch: card.branches[0],
        xIndex: 0,
        yIndex: 0
      },
      {
        branch: card.branches[1],
        xIndex: 1,
        yIndex: 0
      }
    ]);
  }
};

// src/domain/SelectedCard.ts
var SelectedCard = class _SelectedCard {
  card;
  posIndex;
  direction;
  branches;
  constructor(card, posIndex, branches2, direction) {
    this.card = card;
    this.posIndex = posIndex;
    this.branches = branches2;
    this.direction = direction;
  }
  move(moveDirection) {
    var posIndex = {
      ...this.posIndex
    };
    if (moveDirection == "up") {
      posIndex.yIndex--;
    }
    if (moveDirection == "down") {
      posIndex.yIndex++;
    }
    if (moveDirection == "right") {
      posIndex.xIndex++;
    }
    if (moveDirection == "left") {
      posIndex.xIndex--;
    }
    return this.moveWithPosIndex(posIndex);
  }
  moveWithPosIndex(posIndex) {
    return new _SelectedCard(this.card, posIndex, this.branches, this.direction);
  }
  getNextDirection() {
    return {
      "0": "90",
      "90": "180",
      "180": "270",
      "270": "0"
    }[this.direction];
  }
  getBranchAndPosList() {
    const result = [];
    result.push({
      branch: this.branches[0],
      xIndex: this.posIndex.xIndex,
      yIndex: this.posIndex.yIndex
    });
    var xIndex = this.posIndex.xIndex;
    var yIndex = this.posIndex.yIndex;
    if (this.direction == "0") {
      xIndex++;
    } else if (this.direction == "90") {
      yIndex++;
    } else if (this.direction == "180") {
      xIndex--;
    } else if (this.direction == "270") {
      yIndex--;
    }
    result.push({
      branch: this.branches[1],
      xIndex,
      yIndex
    });
    return result;
  }
  rotate90() {
    const branches2 = this.branches.map((v) => v.rotate90());
    return new _SelectedCard(this.card, this.posIndex, branches2, this.getNextDirection());
  }
  static create(card, posIndex) {
    return new _SelectedCard(card, posIndex, [
      ...card.branches
    ], "0");
  }
};

// src/domain/PlumberGame.ts
var PlumberGame = class _PlumberGame {
  field;
  deck;
  handCards;
  config;
  selectedCard;
  notConnectedDirections;
  isCompleted;
  constructor({ field, deck, handCards, config: config2, selectedCard }) {
    this.field = field;
    this.deck = deck;
    this.handCards = handCards;
    this.config = config2;
    this.selectedCard = selectedCard;
    this.notConnectedDirections = field.getNotConnectedDirections();
    this.isCompleted = this.notConnectedDirections.length == 0;
  }
  get restCardCount() {
    return this.deck.cards.length + this.handCards.cards.length;
  }
  get wayCount() {
    return this.notConnectedDirections.length;
  }
  selectCard({ index, initPosIndex }) {
    const card = this.handCards.cards[index];
    var posIndex = {
      xIndex: 0,
      yIndex: 0
    };
    if (this.selectedCard) {
      posIndex.xIndex = this.selectedCard.posIndex.xIndex;
      posIndex.yIndex = this.selectedCard.posIndex.yIndex;
    } else {
      posIndex.xIndex = initPosIndex.xIndex;
      posIndex.yIndex = initPosIndex.yIndex;
    }
    const selectedCard = SelectedCard.create(card, posIndex);
    return new _PlumberGame({
      field: this.field,
      deck: this.deck,
      handCards: this.handCards,
      config: this.config,
      selectedCard
    });
  }
  rotateSelectedCard() {
    if (!this.selectedCard) {
      throw new Error("\u30AB\u30FC\u30C9\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093");
    }
    const selectedCard = this.selectedCard.rotate90();
    return new _PlumberGame({
      field: this.field,
      deck: this.deck,
      handCards: this.handCards,
      config: this.config,
      selectedCard
    });
  }
  putCard() {
    if (!this.selectedCard) {
      throw new Error("\u30AB\u30FC\u30C9\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093");
    }
    if (!this.checkCardFit()) {
      throw new Error("\u7F6E\u3051\u307E\u305B\u3093");
    }
    const field = this.field.putCard(this.selectedCard);
    const handCards = this.handCards.removeCard(this.selectedCard.card);
    var selectedCard;
    return new _PlumberGame({
      field,
      deck: this.deck,
      handCards,
      config: this.config,
      selectedCard
    });
  }
  #checkCardFitResult = void 0;
  checkCardFit() {
    if (this.#checkCardFitResult !== void 0) {
      return this.#checkCardFitResult;
    }
    if (!this.selectedCard) {
      throw new Error("\u30AB\u30FC\u30C9\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093");
    }
    return this.#checkCardFitResult = this.field.checkCardFit(this.selectedCard);
  }
  /** カードを引く */
  drawCardFromDeck() {
    var { card, deck } = this.deck.pickup();
    const handCards = this.handCards.addCard(card);
    return new _PlumberGame({
      field: this.field,
      deck,
      handCards,
      config: this.config,
      selectedCard: this.selectedCard
    });
  }
  resetHandCards() {
    const deck = this.deck.returnCards(this.handCards.cards);
    const handCards = new HandCards();
    var game = new _PlumberGame({
      field: this.field,
      deck,
      handCards,
      config: this.config
    });
    for (var i = 0; i < this.config.numberOfHandCards; i++) {
      game = game.drawCardFromDeck();
    }
    return game;
  }
  moveSelectedCard(moveDirection) {
    if (!this.selectCard) {
      return this;
    }
    const selectedCard = this.selectedCard?.move(moveDirection);
    return new _PlumberGame({
      field: this.field,
      deck: this.deck,
      handCards: this.handCards,
      config: this.config,
      selectedCard
    });
  }
  moveSelectedCardWithPosIndex(posIndex) {
    if (!this.selectCard) {
      return this;
    }
    const selectedCard = this.selectedCard.moveWithPosIndex(posIndex);
    return new _PlumberGame({
      field: this.field,
      deck: this.deck,
      handCards: this.handCards,
      config: this.config,
      selectedCard
    });
  }
  static initGame(config2 = {
    centerCardLevel: "low",
    numberOfHandCards: 3
  }) {
    const centerCard = config2.centerCardLevel == "low" ? centerCards[0] : centerCards[1];
    const field = new Field().putCenterCard(centerCard);
    var deck = new Deck(cards).shuffle();
    var handCards = new HandCards();
    for (let i = 0; i < config2.numberOfHandCards; i++) {
      var { card, deck } = deck.pickup();
      handCards = handCards.addCard(card);
    }
    return new _PlumberGame({
      field,
      deck,
      handCards,
      config: config2
    });
  }
};

// src/view/Camera.ts
var Camera = class {
  x;
  y;
  p5;
  constructor(x, y, p52) {
    this.x = x;
    this.y = y;
    this.p5 = p52;
    this.startMousePos = {
      x: 0,
      y: 0
    };
  }
  startMousePos;
  mousePressed() {
    this.startMousePos = {
      x: this.p5.mouseX,
      y: this.p5.mouseY
    };
    console.log(this.startMousePos);
  }
  mouseDragged() {
    this.x -= this.p5.mouseX - this.startMousePos.x;
    this.y -= this.p5.mouseY - this.startMousePos.y;
    this.startMousePos = {
      x: this.p5.mouseX,
      y: this.p5.mouseY
    };
  }
  mouseReleased() {
  }
  rect(x, y, w, h, tl, tr, br, bl) {
    this.p5.rect(x - this.x, y - this.y, w, h, tl, tr, br, bl);
  }
  square(x, y, size, tl, tr, br, bl) {
    this.p5.square(x - this.x, y - this.y, size, tl, tr, br, bl);
  }
  circle(x, y, r) {
    this.p5.circle(x - this.x, y - this.y, r);
  }
};

// src/view/config.ts
var config = {
  gridSize: 36
};

// src/view/BranchDrawer.ts
var GRID_SIZE = config.gridSize;
var BranchDrawer = class {
  camera;
  p5;
  constructor(camera, p52) {
    this.camera = camera;
    this.p5 = p52;
  }
  isSelectedCardArea({ xIndex, yIndex }, pointerPos) {
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    return pointerPos.x >= x - this.camera.x && pointerPos.y >= y - this.camera.y && pointerPos.x < x - this.camera.x + GRID_SIZE && pointerPos.y < y - this.camera.y + GRID_SIZE;
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
  drawHilight({ xIndex, yIndex, branch }, checkCardFitResult) {
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    if (checkCardFitResult) {
      this.p5.fill(255, 255, 255);
    } else {
      this.p5.fill(255, 0, 0);
    }
    this.p5.square(x - this.camera.x - 2, y - this.camera.y - 2, GRID_SIZE + 4);
  }
  draw({ xIndex, yIndex, branch }) {
    const size = GRID_SIZE / 3;
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    this.p5.fill(0, 0, 0);
    this.p5.noStroke();
    this.camera.square(x, y, GRID_SIZE);
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
      if (!branch.up && !branch.left) {
        tl = corner;
      }
      if (!branch.up && !branch.right) {
        tr = corner;
      }
      if (!branch.down && !branch.right) {
        br = corner;
      }
      if (!branch.down && !branch.left) {
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
};

// src/view/WaterParticle.ts
var GRID_SIZE2 = config.gridSize;
var WaterParticle = class {
  camera;
  p5;
  game;
  index;
  sprites;
  notConnectedDirections;
  constructor(game, camera, p52) {
    this.camera = camera;
    this.p5 = p52;
    this.index = 0;
    this.sprites = [];
    this.count = 0;
    this.game = game;
    this.notConnectedDirections = game.notConnectedDirections;
  }
  updateGame(game) {
    this.game = game;
    this.notConnectedDirections = game.notConnectedDirections;
  }
  count;
  draw() {
    this.count = (this.count + 1) % 5;
    const g = 0;
    const yokoRange = [
      -0.5,
      0.5
    ];
    const tateRange = [
      0.2,
      1
    ];
    if (this.count == 0) {
      this.notConnectedDirections.map(({ xIndex, yIndex, direction }) => {
        var p = {
          x: 0,
          y: 0,
          vx: 0,
          vy: 0,
          ax: 0,
          ay: 0,
          time: 0
        };
        p.ay = g;
        this.p5.fill(50, 100, 255);
        var offsetX = 0;
        var offsetY = 0;
        if (direction == "up") {
          offsetY = GRID_SIZE2 / 4;
          p.x = xIndex * GRID_SIZE2 + GRID_SIZE2 / 2;
          p.y = yIndex * GRID_SIZE2 + GRID_SIZE2;
          p.vx = this.p5.random(yokoRange[0], yokoRange[1]);
          p.vy = -this.p5.random(tateRange[0], tateRange[1]);
        }
        if (direction == "down") {
          offsetY = -GRID_SIZE2 / 4;
          p.x = xIndex * GRID_SIZE2 + GRID_SIZE2 / 2;
          p.y = yIndex * GRID_SIZE2;
          p.vx = this.p5.random(yokoRange[0], yokoRange[1]);
          p.vy = this.p5.random(tateRange[0], tateRange[1]);
        }
        if (direction == "right") {
          offsetX = GRID_SIZE2 / 4;
          p.x = xIndex * GRID_SIZE2;
          p.y = yIndex * GRID_SIZE2 + GRID_SIZE2 / 2;
          p.vy = this.p5.random(yokoRange[0], yokoRange[1]);
          p.vx = this.p5.random(tateRange[0], tateRange[1]);
        }
        if (direction == "left") {
          offsetX = -GRID_SIZE2 / 4;
          p.x = xIndex * GRID_SIZE2 + GRID_SIZE2;
          p.y = yIndex * GRID_SIZE2 + GRID_SIZE2 / 2;
          p.vy = this.p5.random(yokoRange[0], yokoRange[1]);
          p.vx = -this.p5.random(tateRange[0], tateRange[1]);
        }
        this.sprites.push(p);
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
      this.camera.circle(p.x, p.y, p.time / 2);
      if (p.time > 50) {
        this.sprites.splice(i, 1);
      }
    }
  }
};

// src/index.ts
var GRID_SIZE3 = config.gridSize;
var p5 = window;
var FieldDrawer = class {
  branchDrawer;
  constructor(branchDrawer2) {
    this.branchDrawer = branchDrawer2;
    this.branchDrawer = branchDrawer2;
  }
  draw(field) {
    field.branchAndPosList.forEach(({ branch, xIndex, yIndex }) => {
      this.branchDrawer.draw({
        xIndex,
        yIndex,
        branch
      });
    });
  }
};
var SelectedCardDrawer = class {
  branchDrawer;
  camera;
  constructor(branchDrawer2, camera) {
    this.branchDrawer = branchDrawer2;
    this.camera = camera;
  }
  isSelectedCardArea(selectedCard, pointerPos) {
    const branchAndPoses = selectedCard.getBranchAndPosList();
    return branchAndPoses.some(({ xIndex, yIndex, branch }) => this.branchDrawer.isSelectedCardArea({
      xIndex,
      yIndex
    }, pointerPos));
  }
  draw(selectedCard, checkCardFitResult) {
    const branchAndPoses = selectedCard.getBranchAndPosList();
    branchAndPoses.forEach(({ xIndex, yIndex, branch }) => {
      this.branchDrawer.drawHilight({
        xIndex,
        yIndex,
        branch
      }, checkCardFitResult);
    });
    branchAndPoses.forEach(({ xIndex, yIndex, branch }) => {
      this.branchDrawer.draw({
        xIndex,
        yIndex,
        branch
      });
    });
  }
};
var HandCardsDrawer = class _HandCardsDrawer {
  branchDrawer;
  camera;
  constructor() {
    var cameraX = -_HandCardsDrawer.leftMergin(3);
    var cameraY = -(p5.height - GRID_SIZE3);
    console.log(GRID_SIZE3, cameraX);
    this.camera = new Camera(cameraX, cameraY, p5);
    this.branchDrawer = new BranchDrawer(this.camera, p5);
  }
  static leftMergin(cardCount) {
    return (p5.width - GRID_SIZE3 * (2 * cardCount + (cardCount - 1))) / 2;
  }
  draw(handCards) {
    p5.fill(0, 0, 0, 128);
    p5.rect(0, p5.height - GRID_SIZE3 * 1.2, p5.width, GRID_SIZE3 * 1.2);
    handCards.cards.forEach((card, cardIndex) => {
      card.branches.forEach((branch, i) => {
        this.branchDrawer.draw({
          xIndex: i + cardIndex * 3,
          yIndex: 0,
          branch
        });
      });
    });
  }
};
var ControlButtons = class {
  cb;
  constructor(cb) {
    this.cb = cb;
  }
  init() {
    const buttonDefs = [
      [
        "\u9078\u629E",
        () => {
          this.cb.onSelected(0);
        }
      ],
      [
        "\u9078\u629E",
        () => {
          this.cb.onSelected(1);
        }
      ],
      [
        "\u9078\u629E",
        () => {
          this.cb.onSelected(2);
        }
      ],
      // ['◀', () => {this.cb.onPressedArrow('left')}],
      // ['▲', () => {this.cb.onPressedArrow('up')}],
      // ['▼', () => {this.cb.onPressedArrow('down')}],
      // ['▶', () => {this.cb.onPressedArrow('right')}],
      [
        "\u56DE\u8EE2",
        () => {
          this.cb.onPressedRotate();
        }
      ],
      [
        "\u7F6E\u304F",
        () => {
          this.cb.onPut();
        }
      ],
      [
        "\u624B\u672D\u30EA\u30BB\u30C3\u30C8",
        () => {
          this.cb.onResetHandCards();
        }
      ],
      [
        "\u3084\u308A\u76F4\u3057",
        () => {
          this.cb.onUndo();
        }
      ]
    ];
    buttonDefs.forEach(([label, cb], i) => {
      const button = p5.createButton(label);
      button.mouseReleased(cb);
      button.style("width", "72px");
      button.style("height", "36px");
      const leftMergin = HandCardsDrawer.leftMergin(3);
      if (i == 0) {
        button.position(leftMergin, p5.height);
      }
      if (i == 1) {
        button.position(GRID_SIZE3 * 3 + leftMergin, p5.height);
      }
      if (i == 2) {
        button.position(GRID_SIZE3 * 6 + leftMergin, p5.height);
      }
      if (i > 2 && i <= 5) {
        button.position((i - 3) * 3 * GRID_SIZE3 + leftMergin, p5.height + 48);
      }
      if (i > 5) {
        button.position((i - 6) * 3 * GRID_SIZE3 + leftMergin, p5.height + 48 * 2);
      }
    });
    return this;
  }
};
var _game;
var statusText = "";
var context = {
  get game() {
    return _game;
  },
  set game(g) {
    _game = g;
    statusText = `\u6B8B\u308A\u30AB\u30FC\u30C9\uFF1A${_game.restCardCount}\u679A, \u7A74\u306E\u6570\uFF1A${_game.wayCount}\u500B`;
    if (waterParticle) {
      waterParticle.updateGame(g);
    }
  }
};
var mainCamera;
var branchDrawer;
var fieldDrawer;
var selectedCardDrawer;
var handCardsDrawer;
var commandLogs = [];
var buttonCallback;
var waterParticle;
p5.setup = function() {
  context.game = PlumberGame.initGame();
  commandLogs.push(context.game);
  console.log(context.game);
  console.log(context.game.deck.cards.length);
  p5.createCanvas(400, 400);
  mainCamera = new Camera(-200 + GRID_SIZE3, -200 + GRID_SIZE3, p5);
  waterParticle = new WaterParticle(context.game, mainCamera, p5);
  branchDrawer = new BranchDrawer(mainCamera, p5);
  fieldDrawer = new FieldDrawer(branchDrawer);
  selectedCardDrawer = new SelectedCardDrawer(branchDrawer, mainCamera);
  handCardsDrawer = new HandCardsDrawer();
  buttonCallback = {
    onSelected: (index) => {
      console.log("selected", index);
      var xIndex = Math.floor((mainCamera.x + p5.width / 2) / GRID_SIZE3);
      var yIndex = Math.floor((mainCamera.y + p5.height - GRID_SIZE3 * 3) / GRID_SIZE3);
      context.game = context.game.selectCard({
        index,
        initPosIndex: {
          xIndex,
          yIndex
        }
      });
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
      if (commandLogs.length <= 1) {
        return;
      }
      commandLogs.pop();
      context.game = commandLogs.at(-1);
    }
  };
  new ControlButtons(buttonCallback).init();
};
p5.draw = function() {
  p5.background(220);
  const game = context.game;
  waterParticle.draw();
  fieldDrawer.draw(game.field);
  if (game.selectedCard) {
    selectedCardDrawer.draw(game.selectedCard, game.checkCardFit());
  }
  handCardsDrawer.draw(game.handCards);
  if (game.isCompleted) {
    p5.fill(0, 0, 0);
    p5.textSize(30);
    p5.text("\u30B2\u30FC\u30E0\u30AF\u30EA\u30A2\uFF01", 100, 100);
  }
  p5.fill(0, 0, 0);
  p5.textSize(16);
  p5.text(statusText, 0, 16);
};
var cardDragMode = false;
var startMousePos = {
  x: 0,
  y: 0
};
var movePos = {
  x: 0,
  y: 0
};
var startPosIndex = {
  xIndex: 0,
  yIndex: 0
};
p5.mousePressed = function() {
  const game = context.game;
  var pointerPos = {
    x: p5.mouseX,
    y: p5.mouseY
  };
  cardDragMode = !!game.selectedCard && selectedCardDrawer.isSelectedCardArea(game.selectedCard, pointerPos);
  startMousePos = {
    x: p5.mouseX,
    y: p5.mouseY
  };
  if (cardDragMode) {
    startMousePos = {
      x: p5.mouseX,
      y: p5.mouseY
    };
    startPosIndex = {
      xIndex: game.selectedCard.posIndex.xIndex,
      yIndex: game.selectedCard.posIndex.yIndex
    };
    movePos = {
      x: 0,
      y: 0
    };
  } else {
    mainCamera.mousePressed();
  }
};
p5.mouseDragged = function() {
  if (cardDragMode) {
    movePos.x += p5.mouseX - startMousePos.x;
    movePos.y += p5.mouseY - startMousePos.y;
    const posIndex = {
      xIndex: startPosIndex.xIndex + Math.floor(movePos.x / GRID_SIZE3),
      yIndex: startPosIndex.yIndex + Math.floor(movePos.y / GRID_SIZE3)
    };
    context.game = context.game.moveSelectedCardWithPosIndex(posIndex);
    startMousePos = {
      x: p5.mouseX,
      y: p5.mouseY
    };
  } else {
    mainCamera.mouseDragged();
  }
};
p5.mouseReleased = function() {
  if (cardDragMode) {
    cardDragMode = false;
  } else {
    mainCamera.mouseReleased();
  }
};
p5.keyReleased = function() {
  const key = p5.key;
  const keyCode = p5.keyCode;
  console.log(key, keyCode);
  if (context.game.selectedCard) {
    if (key == "ArrowUp") {
      buttonCallback.onPressedArrow("up");
    } else if (key == "ArrowDown") {
      buttonCallback.onPressedArrow("down");
    }
    if (key == "ArrowRight") {
      buttonCallback.onPressedArrow("right");
    } else if (key == "ArrowLeft") {
      buttonCallback.onPressedArrow("left");
    }
    if (key == " ") {
      buttonCallback.onPressedRotate();
    } else if (key == "Enter") {
      buttonCallback.onPut();
    }
  }
  if (key == "1") {
    buttonCallback.onSelected(0);
  } else if (key == "2") {
    buttonCallback.onSelected(1);
  } else if (key == "3") {
    buttonCallback.onSelected(2);
  }
};
export {
  GRID_SIZE3 as GRID_SIZE,
  mainCamera,
  p5
};

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
  constructor({ field, deck, handCards, config, selectedCard }) {
    this.field = field;
    this.deck = deck;
    this.handCards = handCards;
    this.config = config;
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
  static initGame(config = {
    centerCardLevel: "low",
    numberOfHandCards: 3
  }) {
    const centerCard = config.centerCardLevel == "low" ? centerCards[0] : centerCards[1];
    const field = new Field().putCenterCard(centerCard);
    var deck = new Deck(cards).shuffle();
    var handCards = new HandCards();
    for (let i = 0; i < config.numberOfHandCards; i++) {
      var { card, deck } = deck.pickup();
      handCards = handCards.addCard(card);
    }
    return new _PlumberGame({
      field,
      deck,
      handCards,
      config
    });
  }
};

// src/index.ts
var GRID_SIZE = 36;
var FieldDrawer = class {
  branchDrawer;
  camera;
  constructor(branchDrawer2, camera) {
    this.branchDrawer = branchDrawer2;
    this.camera = camera;
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
var BranchDrawer = class {
  camera;
  constructor(camera) {
    this.camera = camera;
  }
  isSelectedCardArea({ xIndex, yIndex }, pointerPos) {
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    return pointerPos.x >= x - this.camera.x && pointerPos.y >= y - this.camera.y && pointerPos.x < x - this.camera.x + GRID_SIZE && pointerPos.y < y - this.camera.y + GRID_SIZE;
  }
  drawHilight({ xIndex, yIndex, branch }, checkCardFitResult) {
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    if (checkCardFitResult) {
      window.fill(255, 255, 255);
    } else {
      window.fill(255, 0, 0);
    }
    window.square(x - this.camera.x - 2, y - this.camera.y - 2, GRID_SIZE + 4);
  }
  draw({ xIndex, yIndex, branch }) {
    const size = GRID_SIZE / 3;
    const x = xIndex * GRID_SIZE;
    const y = yIndex * GRID_SIZE;
    window.fill(0, 0, 0);
    window.noStroke();
    window.square(x - this.camera.x, y - this.camera.y, GRID_SIZE);
    if (branch.hasWay()) {
      if (branch.isStopWay()) {
        window.fill(200, 100, 0);
      } else {
        window.fill(1, 168, 100);
      }
      window.square(x + size - this.camera.x, y + size - this.camera.y, size);
    }
    window.fill(1, 168, 100);
    if (branch.up) {
      window.square(x + size - this.camera.x, y - this.camera.y, size);
    }
    if (branch.right) {
      window.square(x + size * 2 - this.camera.x, y + size - this.camera.y, size);
    }
    if (branch.down) {
      window.square(x + size - this.camera.x, y + size * 2 - this.camera.y, size);
    }
    if (branch.left) {
      window.square(x - this.camera.x, y + size - this.camera.y, size);
    }
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
    var cameraY = -(window.height - GRID_SIZE);
    console.log(GRID_SIZE, cameraX);
    this.camera = new Camera(cameraX, cameraY);
    this.branchDrawer = new BranchDrawer(this.camera);
  }
  static leftMergin(cardCount) {
    return (window.width - GRID_SIZE * (2 * cardCount + (cardCount - 1))) / 2;
  }
  draw(handCards) {
    window.fill(0, 0, 0, 128);
    window.rect(0, window.height - GRID_SIZE * 1.2, window.width, GRID_SIZE * 1.2);
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
      const button = window.createButton(label);
      button.mouseReleased(cb);
      button.style("width", "72px");
      button.style("height", "36px");
      const leftMergin = HandCardsDrawer.leftMergin(3);
      if (i == 0) {
        button.position(leftMergin, window.height);
      }
      if (i == 1) {
        button.position(GRID_SIZE * 3 + leftMergin, window.height);
      }
      if (i == 2) {
        button.position(GRID_SIZE * 6 + leftMergin, window.height);
      }
      if (i > 2 && i <= 5) {
        button.position((i - 3) * 3 * GRID_SIZE + leftMergin, window.height + 48);
      }
      if (i > 5) {
        button.position((i - 6) * 3 * GRID_SIZE + leftMergin, window.height + 48 * 2);
      }
    });
    return this;
  }
};
var Camera = class _Camera {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.startMousePos = {
      x: 0,
      y: 0
    };
  }
  startMousePos;
  mousePressed() {
    this.startMousePos = {
      x: window.mouseX,
      y: window.mouseY
    };
    console.log(this.startMousePos);
  }
  mouseDragged() {
    this.x -= window.mouseX - this.startMousePos.x;
    this.y -= window.mouseY - this.startMousePos.y;
    this.startMousePos = {
      x: window.mouseX,
      y: window.mouseY
    };
  }
  mouseReleased() {
  }
  static none() {
    return new _Camera(0, 0);
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
  }
};
var mainCamera;
var branchDrawer;
var fieldDrawer;
var selectedCardDrawer;
var handCardsDrawer;
var commandLogs = [];
var buttonCallback;
window.setup = function() {
  context.game = PlumberGame.initGame();
  commandLogs.push(context.game);
  console.log(context.game);
  console.log(context.game.deck.cards.length);
  window.createCanvas(400, 400);
  mainCamera = new Camera(-200 + GRID_SIZE, -200 + GRID_SIZE);
  branchDrawer = new BranchDrawer(mainCamera);
  fieldDrawer = new FieldDrawer(branchDrawer, mainCamera);
  selectedCardDrawer = new SelectedCardDrawer(branchDrawer, mainCamera);
  handCardsDrawer = new HandCardsDrawer();
  buttonCallback = {
    onSelected: (index) => {
      console.log("selected", index);
      var xIndex = Math.floor((mainCamera.x + window.width / 2) / GRID_SIZE);
      var yIndex = Math.floor((mainCamera.y + window.height - GRID_SIZE * 3) / GRID_SIZE);
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
window.draw = function() {
  window.background(220);
  const game = context.game;
  game.notConnectedDirections.map(({ xIndex, yIndex, direction }) => {
    window.fill(50, 100, 255);
    var offsetX = 0;
    var offsetY = 0;
    if (direction == "up") {
      offsetY = GRID_SIZE / 4;
    }
    if (direction == "down") {
      offsetY = -GRID_SIZE / 4;
    }
    if (direction == "right") {
      offsetX = GRID_SIZE / 4;
    }
    if (direction == "left") {
      offsetX = -GRID_SIZE / 4;
    }
    window.square(xIndex * GRID_SIZE - mainCamera.x, yIndex * GRID_SIZE - mainCamera.y, GRID_SIZE, GRID_SIZE / 6);
  });
  fieldDrawer.draw(game.field);
  if (game.selectedCard) {
    selectedCardDrawer.draw(game.selectedCard, game.checkCardFit());
  }
  handCardsDrawer.draw(game.handCards);
  if (game.isCompleted) {
    window.fill(0, 0, 0);
    window.textSize(30);
    window.text("\u30B2\u30FC\u30E0\u30AF\u30EA\u30A2\uFF01", 100, 100);
  }
  window.fill(0, 0, 0);
  window.textSize(16);
  window.text(statusText, 0, 16);
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
window.mousePressed = function() {
  const game = context.game;
  var pointerPos = {
    x: window.mouseX,
    y: window.mouseY
  };
  cardDragMode = !!game.selectedCard && selectedCardDrawer.isSelectedCardArea(game.selectedCard, pointerPos);
  startMousePos = {
    x: window.mouseX,
    y: window.mouseY
  };
  if (cardDragMode) {
    startMousePos = {
      x: window.mouseX,
      y: window.mouseY
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
window.mouseDragged = function() {
  if (cardDragMode) {
    movePos.x += window.mouseX - startMousePos.x;
    movePos.y += window.mouseY - startMousePos.y;
    const posIndex = {
      xIndex: startPosIndex.xIndex + Math.floor(movePos.x / GRID_SIZE),
      yIndex: startPosIndex.yIndex + Math.floor(movePos.y / GRID_SIZE)
    };
    context.game = context.game.moveSelectedCardWithPosIndex(posIndex);
    startMousePos = {
      x: window.mouseX,
      y: window.mouseY
    };
  } else {
    mainCamera.mouseDragged();
  }
};
window.mouseReleased = function() {
  if (cardDragMode) {
    cardDragMode = false;
  } else {
    mainCamera.mouseReleased();
  }
};
window.keyReleased = function() {
  const key = window.key;
  const keyCode = window.keyCode;
  console.log(key, keyCode);
  if (context.game.selectedCard) {
    const selectedCard = context.game.selectedCard;
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
    } else if (key == "1") {
      buttonCallback.onSelected(0);
    } else if (key == "2") {
      buttonCallback.onSelected(1);
    } else if (key == "3") {
      buttonCallback.onSelected(2);
    }
  }
};

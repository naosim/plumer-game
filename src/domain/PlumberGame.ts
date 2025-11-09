import { Deck, HandCards, PosIndex, centerCards, cards } from "./domain";
import { Field } from "./Field";
import { SelectedCard } from "./SelectedCard";

export class PlumberGame {
  field: Field;
  deck: Deck;
  handCards: HandCards;
  config: PlumberGameConfig;
  selectedCard?: SelectedCard;
  notConnectedDirections;
  isCompleted;
  constructor({ field, deck, handCards, config, selectedCard }: PlumberGameParams) {
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

  selectCard({ index, initPosIndex }: { index: number, initPosIndex: PosIndex }) {
    const card = this.handCards.cards[index];
    var posIndex = { xIndex: 0, yIndex: 0 };
    if(this.selectedCard) {
      posIndex.xIndex = this.selectedCard.posIndex.xIndex;
      posIndex.yIndex = this.selectedCard.posIndex.yIndex;
    } else {
      posIndex.xIndex = initPosIndex.xIndex;
      posIndex.yIndex = initPosIndex.yIndex;
    }
    const selectedCard = SelectedCard.create(card, posIndex);
    return new PlumberGame({
      field: this.field,
      deck: this.deck,
      handCards: this.handCards,
      config: this.config,
      selectedCard,
    });
  }

  rotateSelectedCard() {
    if (!this.selectedCard) {
      throw new Error("カードが選択されていません");
    }
    const selectedCard = this.selectedCard.rotate90();
    return new PlumberGame({
      field: this.field,
      deck: this.deck,
      handCards: this.handCards,
      config: this.config,
      selectedCard,
    });
  }

  putCard() {
    if (!this.selectedCard) {
      throw new Error("カードが選択されていません");
    }
    if(!this.checkCardFit()) {
      throw new Error("置けません");
    }
    const field = this.field.putCard(this.selectedCard);
    const handCards = this.handCards.removeCard(this.selectedCard.card);
    var selectedCard;
    return new PlumberGame({ field, deck: this.deck, handCards, config: this.config, selectedCard });
  }
  #checkCardFitResult:boolean | undefined = undefined;
  checkCardFit() {
    if(this.#checkCardFitResult !== undefined) {
      return this.#checkCardFitResult;
    }
    if (!this.selectedCard) {
      throw new Error("カードが選択されていません");
    }
    
    return this.#checkCardFitResult = this.field.checkCardFit(this.selectedCard);
  }

  /** カードを引く */
  drawCardFromDeck() {
    var { card, deck } = this.deck.pickup();
    const handCards = this.handCards.addCard(card);
    return new PlumberGame({ field: this.field, deck, handCards, config: this.config, selectedCard: this.selectedCard });
  }

  resetHandCards() {
    // 手札をデッキに戻す
    const deck = this.deck.returnCards(this.handCards.cards);
    const handCards = new HandCards();
    var game = new PlumberGame({ field: this.field, deck, handCards, config: this.config});
    
    // カードをn枚ひく
    for(var i = 0; i < this.config.numberOfHandCards; i++) {
      game = game.drawCardFromDeck();
    }
    return game;
  }

  moveSelectedCard(moveDirection:'up'|'down'|'right'|'left') {
    if(!this.selectCard) {
      return this;
    }
    const selectedCard = this.selectedCard?.move(moveDirection);
    return new PlumberGame({ field: this.field, deck:this.deck, handCards:this.handCards, config: this.config, selectedCard:selectedCard });
  }
  moveSelectedCardWithPosIndex(posIndex:{xIndex:number, yIndex:number}) {
    if(!this.selectCard) {
      return this;
    }
    const selectedCard = this.selectedCard!.moveWithPosIndex(posIndex);
    return new PlumberGame({ field: this.field, deck:this.deck, handCards:this.handCards, config: this.config, selectedCard:selectedCard });
  }

  static initGame(config: PlumberGameConfig = { centerCardLevel: "low", numberOfHandCards: 4 }) {
    const centerCard = config.centerCardLevel == "low" ? centerCards[0] : centerCards[1];
    const field = new Field().putCenterCard(centerCard);
    var deck = new Deck(cards).shuffle();

    // 3枚ひく
    var handCards = new HandCards();
    for (let i = 0; i < config.numberOfHandCards; i++) {
      var { card, deck } = deck.pickup();
      handCards = handCards.addCard(card);
    }

    return new PlumberGame({ field, deck, handCards, config });
  }

}
export type PlumberGameConfig = {
  centerCardLevel: "low" | "high";
  numberOfHandCards: number;
};

export type PlumberGameParams = {
  field: Field;
  deck: Deck;
  handCards: HandCards;
  selectedCard?: SelectedCard;
  config: PlumberGameConfig;
};


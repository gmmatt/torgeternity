export default class GMDecks {
  constructor() {
    this.destiny = {
      label: "destiny deck",
      remainingCards: [],
      playedCards: [],
    };
    this.action = {
        label: "action deck",
        remainingCards: [],
        playedCards: [],
        activeCard:{}
      };
      this.cosm = {
        label: "cosm deck",
        remainingCards: [],
        playedCards: [],
        activeCard:{}
      };

  }
}

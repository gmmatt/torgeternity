import {torgeternity} from "/systems/torgeternity/module/config.js";

export default class  torgeternityDestiny extends CardsPile {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["torgeternity", "sheet", "card", "cards-config", "destiny-config"],
            width: 400,
        })
    }

    get template() {
        
        return "systems/torgeternity/templates/cards/torgeternityDestiny.hbs";

    }

    async _onCardControl(event) {
        // Shamelessly stolen from core software
        const button = event.currentTarget;
        const li = button.closest(".card");
        const card = li ? this.object.cards.get(li.dataset.cardId) : null;
        const cls = getDocumentClass("Card");
    
        // Save any pending change to the form
        await this._onSubmit(event, {preventClose: true, preventRender: true});
    
        // Handle the control action
        switch ( button.dataset.action ) {
          case "play":
              card.pass(game.cards.getName("Destiny Discard"));
              card.toMessage({content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img}"/><h4 class="card-name">Plays ${card.name}</h4>
            </div>`})
              return;
          case "view":
              new ImagePopout(card.img, {title: card.name}).render(true,{width:425,height:650});
              return;
          case "display":
              let x = new ImagePopout(card.img, {title: card.name}).render(true,{width:425,height:650});
              x.shareImage();
              return;
          case "discard":
              card.pass(game.cards.getName("Destiny Discard"));
              card.toMessage({content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img}"/><h4 class="card-name">Discards ${card.name}</h4></div>`});
              return;
          case "drawDestiny":
              return this.object.draw(game.cards.getName("Destiny Deck"));
          case "drawCosm":
              this.drawCosmDialog();
              return;
          case "create":
            return cls.createDialog({}, {parent: this.object, pack: this.object.pack});
          case "edit":
            return card.sheet.render(true);
          case "delete":
            return card.deleteDialog();
          case "deal":
            return this.object.dealDialog();
          case "draw":
            return this.object.drawDialog();
          case "pass":
            return this.object.passDialog();
          case "reset":
            this._sortStandard = true;
            return this.object.reset();
          case "shuffle":
            this._sortStandard = false;
            return this.object.shuffle();
          case "toggleSort":
            this._sortStandard = !this._sortStandard;
            return this.render();
          case "nextFace":
            return card.update({face: card.data.face === null ? 0 : card.data.face+1});
          case "prevFace":
            return card.update({face: card.data.face === 0 ? null : card.data.face-1});
        }
    
    }

}
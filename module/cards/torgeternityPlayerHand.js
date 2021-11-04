import {torgeternity} from "/systems/torgeternity/module/config.js";

export default class  torgeternityPlayerHand extends CardsHand {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["torgeternity", "sheet", "cardsHand", "cards-config"],
            width: 500,
        })
    }

    get template() {
        
        return "systems/torgeternity/templates/cards/torgeternityPlayerHand.hbs";

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
              await card.setFlag("torgeternity", "pooled", false)
              await card.pass(game.cards.getName("Destiny Discard"));
              card.toMessage({content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img}"/><h4 class="card-name">Plays ${card.name}</h4>
            </div>`})
              game.combats.apps[0].render();
              return;
          case "view":
              new ImagePopout(card.img, {title: card.name}).render(true,{width:425,height:650});
              return;
          case "display":
              let x = new ImagePopout(card.img, {title: card.name}).render(true,{width:425,height:650});
              x.shareImage();
              return;
          case "discard":
              await card.setFlag("torgeternity", "pooled", false);
              await card.pass(game.cards.getName("Destiny Discard"));
              card.toMessage({content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img}"/><h4 class="card-name">Discards ${card.name}</h4></div>`});
              game.combats.apps[0].render();
              return;
          case "drawDestiny":
              return this.object.draw(game.cards.getName("Destiny Deck"));
          case "drawCosm":
              this.drawCosmDialog();
              return;
          case "pass":
              await card.setFlag("torgeternity", "pooled", false);
              await this.playerPassDialog(card);
              game.combats.apps[0].render();
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

    async _onChangeInput(event) {
      const input = event.currentTarget;
      const li= input.closest(".card");
      const card = li ? this.object.cards.get(li.dataset.cardId) : null;
      const cls = getDocumentClass("Card");

      //Save any pending change
      await this._onSubmit(event, {preventClose: true, preventRender: true});

      //Handle the control action
      switch ( input.dataset.action) {
        case "poolToggle":
          if (card.getFlag("torgeternity", "pooled") === true) {
            await card.setFlag("torgeternity", "pooled", false)
            game.combats.apps[0].render();
          } else {
            await card.setFlag("torgeternity", "pooled", true)
            game.combats.apps[0].render();
          }
          /*if (input.checked === true) {
            await card.setFlag("torgeternity","pooled", true)
          } else  {
            await card.setFlag("torgeternity","pooled", false)
          } */
          return;
      }
    }
    
       
      async playerPassDialog(card) {
      const cards = game.cards.filter(c => (c !== this) && (c.type !== "deck") && c.testUserPermission(game.user, "LIMITED"));
      if ( !cards.length ) return ui.notifications.warn("No hands available!", {localize: true});
  
      // Construct the dialog HTML
      const html = await renderTemplate("systems/torgeternity/templates/cards/playerPassDialog.hbs", {
        cards: cards,
      });
  
      // Display the prompt
      return Dialog.prompt({
        title: game.i18n.localize("torgeternity.dialogPrompts.playerPassTitle"),
        label: game.i18n.localize("torgeternity.dialogPrompts.playerPassLabel"),
        content: html,
        callback: html => {
          const form = html.querySelector("form.cards-dialog");
          const fd = new FormDataExtended(form).toObject();
          const to = game.cards.get(fd.to);
          return card.pass(to).catch(err => {
            ui.notifications.error(err.message);
            return this;
          });
        },
        options: {jQuery: false}
      });
    } 
  
    async drawCosmDialog() {
      const cosmDecks = torgeternity.cosmDecks;
      const html = await renderTemplate("systems/torgeternity/templates/cards/drawCosmDialog.hbs", cosmDecks)

      return Dialog.prompt({
        title: game.i18n.localize("torgeternity.dialogPrompts.cosmDialogTitle"),
        label: game.i18n.localize("torgeternity.dialogPrompts.cosmDeckDialogLabel"),
        content: html,
        callback: html => {
          const form = html[0].querySelector("form.cosm-dialog");
          const fd = new FormDataExtended(form).toObject();
          const from = game.cards.getName(fd.from);
          return this.object.draw(from).catch(err => {
            ui.notifications.error(err.message);
            return this;
          });
        }
      });
    }
    
    /* Probably don't need to do any of this
    
    _canDragStart(selector) {
        super.canDragStart(html);
    }

    _onDragStart(event) {
        super.onDragStart(event)
    }

    _canDragDrop(selector) {
        super.canDragDrop(selector)
    }

    async _ondrop(event) {
        super.onDrop(event);
    }

    _onSortCard(event,card) {
        super.onSortCard(event,card)
    } 
    
    */
}
import TorgCombat from "../dramaticScene/torgeternityCombat.js";
import { torgeternity } from "/systems/torgeternity/module/config.js";

export default class torgeternityPile extends CardsPile {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["torgeternity", "sheet", "cardsPile", "cards-config"],
            width: 400,
        })
    }

    get template() {

        return "systems/torgeternity/templates/cards/torgeternityPile.hbs";

    }

    async _onCardControl(event) {
        // Shamelessly stolen from core software
        const button = event.currentTarget;
        const li = button.closest(".card");
        const card = li ? this.object.cards.get(li.dataset.cardId) : null;
        const cls = getDocumentClass("Card");

        // Save any pending change to the form
        await this._onSubmit(event, { preventClose: true, preventRender: true });

        // Handle the control action
        switch (button.dataset.action) {
            case "play":
                card.setFlag("torgeternity", "pooled", false)
                card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").destinyDiscard));
                card.toMessage({
                    content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img}"/><h4 class="card-name">${game.i18n.localize("torgeternity.chatText.playsCard")} ${card.data.name}</h4>
            </div>` })
                return;
            case "view":
                new ImagePopout(card.img, { title: card.name }).render(true, { width: 425, height: 650 });
                return;
            case "display":
                let x = new ImagePopout(card.img, { title: card.name }).render(true, { width: 425, height: 650 });
                x.shareImage();
                return;
            case "discard":
                card.setFlag("torgeternity", "pooled", false);
                card.pass(game.cards.get(game.settings.get("torgeternity", "deckSetting").destinyDiscard));
                card.toMessage({ content: `<div class="card-draw flexrow"><img class="card-face" src="${card.img}"/><h4 class="card-name">${game.i18n.localize("torgeternity.chatText.discardsCard")} ${card.data.name}</h4></div>` });
                return;
            case "drawDestiny":
                let destinyDeck = game.cards.get(game.settings.get("torgeternity", "deckSetting").destinyDeck);
                if (destinyDeck.data.cards.size) {
                    const [firstCardKey] = destinyDeck.data.cards.keys(); // need to grab a card to get toMessage access
                    const card = destinyDeck.data.cards.get(firstCardKey);
                    card.toMessage({ content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${destinyDeck.data.img}"/><span><img src="${destinyDeck.data.img}"></span></span><h4 class="card-name">${game.i18n.localize("torgeternity.chatText.drawsCard")} ${destinyDeck.data.name}.</h4></div>` });
                }
                return this.object.draw(destinyDeck);
            case "drawCosm":
                this.drawCosmDialog();
                return;
            case "create":
                return cls.createDialog({}, { parent: this.object, pack: this.object.pack });
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
                return card.update({ face: card.data.face === null ? 0 : card.data.face + 1 });
            case "prevFace":
                return card.update({ face: card.data.face === 0 ? null : card.data.face - 1 });
            case "return":
                for (let i = 0; i < this.object.data.cards.size; i++) {
                    this.object.data.cards.contents[i].reset()
                }
        }

    }


    async passDialog() {
        const cards = game.cards.filter(c => (c !== this) && (c.type !== "deck") && c.testUserPermission(game.user, "LIMITED"));
        if (!cards.length) return ui.notifications.warn("CARDS.PassWarnNoTargets", { localize: true });

        // Construct the dialog HTML
        const html = await renderTemplate("templates/cards/dialog-pass.html", {
            cards: cards,
            modes: {
                [CONST.CARD_DRAW_MODES.TOP]: "CARDS.DrawModeTop",
                [CONST.CARD_DRAW_MODES.BOTTOM]: "CARDS.DrawModeBottom",
                [CONST.CARD_DRAW_MODES.RANDOM]: "CARDS.DrawModeRandom",
            }
        });

        // Display the prompt
        return Dialog.prompt({
            title: game.i18n.localize("CARDS.PassTitle"),
            label: game.i18n.localize("CARDS.Pass"),
            content: html,
            callback: html => {
                const form = html.querySelector("form.cards-dialog");
                const fd = new FormDataExtended(form).toObject();
                const to = game.cards.get(fd.to);
                const options = { how: fd.how, updateData: fd.down ? { face: null } : {} };
                return this.deal([to], fd.number, options).catch(err => {
                    ui.notifications.error(err.message);
                    return this;
                });
            },
            options: { jQuery: false }
        });
    }
}
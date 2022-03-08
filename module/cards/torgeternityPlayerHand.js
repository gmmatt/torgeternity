import { torgeternity } from "/systems/torgeternity/module/config.js";

export default class torgeternityPlayerHand extends CardsHand {

    static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["torgeternity", "sheet", "cardsHand", "cards-config"],
            width: 800,
            top: 150,
            resizable: true,
        })
    }


    get template() {
        let path;
        if (this.object.getFlag("torgeternity", "lifelike")) {
            path = "systems/torgeternity/templates/cards/torgeternityPlayerHand_lifelike.hbs";

        } else {
            path = "systems/torgeternity/templates/cards/torgeternityPlayerHand.hbs";

        }
        return path;

    }

    async activateListeners(html) {
        if (this.object.getFlag("torgeternity", "lifelike")) {
            this.rotateCards(html);
            html.find(".card img").click(this.focusCard.bind(this));
        }
        html.find("#lifelike").click(this.submit.bind(this));
        super.activateListeners(html);
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
                await card.setFlag("torgeternity", "pooled", false)
                if (card.data.type == "destiny") {
                    await card.pass(game.cards.getName("Destiny Discard"));
                } else {
                    await card.pass(game.cards.getName("Cosm Discard"));
                }
                card.toMessage({ content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img}"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize("torgeternity.dialogPrompts.plays")} ${card.name}</span>
            </div>` })
                    // await game.combats.apps[0].viewed.resetAll();
                return;
            case "view":
                new ImagePopout(card.img, { title: card.name }).render(true, { width: 425, height: 650 });
                return;
            case "display":
                let x = new ImagePopout(card.img, { title: card.name }).render(true, { width: 425, height: 650 });
                x.shareImage();
                return;
            case "discard":
                await card.setFlag("torgeternity", "pooled", false);
                if (card.data.type == "destiny") {
                    await card.pass(game.cards.getName("Destiny Discard"));
                } else {
                    await card.pass(game.cards.getName("Cosm Discard"));
                }
                card.toMessage({ content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img}"/><span><img src="${card.img}"></span></span><span class="card-name">${game.i18n.localize("torgeternity.dialogPrompts.discards")} ${card.name}</span>
              </div>` });
                // await game.combats.apps[0].viewed.resetAll();
                return;
            case "drawDestiny":
                return this.object.draw(game.cards.getName("Destiny Deck"));
            case "drawCosm":
                this.drawCosmDialog();
                return;
            case "pass":
                await card.setFlag("torgeternity", "pooled", false);
                await this.playerPassDialog(card);
                // await game.combats.apps[0].viewed.resetAll();
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
        }

    }

    async _onChangeInput(event) {
        const input = event.currentTarget;
        const li = input.closest(".card");
        const card = li ? this.object.cards.get(li.dataset.cardId) : null;
        const cls = getDocumentClass("Card");

        //Save any pending change
        await this._onSubmit(event, { preventClose: true, preventRender: true });

        //Handle the control action
        switch (input.dataset.action) {
            case "poolToggle":
                if (card.getFlag("torgeternity", "pooled") === true) {
                    await card.setFlag("torgeternity", "pooled", false)
                        // await game.combats.apps[0].viewed.resetAll();
                } else {
                    await card.setFlag("torgeternity", "pooled", true)
                        // await game.combats.apps[0].viewed.resetAll();
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
        if (!cards.length) return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noHand'), { localize: true });

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
                const toName = to.data.name;
                card.toMessage({ content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${card.img}"/><span><img src="${card.img}"></span></span><h4 class="card-name">Passes ${card.name} to ${toName}.</h4></div>` });
                return card.pass(to).catch(err => {
                    ui.notifications.error(err.message);
                    return this;
                });
            },
            options: { jQuery: false }
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
    rotateCards(html) {
        let cardsAreas = html.find('.cards');
        for (let area of cardsAreas) {
            for (let i = 0; i < area.children.length; i++) {

                let card = area.children[i];
                card.style.transform = `rotateZ(${(i*4)}deg) translateX(${i*30}px)`;
                console.log(card)
            }
            area.style.transform = `rotateZ(${-((area.children.length-1)*2)}deg) translateX(-${area.children.length*15}px)`

        }
    }
    focusCard(ev) {
            let card = ev.currentTarget.closest('li.card');
            card.classList.toggle('focusedCard');
            if (card.classList.contains("focusedCard")) {
                card.setAttribute("data-rot", card.style.transform)
                let correction = parseInt(card.parentElement.style.transform.replace("rotateZ(", "").replace(")deg", "")) * -1;
                card.style.transform = `rotateZ(${correction}deg)`

            } else {
                card.style.transform = card.getAttribute("data-rot")
            }
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
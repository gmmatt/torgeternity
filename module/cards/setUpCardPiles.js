export async function setUpCardPiles() {
    let deckSetting = game.settings.get("torgeternity", "deckSetting");
    console.log(deckSetting)
    const pack = game.packs.get("torgeternity.core-card-set");
    const basicRules = game.packs.get("torgeternity.basic-rules")
        // Add Destiny Deck
    if (game.cards.getName("Destiny Deck") == null) {
        const itemId = pack.index.getName("Destiny Deck")._id;
        let pile = game.cards.importFromCompendium(pack, itemId)
    }
    // Add Drama Deck
    if (game.cards.getName("Drama Deck") == null) {
        const itemId = pack.index.getName("Drama Deck")._id;
        game.cards.importFromCompendium(pack, itemId)
    }
    // Add Cosm Discard
    if (game.cards.getName("Cosm Discard") == null) {
        let cardData = {
            name: "Cosm Discard",
            type: "pile",
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        }
        let cosmDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
    }
    // Add Drama Discard
    if (game.cards.getName("Drama Discard") == null) {
        let cardData = {
            name: "Drama Discard",
            type: "pile",
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        }
        let dramaDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
    }
    // Add Destiny Discard
    if (game.cards.getName("Destiny Discard") == null) {
        let cardData = {
            name: "Destiny Discard",
            type: "pile",
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        }
        let destinyDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
    }
    // Add Active Drama
    if (game.cards.getName("Active Drama Card") == null) {
        let cardData = {
            name: "Active Drama Card",
            type: "pile"
        }
        let activeDrama = Cards.create(cardData, { keepId: true, renderSheet: false });
    }

    // Add journal entry with instructions relating to cards
    if (game.journal.getName("Managing Cards") == null) {
        const itemId = basicRules.index.getName("Managing Cards")._id;
        game.journal.importFromCompendium(basicRules, itemId);
    }

    let stormknights = game.actors.filter(act => act.type == "stormknight");
    for (let sk of stormknights) {
        if (!sk.getDefaultHand()) {
            await sk.createDefaultHand();

        }


    }

    game.settings.set("torgeternity", "setUpCards", true)

}
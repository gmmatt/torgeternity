export async function setUpCardPiles() {
    let deckSetting = game.settings.get("torgeternity", "deckSetting");
    const pack = game.packs.get("torgeternity.core-card-set");
    const basicRules = game.packs.get("torgeternity.basic-rules")
        // Add Destiny Deck
    if (game.cards.getName("Destiny Deck") == null) {
        const itemId = pack.index.getName("Destiny Deck")._id;
        let pile = game.cards.importFromCompendium(pack, itemId);
        deckSetting.destinyDeck = "Destiny Deck"
    }
    // Add Drama Deck
    if (game.cards.getName("Drama Deck") == null) {
        const itemId = pack.index.getName("Drama Deck")._id;
        game.cards.importFromCompendium(pack, itemId);
        deckSetting.dramaDeck = "Drama Deck"
    }
    // Add Cosm Discard
    if (game.cards.getName("Cosm Discard") == null) {
        let cardData = {
            name: "Cosm Discard",
            type: "pile",
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        }
        let cosmDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
        deckSetting.cosmDiscard = "Cosm Discard";
    }
    // Add Drama Discard
    if (game.cards.getName("Drama Discard") == null) {
        let cardData = {
            name: "Drama Discard",
            type: "pile",
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        }
        let dramaDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
        deckSetting.dramaDiscard = "Drama Discard"
    }
    // Add Destiny Discard
    if (game.cards.getName("Destiny Discard") == null) {
        let cardData = {
            name: "Destiny Discard",
            type: "pile",
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        }
        let destinyDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
        deckSetting.destinyDiscard = "Destiny Discard"
    }
    // Add Active Drama
    if (game.cards.getName("Active Drama Card") == null) {
        let cardData = {
            name: "Active Drama Card",
            type: "pile"
        }
        let activeDrama = Cards.create(cardData, { keepId: true, renderSheet: false });
        deckSetting.dramaActive = "Active Drama Card"
    }

    //adding cosm decks
    //-----------------
    if (game.cards.getName("Core Earth Cosm Deck") == null) {
        const itemId = pack.index.getName("Core Earth Cosm Deck")._id;
        game.cards.importFromCompendium(pack, itemId);
        deckSetting.coreEarth = "Core Earth Cosm Deck"
    }
    if (game.cards.getName("Aysle Cosm Deck") == null) {
        const itemId = pack.index.getName("Aysle Cosm Deck")._id;
        game.cards.importFromCompendium(pack, itemId);
        deckSetting.aysle = "Aysle Cosm Deck"
    }
    if (game.cards.getName("Cyberpapacy Cosm Deck") == null) {
        const itemId = pack.index.getName("Cyberpapacy Cosm Deck")._id;
        game.cards.importFromCompendium(pack, itemId);
        deckSetting.cyberpapacy = "Cyberpapacy Cosm Deck"
    }
    if (game.cards.getName("Living Land Cosm Deck") == null) {
        const itemId = pack.index.getName("Living Land Cosm Deck")._id;
        game.cards.importFromCompendium(pack, itemId);
        deckSetting.livingLand = "Living Land Cosm Deck"
    }
    if (game.cards.getName("Nile Empire Cosm Deck") == null) {
        const itemId = pack.index.getName("Nile Empire Cosm Deck")._id;
        game.cards.importFromCompendium(pack, itemId);
        deckSetting.nileEmpire = "Nile Empire Cosm Deck"
    }
    if (game.cards.getName("Orrorsh Cosm Deck") == null) {
        const itemId = pack.index.getName("Orrorsh Cosm Deck")._id;
        game.cards.importFromCompendium(pack, itemId);
        deckSetting.orrorsh = "Orrorsh Cosm Deck"
    }
    if (game.cards.getName("Pan Pacifica Cosm Deck") == null) {
        const itemId = pack.index.getName("Pan Pacifica Cosm Deck")._id;
        game.cards.importFromCompendium(pack, itemId);
        deckSetting.panPacifica = "Pan Pacifica Cosm Deck"
    }
    if (game.cards.getName("Tharkold Cosm Deck") == null) {
        const itemId = pack.index.getName("Tharkold Cosm Deck")._id;
        game.cards.importFromCompendium(pack, itemId);
        deckSetting.tharkold = "Tharkold Cosm Deck"
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

    game.settings.set("torgeternity", "setUpCards", false)

}
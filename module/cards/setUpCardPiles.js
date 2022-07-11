export async function setUpCardPiles() {
    let deckSetting = game.settings.get("torgeternity", "deckSetting");
    let lang = game.settings.get("core", "language");

    // default variables for english 
    let basicRulesPack = game.packs.get("torgeternity.basic-rules");

    let decks = {
        pack: game.packs.get("torgeternity.core-card-set"),
        destiny: "Destiny Deck",
        destinyDiscard: "Destiny Discard",
        drama: "Drama Deck",
        activeDrama: "Active Drama Card",
        dramaDiscard: "Drama Discard",
        aysle: "Aysle Cosm Deck",
        coreEarth: "Core Earth Cosm Deck",
        cyberpapacy: "Cyberpapacy Cosm Deck",
        livingLand: "Living Land Cosm Deck",
        nileEmpire: "Nile Empire Cosm Deck",
        orrorsh: "Orrorsh Cosm Deck",
        panPacifica: "Pan Pacifica Cosm Deck",
        tharkold: "Tharkold Cosm Deck",
        cosmDiscard: "Cosm Discard"
    }


    // changing variables depending on language
    if (lang == "fr") {
        basicRulesPack = game.packs.get("torgeternity.basic-rules-fr");
        decks = {
            pack: game.packs.get("torgeternity.core-card-set-fr"),
            destiny: "Paquet du Destin",
            destinyDiscard: "Défausse Cartes du Destin",
            drama: "Paquet d'Action",
            activeDrama: "Cartes d'Action Active",
            dramaDiscard: "Défausse Cartes d'Action",
            aysle: "Paquet Cosm Aysle",
            coreEarth: "Paquet Cosm Prime Terre",
            cyberpapacy: "Paquet Cosm Cyberpapauté",
            livingLand: "Paquet Cosm Terre Vivante",
            nileEmpire: "Paquet Cosm L'Empire du Nil",
            orrorsh: "Paquet Cosm Orrorsh",
            panPacifica: "Paquet Cosm Pan-Pacifica",
            tharkold: "Paquet Cosm Tharkold",
            cosmDiscard: "Défausse Cartes Cosm"
        }

    }
    if (lang == "de") {
        basicRulesPack = game.packs.get("torgeternity.system-de-basisregeln");
        decks.pack = game.packs.get("torgeternity.system-de-grundkarten");
    }
    //log message
    console.log(`
    Torg eternity system // setting up default card decks
    `, decks)


    // Add Destiny Deck
    if (game.cards.getName(decks.destiny) == null) {
        const itemId = decks.pack.index.getName(decks.destiny)._id;
        game.cards.importFromCompendium(decks.pack, itemId)
        deckSetting.destinyDeck = decks.destiny
    }
    // Add Drama Deck
    if (game.cards.getName(decks.drama) == null) {
        const itemId = decks.pack.index.getName(decks.drama)._id;
        game.cards.importFromCompendium(decks.pack, itemId);
        deckSetting.dramaDeck = decks.drama

    }
    // Add Aysle Deck
    if (game.cards.getName(decks.aysle) == null) {
        const itemId = decks.pack.index.getName(decks.aysle)._id;
        game.cards.importFromCompendium(decks.pack, itemId);
        deckSetting.aysle = decks.aysle

    }
    // Add Aysle Deck
    if (game.cards.getName(decks.cyberpapacy) == null) {
        const itemId = decks.pack.index.getName(decks.cyberpapacy)._id;
        game.cards.importFromCompendium(decks.pack, itemId);
        deckSetting.cyberpapacy = decks.cyberpapacy

    }
    // Add cyberpapacynil empire Deck
    if (game.cards.getName(decks.nileEmpire) == null) {
        const itemId = decks.pack.index.getName(decks.nileEmpire)._id;
        game.cards.importFromCompendium(decks.pack, itemId);
        deckSetting.nileEmpire = decks.nileEmpire;


    }
    // Add livingLand Deck
    if (game.cards.getName(decks.livingLand) == null) {
        const itemId = decks.pack.index.getName(decks.livingLand)._id;
        game.cards.importFromCompendium(decks.pack, itemId);
        deckSetting.livingLand = decks.livingLand

    }
    // Add orrorsh Deck
    if (game.cards.getName(decks.orrorsh) == null) {
        const itemId = decks.pack.index.getName(decks.orrorsh)._id;
        game.cards.importFromCompendium(decks.pack, itemId);
        deckSetting.orrorsh = decks.orrorsh

    }
    // Add panPacifica Deck
    if (game.cards.getName(decks.panPacifica) == null) {
        const itemId = decks.pack.index.getName(decks.panPacifica)._id;
        game.cards.importFromCompendium(decks.pack, itemId);
        deckSetting.panPacifica = decks.panPacifica

    }
    // Add tharkold Deck
    if (game.cards.getName(decks.tharkold) == null) {
        const itemId = decks.pack.index.getName(decks.tharkold)._id;
        game.cards.importFromCompendium(decks.pack, itemId);
        deckSetting.tharkold = decks.tharkold

    }
    // Add coreEarth Deck
    if (game.cards.getName(decks.coreEarth) == null) {
        const itemId = decks.pack.index.getName(decks.coreEarth)._id;
        game.cards.importFromCompendium(decks.pack, itemId);
        deckSetting.coreEarth = decks.coreEarth

    }
    // Add Cosm Discard
    if (game.cards.getName(decks.cosmDiscard) == null) {
        let cardData = {
            name: decks.cosmDiscard,
            type: "pile",
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        }
        deckSetting.cosmDiscard = decks.cosmDiscard;
        let cosmDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
    }
    // Add Drama Discard
    if (game.cards.getName(decks.dramaDiscard) == null) {
        let cardData = {
            name: decks.dramaDiscard,
            type: "pile",
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        }
        deckSetting.dramaDiscard = decks.dramaDiscard;
        let dramaDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
    }
    // Add Destiny Discard
    if (game.cards.getName(decks.destinyDiscard) == null) {
        let cardData = {
            name: decks.destinyDiscard,
            type: "pile",
            permission: { default: CONST.DOCUMENT_PERMISSION_LEVELS.OWNER }
        };
        deckSetting.destinyDiscard = decks.destinyDiscard;
        let destinyDiscard = Cards.create(cardData, { keepId: true, renderSheet: false });
    }
    // Add Active Drama
    if (game.cards.getName(decks.activeDrama) == null) {
        let cardData = {
            name: decks.activeDrama,
            type: "pile"
        };
        deckSetting.dramaActive = decks.activeDrama;
        let activeDrama = Cards.create(cardData, { keepId: true, renderSheet: false });
    }

    // Add journal entry with instructions relating to cards depending on language
    let journalName = "Managing Cards"
    if (lang == "fr") {
        journalName = "Gestion des cartes"
    }
    if (lang == "de") {
        journalName = "Der Umgang mit Karten in Foundry"
    }

    if (game.journal.getName(journalName) == null) {
        const itemId = basicRulesPack.index.getName(journalName)._id;
        game.journal.importFromCompendium(basicRulesPack, itemId);
    }



    let stormknights = game.actors.filter(act => act.type == "stormknight");
    for (let sk of stormknights) {
        if (!sk.getDefaultHand()) {
            await sk.createDefaultHand();
        }
    }
    game.settings.set("torgeternity", "deckSetting", deckSetting);
    game.settings.set("torgeternity", "setUpCards", false);

}
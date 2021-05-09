export  async function checkCardSupport(){
  // if card support module not installed
  if (!game.modules.get('cardsupport')) {
    new Dialog({
      title: "No card support module",
      content: '<p style="font-size:30px">You should install card support (unofficial) module in order to fully enjoy your Torg Eternity Game</p>',
      buttons: {
        stay: {
          icon: '<i class="fas fa-ban"></i>',
          label: "ok, but i want to stay on this world",
        },
        close: {
            icon: '<i class="fas fa-check"></i>',
            label: "ok, bring me to the Foundry configuration to install card support (unofficial) module",
            callback: () => game.shutDown(true)
          },
      },
      default: "stay"

    }).render(true);

  }
  // if card support not active
  if (game.modules.get('cardsupport') && !game.modules.get('cardsupport').active) {
    new Dialog({
      title: "you should activate card support module",
      content: '<p style="font-size:30px">You should activate card support module in order to fully enjoy your Torg Eternity Game?</p>',
      buttons: {
        yes: {
          icon: '<i class="fas fa-check"></i>',
          label: "Yes",
          callback: () => new ModuleManagement().render(true)

        },
        no: {
            icon: '<i class="fas fa-ban"></i>',
            label: "no thanks",
  
          }
      },
      default: "yes"

    }, {
      top: 300,
    }).render(true);
  }

  //----if card support installed and active
  if (game.modules.get('cardsupport') && game.modules.get('cardsupport').active) {

    //----check settings to display the card installer
    if (game.settings.get("torgeternity", "cardInstaller") == true) {
      let applyChanges = false;
      new Dialog({
        title: "Install Drama Deck?",
        content: '<p style="font-size=30px"> Would you like to install the core Drama Deck in this world?</p>',
        buttons: {
          yes: {
            icon: '<i class="fas fa-check"></i>',
            label: "Yes",
            callback: () => applyChanges = true
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: "No"
          },
          never: {
            icon: '<i class="fas fa-ban"></i>',
            label: "No, don't ask anymore",
            callback: () => {
              game.settings.set("torgeternity", "cardInstaller", false)
            }
          }
        },
        default: "yes",
        close: () => {
          if (applyChanges) {
            installDecks();
            game.settings.set("torgeternity", "cardInstaller", false)

          }
        }
      }).render(true);
    }
  }

  async function installDecks() {
    // Drama Deck
    let dramaDeckBlob = await (await fetch('systems/torgeternity/images/cards/drama-core.zip')).blob();
    let dramaDeckFile = new File([dramaDeckBlob], 'drama-core.zip');
    let dramaDeckImgBlob = await (await fetch('systems/torgeternity/images/cards/drama-back.jpg')).blob();
    let dramaDeckImgFile = new File([dramaDeckImgBlob], 'drama-back.jpg');
    game.decks.create(dramaDeckFile, dramaDeckImgFile);
    // Destiny Deck
    let destinyDeckBlob = await (await fetch('systems/torgeternity/images/cards/destiny-core.zip')).blob();
    let destinyDeckFile = new File([destinyDeckBlob], 'destiny-core.zip');
    let destinyDeckImgBlob = await (await fetch('systems/torgeternity/images/cards/destiny-back.jpg')).blob();
    let destinyDeckImgFile = new File([destinyDeckImgBlob], 'destiny-back.jpg');
    game.decks.create(destinyDeckFile, destinyDeckImgFile);
    // Aysle
    let aysleDeckkBlob = await (await fetch('systems/torgeternity/images/cards/aysle-core-cosm.zip')).blob();
    let aysleDeckkFile = new File([aysleDeckkBlob], 'aysle-core-cosm.zip');
    let aysleDeckkImgBlob = await (await fetch('systems/torgeternity/images/cards/aysle-back.jpg')).blob();
    let aysleDeckkImgFile = new File([aysleDeckkImgBlob], 'aysle-back.jpg');
    game.decks.create(aysleDeckkFile, aysleDeckkImgFile);
    // Cyberpapacy
    let cyberpapacyDeckBlob = await (await fetch('systems/torgeternity/images/cards/cyberpapacy-core-cosm.zip')).blob();
    let cyberpapacyDeckFile = new File([cyberpapacyDeckBlob], 'cyberpapacy-core-cosm.zip');
    let cyberpapacyDeckImgBlob = await (await fetch('systems/torgeternity/images/cards/cyberpapacy-back.jpg')).blob();
    let cyberpapacyDeckImgFile = new File([cyberpapacyDeckImgBlob], 'cyberpapacy-back.jpg');
    game.decks.create(cyberpapacyDeckFile, cyberpapacyDeckImgFile);
    // Cyberpapacy
    let earthDeckBlob = await (await fetch('systems/torgeternity/images/cards/earth-core-cosm.zip')).blob();
    let earthDeckFile = new File([earthDeckBlob], 'earth-core-cosm.zip');
    let earthDeckImgBlob = await (await fetch('systems/torgeternity/images/cards/earth-back.jpg')).blob();
    let earthDeckImgFile = new File([earthDeckImgBlob], 'earth-back.jpg');
    game.decks.create(earthDeckFile, earthDeckImgFile);
    // Living Land
    let livingLandDeckBlob = await (await fetch('systems/torgeternity/images/cards/living-land-core-cosm.zip')).blob();
    let livingLandDeckFile = new File([livingLandDeckBlob], 'living-land-core-cosm.zip');
    let livingLandDeckImgBlob = await (await fetch('systems/torgeternity/images/cards/living-land-back.jpg')).blob();
    let livingLandDeckImgFile = new File([livingLandDeckImgBlob], 'living-land-back.jpg');
    game.decks.create(livingLandDeckFile, livingLandDeckImgFile);
    // Nile Empire
    let nileEmpireBlob = await (await fetch('systems/torgeternity/images/cards/nile-core-cosm.zip')).blob();
    let nileEmpireFile = new File([nileEmpireBlob], 'nile-core-cosm.zip');
    let nileEmpireImgBlob = await (await fetch('systems/torgeternity/images/cards/nile-empire-back.jpg')).blob();
    let nileEmpireImgFile = new File([nileEmpireImgBlob], 'nile-empire-back.jpg');
    game.decks.create(nileEmpireFile, nileEmpireImgFile);
    // Orrorsh
    let orrorshDeckBlob = await (await fetch('systems/torgeternity/images/cards/orrorsh-core-cosm.zip')).blob();
    let orrorshDeckFile = new File([orrorshDeckBlob], 'orrorsh-core-cosm.zip');
    let orrorshDeckImgBlob = await (await fetch('systems/torgeternity/images/cards/orrorsh-back.jpg')).blob();
    let orrorshDeckImgFile = new File([orrorshDeckImgBlob], 'orrorsh-back.jpg');
    game.decks.create(orrorshDeckFile, orrorshDeckImgFile);
    // Pan Pacifica
    let panPacificaBlob = await (await fetch('systems/torgeternity/images/cards/pan-pacifica-core-cosm.zip')).blob();
    let panPacificaFile = new File([panPacificaBlob], 'pan-pacifica-core-cosm.zip');
    let panPacificaImgBlob = await (await fetch('systems/torgeternity/images/cards/pan-pacifica-back.jpg')).blob();
    let panPacificaImgFile = new File([panPacificaImgBlob], 'pan-pacifica-back.jpg');
    game.decks.create(panPacificaFile, panPacificaImgFile);
    // Tharkold
    let tharkoldDeckBlob = await (await fetch('systems/torgeternity/images/cards/tharkold-core-cosm.zip')).blob();
    let tharkoldDeckFile = new File([tharkoldDeckBlob], 'tharkold-core-cosm.zip');
    let tharkoldDeckImgBlob = await (await fetch('systems/torgeternity/images/cards/tharkold-back.jpg')).blob();
    let tharkoldDeckImgFile = new File([tharkoldDeckImgBlob], 'tharkold-back.jpg');
    game.decks.create(tharkoldDeckFile, tharkoldDeckImgFile);
  
  }
  

}
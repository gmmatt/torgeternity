   import GMScreen from './GMScreen.js';
   import deckSettingMenu from './cards/cardSettingMenu.js';

   export default function initTorgControlButtons() {

       //adding layer control for Torg entities
       class torgLayer extends CanvasLayer {
           static get layerOptions() {
               return foundry.utils.mergeObject(super.layerOptions, {
                   name: "Torg",
                   canDragCreate: false,
                   controllableObjects: true,
                   rotatableObjects: true,
                   zIndex: 666,
               });
           }
       }
       CONFIG.Canvas.layers.torgeternity = { layerClass: torgLayer, group: "primary" }

       Hooks.on("getSceneControlButtons", btns => {

           let menu = [{
               name: game.i18n.localize("CARDS.TypeHand"),
               title: game.i18n.localize("CARDS.TypeHand"),
               icon: "fa fa-id-badge",
               button: true,
               onClick: () => {
                   if (game.user.character) {
                       game.user.character.getDefaultHand().sheet.render(true)
                   } else {
                       ui.notifications.error(game.i18n.localize("torgeternity.notifications.noHands"))
                   }
               }
           }];

           if (game.user.isGM) {
               menu.push({
                   name: game.i18n.localize("torgeternity.gmScreen.toggle"),
                   title: game.i18n.localize("torgeternity.gmScreen.toggle"),
                   icon: "fa fa-book-open",
                   button: true,
                   onClick: () => {
                       new GMScreen().render(true)
                   }
               }, {
                   name: game.i18n.localize("torgeternity.settingMenu.deckSetting.name"),
                   title: game.i18n.localize("torgeternity.settingMenu.deckSetting.name"),
                   icon: "fa fa-cog",
                   button: true,
                   onClick: () => {
                       new deckSettingMenu().render(true)
                   }
               })
           }

           btns.push({
               name: "TORG",
               title: "TORG",
               icon: "torg",
               layer: "torgeternity",
               tools: menu
           })


       });


   }
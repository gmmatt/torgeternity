import {torgeternity} from "/systems/torgeternity/module/config.js";

export default class  torgeternityCardConfig extends CardConfig {

  static get defaultOptions() {
        return foundry.utils.mergeObject(super.defaultOptions, {
            classes: ["torgeternity", "sheet", "card-config"],
            width: 480,
            height: "auto",
            tabs: [{navSelector: ".tabs", contentSelector: "form", initial: "details"}],
            sheetConfig: true
              })
    }

    /** @inheritdoc */
    getData(options) {

      return foundry.utils.mergeObject(super.getData(options), {
        types: CONFIG.Card.typeLabels
      });
    }

  /* -------------------------------------------- */
  /* 	Event Listeners and Handlers								*/
  /* -------------------------------------------- */

  /** @inheritdoc */
  activateListeners(html) {
    super.activateListeners(html);
    html.find(".face-control").click(this._onFaceControl.bind(this));
  }

  /* -------------------------------------------- */

  /** @inheritdoc */
  _getSubmitData(updateData) {
    const submitData = foundry.utils.expandObject(super._getSubmitData(updateData));
    submitData.faces = submitData.faces ? Array.from(Object.values(submitData.faces)) : [];
    return submitData;
  }


    get template() {
        
      if (this.object.type === "destiny") {  
        return "systems/torgeternity/templates/cards/torgeternityDestiny.hbs";
      } else if (this.object.type === "cosm") {
        return "systems/torgeternity/templates/cards/torgeternityCosm.hbs"
      } else {
        return "systems/torgeternity/templates/cards/torgeternityDrama.hbs"
      }
    }

    async _onFaceControl(event) {
      const button = event.currentTarget;
      const face = button.closest(".face");
      let faces = [];
  
      // Save any pending change to the form
      await this._onSubmit(event, {preventClose: true, preventRender: true});
  
      // Handle the control action
      switch ( button.dataset.action ) {
        case "addFace":
          faces = this.object.data.faces.map(f => f.object).concat([{}]);
          return this.object.update({faces});
        case "deleteFace":
          return Dialog.confirm({
            title: game.i18n.localize("CARD.FaceDelete"),
            content: `<h4>${game.i18n.localize("AreYouSure")}</h4><p>${game.i18n.localize("CARD.FaceDeleteWarning")}</p>`,
            yes: () => {
              const i = Number(face.dataset.face);
              faces = foundry.utils.deepClone(this.object.data.faces);
              faces.splice(i, 1);
              return this.object.update({faces});
            }
          });
      }
    }

}
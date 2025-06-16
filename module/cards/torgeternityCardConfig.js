/**
 *
 */
export default class torgeternityCardConfig extends foundry.applications.sheets.CardConfig {

  static DEFAULT_OPTIONS = {
    classes: ['torgeternity'],
    position: {
      width: 480,
      height: 'auto',
    },
    tabs: [{ navSelector: '.tabs', contentSelector: 'form', initial: 'details' }],
    sheetConfig: true,
    types: CONFIG.Card.typeLabels,
    actions: {
      "face-control": torgeternityCardConfig._onFaceControl
    }
  }

  static PARTS = {
    destiny: {
      template: 'systems/torgeternity/templates/cards/torgeternityDestiny.hbs'
    },
    cosm: {
      template: 'systems/torgeternity/templates/cards/torgeternityCosm.hbs'
    },
    drama: {
      template: 'systems/torgeternity/templates/cards/torgeternityDrama.hbs'
    }
  }

  /* -------------------------------------------- */
  /* 	Event Listeners and Handlers								*/
  /* -------------------------------------------- */

  /* -------------------------------------------- */

  /** @inheritdoc */
  _getSubmitData(updateData) {
    const submitData = foundry.utils.expandObject(super._getSubmitData(updateData));
    submitData.faces = submitData.faces ? Array.from(Object.values(submitData.faces)) : [];
    return submitData;
  }

  /**
   *
   * @param {Event} event The event object.
   */
  static async _onFaceControl(event) {
    const button = event.srcElement;
    const face = button.closest('.face');
    let faces = [];

    // Save any pending change to the form
    await this.submit({ operation: { render: false } });

    // Handle the control action
    switch (button.dataset.action) {
      case 'addFace':
        faces = this.document.faces.map((f) => f.object).concat([{}]);
        return this.document.update({ faces });
      case 'deleteFace':
        return Dialog.confirm({
          title: game.i18n.localize('CARD.FIELDS.face.labelDelete'),
          content: `<h4>${game.i18n.localize('AreYouSure')}</h4><p>${game.i18n.localize(
            'CARD.FIELDS.face.labelDeleteWarning'
          )}</p>`,
          yes: () => {
            const i = Number(face.dataset.face);
            faces = foundry.utils.deepClone(this.document.faces);
            faces.splice(i, 1);
            return this.document.update({ faces });
          },
        });
    }
  }
}

/**
 *
 */
export default class DeckSettingMenu extends FormApplication {
  /**
   *
   * @param {object} settings - The settings object.
   */
  constructor(settings) {
    super();
    this.settings = game.settings.get('torgeternity', 'deckSetting');
    this.doubledValues = [];
  }
  /**
   *
   * @returns {object} The default options for the setting menu.
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = '/systems/torgeternity/templates/cards/settingMenu.hbs';
    options.top = 300;
    options.title = game.i18n.localize('torgeternity.settingMenu.deckSetting.name');
    options.left = 500;
    options.submitOnChange = true;
    options.editable = true;
    return options;
  }

  /**
   *
   * @returns {object} The data for the setting menu sheet.
   */
  getData() {
    const data = {
      isGM: game.user.isGM,
      deckList: game.cards.contents,
      object: game.settings.get('torgeternity', 'deckSetting'),
      stormknights: game.actors.filter((act) => act.type == 'stormknight'),
      piles: game.cards
        .filter((c) => c.type === 'pile')
        .reduce((acc, pile) => {
          acc[pile.id] = pile.name;
          return acc;
        }, {}),
      decks: game.cards
        .filter((c) => c.type === 'deck')
        .reduce((acc, pile) => {
          acc[pile.id] = pile.name;
          return acc;
        }, {}),
      hands: game.cards
        .filter((c) => c.type === 'hand')
        .reduce((acc, pile) => {
          acc[pile.id] = pile.name;
          return acc;
        }, {}),
    };
    for (const sk of data.stormknights) {
      if (game.settings.get('torgeternity', 'deckSetting').stormknights) {
        data.stormknights[sk.id] = sk.getDefaultHand().id;
      }
    }
    return foundry.utils.mergeObject(super.getData(), data);
  }

  /**
   *
   * @param {HTMLElement} html the html element of the setting menu sheet.
   */
  async activateListeners(html) {
    // checking if doubled values
    this.checkDoubled();
    // changing default deck
    html.find('.selectDeck').change(this.onChangeDeck.bind(this, html));
    // assigning user rights for stormknights owners
    html.find('select.stormknightHand').change(this.onChangeHand.bind(this, html));
    // creating new cards decks or piles or hand
    html.find('button.createCards').click(this.onCreateCards.bind(this));

    // adding hook on for refreshing the display while a card stack is created
    // avoid having to re-open the menu to have new card stack available in selects
    Hooks.on('createCards', (card, options, id) => {
      if (this.rendered) {
        this.render(true);
      }
    });
  }
  /**
   *
   * @param {Event} event The event object.
   * @param {object} formData The form data compiled by foundry.
   */
  _updateObject(event, formData) {
    const data = expandObject(formData);
    game.settings.set('torgeternity', 'deckSetting', data);
  }
  /**
   *
   * @param {Event} event The event object.
   */
  onCreateCards(event) {
    event.preventDefault();
    Cards.createDialog();
  }
  /**
   *
   * @param {HTMLElement} html The html element of the setting menu sheet.
   * @param {Event} event The event object.
   */
  onChangeDeck(html, event) {
    // getting selected value

    // checking if other select/options have same value
    this.checkDoubled();
    // checking if other select are not doubled anymore
    for (const select of html.find('select')) {
      if (this.doubledValues.indexOf(select.options[select.selectedIndex].value) == -1) {
        select.classList.remove('doubled');
      }
    }

    // allowing submit if no doubled value
    if (this.element.find('.doubled').length > 0) {
      this.element.find('button[type="submit"]')[0].disabled = true;
    } else {
      this.element.find('button[type="submit"]')[0].disabled = false;
    }
  }
  /**
   *
   * @param {HTMLElement} html The html element of the setting menu sheet.
   * @param {Event} event The event object.
   */
  onChangeHand(html, event) {
    const actorId = event.currentTarget.getAttribute('name').replace('stormknights.', '');
    const handId = event.currentTarget.options[event.currentTarget.selectedIndex].value;

    const actor = game.actors.get(actorId);
    const hand = game.cards.get(handId);
    const oldHand = actor.getDefaultHand();

    const invalidSelection = html[0]
      .querySelectorAll(`select:not([name="stormknights.${actorId}"])`)
      .values()
      .some((element) =>
        [handId, oldHand.id].includes(element.options[element.selectedIndex].value)
      );

    if (invalidSelection || handId === oldHand.id) {
      return;
    }

    const actorsPerm = actor.getHandOwnership();
    // assigning same permissions from actor to hand
    hand.update({
      ownership: actorsPerm,
      flags: { torgeternity: { defaultHand: actor.id } },
    });
    oldHand.setFlag('torgeternity', 'defaultHand', null);
  }
  /**
   *
   */
  checkDoubled() {
    const selectedValues = [];

    for (const select of this.element.find('select')) {
      const value = select.options[select.selectedIndex].value;
      selectedValues.push(value);
      const valueCount = selectedValues.filter((val) => val == value).length;

      if (valueCount > 1) {
        this.doubledValues.push(value);
      } else {
        if (this.doubledValues.indexOf(value) > -1) {
          this.doubledValues = this.doubledValues.filter((val) => val != value);
        }
      }
    }
    for (const select of this.element.find('select')) {
      const value = select.options[select.selectedIndex].value;
      if (this.doubledValues.indexOf(value) > -1) {
        select.classList.add('doubled');
      } else {
        select.classList.remove('doubled');
      }
    }
  }
}

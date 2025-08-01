import { torgeternity } from '../config.js';

const FATIGUED_FACTION_FLAG = 'fatiguedFaction';
const IS_DRAMATIC_FLAG = 'isDramatic';

/**
 *
 */
export default class TorgCombat extends Combat {


  /**
   *
   * @param data
   * @param options
   * @param userId
   */
  _onCreate(data, options, userId) {
    super._onCreate(data, options, userId);
  }

  async _preDelete(options, user) {
    if (!super._preDelete(options, user)) return false;

    // listing of hands' actors in closing combat
    this.combatants.filter(combatant => combatant.actor?.type === 'stormknight')
      .forEach(combatant => {
        const hand = game.actors.get(combatant.actorId).getDefaultHand();
        // delete the flag that give the pooled condition in each card of each hand
        if (hand) hand.cards.forEach(async card => await card.update({ "system.pooled": false }))
      });

    this.#deleteActiveDefense();
    return true;
  }

  /**
   *
   * @param options
   * @param userId
   */
  _onDelete(options, userId) {
    if (game.user.isActiveGM) {
      this.setCardsPlayable(true);
      const settings = game.settings.get('torgeternity', 'deckSetting');
      const dramaDiscard = game.cards.get(settings.dramaDiscard);
      const dramaActive = game.cards.get(settings.dramaActive);
      // Discard the current Drama Card
      if (dramaDiscard && dramaActive?.cards.size > 0) {
        dramaActive.cards.contents[0].pass(dramaDiscard, game.torgeternity.cardChatOptions);
      }
    }
    super._onDelete(options, userId);
  }

  /**
   *
   * @param changed
   * @param options
   * @param userId
   */
  _onUpdate(changed, options, userId) {
    if (game.user.isGM) {
      const dramaActive = game.cards.get(game.settings.get('torgeternity', 'deckSetting').dramaActive);
      this.setFlag('torgeternity', 'activeCard', (dramaActive.cards.size > 0) ? dramaActive.cards.contents[0].faces[0].img : '');
    }
    super._onUpdate(changed, options, userId);
  }

  get currentDrama() {
    const dramaActive = game.cards.get(game.settings.get('torgeternity', 'deckSetting').dramaActive);
    return dramaActive.cards.size ? dramaActive.cards.contents[0] : null;
  }
  async setIsDramatic(value) {
    const result = await this.setFlag('torgeternity', IS_DRAMATIC_FLAG, value)
    if (!result) return;

    // Update combat effects
    const card = this.currentDrama;
    if (card) this.setDramaEffects(card);
  }

  get isDramatic() {
    return this.getFlag('torgeternity', IS_DRAMATIC_FLAG) ?? false;
  }

  get approvedActions() {
    return this.currentDrama?.system.approvedActions?.split(' ') ?? [];
  }

  get heroCondition() {
    const card = this.currentDrama;
    if (!card) return 'none';
    return this.isDramatic ? card.system.heroesConditionsDramatic : card.system.heroesConditionsStandard;
  }

  get villainCondition() {
    const card = this.currentDrama;
    if (!card) return 'none';
    return this.isDramatic ? card.system.villainsConditionsDramatic : card.system.villainsConditionsStandard;
  }

  get areHeroesFirst() {
    const card = this.currentDrama;
    if (!card) return false;
    return this.isDramatic ? card.system.heroesFirstDramatic : card.system.heroesFirstStandard;
  }

  /**
   * 
   */
  async resetDramaDeck() {
    const dramaDeck = game.cards.get(game.settings.get('torgeternity', 'deckSetting').dramaDeck);
    if (!dramaDeck) return;
    await dramaDeck.recall();
    await dramaDeck.shuffle();
    // Mark no active drama card
    this.setFlag('torgeternity', 'activeCard', '');
    this.setCardsPlayable(true);
  }

  /**
   * Extra work when a drama card is drawn
   */

  async drawDramaCard() {
    const settings = game.settings.get('torgeternity', 'deckSetting');
    const dramaDeck = game.cards.get(settings.dramaDeck);
    const dramaDiscard = game.cards.get(settings.dramaDiscard);
    const dramaActive = game.cards.get(settings.dramaActive);

    // Discard the current Drama Card
    if (dramaDiscard && dramaActive?.cards.size > 0)
      await dramaActive.cards.contents[0].pass(dramaDiscard, game.torgeternity.cardChatOptions);

    if (!dramaDeck?.availableCards.length) {
      ui.notifications.info(game.i18n.localize('torgeternity.notifications.dramaDeckEmpty'));
      return;
    }

    const [card] = await dramaActive.draw(dramaDeck, 1, game.torgeternity.cardChatOptions);
    this.setDramaEffects(card);
  }

  /**
   * Set the effects of the current drama card
   */
  async setDramaEffects(card) {
    //console.log(this.conflictLineText)
    //console.log(`DSR: '${this.dsrText}'   Actions: '${this.approvedActionsText}'`);

    this.setFlag('torgeternity', 'activeCard', card ? card.faces[0].img : '');

    // Sort combatants based on which faction is first
    const whoFirst = (this.isDramatic ? card.system.heroesFirstDramatic : card.system.heroesFirstStandard) ? CONST.TOKEN_DISPOSITIONS.FRIENDLY : CONST.TOKEN_DISPOSITIONS.HOSTILE;
    const updates = [];
    for (const combatant of this.turns) {
      const initiative = (combatant.token.disposition === whoFirst) ? 2 : 1;
      updates.push({ _id: combatant.id, initiative });
    }
    if (updates.length) this.updateEmbeddedDocuments("Combatant", updates, { turnEvents: false });
  }

  get conflictLineText() {
    const card = this.currentDrama;
    if (!card) return "No Drama Card Active";

    const lookup = (a) => game.i18n.localize(torgeternity.dramaConflicts[a]);
    const H = game.i18n.localize('torgeternity.dramaCard.heroesCondition');
    const V = game.i18n.localize('torgeternity.dramaCard.villainsCondition');
    if (this.isDramatic) {
      if (card.system.heroesFirstDramatic)
        return `${game.i18n.localize('torgeternity.dramaCard.dramatic')}: ${H} ${lookup(card.system.heroesConditionsDramatic)}   ${V} ${lookup(card.system.villainsConditionsDramatic)}`
      else
        return `${game.i18n.localize('torgeternity.dramaCard.dramatic')}: ${V} ${lookup(card.system.villainsConditionsDramatic)}   ${H} ${lookup(card.system.heroesConditionsDramatic)}`
    } else {
      if (card.system.heroesFirstStandard)
        return `${game.i18n.localize('torgeternity.dramaCard.standard')}: ${H} ${lookup(card.system.heroesConditionsStandard)}   ${V} ${lookup(card.system.villainsConditionsStandard)}`
      else
        return `${game.i18n.localize('torgeternity.dramaCard.standard')}: ${V} ${lookup(card.system.villainsConditionsStandard)}   ${H} ${lookup(card.system.heroesConditionsStandard)}`
    }
  }

  get approvedActionsText() {
    const card = this.currentDrama;
    if (!card) return "No Drama Card Active";
    return this.approvedActions.map(one => game.i18n.localize(torgeternity.dramaActions[one])).join('/');
  }

  get dsrText() {
    const dsr = this.currentDrama?.system.dsrLine;
    if (!dsr) return "No Drama Card Active";
    const first = dsr.at(0);
    return (first === first.toUpperCase()) ? dsr.split('').join(' ') : game.i18n.localize(torgeternity.dramaActions[dsr]);
  }

  /**
   * 
   */
  async startCombat() {
    // Active GM draws the next available drama card
    if (game.user.isActiveGM) await this.drawDramaCard();
    return super.startCombat();
  }
  /**
   *
   */
  async nextRound() {
    if (!game.user.isActiveGM) return super.nextRound();

    this.drawDramaCard();

    // Perform end-of-faction's turn processing
    await this.nextRoundKeep();

    // deactivate active defense when the combat round is progressed. End of combat is in the hook above, 'deleteCombat'
    await this.#deleteActiveDefense();
  }

  /**
   *
   */
  async nextRoundKeep() {
    await this.updateEmbeddedDocuments('Combatant',
      this.combatants.map((combatant) => ({ _id: combatant.id, 'flags.world.turnTaken': false })),
      { updateAll: true });
    this.setCardsPlayable(true);
    this.unsetFlag('torgeternity', FATIGUED_FACTION_FLAG);
    await super.nextRound();
  }

  /**
   * 
   * @param {*} combatants Passed explicitly, for when called from onDelete
   */
  async #deleteActiveDefense() {
    for (const combatant of this.combatants) {
      const activeDefenseEffect = combatant.actor?.appliedEffects.find((eff) => eff.name === 'ActiveDefense');
      if (activeDefenseEffect) await activeDefenseEffect.delete();
    }
  }


  /*
   * DRAMA DECK HANDLING
   */
  getCombatantFaction(combatant) {
    return (combatant.token.disposition === CONST.TOKEN_DISPOSITIONS.FRIENDLY) ? 'heroes' : 'villains';
  }
  getFactionActors(faction) {
    const disposition = (faction === 'heroes') ? CONST.TOKEN_DISPOSITIONS.FRIENDLY : CONST.TOKEN_DISPOSITIONS.HOSTILE;
    return this.turns.filter(combatant => combatant.token?.disposition === disposition && combatant.actor).map(combatant => combatant.actor);
  }
  setCardsPlayable(value) {
    for (const actor of this.getFactionActors('heroes')) {
      const hand = actor.getDefaultHand();
      // use 'disablePlayCards' so that when the flag is undefined, cards can be played
      if (hand) hand.setFlag('torgeternity', 'disablePlayCards', !value)
    }
  }

  #sendDramaChat(action, faction) {
    ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ alias: game.user.name }),
      content: game.i18n.format(`torgeternity.drama.${action}Desc`,
        { faction: game.i18n.localize(`torgeternity.combat.${faction}`) })
    });
  }

  async dramaFlurry(faction) {
    // extra turn
    console.log('Drama Flurry', faction)
    this.#sendDramaChat('flurry', faction);
  }

  async dramaInspiration(faction) {
    console.log('Drama Inspiration', faction)
    this.#sendDramaChat('inspiration', faction);

    // immediately recover 2 shock (see macros.js:reviveShock)
    let chatOutput = `<h2>${game.i18n.localize(
      'torgeternity.macros.reviveMacroChatHeadline'
    )}</h2><p>${game.i18n.localize('torgeternity.macros.reviveMacroFirst')}<p><ul>`;

    for (const actor of this.getFactionActors(faction)) {
      const shock = actor.system.shock.value;
      if (shock === 0) continue;
      const reviveAmount = Math.min(shock, 2);
      await actor.update({ 'system.shock.value': shock - reviveAmount });
      chatOutput += `<li>${actor.name} ${game.i18n.localize('torgeternity.macros.reviveMacroCharPartyRevived')}${reviveAmount}`;
      if (actor.hasStatusEffect('unconscious')) {
        actor.toggleStatusEffect('unconscious', { active: false });
        chatOutput += `<br>${game.i18n.localize('torgeternity.macros.reviveMacroCharDeKOed')} ${actor.name}`;
      }
      chatOutput += '</ul>';
    }
    ChatMessage.create({ content: chatOutput });
  }

  async dramaUp(faction) {
    // UP on first roll for each actor
    console.log('Drama Up', faction)
    this.#sendDramaChat('up', faction);
  }

  async dramaConfused(faction) {
    // unable to play Cards from their pool
    console.log('Drama Confused', faction)
    this.setCardsPlayable(false);
    this.#sendDramaChat('confused', faction);
  }

  async dramaFatigued(faction) {
    // At the end of an Actor's turn, they take 2 points of shock
    console.log('Drama Fatigued', faction)
    this.setFlag('torgeternity', FATIGUED_FACTION_FLAG, faction);
    this.#sendDramaChat('fatigued', faction);
  }

  async dramaSetback(faction) {
    // GM decides a likely setback
    console.log('Drama Setback', faction)
    this.#sendDramaChat('setback', faction);
  }

  async dramaStymied(faction) {
    // All Actors become Stymied until the end of their next turn
    console.log('Drama Stymied', faction)
    this.#sendDramaChat('surge');
    for (const actor of this.getFactionActors(faction))
      actor.applyStymiedState('stymied', faction);
  }

  async dramaSurge(faction) {
    // All Actors must check for Contradictions
    console.log('Drama Surge', faction)
    this.#sendDramaChat('surge', faction);
  }

  /**
   * General end-of-character turn processing
   */
  dramaEndOfTurn(combatant) {
    if (this.getFlag('torgeternity', FATIGUED_FACTION_FLAG) === this.getCombatantFaction(combatant)) {
      const actor = combatant.actor;
      if (!actor) return;

      let chatOutput = `<h2>${game.i18n.localize(
        'torgeternity.sheetLabels.fatigue'
      )}!</h2><p>${game.i18n.localize('torgeternity.macros.fatigueMacroDealtDamage')}</p><ul>`;

      if (actor.hasStatusEffect('unconscious')) {
        chatOutput += `<li>${actor.name} ${game.i18n.localize('torgeternity.macros.fatigueMacroCharAlreadyKO')}</li>`;
      }

      const shockIncrease = actor.fatigue;
      const applyResult = actor.applyDamages(/*shock*/ shockIncrease, /*wounds*/ 0);

      chatOutput += `<li>${actor.name}: ${shockIncrease} ${game.i18n.localize('torgeternity.sheetLabels.shock')}`;
      if (applyResult.shockExceeded) {
        chatOutput += `<br><strong>${actor.name}${game.i18n.localize('torgeternity.macros.fatigueMacroCharKO')}</strong>`;
      }
      chatOutput += '</li>';

      chatOutput += '</ul>';
      ChatMessage.create({ content: chatOutput });
    }
  }
  /**
   * Restore the previous Drama Card
   */
  async restorePreviousDrama() {
    if (!game.user.isGM) return;

    const settings = game.settings.get('torgeternity', 'deckSetting');
    const dramaDeck = game.cards.get(settings.dramaDeck);
    const dramaDiscard = game.cards.get(settings.dramaDiscard);
    const dramaActive = game.cards.get(settings.dramaActive);
    if (!dramaDeck || !dramaDiscard || !dramaActive) return;

    const currActiveCard = Array.from(dramaActive.cards).pop();
    const prevActiveCard = Array.from(dramaDiscard.cards).pop();
    // Ignore game.torgeternity.cardChatOptions, since no explicit chat message sent here
    await currActiveCard.pass(dramaDeck);
    await prevActiveCard.pass(dramaActive);

    // Cancel effects from previous card (if any)
    await this.setDramaEffects(prevActiveCard);
  }
}
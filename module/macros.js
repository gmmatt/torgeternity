import * as torgchecks from '/systems/torgeternity/module/torgchecks.js';
import { TestDialog } from '/systems/torgeternity/module/test-dialog.js';

const { DialogV2 } = foundry.applications.api;

/**
 *
 */
export class TorgeternityMacros {
  /**
   *
   */
  async clearStatusEffects() {
    try {
      const tokens = canvas.tokens.controlled;
      if (!game.user.isGM) {
        throw new Error(game.i18n.localize('torgeternity.macros.commonMacroOnlyByGM'));
      } else if (tokens.length === 0) {
        throw new Error(game.i18n.localize('torgeternity.macros.commonMacroNoTokensSelected'));
      }

      let chatOutput = `<p>${game.i18n.localize(
        'torgeternity.macros.clearStatusEffectsHeadline'
      )}</p><ul>`;

      for (const token of tokens) {
        const effects = token.actor.statuses;

        for (const effect of effects) {
          switch (effect) {
            case 'stymied':
            case 'veryStymied':
            case 'vulnerable':
            case 'veryVulnerable':
              await token.actor.toggleStatusEffect(effect, { active: false });
              chatOutput += `<li>${game.i18n.localize(
                'torgeternity.macros.clearStatusEffectsliftetFrom'
              )} ${token.actor.name} ${game.i18n.localize(
                'torgeternity.macros.clearStatusEffectsliftetStatusOf'
              )} ${game.i18n.localize('torgeternity.statusEffects.' + effect)}</li>`;
              break;
            default:
              continue;
          }
        }
      }

      if (!chatOutput.includes('<li>')) {
        chatOutput = game.i18n.localize('torgeternity.macros.clearStatusEffectsNothingFound');
      } else {
        chatOutput += '</ul>';
      }

      ChatMessage.create({ content: chatOutput });
    } catch (e) {
      ui.notifications.error(e.message);
    }
  }

  /**
   *
   */
  async applyFatigue() {
    const tokens = canvas.tokens.controlled;

    if (tokens.length === 0) {
      ui.notifications.error(game.i18n.localize('torgeternity.macros.commonMacroNoTokensSelected'));
      return;
    }
    let chatOutput = `<h2>${game.i18n.localize(
      'torgeternity.sheetLabels.fatigue'
    )}!</h2><p>${game.i18n.localize('torgeternity.macros.fatigueMacroDealtDamage')}</p><ul>`;
    for (const token of tokens) {
      if (token === undefined) {
        throw new Error('Exception, token is undefined');
      }

      if (token.actor.system.shock.value === token.actor.system.shock.max) {
        chatOutput += `<li>${token.actor.name} ${game.i18n.localize(
          'torgeternity.macros.fatigueMacroCharAlreadyKO'
        )}</li>`;
        continue;
      }

      const targetShockValue = token.actor.system.shock.value;

      const shockIncrease = token.actor.fatigue;

      const shockResult =
        targetShockValue + shockIncrease >= token.actor.system.shock.max
          ? token.actor.system.shock.max
          : targetShockValue + shockIncrease;

      await token.actor.update({ 'system.shock.value': shockResult });
      chatOutput += `<li>${token.document.name}: ${shockIncrease} ${game.i18n.localize(
        'torgeternity.sheetLabels.shock'
      )}`;
      if (
        parseInt(token.actor.system.shock.value) >= parseInt(token.actor.system.shock.max) &&
        !token.document.hasStatusEffect('unconscious')
      ) {
        token.actor.toggleStatusEffect('unconscious', { active: true, overlay: true });
        chatOutput += `<br><strong>${token.document.name}${game.i18n.localize(
          'torgeternity.macros.fatigueMacroCharKO'
        )}</strong>`;
      }
      chatOutput += '</li>';
    }
    chatOutput += '</ul>';

    ChatMessage.create({ content: chatOutput });
  }
  // #region Revive Shock
  /**
   *
   */
  async reviveShock() {

    const fields = foundry.applications.fields;
    const shockGroup = fields.createFormGroup({
      label: game.i18n.localize('torgeternity.macros.reviveMacroWindowLabel1'),
      input: fields.createNumberInput({ name: 'inputValue' }),
    });
    const checkGroup = fields.createFormGroup({
      label: game.i18n.localize('torgeternity.macros.reviveMacroWholeRevive'),
      input: fields.createCheckboxInput({ name: 'wholeRevive' }),
    });

    DialogV2.wait({
      window: { title: 'torgeternity.macros.reviveMacroChatHeadline', },
      content: `${shockGroup.outerHTML}${checkGroup.outerHTML}`,
      buttons: [
        {
          action: 'execute',
          label: 'torgeternity.dialogWindow.buttons.execute',
          callback: game.torgeternity.macros._processReviveShock,
          default: true
        },
      ],
    });
  }

  /**
   *
   * @param html
   */
  async _processReviveShock(event, button, dialog) {
    try {
      const tokens = canvas.tokens.controlled;

      const formElement = dialog.element.querySelector('form');
      const formData = new foundry.applications.ux.FormDataExtended(formElement);
      const bolWholeRevive = formData.object.wholeRevive;
      const reviveAmount = parseInt(formData.object.inputValue);

      if (tokens.length === 0) {
        throw new Error(game.i18n.localize('torgeternity.macros.commonMacroNoTokensSelected'));
      } else if (bolWholeRevive === false && isNaN(reviveAmount)) {
        throw new Error(game.i18n.localize('torgeternity.macros.reviveMacroError1'));
      }

      let chatOutput = `<h2>${game.i18n.localize(
        'torgeternity.macros.reviveMacroChatHeadline'
      )}</h2><p>${game.i18n.localize('torgeternity.macros.reviveMacroFirst')}<p><ul>`;

      for (const token of tokens) {
        // Following block, if a token has a null-value in system.shock.value (happens, if a value is simply deleted by user to set it apperently to 0), set it to 0, but double check it!
        if (isNaN(token.actor.system.shock.value)) {
          await token.actor.update({ 'system.shock.value': 0 });
        }
        const targetShockValue = parseInt(token.actor.system.shock.value);
        if (isNaN(targetShockValue)) {
          throw new Error('Shock Value is NaN');
        }

        if (targetShockValue === 0) {
          chatOutput += `<li>${token.actor.name} ${game.i18n.localize('torgeternity.macros.reviveMacroAlreadyFull')}</li>`;
          continue;
        }

        if (bolWholeRevive) {
          await token.actor.update({ 'system.shock.value': 0 });
          chatOutput += `<li>${token.actor.name} ${game.i18n.localize('torgeternity.macros.reviveMacroCharRevived')}`;
        } else {
          const newShockValue = parseInt(targetShockValue) - reviveAmount;
          await token.actor.update({ 'system.shock.value': newShockValue });
          chatOutput += `<li>${token.actor.name} ${game.i18n.localize('torgeternity.macros.reviveMacroCharPartyRevived')}${reviveAmount}`;
        }

        if (token.document.hasStatusEffect('unconscious')) {
          token.actor.toggleStatusEffect('unconscious', { active: false, overlay: false });
          chatOutput += `<br>${game.i18n.localize('torgeternity.macros.reviveMacroCharDeKOed')} ${token.actor.name}`;
        }
        chatOutput += '</li>';
      }
      chatOutput += '</ul>';

      ChatMessage.create({ content: chatOutput });
    } catch (e) {
      ui.notifications.error(e.message);
    }
  }
  // #endregion
  // #region Roll BDs
  /**
   *
   */
  async rollBDs() {

    const fields = foundry.applications.fields;
    const inputGroup = fields.createFormGroup({
      label: game.i18n.localize('torgeternity.macros.bonusDieMacroContent'),
      input: fields.createNumberInput({ name: 'inputValue' }),
    });

    DialogV2.wait({
      window: { title: 'torgeternity.macros.bonusDieMacroTitle', },
      content: inputGroup.outerHTML,
      buttons: [
        {
          action: 'buttonRoll`',
          label: game.i18n.localize('torgeternity.sheetLabels.roll') + '!',
          callback: game.torgeternity.macros._rollItBDs,
          default: true
        },
      ],
    });
  }

  /**
   *
   * @param html
   */
  async _rollItBDs(event, button, dialog) {
    try {
      const formElement = dialog.element.querySelector('form');
      const formData = new foundry.applications.ux.FormDataExtended(formElement);
      const diceAmount = parseInt(formData.object.inputValue);

      if (isNaN(diceAmount)) {
        ui.notifications.error(game.i18n.localize('torgeternity.macros.commonMacroNoValue'));
        return;
      }

      const diceroll = await new Roll(`${diceAmount}d6x6max5`).evaluate();

      await game.dice3d?.showForRoll(diceroll);

      let chatOutput = `<p>${game.i18n.localize(
        'torgeternity.macros.bonusDieMacroResult1'
      )} ${diceAmount} ${game.i18n.localize(
        'torgeternity.chatText.bonusDice'
      )} ${game.i18n.localize('torgeternity.macros.bonusDieMacroResult2')} ${diceroll.total}.</p>`;

      const targetedTokens = Array.from(game.user.targets);

      if (targetedTokens.size === 0) {
        chatOutput += `<p>${game.i18n.localize(
          'torgeternity.macros.bonusDieMacroNoTokenTargeted'
        )}</p>`;
        console.log('No targets, creating chat Message, leaving Macro.');
        ChatMessage.create({ content: chatOutput });
        return;
      }
      chatOutput += `<ul>`;
      for (const token of targetedTokens) {
        const tokenDamage = torgchecks.torgDamage(diceroll.total, token.actor.defenses.toughness);
        if (tokenDamage.shocks > 0) {
          chatOutput += `<li>${game.i18n.localize('torgeternity.macros.bonusDieMacroResult3')} ${token.document.name
            } ${game.i18n.localize('torgeternity.macros.bonusDieMacroResult4')} ${tokenDamage.label
            }.</li>`;
        } else {
          chatOutput += `<li>${game.i18n.localize('torgeternity.macros.bonusDieMacroResult3')} ${token.document.name
            } ${game.i18n.localize('torgeternity.macros.bonusDieMacroResultNoDamage')}.</li>`;
        }
      }
      chatOutput += '</ul>';

      ChatMessage.create({ content: chatOutput });
    } catch (e) {
      ui.notifications.error(e.message);
    }
  }

  // Show next 1-3 drama cards to a selection of players (much of this code is stolen in others macros)
  async dramaVision() {
    if (!game.user.isGM) return;

    if (!game.combats.viewed?.round) {
      return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noFight'));
    }

    const users = game.users.filter((user) => user.active && !user.isGM);
    let checkOptions = '';
    const playerTokenIds = users.map((u) => u.character?.id).filter((id) => id !== undefined);
    const selectedPlayerIds = canvas.tokens.controlled.map((token) => {
      if (playerTokenIds.includes(token.actor.id)) return token.actor.id;
    });

    if (users.length === 0) {
      return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noPlayers'));
    }

    // Build checkbox list for all active players
    const fields = foundry.applications.fields;
    users.forEach((user) => {
      const checkbox =
        fields.createFormGroup({
          label: user.name,
          input: fields.createCheckboxInput({
            name: user.id,
            //value: user.name,
            value: !!user.character && selectedPlayerIds.includes(user.character.id)
          })
        });
      checkOptions += `<br>${checkbox.outerHTML}`;
    });

    // Choose the nb of cards to show
    const numCards = await DialogV2.wait({
      window: { title: 'torgeternity.dialogWindow.showingDramaCards.nbCards', },
      content: game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.nbCardsValue'),
      buttons: [
        { action: "1", label: "1", },
        { action: "2", label: "2", },
        { action: "3", label: "3", },
      ],
    });

    const setting = game.settings.get('torgeternity', 'deckSetting');
    // Find the Drama Deck
    const dramaDeck = game.cards.get(setting.dramaDeck);
    // Find ?? the index of the Active Drama Card in the Drama Deck
    const activeDeck = game.cards.get(setting.dramaActive);
    const cardSort = (activeDeck.cards.size === 0) ? dramaDeck.size :
      dramaDeck.cards.get(activeDeck._source.cards[0]._id).sort + 1;

    DialogV2.wait({
      window: { title: 'torgeternity.dialogWindow.showingDramaCards.recipient', },
      content: `${game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.whisper')} ${checkOptions} <br>`,
      buttons: [
        {
          action: "whisper",
          label: 'torgeternity.dialogWindow.showingDramaCards.apply',
          callback: (event, button, dialog) => {
            const targets = [];
            // build list of selected players ids for whispers target
            for (const user of users) {
              if (dialog.element.querySelector(`[name="${user.id}"]`).checked) {
                targets.push(user.id);
              }
            }
            if (!targets.length) return;
            let msg = {
              whisper: targets,
              content: `<div class="card-draw flexcol">${game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.show')}`
            };
            for (let j = 0; j < numCards; j++) {
              const card = dramaDeck.cards.find(card => card.sort === cardSort + j);
              if (!card) {
                ui.notifications.warn(game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.noMoreCards'));
                break;;
              }
              msg.content +=
                `<div class="card-draw flexrow">
                <span class="card-chat-tooltip"><img class="card-face" src="${card.img}"/>
                <span><img src="${card.img}"></span></span>
                <span class="card-name">${card.name}</span>
                </div>`;
            };
            msg.content += `</div>`;
            ChatMessage.create(msg);
          }
        }
      ],
    });
  }

  async dramaFlashback() {
    if (!game.user.isGM) {
      return;
    }
    const dramaDeck = game.cards.get(game.settings.get('torgeternity', 'deckSetting').dramaDeck);
    const dramaDiscard = game.cards.get(
      game.settings.get('torgeternity', 'deckSetting').dramaDiscard
    );
    const dramaActive = game.cards.get(
      game.settings.get('torgeternity', 'deckSetting').dramaActive
    );
    const restoreOldActive = Array.from(dramaDiscard.cards).pop();
    const removeActiveCard = Array.from(dramaActive.cards).pop();
    removeActiveCard.pass(dramaDeck);
    restoreOldActive.pass(dramaActive);
    const activeImage = restoreOldActive.faces[0].img;
    game.combats.active.setFlag('torgeternity', 'activeCard', activeImage);
  }

  // #endregion
  /**
   *
   */
  async reconnection() {
    const _token = canvas.tokens.controlled[0];
    const _actor = _token?.actor;

    if (!_actor) {
      ui.notifications.error(game.i18n.localize('torgeternity.macros.commonMacroNoTokensSelected'));
      return;
    }
    const realitySkill = _actor.system.skills.reality;

    if (!_token.document.hasStatusEffect('disconnected')) {
      ui.notifications.error(game.i18n.localize('torgeternity.macros.bonusDieMacroNoDiscon'));
      return;
    }

    const difficultyRecon = {
      pure: -8,
      dominant: -4,
      mixed: 0,
    };

    const test = {
      actor: _actor.uuid,
      actorPic: _actor.img,
      actorName: _actor.name,
      actorType: _actor.type,
      skillName: 'reality',
      testType: 'skill',
      skillBaseAttribute: 'spirit',
      skillAdds: realitySkill.adds,
      skillValue: realitySkill.value,
      isAttack: false,
      isFav: realitySkill.isFav,
      targets: Array.from(game.user.targets),
      applySize: false,
      DNDescriptor: 'standard',
      attackOptions: false,
      rollTotal: 0,
      unskilledUse: realitySkill.unskilledUse,
      chatnote: '',
      woundModifier: -_actor.system.wounds.value,
      stymiedModifier: _actor.statusModifiers.stymied,
      vulnerableModifier: _actor.statusModifiers.vulnerable,
      darknessModifier: _actor.statusModifiers.darkness,
      type: 'skill',
      movementModifier: 0,
      isOther1: game.scenes.active.flags.torgeternity.cosm == 'none' ? false : true,
      other1Description: game.i18n.localize('torgeternity.macros.reconnectMacroZoneModifier'),
      other1Modifier: difficultyRecon[game.scenes.active.flags.torgeternity.zone],
    };

    if (test.isother1 === false) {
      await DialogV2.prompt({
        window: { title: 'torgeternity.macros.reconnectMacroZoneModifierNotDetectedTitle' },
        content: `<p>${game.i18n.localize('torgeternity.macros.reconnectMacroZoneModifierNotDetected')}</p>`,
      });
    }

    const dialog = await TestDialog.asPromise(test);

    if (!dialog) {
      ui.notifications.error(
        game.i18n.localize('torgeternity.macros.commonMacroNoChatMessageFound')
      );
      return;
    }

    switch (dialog.flags.torgeternity.test.resultText) {
      case game.i18n.localize('torgeternity.chatText.check.result.standartSuccess'):
      case game.i18n.localize('torgeternity.chatText.check.result.goodSuccess'):
      case game.i18n.localize('torgeternity.chatText.check.result.outstandingSuccess'):
        await _actor.toggleStatusEffect('disconnected', { active: false, overlay: false });
        ui.notifications.info(
          `${game.i18n.localize('torgeternity.macros.reconnectMacroStatusLiftet')}</p>`
        );
        break;
      case game.i18n.localize('torgeternity.chatText.check.result.failure'):
        // ChatMessage.create({content: "<p>Fehlschlag</p>"});
        break;
      case game.i18n.localize('torgeternity.chatText.check.result.mishape'):
        break;
    }
  }

  async openPacks() {
    for (const pack of game.packs) {
      if (pack.value?.metadata.packageName === 'torgeternity') {
        continue;
      }
      await pack.configure({ locked: false });
      const uuids = pack.index.map((i) => i.uuid);

      for (const uuid of uuids) {
        const doc = await fromUuid(uuid);
        const data = doc.toObject();
        await doc.delete();
        console.warn('Deleted', doc.name);
        await doc.constructor.create(data, { keepId: true, pack: pack.collection });
        console.warn('Recreated', doc.name);
      }
      await pack.configure({ locked: true });
    }
    ui.notifications.info('Migration complete!');
  }

  /**
   *
   */
  async deleteAllHands() {
    for (const card of game.cards) {
      card.type === 'hand' ? await card.delete() : console.log('no hand');
    }
  }

  // If you need to cancel a card a player just played
  // works if the card to get back is the last message in ChatLog, and if player owns only one hand
  async playerPlayback() {
    if (!game.user.isGM) {
      return;
    }
    const users = game.users.filter((user) => user.active && !user.isGM);
    let checkOptions = '';
    const playerTokenIds = users.map((u) => u.character?.id).filter((id) => id !== undefined);
    const selectedPlayerIds = canvas.tokens.controlled.map((token) => {
      if (playerTokenIds.includes(token.actor.id)) return token.actor.id;
    });

    // Build checkbox list for all active players
    const fields = foundry.applications.fields;
    users.forEach((user) => {
      const checkbox =
        fields.createFormGroup({
          label: user.name,
          input: fields.createCheckboxInput({
            name: user.id,
            //value: user.name,
            value: !!user.character && selectedPlayerIds.includes(user.character.id)
          })
        });
      checkOptions += `<br>${checkbox.outerHTML}`;
    });

    DialogV2.wait({
      window: { title: 'torgeternity.dialogWindow.cardRetour.cardBack', },
      content: `${game.i18n.localize('torgeternity.dialogWindow.cardRetour.cardOwner')} ${checkOptions} <br>`,
      buttons: [
        {
          action: 'whisper',
          label: 'torgeternity.dialogWindow.showingDramaCards.apply',
          callback: (event, button, dialog) => createMessage(event, button, dialog),
        },
      ],
    });

    function createMessage(event, button, dialog) {
      let target;
      // build list of selected players ids for whispers target
      for (const user of users) {
        if (dialog.element.querySelector(`[name="${user.id}"]`).checked) {
          target = user;
        }
      }
      if (target) {
        const userid = target.id;
        const destinyDiscard = game.cards.get(game.settings.get('torgeternity', 'deckSetting').destinyDiscard);
        const lastCard = destinyDiscard.cards.contents.pop();
        if (!astCard) return;
        const parentHand = target.character.getDefaultHand();
        const found = game.messages.contents.filter(m => m.user.id === userid);
        if (!found.length) return;
        const lastMessage = found.pop();
        lastCard.pass(parentHand);
        ChatMessage.deleteDocuments([lastMessage.id]);
      }
    }
  }

  // create effects related with your choice, Defense/specific Attribute/All attributes
  // if any value change (attribute or add or limitation) erase the effects and redo it
  async torgBuff() {
    if (game.canvas.tokens.controlled.length === 0 && !game.user.character) {
      ui.notifications.error(game.i18n.localize('torgeternity.notifications.noTokenNorActor'));
      return;
    }
    // Choose the attribute you want to modify
    const attr = await DialogV2.wait({
      window: { title: 'torgeternity.dialogWindow.buffMacro.choice', },
      content: game.i18n.localize('torgeternity.dialogWindow.buffMacro.choose'),
      buttons: [
        { action: 'mind', label: 'torgeternity.attributes.mind', },
        { action: 'strength', label: 'torgeternity.attributes.strength', },
        { action: 'charisma', label: 'torgeternity.attributes.charisma', },
        { action: 'spirit', label: 'torgeternity.attributes.spirit', },
        { action: 'dexterity', label: 'torgeternity.attributes.dexterity', },
        { action: 'all', label: 'torgeternity.dialogWindow.buffMacro.allAttributes', },
        { action: 'physicalDefense', label: 'torgeternity.dialogWindow.buffMacro.physicalDefenses', },
        { action: 'defense', label: 'torgeternity.sheetLabels.defenses', },
        { action: 'cancel', label: 'torgeternity.dialogWindow.buffMacro.cancelEffects', },
      ],
    });

    if (attr === 'cancel') {
      ui.notifications.warn('MacroEffects removed');
      for (const token of game.canvas.tokens.controlled && game.user.character) {
        const delEffects = token.effects
          .filter((e) => e.name.includes('rd(s)'))
          .filter((e) => e.name.includes(' / '));
        delEffects.forEach((e) => e.delete());
      }
      return;
    }

    // choose the bonus you expect
    const bonus = await DialogV2.wait({
      window: { title: 'torgeternity.dialogWindow.buffMacro.bonusTitle', },
      content: `<div>${game.i18n.localize(
        'torgeternity.dialogWindow.buffMacro.value'
      )} <input name="bonu" value=1 style="width:50px"/></div>`,
      buttons: [
        {
          action: '1',
          label: 'torgeternity.dialogWindow.showingDramaCards.apply',
          callback: (event, button, dialog) => parseInt(dialog.element.querySelector('[name=bonu]').value)
        },
      ],
    });

    // choose the duration of the effect
    const duration = await DialogV2.wait({
      window: { title: 'torgeternity.dialogWindow.buffMacro.timeLabel' },
      content: `<div>${game.i18n.localize('torgeternity.dialogWindow.buffMacro.time')} <input name="dur" value=1 style="width:50px"/></div>`,
      buttons: [
        {
          action: '1',
          label: game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.apply'),
          callback: (event, button, dialog) => parseInt(dialog.element.querySelector('[name=dur]').value)
        },
      ],
    });

    let newEffect = {};

    if (attr === 'defense') {
      // only Defenses, but ALL defenses
      newEffect = {
        name: `${game.i18n.localize('torgeternity.dialogWindow.buffMacro.defenses')} / ${bonus} / ${duration} rd(s)`,
        duration: { rounds: duration, turns: duration },
        changes: [
          {
            key: 'system.dodgeDefenseMod',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.meleeWeaponsDefenseMod',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.unarmedCombatDefenseMod',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.intimidationDefenseMod',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.maneuverDefenseMod',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.tauntDefenseMod',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.trickDefenseMod',
            value: bonus,
            mode: 2,
          },
        ],
        disabled: false,
      };
      // Aspect modifications related to bonus/malus
      newEffect.tint = bonus < 0 ? '#ff0000' : '#00ff00';
      newEffect.icon = bonus < 0 ? 'icons/svg/downgrade.svg' : 'icons/svg/upgrade.svg';
    } // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    else if (attr === 'physicalDefense') {
      // only physical Defenses
      newEffect = {
        name:
          game.i18n.localize('torgeternity.dialogWindow.buffMacro.physicalDefenses') +
          ' / ' +
          bonus +
          ' / ' +
          duration +
          'rd(s)',
        duration: { rounds: duration, turns: duration },
        changes: [
          {
            key: 'system.dodgeDefenseMod',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.meleeWeaponsDefenseMod',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.unarmedCombatDefenseMod',
            value: bonus,
            mode: 2,
          },
        ],
        disabled: false,
      };
      // Aspect modifications related to bonus/malus
      newEffect.tint = bonus < 0 ? '#ff0000' : '#00ff00';
      newEffect.icon = bonus < 0 ? 'icons/svg/downgrade.svg' : 'icons/svg/upgrade.svg';
    } // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    else if (attr === 'all') {
      // preparation of attribute effect
      newEffect = {
        name:
          game.i18n.localize('torgeternity.dialogWindow.buffMacro.allAttributes') +
          ' / ' +
          bonus +
          ' / ' +
          duration +
          'rd(s)',
        duration: { rounds: duration, turns: duration },
        changes: [
          {
            key: 'system.attributes.mind.value',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.attributes.spirit.value',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.attributes.strength.value',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.attributes.dexterity.value',
            value: bonus,
            mode: 2,
          },
          {
            key: 'system.attributes.charisma.value',
            value: bonus,
            mode: 2,
          },
        ],
        disabled: false,
      };
      // Aspect modifications related to bonus/malus
      newEffect.tint = bonus < 0 ? '#ff0000' : '#00ff00';
      newEffect.icon = bonus < 0 ? 'icons/svg/downgrade.svg' : 'icons/svg/upgrade.svg';
    } else {
      // One attribute
      // preparation of attribute effect
      newEffect = {
        name:
          game.i18n.localize('torgeternity.attributes.' + attr) +
          ' / ' +
          bonus +
          ' / ' +
          duration +
          'rd(s)',
        duration: { rounds: duration, turns: duration },
        changes: [
          {
            key: 'system.attributes.' + attr + '.value',
            value: bonus,
            mode: 2,
          },
        ],
        disabled: false,
      };

      // Aspect modifications related to bonus/malus
      newEffect.tint = bonus < 0 ? '#ff0000' : '#00ff00';
      newEffect.icon = bonus < 0 ? 'icons/svg/downgrade.svg' : 'icons/svg/upgrade.svg';
    }
    const actors = [];
    if (game.canvas.tokens.controlled.length > 0) {
      for (const token of game.canvas.tokens.controlled) {
        actors.push(token.actor);
      }
    } else {
      actors.push(game.user.character);
    }

    for (const actor of actors) {
      await actor?.createEmbeddedDocuments('ActiveEffect', [newEffect]);
    }
  }

  /**
   * Applies damage on targeted tokens
   *
   * @param {string} source A description of the source the damage comes from
              * @param {number} value The actual damage value
              * @param {number} bds The number of Bonus Dice that ought to take place.
              * @param {boolean} armored Does armor count?
              * @param {number} ap The amount of armor piercing.
              * @returns {null} no Value
              */
  async periculum(source = '', value = 10, bds = 0, armored = false, ap = 0) {
    const victims = Array.from(game.user.targets);
    if (armored) armored = 'checked';
    if (!(victims.length > 0))
      return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));

    // add options for AP and bypass the window

    const info = await DialogV2.prompt({
      window: { title: 'Periculum' },
      content: `
              <label>${game.i18n.localize(
        'torgeternity.macros.periculumSourceName'
      )}<br><input placeholder=${game.i18n.localize(
        'torgeternity.macros.periculumSourcePlaceHolder'
      )} style="color:black" name="source" type="string" value="${source}"></label>
                  <label>${game.i18n.localize(
        'torgeternity.macros.periculumDamageValue'
      )}<input name="damageBase" type="number" value=${value} autofocus style="width:35px"></label>
                  <label>${game.i18n.localize(
        'torgeternity.macros.periculumBds'
      )}<input name="plusBD" type="number" value=${bds} style="width:35px"></label>
                  <label>${game.i18n.localize(
        'torgeternity.macros.periculumArmor'
      )}<input name="armor" type="checkbox" ${armored}></label>
                  <label>${game.i18n.localize(
        'torgeternity.macros.periculumAp'
      )}<input name="ap" type="number" style="width:35px" value=${ap}></label>
                  `,
      ok: {
        label: game.i18n.localize('torgeternity.dialogWindow.buttons.execute'), // 'Submit Effect',
        callback: (event, button, dialog) => [
          button.form.elements.source.value,
          button.form.elements.damageBase.valueAsNumber,
          button.form.elements.plusBD.value,
          button.form.elements.armor.checked,
          button.form.elements.ap.value,
        ],
      },
    });

    const allID = victims.map((victim) => victim.actor.id);
    const allUUID = victims.map((victim) => victim.document.uuid);
    const targetAll = [];

    for (const victim of victims) {
      const { actor } = victim;
      // Set vehicle defense if needed
      if (actor.type === 'vehicle') {
        targetAll.push({
          present: true,
          type: 'vehicle',
          id: actor.id,
          uuid: victim.document.uuid,
          targetPic: actor.img,
          targetName: actor.name,
          defenses: {
            vehicle: actor.system.defense,
            dodge: actor.system.defense,
            unarmedCombat: actor.system.defense,
            meleeWeapons: actor.system.defense,
            intimidation: actor.system.defense,
            maneuver: actor.system.defense,
            taunt: actor.system.defense,
            trick: actor.system.defense,
          },
          toughness: actor.defenses.toughness,
          armor: actor.defenses.armor,
        });
      } else {
        targetAll.push({
          present: true,
          type: actor.type,
          id: actor.id,
          uuid: victim.document.uuid,
          targetPic: actor.img,
          targetName: actor.name,
          skills: actor.system.skills,
          attributes: actor.system.attributes,
          toughness: actor.defenses.toughness,
          armor: actor.defenses.armor,
          defenses: {
            dodge: actor.defenses.dodge.value,
            unarmedCombat: actor.defenses.unarmedCombat.value,
            meleeWeapons: actor.defenses.meleeWeapons.value,
            intimidation: actor.defenses.intimidation.value,
            maneuver: actor.defenses.maneuver.value,
            taunt: actor.defenses.taunt.value,
            trick: actor.defenses.trick.value,
          },
        });
      }
    }

    const validuuid = Array.from(game.actors)[0].uuid;
    const test = {
      testType: 'custom',
      actor: validuuid,
      actorPic: 'systems/torgeternity/images/tokens/vulnerable.webp',
      actorName: 'Quid',
      actorType: 'threat',
      addBDs: parseInt(info[2]),
      amountBD: 0,
      isAttack: true,
      skillName: info[0],
      skillValue: '10',
      isFav: false,
      unskilledUse: true,
      damage: parseInt(info[1]),
      weaponAP: parseInt(info[4]),
      applyArmor: info[3],
      darknessModifier: 0,
      DNDescriptor: 'standard',
      type: 'attack',
      targets: victims,
      applySize: false,
      attackOptions: true,
      rollTotal: 11,
      chatNote: '',
      bdDamageSum: 0,
      hasModifiers: false,
      woundModifier: 0,
      stymiedModifier: 0,
      sizeModifier: 0,
      vulnerableModifier: 0,
      sizeModifierAll: [0],
      vulnerableModifierAll: [0],
      targetAll: targetAll,
      targetsAllID: allID,
      targetsAllUUID: allUUID,
      disfavored: false,
      previousBonus: false,
      bonus: 0,
      bdStyle: 'display:block',
      upStyle: 'display:none',
      possibilityStyle: 'display:none',
      movementModifier: 0,
      multiModifier: 0,
      targetsModifier: 0,
      calledShotModifier: 0,
      vitalAreaDamageModifier: 0,
      burstModifier: 0,
      allOutModifier: 0,
      aimedModifier: 0,
      blindFireModifier: 0,
      trademark: false,
      concealmentModifier: 0,
      coverModifier: '0',
      additionalDamage: false,
      isOther1: false,
      isOther2: false,
      isOther3: false,
      applyDebuffLabel: 'display:none',
      applyDamLabel: 'display:inline',
      backlashLabel: 'display:true',
      ammoLabel: 'display:none',
      target: victims[0],
      chatTitle: '',
      DN: 9,
      unskilledLabel: 'display:none',
      diceroll: null,
      isFavStyle: 'pointer-events:none;color:gray;display:none',
      unskilledTest: false,
      diceList: [10],
      combinedRollTotal: 10,
      bonusPlusLabel: 'display:none',
      displayModifiers: true,
      modifiers: 0,
      modifierText: '',
      modifierLabel: 'display:',
      cardsPlayed: 0,
      rollResult: 11,
      outcome: '',
      actionTotalContent: '',
      modifierPlusLabel: 'display:none',
      resultText: '',
      resultTextColor:
        'display:none;color: green;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;',
      damageLabel: 'display: block',
      damageSubLabel: 'display:block',
      disconnectLabel: 'display:none',
      cardsPlayedLabel: 'display:none',
      notesLabel: 'display:none',
    };
    await torgchecks.renderSkillChat(test);
  }
}

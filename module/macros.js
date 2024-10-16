import * as torgchecks from '/systems/torgeternity/module/torgchecks.js';
import { TestDialog } from '/systems/torgeternity/module/test-dialog.js';

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
              const ef = CONFIG.statusEffects.find((e) => e.id === effect);
              await token.toggleEffect(ef, { active: false });
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
        !token.actor.statuses.find((d) => d === 'unconscious')
      ) {
        const eff = CONFIG.statusEffects.find((e) => e.id === 'unconscious');
        token.toggleEffect(eff, { active: true, overlay: true });
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
    const windowContent = `
            <form style="margin-bottom: 1rem; display:grid; grid-template-rows: repeat(2,auto); grid-template-columns: repeat(2,auto); align-items: center; gap:6px;">
                <label for="inputValue">${game.i18n.localize(
                  'torgeternity.macros.reviveMacroWindowLabel1'
                )}</label>
                <input type="number" min="1" step="1" name="inputValue" id="inputValue">
                <input style="grid-row: 2/3;grid-column: 2/3;" type="checkbox" name="wholeRevive"> <label for="wholeRevive" style="grid-row: 2/3; grid-column: 1/2">${game.i18n.localize(
                  'torgeternity.macros.reviveMacroWholeRevive'
                )}
            </form>
        `;

    new Dialog({
      title: game.i18n.localize('torgeternity.macros.reviveMacroChatHeadline'),
      content: windowContent,
      buttons: {
        buttonExecute: {
          label: game.i18n.localize('torgeternity.dialogWindow.buttons.execute'),
          callback: game.torgeternity.macros._processReviveShock,
        },
      },
      default: 'buttonExecute',
    }).render(true);
  }

  /**
   *
   * @param html
   */
  async _processReviveShock(html) {
    try {
      const tokens = canvas.tokens.controlled;

      const formElement = html[0].querySelector('form');
      const formData = await new FormDataExtended(formElement);
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
          chatOutput += `<li>${token.actor.name} ${game.i18n.localize(
            'torgeternity.macros.reviveMacroAlreadyFull'
          )}</li>`;
          continue;
        }

        if (bolWholeRevive) {
          await token.actor.update({ 'system.shock.value': 0 });
          chatOutput += `<li>${token.actor.name} ${game.i18n.localize(
            'torgeternity.macros.reviveMacroCharRevived'
          )}`;
        } else {
          const newShockValue = parseInt(targetShockValue) - reviveAmount;
          await token.actor.update({ 'system.shock.value': newShockValue });
          chatOutput += `<li>${token.actor.name} ${game.i18n.localize(
            'torgeternity.macros.reviveMacroCharPartyRevived'
          )}${reviveAmount}`;
        }

        if (token.actor.statuses.find((d) => d === 'unconscious')) {
          const eff = CONFIG.statusEffects.find((e) => e.id === 'unconscious');
          token.toggleEffect(eff, { active: false, overlay: false });
          chatOutput += `<br>${game.i18n.localize('torgeternity.macros.reviveMacroCharDeKOed')} ${
            token.actor.name
          }`;
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
    const windowContent = `
            <form style="margin-bottom: 1rem;display:flex;flex-direction:row;gap: 9px;align-items:center">
                <label for="inputValue">${game.i18n.localize(
                  'torgeternity.macros.bonusDieMacroContent'
                )}</label>
                <input style="width:25%;" type="number" min="1" step="1" name="inputValue" id="inputValue">
            </form>
        `;

    new Dialog({
      title: game.i18n.localize('torgeternity.macros.bonusDieMacroTitle'),
      content: windowContent,
      buttons: {
        buttonRoll: {
          label: game.i18n.localize('torgeternity.sheetLabels.roll') + '!',
          callback: game.torgeternity.macros._rollItBDs,
        },
      },
      default: 'buttonRoll',
    }).render(true);
  }

  /**
   *
   * @param html
   */
  async _rollItBDs(html) {
    try {
      const formElement = html[0].querySelector('form');
      const formData = new FormDataExtended(formElement);
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
          chatOutput += `<li>${game.i18n.localize('torgeternity.macros.bonusDieMacroResult3')} ${
            token.document.name
          } ${game.i18n.localize('torgeternity.macros.bonusDieMacroResult4')} ${
            tokenDamage.label
          }.</li>`;
        } else {
          chatOutput += `<li>${game.i18n.localize('torgeternity.macros.bonusDieMacroResult3')} ${
            token.document.name
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
    if (!game.user.isGM) {
      return;
    }
    if (!game.combats.viewed?.round) {
      return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noFight'));
    }

    let applyChanges = false;
    const users = game.users.filter((user) => user.active && !user.isGM);
    let checkOptions = '';
    const playerTokenIds = users.map((u) => u.character?.id).filter((id) => id !== undefined);
    const selectedPlayerIds = canvas.tokens.controlled.map((token) => {
      if (playerTokenIds.includes(token.actor.id)) return token.actor.id;
    });

    // Build checkbox list for all active players
    users.forEach((user) => {
      const checked =
        !!user.character && selectedPlayerIds.includes(user.character.id) && 'checked';
      checkOptions += `
        <br>
        <input type="checkbox" name="${user.id}" id="${user.id}" value="${user.name}" ${checked}>\n
        <label for="${user.id}">${user.name}</label>
    `;
    });

    // Choose the nb of cards to show
    const mychoice = new Promise((resolve, reject) => {
      new Dialog({
        title: game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.nbCards'),
        content: game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.nbCardsValue'),
        buttons: {
          1: {
            label: 1,
            callback: async (html) => {
              resolve(1);
            },
          },
          2: {
            label: 2,
            callback: async (html) => {
              resolve(2);
            },
          },
          3: {
            label: 3,
            callback: async (html) => {
              resolve(3);
            },
          },
        },
      }).render(true);
    });

    const nbc = await mychoice.then((nbc) => {
      return nbc;
    });

    // Find the Drama Deck
    const dram = game.cards.get(game.settings.get('torgeternity', 'deckSetting').dramaDeck);
    // Find ?? the index of the Active Drama Card in the Drama Deck
    const ind = game.cards.get(game.settings.get('torgeternity', 'deckSetting').dramaActive)._source
      .cards[0].sort;

    new Dialog({
      title: game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.recipient'),
      content: `${game.i18n.localize(
        'torgeternity.dialogWindow.showingDramaCards.whisper'
      )} ${checkOptions} <br>`,
      buttons: {
        whisper: {
          label: game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.apply'),
          callback: (html) => createMessage(html),
        },
      },
    }).render(true);

    function createMessage(html) {
      const targets = [];
      // build list of selected players ids for whispers target
      for (const user of users) {
        if (html.find('[name="' + user.id + '"]')[0].checked) {
          applyChanges = true;
          targets.push(user.id);
        }
      }
      if (!applyChanges) return;
      for (let j = 0; j < nbc; j++) {
        const card = dram.cards.find((i) => i.sort === ind + j + 1);
        ChatMessage.create({
          whisper: targets,
          content: `<div class="card-draw flexrow"><span class="card-chat-tooltip"><img class="card-face" src="${
            card.img
          }"/><span><img src="${
            card.img
          }"></span></span><span class="card-name"> ${game.i18n.localize(
            'torgeternity.dialogWindow.showingDramaCards.show'
          )} ${card.name}</span>
                    </div>`,
        });
      }
    }
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
    const eff = CONFIG.statusEffects.find((e) => e.id === 'disconnected');

    if (!_actor) {
      ui.notifications.error(game.i18n.localize('torgeternity.macros.commonMacroNoTokensSelected'));
      return;
    }
    const realitySkill = _actor.system.skills.reality;
    let _status;

    for (const ef of _actor.statuses) {
      _status = ef === 'disconnected' ? eff : false;
    }

    if (!_status) {
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
      await Dialog.prompt({
        title: game.i18n.localize('torgeternity.macros.reconnectMacroZoneModifierNotDetectedTitle'),
        content: `<p>${game.i18n.localize(
          'torgeternity.macros.reconnectMacroZoneModifierNotDetected'
        )}</p>`,
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
      case game.i18n.localize('torgeternity.chatText.check.result.standartSuccess'):
        await _token.toggleEffect(eff, { active: false, overlay: false });
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
    let applyChanges = false;
    const users = game.users.filter((user) => user.active && !user.isGM);
    let checkOptions = '';
    const playerTokenIds = users.map((u) => u.character?.id).filter((id) => id !== undefined);
    const selectedPlayerIds = canvas.tokens.controlled.map((token) => {
      if (playerTokenIds.includes(token.actor.id)) return token.actor.id;
    });
    // Build checkbox list for all active players
    users.forEach((user) => {
      const checked =
        !!user.character && selectedPlayerIds.includes(user.character.id) && 'checked';
      checkOptions += `
            <br>
            <input type="checkbox" name="${user.id}" id="${user.id}" value="${user.name}" ${checked}>\n
            <label for="${user.id}">${user.name}</label>
        `;
    });
    new Dialog({
      title: game.i18n.localize('torgeternity.dialogWindow.cardRetour.cardBack'),
      content: `${game.i18n.localize(
        'torgeternity.dialogWindow.cardRetour.cardOwner'
      )} ${checkOptions} <br>`,
      buttons: {
        whisper: {
          label: game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.apply'),
          callback: (html) => createMessage(html),
        },
      },
    }).render(true);

    function createMessage(html) {
      let target;
      // build list of selected players ids for whispers target
      for (const user of users) {
        if (html.find('[name="' + user.id + '"]')[0].checked) {
          applyChanges = true;
          target = user;
        }
      }
      if (!applyChanges) {
        return;
      } else {
        const destinyDiscard = game.cards.get(
          game.settings.get('torgeternity', 'deckSetting').destinyDiscard
        );
        const lastCard = destinyDiscard.cards.contents.pop();
        const parentHand = target.character.getDefaultHand();
        const listMessage = game.messages.contents;
        const filtre = listMessage.filter((m) => m._source.user === target.id);
        const lastMessage = filtre.pop();
        lastCard.pass(parentHand);
        if (lastCard) {
          ChatMessage.deleteDocuments([lastMessage.id]);
        }
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
    const mychoice = new Promise((resolve, reject) => {
      new Dialog({
        title: game.i18n.localize('torgeternity.dialogWindow.buffMacro.choice'),
        content: game.i18n.localize('torgeternity.dialogWindow.buffMacro.choose'),
        buttons: {
          mind: {
            label: game.i18n.localize('torgeternity.attributes.mind'),
            callback: async (html) => {
              resolve('mind');
            },
          },
          strength: {
            label: game.i18n.localize('torgeternity.attributes.strength'),
            callback: async (html) => {
              resolve('strength');
            },
          },
          charisma: {
            label: game.i18n.localize('torgeternity.attributes.charisma'),
            callback: async (html) => {
              resolve('charisma');
            },
          },
          spirit: {
            label: game.i18n.localize('torgeternity.attributes.spirit'),
            callback: async (html) => {
              resolve('spirit');
            },
          },
          dexterity: {
            label: game.i18n.localize('torgeternity.attributes.dexterity'),
            callback: async (html) => {
              resolve('dexterity');
            },
          },
          curse: {
            label: game.i18n.localize('torgeternity.dialogWindow.buffMacro.allAttributes'),
            callback: async (html) => {
              resolve('all');
            },
          },
          physicalDefense: {
            label: game.i18n.localize('torgeternity.dialogWindow.buffMacro.physicalDefenses'),
            callback: async (html) => {
              resolve('physicalDefense');
            },
          },
          defense: {
            label: game.i18n.localize('torgeternity.sheetLabels.defenses'),
            callback: async (html) => {
              resolve('defense');
            },
          },
          cancel: {
            label: game.i18n.localize('torgeternity.dialogWindow.buffMacro.cancelEffects'),
            callback: async (html) => {
              resolve('cancel');
            },
          },
        },
      }).render(true);
    });
    const attr = await mychoice.then((attr) => {
      return attr;
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
    const mybonus = new Promise((resolve, reject) => {
      new Dialog({
        title: game.i18n.localize('torgeternity.dialogWindow.buffMacro.bonusTitle'),
        content: `<div>${game.i18n.localize(
          'torgeternity.dialogWindow.buffMacro.value'
        )} <input name="bonu" value=1 style="width:50px"/></div>`,
        buttons: {
          1: {
            label: game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.apply'),
            callback: (html) => {
              const bonu = parseInt(html.find('[name=bonu]')[0].value);
              resolve(bonu);
            },
          },
        },
      }).render(true);
    });
    const bonu = await mybonus.then((bonu) => {
      return bonu;
    });

    // choose the duration of the effect
    const mytime = new Promise((resolve, reject) => {
      new Dialog({
        title: game.i18n.localize('torgeternity.dialogWindow.buffMacro.timeLabel'),
        content: `<div>${game.i18n.localize(
          'torgeternity.dialogWindow.buffMacro.time'
        )} <input name="dur" value=1 style="width:50px"/></div>`,
        buttons: {
          1: {
            label: game.i18n.localize('torgeternity.dialogWindow.showingDramaCards.apply'),
            callback: (html) => {
              const dur = parseInt(html.find('[name=dur]')[0].value);
              resolve(dur);
            },
          },
        },
      }).render(true);
    });
    const dur = await mytime.then((dur) => {
      return dur;
    });

    let newEffect = {};

    if (attr === 'defense') {
      // only Defenses, but ALL defenses
      newEffect = {
        name:
          game.i18n.localize('torgeternity.dialogWindow.buffMacro.defenses') +
          ' / ' +
          bonu +
          ' / ' +
          dur +
          'rd(s)',
        duration: { rounds: dur, turns: dur },
        changes: [
          {
            key: 'system.dodgeDefenseMod',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.meleeWeaponsDefenseMod',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.unarmedCombatDefenseMod',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.intimidationDefenseMod',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.maneuverDefenseMod',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.tauntDefenseMod',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.trickDefenseMod',
            value: bonu,
            mode: 2,
          },
        ],
        disabled: false,
      };
      // Aspect modifications related to bonus/malus
      newEffect.tint = bonu < 0 ? '#ff0000' : '#00ff00';
      newEffect.icon = bonu < 0 ? 'icons/svg/downgrade.svg' : 'icons/svg/upgrade.svg';
    } // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    else if (attr === 'physicalDefense') {
      // only physical Defenses
      newEffect = {
        name:
          game.i18n.localize('torgeternity.dialogWindow.buffMacro.physicalDefenses') +
          ' / ' +
          bonu +
          ' / ' +
          dur +
          'rd(s)',
        duration: { rounds: dur, turns: dur },
        changes: [
          {
            key: 'system.dodgeDefenseMod',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.meleeWeaponsDefenseMod',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.unarmedCombatDefenseMod',
            value: bonu,
            mode: 2,
          },
        ],
        disabled: false,
      };
      // Aspect modifications related to bonus/malus
      newEffect.tint = bonu < 0 ? '#ff0000' : '#00ff00';
      newEffect.icon = bonu < 0 ? 'icons/svg/downgrade.svg' : 'icons/svg/upgrade.svg';
    } // ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    else if (attr === 'all') {
      // preparation of attribute effect
      newEffect = {
        name:
          game.i18n.localize('torgeternity.dialogWindow.buffMacro.allAttributes') +
          ' / ' +
          bonu +
          ' / ' +
          dur +
          'rd(s)',
        duration: { rounds: dur, turns: dur },
        changes: [
          {
            key: 'system.attributes.mind.value',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.attributes.spirit.value',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.attributes.strength.value',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.attributes.dexterity.value',
            value: bonu,
            mode: 2,
          },
          {
            key: 'system.attributes.charisma.value',
            value: bonu,
            mode: 2,
          },
        ],
        disabled: false,
      };
      // Aspect modifications related to bonus/malus
      newEffect.tint = bonu < 0 ? '#ff0000' : '#00ff00';
      newEffect.icon = bonu < 0 ? 'icons/svg/downgrade.svg' : 'icons/svg/upgrade.svg';
    } else {
      // One attribute
      // preparation of attribute effect
      newEffect = {
        name:
          game.i18n.localize('torgeternity.attributes.' + attr) +
          ' / ' +
          bonu +
          ' / ' +
          dur +
          'rd(s)',
        duration: { rounds: dur, turns: dur },
        changes: [
          {
            key: 'system.attributes.' + attr + '.value',
            value: bonu,
            mode: 2,
          },
        ],
        disabled: false,
      };

      // Aspect modifications related to bonus/malus
      newEffect.tint = bonu < 0 ? '#ff0000' : '#00ff00';
      newEffect.icon = bonu < 0 ? 'icons/svg/downgrade.svg' : 'icons/svg/upgrade.svg';
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

  async periculum(source = '', value = 10, bds = 0) {
    let victims = Array.from(game.user.targets);
    if (!(victims.length > 0))
      return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));

    //add options for AP and bypass the window

    let info = await foundry.applications.api.DialogV2.prompt({
      window: { title: 'Periculum' },
      content: `
          <label>Damage source<br><input style="color:black" name="source" type="string" value="${source}"></label>
          <label>Damage value<input name="damageBase" type="number" value=${value} autofocus></label>
          <label>Add BDs<input name="plusBD" type="number" value=${bds}></label>
          <label>Apply armor<br><input name="armor" type="checkbox"></label>
          `,
      ok: {
        label: 'Submit Effect',
        callback: (event, button, dialog) => [
          button.form.elements.damageBase.valueAsNumber,
          button.form.elements.source.value,
          button.form.elements.armor.checked,
          button.form.elements.plusBD.value,
        ],
      },
    });

    const allID = [];
    const allUUID = [];
    const targetAll = [];
    victims.forEach((t) => {
      allID.push(t.actor.id);
      allUUID.push(t.document.uuid);
    });
    victims.forEach((t) => {
      const target = t.actor;
      // Set vehicle defense if needed
      if (target.type === 'vehicle') {
        targetAll.push({
          present: true,
          type: 'vehicle',
          id: target.id,
          uuid: t.document.uuid,
          targetPic: target.img,
          targetName: target.name,
          defenses: {
            vehicle: target.system.defense,
            dodge: target.system.defense,
            unarmedCombat: target.system.defense,
            meleeWeapons: target.system.defense,
            intimidation: target.system.defense,
            maneuver: target.system.defense,
            taunt: target.system.defense,
            trick: target.system.defense,
          },
          toughness: target.defenses.toughness,
          armor: target.defenses.armor,
        });
      } else {
        targetAll.push({
          present: true,
          type: target.type,
          id: target.id,
          uuid: t.document.uuid,
          targetPic: target.img,
          targetName: target.name,
          skills: target.system.skills,
          attributes: target.system.attributes,
          toughness: target.defenses.toughness,
          armor: target.defenses.armor,
          defenses: {
            dodge: target.defenses.dodge.value,
            unarmedCombat: target.defenses.unarmedCombat.value,
            meleeWeapons: target.defenses.meleeWeapons.value,
            intimidation: target.defenses.intimidation.value,
            maneuver: target.defenses.maneuver.value,
            taunt: target.defenses.taunt.value,
            trick: target.defenses.trick.value,
          },
        });
      }
    });

    let test = {
      testType: 'custom',
      actor: 'Actor.KTwwUX7BKCXxKh4c',
      actorPic: 'systems/torgeternity/images/tokens/vulnerable.webp',
      actorName: 'Quid',
      actorType: 'threat',
      addBDs: parseInt(info[3]),
      amountBD: 0,
      isAttack: true,
      skillName: info[1],
      skillValue: '10',
      isFav: false,
      unskilledUse: true,
      damage: parseInt(info[0]),
      weaponAP: 0,
      applyArmor: info[2],
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
      outcomeColor:
        'display:none;color: green;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;',
      modifierPlusLabel: 'display:none',
      resultText: '',
      resultTextColor:
        'display:none;color: green;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;',
      damageLabel: 'display: block',
      damageSubLabel: 'display:block',
      disconnectLabel: 'display:none',
      typeLabel: 'Valeur de compétence',
      cardsPlayedLabel: 'display:none',
      notesLabel: 'display:none',
    };
    await torgchecks.renderSkillChat(test);
  }
}

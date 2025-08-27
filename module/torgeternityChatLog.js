import { renderSkillChat } from './torgchecks.js';
import { rollBonusDie } from './torgchecks.js';
import { torgDamage } from './torgchecks.js';
import { TestResult, soakDamages } from './torgchecks.js';
import { TestDialog } from './test-dialog.js';
import TorgeternityActor from './documents/actor/torgeternityActor.js';

const { DialogV2 } = foundry.applications.api;

export default class TorgeternityChatLog extends foundry.applications.sidebar.tabs.ChatLog {

  static DEFAULT_OPTIONS = {
    actions: {
      'openSheet': TorgeternityChatLog.#openSheet,
      'rollFav': TorgeternityChatLog.#onFavored,
      'rollPossibility': TorgeternityChatLog.#onPossibility,
      'rollUp': TorgeternityChatLog.#onUp,
      'rollHero': TorgeternityChatLog.#onHero,
      'rollDrama': TorgeternityChatLog.#onDrama,
      'addPlus3': TorgeternityChatLog.#onPlus3,
      'addBd': TorgeternityChatLog.#onBd,
      'modifierLabel': TorgeternityChatLog.#onModifier,
      'applyDam': TorgeternityChatLog.#applyDamage,
      'soakDam': TorgeternityChatLog.#soakDamage,
      'applyEffects': TorgeternityChatLog.#applyEffects,
      'applyStymied': TorgeternityChatLog.#applyStymied,
      'applyVulnerable': TorgeternityChatLog.#applyTargetVulnerable,
      'applyActorVulnerable': TorgeternityChatLog.#applyActorVulnerable,
      'backlash1': TorgeternityChatLog.#applyBacklash1,
      'backlash2': TorgeternityChatLog.#applyBacklash2,
      'backlash3': TorgeternityChatLog.#applyBacklash3,
      'testDefeat': TorgeternityChatLog.#testDefeat,
      'applyDefeat': TorgeternityChatLog.#applyDefeat,
      'drawDestiny': TorgeternityChatLog.#drawDestiny,
    }
  }

  static async renderHTML(options) {
    const result = await super.renderHTML(options);
    result.querySelector?.('a.button[data-action="applyDam"]')?.addEventListener('contextmenu', TorgeternityChatLog.#adjustDamage);
    return result;
  }

  parentDeleteByTime(oldMsg) {
    // Use time and author to find all messages related to the same test.
    const messageIds = game.messages
      .filter(msg => msg.author === oldMsg.author && Math.abs(msg.timestamp - oldMsg.timestamp) < 500)
      .map(msg => msg.id);
    if (!messageIds) {
      console.warn('Failed to find any messages to delete for ', oldMsg);
      return;
    }
    ChatMessage.implementation.deleteDocuments(messageIds);
  }

  static async #onFavored(event, button) {
    event.preventDefault();
    const { chatMessageId, chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    test.parentId = chatMessageId;
    chatMessage.unsetFlag('torgeternity', 'test');

    // reRoll because favored
    test.isFavStyle = 'hidden';

    const diceroll = await new Roll('1d20x10x20').evaluate();
    test.diceroll = diceroll;
    test.rollTotal = Math.max(test.diceroll.total, 1.1);
    test.isFav = false;

    test.unskilledLabel = 'hidden';

    this.parentDeleteByTime(chatMessage);
    return renderSkillChat(test);
  }

  static async #onPossibility(event, button) {
    event.preventDefault();
    const noMin10 = event.shiftKey;
    const { chatMessageId, chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    // check for actor possibility
    // If vehicle roll, search for a character from the user (operator or gunner)
    const possOwner = test.actorType === 'vehicle' ? TorgeternityActor.getControlledActor()?.uuid : test.actor;
    let possPool;
    // If no valid possOwner, take possibilities from the GM
    if (possOwner) {
      possPool = parseInt(fromUuidSync(possOwner).system.other.possibilities);
    } else {
      possPool = game.user.isGM ? parseInt(game.user.flags.torgeternity.GMpossibilities) : 0;
    }
    // 0 => if GM ask for confirm, or return message "no poss"
    if (possPool <= 0 && !game.user.isGM) {
      ui.notifications.warn(game.i18n.localize('torgeternity.sheetLabels.noPoss'));
      return;
    }

    // 1=> pop up warning, confirm "spend last poss?"
    if (possPool === 1) {
      const confirm = await DialogV2.confirm({
        window: { title: 'torgeternity.sheetLabels.lastPoss' },
        content: game.i18n.localize('torgeternity.sheetLabels.lastPossMess'),
      });
      if (!confirm) return;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.lastSpent');
    } // GM can grant an on the fly possibilty if he does the roll
    else if (possPool === 0 && game.user.isGM) {
      const confirm = await DialogV2.confirm({
        window: { title: 'torgeternity.sheetLabels.noPoss' },
        content: game.i18n.localize('torgeternity.sheetLabels.noPossFree'),
      });
      if (!confirm) return;
      possPool += 1;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.freePoss');
    }
    if (possOwner) {
      await fromUuidSync(possOwner).update({ 'system.other.possibilities': possPool - 1 });
    } else {
      game.user.isGM ? game.user.setFlag('torgeternity', 'GMpossibilities', possPool - 1) : {};
    }

    test.parentId = chatMessageId;
    chatMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'hidden';

    // Roll for Possibility
    // possibilities is allowed 2 times (case in Nile Empire)
    if (test.possibilityTotal > 0) {
      test.possibilityStyle = 'disabled';
    } else {
      test.chatTitle += '*';
    }

    // check for Nile/Other/none cosm
    // if no, possibility style to grey
    const currentCosms = [
      canvas.scene.getFlag('torgeternity', 'cosm'),
      canvas.scene.getFlag('torgeternity', 'cosm2'),
    ];
    const twoPossCosm = Object.keys(CONFIG.torgeternity.actionLawCosms);
    if (
      !(
        twoPossCosm.includes(currentCosms[0]) ||
        twoPossCosm.includes(currentCosms[1]) ||
        currentCosms[0] === 'none' ||
        currentCosms[0] === undefined
      )
    ) {
      test.possibilityStyle = 'disabled';
    }

    const diceroll = await new Roll('1d20x10x20').evaluate();
    if (test.disfavored) {
      test.possibilityTotal = 0.1;
      test.disfavored = false;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.explosionCancelled');
    } else if (!noMin10) {
      // Standardly, a possibility has a minimum of 10 on the dice.
      // Certain circumstances break that rule, so holding SHIFT will not apply min 10.
      test.possibilityTotal = Math.max(10, diceroll.total, test.possibilityTotal);
    }
    test.diceroll = diceroll;

    test.unskilledLabel = 'hidden';
    // add chat note "poss spent"
    test.chatNote += game.i18n.localize('torgeternity.sheetLabels.possSpent');
    if (noMin10) test.chatNote += game.i18n.localize('torgeternity.sheetLabels.noMin10');

    this.parentDeleteByTime(chatMessage);
    return renderSkillChat(test);
  }

  static async #onUp(event, button) {
    event.preventDefault();
    const { chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    chatMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'hidden';

    // Roll for Up
    const diceroll = await new Roll('1d20x10x20').evaluate();
    if (test.disfavored) {
      test.upTotal = 0.1;
      test.disfavored = false;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.explosionCancelled');
    } else {
      test.upTotal = diceroll.total;
    }
    test.diceroll = diceroll;

    test.chatTitle += '*';
    test.unskilledLabel = 'hidden';

    this.parentDeleteByTime(chatMessage);
    return renderSkillChat(test);
  }

  static async #onHero(event, button) {
    event.preventDefault();
    const { chatMessageId, chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    test.parentId = chatMessageId;
    chatMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'hidden';

    // Roll for Possibility
    const diceroll = await new Roll('1d20x10x20').evaluate();
    if (test.disfavored) {
      test.heroTotal = 0.1;
      test.disfavored = false;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.explosionCancelled');
    } else if (diceroll.total < 10) {
      test.heroTotal = 10;
    } else {
      test.heroTotal = diceroll.total;
    }
    test.diceroll = diceroll;

    test.chatTitle += '*';
    test.unskilledLabel = 'hidden';

    this.parentDeleteByTime(chatMessage);
    return renderSkillChat(test);
  }

  static async #onDrama(event, button) {
    event.preventDefault();
    const { chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    chatMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'hidden';

    // Increase cards played by 1
    const diceroll = await new Roll('1d20x10x20').evaluate();
    if (test.disfavored) {
      test.dramaTotal = 0.1;
      test.disfavored = false;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.explosionCancelled');
    } else if (diceroll.total < 10) {
      test.dramaTotal = 10;
    } else {
      test.dramaTotal = diceroll.total;
    }
    test.diceroll = diceroll;

    test.chatTitle += '*';
    test.unskilledLabel = 'hidden';

    this.parentDeleteByTime(chatMessage);
    return renderSkillChat(test);
  }

  static async #onPlus3(event, button) {
    event.preventDefault();
    const { chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    chatMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'hidden';

    // Add 1 to cards played
    test.cardsPlayed++;

    // Nullify Diceroll
    test.diceroll = null;

    test.unskilledLabel = 'hidden';

    this.parentDeleteByTime(chatMessage);
    return renderSkillChat(test);
  }

  static async #onBd(event, button) {
    event.preventDefault();
    const { chatMessageId, chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    // Pick the specific target from the chat card to receive the BD
    if (test.target) test.targetAll = [test.target];
    test.possibilityStyle = 'hidden';
    test.upStyle = 'hidden';
    test.dramaStyle = 'hidden';
    test.heroStyle = 'hidden';
    test.isFavStyle = 'hidden';
    test.plus3Style = 'hidden';
    chatMessage.unsetFlag('torgeternity', 'test');
    test.isFavStyle = 'hidden';
    test.unskilledLabel = 'hidden';

    const finalValue = await rollBonusDie(test.trademark, 1);

    const newDamage = test.damage + finalValue.total;

    test.damage = newDamage;
    test.diceroll = finalValue;

    test.amountBD += 1;
    if (test.amountBD === 1 && !test.addBDs) {
      test.chatTitle += ` +${test.amountBD}` + game.i18n.localize('torgeternity.chatText.bonusDice');
    } else if (test.amountBD > 1) {
      test.chatTitle = test.chatTitle.replace(
        (test.amountBD - 1).toString(),
        test.amountBD.toString()
      );
    } else {
      ui.notifications.info(game.i18n.localize('torgeternity.notifications.failureBDResolution'));
    }

    test.bdDamageSum += finalValue.total;
    game.messages.get(chatMessageId).delete();

    // No parentDeleteByTime?
    return renderSkillChat(test);
  }

  static async #onModifier(event, button) {
    event.preventDefault();
    const { chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    test.mode = 'update';
    return TestDialog.wait(test);
  }

  static async #applyDamage(event, button) {
    event.preventDefault();
    const { test, target } = getChatTarget(button);
    if (!target) return;
    const damage = torgDamage(test.damage, test.target.targetAdjustedToughness, test.attackTraits);
    target.applyDamages(damage.shocks, damage.wounds);
  }

  static async #soakDamage(event, button) {
    event.preventDefault();
    const { test, target } = getChatTarget(button);
    if (!target) return;

    if (test.target.id !== game.user?.character?.id && !game.user.isGM) {
      return;
    }
    if (target.isDisconnected) {
      return ChatMessage.create({
        speaker: ChatMessage.getSpeaker({ actor: target }),
        content: game.i18n.localize('torgeternity.chatText.check.cantUseRealityWhileDisconnected'),
      });
    }
    //
    let possPool = parseInt(target.system.other.possibilities);
    // 0 => if GM ask for confirm, or return message "no poss"
    if (possPool <= 0 && !game.user.isGM) {
      ui.notifications.warn(game.i18n.localize('torgeternity.sheetLabels.noPoss'));
      return;
    }

    // 1=> pop up warning, confirm "spend last poss?"
    if (possPool === 1) {
      const confirm = await DialogV2.confirm({
        window: { title: 'torgeternity.sheetLabels.lastPoss' },
        content: game.i18n.localize('torgeternity.sheetLabels.lastPossMess'),
      });
      if (!confirm) return;
    } // GM can grant an on the fly possibilty if he does the roll
    else if (possPool === 0 && game.user.isGM) {
      const confirm = await DialogV2.confirm({
        window: { title: 'torgeternity.sheetLabels.noPoss' },
        content: game.i18n.localize('torgeternity.sheetLabels.noPossFree'),
      });
      if (!confirm) return;
      ui.notifications.warn(game.i18n.localize('torgeternity.sheetLabels.possGrant'));
      possPool += 1;
    }

    soakDamages(target);
    await target.update({ 'system.other.possibilities': possPool - 1 });
  }

  static #adjustDamage(event) {  // context menu, not action
    // Prevent Foundry's normal contextmenu handler from doing anything
    event.preventDefault();
    event.stopImmediatePropagation();
    const { test, target } = getChatTarget(event.target);
    if (!target) return;

    const newDamages = torgDamage(test.damage, test.targetAdjustedToughness, test.attackTraits);

    const fields = foundry.applications.fields;
    const woundsGroup = fields.createFormGroup({
      label: game.i18n.localize('torgeternity.sheetLabels.modifyWounds'),
      input: fields.createNumberInput({ name: 'nw', value: newDamages.wounds, initial: 0 }),
    });

    const shockGroup = fields.createFormGroup({
      label: game.i18n.localize('torgeternity.sheetLabels.modifyShocks'),
      input: fields.createNumberInput({ name: 'ns', value: newDamages.shocks, initial: 0 }),
    })

    const content = `<p>${game.i18n.localize('torgeternity.sheetLabels.modifyDamage')}</p> <hr>
    ${woundsGroup.outerHTML}${shockGroup.outerHTML}`;

    DialogV2.wait({
      window: { title: 'torgeternity.sheetLabels.chooseDamage', },
      content,
      buttons: [
        {
          action: 'go',
          icon: 'fas fa-check',
          label: 'torgeternity.submit.apply',
          callback: async (event, button, dialog) => {
            const wounds = button.form.elements.nw.valueAsNumber;
            const shock = button.form.elements.ns.valueAsNumber;
            target.applyDamages(shock, wounds);
          },
        },
      ],
      default: 'go',
    });
  }

  static async #applyEffects(event, button) {
    event.preventDefault();
    const { test, target } = getChatTarget(button);
    if (!target) return;

    // Transfer Effects from the Weapon (& Ammo) to the target.
    // Only those marked as "Transfer on Attack"
    if (!test.itemId) return;
    const { actor } = getChatActor(button);
    const item = actor.items.get(test.itemId);
    if (!item) return;
    const result = test.result;
    const effects = item.effects.filter(ef => (ef.transferOnAttack && result >= TestResult.SUCCESS) || (ef.testOutcome === result));
    if (item.system.loadedAmmo) {
      const ammo = actor.items.get(item.system.loadedAmmo);
      if (ammo) effects.push(...ammo.effects.filter(ef => (ef.transferOnAttack && result >= TestResult.SUCCESS) || (ef.testOutcome === result)));
    }
    if (effects.length) {
      target.createEmbeddedDocuments('ActiveEffect', effects.map(ef => {
        let fx = ef.toObject();
        fx.disabled = false;
        return fx;
      }));
    }
  }

  static async #applyStymied(event, button) {
    event.preventDefault();
    const { test, target } = getChatTarget(button);
    if (target) await target.applyStymiedState(test.actor);
  }

  static async #applyTargetVulnerable(event, button) {
    event.preventDefault();
    const { test, target } = getChatTarget(button);
    if (target) await target.applyVulnerableState(test.actor);
  }

  static async #applyActorVulnerable(event, button) {
    event.preventDefault();
    const { test, actor } = getChatActor(button);
    if (actor) actor.applyVulnerableState(test.actor);
  }

  /**
   * Inflict Backlash (2 shock)
   * @param event
   */
  static async #applyBacklash1(event, button) {
    event.preventDefault();
    const { actor } = getChatActor(button);
    if (actor) actor.applyDamages(/*shock*/ 2, /*wounds*/ 0);
  }

  /**
   * Inflict Minor Backlash (1 shock)
   * @param event
   */
  static async #applyBacklash2(event, button) {
    event.preventDefault();
    const { actor } = getChatActor(button);
    if (actor) actor.applyDamages(/*shock*/ 1, /*wounds*/ 0);
  }

  /**
   * Inflict Major Backlash (very stymied)
   * @param event
   */
  static async #applyBacklash3(event, button) {
    event.preventDefault();
    const { actor } = getChatActor(button);
    if (actor) actor.setVeryStymied();
  }

  static async #testDefeat(event, button) {
    event.preventDefault();
    // No test in the chat message that display Defeat prompt
    const { chatMessage } = getMessage(button);
    const attribute = button.dataset.control;
    const actor = game.actors.get(chatMessage.speaker.actor);

    return TestDialog.wait({
      DNDescriptor: 'standard',
      actor: actor,
      testType: 'attribute',
      skillName: attribute,
      skillValue: actor.system.attributes[attribute].value,
      isDefeatTest: true,
    });

    // Wait for manual addition of results, when applyDefeat is invoked.
  }

  static async #drawDestiny(event, button) {
    let id = button.dataset.actor;
    if (id.startsWith('Actor.')) id = id.slice(6);
    let actor = game.actors.get(id);
    if (!actor) return;  // maybe warning message
    if (!actor.isOwner) return;  // not an owner of the actor receiving the card
    let hand = actor.getDefaultHand();
    if (!hand) return;  // maybe warning message
    return hand.drawDestiny();
  }

  static async #openSheet(event, button) {
    console.log({ event, button });
    let id = button.dataset.actor;
    if (id.startsWith('Actor.')) id = id.slice(6);
    let actor = game.actors.get(id);
    if (!actor) return;  // maybe warning message
    if (!actor.isOwner) return;  // not an owner of the actor receiving the card
    actor.sheet.render({ force: true });
  }

  static async #applyDefeat(event, button) {
    const { actor } = getChatActor(button);
    if (!actor) return console.error(`applyDefeat: failed to find actor`)
    const result = parseInt(button.dataset.result);
    console.log(`applyDefeat`, result)

    if (result < TestResult.STANDARD) {
      actor.toggleStatusEffect('dead', { active: true, overlay: true });
      return;
    }

    if (result === TestResult.OUTSTANDING) {
      await actor.toggleStatusEffect('unconscious', { active: true, overlay: true });
      return;
    }

    const selection = await foundry.applications.api.DialogV2.prompt({
      window: {
        title: game.i18n.localize('torgeternity.defeat.chooseAttribute')
      },
      content: foundry.applications.fields.createSelectInput({
        options: Object.entries(CONFIG.torgeternity.attributeTypes).map(attr => { return { value: attr[0], label: attr[1] } }),
        localize: true,
        name: 'attrName'
      }).outerHTML,
      ok: {
        label: "Confirm Choice",
        callback: (event, button, dialog) => button.form.elements.attrName.value
      }
    });

    if (selection) {
      const localAttr = game.i18n.localize(CONFIG.torgeternity.attributeTypes[selection]);

      await actor.toggleStatusEffect('unconscious', { active: true, overlay: true });
      const attrfield = `system.attributes.${selection}.value`;
      if (result === TestResult.STANDARD) {
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          owner: actor,
          content: game.i18n.format('torgeternity.defeat.permInjury', { attribute: localAttr })
        })
        // Permanent: Reduce attribute directly
        return actor.update({
          [`system.attributes.${selection}.base`]: Math.max(1, actor.system.attributes[selection].base - 1)
        })

      } else {
        // Temporary: Add AE to reduce until cleared
        await ChatMessage.create({
          speaker: ChatMessage.getSpeaker({ actor }),
          owner: actor,
          content: game.i18n.format('torgeternity.defeat.tempInjury', { attribute: localAttr })
        })
        return actor?.createEmbeddedDocuments('ActiveEffect', [{
          name: `${game.i18n.localize('torgeternity.defeat.good-success.effectName')} (${localAttr})`,
          icon: 'icons/svg/downgrade.svg',
          changes: [
            {
              key: `system.attributes.${selection}.value`,
              value: -1,
              mode: CONST.ACTIVE_EFFECT_MODES.ADD,
            }
          ],
        }]);
      }
    }
  }
}

function getMessage(button) {
  const chatMessageId = button.closest('.chat-message').dataset.messageId;
  const chatMessage = game.messages.get(chatMessageId);
  const test = chatMessage.flags.torgeternity?.test;
  return { chatMessageId, chatMessage, test }
}

/**
 * 
 * @param {HTMLElement} button The button pressed to initiate this action
 * @returns {Actor} The actor that initiated this chat message
 */
function getChatActor(button) {
  const test = getMessage(button)?.test;
  if (!test) return null;
  const actor = fromUuidSync(test.actor, { strict: false });
  if (actor) return { test, actor };
  ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
  return null;
}

/**
 * 
 * @param {HTMLElement} button The button pressed to initiate this action
 * @returns {Actor} The Actor of the target token of this chat message.
 */
function getChatTarget(button) {
  const test = getMessage(button)?.test;
  if (!test) return null;
  const target = fromUuidSync(test.target?.uuid, { strict: false })?.actor;
  if (target) return { test, target }
  ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
  return null;
}
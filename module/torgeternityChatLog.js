import { renderSkillChat } from './torgchecks.js';
import { rollBonusDie } from './torgchecks.js';
import { torgDamage } from './torgchecks.js';
import { TestResult, soakDamages } from './torgchecks.js';
import { TestDialog } from './test-dialog.js';

const { DialogV2 } = foundry.applications.api;

export default class TorgeternityChatLog extends foundry.applications.sidebar.tabs.ChatLog {

  static DEFAULT_OPTIONS = {
    actions: {
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
      'applyStymied': TorgeternityChatLog.#applyStymied,
      'applyVulnerable': TorgeternityChatLog.#applyVulnerable,
      'backlash1': TorgeternityChatLog.#applyBacklash1,
      'backlash2': TorgeternityChatLog.#applyBacklash2,
      'backlash3': TorgeternityChatLog.#applyBacklash3,
      'testDefeat': TorgeternityChatLog.#testDefeat,
    }
  }

  static async renderMessage(message, options) {
    const result = await super.renderMessage(message, options);
    result.querySelector('a.applyDam')?.addEventListener('contextmenu', TorgeternityChatLog.#adjustDamage);
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

    await renderSkillChat(test);
    this.parentDeleteByTime(chatMessage);
  }

  static async #onPossibility(event, button) {
    event.preventDefault();
    const { chatMessageId, chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    // check for actor possibility
    // If vehicle roll, search for a character from the user
    const possOwner = test.actorType === 'vehicle' ? game.user.character?.uuid : test.actor;
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
        window: { title: game.i18n.localize('torgeternity.sheetLabels.lastPoss') },
        content: game.i18n.localize('torgeternity.sheetLabels.lastPossMess'),
      });
      if (!confirm) return;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.lastSpent');
    } // GM can grant an on the fly possibilty if he does the roll
    else if (possPool == 0 && game.user.isGM) {
      const confirm = await DialogV2.confirm({
        window: { title: game.i18n.localize('torgeternity.sheetLabels.noPoss') },
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

    this.parentDeleteByTime(chatMessage);
    const diceroll = await new Roll('1d20x10x20').evaluate();
    if (test.disfavored) {
      test.possibilityTotal = 0.1;
      test.disfavored = false;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.explosionCancelled');
    } else {
      test.possibilityTotal = Math.max(10, diceroll.total, test.possibilityTotal);
    }
    test.diceroll = diceroll;

    test.unskilledLabel = 'hidden';
    // add chat note "poss spent"
    test.chatNote += game.i18n.localize('torgeternity.sheetLabels.possSpent');

    await renderSkillChat(test);
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
    this.parentDeleteByTime(chatMessage);
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

    await renderSkillChat(test);
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
    this.parentDeleteByTime(chatMessage);
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

    await renderSkillChat(test);
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
    this.parentDeleteByTime(chatMessage);
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

    await renderSkillChat(test);
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

    await renderSkillChat(test);
  }

  static async #onBd(event, button) {
    event.preventDefault();
    const { chatMessageId, chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    test.targetAll = [test.target];
    test.possibilityStyle = 'hidden';
    test.upStyle = 'hidden';
    test.dramaStyle = 'hidden';
    test.heroStyle = 'hidden';
    test.isFavStyle = 'hidden';
    test.plus3Style = 'hidden';
    chatMessage.unsetFlag('torgeternity', 'test');
    test.isFavStyle = 'hidden';
    test.unskilledLabel = 'hidden';
    test.bdDamageLabelStyle = '';

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

    await renderSkillChat(test);
  }

  static async #onModifier(event, button) {
    event.preventDefault();
    const { chatMessage, test } = getMessage(button);
    if (!chatMessage.isAuthor && !game.user.isGM) {
      return;
    }
    TestDialog.renderUpdate(test);
  }

  static async #applyDamage(event, button) {
    event.preventDefault();
    const { test } = getMessage(button);
    const actor = fromUuidSync(test.target.uuid)?.actor;
    if (!actor) return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
    const damage = torgDamage(test.damage, test.target.targetAdjustedToughness);
    actor.applyDamages(damage.shocks, damage.wounds);
  }

  static async #soakDamage(event, button) {
    event.preventDefault();
    const { test } = getMessage(button);

    if (test.target.id !== game.user?.character?.id && !game.user.isGM) {
      return;
    }
    const soaker = fromUuidSync(test.target.uuid)?.actor;
    if (soaker.isDisconnected) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: game.i18n.localize('torgeternity.chatText.check.cantUseRealityWhileDisconnected'),
      });
      return;
    }
    //
    let possPool = parseInt(soaker.system.other.possibilities);
    // 0 => if GM ask for confirm, or return message "no poss"
    if (possPool <= 0 && !game.user.isGM) {
      ui.notifications.warn(game.i18n.localize('torgeternity.sheetLabels.noPoss'));
      return;
    }

    // 1=> pop up warning, confirm "spend last poss?"
    if (possPool === 1) {
      const confirm = await DialogV2.confirm({
        window: { title: game.i18n.localize('torgeternity.sheetLabels.lastPoss') },
        content: game.i18n.localize('torgeternity.sheetLabels.lastPossMess'),
      });
      if (!confirm) return;
    } // GM can grant an on the fly possibilty if he does the roll
    else if (possPool === 0 && game.user.isGM) {
      const confirm = await DialogV2.confirm({
        window: { title: game.i18n.localize('torgeternity.sheetLabels.noPoss') },
        content: game.i18n.localize('torgeternity.sheetLabels.noPossFree'),
      });
      if (!confirm) return;
      ui.notifications.warn(game.i18n.localize('torgeternity.sheetLabels.possGrant'));
      possPool += 1;
    }

    soakDamages(soaker);
    await soaker.update({ 'system.other.possibilities': possPool - 1 });
  }

  static #adjustDamage(event) {  // context menu, not action
    // Prevent Foundry's normal contextmenu handler from doing anything
    event.preventDefault();
    event.stopImmediatePropagation();
    const { test } = getMessage(event.target);
    const targetuuid = test.target.uuid;
    const newDamages = torgDamage(test.damage, test.targetAdjustedToughness);

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
      window: { title: game.i18n.localize('torgeternity.sheetLabels.chooseDamage'), },
      content,
      buttons: [
        {
          action: 'go',
          icon: 'fas fa-check',
          label: 'torgeternity.submit.apply',
          callback: async (event, button, dialog) => {
            const wounds = button.form.elements.nw.valueAsNumber;
            const shock = button.form.elements.ns.valueAsNumber;
            const actor = fromUuidSync(targetuuid)?.actor;
            if (!actor) return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
            actor.applyDamages(shock, wounds);
          },
        },
      ],
      default: 'go',
    });
  }

  static async #applyStymied(event, button) {
    event.preventDefault();
    const { test } = getMessage(button);
    const actor = fromUuidSync(test.target.uuid)?.actor;
    if (actor) await actor.applyStymiedState(test.actor);
  }

  static async #applyVulnerable(event, button) {
    event.preventDefault();
    const { test } = getMessage(button);
    const actor = fromUuidSync(test.target.uuid)?.actor;
    if (actor) await actor.applyVulnerableState(test.actor);
  }

  /**
   * Inflict Backlash (2 shock)
   * @param event
   */
  static async #applyBacklash1(event, button) {
    event.preventDefault();
    const actor = fromUuidSync(getMessage(button).test.actor);
    if (!actor) return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
    actor.applyDamages(/*shock*/ 2, /*wounds*/ 0);
  }

  /**
   * Inflict Minor Backlash (1 shock)
   * @param event
   */
  static async #applyBacklash2(event, button) {
    event.preventDefault();
    const actor = fromUuidSync(getMessage(button).test.actor);
    if (!actor) return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
    actor.applyDamages(/*shock*/ 1, /*wounds*/ 0);
  }

  /**
   * Inflict Major Backlash (very stymied)
   * @param event
   */
  static async #applyBacklash3(event, button) {
    event.preventDefault();
    const actor = fromUuidSync(getMessage(button).test.actor);
    if (!actor) return ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
    return actor.setVeryStymied();
  }

  static async #testDefeat(event, button) {
    event.preventDefault();
    const attribute = button.dataset.control;
    const chatMessageId = button.closest('.chat-message').dataset.messageId;
    const chatMessage = game.messages.get(chatMessageId);
    const actor = game.actors.get(chatMessage.speaker.actor);

    const response = await TestDialog.asPromise({
      DNDescriptor: 'standard',

      actor: actor.uuid,
      actorPic: actor.img,
      actorName: actor.name,
      actorType: actor.type,

      testType: 'attribute',
      skillName: attribute,
      skillValue: actor.system.attributes[attribute].value,
      rollTotal: 0,

      bdDamageLabelStyle: 'hidden',
      bdDamageSum: 0,
    });
    if (!response) return;

    const result = response.flags.torgeternity.test.result;

    let message;

    if (result < TestResult.STANDARD) {
      message = 'torgeternity.defeat.failure';
      actor.toggleStatusEffect('dead', { active: true, overlay: true });
    } else {

      await actor.toggleStatusEffect('unconscious', { active: true, overlay: true });

      switch (result) {
        case TestResult.OUTSTANDING:
          message = 'torgeternity.defeat.outstanding';
          break;

        case TestResult.GOOD:
          // Suffers an **Injury** lasting until all his Wounds are healed
          message = 'torgeternity.defeat.good';
          break;

        case TestResult.STANDARD:
          // Permanent **Injury**
          message = 'torgeternity.defeat.standard';
          break;
      }
    }

    const formattedMessage = game.i18n.format(message, { name: actor.name });
    ui.notifications.info(formattedMessage);
    ChatMessage.create({
      user: game.user.id,
      speaker: ChatMessage.getSpeaker(),
      owner: actor,
      content: formattedMessage
    })
  }
}

function getMessage(target) {
  const chatMessageId = target.closest('.chat-message').dataset.messageId;
  const chatMessage = game.messages.get(chatMessageId);
  const test = chatMessage.flags.torgeternity.test;
  return { chatMessageId, chatMessage, test }
}


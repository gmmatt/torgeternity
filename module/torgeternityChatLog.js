import { renderSkillChat } from './torgchecks.js';
import { torgBD } from './torgchecks.js';
import { torgDamage } from './torgchecks.js';
import { applyDamages } from './torgchecks.js';
import { backlash1 } from './torgchecks.js';
import { backlash2 } from './torgchecks.js';
import { backlash3 } from './torgchecks.js';
import { soakDamages } from './torgchecks.js';
import { applyStymiedState } from './torgchecks.js';
import { applyVulnerableState } from './torgchecks.js';
import { TestDialog } from './test-dialog.js';
import { checkForDiscon } from './torgchecks.js';

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
      'applyDam': TorgeternityChatLog.#applyDam,
      'soakDam': TorgeternityChatLog.#soakDam,
      'applyStymied': TorgeternityChatLog.#applyStym,
      'applyVulnerable': TorgeternityChatLog.#applyVul,
      'backlash1': TorgeternityChatLog.#applyBacklash1,
      'backlash2': TorgeternityChatLog.#applyBacklash2,
      'backlash3': TorgeternityChatLog.#applyBacklash3,
    }
  }

  static async renderMessage(message, options) {
    const result = await super.renderMessage(message, options);
    result.querySelector('a.applyDam')?.addEventListener('contextmenu', TorgeternityChatLog.#adjustDam);
    return result;
  }

  parentDeleteByTime(oldMsg) {
    const parentMessagesIds = [];
    game.messages
      .filter((id) => Math.abs(id.timestamp - oldMsg.timestamp) < 500)
      .forEach((m) => parentMessagesIds.push(m.id));
    parentMessagesIds.forEach((id) => game.messages.get(id).delete());
  }

  static async #onFavored(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    if (!(parentMessage.author.id === game.user.id) && !game.user.isGM) {
      return;
    }
    const test = parentMessage.getFlag('torgeternity', 'test');
    test.parentId = parentMessageId;
    parentMessage.setFlag('torgeternity', 'test');

    // reRoll because favored
    test.isFavStyle = 'pointer-events:none;color:gray;display:none';

    const diceroll = await new Roll('1d20x10x20').evaluate();
    test.diceroll = diceroll;
    test.rollTotal = Math.max(test.diceroll.total, 1.1);
    test.isFav = false;

    test.unskilledLabel = 'display:none';

    await renderSkillChat(test);
    this.parentDeleteByTime(parentMessage);
  }

  static async #onPossibility(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    if (!(parentMessage.author.id === game.user.id) && !game.user.isGM) {
      return;
    }
    const test = parentMessage.getFlag('torgeternity', 'test');

    // check for actor possibility
    // If vehicle roll, search for a character from the user
    const possOwner = test.actorType === 'vehicle' ? game.user.character?.uuid : test.actor;
    let possPool;
    // If no valid possOwner, take possibilities from the GM
    if (!!possOwner) {
      possPool = parseInt(fromUuidSync(possOwner).system.other.possibilities);
    } else {
      possPool = game.user.isGM ? parseInt(game.user.getFlag('torgeternity', 'GMpossibilities')) : 0;
    }
    // 0 => if GM ask for confirm, or return message "no poss"
    if ((possPool <= 0) & !game.user.isGM) {
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
    else if ((possPool === 0) & game.user.isGM) {
      const confirm = await DialogV2.confirm({
        window: { title: game.i18n.localize('torgeternity.sheetLabels.noPoss') },
        content: game.i18n.localize('torgeternity.sheetLabels.noPossFree'),
      });
      if (!confirm) return;
      possPool += 1;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.freePoss');
    }
    if (!!possOwner) {
      await fromUuidSync(possOwner).update({ 'system.other.possibilities': possPool - 1 });
    } else {
      game.user.isGM ? game.user.setFlag('torgeternity', 'GMpossibilities', possPool - 1) : {};
    }

    test.parentId = parentMessageId;
    parentMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'pointer-events:none;color:gray;display:none';

    // Roll for Possibility
    // possibilities is allowed 2 times (case in Nile Empire)
    if (test.possibilityTotal > 0) {
      test.possibilityStyle = 'pointer-events:none;color:gray';
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
      test.possibilityStyle = 'pointer-events:none;color:gray';
    }

    this.parentDeleteByTime(parentMessage);
    const diceroll = await new Roll('1d20x10x20').evaluate();
    if (test.disfavored) {
      test.possibilityTotal = 0.1;
      test.disfavored = false;
      test.chatNote += game.i18n.localize('torgeternity.sheetLabels.explosionCancelled');
    } else {
      test.possibilityTotal = Math.max(10, diceroll.total, test.possibilityTotal);
    }
    test.diceroll = diceroll;

    test.unskilledLabel = 'display:none';
    // add chat note "poss spent"
    test.chatNote += game.i18n.localize('torgeternity.sheetLabels.possSpent');

    await renderSkillChat(test);
  }

  static async #onUp(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    if (!(parentMessage.author.id === game.user.id) && !game.user.isGM) {
      return;
    }
    const test = parentMessage.getFlag('torgeternity', 'test');
    parentMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'pointer-events:none;color:gray;display:none';

    // Roll for Up
    this.parentDeleteByTime(parentMessage);
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
    test.unskilledLabel = 'display:none';

    await renderSkillChat(test);
  }

  static async #onHero(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    if (!(parentMessage.author.id === game.user.id) && !game.user.isGM) {
      return;
    }
    const test = parentMessage.getFlag('torgeternity', 'test');
    test.parentId = parentMessageId;
    parentMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'pointer-events:none;color:gray;display:none';

    // Roll for Possibility
    this.parentDeleteByTime(parentMessage);
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
    test.unskilledLabel = 'display:none';

    await renderSkillChat(test);
  }

  static async #onDrama(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    if (!(parentMessage.author.id === game.user.id) && !game.user.isGM) {
      return;
    }
    const test = parentMessage.getFlag('torgeternity', 'test');
    parentMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'pointer-events:none;color:gray;display:none';

    // Increase cards played by 1
    this.parentDeleteByTime(parentMessage);
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
    test.unskilledLabel = 'display:none';

    await renderSkillChat(test);
  }

  static async #onPlus3(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    if (!(parentMessage.author.id === game.user.id) && !game.user.isGM) {
      return;
    }
    const test = parentMessage.getFlag('torgeternity', 'test');
    parentMessage.setFlag('torgeternity', 'test');
    test.isFavStyle = 'pointer-events:none;color:gray;display:none';

    // Add 1 to cards played
    test.cardsPlayed++;

    // Nullify Diceroll
    test.diceroll = null;

    test.unskilledLabel = 'display:none';
    this.parentDeleteByTime(parentMessage);

    await renderSkillChat(test);
  }

  static async #onBd(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    if (!(parentMessage.author.id === game.user.id) && !game.user.isGM) {
      return;
    }
    const currentTarget = parentMessage.getFlag('torgeternity', 'currentTarget');
    const test = parentMessage.getFlag('torgeternity', 'test');
    test.targetAll = [currentTarget];
    test.sizeModifierAll = [test.sizeModifier];
    test.vulnerableModifierAll = [test.vulnerableModifier];
    test.possibilityStyle = 'display:none';
    test.upStyle = 'display:none';
    test.dramaStyle = 'display:none';
    test.heroStyle = 'display:none';
    test.isFavStyle = 'display:none';
    test.plus3Style = 'display:none';
    parentMessage.setFlag('torgeternity', 'test');
    parentMessage.setFlag('torgeternity', 'currentTarget');
    test.isFavStyle = 'pointer-events:none;color:gray;display:none';
    test.unskilledLabel = 'display:none';
    test.bdDamageLabelStyle = 'display:block';

    const finalValue = await torgBD(test.trademark, 1);

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
    game.messages.get(parentMessageId).delete();

    await renderSkillChat(test);
  }

  static async #onModifier(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    if (parentMessage.author.id !== game.user.id && !game.user.isGM) {
      return;
    }
    TestDialog.renderUpdate(parentMessage.getFlag('torgeternity', 'test'));
  }

  static async #applyDam(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    // if (!game.user.isGM) {return};
    const test = parentMessage.getFlag('torgeternity', 'test');
    const currentTarget = parentMessage.getFlag('torgeternity', 'currentTarget');
    const targetuuid = currentTarget.uuid;
    const dama = test.damage;
    const toug = currentTarget.targetAdjustedToughness;
    await applyDamages(torgDamage(dama, toug), targetuuid); // Need to keep target from test
  }

  static async #soakDam(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    const test = parentMessage.getFlag('torgeternity', 'test');
    const targetid = test.target.id;
    const currentTarget = parentMessage.getFlag('torgeternity', 'currentTarget');
    const targetuuid = currentTarget.uuid;

    if (!(targetid === game.user?.character?.id) && !game.user.isGM) {
      return;
    }
    const soaker = fromUuidSync(targetuuid).actor; // game.actors.get(targetid) ?? game.user.character) ?? game.user.targets.first().actor;
    if (checkForDiscon(soaker)) {
      await ChatMessage.create({
        speaker: ChatMessage.getSpeaker(),
        content: game.i18n.localize('torgeternity.chatText.check.cantUseRealityWhileDisconnected'),
      });
      return;
    }
    //
    let possPool = parseInt(soaker.system.other.possibilities);
    // 0 => if GM ask for confirm, or return message "no poss"
    if ((possPool <= 0) & !game.user.isGM) {
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
    else if ((possPool === 0) & game.user.isGM) {
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

  static #adjustDam(event) {  // context menu, not action
    event.preventDefault();
    const target = event.target;
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    // if (!game.user.isGM) {return};
    const test = parentMessage.getFlag('torgeternity', 'test');
    const targetuuid = parentMessage.getFlag('torgeternity', 'currentTarget').uuid;
    const dama = test.damage;
    const toug = test.targetAdjustedToughness;
    const newDamages = torgDamage(dama, toug);

    const fields = foundry.applications.fields;
    const woundsGroup = fields.createFormGroup({
      label: game.i18n.localize('torgeternity.sheetLabels.modifyWounds'),
      input: fields.createNumberInput({ name: 'nw', value: newDamages.wounds }),
    });

    const shockGroup = fields.createFormGroup({
      label: game.i18n.localize('torgeternity.sheetLabels.modifyShocks'),
      input: fields.createNumberInput({ name: 'ns', value: newDamages.shocks }),
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
            newDamages.wounds = Number(dialog.element.querySelector('input[name=nw]').value);
            newDamages.shocks = Number(dialog.element.querySelector('input[name=ns]').value);
            applyDamages(newDamages, targetuuid);
          },
        },
      ],
      default: 'go',
    });
  }

  static async #applyStym(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    const targetuuid = parentMessage.getFlag('torgeternity', 'currentTarget').uuid;
    const sourceuuid = parentMessage.getFlag('torgeternity', 'test').actor;
    await applyStymiedState(targetuuid, sourceuuid);
  }

  static async #applyVul(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    const targetuuid = parentMessage.getFlag('torgeternity', 'currentTarget').uuid;
    const sourceuuid = parentMessage.getFlag('torgeternity', 'test').actor;
    await applyVulnerableState(targetuuid, sourceuuid);
  }

  /**
   * call backlash1 on targetuuid
   * @param event
   */
  static async #applyBacklash1(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    const targetuuid = parentMessage.getFlag('torgeternity', 'test').actor;
    await backlash1(targetuuid);
  }

  /**
   * call backlash2 on targetuuid
   * @param event
   */
  static async #applyBacklash2(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    const targetuuid = parentMessage.getFlag('torgeternity', 'test').actor;
    await backlash2(targetuuid);
  }

  /**
   * call backlash3 on targetuuid
   * @param event
   */
  static async #applyBacklash3(event, target) {
    event.preventDefault();
    const parentMessageId = target.closest('.chat-message').dataset.messageId;
    const parentMessage = game.messages.get(parentMessageId);
    const targetuuid = parentMessage.getFlag('torgeternity', 'test').actor;
    await backlash3(targetuuid);
  }
}
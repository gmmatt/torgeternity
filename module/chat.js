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
import { TestUpdate } from './test-update.js';

/**
 *
 * @param html
 */
export function addChatListeners(html) {
  html.on('click', 'a.roll-fav', onFavored);
  html.on('click', 'a.roll-possibility', onPossibility);
  html.on('click', 'a.roll-up', onUp);
  html.on('click', 'a.roll-hero', onHero);
  html.on('click', 'a.roll-drama', onDrama);
  html.on('click', 'a.add-plus3', onPlus3);
  html.on('click', 'a.add-bd', onBd);
  html.on('click', 'a.modifier-label', onModifier);
  html.on('click', 'a.applyDam', applyDam);
  html.on('contextmenu', 'a.applyDam', adjustDam);
  html.on('click', 'a.soakDam', soakDam);
  html.on('click', 'a.applyStymied', applyStym);
  html.on('click', 'a.applyVulnerable', applyVul);
  html.on('click', 'a.backlash1', applyBacklash1);
  html.on('click', 'a.backlash2', applyBacklash2);
  html.on('click', 'a.backlash3', applyBacklash3);
}

async function parentDeleteByTime(oldMsg) {
  const parentMessagesIds = [];
  game.messages
    .filter((id) => Math.abs(id.timestamp - oldMsg.timestamp) < 500)
    .forEach((m) => parentMessagesIds.push(m.id));
  parentMessagesIds.forEach((id) => game.messages.get(id).delete());
}

function onFavored(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {
    return;
  }
  const test = parentMessage.getFlag('torgeternity', 'test');
  test.parentId = parentMessageId;
  parentMessage.setFlag('torgeternity', 'test');

  // reRoll because favored
  test.isFavStyle = 'pointer-events:none;color:gray;display:none';

  const diceroll = new Roll('1d20x10x20').evaluate({ async: false });
  test.diceroll = diceroll;
  test.rollTotal = Math.max(test.diceroll.total, 1.1);
  test.isFav = false;

  test.unskilledLabel = 'display:none';

  renderSkillChat(test);
  parentDeleteByTime(parentMessage);
}

async function onPossibility(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {
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
    const confirm = await Dialog.confirm({
      title: game.i18n.localize('torgeternity.sheetLabels.lastPoss'),
      content: game.i18n.localize('torgeternity.sheetLabels.lastPossMess'),
    });
    if (!confirm) return;
    test.chatNote += game.i18n.localize('torgeternity.sheetLabels.lastSpent');
  } // GM can grant an on the fly possibilty if he does the roll
  else if ((possPool === 0) & game.user.isGM) {
    const confirm = await Dialog.confirm({
      title: game.i18n.localize('torgeternity.sheetLabels.noPoss'),
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

  const diceroll = new Roll('1d20x10x20').evaluate({ async: false });
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

  renderSkillChat(test);
  parentDeleteByTime(parentMessage);
}

function onUp(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {
    return;
  }
  const test = parentMessage.getFlag('torgeternity', 'test');
  parentMessage.setFlag('torgeternity', 'test');
  test.isFavStyle = 'pointer-events:none;color:gray;display:none';

  // Roll for Up
  const diceroll = new Roll('1d20x10x20').evaluate({ async: false });
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

  renderSkillChat(test);
  parentDeleteByTime(parentMessage);
}

function onHero(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {
    return;
  }
  const test = parentMessage.getFlag('torgeternity', 'test');
  test.parentId = parentMessageId;
  parentMessage.setFlag('torgeternity', 'test');
  test.isFavStyle = 'pointer-events:none;color:gray;display:none';

  // Roll for Possibility
  const diceroll = new Roll('1d20x10x20').evaluate({ async: false });
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

  renderSkillChat(test);
  parentDeleteByTime(parentMessage);
}

function onDrama(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {
    return;
  }
  const test = parentMessage.getFlag('torgeternity', 'test');
  parentMessage.setFlag('torgeternity', 'test');
  test.isFavStyle = 'pointer-events:none;color:gray;display:none';

  // Increase cards played by 1
  const diceroll = new Roll('1d20x10x20').evaluate({ async: false });
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

  renderSkillChat(test);
  parentDeleteByTime(parentMessage);
}

function onPlus3(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {
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

  renderSkillChat(test);
  parentDeleteByTime(parentMessage);
}

function onBd(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {
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

  const finalValue = torgBD(test.trademark);

  const newDamage = parseInt(test.damage) + parseInt(finalValue.total);
  test.damage = newDamage;
  test.diceroll = finalValue;

  test.amountBD += 1;
  if (test.amountBD === 1) {
    test.chatTitle += ` +${test.amountBD}` + game.i18n.localize('torgeternity.chatText.bonusDice');
  } else if (test.amountBD > 1) {
    test.chatTitle = test.chatTitle.replace(
      (test.amountBD - 1).toString(),
      test.amountBD.toString()
    );
  } else {
    ui.notifications.info(game.i18n.localize('torgeternity.notifications.failureBDResolution'));
  }

  test.unskilledLabel = 'display:none';

  renderSkillChat(test);
  game.messages.get(parentMessageId).delete();
}

function onModifier(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  if (!(parentMessage.user.id === game.user.id) && !game.user.isGM) {
    return;
  }
  const test = parentMessage.getFlag('torgeternity', 'test');

  const testDialog = new TestUpdate(test);
  testDialog.render(true);
}

async function applyDam(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  // if (!game.user.isGM) {return};
  const test = parentMessage.getFlag('torgeternity', 'test');
  const currentTarget = parentMessage.getFlag('torgeternity', 'currentTarget');
  const targetuuid = currentTarget.uuid;
  const dama = test.damage;
  const toug = currentTarget.targetAdjustedToughness;
  await applyDamages(torgDamage(dama, toug), targetuuid); // Need to keep target from test
}

async function soakDam(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  const test = parentMessage.getFlag('torgeternity', 'test');
  const targetid = test.target.id;
  const currentTarget = parentMessage.getFlag('torgeternity', 'currentTarget');
  const targetuuid = currentTarget.uuid;

  if (!(targetid === game.user?.character?.id) && !game.user.isGM) {
    return;
  }
  const soaker = fromUuidSync(targetuuid).actor; // game.actors.get(targetid) ?? game.user.character) ?? Array.from(game.user.targets)[0].actor;
  //
  let possPool = parseInt(soaker.system.other.possibilities);
  // 0 => if GM ask for confirm, or return message "no poss"
  if ((possPool <= 0) & !game.user.isGM) {
    ui.notifications.warn(' No possibility !');
    return;
  }

  // 1=> pop up warning, confirm "spend last poss?"
  if (possPool === 1) {
    const confirm = await Dialog.confirm({
      title: 'Last possibility !',
      content: `<h4>This is your last possibility, do you confirm ?<br>Are You Sure</h4>`,
    });
    if (!confirm) return;
  } // GM can grant an on the fly possibilty if he does the roll
  else if ((possPool === 0) & game.user.isGM) {
    const confirm = await Dialog.confirm({
      title: 'No possibility !',
      content: `<h4> This actor has no possibility, do you confirm ?<br>Are You Sure</h4>`,
    });
    if (!confirm) return;
    ui.notifications.warn(' You grant a possibility !');
    possPool += 1;
  }

  soakDamages(soaker);
  await soaker.update({ 'system.other.possibilities': possPool - 1 });
}

async function adjustDam(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  // if (!game.user.isGM) {return};
  const test = parentMessage.getFlag('torgeternity', 'test');
  const targetuuid = parentMessage.getFlag('torgeternity', 'currentTarget').uuid;
  const dama = test.damage;
  const toug = test.targetAdjustedToughness;
  const newDamages = torgDamage(dama, toug);
  const oldWounds = newDamages.wounds;
  const oldShocks = newDamages.shocks;
  let newWounds;
  let newShocks;
  const content = `<p>${game.i18n.localize('torgeternity.sheetLabels.modifyDamage')}</p> <hr>
    <form>
    <div class="form-group"><label for="nw">${game.i18n.localize(
      'torgeternity.sheetLabels.modifyWounds'
    )}</label>
    <div class="form-fields"><input type="number" id="nw" value=${oldWounds}></input></div></div>
    <div class="form-group"><label for="ns">${game.i18n.localize(
      'torgeternity.sheetLabels.modifyShocks'
    )}</label>
    <div class="form-fields"><input type="number" id="ns" value=${oldShocks}></input></div></div>
    </form>`;
  await new Dialog({
    content,
    title: game.i18n.localize('torgeternity.sheetLabels.chooseDamage'),
    buttons: {
      go: {
        icon: `<i class="fas fa-check"></i>`,
        label: game.i18n.localize('torgeternity.submit.apply'),
        callback: async (html) => {
          newWounds = Number(html[0].querySelector('input[id=nw]').value);
          newShocks = Number(html[0].querySelector('input[id=ns]').value);
          // do calculation here to get x and y, then do following function:
          newDamages.wounds = newWounds;
          newDamages.shocks = newShocks;
          applyDamages(newDamages, targetuuid);
        },
      },
    },
    default: 'go',
  }).render(true);
}

async function applyStym(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  const targetuuid = parentMessage.getFlag('torgeternity', 'currentTarget').uuid;
  const sourceuuid = parentMessage.getFlag('torgeternity', 'test').actor;
  await applyStymiedState(targetuuid, sourceuuid);
}

async function applyVul(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  const targetuuid = parentMessage.getFlag('torgeternity', 'currentTarget').uuid;
  const sourceuuid = parentMessage.getFlag('torgeternity', 'test').actor;
  await applyVulnerableState(targetuuid, sourceuuid);
}

/**
 * call backlash1 on targetuuid
 * @param event
 */
async function applyBacklash1(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  const targetuuid = parentMessage.getFlag('torgeternity', 'test').actor;
  await backlash1(targetuuid);
}

/**
 * call backlash2 on targetuuid
 * @param event
 */
async function applyBacklash2(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  const targetuuid = parentMessage.getFlag('torgeternity', 'test').actor;
  await backlash2(targetuuid);
}

/**
 * call backlash3 on targetuuid
 * @param event
 */
async function applyBacklash3(event) {
  const parentMessageId = event.currentTarget.closest('.chat-message').dataset.messageId;
  const parentMessage = game.messages.find(({ id }) => id === parentMessageId);
  const targetuuid = parentMessage.getFlag('torgeternity', 'test').actor;
  await backlash3(targetuuid);
}

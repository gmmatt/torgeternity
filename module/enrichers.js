import { TestDialog } from './test-dialog.js';

/**
 * INLINE CHECKS
 */

// @Check[thing|dn:difficulty]{label}
const InlineRulePattern = /@Check\[(.+?)\](?:\{(.+?)\}){0,1}/g;

/**
 * The enricher to create the link when a page is displayed.
 * @param {*} match 
 * @param {*} options 
 * @returns 
 */
function InlineRuleEnricher(match, options) {
  const parts = match[1].split('|');
  let label = match[2];
  const check = parts.shift();

  // Decode each of the parameters
  const dataset = { testType: check };
  for (const elem of parts) {
    const [key, value] = elem.split("=");
    dataset[key] = value ?? true;
  }

  // Create the base anchor
  const anchor = foundry.applications.ux.TextEditor.createAnchor({
    //attrs: null, 
    dataset,
    name: label ?? check,
    classes: ['torg-inline-check'],
    icon: "fa-solid fa-dice-d20"
  });
  // Add we are manually creating a label, place the DN in a separate span
  if (!label && dataset.dn) {
    const span = document.createElement('span');
    span.classList.add('dn');
    span.append(` (DN ${dataset.dn})`);
    anchor.append(span);
  }
  // Append a button to copy the link to chat (only when in Journal)
  if (!parts.includes('fromchat') && game.user.isGM) {
    const icon = document.createElement("i");
    icon.classList.add('icon', 'fa-solid', 'fa-comment', 'toChat');
    icon.dataset.original = match[0].replace("]", "|fromchat]");
    anchor.append(icon);
  }
  return anchor;
}

const interactionAttacks = ['unarmed', 'intimidation', 'maneuver', 'taunt', 'kick'];

/**
 * The click handler to trigger the Test Dialog when the button is clicked.
 * @param {*} event 
 */
function _onClickInlineCheck(event) {
  const target = event.target.closest('a.torg-inline-check');
  // Firstly check for clicking on the "post to chat" button
  if (event.target.dataset.original) {
    ChatMessage.create({ content: event.target.dataset.original })
    return;
  }

  const test = { ...target.dataset };

  // Same test as in 'rollSkillMacro'
  let actor = null;
  const speaker = ChatMessage.getSpeaker();
  if (speaker.token) actor = game.actors.tokens[speaker.token];
  if (!actor) actor = game.actors.get(speaker.actor);

  const choice = test.testType;
  if (test.dn) {
    const dnmap = {
      "6": "veryEasy",
      "8": "easy",
      "10": "standard",
      "12": "challenging",
      "14": "hard",
      "16": "veryHard",
      "18": "heroic",
      "20": "nearImpossible",
    }
    test.dn = dnmap[test.dn] ?? test.dn;
  }

  // See if we can pass the check off to `rollSkillMacro`
  if (actor.system.skills[test.testType]) {  // CONFIG.torgeternity.skills
    const isInteractionAttack = test.attack ?? interactionAttacks[choice] ?? false;
    return game.torgeternity.rollSkillMacro(choice, test.attr ?? actor.system.skills[test.testType].baseAttribute, isInteractionAttack, test.dn ?? 'standard');
  } else if (actor.system.attributes[test.testType]) { // CONFIG.torgeternity.attributeTypes
    return game.torgeternity.rollSkillMacro(choice, choice, test.attack ?? false, test.dn ?? 'standard');
  }
  // Not rollSkillMacro, so anything can be set in the test.

  // Add Actor information
  test.actor = actor;
  test.DNDescriptor = test.dn;
  if (!Object.hasOwn(CONFIG.torgeternity.dnTypes, test.DNDescriptor)) {
    ui.notifications.warn('Unrecognized DN in check', { field: test.DNDescriptor });
    return;
  }

  // @Check[interactionAttack|skillName=intimidation|dn=targetIntimidation|unskilledUse=true]

  // Add Skill/Attribute values from the actor
  if (test.skillName && actor.system.skills[test.skillName]) {
    const skill = actor.system.skills[test.skillName];
    test.skillAdds ??= skill.adds;
    test.skillValue ??= skill.value;
  }

  return TestDialog.wait(test, { useTargets: true });
}


/**
 * INLINE CONDITIONS
 * 
 * @Condition[status]{label}
 */
const InlineConditionPattern = /@Condition\[(.+?)\](?:\{(.+?)\}){0,1}/g;

function InlineConditionEnricher(match, options) {
  const parts = match[1].split('|');
  let label = match[2];
  const status = parts.shift();

  // Decode each of the parameters
  const dataset = { status };
  for (const elem of parts) {
    const [key, value] = elem.split("=");
    dataset[key] = value ?? true;
  }

  // Create the base anchor
  const anchor = foundry.applications.ux.TextEditor.createAnchor({
    //attrs: null, 
    dataset,
    name: label ?? game.i18n.localize(`torgeternity.statusEffects.${status}`),
    classes: ['torg-inline-condition'],
    icon: "fa-solid fa-circle-plus"
  });
  // Append a button to copy the link to chat (only when in Journal)
  if (!parts.includes('fromchat') && game.user.isGM) {
    const icon = document.createElement("i");
    icon.classList.add('icon', 'fa-solid', 'fa-comment', 'toChat');
    icon.dataset.original = match[0].replace("]", "|fromchat]");
    anchor.append(icon);
  }
  return anchor;
}

/**
 * The click handler to trigger the Test Dialog when the button is clicked.
 * @param {*} event 
 */
async function _onClickInlineCondition(event) {
  const target = event.target.closest('a.torg-inline-condition');
  // Firstly check for clicking on the "post to chat" button
  if (event.target.dataset.original) {
    ChatMessage.create({ content: event.target.dataset.original })
    return;
  }

  const data = { ...target.dataset };

  const options = { active: true };
  if (Object.hasOwn(data, "toggle")) delete options.active;
  if (Object.hasOwn(data, "active")) options.active = data.active;
  if (Object.hasOwn(data, "overlay")) options.overlay = data.overlay;

  // Special case of stymied/vulnerable stacking
  for (const actor of getActors()) {
    const status = data.status;
    if (status === 'stymied' && options.active) {
      if (actor.hasStatusEffect('stymied')) {
        actor.setVeryStymied();
        continue;
      } else if (actor.hasStatusEffect('veryStymied'))
        continue;
    } else if (status === 'vulnerable' && options.active) {
      if (actor.hasStatusEffect('vulnerable')) {
        actor.setVeryVulnerable();
        continue;
      } else if (actor.hasStatusEffect('veryVulnerable'))
        continue;
    }
    console.log(`Setting '${actor.name}' = '${status}'`);
    await actor.toggleStatusEffect(status, options);
  }
}

/**
 * BUFF/DEBUFF specific attribute/skills
 */

const InlineBuffPattern = /@Buff\[(.+?)\](?:\{(.+?)\}){0,1}/g;

function InlineBuffEnricher(match, options) {
  const parts = match[1].split('|');
  let label = match[2];
  const dataset = {};

  function check(from, modifier, obj, type) {
    // Firstly check for property name
    if (Object.hasOwn(obj, from)) {
      dataset[`${type}${from}`] = modifier;
      return true;
    }
    // Now check for localized name
    for (const [key, value] of Object.entries(obj)) {
      const local = game.i18n.localize(value);
      if (local === from) {
        dataset[`${type}${key}`] = modifier;
        return true;
      }
    }
    return false;
  }

  // Decode each of the parameters
  let found;
  for (const elem of parts) {
    const [key, value] = elem.split("=");
    if (value === undefined) {
      dataset[key] = true;
      continue;
    }
    if (check(key, value, CONFIG.torgeternity.attributeTypes, 'attribute') ||
      check(key, value, CONFIG.torgeternity.skills, 'skill'))
      found = true;
    else
      dataset[key] = value ?? true;
  }

  if (!found) {
    console.warn(`Unrecognised @Buff key: ${skillAttribute}`)
    return match[0];
  }

  function createLabel() {
    const parts = [];
    for (const [k, v] of Object.entries(dataset)) {
      if (k.startsWith('skill'))
        parts.push(k.slice(5) + ` (${v})`);
      else if (k.startsWith('attribute'))
        parts.push(k.slice(9) + ` (${v})`);
    }
    return parts.join(', ');
  }

  // Create the base anchor
  const anchor = foundry.applications.ux.TextEditor.createAnchor({
    dataset,
    name: label ?? createLabel(),
    classes: ['torg-inline-buff'],
    icon: "fa-solid fa-bolt-lightning"
  });
  // Append a button to copy the link to chat (only when in Journal)
  if (!parts.includes('fromchat') && game.user.isGM) {
    const icon = document.createElement("i");
    icon.classList.add('icon', 'fa-solid', 'fa-comment', 'toChat');
    icon.dataset.original = match[0].replace("]", "|fromchat]");
    anchor.append(icon);
  }
  return anchor;
}

/**
 * The click handler to trigger the Test Dialog when the button is clicked.
 * @param {*} event 
 */
async function _onClickInlineBuff(event) {
  const target = event.target.closest('a.torg-inline-buff');
  // Firstly check for clicking on the "post to chat" button
  if (event.target.dataset.original) {
    ChatMessage.create({ content: event.target.dataset.original })
    return;
  }

  // Convert dataset into a set of active effect rules
  const effectdata = {
    name: target.text || 'FromBuff',
    img: 'icons/svg/aura.svg',
    //disabled: false,
    //transfer: false,  // Placed directly on Actor, so not transferred
    changes: []
  };

  function getMode(v) {
    if (v.startsWith('-') || v.startsWith('+'))
      return CONST.ACTIVE_EFFECT_MODES.ADD;
    else
      return CONST.ACTIVE_EFFECT_MODES.OVERRIDE;
  }
  for (const [key, value] of Object.entries({ ...target.dataset })) {
    if (key === 'fromchat')
      continue;
    else if (key.startsWith('skill'))
      effectdata.changes.push({
        key: `system.skills.${key.slice(5)}.adds`,
        mode: getMode(value),
        value: value
      });
    else if (key.startsWith('attribute'))
      effectdata.changes.push({
        key: `system.attributes.${key.slice(9)}.value`,
        mode: getMode(value),
        value: value
      });
    else if (key === 'duration') {
      if (!effectdata.duration) effectdata.duration = {}
      effectdata.duration.rounds = value;
      effectdata.duration.turns = value;
    } else
      foundry.utils.setProperty(effectdata, key, value);
  }

  // Add an effect to each actor
  for (const actor of getActors()) {
    //console.log(`Setting '${actor.name}'`, effectdata);
    actor.createEmbeddedDocuments('ActiveEffect', [effectdata]);
  }
}

/**
 * COMMON INITIALISATION
 */
const enrichers = [
  { pattern: InlineRulePattern, enricher: InlineRuleEnricher },
  { pattern: InlineConditionPattern, enricher: InlineConditionEnricher },
  { pattern: InlineBuffPattern, enricher: InlineBuffEnricher },
];

export default function InitEnrichers() {
  CONFIG.TextEditor.enrichers.push(...enrichers);
  // Global listener, for any place: journals or chat
  document.body.addEventListener('click', event => {
    if (event.target?.closest("a.torg-inline-check"))
      _onClickInlineCheck(event);
    else if (event.target?.closest("a.torg-inline-condition"))
      _onClickInlineCondition(event);
    else if (event.target?.closest("a.torg-inline-buff"))
      _onClickInlineBuff(event);
  })
}


function getActors() {
  if (!canvas.ready || canvas.tokens.controlled.length === 0)
    return game.user.character ? [game.user.character] : [];
  else
    return canvas.tokens.controlled.filter(token => token.isOwner).map(token => token.actor);
}
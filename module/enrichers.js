import { TestDialog } from './test-dialog.js';

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
  if (options.relativeTo && game.user.isGM) {
    const icon = document.createElement("i");
    icon.classList.add('icon', 'fa-solid', 'fa-comment', 'toChat');
    icon.dataset.original = match.input;
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
  } else if ((actor.system.attributes[test.testType])) { // CONFIG.torgeternity.attributeTypes
    return game.torgeternity.rollSkillMacro(choice, choice, test.attack ?? false, test.dn ?? 'standard');
  }
  // Not rollSkillMacro, so anything can be set in the test.

  // Add Actor information
  test.actor = actor.uuid;
  test.actorPic = actor.img;
  test.actorType = actor.type;
  test.actorName = actor.name;
  test.DNDescriptor = test.dn;
  if (!Object.hasOwn(CONFIG.torgeternity.dnTypes, test.DNDescriptor)) {
    ui.notifications.warn('Unrecognized DN in check', { field: test.DNDescriptor });
    return;
  }

  // @Check[interactionAttack|skillName=intimidation|dn=targetIntimidation|unskilledUse=true]

  // Add Skill/Attribute values from the actor
  if (test.skillName && actor.system.skills[test.skillName]) {
    const skill = actor.system.skills[test.skillName];
    test.skillBaseAttribute ??= 'torgeternity.skills.' + skill.baseAttribute;
    test.skillAdds ??= skill.adds;
    test.skillValue ??= skill.value;
  }

  (new TestDialog(test, { useTargets: true })).render(true);
}

const enrichers = [
  {
    pattern: InlineRulePattern,
    enricher: InlineRuleEnricher
  }
];

export default function InitEnrichers() {
  CONFIG.TextEditor.enrichers.push(...enrichers);
  // Global listener, for any place: journals or chat
  document.body.addEventListener('click', event => {
    if (event.target?.closest("a.torg-inline-check")) _onClickInlineCheck(event);
  })
}

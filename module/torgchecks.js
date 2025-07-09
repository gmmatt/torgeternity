import { TestDialog } from './test-dialog.js';
import { checkUnskilled } from './sheets/torgeternityActorSheet.js';
import { ChatMessageTorg } from './documents/chat/document.js';

export const TestResult = {
  MISHAP: 0,
  FAILURE: 1,
  STANDARD: 2,
  GOOD: 3,
  OUTSTANDING: 4
}
/**
 *
 * @param test
 */
export async function renderSkillChat(test) {
  const messages = [];

  // For non-targeted tests, ensure we iterate through the loop at least once
  if (!test.targetAll.length) test.targetAll = [{}];

  // disable DSN (if used) for 'every' message (want to show only one dice despite many targets)
  if (game.dice3d) game.dice3d.messageHookDisabled = true;

  test.applyDebuffLabel = 'display:none';
  test.applyDamLabel = 'display:none';
  test.backlashLabel = 'display:none';
  test.torgDiceStyle = game.settings.get('torgeternity', 'useRenderedTorgDice');
  test.bdDamageLabelStyle = test.bdDamageSum ? 'display:block' : 'display:none';
  let iteratedRoll;

  for (const target of test.targetAll) {
    if (target.present && target.type === 'vehicle' && isNaN(target.defenses.dodge)) {
      ui.notifications.error(
        game.i18n.format('torgeternity.notifications.noVehicleOperator', { a: target.targetName })
      );
      return;
    }
  }

  // Handle ammo, if not opt-out. First, check if there is enough ammo, then reduce it.
  if (test.item?.weaponWithAmmo && !game.settings.get('torgeternity', 'ignoreAmmo')) {
    await test?.item.reduceAmmo(test.burstModifier, test.targetAll?.length);
    test.ammoLabel = 'display:table-row';
  } else {
    test.ammoLabel = 'display:none';
  }

  const testActor = fromUuidSync(test.actor);

  const uniqueDN = game.settings.get('torgeternity', 'uniqueDN') ? await highestDN(test) : undefined;
  let first = true;
  for (const target of test.targetAll) {
    test.target = target;
    test.sizeModifier = target.sizeModifier;
    test.vulnerableModifier = target.vulnerableModifier;

    //
    // Check to see if we already have a chat title from a chat card roll. If not, Set title for Chat Message in test.chatTitle //
    //
    if (!test.chatTitle) {
      switch (test.testType) {
        case 'attribute':
          test.chatTitle = `${game.i18n.localize('torgeternity.attributes.' + test.skillName)} ${game.i18n.localize('torgeternity.chatText.test')} `;
          break;
        case 'skill':
          test.chatTitle = test.customSkill ? `${test.skillName} ` :
            `${game.i18n.localize('torgeternity.skills.' + test.skillName)} ${game.i18n.localize('torgeternity.chatText.test')} `;
          break;
        case 'interactionAttack':
        case 'attack':
          test.chatTitle = `${game.i18n.localize('torgeternity.skills.' + test.skillName)} ${game.i18n.localize('torgeternity.chatText.attack')} `;
          break;
        case 'soak':
          test.chatTitle = `${game.i18n.localize('torgeternity.sheetLabels.soakRoll')} `;
          break;
        case 'activeDefense':
          test.chatTitle = `${game.i18n.localize('torgeternity.sheetLabels.activeDefense')} `;
          break;
        case 'power':
          test.chatTitle = `${test.powerName} ${game.i18n.localize('torgeternity.chatText.test')} `;
          break;
        case 'chase':
          test.chatTitle = `${game.i18n.localize('torgeternity.chatText.chase')} `;
          break;
        case 'stunt':
          test.chatTitle = `${game.i18n.localize('torgeternity.chatText.stunt')} `;
          break;
        case 'vehicleBase':
          test.chatTitle = `${game.i18n.localize('torgeternity.chatText.vehicleBase')}  `;
          break;
        case 'custom':
          test.chatTitle = test.skillName;
          break;
        default:
          test.chatTitle = `${test.skillName} ${game.i18n.localize('torgeternity.chatText.test')}  `;
      }
    }

    //
    // Establish DN for this test based on test.DNDescriptor //
    //
    test.DN = uniqueDN ?? await individualDN(test, target);

    //
    // -----------------------Determine Bonus---------------------------- //

    // Do we display the unskilled label for a Storm Knight?
    test.unskilledTest = (testActor.type === 'stormknight' &&
      test.testType !== 'custom' &&
      test.testType !== 'attribute' &&
      test.testType !== 'activeDefense' &&
      test.testType !== 'activeDefenseUpdate' &&
      test.customSkill !== 'true' &&
      !testActor.system.skills[test.skillName].adds);

    test.unskilledLabel = test.unskilledTest ? 'display:block' : 'display:none';

    // Generate roll, if needed
    if (test.rollTotal === 0 && !test.previousBonus) {
      // Generate dice roll
      const dice = test.unskilledTest ? '1d20x10' : '1d20x10x20';

      test.diceroll = await new Roll(dice).evaluate();
      if (test.isFav && test.disfavored) {
        test.isFav = false;
        test.disfavored = false;
        test.chatNote += game.i18n.localize('torgeternity.sheetLabels.favDis');
      }
      if (!test.isFav) {
        test.isFavStyle = 'pointer-events:none;color:gray;display:none';
      }
      if (test.disfavored) {
        // even if explosion occured, we keep first die
        test.rollTotal = test.diceroll.dice[0].results[0].result;
        if (test.diceroll.dice[0].results.length > 1) {
          // => explosion occured, so remove disfavored
          test.disfavored = false;
          test.chatNote += game.i18n.localize('torgeternity.sheetLabels.explosionCancelled');
        }
      } else test.rollTotal = test.diceroll.total;
    }

    // Add the dices list in test
    // add the dices only once, not for each target
    if (first && test.diceroll) {
      // to avoid errors if +3 cards
      test.diceList = test.diceList ? test.diceList.concat(test.diceroll.dice[0].values) : test.diceroll.dice[0].values;
    }

    //
    // Get current bonus and make + label visible if number is positive
    //
    // Initialize upTotal, possibilityTotal, heroTotal, and dramaTotal at zero, if necessary
    test.upTotal ??= 0;
    test.possibilityTotal ??= 0;
    test.heroTotal ??= 0;
    test.dramaTotal ??= 0;

    // Calculate combinedRollTotal
    test.combinedRollTotal =
      parseInt(test.rollTotal) +
      parseInt(test.upTotal) +
      parseInt(test.possibilityTotal) +
      parseInt(test.heroTotal) +
      parseInt(test.dramaTotal);
    if (test.previousBonus != true) {
      test.bonus = torgBonus(test.combinedRollTotal);
    } else {
      test.rollTotal = undefined;
      test.combinedRollTotal = '-';
    }

    // Raise bonus to 1 if actively defending
    if (test.testType === 'activeDefense' || test.testType === 'activeDefenseUpdate') {
      if (test.bonus < 1) test.bonus = 1;
    }

    // Add plus label if number is positive
    test.bonusPlusLabel = (test.bonus >= 1) ? 'display:inline' : 'display:none';

    function modifierString(label, value) {
      let result = game.i18n.localize(label);
      if (value) result += ` (${value > 0 ? '+' : ''}${value})`
      result += '<br>';
      return result;
    }

    // Set Modifiers and Chat Content Relating to Modifiers
    test.displayModifiers = true;
    test.modifiers = 0;
    test.modifierText = '';
    if (test.testTtype === 'soak') test.vulnerableModifier = 0;

    if (test.woundModifier < 0) {
      test.displayModifiers = true;
      test.modifierText = modifierString('torgeternity.chatText.check.modifier.wounds', test.woundModifier);
      test.modifiers = parseInt(test.woundModifier);
    }

    if (test.stymiedModifier < 0) {
      test.displayModifiers = true;
      if (test.stymiedModifier == -2) {
        test.modifierText += modifierString('torgeternity.chatText.check.modifier.stymied');
        test.modifiers += -2;
      } else if (test.stymiedModifier == -4) {
        test.modifierText += modifierString('torgeternity.chatText.check.modifier.veryStymied');
        test.modifiers += -4;
      }
    }

    if (test.darknessModifier < 0) {
      test.displayModifiers = true;
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.darkness', test.darknessModifier);
      test.modifiers += parseInt(test.darknessModifier);
    }

    if (test.movementModifier < 0) {
      test.displayModifiers = true;
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.running');
      test.modifiers += -2;
    }

    if (test.multiModifier < 0) {
      test.displayModifiers = true;
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.multiAction', test.multiModifier);
      test.modifiers += parseInt(test.multiModifier);
    }

    if (test.targetsModifier < 0) {
      test.displayModifiers = true;
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.multiTarget', test.targetsModifier);
      test.modifiers += parseInt(test.targetsModifier);
    }

    if (test.isOther1) {
      test.displayModifiers = true;
      test.modifierText += modifierString(test.other1Description, test.other1Modifier);
      test.modifiers += parseInt(test.other1Modifier);
    }

    if (test.isOther2) {
      test.displayModifiers = true;
      test.modifierText += modifierString(test.other2Description, test.other2Modifier);
      test.modifiers += parseInt(test.other2Modifier);
    }

    if (test.isOther3) {
      test.displayModifiers = true;
      test.modifierText += modifierString(test.other3Description, test.other3Modifier);
      test.modifiers += parseInt(test.other3Modifier);
    }

    // Apply target-related modifiers
    if (target?.present) {
      // Apply the size modifier in appropriate circumstances
      if (test.applySize && test.sizeModifier) {
        test.displayModifiers = true;
        test.modifiers += parseInt(test.sizeModifier);
        test.modifierText += modifierString('torgeternity.chatText.check.modifier.targetSize', test.sizeModifier);
      }

      // Apply target vulnerability modifier
      if (test.vulnerableModifier === 2) {
        test.displayModifiers = true;
        test.modifiers += parseInt(test.vulnerableModifier);
        test.modifierText += modifierString('torgeternity.chatText.check.modifier.targetVulnerable');
      } else if (test.vulnerableModifier === 4) {
        test.displayModifiers = true;
        test.modifiers += parseInt(test.vulnerableModifier);
        test.modifierText += modifierString('torgeternity.chatText.check.modifier.targetVeryVulnerable');
      }
    }

    if (test.calledShotModifier) {
      test.modifiers += parseInt(test.calledShotModifier);
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.calledShot', test.calledShotModifier);
    }

    if (test.burstModifier) {
      test.modifiers += parseInt(test.burstModifier);
      if (test.burstModifier === 2) {
        test.modifierText += modifierString('torgeternity.chatText.check.modifier.shortBurst');
      } else if (test.burstModifier === 4) {
        test.modifierText += modifierString('torgeternity.chatText.check.modifier.longBurst');
      } else if (test.burstModifier === 6) {
        test.modifierText += modifierString('torgeternity.chatText.check.modifier.heavyBurst');
      }
    }

    if (test.allOutModifier) {
      test.modifiers += 4;
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.allOutAttack');

      // if it's an all-out-attack, apply very vulnerable to attacker
      if (first) await testActor.setVeryVulnerable();
    }

    if (test.aimedModifier) {
      test.modifiers += 4;
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.aimedShot');
    }

    if (test.blindFireModifier) {
      test.modifiers += -6;
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.blindFire');
    }

    if (test.concealmentModifier) {
      test.modifiers += parseInt(test.concealmentModifier);
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.targetConcealment', test.concealmentModifier);
    }

    if (test.testType === 'power' && test.powerModifier) {
      test.displayModifiers = true;
      test.modifiers += parseInt(test.powerModifier);
      test.modifierText += modifierString('torgeternity.chatText.check.modifier.powerModifier', test.powerModifier);
    }

    // Apply vehicle-related modifiers
    if (test.testType === 'chase' || test.testType === 'stunt' || test.testType === 'vehicleBase') {
      if (test.maneuverModifier) {
        test.displayModifiers = true;
        test.modifiers += parseInt(test.maneuverModifier);
        test.modifierText += modifierString('torgeternity.stats.maneuverModifier', test.maneuverModifier);
      }
    }

    if (test.testType === 'chase' && test.speedModifier) {
      test.displayModifiers = true;
      test.modifiers += parseInt(test.speedModifier);
      test.modifierText += modifierString('torgeternity.stats.speedModifier', test.speedModifier);
    }

    if (test.displayModifiers) {
      test.modifierLabel = 'display:';
      test.modifierText = `<p>${test.modifierText}</p>`;
    } else {
      test.modifierLabel = 'display:none';
    }

    // Add +3 cards to bonus
    // Initialize cardsPlayed if null
    test.cardsPlayed ??= 0;
    const tempBonus = parseInt(test.bonus);
    test.bonus = parseInt(tempBonus) + parseInt(test.cardsPlayed) * 3;

    test.rollResult = parseInt(test.skillValue) + parseInt(test.bonus) + parseInt(test.modifiers);

    // Determine Outcome
    const testDifference = test.rollResult - test.DN;

    test.actionTotalContent = `${game.i18n.localize('torgeternity.chatText.check.result.actionTotal')} ${test.rollResult} vs. ${test.DN} ${game.i18n.localize('torgeternity.dnTypes.' + test.DNDescriptor)}`;

    const useColorBlind = game.settings.get('torgeternity', 'useColorBlindnessColors');
    if (testDifference < 0) {
      test.outcome = game.i18n.localize('torgeternity.chatText.check.result.failure');
      test.result = TestResult.FAILURE;
      if (test.testType === 'power') {
        test.backlashLabel = 'display:inline';
      }
      test.outcomeColor = useColorBlind ? 'color: red' :
        'color: red;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      test.soakWounds = 0;
    } else if (testDifference > 9) {
      test.outcome = game.i18n.localize('torgeternity.chatText.check.result.outstandingSuccess');
      test.result = TestResult.OUTSTANDING;
      test.outcomeColor = useColorBlind ? 'color: rgb(44, 179, 44)' :
        'color: green;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      test.soakWounds = 'all';
    } else if (testDifference > 4) {
      test.outcome = game.i18n.localize('torgeternity.chatText.check.result.goodSuccess');
      test.result = TestResult.GOOD;
      test.outcomeColor = useColorBlind ? 'color: rgb(44, 179, 44)' :
        'color: green;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      test.soakWounds = 2;
    } else {
      test.outcome = game.i18n.localize('torgeternity.chatText.check.result.standartSuccess');
      test.result = TestResult.STANDARD;
      test.outcomeColor = useColorBlind ? 'color: rgb(44, 179, 44)' :
        'color: green;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      test.soakWounds = 1;
    }

    // Turn on + sign for modifiers?
    test.modifierPlusLabel = (test.modifiers >= 1) ? 'display:' : 'display:none';

    // Choose Text to Display as Result
    if (testActor.isDisconnected) {
      test.possibilityStyle = 'display:none';
      test.heroStyle = 'display:none';
      test.dramaStyle = 'display:none';
    }

    if (
      test.rollTotal === 1 &&
      !(test.testType === 'activeDefenseUpdate' || test.testType === 'activeDefense')
    ) {
      // Roll 1 and not defense = Mishap
      test.result = TestResult.MISHAP;
      test.resultText = game.i18n.localize('torgeternity.chatText.check.result.mishape');
      test.outcomeColor = 'color: purple';
      test.resultTextColor = 'color: purple';
      if (!useColorBlind) {
        test.outcomeColor += ';text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
        test.resultTextColor += ';text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      }
      test.actionTotalLabel = 'display:none';
      test.possibilityStyle = 'display:none';
      test.upStyle = 'display:none';
      test.dramaStyle = 'display:none';
      test.heroStyle = 'display:none';
      test.isFavStyle = 'display:none';
      test.bdStyle = 'display:none';
      test.plus3Style = 'display:none';
      if (test.testType === 'soak')
        test.chatNote =
          game.i18n.localize('torgeternity.sheetLabels.soakNull') +
          game.i18n.localize('torgeternity.sheetLabels.possSpent');
      test.applyDamLabel = 'display:none';

    } else if (test.testType === 'soak') {
      test.applyDamLabel = 'display:none';
      test.resultText = test.outcome;
      test.resultTextColor = test.outcomeColor;
      if (test.soakWounds > 0) {
        test.chatNote =
          `${test.soakWounds} ` +
          game.i18n.localize('torgeternity.sheetLabels.soakValue') +
          game.i18n.localize('torgeternity.sheetLabels.possSpent');
      } else if (test.soakWounds === 'all') {
        test.chatNote =
          game.i18n.localize('torgeternity.sheetLabels.soakAll') +
          game.i18n.localize('torgeternity.sheetLabels.possSpent');
      } else {
        test.chatNote =
          game.i18n.localize('torgeternity.sheetLabels.soakNull') +
          game.i18n.localize('torgeternity.sheetLabels.possSpent');
      }
      // Create and Manage Active Effect if SK is Actively Defending (thanks Durak!)

    } else if (test.testType === 'activeDefense') {
      // Click on defense
      const oldAD = testActor.effects.find((a) => a.name === 'ActiveDefense'); // Search for an ActiveDefense effect
      if (oldAD) {
        // if present, reset by deleting
        oldAD.delete();
        return ChatMessage.create({
          // Simple chat message for information
          speaker: ChatMessage.getSpeaker(),
          content: game.i18n.localize('torgeternity.chatText.check.result.resetDefense'), // Need to be implemented if incorporated
        });
      } else {
        await testActor.setActiveDefense(test.bonus);
        test.testType = 'activeDefenseUpdate';
        test.resultText = '+ ' + test.bonus;
        test.actionTotalLabel = 'display:none';
      }

    } else if (test.testType === 'activeDefenseUpdate') {
      // update bonus in case of bonus roll possibility / up
      // Delete Existing Active Effects
      testActor.effects.find((a) => a.name === 'ActiveDefense')?.delete();
      if (test.bonus < 1) test.bonus = 1;
      test.resultText = '+ ' + test.bonus;
      // Create new set of active effects
      testActor.setActiveDefense(test.bonus);

    } else {
      test.resultText = test.outcome;
      test.resultTextColor = test.outcomeColor;
    }

    // If an attack, calculate and display damage
    if (test.isAttack) {
      test.damageLabel = 'display: block';
      // Add damage modifier for vital area hits, if necessary
      let adjustedDamage = test.damage;
      if (test.vitalAreaDamageModifier) {
        adjustedDamage = test.damage + test.vitalAreaDamageModifier;
      }
      // add additional Damage from roll dialogue
      if (test?.additionalDamage && !test.previousBonus) {
        adjustedDamage += test?.additionalDamage;
      }
      // Check for whether a target is present and turn on display of damage sub-label
      if (test?.target?.present) {
        test.damageSubLabel = 'display:block';
        // If armor and cover can assist, adjust toughness based on AP effects and cover modifier
        if (test.applyArmor) {
          test.targetAdjustedToughness =
            test.target.toughness -
            Math.min(parseInt(test.weaponAP), test.target.armor) +
            parseInt(test.coverModifier);
          // Ignore armor and cover
        } else {
          test.targetAdjustedToughness = test.target.toughness - test.target.armor;
        }
        // Generate damage description and damage sublabel
        if (test.result == TestResult.FAILURE || test.result == TestResult.MISHAP) {
          test.damageDescription = game.i18n.localize('torgeternity.chatText.check.result.noDamage');
          test.applyDamLabel = 'display:none';
          test.damageSubDescription = game.i18n.localize('torgeternity.chatText.check.result.attackMissed');
        } else {
          // Add BDs in promise if applicable as this should only be rolled if the test is successful
          if (test.addBDs && !test.previousBonus) {
            iteratedRoll = await rollBonusDie(test.trademark, test.addBDs);
            test.BDDamageInPromise = iteratedRoll.total;
            test.diceList = test.diceList.concat(iteratedRoll.dice[0].values);
            test.amountBD += test.addBDs;
            test.addBDs = 0;

            test.chatTitle += ` + ${test.amountBD} ${game.i18n.localize('torgeternity.chatText.bonusDice')}`;

            test.bdDamageLabelStyle = 'display: block';
            test.bdDamageSum += test.BDDamageInPromise;

            test.damage += test.BDDamageInPromise;
            adjustedDamage += test.BDDamageInPromise;
            test.BDDamageInPromise = 0;
          }
          // adjustedDamage is already computed from test.damage
          // then modify test.damage for following future computation, and modify the adjustedDamage
          // then the test.BDDamageInPromise is reset

          test.applyDamLabel = 'display:inline';
          test.damageDescription = torgDamage(adjustedDamage, test.targetAdjustedToughness).label;
          test.damageSubDescription =
            `${game.i18n.localize('torgeternity.chatText.check.result.damage')} ${adjustedDamage} vs. ${test.targetAdjustedToughness} ${game.i18n.localize('torgeternity.chatText.check.result.toughness')}`;
        }
      } else {
        // Basic roll
        test.damageSubLabel = 'display:none';
        test.damageDescription = `${adjustedDamage} ${game.i18n.localize('torgeternity.chatText.check.result.damage')}`;
      }
    } else {
      test.damageLabel = 'display:none';
      test.damageSubLabel = 'display:none';
    }

    // Remind Player to Check for Disconnect?
    test.disconnectLabel = (test.rollTotal <= 4 && test.rollTotal != undefined) ? 'display:block' : 'display:none';

    // Label as Skill vs. Attribute Test and turn on BD option if needed
    if (
      test.testType === 'skill' ||
      test.testType === 'interactionAttack' ||
      test.testType === 'chase' ||
      test.testType === 'stunt' ||
      test.testType === 'vehicleBase'
    ) {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.skillTestLabel');
      test.bdStyle = 'display:none';
    } else if (test.testType === 'attack') {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.skillTestLabel');
    } else if (test.testType === 'power') {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.skillTestLabel');
      test.bdStyle = test.isAttack ? 'display:' : 'display:none';
    } else if (test.testType === 'custom') {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.skillTestLabel');
      test.outcomeColor = 'display:none;';
      test.resultTextColor = 'display:none;';
      test.bdStyle = 'display:block';
      test.upStyle = 'display:none';
    } else {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.attributeTestLabel');
      test.bdStyle = 'display:none';
    }
    test.typeLabel += ' ';

    // Display cards played label?
    test.cardsPlayedLabel = (parseInt(test.cardsPlayed) > 0) ? 'display:' : 'display:none';

    // Disable unavailable menu options (Note: possibilities are always available)

    if (test.upTotal > 0) test.upStyle = 'pointer-events:none;color:gray';
    if (test.heroTotal > 0) test.heroStyle = 'pointer-events:none;color:gray';
    if (test.dramaTotal > 0) test.dramaStyle = 'pointer-events:none;color:gray';

    if (test.actorType === 'threat') {
      test.heroStyle = 'display:none';
      test.dramaStyle = 'display:none';
      test.plus3Style = 'display:none';
    }

    // Display chat notes label?

    test.notesLabel = test.chatNote ? 'display:' : 'display:none';

    if (test.testType === 'interactionAttack') {
      if (test.rollResult - test.DN >= 0) {
        test.damageSubLabel = 'display:block';
        test.applyDamLabel = 'display:none';
        if (test.target.present) test.applyDebuffLabel = 'display:inline';
      } else {
        test.applyDebuffLabel = 'display:none';
        // test.damageSubDescription = "Apply debuff";//localize('torgeternity.chatText.check.result.damage')
      }
    }

    // record adjustedToughness for each flagged target
    target.targetAdjustedToughness = test.targetAdjustedToughness;

    // roll Dice once, and handle the error if DSN is not installed
    if (game.dice3d) {
      if (i === 0) await game.dice3d.showForRoll(test.diceroll, game.user, true);
      game.dice3d.showForRoll(iteratedRoll);
    }
    iteratedRoll = undefined;

    messages.push(await ChatMessageTorg.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: testActor }),
      owner: test.actor,
      flags: {
        torgeternity: {
          test,
          template: 'systems/torgeternity/templates/chat/skill-card.hbs',
        },
      },
    }));
    first = false;
  }

  if (game.settings.get('torgeternity', 'unTarget')) {
    // see leftClickRelease in Foundry code
    if (game.canvas) await game.user._onUpdateTokenTargets();
    await game.user.broadcastActivity({ targets: [] });
  }

  if (game.dice3d) game.dice3d.messageHookDisabled = false;

  return messages;
}

/**
 *
 * @param rollTotal
 */
function torgBonus(rollTotal) {
  const VALUES = [0,  // index 0 is inused
    -10, -8, -6, -6, -4, -4, -2, -2, -1, -1,
    0, 0, 1, 1, 2, 3, 4, 5, 6, 7];

  return (rollTotal <= 20) ? VALUES[rollTotal] : (7 + Math.ceil((rollTotal - 20) / 5));
}

/**
 *
 * @param isTrademark Is this roll with the perk of trademark weapon?
 * @param amount The amount of BDs that is ought to roll
 */
export async function rollBonusDie(isTrademark, amount = 1) {
  return await new Roll(`${amount}d6${isTrademark ? 'rr1' : ''} x6max5`).evaluate();
}

/**
 *
 * @param damage
 * @param toughness
 */
export function torgDamage(damage, toughness) {
  const damageDiff = Number(damage) - Number(toughness);
  if (damageDiff < -5) {
    return {
      label: game.i18n.localize('torgeternity.chatText.check.result.noDamage'),
      shocks: 0,
      wounds: 0,
    };
  } else if (damageDiff < 0) {
    return {
      label: `1 ${game.i18n.localize('torgeternity.stats.shock')}`,
      shocks: 1,
      wounds: 0,
    };
  } else if (damageDiff < 5) {
    return {
      label: `2 ${game.i18n.localize('torgeternity.stats.shock')}`,
      shocks: 2,
      wounds: 0,
    };
  } else {
    const wounds = Math.floor(damageDiff / 5);
    const shock = wounds * 2;
    return {
      label: `${wounds} ${game.i18n.localize('torgeternity.stats.wounds')}, ${shock} ${game.i18n.localize('torgeternity.stats.shock')}`,
      shocks: shock,
      wounds: wounds,
    };
  }
}

//
/**
 *@param soaker
 */
export async function soakDamages(soaker) {
  const skillName = 'reality';
  const skillValue = soaker.system.skills[skillName].value;

  // Before calculating roll, check to see if it can be attempted unskilled; exit test if actor doesn't have required skill
  if (checkUnskilled(skillValue, skillName, soaker)) return;

  new TestDialog({
    testType: 'soak',
    actor: soaker.uuid,
    actorPic: soaker.img,
    actorName: soaker.name,
    actorType: soaker.system.type,
    isFav:
      soaker.system.skills[skillName]?.isFav ||
      soaker.system.attributes[skillName + 'IsFav'] ||
      false,
    skillName: skillName,
    skillValue: skillValue,
    rollTotal: 0, // A zero indicates that a rollTotal needs to be generated when renderSkillChat is called //
  }, { useTargets: true });
  // do reality roll
}

/**
 * Return the Torg value for a given number
 * This could probably be simplified by using the formula for the famous Torg algorhythm
 *
 * @param myNumber
 */
export function getTorgValue(myNumber) {
  if (myNumber <= 1) return 0;
  if (myNumber == 2) return 1;
  if (myNumber == 3) return 2;
  if (myNumber < 6) return 3;
  if (myNumber < 10) return 4;
  if (myNumber < 15) return 5;
  if (myNumber < 25) return 6;
  if (myNumber < 40) return 7;
  if (myNumber < 60) return 8;
  if (myNumber < 100) return 9;
  if (myNumber < 150) return 10;
  if (myNumber < 250) return 11;
  if (myNumber < 400) return 12;
  if (myNumber < 600) return 13;
  if (myNumber < 1000) return 14;
  if (myNumber < 1500) return 15;
  if (myNumber < 2500) return 16;
  if (myNumber < 4000) return 17;
  if (myNumber < 6000) return 18;
  if (myNumber < 10000) return 19;
  if (myNumber < 15000) return 20;
  if (myNumber < 25000) return 21;
  if (myNumber < 40000) return 22;
  if (myNumber < 60000) return 23;
  if (myNumber < 100000) return 24;
  if (myNumber < 150000) return 25;
  if (myNumber < 250000) return 26;
  if (myNumber < 400000) return 27;
  if (myNumber < 600000) return 28;
  if (myNumber < 1000000) return 29;
  if (myNumber < 1500000) return 30;
  if (myNumber < 2500000) return 31;
  if (myNumber < 4000000) return 32;
  if (myNumber < 6000000) return 33;
  if (myNumber < 10000000) return 34;
  if (myNumber < 15000000) return 35;
  if (myNumber < 25000000) return 36;
  if (myNumber < 40000000) return 37;
  if (myNumber < 60000000) return 38;
  if (myNumber < 100000000) return 39;
  if (myNumber < 150000000) return 40;
  if (myNumber < 250000000) return 41;
  if (myNumber < 400000000) return 42;
  if (myNumber < 600000000) return 43;
  if (myNumber < 1000000000) return 44;
  if (myNumber < 1500000000) return 45;
  if (myNumber < 2500000000) return 46;
  if (myNumber < 4000000000) return 47;
  if (myNumber < 6000000000) return 48;
  if (myNumber < 10000000000) return 49;
  if (myNumber < 15000000000) return 50;
  if (myNumber < 25000000000) return 51;
  if (myNumber < 40000000000) return 52;
  if (myNumber < 60000000000) return 53;
  if (myNumber < 100000000000) return 54;
  if (myNumber < 150000000000) return 55;
  if (myNumber < 250000000000) return 56;
  if (myNumber < 400000000000) return 57;
  if (myNumber < 600000000000) return 58;
  return 59;
}

function validValue(value, other) {
  return (value && value != '-') ? value : other;
}

async function individualDN(test, target) {
  switch (test.DNDescriptor) {
    case 'veryEasy':
      return 6;
    case 'easy':
      return 8;
    case 'standard':
      return 10;
    case 'challenging':
      return 12;
    case 'hard':
      return 14;
    case 'veryHard':
      return 16;
    case 'heroic':
      return 18;
    case 'nearImpossible':
      return 20;
    case 'targetCharisma':
      return target.attributes.charisma.value;
    case 'targetDexterity':
      return target.attributes.dexterity.value;
    case 'targetMind':
      return target.attributes.mind.value;
    case 'targetSpirit':
      return target.attributes.spirit.value;
    case 'targetStrength':
      return target.attributes.strength.value;
    case 'targetAlteration':
      return validValue(target.skills.alteration.value, target.attributes.mind.value);
    case 'targetConjuration':
      return validValue(target.skills.conjuration.value, target.attributes.spirit.value);
    case 'targetDivination':
      return validValue(target.skills.divination.value, target.attributes.mind.value);
    case 'targetDodge':
      return target.defenses.dodge;
    case 'targetFaith':
      return target.skills.faith.value || target.attributes.spirit.value;
    case 'targetFind':
      return validValue(target.skills.find.value, target.attributes.mind.value);
    case 'targetIntimidation':
      return target.defenses.intimidation;
    case 'targetKinesis':
      return validValue(target.skills.kinesis.value, target.attributes.spirit.value);
    case 'targetManeuver':
      return target.defenses.maneuver;
    case 'targetMeleeWeapons':
      return target.defenses.meleeWeapons;
    case 'targetPrecognition':
      return validValue(target.skills.precognition.value, target.attributes.mind.value);
    case 'targetStealth':
      return target.skills.stealth.value || target.attributes.dexterity.value;
    case 'targetTaunt':
      return target.defenses.taunt;
    case 'targetTrick':
      return target.defenses.trick;
    case 'targetUnarmedCombat':
      return target.defenses.unarmedCombat;
    case 'targetWillpower':
      return target.skills.willpower.value || target.attributes.spirit.value;
    case 'targetWillpowerMind':
      return target.skills.willpower.value
        ? target.skills.willpower.value - target.attributes.spirit.value + target.attributes.mind.value
        : target.attributes.mind.value;
    case 'targetLandVehicles':
      return target.skills.landVehicles.value || target.attributes.dexterity.value;
    case 'targetAirVehicles':
      return target.skills.airVehicles.value || target.attributes.dexterity.value;
    case 'targetWaterVehicles':
      return target.skills.waterVehicles.value || target.attributes.dexterity.value;
    case 'highestSpeed':
      // Find the fastest participant in the active combat
      let highestSpeed = 0;
      for (const combatant of game.combats.active.turns) {
        const combatantSpeed =
          (combatant.actor.type === 'vehicle') ?
            combatantSpeed = combatant.actor.system.topSpeed.value :
            combatantSpeed = getTorgValue(combatant.actor.system.other.run);
        if (combatantSpeed > highestSpeed) {
          highestSpeed = combatantSpeed;
        }
      }
      return highestSpeed;
    case 'targetVehicleDefense':
      return target.defenses?.vehicle ?? 0;
    default:
      return 10;
  }
}

async function highestDN(test) {
  let highest = 0;
  for (const target of test.targetAll) {
    highest = Math.max(highest, singleDN(target));
  }
}

/**
 * Simple method to evaluate the spelling (of general existance) of a DN-Descriptor
 * @param {string} DNDescriptor
 * @returns true if existant
 */
export function validDNDescriptor(DNDescriptor) {
  return [
    'veryEasy',
    'easy',
    'standard',
    'challenging',
    'hard',
    'veryHard',
    'heroic',
    'nearImpossible',
    'targetCharisma',
    'targetDexterity',
    'targetMind',
    'targetSpirit',
    'targetStrength',
    'targetAlteration',
    'targetConjuration',
    'targetDivination',
    'targetDodge',
    'targetFaith',
    'targetFind',
    'targetIntimidation',
    'targetKinesis',
    'targetManeuver',
    'targetPrecognition',
    'targetStealth',
    'targetTaunt',
    'targetTrick',
    'targetUnarmedCombat',
    'targetWillpower',
    'targetWillpowerMind',
    'targetLandVehicles',
    'targetAirVehicles',
    'targetWaterVehicles',
    'highestSpeed',
    'targetVehicleDefense',
  ].includes(DNDescriptor);
}

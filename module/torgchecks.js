import { TestDialog, TestDialogLabel } from './test-dialog.js';
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

  if (CONFIG.debug.torgtestrender) console.debug('renderSkillChat', test);

  for (const key of Object.keys(test)) {
    if (!(test[key] instanceof String)) continue;
    const num = Number(test[key]);
    if (isNaN(num)) continue;
    console.error(`renderSkillChat passed a number as a String! (${key} = ${test[key]})`)
    test[key] = num;
  }

  // Check for targeting a vehicle which doesn't have an operator.
  for (const target of test.targetAll) {
    if (target.type === 'vehicle' && isNaN(target.defenses.dodge)) {
      ui.notifications.error(game.i18n.format('torgeternity.notifications.noVehicleOperator', { a: target.targetName }));
      return;
    }
  }

  const messages = [];

  // For non-targeted tests, ensure we iterate through the loop at least once
  if (!test.targetAll.length) test.targetAll = [{ dummyTarget: true }];

  // disable DSN (if used) for 'every' message (want to show only one dice despite many targets)
  if (game.dice3d) game.dice3d.messageHookDisabled = true;

  test.applyStymiedLabel = test.attackTraits?.includes('stagger') ? '' : 'hidden';
  test.applyVulnerableLabel = 'hidden';
  test.applyActorVulnerableLabel = 'hidden';
  test.applyDamLabel = 'hidden';
  test.backlashLabel = 'hidden';
  test.torgDiceStyle = game.settings.get('torgeternity', 'useRenderedTorgDice');
  test.bdDamageLabelStyle = test.bdDamageSum ? '' : 'hidden';
  let iteratedRoll;

  const testActor = fromUuidSync(test.actor);
  const testItem = test.itemId ? testActor.items.get(test.itemId) : null;

  // Handle ammo, if not opt-out. First, check if there is enough ammo, then reduce it.
  if (testItem?.weaponWithAmmo && !game.settings.get('torgeternity', 'ignoreAmmo')) {
    await testItem.reduceAmmo(test.burstModifier, test.targetAll?.length);
    test.ammoLabel = 'display:table-row';
  } else {
    test.ammoLabel = 'hidden';
  }

  const uniqueDN = game.settings.get('torgeternity', 'uniqueDN') ? await highestDN(test) : undefined;
  let first = true;
  for (const target of test.targetAll) {
    if (!target.dummyTarget) test.target = target;
    test.sizeModifier = target.sizeModifier;
    test.vulnerableModifier = target.vulnerableModifier;

    //
    // Check to see if we already have a chat title from a chat card roll. If not, Set title for Chat Message in test.chatTitle //
    //
    if (!test.chatTitle) {
      test.chatTitle = TestDialogLabel(test);
    }

    //
    // Establish DN for this test based on test.DNDescriptor //
    //
    test.DN = uniqueDN ?? individualDN(test, target);

    //
    // -----------------------Determine Bonus---------------------------- //

    // Do we display the unskilled label for a Storm Knight?
    test.unskilledTest = (testActor.type === 'stormknight' &&
      test.testType !== 'custom' &&
      test.testType !== 'attribute' &&
      test.testType !== 'activeDefense' &&
      test.testType !== 'activeDefenseUpdate' &&
      !test.customSkill &&
      !testActor.system.skills[test.skillName].adds);

    test.unskilledLabel = test.unskilledTest ? '' : 'hidden';

    // Generate roll, if needed
    if (test.rollTotal === 0 && !test.explicitBonus) {
      // Generate dice roll
      const dice = test.unskilledTest ? '1d20x10' : '1d20x10x20';

      test.diceroll = await new Roll(dice).evaluate();
      if (test.isFav && test.disfavored) {
        test.isFav = false;
        test.disfavored = false;
        test.chatNote += game.i18n.localize('torgeternity.sheetLabels.favDis');
      }
      if (!test.isFav) {
        test.isFavStyle = 'hidden';
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

      // Check for Disconnection
      if (!test.ignoreContradictions && testItem && test.rollTotal <= 4) {

        // We can't check for Starred Perks, since no dice rolls are made from them.
        const failsZone = testItem.isGeneralContradiction(game.scenes.active) || testItem.isContradiction(game.scenes.active?.torg.axioms);
        const failsActor = testItem.isContradiction(testActor.system.axioms);
        const limit = (!failsZone && !failsActor) ? 0 : (failsZone && failsActor) ? 4 : 1;

        if (test.rollTotal <= limit) {

          function axiomLabels(label, axiomField, failures) {
            if (!failures) return null;
            const result = []
            for (const failure of failures)
              result.push(game.i18n.format(`torgeternity.chatText.disconnection.${label}`, {
                axiom: game.i18n.localize(CONFIG.torgeternity.axioms[failure.axiom]),
                actorType: game.i18n.localize(CONFIG.Actor.typeLabels[testActor.type]),
                itemName: testItem.name,
                itemAxiom: failure.item,
                [axiomField]: failure.max
              }))
            return result;
          }

          test.disconnection = game.i18n.format('torgeternity.chatText.disconnection.base', {
            diceTotal: test.rollTotal,
            itemName: testItem.name,
          })
          test.disconnectionZone = axiomLabels('zoneLabel', 'zoneAxiom', failsZone);
          test.disconnectionActor = axiomLabels('actorLabel', 'actorAxiom', failsActor);

          if (game.settings.get('torgeternity', 'autoDisconnect'))
            testActor.toggleStatusEffect('disconnected', { active: true })
        }
      }
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
    if (!test.explicitBonus) {
      test.combinedRollTotal = test.rollTotal + test.upTotal + test.possibilityTotal + test.heroTotal + test.dramaTotal;
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
    test.bonusPlusLabel = (test.bonus >= 1) ? '' : 'hidden';

    function modifierString(label, value) {
      let result = game.i18n.localize(label);
      if (typeof value === 'number') result += ` (${value.signedString()})`
      return result;
    }

    // Set Modifiers and Chat Content Relating to Modifiers
    let modifiers = [];
    test.modifiers = 0;
    test.modifierText = '';
    if (test.testTtype === 'soak') test.vulnerableModifier = 0;

    if (test.woundModifier < 0) {
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.wounds', test.woundModifier));
      test.modifiers += test.woundModifier;
    }

    if (test.stymiedModifier < 0) {
      if (test.stymiedModifier === -2) {
        modifiers.push(modifierString('torgeternity.chatText.check.modifier.stymied', -2));
        test.modifiers += -2;
      } else if (test.stymiedModifier === -4) {
        modifiers.push(modifierString('torgeternity.chatText.check.modifier.veryStymied', -4));
        test.modifiers += -4;
      }
    }

    if (test.darknessModifier < 0) {
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.darkness', test.darknessModifier));
      test.modifiers += test.darknessModifier;
    }

    if (test.movementModifier < 0) {
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.running', test.movementModifier));
      test.modifiers += -2;
    }

    if (test.multiModifier < 0) {
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.multiAction', test.multiModifier));
      test.modifiers += test.multiModifier;
    }

    if (test.targetsModifier < 0) {
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.multiTarget', test.targetsModifier));
      test.modifiers += test.targetsModifier;
    }

    if (test.isOther1) {
      modifiers.push(modifierString(test.other1Description, test.other1Modifier));
      test.modifiers += test.other1Modifier;
    }

    if (test.isOther2) {
      modifiers.push(modifierString(test.other2Description, test.other2Modifier));
      test.modifiers += test.other2Modifier;
    }

    if (test.isOther3) {
      modifiers.push(modifierString(test.other3Description, test.other3Modifier));
      test.modifiers += test.other3Modifier;
    }

    // Apply target-related modifiers
    if (!target.dummyTarget) {
      // Apply the size modifier in appropriate circumstances
      if (test.applySize && test.sizeModifier) {
        test.modifiers += test.sizeModifier;
        modifiers.push(modifierString('torgeternity.chatText.check.modifier.targetSize', test.sizeModifier));
      }

      // Apply target vulnerability modifier
      if (test.vulnerableModifier === 2) {
        test.modifiers += test.vulnerableModifier;
        modifiers.push(modifierString('torgeternity.chatText.check.modifier.targetVulnerable', test.vulnerableModifier));
      } else if (test.vulnerableModifier === 4) {
        test.modifiers += test.vulnerableModifier;
        modifiers.push(modifierString('torgeternity.chatText.check.modifier.targetVeryVulnerable', test.vulnerableModifier));
      }
    }

    if (test.calledShotModifier) {
      test.modifiers += test.calledShotModifier;
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.calledShot', test.calledShotModifier));
    }

    if (test.burstModifier) {
      test.modifiers += test.burstModifier;
      if (test.burstModifier === 2) {
        modifiers.push(modifierString('torgeternity.chatText.check.modifier.shortBurst', test.burstModifier));
      } else if (test.burstModifier === 4) {
        modifiers.push(modifierString('torgeternity.chatText.check.modifier.longBurst', test.burstModifier));
      } else if (test.burstModifier === 6) {
        modifiers.push(modifierString('torgeternity.chatText.check.modifier.heavyBurst', test.burstModifier));
      }
    }

    if (test.allOutFlag) {
      test.modifiers += 4;
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.allOutAttack', 4));

      // if it's an all-out-attack, apply very vulnerable to attacker
      if (first) await testActor.setVeryVulnerable();
    }

    if (test.aimedFlag) {
      test.modifiers += 4;
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.aimedShot', 4));
    }

    if (test.blindFireFlag) {
      test.modifiers += -6;
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.blindFire', -6));
    }

    if (test.concealmentModifier) {
      test.modifiers += test.concealmentModifier;
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.targetConcealment', test.concealmentModifier));
    }

    if (test.testType === 'power' && test.powerModifier) {
      test.modifiers += test.powerModifier;
      modifiers.push(modifierString('torgeternity.chatText.check.modifier.powerModifier', test.powerModifier));
    }

    // Apply vehicle-related modifiers
    if (test.testType === 'chase' || test.testType === 'stunt' || test.testType === 'vehicleBase') {
      if (test.maneuverModifier) {
        test.modifiers += test.maneuverModifier;
        modifiers.push(modifierString('torgeternity.stats.maneuverModifier', test.maneuverModifier));
      }
    }

    if (test.testType === 'chase' && test.speedModifier) {
      test.modifiers += test.speedModifier;
      modifiers.push(modifierString('torgeternity.stats.speedModifier', test.speedModifier));
    }

    if (modifiers.length) {
      test.modifierText = `<p>${modifiers.sort().join('<br>')}</p>`;
    }

    // Add +3 cards to bonus
    // Initialize cardsPlayed if null
    test.cardsPlayed ??= 0;
    test.bonus += test.cardsPlayed * 3;

    test.rollResult = test.skillValue + test.bonus + test.modifiers;

    // Determine Outcome
    const testDifference = test.rollResult - test.DN;

    test.actionTotalContent = `${game.i18n.localize('torgeternity.chatText.check.result.actionTotal')} ${test.rollResult} vs. ${test.DN} ${game.i18n.localize('torgeternity.dnTypes.' + test.DNDescriptor)}`;

    const useColorBlind = game.settings.get('torgeternity', 'useColorBlindnessColors');
    if (testDifference < 0) {
      test.outcome = game.i18n.localize('torgeternity.chatText.check.result.failure');
      test.result = TestResult.FAILURE;
      if (test.testType === 'power') {
        test.backlashLabel = '';
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
    test.modifierPlusLabel = (test.modifiers >= 1) ? 'display:' : 'hidden';

    // Choose Text to Display as Result
    if (testActor.isDisconnected) {
      test.possibilityStyle = 'hidden';
      test.heroStyle = 'hidden';
      test.dramaStyle = 'hidden';
    }

    if (
      test.rollTotal === 1 &&
      !(test.testType === 'activeDefenseUpdate' || test.testType === 'activeDefense')
    ) {
      // Roll 1 and not defense = Mishap
      test.result = TestResult.MISHAP;
      test.resultText = game.i18n.localize('torgeternity.chatText.check.result.mishape');
      if (test?.attackTraits.includes('fragile')) {
        test.fragileText = game.i18n.format('torgeternity.chatText.check.result.fragileBroken', { itemName: testItem.itemName });
      }
      test.outcomeColor = 'color: purple';
      test.resultTextColor = 'color: purple';
      if (!useColorBlind) {
        test.outcomeColor += ';text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
        test.resultTextColor += ';text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      }
      test.actionTotalLabel = 'hidden';
      test.possibilityStyle = 'hidden';
      test.upStyle = 'hidden';
      test.dramaStyle = 'hidden';
      test.heroStyle = 'hidden';
      test.isFavStyle = 'hidden';
      test.bdStyle = 'hidden';
      test.plus3Style = 'hidden';
      if (test.testType === 'soak')
        test.chatNote =
          game.i18n.localize('torgeternity.sheetLabels.soakNull') +
          game.i18n.localize('torgeternity.sheetLabels.possSpent');

    } else if (test.testType === 'soak') {
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
        test.actionTotalLabel = 'hidden';
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
      // Add damage modifier for vital area hits, if necessary
      let adjustedDamage = test.damage;
      if (test.vitalAreaDamageModifier) {
        adjustedDamage = test.damage + test.vitalAreaDamageModifier;
      }
      // add additional Damage from roll dialogue
      if (test?.additionalDamage && !test.explicitBonus) {
        adjustedDamage += test?.additionalDamage;
      }
      // Check for whether a target is present and turn on display of damage sub-label
      if (!target.dummyTarget) {
        // If armor and cover can assist, adjust toughness based on AP effects and cover modifier
        if (test.applyArmor) {
          test.targetAdjustedToughness =
            target.toughness -
            Math.min(test.weaponAP, target.armor) +
            test.coverModifier;
          // Ignore armor and cover
        } else {
          test.targetAdjustedToughness = target.toughness - target.armor;
        }
        // Generate damage description and damage sublabel
        if (test.result < TestResult.STANDARD) {
          test.damageDescription = game.i18n.localize('torgeternity.chatText.check.result.noDamage');
          test.damageSubDescription = game.i18n.localize('torgeternity.chatText.check.result.attackMissed');
          if (test.attackTraits.includes('unwieldy')) {
            test.damageDescription += ` (${game.i18n.localize('torgeternity.traits.unwieldy')})`;
            test.applyActorVulnerableLabel = '';
          }

        } else {
          // Add BDs in promise if applicable as this should only be rolled if the test is successful
          if (test.addBDs && !test.explicitBonus) {
            iteratedRoll = await rollBonusDie(test.trademark, test.addBDs);
            test.BDDamageInPromise = iteratedRoll.total;
            test.diceList = test.diceList.concat(iteratedRoll.dice[0].values);
            test.amountBD += test.addBDs;
            test.addBDs = 0;

            test.chatTitle += ` + ${test.amountBD} ${game.i18n.localize('torgeternity.chatText.bonusDice')}`;

            test.bdDamageLabelStyle = '';
            test.bdDamageSum += test.BDDamageInPromise;

            test.damage += test.BDDamageInPromise;
            adjustedDamage += test.BDDamageInPromise;
            test.BDDamageInPromise = 0;
          }
          // adjustedDamage is already computed from test.damage
          // then modify test.damage for following future computation, and modify the adjustedDamage
          // then the test.BDDamageInPromise is reset

          test.applyDamLabel = '';
          test.damageDescription = torgDamage(adjustedDamage, test.targetAdjustedToughness, test.attackTraits).label;
          test.damageSubDescription =
            `${game.i18n.localize('torgeternity.chatText.check.result.damage')} ${adjustedDamage} vs. ${test.targetAdjustedToughness} ${game.i18n.localize('torgeternity.chatText.check.result.toughness')}`;
        }
      } else {
        // Basic roll
        test.damageSubLabel = 'hidden';
        test.damageDescription = `${adjustedDamage} ${game.i18n.localize('torgeternity.chatText.check.result.damage')}`;
      }
    } else {
      test.damageLabel = 'hidden';
      test.damageSubLabel = 'hidden';
    }

    // Label as Skill vs. Attribute Test and turn on BD option if needed
    if (
      test.testType === 'skill' ||
      test.testType === 'interactionAttack' ||
      test.testType === 'chase' ||
      test.testType === 'stunt' ||
      test.testType === 'vehicleBase'
    ) {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.skillTestLabel');
      test.bdStyle = 'hidden';
    } else if (test.testType === 'attack') {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.skillTestLabel');
    } else if (test.testType === 'power') {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.skillTestLabel');
      test.bdStyle = test.isAttack ? '' : 'hidden';
    } else if (test.testType === 'custom') {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.skillTestLabel');
      test.outcomeColor = 'hidden;';
      test.resultTextColor = 'display:hidden;';
      test.bdStyle = '';
      test.upStyle = 'hidden';
    } else {
      test.typeLabel = game.i18n.localize('torgeternity.chatText.attributeTestLabel');
      test.bdStyle = 'hidden';
    }
    test.typeLabel += ' ';

    // Hide the UP button if the current drama card doesn't show UP on the condition line.
    const combat = game.combat;
    const token = testActor.getActiveTokens(false, true)?.[0];  // (linked, document [rather than PlaceableObject])
    if (combat?.active &&
      (token.disposition == CONST.TOKEN_DISPOSITIONS.FRIENDLY && combat.heroCondition !== 'up') ||
      (token.disposition === CONST.TOKEN_DISPOSITIONS.HOSTILE && combat.villainCondition !== 'up'))
      test.upStyle = 'hidden';

    // Display cards played label?
    test.cardsPlayedLabel = (test.cardsPlayed > 0) ? '' : 'hidden';

    // Disable unavailable menu options (Note: possibilities are always available)

    if (test.upTotal > 0) test.upStyle = 'disabled';
    if (test.heroTotal > 0) test.heroStyle = 'disabled';
    if (test.dramaTotal > 0) test.dramaStyle = 'disabled';

    if (test.actorType === 'threat') {
      test.heroStyle = 'hidden';
      test.dramaStyle = 'hidden';
      test.plus3Style = 'hidden';
    }

    // Display chat notes label?

    test.notesLabel = test.chatNote ? '' : 'hidden';

    if (test.testType === 'interactionAttack' && test.rollResult >= test.DN) {
      test.damageSubLabel = '';
      test.applyDamLabel = 'hidden';
      if (!target.dummyTarget) {
        test.applyStymiedLabel = '';
        test.applyVulnerableLabel = '';
      }
    }

    // record adjustedToughness for each flagged target
    target.targetAdjustedToughness = test.targetAdjustedToughness;

    // roll Dice once, and handle the error if DSN is not installed
    if (game.dice3d) {
      // catch errors to prevent DSN from overly affecting our own behaviour.
      if (first && test.diceroll) {
        try {
          await game.dice3d.showForRoll(test.diceroll, game.user, true);
        } catch (e) { console.log('TORG CHECK: DSN reported', e) }
      }
      if (iteratedRoll) {
        try {
          await game.dice3d.showForRoll(iteratedRoll);
        } catch (e) { console.log('TORG CHECK: DSN reported', e) }
      }
    }
    iteratedRoll = undefined;

    messages.push(await ChatMessageTorg.create({
      user: game.user._id,
      speaker: ChatMessage.getSpeaker({ actor: testActor }),
      owner: test.actor,
      flags: {
        torgeternity: {
          test,
          itemId: test.itemId,  // for Automated Animations module
          template: 'systems/torgeternity/templates/chat/skill-card.hbs',
        },
      },
    }));
    first = false;
  } // for each target

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
  return await new Roll(`${amount}d6${isTrademark ? 'rr1' : ''}x6max5`).evaluate();
}

/**
 *
 * @param damage
 * @param toughness
 */
export function torgDamage(damage, toughness, attackTraits) {
  const damageDiff = Number(damage) - Number(toughness);
  let result;
  if (damageDiff < -5) {
    result = { shocks: 0, wounds: 0 }
  } else if (damageDiff < 0) {
    result = { shocks: 1, wounds: 0 }
  } else if (damageDiff < 5) {
    result = { shocks: 2, wounds: 0 }
  } else {
    const wounds = Math.floor(damageDiff / 5);
    result = { shocks: wounds * 2, wounds: wounds }
  }

  if (result.shocks > 0) {
    result.label = (result.wounds > 0) ? `${result.wounds} ${game.i18n.localize('torgeternity.stats.wounds')}, ` : '';

    const painful = attackTraits?.includes('painful');
    if (painful) result.shocks += 1;
    result.label += `${result.shocks} ${game.i18n.localize('torgeternity.stats.shock')}`;
    const flags = [];
    if (painful) flags.push(game.i18n.localize('torgeternity.traits.painful'));
    if (attackTraits?.includes('stagger')) flags.push(game.i18n.localize('torgeternity.traits.stagger'));
    if (flags.length) result.label += ` (${flags.join(', ')})`;
  } else {
    result.label = game.i18n.localize('torgeternity.chatText.check.result.noDamage');
  }
  return result;
}

/**
 *@param {Actor} soaker The Actor which is attempting to soak some damage
 */
export async function soakDamages(soaker) {
  const skillName = 'reality';
  const skillValue = soaker.system.skills[skillName].value;

  // Before calculating roll, check to see if it can be attempted unskilled; exit test if actor doesn't have required skill
  if (checkUnskilled(skillValue, skillName, soaker)) return;

  return TestDialog.wait({
    testType: 'soak',
    actor: soaker,
    //actorType: soaker.system.type,
    isFav:
      soaker.system.skills[skillName]?.isFav ||
      soaker.system.attributes[skillName + 'IsFav'] ||
      false,
    skillName: skillName,
    skillValue: skillValue,
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
  if (myNumber === 2) return 1;
  if (myNumber === 3) return 2;
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

function individualDN(test, target) {

  if (test.DNDescriptor.startsWith('target')) {
    let onTarget = test.DNDescriptor.slice(6);
    onTarget = onTarget.at(0).toLowerCase() + onTarget.slice(1);
    if (Object.hasOwn(target.attributes, onTarget))
      return target.attributes[onTarget].value;
    if (Object.hasOwn(target.defenses, onTarget))
      return target.defenses[onTarget];
    if (Object.hasOwn(target.skills, onTarget)) {
      const skill = target.skills[onTarget];
      return (skill.value && skill.value !== '-') ? skill.value : target.attributes[skill.baseAttribute].value;
    }
  }

  switch (test.DNDescriptor) {
    // Simple DNs
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

    // Special Case
    case 'targetWillpowerMind':
      return target.skills.willpower.value
        ? target.skills.willpower.value - target.attributes.spirit.value + target.attributes.mind.value
        : target.attributes.mind.value;

    case 'highestSpeed':
      // Find the fastest participant in the active combat
      let highestSpeed = 0;
      for (const combatant of game.combats.active.turns) {
        if (!combatant.actor) continue;
        const combatantSpeed = (combatant.actor.type === 'vehicle') ?
          combatant.actor.system.topSpeed.value :
          getTorgValue(combatant.actor.system.other.run);
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
    highest = Math.max(highest, individualDN(test, target));
  }
  return highest;
}


export async function rollAttack(actor, item) {
  const weaponData = item.system;
  const attackWith = weaponData.attackWith;
  let skillValue;
  let skillData;
  let attributes;

  if (item?.weaponWithAmmo && !item.hasAmmo && !game.settings.get('torgeternity', 'ignoreAmmo')) {
    ui.notifications.warn(game.i18n.localize('torgeternity.chatText.noAmmo'));
    return;
  }

  if (actor.type === 'vehicle') {
    const gunner = item.system.gunner;
    skillData = gunner?.system.skills[attackWith] ?? null;
    skillValue = skillData?.value ?? '-';
    attributes = gunner?.system.attributes ?? 0;
  } else {
    skillData = actor.system.skills[attackWith];
    skillValue = skillData.value;
    attributes = actor.system.attributes;
    if (isNaN(skillValue)) {
      skillValue = skillData.unskilledUse ? attributes[skillData.baseAttribute].value : '-';
    }
  }

  if (checkUnskilled(skillValue, attackWith, actor)) return;

  let dnDescriptor = 'standard';

  if (game.user.targets.size) {
    const firstTarget = game.user.targets.find(token => token.actor.type !== 'vehicle')?.actor ||
      game.user.targets.first().actor;

    if (firstTarget.type === 'vehicle') {
      dnDescriptor = 'targetVehicleDefense';
    } else {
      switch (attackWith) {
        case 'meleeWeapons':
        case 'unarmedCombat':
          dnDescriptor = firstTarget.items
            .filter((it) => it.type === 'meleeweapon' && it.system.equipped).length === 0
            ? 'targetUnarmedCombat'
            : 'targetMeleeWeapons';
          break;
        case 'fireCombat':
        case 'energyWeapons':
        case 'heavyWeapons':
        case 'missileWeapons':
          dnDescriptor = 'targetDodge';
          break;
        default:
          dnDescriptor = 'targetMeleeWeapons';
      }
    }
  }

  // Calculate damage caused by this weapon
  let adjustedDamage = 0;
  const weaponDamage = weaponData.damage;
  switch (weaponData.damageType) {
    case 'flat':
      adjustedDamage = weaponDamage;
      break;
    case 'strengthPlus':
      adjustedDamage = attributes.strength.value + parseInt(weaponDamage);
      break;
    case 'charismaPlus':
      adjustedDamage = attributes.charisma.value + parseInt(weaponDamage);
      break;
    case 'dexterityPlus':
      adjustedDamage = attributes.dexterity.value + parseInt(weaponDamage);
      break;
    case 'mindPlus':
      adjustedDamage = attributes.mind.value + parseInt(weaponDamage);
      break;
    case 'spiritPlus':
      adjustedDamage = attributes.spirit.value + parseInt(weaponDamage);
      break;
    default:
      adjustedDamage = parseInt(weaponDamage);
  }

  return TestDialog.wait({
    testType: 'attack',
    actor: actor,
    amountBD: 0,
    isAttack: true,
    isFav: skillData?.isFav || false,
    skillName: attackWith,
    skillValue: Math.max(skillValue, attributes[skillData?.baseAttribute]?.value || 0),
    unskilledUse: true,
    damage: adjustedDamage,
    weaponAP: weaponData.ap,
    applyArmor: true,
    DNDescriptor: dnDescriptor,
    type: 'attack',
    applySize: true,
    attackOptions: true,
    chatNote: weaponData.chatNote,
    bdDamageLabelStyle: 'hidden',
    bdDamageSum: 0,
    itemId: item.id,
  }, { useTargets: true });
}


export async function rollPower(actor, item) {
  const powerData = item.system;
  const skillName = powerData.skill;
  const skillData = actor.system.skills[skillName];

  // Set modifier for this power
  const powerModifier = item.system.modifier || 0;

  if (checkUnskilled(skillData.value, skillName, actor)) return;

  return TestDialog.wait({
    testType: 'power',
    actor: actor,
    powerName: item.name,
    powerModifier: powerModifier,
    isAttack: powerData.isAttack,
    isFav: skillData.isFav,
    skillName: skillName,
    skillAdds: skillData.adds,
    skillValue: Math.max(skillData.value, actor.system.attributes[skillData.baseAttribute].value),
    unskilledUse: false,
    damage: powerData.damage,
    weaponAP: powerData.ap,
    applyArmor: powerData.applyArmor,
    DNDescriptor: powerData.dn,
    applySize: powerData.applySize,
    attackOptions: true,
    bdDamageLabelStyle: 'dihiddene',
    amountBD: 0,
    bdDamageSum: 0,
    itemId: item.id,
  }, { useTargets: true });
}
import { oneTestTarget, TestDialog } from './test-dialog.js';
import { checkUnskilled } from './sheets/torgeternityActorSheet.js';
import { ChatMessageTorg } from './documents/chat/document.js';

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
          test.chatTitle =
            game.i18n.localize('torgeternity.attributes.' + test.skillName) +
            ' ' +
            game.i18n.localize('torgeternity.chatText.test') +
            ' ';
          break;
        case 'skill':
          if (test.customSkill != 'true') {
            test.chatTitle =
              game.i18n.localize('torgeternity.skills.' + test.skillName) +
              ' ' +
              game.i18n.localize('torgeternity.chatText.test') +
              ' ';
            break;
          } else {
            test.chatTitle = test.skillName + ' ';
            break;
          }
        case 'interactionAttack':
        case 'attack':
          test.chatTitle =
            game.i18n.localize('torgeternity.skills.' + test.skillName) +
            ' ' +
            game.i18n.localize('torgeternity.chatText.attack') +
            ' ';
          break;
        case 'soak':
          test.chatTitle = game.i18n.localize('torgeternity.sheetLabels.soakRoll') + ' ';
          break;
        case 'activeDefense':
          test.chatTitle = game.i18n.localize('torgeternity.sheetLabels.activeDefense') + ' ';
          break;
        case 'power':
          test.chatTitle =
            test.powerName + ' ' + game.i18n.localize('torgeternity.chatText.test') + ' ';
          break;
        case 'chase':
          test.chatTitle = game.i18n.localize('torgeternity.chatText.chase') + ' ';
          break;
        case 'stunt':
          test.chatTitle = game.i18n.localize('torgeternity.chatText.stunt') + ' ';
          break;
        case 'vehicleBase':
          test.chatTitle = game.i18n.localize('torgeternity.chatText.vehicleBase') + ' ';
          break;
        case 'custom':
          test.chatTitle = test.skillName;
          break;
        default:
          test.chatTitle =
            test.skillName + ' ' + game.i18n.localize('torgeternity.chatText.test') + ' ';
      }
    }

    //
    // Establish DN for this test based on test.DNDescriptor //
    //
    if (game.settings.get('torgeternity', 'uniqueDN')) {
      await oneDN(test);
    } else {
      await manyDN(test, target);
    }

    //
    // -----------------------Determine Bonus---------------------------- //

    // Do we display the unskilled label for a Storm Knight?
    let unskilledTest = false;
    const testActor = test.actor.includes('Token')
      ? fromUuidSync(test.actor)
      : fromUuidSync(test.actor);
    if (
      (testActor.type === 'stormknight') &
      (test.testType != 'custom') &
      (test.testType != 'attribute') &
      (test.testType != 'activeDefense') &
      (test.testType != 'activeDefenseUpdate') &
      (test.customSkill != 'true')
    ) {
      if (
        (testActor.system.skills[test.skillName].adds === 0) |
        (testActor.system.skills[test.skillName].adds === null)
      ) {
        unskilledTest = true;
      }
    }

    if (unskilledTest) {
      test.unskilledLabel = 'display:block';
    } else {
      test.unskilledLabel = 'display:none';
    }

    // Generate roll, if needed
    if (test.rollTotal === 0 && !test.previousBonus) {
      // Generate dice roll
      let dice = '1d20x10x20';
      if (unskilledTest) {
        dice = '1d20x10';
      }
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
    test.unskilledTest = unskilledTest;

    // Add the dices list in test
    if (first) {
      // add the dices only once, not for each target
      if (test.diceroll) {
        // to avoid errors if +3 cards
        if (test.diceList) {
          // if the array exists, concat the new dices
          test.diceList = test.diceList.concat(test.diceroll.dice[0].values);
        } else {
          // initialize it if not
          test.diceList = test.diceroll.dice[0].values;
        }
      }
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
    if (test.bonus >= 1) {
      test.bonusPlusLabel = 'display:inline';
    } else {
      test.bonusPlusLabel = 'display:none';
    }

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
      const ownToken = canvas.tokens.placeables.find(token => test.actor.includes(token.document.actor.uuid));
      if (ownToken && first) {
        if (!ownToken.document.hasStatusEffect('veryVulnerable')) {
          if (ownToken.document.hasStatusEffect('vulnerable')) {
            // take away vulnerable effect
            await ownToken.actor.toggleStatusEffect('vulnerable', { active: false });
          }
          const effect = await ownToken.actor.toggleStatusEffect('veryVulnerable', { active: true });
          effect.update({
            origin: test.actor,
            duration: { rounds: 2, turns: 2 }
          })
        } else if (
          ownToken.actor.appliedEffects.find((d) => d.statuses.find((e) => e === 'veryVulnerable'))
            .duration.turns != 2
        ) {
          await ownToken.actor.toggleStatusEffect('veryVulnerable', { active: false });
          const effect = await ownToken.actor.toggleStatusEffect('veryVulnerable', { active: true });
          effect.update({
            origin: test.actor,
            duration: { rounds: 2, turns: 2 }
          })
        }
      }
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

    if (test.type === 'power' && test.powerModifier) {
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
    test.outcome = null;
    test.actionTotalContent = game.i18n.localize('torgeternity.chatText.check.result.actionTotal');
    const testDifference = test.rollResult - test.DN;
    const dnLabel = 'torgeternity.dnTypes.' + test.DNDescriptor;
    test.actionTotalContent = game.i18n.localize('torgeternity.chatText.check.result.actionTotal') +
      ' ' + test.rollResult + ' vs. ' + test.DN + ' ' +
      game.i18n.localize(dnLabel);
    if (testDifference < 0) {
      test.outcome = game.i18n.localize('torgeternity.chatText.check.result.failure');
      // test.outcomeColor = "color: red"
      if (test.testType === 'power') {
        test.backlashLabel = 'display:inline';
      }
      if (game.settings.get('torgeternity', 'useColorBlindnessColors')) {
        test.outcomeColor = 'color: red';
      } else {
        test.outcomeColor =
          'color: red;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      }
      test.soakWounds = 0;
    } else if (testDifference > 9) {
      test.outcome = game.i18n.localize('torgeternity.chatText.check.result.outstandingSuccess');
      if (game.settings.get('torgeternity', 'useColorBlindnessColors')) {
        test.outcomeColor = 'color: rgb(44, 179, 44)';
      } else {
        test.outcomeColor =
          'color: green;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      }
      test.soakWounds = 'all';
    } else if (testDifference > 4) {
      test.outcome = game.i18n.localize('torgeternity.chatText.check.result.goodSuccess');
      if (game.settings.get('torgeternity', 'useColorBlindnessColors')) {
        test.outcomeColor = 'color: rgb(44, 179, 44)';
      } else {
        test.outcomeColor =
          'color: green;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      }
      test.soakWounds = 2;
    } else {
      test.outcome = game.i18n.localize('torgeternity.chatText.check.result.standartSuccess');
      if (game.settings.get('torgeternity', 'useColorBlindnessColors')) {
        test.outcomeColor = 'color: rgb(44, 179, 44)';
      } else {
        test.outcomeColor =
          'color: green;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
      }
      test.soakWounds = 1;
    }

    // Turn on + sign for modifiers?
    if (test.modifiers >= 1) {
      test.modifierPlusLabel = 'display:';
    } else {
      test.modifierPlusLabel = 'display:none';
    }

    // Choose Text to Display as Result
    const myActor = fromUuidSync(test.actor);
    if (isDisconnected(myActor)) {
      test.possibilityStyle = 'display:none';
      test.heroStyle = 'display:none';
      test.dramaStyle = 'display:none';
    }

    if (
      test.rollTotal === 1 &&
      !(test.testType === 'activeDefenseUpdate' || test.testType === 'activeDefense')
    ) {
      // Roll 1 and not defense = Mishape
      test.resultText = game.i18n.localize('torgeternity.chatText.check.result.mishape');
      test.outcomeColor = 'color: purple';
      test.resultTextColor = 'color: purple';
      if (!game.settings.get('torgeternity', 'useColorBlindnessColors')) {
        test.outcomeColor +=
          ';text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
        test.resultTextColor +=
          ';text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000, 0px 0px 15px black;';
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
      const oldAD = myActor.effects.find((a) => a.name === 'ActiveDefense'); // Search for an ActiveDefense effect
      const shieldOn = myActor.items.filter((it) => it.type === 'shield' && it.system.equipped); // Search for an equipped shield (an array)
      let shieldBonus = 0; // set the shieldBonus to 0 then check if the actor is Vulnerable, if true, shield bonus stay 0
      if (
        !myActor.effects.find(
          (a) => a.name === game.i18n.localize('torgeternity.statusEffects.vulnerable')
        ) &&
        !myActor.effects.find(
          (a) => a.name === game.i18n.localize('torgeternity.statusEffects.veryVulnerable')
        )
      ) {
        shieldBonus += shieldOn[0]?.system?.bonus || 0;
      }
      if (!oldAD) {
        // Create it if not present (if it exists, will be deleted farther)
        const NewActiveDefense = {
          name: 'ActiveDefense', // Add an icon to remind the defense, bigger ? Change color of Defense ?
          icon: 'icons/equipment/shield/heater-crystal-blue.webp', // To change I think, taken in Core, should have a dedicated file
          duration: { rounds: 1 },
          origin: myActor.uuid,
          changes: [
            {
              // Modify all existing "basic" defense in block
              key: 'defenses.dodge.mod', // Should need other work for defense vs powers
              value: test.bonus, // that don't target xxDefense
              priority: 20, // Create a data.ADB that store the bonus ?
              mode: 2,
            },
            {
              key: 'defenses.intimidation.mod',
              value: test.bonus,
              priority: 20,
              mode: 2,
            },
            {
              key: 'defenses.maneuver.mod',
              value: test.bonus,
              priority: 20,
              mode: 2,
            },
            {
              key: 'defenses.meleeWeapons.mod',
              value: test.bonus,
              priority: 20,
              mode: 2,
            },
            {
              key: 'defenses.taunt.mod',
              value: test.bonus,
              priority: 20,
              mode: 2,
            },
            {
              key: 'defenses.trick.mod',
              value: test.bonus,
              priority: 20,
              mode: 2,
            },
            {
              key: 'defenses.unarmedCombat.mod',
              value: test.bonus,
              priority: 20,
              mode: 2,
            },
            {
              key: 'defenses.toughness',
              value: shieldBonus,
              priority: 20,
              mode: 2,
            },
          ],
          disabled: false,
        };
        await fromUuid(test.actor).then(
          async (a) => await a.createEmbeddedDocuments('ActiveEffect', [NewActiveDefense])
        );
        test.testType = 'activeDefenseUpdate';
        test.resultText = '+ ' + test.bonus;
        test.actionTotalLabel = 'display:none';
      }
      if (oldAD) {
        // if present, reset by deleting
        fromUuidSync(test.actor)
          .effects.find((a) => a.name === 'ActiveDefense')
          .delete();
        // //
        const RAD = {
          // Simple chat message for information
          speaker: ChatMessage.getSpeaker(),
          content: game.i18n.localize('torgeternity.chatText.check.result.resetDefense'), // Need to be implemented if incorporated
        };
        await ChatMessage.create(RAD);
        return;
        // /
      }
    } else if (test.testType === 'activeDefenseUpdate') {
      // update bonus in case of bonus roll possibility / up
      // Delete Existing Active Effects
      fromUuidSync(test.actor)
        .effects.find((a) => a.name === 'ActiveDefense')
        ?.delete();
      if (test.bonus < 1) {
        test.bonus = 1;
      }
      test.resultText = '+ ' + test.bonus;
      // Create new set of active effects
      const shieldOn = myActor.items.filter((it) => it.type === 'shield' && it.system.equipped); // Search for an equipped shield (an array)
      let shieldBonus = 0;
      if (
        !myActor.effects.find(
          (a) => a.name === game.i18n.localize('torgeternity.statusEffects.vulnerable')
        ) &&
        !myActor.effects.find(
          (a) => a.name === game.i18n.localize('torgeternity.statusEffects.veryVulnerable')
        )
      ) {
        shieldBonus += shieldOn[0]?.system?.bonus || 0;
      }
      const NewActiveDefense = {
        name: 'ActiveDefense', // Add an icon to remind the defense, bigger ? Change color of Defense ?
        icon: 'icons/equipment/shield/heater-crystal-blue.webp', // To change I think, taken in Core, should have a dedicated file
        duration: { rounds: 1 },
        origin: myActor.uuid,
        changes: [
          {
            // Modify all existing "basic" defense in block
            key: 'defenses.dodge.mod', // Should need other work for defense vs powers
            value: test.bonus, // that don't target xxDefense
            priority: 20, // Create a data.ADB that store the bonus ?
            mode: 2,
          },
          {
            key: 'defenses.intimidation.mod',
            value: test.bonus,
            priority: 20,
            mode: 2,
          },
          {
            key: 'defenses.maneuver.mod',
            value: test.bonus,
            priority: 20,
            mode: 2,
          },
          {
            key: 'defenses.meleeWeapons.mod',
            value: test.bonus,
            priority: 20,
            mode: 2,
          },
          {
            key: 'defenses.taunt.mod',
            value: test.bonus,
            priority: 20,
            mode: 2,
          },
          {
            key: 'defenses.trick.mod',
            value: test.bonus,
            priority: 20,
            mode: 2,
          },
          {
            key: 'defenses.unarmedCombat.mod',
            value: test.bonus,
            priority: 20,
            mode: 2,
          },
          {
            key: 'defenses.toughness',
            value: shieldBonus,
            priority: 20,
            mode: 2,
          },
        ],
        disabled: false,
      };
      fromUuidSync(test.actor).createEmbeddedDocuments('ActiveEffect', [NewActiveDefense]);
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
        if (
          test.resultText === game.i18n.localize('torgeternity.chatText.check.result.failure') ||
          test.resultText === game.i18n.localize('torgeternity.chatText.check.result.mishape')
        ) {
          test.damageDescription = game.i18n.localize(
            'torgeternity.chatText.check.result.noDamage'
          );
          test.applyDamLabel = 'display:none';
          test.damageSubDescription = game.i18n.localize(
            'torgeternity.chatText.check.result.attackMissed'
          );
        } else {
          // Add BDs in promise if applicable as this should only be rolled if the test is successful
          if (test.addBDs && !test.previousBonus) {
            iteratedRoll = await torgBD(test.trademark, test.addBDs);
            test.BDDamageInPromise = iteratedRoll.total;
            test.diceList = test.diceList.concat(iteratedRoll.dice[0].values);
            test.amountBD += test.addBDs;
            test.addBDs = 0;

            test.chatTitle +=
              ` + ${test.amountBD} ` + game.i18n.localize('torgeternity.chatText.bonusDice');

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
            game.i18n.localize('torgeternity.chatText.check.result.damage') +
            ' ' +
            adjustedDamage +
            ' vs. ' +
            test.targetAdjustedToughness +
            ' ' +
            game.i18n.localize('torgeternity.chatText.check.result.toughness');
        }
      } else {
        // Basic roll
        test.damageSubLabel = 'display:none';
        test.damageDescription =
          adjustedDamage + ' ' + game.i18n.localize('torgeternity.chatText.check.result.damage');
      }
    } else {
      test.damageLabel = 'display:none';
      test.damageSubLabel = 'display:none';
    }

    // Remind Player to Check for Disconnect?
    if (test.rollTotal <= 4 && test.rollTotal != undefined) {
      test.disconnectLabel = 'display:block';
    } else {
      test.disconnectLabel = 'display:none';
    }

    // Label as Skill vs Attribute Test and turn on BD option if needed
    if (
      test.testType === 'skill' ||
      test.testType === 'interactionAttack' ||
      test.testType === 'chase' ||
      test.testType === 'stunt' ||
      test.testType === 'vehicleBase'
    ) {
      (test.typeLabel = `${game.i18n.localize('torgeternity.chatText.skillTestLabel')} `),
        (test.bdStyle = 'display:none');
    } else if (test.testType === 'attack') {
      test.typeLabel = `${game.i18n.localize('torgeternity.chatText.skillTestLabel')} `;
    } else if (test.testType === 'power') {
      test.typeLabel = `${game.i18n.localize('torgeternity.chatText.skillTestLabel')} `;
      if (test.isAttack) {
        test.bdStyle = 'display:';
      } else {
        test.bdStyle = 'display:none';
      }
    } else if (test.testType === 'custom') {
      test.typeLabel = `${game.i18n.localize('torgeternity.chatText.skillTestLabel')} `;
      test.outcomeColor = 'display:none;';
      test.resultTextColor = 'display:none;';
      test.bdStyle = 'display:block';
      test.upStyle = 'display:none';
    } else {
      test.typeLabel = `${game.i18n.localize('torgeternity.chatText.attributeTestLabel')} `;
      test.bdStyle = 'display:none';
    }

    // Display cards played label?
    if (parseInt(test.cardsPlayed) > 0) {
      test.cardsPlayedLabel = 'display:';
    } else {
      test.cardsPlayedLabel = 'display:none';
    }

    // Disable unavailable menu options (Note: possibilities are always available)

    if (test.upTotal > 0) test.upStyle = 'pointer-events:none;color:gray';

    if (test.heroTotal > 0) {
      test.heroStyle = 'pointer-events:none;color:gray';
    }

    if (test.dramaTotal > 0) {
      test.dramaStyle = 'pointer-events:none;color:gray';
    }

    if (test.actorType === 'threat') {
      (test.heroStyle = 'display:none'),
        (test.dramaStyle = 'display:none'),
        (test.plus3Style = 'display:none');
    }

    // Display chat notes label?

    if (test.chatNote === '') {
      test.notesLabel = 'display:none';
    } else {
      test.notesLabel = 'display:';
    }

    if (test.testType === 'interactionAttack') {
      if (test.rollResult - test.DN >= 0) {
        test.damageSubLabel = 'display:block';
        test.applyDamLabel = 'display:none';
        if (test.target.present) test.applyDebuffLabel = 'display:inline';
      } else {
        test.applyDebuffLabel = 'display:none';
        // test.damageSubDescription = "Apply debuff";//game.i18n.localize('torgeternity.chatText.check.result.damage')
      }
    }

    // record adjustedToughness for each flagged target
    target.targetAdjustedToughness = test.targetAdjustedToughness;

    const chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      owner: test.actor,
    };
    chatData.speaker.actor = test.actor.id;
    chatData.speaker.alias = test.actor.name;

    const messageDataIterated = {
      ...chatData,
      flags: {
        torgeternity: {
          test,
          template: 'systems/torgeternity/templates/partials/skill-card.hbs',
        },
      },
    };

    // roll Dice once, and handle the error if DSN is not installed
    if (game.dice3d) {
      if (i === 0) await game.dice3d.showForRoll(test.diceroll, game.user, true);
      game.dice3d.showForRoll(iteratedRoll);
    }
    iteratedRoll = undefined;

    messages.push(await ChatMessageTorg.create(messageDataIterated));
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
 * @param {TorgeternityActor} actor
 * @returns
 */

export function isDisconnected(actor) {
  // just like TokenDocument.hasStatusEffect
  return actor?.statuses.has('disconnected') ?? false;
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
export async function torgBD(isTrademark, amount = 1) {
  const diceroll = await new Roll(`${amount}d6${isTrademark ? 'rr1' : ''}x6max5`).evaluate();
  return diceroll;
}

/**
 *
 * @param damage
 * @param toughness
 */
export function torgDamage(damage, toughness) {
  const damageDiff = parseInt(damage) - parseInt(toughness);
  let damages = {
    label: '',
    shocks: 0,
    wounds: 0,
  };
  if (damageDiff < -5) {
    damages = {
      label: game.i18n.localize('torgeternity.chatText.check.result.noDamage'),
      shocks: 0,
      wounds: 0,
    };
  } else if (damageDiff < 0) {
    damages = {
      label: '1 ' + game.i18n.localize('torgeternity.stats.shock'),
      shocks: 1,
      wounds: 0,
    };
  } else if (damageDiff < 5) {
    damages = {
      label: '2 ' + game.i18n.localize('torgeternity.stats.shock'),
      shocks: 2,
      wounds: 0,
    };
  } else if (damageDiff < 10) {
    damages = {
      label:
        '1 ' +
        game.i18n.localize('torgeternity.stats.wounds') +
        ', 2 ' +
        game.i18n.localize('torgeternity.stats.shock'),
      shocks: 2,
      wounds: 1,
    };
  } else {
    const wounds = Math.floor(damageDiff / 5);
    const shock = wounds * 2;
    damages = {
      label:
        wounds +
        ' ' +
        game.i18n.localize('torgeternity.stats.wounds') +
        ' ' +
        shock +
        ' ' +
        game.i18n.localize('torgeternity.stats.shock'),
      shocks: shock,
      wounds: wounds,
    };
  }
  return damages;
}
/**
 *
 * @param damageObject
 * @param targetuuid
 */
export async function applyDamages(damageObject, targetuuid) {
  const targetToken = canvas.tokens.placeables.find(token => targetuuid.includes(token.document.uuid));
  // checking if user has target
  if (targetToken) {
    if (targetToken.actor.type !== 'vehicle') {
      // computing new values
      const newShock = targetToken.actor.system.shock.value + damageObject.shocks;
      const newWound = targetToken.actor.system.wounds.value + damageObject.wounds;
      // updating the target token's  actor
      await targetToken.actor.update({
        'system.shock.value': newShock,
        'system.wounds.value': newWound,
      });
      // too many wounds => apply defeat ? Ko ?
      if (newWound > targetToken.actor.system.wounds.max) {
        if (!targetToken.document.hasStatusEffect('dead')) {
          await targetToken.actor.toggleStatusEffect('dead', { active: true, overlay: true });
        }
      }
      // too many shocks, apply KO if not dead
      if (newShock > targetToken.actor.system.shock.max) {
        if (!targetToken.document.hasStatusEffect('unconscious')) {
          if (!targetToken.document.hasStatusEffect('dead')) {
            await targetToken.actor.toggleStatusEffect('unconscious', { active: true, overlay: true });
          }
        }
      }
    } else {
      // computing new values
      const newWound = targetToken.actor.system.wounds.value + damageObject.wounds;
      // updating the target token's  actor
      await targetToken.actor.update({
        'system.wounds.value': newWound,
      });
      // too many wounds => apply defeat ? Ko ?
      if (newWound > targetToken.actor.system.wounds.max) {
        if (!targetToken.document.hasStatusEffect('dead')) {
          await targetToken.actor.toggleStatusEffect('dead', { active: true, overlay: true });
        }
      }
    }
  } else {
    ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
  }
}
//
/**
 *
 * Apply 1 shock on a targetuuid
 * @param targetuuid
 */
export async function backlash1(targetuuid) {
  const targetToken = canvas.tokens.placeables.find(token => targetuuid.includes(token.document.actorId));
  // checking if user has target
  if (targetToken) {
    if (targetToken.actor.type !== 'vehicle') {
      // computing new values
      const newShock = targetToken.actor.system.shock.value + 2;
      // updating the target token's  actor
      await targetToken.actor.update({
        'system.shock.value': newShock,
      });
      // too many shocks, apply KO if not dead
      if (newShock > targetToken.actor.system.shock.max) {
        if (!targetToken.document.hasStatusEffect('unconscious')) {
          if (!targetToken.document.hasStatusEffect('dead')) {
            await targetToken.actor.toggleStatusEffect('unconscious', { active: true, overlay: true });
          }
        }
      }
    }
  } else {
    ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
  }
}
/**
 * Apply 2 shocks on a targetuuid
 * @param targetuuid
 */
export async function backlash2(targetuuid) {
  const targetToken = canvas.tokens.placeables.find(token => targetuuid.includes(token.document.actorId));
  // checking if user has target
  if (targetToken) {
    if (targetToken.actor.type !== 'vehicle') {
      // computing new values
      const newShock = targetToken.actor.system.shock.value + 1;
      // updating the target token's  actor
      await targetToken.actor.update({
        'system.shock.value': newShock,
      });
      // too many shocks, apply KO if not dead
      if (newShock > targetToken.actor.system.shock.max &&
        !targetToken.document.hasStatusEffect('unconscious') &&
        !targetToken.document.hasStatusEffect('dead')) {
        await targetToken.actor.toggleStatusEffect('unconscious', { active: true, overlay: true });
      }
    }
  } else {
    ui.notifications.warn(game.i18n.localize('torgeternity.notifications.noTarget'));
  }
}
/**
 * Apply veryStymied on a targetuuid
 * @param targetuuid
 */
export async function backlash3(targetuuid) {
  const targetToken = canvas.tokens.placeables.find(token => targetuuid.includes(token.document.actorId));
  // apply Stymied, or veryStymied
  if (targetToken.document.hasStatusEffect('stymied')) {
    await targetToken.actor.toggleStatusEffect('stymied', { active: false });
  }

  if (!targetToken.document.hasStatusEffect('veryStymied')) {
    let eff = await targetToken.actor.toggleStatusEffect('veryStymied', { active: true });
    eff.update({
      origin: targetuuid,
      duration: { rounds: 1, turns: 1 }
    })
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
  if (checkUnskilled(skillValue, skillName, soaker)) {
    return;
  }

  new TestDialog({
    testType: 'soak',
    actor: soaker.uuid,
    actorPic: soaker.img,
    actorName: soaker.name,
    actorType: soaker.system.type,
    isAttack: false,
    isFav:
      soaker.system.skills[skillName]?.isFav ||
      soaker.system.attributes[skillName + 'IsFav'] ||
      false,
    skillName: skillName,
    skillValue: skillValue,
    applySize: false,
    DNDescriptor: 'standard',
    attackOptions: false,
    chatNote: '',
    rollTotal: 0, // A zero indicates that a rollTotal needs to be generated when renderSkillChat is called //
  }, { useTargets: true });
  // do reality roll
}

/**
 * increase Stymied effect one step, up to VeryStymied
 * @param targetuuid
 */
export async function applyStymiedState(targetuuid, sourceuuid) {
  const targetToken = canvas.tokens.placeables.find(token => token.document.uuid.includes(targetuuid));
  // apply Stymied, or veryStymied
  let eff;
  if (targetToken.document.hasStatusEffect('veryStymied')) {
    //
  } else if (targetToken.document.hasStatusEffect('stymied')) {
    await targetToken.actor.toggleStatusEffect('stymied', { active: false });
    eff = 'veryStymied';
  } else {
    eff = 'stymied';
  }

  if (eff) {
    const effect = await targetToken.actor.toggleStatusEffect(eff, { active: true });
    effect.update({
      origin: sourceuuid,
      duration: { rounds: 1, turns: 1 }
    })
  }
}

/**
 * increase Vulnerable effect one step, up to VeryVulnerable
 * @param targetuuid
 */
export async function applyVulnerableState(targetuuid, sourceuuid) {
  const targetToken = canvas.tokens.placeables.find(token => targetuuid.includes(token.document.uuid));
  // apply Vulnerable, or veryVulnerable
  let eff;
  if (targetToken.document.hasStatusEffect('veryVulnerable')) {
    //
  } else if (targetToken.document.hasStatusEffect('vulnerable')) {
    await targetToken.actor.toggleStatusEffect('vulnerable', { active: false });
    eff = 'veryVulnerable';
  } else {
    eff = 'vulnerable';
  }
  if (eff) {
    const effect = await targetToken.actor.toggleStatusEffect(eff, { active: true });
    effect.update({
      origin: sourceuuid,
      duration: { rounds: 1, turns: 1 }
    })
  }
}

/**
 * Return the Torg value for a given number
 * This could probably be simplified by using the formula for the famous Torg algorhythm
 *
 * @param myNumber
 */
export function getTorgValue(myNumber) {
  let myValue = 0;
  if (myNumber <= 1) {
    myValue = 0;
  } else if (myNumber == 2) {
    myValue = 1;
  } else if (myNumber == 3) {
    myValue = 2;
  } else if (myNumber < 6) {
    myValue = 3;
  } else if (myNumber < 10) {
    myValue = 4;
  } else if (myNumber < 15) {
    myValue = 5;
  } else if (myNumber < 25) {
    myValue = 6;
  } else if (myNumber < 40) {
    myValue = 7;
  } else if (myNumber < 60) {
    myValue = 8;
  } else if (myNumber < 100) {
    myValue = 9;
  } else if (myNumber < 150) {
    myValue = 10;
  } else if (myNumber < 250) {
    myValue = 11;
  } else if (myNumber < 400) {
    myValue = 12;
  } else if (myNumber < 600) {
    myValue = 13;
  } else if (myNumber < 1000) {
    myValue = 14;
  } else if (myNumber < 1500) {
    myValue = 15;
  } else if (myNumber < 2500) {
    myValue = 16;
  } else if (myNumber < 4000) {
    myValue = 17;
  } else if (myNumber < 6000) {
    myValue = 18;
  } else if (myNumber < 10000) {
    myValue = 19;
  } else if (myNumber < 15000) {
    myValue = 20;
  } else if (myNumber < 25000) {
    myValue = 21;
  } else if (myNumber < 40000) {
    myValue = 22;
  } else if (myNumber < 60000) {
    myValue = 23;
  } else if (myNumber < 100000) {
    myValue = 24;
  } else if (myNumber < 150000) {
    myValue = 25;
  } else if (myNumber < 250000) {
    myValue = 26;
  } else if (myNumber < 400000) {
    myValue = 27;
  } else if (myNumber < 600000) {
    myValue = 28;
  } else if (myNumber < 1000000) {
    myValue = 29;
  } else if (myNumber < 1500000) {
    myValue = 30;
  } else if (myNumber < 2500000) {
    myValue = 31;
  } else if (myNumber < 4000000) {
    myValue = 32;
  } else if (myNumber < 6000000) {
    myValue = 33;
  } else if (myNumber < 10000000) {
    myValue = 34;
  } else if (myNumber < 15000000) {
    myValue = 35;
  } else if (myNumber < 25000000) {
    myValue = 36;
  } else if (myNumber < 40000000) {
    myValue = 37;
  } else if (myNumber < 60000000) {
    myValue = 38;
  } else if (myNumber < 100000000) {
    myValue = 39;
  } else if (myNumber < 150000000) {
    myValue = 40;
  } else if (myNumber < 250000000) {
    myValue = 41;
  } else if (myNumber < 400000000) {
    myValue = 42;
  } else if (myNumber < 600000000) {
    myValue = 43;
  } else if (myNumber < 1000000000) {
    myValue = 44;
  } else if (myNumber < 1500000000) {
    myValue = 45;
  } else if (myNumber < 2500000000) {
    myValue = 46;
  } else if (myNumber < 4000000000) {
    myValue = 47;
  } else if (myNumber < 6000000000) {
    myValue = 48;
  } else if (myNumber < 10000000000) {
    myValue = 49;
  } else if (myNumber < 15000000000) {
    myValue = 50;
  } else if (myNumber < 25000000000) {
    myValue = 51;
  } else if (myNumber < 40000000000) {
    myValue = 52;
  } else if (myNumber < 60000000000) {
    myValue = 53;
  } else if (myNumber < 100000000000) {
    myValue = 54;
  } else if (myNumber < 150000000000) {
    myValue = 55;
  } else if (myNumber < 250000000000) {
    myValue = 56;
  } else if (myNumber < 400000000000) {
    myValue = 57;
  } else if (myNumber < 600000000000) {
    myValue = 58;
  } else {
    myValue = 59;
  }
  return myValue;
}

async function manyDN(test, target) {
  switch (test.DNDescriptor) {
    case 'veryEasy':
      test.DN = 6;
      break;
    case 'easy':
      test.DN = 8;
      break;
    case 'standard':
      test.DN = 10;
      break;
    case 'challenging':
      test.DN = 12;
      break;
    case 'hard':
      test.DN = 14;
      break;
    case 'veryHard':
      test.DN = 16;
      break;
    case 'heroic':
      test.DN = 18;
      break;
    case 'nearImpossible':
      test.DN = 20;
      break;
    case 'targetCharisma':
      test.DN = target.attributes.charisma.value;
      break;
    case 'targetDexterity':
      test.DN = target.attributes.dexterity.value;
      break;
    case 'targetMind':
      test.DN = target.attributes.mind.value;
      break;
    case 'targetSpirit':
      test.DN = target.attributes.spirit.value;
      break;
    case 'targetStrength':
      test.DN = target.attributes.strength.value;
      break;
    case 'targetAlteration':
      if (target.skills.alteration.value && target.skills.alteration.value != '-') {
        test.DN = target.skills.alteration.value;
      } else {
        test.DN = target.attributes.mind.value;
      }
      break;
    case 'targetConjuration':
      if (target.skills.conjuration.value && target.skills.conjuration.value != '-') {
        test.DN = target.skills.conjuration.value;
      } else {
        test.DN = target.attributes.spirit.value;
      }
      break;
    case 'targetDivination':
      if (target.skills.divination.value && target.skills.divination.value != '-') {
        test.DN = target.skills.divination.value;
      } else {
        test.DN = target.attributes.mind.value;
      }
      break;
    case 'targetDodge':
      test.DN = target.defenses.dodge;
      break;
    case 'targetFaith':
      if (target.skills.faith.value) {
        test.DN = target.skills.faith.value;
      } else {
        test.DN = target.attributes.spirit.value;
      }
      break;
    case 'targetFind':
      if (target.skills.find.value && target.skills.find.value != '-') {
        test.DN = target.skills.find.value;
      } else {
        test.DN = target.attributes.mind.value;
      }
      break;
    case 'targetIntimidation':
      test.DN = target.defenses.intimidation;
      break;
    case 'targetKinesis':
      if (target.skills.kinesis.value && target.skills.kinesis.value != '-') {
        test.DN = target.skills.kinesis.value;
      } else {
        test.DN = target.attributes.spirit.value;
      }
      break;
    case 'targetManeuver':
      test.DN = target.defenses.maneuver;
      break;
    case 'targetMeleeWeapons':
      test.DN = target.defenses.meleeWeapons;
      break;
    case 'targetPrecognition':
      if (target.skills.precognition.value && target.skills.precognition.value != '-') {
        test.DN = target.skills.precognition.value;
      } else {
        test.DN = target.attributes.mind.value;
      }
      break;
    case 'targetStealth':
      if (target.skills.stealth.value) {
        test.DN = target.skills.stealth.value;
      } else {
        test.DN = target.attributes.dexterity.value;
      }
      break;
    case 'targetTaunt':
      test.DN = target.defenses.taunt;
      break;
    case 'targetTrick':
      test.DN = target.defenses.trick;
      break;
    case 'targetUnarmedCombat':
      test.DN = target.defenses.unarmedCombat;
      break;
    case 'targetWillpower':
      if (target.skills.willpower.value) {
        test.DN = target.skills.willpower.value;
      } else {
        test.DN = target.attributes.spirit.value;
      }
      break;
    case 'targetWillpowerMind':
      if (target.skills.willpower.value) {
        test.DN =
          target.skills.willpower.value -
          target.attributes.spirit.value +
          target.attributes.mind.value;
      } else {
        test.DN = target.attributes.mind.value;
      }
      break;
    case 'targetLandVehicles':
      if (target.skills.landVehicles.value) {
        test.DN = target.skills.landVehicles.value;
      } else {
        test.DN = target.attributes.dexterity.value;
      }
      break;
    case 'targetAirVehicles':
      if (target.skills.airVehicles.value) {
        test.DN = target.skills.airVehicles.value;
      } else {
        test.DN = target.attributes.dexterity.value;
      }
      break;
    case 'targetWaterVehicles':
      if (target.skills.waterVehicles.value) {
        test.DN = target.skills.waterVehicles.value;
      } else {
        test.DN = target.attributes.dexterity.value;
      }
      break;
    case 'highestSpeed':
      // Find the fastest participant in the active combat
      const combatants = game.combats.active.turns;
      const combatantCount = game.combats.active.turns.length;
      let combatantRun = 0;
      let combatantSpeed = 0;
      let highestSpeed = 0;
      for (let i = 0; i < combatantCount; i++) {
        if (combatants[i].actor.type === 'vehicle') {
          combatantSpeed = combatants[i].actor.system.topSpeed.value;
        } else {
          combatantRun = combatants[i].actor.system.other.run;
          combatantSpeed = getTorgValue(combatantRun);
        }
        if (combatantSpeed > highestSpeed) {
          highestSpeed = combatantSpeed;
        }
      }
      test.DN = highestSpeed;
      break;
    case 'targetVehicleDefense':
      test.DN = target.defenses.vehicle;
      break;
    default:
      test.DN = 10;
  }
}

async function oneDN(test) {

  function validValue(value, other) {
    return (value && value != '-') ? value : other;
  }
  function highest(func) {
    let highestDN = test?.DN || 0;
    for (const target of test.targetAll) {
      highestDN = Math.max(highestDN, func(target));
    }
    test.DN = highestDN;
  }

  switch (test.DNDescriptor) {
    case 'veryEasy':
      test.DN = 6;
      break;
    case 'easy':
      test.DN = 8;
      break;
    case 'standard':
      test.DN = 10;
      break;
    case 'challenging':
      test.DN = 12;
      break;
    case 'hard':
      test.DN = 14;
      break;
    case 'veryHard':
      test.DN = 16;
      break;
    case 'heroic':
      test.DN = 18;
      break;
    case 'nearImpossible':
      test.DN = 20;
      break;
    case 'targetCharisma':
      highest(target => target.attributes.charisma.value)
      break;
    case 'targetDexterity':
      highest(target => target.attributes.dexterity.value);
      break;
    case 'targetMind':
      highest(target => target.attributes.mind.value);
      break;
    case 'targetSpirit':
      highest(target => target.attributes.spirit.value);
      break;
    case 'targetStrength':
      highest(target => target.attributes.strength.value);
      break;
    case 'targetAlteration':
      highest(target => validValue(target.skills.alteration.value, target.attributes.mind.value));
      break;
    case 'targetConjuration':
      highest(target => validValue(target.skills.conjuration.value, target.attributes.spirit.value));
      break;
    case 'targetDivination':
      highest(target => validValue(target.skills.divination.value, target.attributes.mind.value));
      break;
    case 'targetDodge':
      highest(target => target.defenses.dodge);
      break;
    case 'targetFaith':
      highest(target => target.skills.faith.value || target.attributes.spirit.value);
      break;
    case 'targetFind':
      highest(target => validValue(target.skills.find.value, target.attributes.mind.value));
      break;
    case 'targetIntimidation':
      highest(target => target.defenses.intimidation);
      break;
    case 'targetKinesis':
      highest(target => validValue(target.skills.kinesis.value, target.attributes.spirit.value));
      break;
    case 'targetManeuver':
      highest(target => target.defenses.maneuver);
      break;
    case 'targetMeleeWeapons':
      highest(target => target.defenses.meleeWeapons);
      break;
    case 'targetPrecognition':
      highest(target => validValue(target.skills.precognition.value, target.attributes.mind.value));
      break;
    case 'targetStealth':
      highest(target => target.skills.stealth.value || target.attributes.dexterity.value);
      break;
    case 'targetTaunt':
      highest(target => target.defenses.taunt);
      break;
    case 'targetTrick':
      highest(target => target.defenses.trick);
      break;
    case 'targetUnarmedCombat':
      highest(target => target.defenses.unarmedCombat);
      break;
    case 'targetWillpower':
      highest(target => target.skills.willpower.value || target.attributes.spirit.value);
      break;
    case 'targetWillpowerMind':
      highest(target => target.skills.willpower.value
        ? (target.skills.willpower.value - target.attributes.spirit.value + target.attributes.mind.value)
        : target.attributes.mind.value);
      break;
    case 'targetLandVehicles':
      highest(target => target.skills.landVehicles.value || target.attributes.dexterity.value);
      break;
    case 'targetAirVehicles':
      highest(target => target.skills.airVehicles.value || target.attributes.dexterity.value);
      break;
    case 'targetWaterVehicles':
      highest(target => target.skills.waterVehicles.value || target.attributes.dexterity.value);
      break;
    case 'highestSpeed':
      // Find the fastest participant in the active combat
      let highestSpeed = 0;
      for (const combatant of game.combats.active.turns) {
        highestSpeed = Math.max(highestSpeed,
          (combatant.actor.type === 'vehicle')
            ? combatant.actor.system.topSpeed.value
            : getTorgValue(combatant.actor.system.other.run));
      }
      test.DN = highestSpeed;
      break;
    case 'targetVehicleDefense':
      highest(target => target.defenses?.vehicle ?? 0);
      break;
    default:
      test.DN = 10;
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

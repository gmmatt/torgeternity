import { TestDialog } from './test-dialog.js';
import { checkUnskilled } from './sheets/torgeternityActorSheet.js';
import { ChatMessageTorg } from './documents/chat/document.js';

/**
 *
 * @param test
 */
export async function renderSkillChat(test) {
  const messages = [];
  if (test?.targetAll.length != 0) {
  } else test.targetAll = [test.target];

  // disable DSN (if used) for 'every' message (want to show only one dice despite many targets)
  try {
    game.dice3d.messageHookDisabled = true;
  } catch (e) {}

  test.applyDebuffLabel = 'display:none';
  test.applyDamLabel = 'display:none';
  test.backlashLabel = 'display:none';
  test.bdDamageLabelStyle = test.bdDamageSum ? 'display:block' : 'display:none';
  let iteratedRoll;

  // Handle ammo. First, check if there is enough ammo, then reduce it.
  if (test.item?.weaponWithAmmo) {
    await test?.item.reduceAmmo(test.burstModifier, test.targetAll.length);
    test.ammoLabel = 'display:table-row';
  } else {
    test.ammoLabel = 'display:none';
  }

  for (let i = 0; i < test.targetAll.length; i++) {
    const target = test.targetAll[i];
    test.target = target;
    test.sizeModifier = test.sizeModifierAll[i];
    test.vulnerableModifier = test.vulnerableModifierAll[i];
    const currentTarget = target;

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

    if (unskilledTest === true) {
      test.unskilledLabel = 'display:block';
    } else {
      test.unskilledLabel = 'display:none';
    }

    // Generate roll, if needed
    if ((test.rollTotal === 0) & (test.previousBonus === false)) {
      // Generate dice roll
      let dice = '1d20x10x20';
      if (unskilledTest === true) {
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
    if (i === 0) {
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
    if (!test.upTotal) {
      test.upTotal = 0;
    }
    if (!test.possibilityTotal) {
      test.possibilityTotal = 0;
    }
    if (!test.heroTotal) {
      test.heroTotal = 0;
    }
    if (!test.dramaTotal) {
      test.dramaTotal = 0;
    }

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
      if (test.bonus < 1) {
        test.bonus = 1;
      }
    }

    // Add plus label if number is positive
    if (test.bonus >= 1) {
      test.bonusPlusLabel = 'display:inline';
    } else {
      test.bonusPlusLabel = 'display:none';
    }

    // Set Modifiers and Chat Content Relating to Modifiers
    test.displayModifiers = true;
    test.modifiers = 0;
    test.modifierText = '';
    if (test.testTtype === 'soak') {
      test.vulnerableModifier = 0;
    }

    if (test.woundModifier < 0) {
      test.displayModifiers = true;
      test.modifierText =
        game.i18n.localize('torgeternity.chatText.check.modifier.wounds') +
        test.woundModifier +
        '\n';
      test.modifiers = parseInt(test.woundModifier);
    }

    if (test.stymiedModifier < 0) {
      test.displayModifiers = true;
      if (test.stymiedModifier == -2) {
        test.modifierText +=
          game.i18n.localize('torgeternity.chatText.check.modifier.stymied') + '\n';
        test.modifiers += -2;
      } else if (test.stymiedModifier == -4) {
        test.modifierText +=
          game.i18n.localize('torgeternity.chatText.check.modifier.veryStymied') + '\n';
        test.modifiers += -4;
      }
    }

    if (test.darknessModifier < 0) {
      test.displayModifiers = true;
      test.modifierText +=
        game.i18n.localize('torgeternity.chatText.check.modifier.darkness') +
        ' ' +
        test.darknessModifier +
        '\n';
      test.modifiers += parseInt(test.darknessModifier);
    }

    if (test.movementModifier < 0) {
      test.displayModifiers = true;
      test.modifierText +=
        game.i18n.localize('torgeternity.chatText.check.modifier.running') + '  \n';
      test.modifiers += -2;
    }

    if (test.multiModifier < 0) {
      test.displayModifiers = true;
      test.modifierText +=
        game.i18n.localize('torgeternity.chatText.check.modifier.multiAction') +
        ' ' +
        test.multiModifier +
        '\n';
      test.modifiers += parseInt(test.multiModifier);
    }

    if (test.targetsModifier < 0) {
      test.displayModifiers = true;
      test.modifierText +=
        game.i18n.localize('torgeternity.chatText.check.modifier.multiTarget') +
        ' ' +
        test.targetsModifier +
        '\n';
      test.modifiers += parseInt(test.targetsModifier);
    }

    if (test.isOther1 == true) {
      test.displayModifiers = true;
      test.modifierText += test.other1Description + ' ' + test.other1Modifier + '\n';
      test.modifiers += parseInt(test.other1Modifier);
    }

    if (test.isOther2 == true) {
      test.displayModifiers = true;
      test.modifierText += test.other2Description + ' ' + test.other2Modifier + '\n';
      test.modifiers += parseInt(test.other2Modifier);
    }

    if (test.isOther3 == true) {
      test.displayModifiers = true;
      test.modifierText += test.other3Description + ' ' + test.other3Modifier + '\n';
      test.modifiers += parseInt(test.other3Modifier);
    }

    // Apply target-related modifiers
    if (target?.present == true) {
      // Apply the size modifier in appropriate circumstances
      if (test.applySize == true) {
        if (test.sizeModifier > 0) {
          test.displayModifiers = true;
          test.modifiers += parseInt(test.sizeModifier);
          test.modifierText +=
            game.i18n.localize('torgeternity.chatText.check.modifier.targetSize') +
            ' +' +
            test.sizeModifier +
            '\n';
        } else if (test.sizeModifier < 0) {
          test.displayModifiers = true;
          test.modifiers += parseInt(test.sizeModifier);
          test.modifierText +=
            game.i18n.localize('torgeternity.chatText.check.modifier.targetSize') +
            ' ' +
            test.sizeModifier +
            '\n';
        }
      }

      // Apply target vulnerability modifier
      if (test.vulnerableModifier === 2) {
        test.displayModifiers = true;
        test.modifiers += parseInt(test.vulnerableModifier);
        test.modifierText +=
          game.i18n.localize('torgeternity.chatText.check.modifier.targetVulnerable') + '\n';
      } else if (test.vulnerableModifier === 4) {
        test.displayModifiers = true;
        test.modifiers += parseInt(test.vulnerableModifier);
        test.modifierText +=
          game.i18n.localize('torgeternity.chatText.check.modifier.targetVeryVulnerable') + '\n';
      }
    }

    if (test.calledShotModifier < 0) {
      test.modifiers += parseInt(test.calledShotModifier);
      test.modifierText +=
        game.i18n.localize('torgeternity.chatText.check.modifier.calledShot') +
        ' ' +
        test.calledShotModifier +
        '\n';
    }

    if (test.burstModifier > 0) {
      test.modifiers += parseInt(test.burstModifier);
      if (test.burstModifier === 2) {
        test.modifierText +=
          game.i18n.localize('torgeternity.chatText.check.modifier.shortBurst') + '\n';
      } else if (test.burstModifier === 4) {
        test.modifierText +=
          game.i18n.localize('torgeternity.chatText.check.modifier.longBurst') + '\n';
      } else if (test.burstModifier === 6) {
        test.modifierText +=
          game.i18n.localize('torgeternity.chatText.check.modifier.heavyBurst') + '\n';
      }
    }

    if (test.allOutModifier > 0) {
      test.modifiers += 4;
      test.modifierText +=
        game.i18n.localize('torgeternity.chatText.check.modifier.allOutAttack') + '\n';

      // if it's an all-out-attack, apply very vulnerable to attacker
      const ownToken = canvas.tokens.placeables.find((tok) =>
        test.actor.includes(tok.document.actor.uuid)
      );
      if (!!ownToken & (i === 0)) {
        if (!ownToken.actor.statuses.find((d) => d === 'veryVulnerable')) {
          if (ownToken.actor.statuses.find((d) => d === 'vulnerable')) {
            // take away vulnerable effect
            const ef = CONFIG.statusEffects.find((e) => e.id === 'vulnerable');
            await ownToken.toggleEffect(ef, { active: false });
          }
          const eff = CONFIG.statusEffects.find((e) => e.id === 'veryVulnerable');
          eff.origin = test.actor;
          eff.duration = { rounds: 2, turns: 2 };
          await ownToken.toggleEffect(eff, { active: true });
        } else if (
          ownToken.actor.appliedEffects.find((d) => d.statuses.find((e) => e === 'veryVulnerable'))
            .duration.turns != 2
        ) {
          const eff = CONFIG.statusEffects.find((e) => e.id === 'veryVulnerable');
          await ownToken.toggleEffect(eff, { active: false });
          eff.origin = test.actor;
          eff.duration = { rounds: 2, turns: 2 };
          await ownToken.toggleEffect(eff, { active: true });
        }
      }
    }

    if (test.aimedModifier > 0) {
      test.modifiers += 4;
      test.modifierText +=
        game.i18n.localize('torgeternity.chatText.check.modifier.aimedShot') + '\n';
    }

    if (test.blindFireModifier < 0) {
      test.modifiers += -6;
      test.modifierText +=
        game.i18n.localize('torgeternity.chatText.check.modifier.blindFire') + '\n';
    }

    if (test.concealmentModifier < 0) {
      test.modifiers += parseInt(test.concealmentModifier);
      test.modifierText +=
        game.i18n.localize('torgeternity.chatText.check.modifier.targetConcealment') +
        ' ' +
        test.concealmentModifier +
        '\n';
    }

    if (test.type === 'power') {
      if (test.powerModifier > 0 || test.powerModifier < 0) {
        test.displayModifiers === true;
        test.modifiers += parseInt(test.powerModifier);
        test.modifierText +=
          game.i18n.localize('torgeternity.chatText.check.modifier.powerModifier') +
          ' ' +
          test.powerModifier +
          '\n';
      }
    }

    // Apply vehicle-related modifiers
    if (test.testType === 'chase' || test.testType === 'stunt' || test.testType === 'vehicleBase') {
      if (test.maneuverModifier > 0 || test.maneuverModifier < 0) {
        test.displayModifiers === true;
        test.modifiers += parseInt(test.maneuverModifier);
        test.modifierText +=
          game.i18n.localize('torgeternity.stats.maneuverModifier') +
          ' ' +
          test.maneuverModifier +
          '\n';
      }
    }

    if (test.testType === 'chase') {
      if (test.speedModifier > 0) {
        test.displayModifiers === true;
        test.modifiers += parseInt(test.speedModifier);
        test.modifierText +=
          game.i18n.localize('torgeternity.stats.speedModifier') + ' ' + test.speedModifier + '\n';
      }
    }

    if (test.displayModifiers === true) {
      test.modifierLabel = 'display:';
    } else {
      test.modifierLabel = 'display:none';
    }

    // Add +3 cards to bonus
    // Initialize cardsPlayed if null
    if (!test.cardsPlayed) {
      test.cardsPlayed = 0;
    }
    const tempBonus = parseInt(test.bonus);
    test.bonus = parseInt(tempBonus) + parseInt(test.cardsPlayed) * 3;

    test.rollResult = parseInt(
      parseInt(test.skillValue) + parseInt(test.bonus) + parseInt(test.modifiers)
    );

    // Determine Outcome
    test.outcome = null;
    test.actionTotalContent = game.i18n.localize('torgeternity.chatText.check.result.actionTotal');
    const testDifference = test.rollResult - test.DN;
    const dnLabel = 'torgeternity.dnTypes.' + test.DNDescriptor;
    test.actionTotalContent =
      game.i18n.localize('torgeternity.chatText.check.result.actionTotal') +
      ' ' +
      test.rollResult +
      ' vs. ' +
      test.DN +
      ' ' +
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
    if (checkForDiscon(myActor)) {
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
          `${test.soakWounds}` +
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
        fromUuidSync(test.actor).createEmbeddedDocuments('ActiveEffect', [NewActiveDefense]);
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
    if (test.isAttack === true) {
      test.damageLabel = 'display: block';
      // Add damage modifier for vital area hits, if necessary
      let adjustedDamage = test.damage;
      if (test.vitalAreaDamageModifier) {
        adjustedDamage = test.damage + test.vitalAreaDamageModifier;
      }
      // add additional Damage from roll dialogue
      if (test?.additionalDamage && test.previousBonus === false) {
        adjustedDamage += test?.additionalDamage;
      }
      // Check for whether a target is present & turn on display of damage sub-label
      if (test.target.present === true) {
        test.damageSubLabel = 'display:block';
        // If armor and cover can assist, adjust toughness based on AP effects and cover modifier
        if (test.applyArmor === true) {
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
          if (test.addBDs && test.previousBonus === false) {
            iteratedRoll = await torgBD(test.trademark, test.addBDs);
            test.BDDamageInPromise = iteratedRoll.total;
            test.diceList = test.diceList.concat(iteratedRoll.dice[0].values);
            test.amountBD += test.addBDs;
            test.addBDs = 0;

            test.chatTitle +=
              ` +${test.amountBD}` + game.i18n.localize('torgeternity.chatText.bonusDice');

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
      (test.typeLabel = `${game.i18n.localize('torgeternity.chatText.skillTestLabel')}`),
        (test.bdStyle = 'display:none');
    } else if (test.testType === 'attack') {
      test.typeLabel = `${game.i18n.localize('torgeternity.chatText.skillTestLabel')}`;
    } else if (test.testType === 'power') {
      test.typeLabel = `${game.i18n.localize('torgeternity.chatText.skillTestLabel')}`;
      if (test.isAttack === true) {
        test.bdStyle = 'display:';
      } else {
        test.bdStyle = 'display:none';
      }
    } else {
      test.typeLabel = `${game.i18n.localize('torgeternity.chatText.attributeTestLabel')}`;
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

    // Cannot pass target array to chat because Bad Things happen when I try it, so we have to clear it out here
    test.targets = '';
    // record adjustedToughness for each flagged target
    currentTarget.targetAdjustedToughness = test.targetAdjustedToughness;

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
        torgeternity: { test, currentTarget },
        template: './systems/torgeternity/templates/partials/skill-card.hbs',
      },
    };

    // roll Dice once, and handle the error if DSN is not installed
    if (i === 0) {
      try {
        await game.dice3d.showForRoll(test.diceroll, game.user, true);
      } catch (e) {}
    }
    try {
      game.dice3d.showForRoll(iteratedRoll);
      iteratedRoll = undefined;
    } catch (e) {}

    messages.push(await ChatMessageTorg.create(messageDataIterated));
  }

  if (game.settings.get('torgeternity', 'unTarget')) {
    await game.user.updateTokenTargets();
    await game.user.broadcastActivity({ targets: [] });
  }
  try {
    game.dice3d.messageHookDisabled = false;
  } catch (e) {}

  return messages;
}

/**
 *
 * @param {TorgeternityActor} actor
 * @returns
 */

export function checkForDiscon(actor) {
  for (const ef of actor.statuses) {
    if (ef === 'disconnected') {
      return true;
    }
  }
  return false;
}

/**
 *
 * @param rollTotal
 */
export function torgBonus(rollTotal) {
  let bonus;
  if (rollTotal == 1) {
    bonus = -10;
  } else if (rollTotal == 2) {
    bonus = -8;
  } else if (rollTotal <= 4) {
    bonus = -6;
  } else if (rollTotal <= 6) {
    bonus = -4;
  } else if (rollTotal <= 8) {
    bonus = -2;
  } else if (rollTotal <= 10) {
    bonus = -1;
  } else if (rollTotal <= 12) {
    bonus = 0;
  } else if (rollTotal <= 14) {
    bonus = 1;
  } else if (rollTotal == 15) {
    bonus = 2;
  } else if (rollTotal == 16) {
    bonus = 3;
  } else if (rollTotal == 17) {
    bonus = 4;
  } else if (rollTotal == 18) {
    bonus = 5;
  } else if (rollTotal == 19) {
    bonus = 6;
  } else if (rollTotal == 20) {
    bonus = 7;
  } else if (rollTotal >= 21) {
    bonus = 7 + Math.ceil((rollTotal - 20) / 5);
  }
  return bonus;
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
  const targetToken = canvas.tokens.placeables.find((tok) =>
    targetuuid.includes(tok.document.uuid)
  ); // find(tok=> tok.actor.id === targetuuid);
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
        if (!targetToken.actor.statuses.find((d) => d === 'dead')) {
          const eff = CONFIG.statusEffects.find((e) => e.id === 'dead');
          await targetToken.toggleEffect(eff, { active: true, overlay: true });
        }
      }
      // too many shocks, apply KO if not dead
      if (newShock > targetToken.actor.system.shock.max) {
        if (!targetToken.actor.statuses.find((d) => d === 'unconscious')) {
          if (!targetToken.actor.statuses.find((d) => d === 'dead')) {
            const eff = CONFIG.statusEffects.find((e) => e.id === 'unconscious');
            await targetToken.toggleEffect(eff, { active: true, overlay: true });
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
        if (!targetToken.actor.statuses.find((d) => d === 'dead')) {
          const eff = CONFIG.statusEffects.find((e) => e.id === 'dead');
          await targetToken.toggleEffect(eff, { active: true, overlay: true });
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
  const targetToken = canvas.tokens.placeables.find((tok) =>
    targetuuid.includes(tok.document.actorId)
  );
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
        if (!targetToken.actor.statuses.find((d) => d === 'unconscious')) {
          if (!targetToken.actor.statuses.find((d) => d === 'dead')) {
            const eff = CONFIG.statusEffects.find((e) => e.id === 'unconscious');
            await targetToken.toggleEffect(eff, { active: true, overlay: true });
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
  const targetToken = canvas.tokens.placeables.find((tok) =>
    targetuuid.includes(tok.document.actorId)
  );
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
      if (newShock > targetToken.actor.system.shock.max) {
        if (!targetToken.actor.statuses.find((d) => d === 'unconscious')) {
          if (!targetToken.actor.statuses.find((d) => d === 'dead')) {
            const eff = CONFIG.statusEffects.find((e) => e.id === 'unconscious');
            await targetToken.toggleEffect(eff, { active: true, overlay: true });
          }
        }
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
  const targetToken = canvas.tokens.placeables.find((tok) =>
    targetuuid.includes(tok.document.actorId)
  );
  // apply Stymied, or veryStymied
  let eff;
  let oldEff;
  if (targetToken.actor.statuses.find((d) => d === 'veryStymied')) {
  } else if (targetToken.actor.statuses.find((d) => d === 'stymied')) {
    oldEff = CONFIG.statusEffects.find((e) => e.id === 'stymied');
    eff = CONFIG.statusEffects.find((e) => e.id === 'veryStymied');
  } else {
    eff = CONFIG.statusEffects.find((e) => e.id === 'veryStymied');
  }
  if (eff) {
    eff.origin = targetuuid;
    eff.duration = { rounds: 1, turns: 1 };
    await targetToken.toggleEffect(eff, { active: true });
  }
  if (oldEff) await targetToken.toggleEffect(oldEff, { active: false });
}
//
/**
 *@param soaker
 */
export async function soakDamages(soaker) {
  const skillName = 'reality';
  const attributeName = 'spirit';
  const isAttributeTest = false;
  const skillValue = soaker.system.skills[skillName].value;

  // Before calculating roll, check to see if it can be attempted unskilled; exit test if actor doesn't have required skill
  if (checkUnskilled(skillValue, skillName, soaker)) {
    return;
  }

  const test = {
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
    skillName: isAttributeTest ? attributeName : skillName,
    skillValue: skillValue,
    targets: Array.from(game.user.targets),
    applySize: false,
    DNDescriptor: 'standard',
    attackOptions: false,
    chatNote: '',
    rollTotal: 0, // A zero indicates that a rollTotal needs to be generated when renderSkillChat is called //
  };

  new TestDialog(test);
  // do reality roll
}

/**
 * increase Stymied effect one step, up to VeryStymied
 * @param targetuuid
 */
export async function applyStymiedState(targetuuid, sourceuuid) {
  const targetToken = canvas.tokens.placeables.find((tok) =>
    tok.document.uuid.includes(targetuuid)
  );
  // apply Stymied, or veryStymied
  let eff;
  let oldEff;
  if (targetToken.actor.statuses.find((d) => d === 'veryStymied')) {
  } else if (targetToken.actor.statuses.find((d) => d === 'stymied')) {
    oldEff = CONFIG.statusEffects.find((e) => e.id === 'stymied');
    eff = CONFIG.statusEffects.find((e) => e.id === 'veryStymied');
  } else {
    eff = CONFIG.statusEffects.find((e) => e.id === 'stymied');
  }
  if (eff) {
    eff.origin = sourceuuid;
    eff.duration = { rounds: 1, turns: 1 };
    await targetToken.toggleEffect(eff, { active: true });
  }
  if (oldEff) await targetToken.toggleEffect(oldEff, { active: false });
}

/**
 * increase Vulnerable effect one step, up to VeryVulnerable
 * @param targetuuid
 */
export async function applyVulnerableState(targetuuid, sourceuuid) {
  const targetToken = canvas.tokens.placeables.find((tok) =>
    targetuuid.includes(tok.document.uuid)
  );
  // apply Vulnerable, or veryVulnerable
  let eff;
  let oldEff;
  if (targetToken.actor.statuses.find((d) => d === 'veryVulnerable')) {
  } else if (targetToken.actor.statuses.find((d) => d === 'vulnerable')) {
    oldEff = CONFIG.statusEffects.find((e) => e.id === 'vulnerable');
    eff = CONFIG.statusEffects.find((e) => e.id === 'veryVulnerable');
  } else {
    eff = CONFIG.statusEffects.find((e) => e.id === 'vulnerable');
  }
  if (eff) {
    eff.origin = sourceuuid;
    eff.duration = { rounds: 1, turns: 1 };
    await targetToken.toggleEffect(eff, { active: true });
  }
  if (oldEff) await targetToken.toggleEffect(oldEff, { active: false });
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
  let highestDN = test?.DN || 0;
  let tempDN;
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
      for (const tar of test.targetAll) {
        tempDN = tar.attributes.charisma.value;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetDexterity':
      for (const tar of test.targetAll) {
        tempDN = tar.attributes.dexterity.value;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetMind':
      for (const tar of test.targetAll) {
        tempDN = tar.attributes.mind.value;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetSpirit':
      for (const tar of test.targetAll) {
        tempDN = tar.attributes.spirit.value;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetStrength':
      for (const tar of test.targetAll) {
        tempDN = tar.attributes.strength.value;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetAlteration':
      for (const tar of test.targetAll) {
        if (tar.skills.alteration.value && tar.skills.alteration.value != '-') {
          tempDN = tar.skills.alteration.value;
        } else {
          tempDN = tar.attributes.mind.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetConjuration':
      for (const tar of test.targetAll) {
        if (tar.skills.conjuration.value && tar.skills.conjuration.value != '-') {
          tempDN = tar.skills.conjuration.value;
        } else {
          tempDN = tar.attributes.spirit.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetDivination':
      for (const tar of test.targetAll) {
        if (tar.skills.divination.value && tar.skills.divination.value != '-') {
          tempDN = tar.skills.divination.value;
        } else {
          tempDN = tar.attributes.mind.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetDodge':
      for (const tar of test.targetAll) {
        tempDN = tar.defenses.dodge;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetFaith':
      for (const tar of test.targetAll) {
        if (tar.skills.faith.value) {
          tempDN = tar.skills.faith.value;
        } else {
          tempDN = tar.attributes.spirit.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetFind':
      for (const tar of test.targetAll) {
        if (tar.skills.find.value && tar.skills.find.value != '-') {
          tempDN = tar.skills.find.value;
        } else {
          tempDN = tar.attributes.mind.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetIntimidation':
      for (const tar of test.targetAll) {
        tempDN = tar.defenses.intimidation;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetKinesis':
      for (const tar of test.targetAll) {
        if (tar.skills.kinesis.value && tar.skills.kinesis.value != '-') {
          tempDN = tar.skills.kinesis.value;
        } else {
          tempDN = tar.attributes.spirit.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetManeuver':
      for (const tar of test.targetAll) {
        tempDN = tar.defenses.maneuver;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetMeleeWeapons':
      for (const tar of test.targetAll) {
        tempDN = tar.defenses.meleeWeapons;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetPrecognition':
      for (const tar of test.targetAll) {
        if (tar.skills.precognition.value && tar.skills.precognition.value != '-') {
          tempDN = tar.skills.precognition.value;
        } else {
          tempDN = tar.attributes.mind.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetStealth':
      for (const tar of test.targetAll) {
        if (tar.skills.stealth.value) {
          tempDN = tar.skills.stealth.value;
        } else {
          tempDN = tar.attributes.dexterity.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetTaunt':
      for (const tar of test.targetAll) {
        tempDN = tar.defenses.taunt;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetTrick':
      for (const tar of test.targetAll) {
        tempDN = tar.defenses.trick;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetUnarmedCombat':
      for (const tar of test.targetAll) {
        tempDN = tar.defenses.unarmedCombat;
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetWillpower':
      for (const tar of test.targetAll) {
        if (tar.skills.willpower.value) {
          tempDN = tar.skills.willpower.value;
        } else {
          tempDN = tar.attributes.spirit.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetWillpowerMind':
      for (const tar of test.targetAll) {
        if (tar.skills.willpower.value) {
          tempDN =
            tar.skills.willpower.value - tar.attributes.spirit.value + tar.attributes.mind.value;
        } else {
          tempDN = tar.attributes.mind.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetLandVehicles':
      for (const tar of test.targetAll) {
        if (tar.skills.landVehicles.value) {
          tempDN = tar.skills.landVehicles.value;
        } else {
          tempDN = tar.attributes.dexterity.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetAirVehicles':
      for (const tar of test.targetAll) {
        if (tar.skills.airVehicles.value) {
          tempDN = tar.skills.airVehicles.value;
        } else {
          tempDN = tar.attributes.dexterity.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
      break;
    case 'targetWaterVehicles':
      for (const tar of test.targetAll) {
        if (tar.skills.waterVehicles.value) {
          tempDN = tar.skills.waterVehicles.value;
        } else {
          tempDN = tar.attributes.dexterity.value;
        }
        highestDN = Math.max(highestDN, tempDN);
      }
      test.DN = highestDN;
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

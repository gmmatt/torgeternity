export function renderSkillChat(test) {
    var target = test.target;

    //
    // Check to see if we already have a chat title from a chat card roll. If not, Set title for Chat Message in test.chatTitle //
    //
    if (!test.chatTitle) {
        switch (test.testType) {
            case "attribute":
                var localId = "torgeternity.attributes." + test.skillName;
                test.chatTitle = game.i18n.localize(localId) + " " + game.i18n.localize('torgeternity.chatText.test');
                break;
            case "skill":
                if (test.customSkill != "true") {
                    var localId = "torgeternity.skills." + test.skillName;
                    test.chatTitle = game.i18n.localize(localId) + " " + game.i18n.localize('torgeternity.chatText.test');
                    break; 
                } else {
                    test.chatTitle = test.skillName
                    break;        
                }
            case "interactionAttack":
            case "attack":
                var localId = "torgeternity.skills." + test.skillName;
                test.chatTitle = game.i18n.localize(localId) + " " + game.i18n.localize("torgeternity.chatText.attack");
                break;
            case "activeDefense":
                test.chatTitle = game.i18n.localize("torgeternity.sheetLabels.activeDefense");
                break;
            case "power":
                test.chatTitle = test.powerName + " " + game.i18n.localize('torgeternity.chatText.test');
                break;
            default:
                test.chatTitle = test.skillName + " " + game.i18n.localize('torgeternity.chatText.test');
        }
    }

    //
    // Establish DN for this test based on test.DNDescriptor //
    //

    switch (test.DNDescriptor) {
        case "veryEasy":
            test.DN = 6;
            break;
        case "easy":
            test.DN = 8;
            break;
        case "standard":
            test.DN = 10;
            break;
        case "challenging":
            test.DN = 12;
            break;
        case "hard":
            test.DN = 14;
            break;
        case "veryHard":
            test.DN = 16;
            break;
        case "heroic":
            test.DN = 18;
            break;
        case "nearImpossible":
            test.DN = 20;
            break;
        case "targetCharisma":
            test.DN = target.attributes.charisma;
            break;
        case "targetDexterity":
            test.DN = target.attributes.dexterity;
            break;
        case "targetMind":
            test.DN = target.attributes.mind;
            break;
        case "targetSpirit":
            test.DN = target.attributes.spirit;
            break;
        case "targetStrength":
            test.DN = target.attributes.strength;
            break;
        case "targetAlteration":
            if (target.skills.alteration.value && target.skills.alteration.value != "-") {
                test.DN = target.skills.alteration.value;
            } else {
                test.DN = target.attributes.mind;
            }
            break;
        case "targetConjuration":
            if (target.skills.conjuration.value && target.skills.conjuration.value != "-") {
                test.DN = target.skills.conjuration.value;
            } else {
                test.DN = target.attributes.spirit
            }
            break;
        case "targetDivination":
            if (target.skills.divination.value && target.skills.divination.value != "-") {
                test.DN = target.skills.divination.value;
            } else {
                test.DN = target.attributes.mind
            }
            break;
        case "targetDodge":
            test.DN = target.defenses.dodge;
            break;
        case "targetFaith":
            if (target.skills.faith.value) {
                test.DN = target.skills.faith.value;
            } else {
                test.DN = target.attributes.spirit;
            }
            break;
        case "targetIntimidation":
            test.DN = target.defenses.intimidation;
            break;
        case "targetKinesis":
            if (target.skills.kinesis.value && target.skills.kinesis.value != "-") {
                test.DN = target.skills.kinesis.value
            } else {
                test.DN = target.attributes.spirit
            };
            break;
        case "targetManeuver":
            test.DN = target.defenses.maneuver;
            break;
        case "targetMeleeWeapons":
            test.DN = target.defenses.meleeWeapons;
            break;
        case "targetPrecognition":
            if (target.skills.precognition.value && target.skills.precognition.value != "-") {
                test.DN = target.skills.precognition.value
            } else {
                test.DN = target.attributes.mind
            }
            break;
        case "targetStealth":
            if (target.skills.stealth.value) {
                test.DN = target.skills.stealth.value
            } else {
                test.DN = target.attributes.dexterity
            }
            break;
        case "targetTaunt":
            test.DN = target.defenses.taunt;
            break;
        case "targetTrick":
            test.DN = target.defenses.trick;
            break;
        case "targetUnarmedCombat":
            test.DN = target.defenses.unarmedCombat;
            break;
        case "targetWillpower":
            if (target.skills.willpower.value) {
                test.DN = target.skills.willpower.value
            } else {
                test.DN = target.attributes.spirit
            }
            break;
        case "targetWillpowerMind":
            if (target.skills.willpower.value) {
                test.DN = target.skills.willpower.value - target.attributes.spirit + target.attributes.mind
            } else {
                test.DN = target.attributes.mind
            }
            break;
        case "targetLandVehicles":
            if (target.skills.landVehicles.value) {
                test.DN = target.skills.landVehicles.value
            } else {
                test.DN = target.attributes.dexterity
            }
            break;
        case "targetAirVehicles":
            if (target.skills.airVehicles.value) {
                test.DN = target.skills.airVehicles.value
            } else {
                test.DN = target.attributes.dexterity
            }
            break;
        case "targetWaterVehicles":
            if (target.skills.waterVehicles.value) {
                test.DN = target.skills.waterVehicles.value
            } else {
                test.DN = target.attributes.dexterity
            }
            break;
        default:
            test.DN = 10
    }

    // -----------------------Determine Bonus---------------------------- //

    // Do we display the unskilled label for a Storm Knight?
    var unskilledTest = false;
    var myActor = test.actor.includes("Token") ? fromUuidSync(test.actor).actor : fromUuidSync(test.actor)
    if (myActor.type === "stormknight" & test.testType != "attribute" & test.testType != "activeDefense" & test.testType != "activeDefenseUpdate" & test.customSkill != "true") {
        if (myActor.system.skills[test.skillName].adds === 0 | myActor.system.skills[test.skillName].adds === null) {
            unskilledTest = true;
        }
    }

    if (unskilledTest === true) {
        test.unskilledLabel = "display:block"
    } else {
        test.unskilledLabel = "display:none"
    }

    // Generate roll, if needed
    if (test.rollTotal === 0 & test.previousBonus === false) {
        // Generate dice roll
        var dice = "1d20x10x20"
        if (test.disfavored === true) {
            dice = "1d20"
        } else if (unskilledTest === true) {
            dice = "1d20x10"
        }
        test.diceroll = new Roll(dice).evaluate({ async: false });
        test.rollTotal = test.diceroll.total;
    }

    //
    // Get current bonus and make + label visible if number is positive
    //
    // Initialize upTotal, possibilityTotal, heroTotal, and dramaTotal at zero, if necessary
    if (!test.upTotal) {
        test.upTotal = 0;
    }
    if (!test.possibilityTotal) {
        test.possibilityTotal = 0
    }
    if (!test.heroTotal) {
        test.heroTotal = 0
    }
    if (!test.dramaTotal) {
        test.dramaTotal = 0
    }

    // Calculate combinedRollTotal
    test.combinedRollTotal = parseInt(test.rollTotal) + parseInt(test.upTotal) + parseInt(test.possibilityTotal) + parseInt(test.heroTotal) + parseInt(test.dramaTotal)
    if (test.previousBonus != true) {
        test.bonus = torgBonus(test.combinedRollTotal);
    } else {
        test.combinedRollTotal = "-"
    }

    // Raise bonus to 1 if actively defending
    if (test.testType === "activeDefense" || test.testType === "activeDefenseUpdate") {
        if (test.bonus < 1) {
            test.bonus = 1
        }
    }

    // Add plus label if number is positive
    if (test.bonus >= 1) {
        test.bonusPlusLabel = "display:inline"
    } else {
        test.bonusPlusLabel = "display:none"
    }

    // Set Modifiers and Chat Content Relating to Modifiers
    test.displayModifiers = true;
    test.modifiers = 0;
    test.modifierText = "";

    if (test.woundModifier < 0) {
        test.displayModifiers = true;
        test.modifierText = game.i18n.localize('torgeternity.chatText.check.modifier.wounds') + test.woundModifier + "\n";
        test.modifiers = parseInt(test.woundModifier)
    };

    if (test.stymiedModifier < 0) {
        test.displayModifiers = true;
        if (test.stymiedModifier == -2) {
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.stymied') + "\n";
            test.modifiers += -2;
        } else if (test.stymiedModifier == -4) {
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.veryStymied') + "\n";
            test.modifiers += -4;
        }
    };

    if (test.darknessModifier < 0) {
        test.displayModifiers = true;
        test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.darkness') + " " + test.darknessModifier + "\n";
        test.modifiers += parseInt(test.darknessModifier);
    }

    if (test.movementModifier < 0) {
        test.displayModifiers = true;
        test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.running') + "  \n";
        test.modifiers += -2;
    }

    if (test.multiModifier < 0) {
        test.displayModifiers = true;
        test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.multiAction') + " " + test.multiModifier + "\n";
        test.modifiers += parseInt(test.multiModifier);
    }

    if (test.targetsModifier < 0) {
        test.displayModifiers = true;
        test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.multiTarget') + " " + test.targetsModifier + "\n";
        test.modifiers += parseInt(test.targetsModifier);
    }

    if (test.isOther1 == true) {
        test.displayModifiers = true;
        test.modifierText += test.other1Description + " " + test.other1Modifier + "\n";
        test.modifiers += parseInt(test.other1Modifier);
    }

    if (test.isOther2 == true) {
        test.displayModifiers = true;
        test.modifierText += test.other2Description + " " + test.other2Modifier + "\n";
        test.modifiers += parseInt(test.other2Modifier);
    }

    if (test.isOther3 == true) {
        test.displayModifiers = true;
        test.modifierText += test.other3Description + " " + test.other3Modifier + "\n";
        test.modifiers += parseInt(test.other3Modifier);
    }

    // Apply target-related modifiers
    if (target?.present == true) {
        // Apply the size modifier in appropriate circumstances
        if (test.applySize == true) {

            if (test.sizeModifier > 0) {
                test.displayModifiers = true;
                test.modifiers += parseInt(test.sizeModifier);
                test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.targetSize') + " +" + test.sizeModifier + "\n"
            } else if (test.sizeModifier < 0) {
                test.displayModifiers = true;
                test.modifiers += parseInt(test.sizeModifier)
                test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.targetSize') + " " + test.sizeModifier + "\n"
            }
        }

        // Apply target vulnerability modifier
        if (test.vulnerableModifier === 2) {
            test.displayModifiers = true;
            test.modifiers += parseInt(test.vulnerableModifier)
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.targetVulnerable') + "\n"
        } else if (test.vulnerableModifier === 4) {
            test.displayModifiers = true;
            test.modifiers += parseInt(test.vulnerableModifier)
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.targetVeryVulnerable') + "\n"
        }

    }

    if (test.calledShotModifier < 0) {
        test.modifiers += parseInt(test.calledShotModifier);
        test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.calledShot') + " " + test.calledShotModifier + "\n"
    }

    if (test.burstModifier > 0) {
        test.modifiers += parseInt(test.burstModifier);
        if (test.burstModifier === 2) {
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.shortBurst') + "\n"
        } else if (test.burstModifier === 4) {
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.longBurst') + "\n"
        } else if (test.burstModifier === 6) {
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.heavyBurst') + "\n"
        }
    }

    if (test.allOutModifier > 0) {
        test.modifiers += 4;
        test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.allOutAttack') + "\n"
    }

    if (test.aimedModifier > 0) {
        test.modifiers += 4;
        test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.aimedShot') + "\n"
    }

    if (test.blindFireModifier < 0) {
        test.modifiers += -6;
        test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.blindFire') + "\n"
    }

    if (test.concealmentModifier < 0) {
        test.modifiers += parseInt(test.concealmentModifier);
        test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.targetConcealment') + " " + test.concealmentModifier + "\n"
    }

    if (test.type === "power") {
        if (test.powerModifier > 0 || test.powerModifier < 0) {
            test.displayModifiers === true;
            test.modifiers += parseInt(test.powerModifier)
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.powerModifier') + " " + test.powerModifier + "\n"
        }
    }

    if (test.displayModifiers === true) {
        test.modifierLabel = "display:"
    } else {
        test.modifierLabel = "display:none"
    };

    // Add +3 cards to bonus
    // Initialize cardsPlayed if null
    if (!test.cardsPlayed) {
        test.cardsPlayed = 0;
    }
    const tempBonus = parseInt(test.bonus)
    test.bonus = parseInt(tempBonus) + (parseInt(test.cardsPlayed) * 3)

    test.rollResult = parseInt(parseInt(test.skillValue) + parseInt(test.bonus) + parseInt(test.modifiers));

    // Determine Outcome
    test.outcome = null
    test.actionTotalContent = game.i18n.localize('torgeternity.chatText.check.result.actionTotal');
    const testDifference = test.rollResult - test.DN
    const dnLabel = "torgeternity.dnTypes." + test.DNDescriptor
    test.actionTotalContent = game.i18n.localize('torgeternity.chatText.check.result.actionTotal') + " " + test.rollResult + " vs. " + test.DN + " " + game.i18n.localize(dnLabel);
    if (testDifference < 0) {
        test.outcome = game.i18n.localize('torgeternity.chatText.check.result.failure');
    } else if (testDifference > 9) {
        test.outcome = game.i18n.localize('torgeternity.chatText.check.result.outstandingSuccess');
    } else if (testDifference > 4) {
        test.outcome = game.i18n.localize('torgeternity.chatText.check.result.goodSuccess');
    } else {
        test.outcome = game.i18n.localize('torgeternity.chatText.check.result.standartSuccess');
    }

    // Turn on + sign for modifiers?
    if (test.modifiers >= 1) {
        test.modifierPlusLabel = "display:"
    } else {
        test.modifierPlusLabel = "display:none"
    }

    // Choose Text to Display as Result
    var myActor = fromUuidSync(test.actor);
    if ((test.rollTotal === 1) && !((test.testType === "activeDefenseUpdate") || (test.testType === "activeDefense"))) {   //Roll 1 and not defense = Mishape
        test.resultText = game.i18n.localize('torgeternity.chatText.check.result.mishape');
        test.actionTotalLabel = "display:none";
    // Create and Manage Active Effect if SK is Actively Defending (thanks Durak!)
    } else if (test.testType === "activeDefense") {                                                         //Click on defense
        var oldAD = myActor.effects.find(a => a.label === "ActiveDefense");      //Search for an ActiveDefense effect
        var shieldOn = myActor.items.filter(it => (it.type === "shield" && it.system.equipped));    //Search for an equipped shield (an array)
        if (!oldAD) {                                                                                       //Create it if not present (if it exists, will be deleted farther)
            let NewActiveDefense = {
                label : "ActiveDefense",                                                                    //Add an icon to remind the defense, bigger ? Change color of Defense ?
                icon : "icons/equipment/shield/heater-crystal-blue.webp",                                   //To change I think, taken in Core, should have a dedicated file
                duration : {"rounds" : 1},
                changes : [{                                                                                //Modify all existing "basic" defense in block
                        "key": "system.dodgeDefense",                                                         //Should need other work for defense vs powers
                        "value": test.bonus,                                                                //that don't target xxDefense
                        "priority": 20,                                                                     //Create a data.ADB that store the bonus ?
                        "mode": 2
                        },{
                        "key": "system.intimidationDefense",
                        "value": test.bonus,
                        "priority": 20,
                        "mode": 2
                        },{
                        "key": "system.maneuverDefense",
                        "value": test.bonus,
                        "priority": 20,
                        "mode": 2
                        },{
                        "key": "system.meleeWeaponsDefense",
                        "value": test.bonus,
                        "priority": 20,
                        "mode": 2
                        },{
                        "key": "system.tauntDefense",
                        "value": test.bonus,
                        "priority": 20,
                        "mode": 2
                        },{
                        "key": "system.trickDefense",
                        "value": test.bonus,
                        "priority": 20,
                        "mode": 2
                        },{
                        "key": "system.unarmedCombatDefense",
                        "value": test.bonus,
                        "priority": 20,
                        "mode": 2
                        },{
                        "key": "system.other.toughness",
                        "value": shieldOn[0]?.system?.bonus || 0,
                        "priority": 20,
                        "mode": 2
                    }],
                disabled : false
            };
            fromUuidSync(test.actor).createEmbeddedDocuments("ActiveEffect",[NewActiveDefense]);
            test.testType = "activeDefenseUpdate";    
            test.resultText = "+ " + test.bonus;
            test.actionTotalLabel = "display:none";
        };
        if (oldAD) {                                                                                        //if present, reset by deleting
            fromUuidSync(test.actor).effects.find(a => a.label === "ActiveDefense").delete();
            ////
            let RAD = {                                                                                     //Simple chat message for information
                speaker: ChatMessage.getSpeaker(),
                content: game.i18n.localize('torgeternity.chatText.check.result.resetDefense')              //Need to be implemented if incorporated
            };
            ChatMessage.create(RAD);
            return
            ///
        };

    } else if (test.testType === "activeDefenseUpdate") {                                                   //update bonus in case of bonus roll possibility / up
        // Delete Existing Active Effects
        fromUuidSync(test.actor).effects.find(a => a.label === "ActiveDefense").delete();
        if (test.bonus < 1) {
            test.bonus = 1
        };
        test.resultText = "+ " + test.bonus;
        // Create new set of active effects
        var shieldOn = myActor.items.filter(it => (it.type === "shield" && it.system.equipped));
        let NewActiveDefense = {
            label : "ActiveDefense",                                                                    //Add an icon to remind the defense, bigger ? Change color of Defense ?
            icon : "icons/equipment/shield/heater-crystal-blue.webp",                                   //To change I think, taken in Core, should have a dedicated file
            duration : {"rounds" : 1},
            changes : [{                                                                                //Modify all existing "basic" defense in block
                    "key": "system.dodgeDefense",                                                         //Should need other work for defense vs powers
                    "value": test.bonus,                                                                //that don't target xxDefense
                    "priority": 20,                                                                     //Create a data.ADB that store the bonus ?
                    "mode": 2
                    },{
                    "key": "system.intimidationDefense",
                    "value": test.bonus,
                    "priority": 20,
                    "mode": 2
                    },{
                    "key": "system.maneuverDefense",
                    "value": test.bonus,
                    "priority": 20,
                    "mode": 2
                    },{
                    "key": "system.meleeWeaponsDefense",
                    "value": test.bonus,
                    "priority": 20,
                    "mode": 2
                    },{
                    "key": "system.tauntDefense",
                    "value": test.bonus,
                    "priority": 20,
                    "mode": 2
                    },{
                    "key": "system.trickDefense",
                    "value": test.bonus,
                    "priority": 20,
                    "mode": 2
                    },{
                    "key": "system.unarmedCombatDefense",
                    "value": test.bonus,
                    "priority": 20,
                    "mode": 2
                    },{
                    "key": "system.other.toughness",
                    "value": shieldOn[0]?.system?.bonus || 0,
                    "priority": 20,
                    "mode": 2
            }],
            disabled : false
        };
        fromUuidSync(test.actor).createEmbeddedDocuments("ActiveEffect",[NewActiveDefense]);
        } else {
        test.resultText = test.outcome
    }


    // If an attack, calculate and display damage
    if (test.isAttack === true) {
        test.damageLabel = "display: block";
        // Add damage modifier for vital area hits, if necessary
        var adjustedDamage = test.damage
        if (test.vitalAreaDamageModifier) {
            adjustedDamage = test.damage + test.vitalAreaDamageModifier;
        }
        //Check for whether a target is present & turn on display of damage sub-label
        if (test.target.present === true) {
            test.damageSubLabel = "display:block";
            // If armor and cover can assist, adjust toughness based on AP effects and cover modifier
            if (test.applyArmor === true) {
                if (test.weaponAP > 0) {
                    if (test.weaponAP <= test.target.armor) {
                        test.targetAdjustedToughness = parseInt(test.target.toughness) - parseInt(test.weaponAP) + parseInt(test.coverModifier);
                    } else {
                        test.targetAdjustedToughness = parseInt(test.target.toughness) - parseInt(test.target.armor) + parseInt(test.coverModifier);
                    }
                } else {
                    test.targetAdjustedToughness = parseInt(test.target.toughness) + parseInt(test.coverModifier);
                }
                // Ignore armor and cover
            } else {
                test.targetAdjustedToughness = parseInt(test.target.toughness) - parseInt(test.target.armor)
            }
            // Generate damage description and damage sublabel 
            if (test.resultText === game.i18n.localize('torgeternity.chatText.check.result.failure') || test.resultText === game.i18n.localize('torgeternity.chatText.check.result.mishape')) {
                test.damageDescription = game.i18n.localize('torgeternity.chatText.check.result.noDamage');;
                test.damageSubDescription = game.i18n.localize('torgeternity.chatText.check.result.attackMissed');;
            } else {
                test.damageDescription = torgDamage(adjustedDamage, test.targetAdjustedToughness).label
                test.damageSubDescription = game.i18n.localize('torgeternity.chatText.check.result.damage') + " " + adjustedDamage + " vs. " + test.targetAdjustedToughness + " " + game.i18n.localize('torgeternity.chatText.check.result.toughness');
                //if auto apply damages == true in settings
                if (game.settings.get("torgeternity", "autoDamages")) {
                    applyDamages(torgDamage(adjustedDamage, test.targetAdjustedToughness))
                }

            }
        } else {
            // Basic roll
            test.damageSubLabel = "display:none";
            test.damageDescription = adjustedDamage + " " + game.i18n.localize('torgeternity.chatText.check.result.damage');
        }
    } else {
        test.damageLabel = "display:none"
        test.damageSubLabel = "display:none"
    }

    // Remind Player to Check for Disconnect?
    if (test.rollTotal <= 4) {
        test.disconnectLabel = "display:block"
    } else {
        test.disconnectLabel = "display:none"
    }

    // Label as Skill vs Attribute Test and turn on BD option if needed
    if (test.testType === "skill" || test.testType === "interactionAttack") {
        test.typeLabel = `${game.i18n.localize("torgeternity.chatText.skillTestLabel")}`,
            test.bdStyle = "display:none"
    } else if (test.testType === "attack") {
        test.typeLabel = `${game.i18n.localize("torgeternity.chatText.skillTestLabel")}`
    } else if (test.testType === "power") {
        test.typeLabel = `${game.i18n.localize("torgeternity.chatText.skillTestLabel")}`;
        if (test.isAttack === true) {
            test.bdStyle = "display:"
        } else {
            test.bdStyle = "display:none"
        }
    } else {
        test.typeLabel = `${game.i18n.localize("torgeternity.chatText.attributeTestLabel")}`
        test.bdStyle = "display:none"
    }

    // Display cards played label?
    if (parseInt(test.cardsPlayed) > 0) {
        test.cardsPlayedLabel = "display:"
    } else {
        test.cardsPlayedLabel = "display:none"
    };

    // Disable unavailable menu options (Note: possibilities are always available)

    if (test.upTotal > 0) (
        test.upStyle = "pointer-events:none;color:gray"
    )

    if (test.heroTotal > 0) {
        test.heroStyle = "pointer-events:none;color:gray"
    }

    if (test.dramaTotal > 0) {
        test.dramaStyle = "pointer-events:none;color:gray"
    }

    if (test.actorType === "threat") {
        test.heroStyle = "display:none",
            test.dramaStyle = "display:none",
            test.plus3Style = "display:none"
    }

    // Display chat notes label?

    if (test.chatNote === "") {
        test.notesLabel = "display:none"
    } else {
        test.notesLabel = "display:"
    }

    // Cannot pass target array to chat because Bad Things happen when I try it, so we have to clear it out here
    test.targets = ""

    let chatData = {
        user: game.user._id,
        speaker: ChatMessage.getSpeaker(),
        owner: test.actor,
    };
    chatData.speaker.actor = test.actor.id;
    chatData.speaker.alias = test.actor.name;

    const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-card.hbs", test)

    const messageData = { ...chatData, flags: { torgeternity: { test } } }

    templatePromise.then(content => {
        if (test.diceroll != null) {
            messageData.flavor = content;
            test.diceroll.toMessage(messageData);
        } else {
            messageData.content = content;
            ChatMessage.create(messageData);
        };
    });


}

export function torgBonus(rollTotal) {
    let bonus;
    if (rollTotal == 1) {
        bonus = -10
    } else if (rollTotal == 2) {
        bonus = -8
    } else if (rollTotal <= 4) {
        bonus = -6
    } else if (rollTotal <= 6) {
        bonus = -4
    } else if (rollTotal <= 8) {
        bonus = -2
    } else if (rollTotal <= 10) {
        bonus = -1
    } else if (rollTotal <= 12) {
        bonus = 0
    } else if (rollTotal <= 14) {
        bonus = 1
    } else if (rollTotal == 15) {
        bonus = 2
    } else if (rollTotal == 16) {
        bonus = 3
    } else if (rollTotal == 17) {
        bonus = 4
    } else if (rollTotal == 18) {
        bonus = 5
    } else if (rollTotal == 19) {
        bonus = 6
    } else if (rollTotal == 20) {
        bonus = 7
    } else if (rollTotal >= 21) {
        bonus = 7 + Math.ceil((rollTotal - 20) / 5)
    }
    return bonus

}

export function torgBD() {
    let diceroll;
    diceroll = new Roll('1d6x6max5').evaluate({ async: false });

    return diceroll
}

export function torgDamage(damage, toughness) {
    const damageDiff = parseInt(damage) - parseInt(toughness)
    let damages = {
        label: "",
        shocks: 0,
        wounds: 0
    };
    if (damageDiff < -5) {
        damages = {
            label: game.i18n.localize('torgeternity.chatText.check.result.noDamage'),
            shocks: 0,
            wounds: 0
        };
    } else if (damageDiff < 0) {
        damages = {
            label: "1 " + game.i18n.localize('torgeternity.stats.shock'),
            shocks: 1,
            wounds: 0
        };
    } else if (damageDiff < 5) {
        damages = {
            label: "2 " + game.i18n.localize('torgeternity.stats.shock'),
            shocks: 2,
            wounds: 0
        };

    } else if (damageDiff < 10) {
        damages = {
            label: "1 " + game.i18n.localize('torgeternity.stats.wounds') + ", 2 " + game.i18n.localize('torgeternity.stats.shock'),
            shocks: 2,
            wounds: 1
        };
    } else {
        const wounds = Math.floor(damageDiff / 5);
        const shock = wounds * 2;
        damages = {
            label: wounds + " " + game.i18n.localize('torgeternity.stats.wounds') + " " + shock + " " + game.i18n.localize('torgeternity.stats.shock'),
            shocks: shock,
            wounds: wounds
        };
    }
    return damages
}
export async function applyDamages(damageObject) {
    let targetToken = Array.from(game.user.targets)[0]
    //checking if user has target
    if (targetToken) {
        //computing new values
        let newShock = targetToken.actor.data.data.shock.value + damageObject.shocks;
        let newWound = targetToken.actor.data.data.wounds.value + damageObject.wounds;
        //updating the target token's  actor
        await targetToken.actor.update({
            "data.shock.value": newShock,
            "data.wounds.value": newWound,
        });
        //too many shocks => apply KO/
        if (newShock >= targetToken.actor.data.data.shock.max) {
            //TODO : apply KO status
        }
        //too many wounds => apply defeat
        if (newWound > targetToken.actor.data.data.wounds.max) {
            //TODO : test defeat apply defeat
        }

    } else {
        ui.notifications.warn(game.i18n.localize("torgeternity.notifications.noTarget"))
    }

}

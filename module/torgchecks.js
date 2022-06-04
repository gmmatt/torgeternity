export async function SkillCheck(test) {
    /*   {

       testType = null,
       skillName = null,
       skillBaseAttribute = null,
       skillAdds = null,
       skillValue = null,
       unskilledUse = null,
       woundModifier = null,
       stymiedModifier = null,
       actor = null } = {}) {
       let test = {
          actor: actor.data._id,
          actorPic: actor.data.img,
          actorType: "stormknight",
          skillName: skillName,
          skillBaseAttribute: skillBaseAttribute,
          skillAdds: skillAdds,
          skillValue: skillValue,
          unskilledUse: unskilledUse,
          woundModifier: woundModifier,
          stymiedModifier: stymiedModifier,
          testType: testType,
          possibilityTotal: 0,
          upTotal: 0,
          heroTotal: 0,
          dramaTotal: 0,
          cardsPlayed: 0,
          sizeModifier: 0,
          vulnerableModifier: 0
       }; */

    // What kind of actor is this?

    /*   if (actor.data.type === "threat") {
          test.actorType = "threat"
       }; */

    // Cannot Attempt Certain Tests Unskilled
    if (test.skillValue === "-") {
        let cantRollData = {
            user: game.user.data._id,
            speaker: ChatMessage.getSpeaker(),
            owner: test.actor,
        };

        let templateData = {
            message: test.skillName + " " + game.i18n.localize('torgeternity.chatText.check.cantUseUntrained'),
            actorPic: test.actor.data.img
        };

        const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-error-card.hbs", templateData);

        templatePromise.then(content => {
            cantRollData.content = content;
            ChatMessage.create(cantRollData);
        })

        return
    }

    // Roll as skilled or unskilled
    let diceroll
    if (test.previousBonus === true) {
        //Don't roll anything
        if (test.skillAdds > 0) {
            test.unskilledLabel = "display:none"
        }
    } else if (test.testType === "skill") {
        if (test.skillAdds > 0) {
            if (test.disfavored === false) {
                diceroll = new Roll('1d20x10x20').evaluate({ async: false });
            } else {
                diceroll = new Roll('1d20').evaluate({async:false});
            }
            test.unskilledLabel = "display:none"
        } else if (test.skillAdds === 0) {
            if (test.disfavored === false) {
                diceroll = new Roll('1d20x10').evaluate({ async: false });
            } else {
                diceroll = new Roll('1d20').evaluate({async:false});
            }
            test.unskilledLabel = "display:block"
        // Should trigger only if this is a threat and test.skilAdds therefore equals null   
        } else {
            if (test.disfavored === false) {
                diceroll = new Roll('1d20x10').evaluate({ async: false });
            } else {
                diceroll = new Roll('1d20').evaluate({async:false});
            }
            test.unskilledLabel = "display:none"
        }
    } else {
        if (test.disfavored === false) {
            diceroll = new Roll('1d20x10x20').evaluate({ async: false });
        } else {
            diceroll = new Roll('1d20').evaluate({async:false});
        }
    test.unskilledLabel = "display:none"
    }

    //diceroll.toMessage();
    if (test.previousBonus === true) {
        test.diceroll = null;
    } else {
        test.diceroll = diceroll;
        test.rollTotal = diceroll.total;
    }

    // Get Bonus and Roll Result

    // Get modifiers
    /* test.woundModifier = parseInt(-(actor.data.data.wounds.value))

    if (actor.data.data.stymiedModifier === parseInt(-2)) {
       test.stymiedModifier = -2
    } else if (actor.data.data.stymiedModifier === -4) {
       test.stymiedModifier = -4
    } */

    // Set Chat Title
    test.chatTitle = test.skillName + " Test";

    renderSkillChat(test, diceroll);
}

export function weaponAttack(test) {
    /*   {
       testType = null,
       skillName = null,
       skillBaseAttribute = null,
       skillAdds = null,
       skillValue = null,
       unskilledUse = null,
       strengthValue = null,
       charismaValue = null,
       dexterityValue = null,
       mindValue = null,
       spiritValue = null,
       weaponName = null,
       weaponDamageType = null,
       weaponDamage = null,
       actor = null,
       item = null,
       actorPic = null } = {}) {
       let test = {
          actor: actor.data._id,
          item: item.data,
          actorPic: actorPic,
          actorType: "stormknight",
          skillName: skillName,
          skillBaseAttribute: skillBaseAttribute,
          skillAdds: skillAdds,
          skillValue: skillValue,
          unskilledUse: unskilledUse,
          strengthValue: strengthValue,
          charismaValue: charismaValue,
          dexterityValue: dexterityValue,
          mindValue: mindValue,
          spiritValue: spiritValue,
          testType: "attack",
          weaponName: weaponName,
          weaponDamageType: weaponDamageType,
          weaponDamage: weaponDamage,
          possibilityTotal: 0,
          upTotal: 0,
          heroTotal: 0,
          dramaTotal: 0,
          cardsPlayed: 0,
          sizeModifier: 0,
          vulnerableModifier: 0
       }; */

    // Calculate damage
    if (test.weaponDamageType === "flat") {
        test.damage = test.weaponDamage
    } else if (test.weaponDamageType === "strengthPlus") {
        test.damage = parseInt(test.strengthValue) + parseInt(test.weaponDamage) + parseInt(test.vitalAreaDamageModifier)
    } else if (test.weaponDamageType === "charismaPlus") {
        test.damage = parseInt(test.charismaValue) + parseInt(test.weaponDamage) + parseInt(test.vitalAreaDamageModifier)
    } else if (test.weaponDamageType === "dexterityPlus") {
        test.damage = parseInt(test.dexterityValue) + parseInt(test.weaponDamage) + parseInt(test.vitalAreaDamageModifier)
    } else if (test.weaponDamageType === "mindPlus") {
        test.damage = parseInt(test.mindValue) + parseInt(test.weaponDamage) + parseInt(test.vitalAreaDamageModifier)
    } else if (test.weaponDamageType === "spiritPlus") {
        test.damage = parseInt(test.spiritValue) + parseInt(test.weaponDamage) + parseInt(test.vitalAreaDamageModifier)
    } else {
        test.damage = parseInt(test.weaponDamage) + parseInt(test.vitalAreaDamageModifier)
    }

    // Roll as skilled or unskilled
    let diceroll = ""
    if (test.previousBonus === true) {
        //Don't roll anything
        if (test.skillAdds > 0) {
            test.unskilledLabel = "display:none"
        }
    } else if (test.testType === "skill") {
        if (test.skillAdds > 0) {
            if (test.disfavored === false) {
                diceroll = new Roll('1d20x10x20').evaluate({ async: false });
            } else {
                diceroll = new Roll('1d20').evaluate({async:false});
            }
            test.unskilledLabel = "display:none"
        } else if (test.skillAdds === 0) {
            if (test.disfavored === false) {
                diceroll = new Roll('1d20x10').evaluate({ async: false });
            } else {
                diceroll = new Roll('1d20').evaluate({async:false});
            }
            test.unskilledLabel = "display:block"
        // Should trigger only if this is a threat and test.skilAdds therefore equals null   
        } else {
            if (test.disfavored === false) {
                diceroll = new Roll('1d20x10').evaluate({ async: false });
            } else {
                diceroll = new Roll('1d20').evaluate({async:false});
            }
            test.unskilledLabel = "display:none"
        }
    } else {
        if (test.disfavored === false) {
            diceroll = new Roll('1d20x10x20').evaluate({ async: false });
        } else {
            diceroll = new Roll('1d20').evaluate({async:false});
        }
        test.unskilledLabel = "display:none"
    };

    //diceroll.toMessage();
    if (test.previousBonus === true) {
        test.diceroll = null;
    } else {
        test.diceroll = diceroll;
        test.rollTotal = diceroll.total;
    }

    // Set Chat Title
    test.chatTitle = test.weaponName;

    renderSkillChat(test, diceroll);

}

export function interactionAttack(test) {

    // Roll as skilled or unskilled
    let diceroll = ""
    if (test.previousBonus === true) {
        //Don't roll anything
        if (test.skillAdds > 0) {
            test.unskilledLabel = "display:none"
        }
    } else if (test.testType === "interactionAttack") {
        if (test.skillAdds > 0) {
            if (test.disfavored === false) {
                diceroll = new Roll('1d20x10x20').evaluate({ async: false });
            } else {
                diceroll = new Roll('1d20').evaluate({async:false});
            }
            test.unskilledLabel = "display:none"
        } else if (test.skillAdds === 0) {
            if (test.disfavored === false) {
                diceroll = new Roll('1d20x10').evaluate({ async: false });
            } else {
                diceroll = new Roll('1d20').evaluate({async:false});
            }
            test.unskilledLabel = "display:block"
        // Should trigger only if this is a threat and test.skillAdds therefore equals null   
        } else {
            if (test.disfavored === false) {
                diceroll = new Roll('1d20x10').evaluate({ async: false });
            } else {
                diceroll = new Roll('1d20').evaluate({async:false});
            }
            test.unskilledLabel = "display:none"
        }
    } else {
        if (test.disfavored === false) {
            diceroll = new Roll('1d20x10x20').evaluate({ async: false });
        } else {
            diceroll = new Roll('1d20').evaluate({async:false});
        }
        test.unskilledLabel = "display:none"
    };

    //diceroll.toMessage();
    if (test.previousBonus === true) {
        test.diceroll = null;
    } else {
        test.diceroll = diceroll;
        test.rollTotal = diceroll.total;
    }

    // Set Chat Title
    test.chatTitle = test.skillName + " " + game.i18n.localize("torgeternity.powers.attack");

    renderSkillChat(test, diceroll);

}


export function powerRoll(test) {

    var diceroll = "";
    
    // Cannot Attempt Power Tests Unskilled
    if (test.skillValue === "-") {
        let cantRollData = {
            user: game.user.data._id,
            speaker: ChatMessage.getSpeaker(),
            owner: test.actor,
        };

        let templateData = {
            message: test.powerName + game.i18n.localize('torgeternity.chatText.check.cantUseSkillRecquired'),
            actorPic: test.actor.data.img
        };

        const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-error-card.hbs", templateData);

        templatePromise.then(content => {
            cantRollData.content = content;
            ChatMessage.create(cantRollData);
        })

        return
    };



    // Roll dice as skilled (assumes character would not have power unless skilled)
    if (test.disfavored === false) {
        diceroll = new Roll('1d20x10x20').evaluate({ async: false });
    } else {
        diceroll = new Roll('1d20').evaluate({async:false});
    }
    test.unskilledLabel = "display:none"
        //diceroll.toMessage();
    test.diceroll = diceroll;

    // Get Bonus and Roll Result
    test.rollTotal = diceroll.total;

    /* Get modifiers; only modify based on target if this is an attack
    test.woundModifier = parseInt(-(test.actor.data.data.wounds.value))

    if (actor.data.data.stymiedModifier === parseInt(-2)) {
       test.stymiedModifier = -2
    } else if (actor.data.data.stymiedModifier === -4) {
       test.stymiedModifier = -4
    } */

    if (test.powerAttack === "true") {
        if (Array.from(game.user.targets).length > 0) {
            let target = Array.from(game.user.targets)[0];
            if (target.actor.data.data.details.sizeBonus) {
                test.sizeModifier = target.actor.data.data.details.sizeBonus;
            };
            test.vulnerableModifier = target.actor.data.data.vulnerableModifier
        }
    }

    // Set Chat Title
    test.chatTitle = test.powerName;

    renderSkillChat(test, diceroll);

}


export function renderSkillChat(test) {
    // ----------Set title for Chat Message in test.chatTitle ------------//
    
    // --------Establish DN for this test based on DNDescriptor-----------//
    //
    // CODE GOES HERE
    //
    
    // -----------------------Determine Bonus---------------------------- //

    // Do we need to generate a rollTotal?
    if (test.rollTotal === 0 & test.previousBonus === false) {
        // Generate dice roll
        var dice 
        if (test.actor.data.type === "stormknight") {
            if (test.disfavored === true) {
                dice = "1d20"
                if (test.actor.data.data.skills[test.skillName].adds === 0) {
                    test.unskilledLabel = "display:block";
                } else {
                    test.unskilledLabel = "display:none";
                }
            } else {
                if (test.actor.data.data.skills[test.skillName].adds > 0) {
                    dice = "1d20x10x20"
                    test.unskilledLabel = "display:none"
                } else {
                    dice = "1d20x10"
                    test.unskilledLabel = "display:block"
                }
            }
        } else {
            test.unskilledLabel = "display:none"
            if (test.disfavored === true) {
                dice = "1d20"
            } else {
                dice = "1d20x10x20"
            }
        }
        test.diceroll = new Roll(dice).evaluate({ async: false });
        test.rollTotal = diceroll.total;
    } else {
        test.diceroll = null
    }

    // Get current bonus and make + label visible if number is positive
    test.combinedRollTotal = parseInt(test.rollTotal) + parseInt(test.upTotal) + parseInt(test.possibilityTotal) + parseInt(test.heroTotal) + parseInt(test.dramaTotal)
    if (test.previousBonus != true) {
        test.bonus = torgBonus(test.combinedRollTotal);
    } else {
        test.combinedRollTotal = "-"
    }

    // Raise bonus to 1 if actively defending
    if (test.testType === "activeDefense") {
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

    if (test.sizeModifier != 0) {
        test.displayModifiers = true;
        test.modifiers += parseInt(test.sizeModifier);
        if (test.sizeModifier > 0) {
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.targetSize') + " +" + test.sizeModifier + "\n"
        } else {
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.targetSize') + " " + test.sizeModifier + "\n"
        }
    }

    if (test.vulnerableModifier > 0) {
        test.displayModifiers = true;
        test.modifiers += parseInt(test.vulnerableModifier);
        if (test.vulnerableModifier === 2) {
            test.modifierText += game.i18n.localize('torgeternity.chatText.check.modifier.targetVulnerable') + "\n"
        } else if (test.vulnerableModifier === 4) {
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

    if (test.displayModifiers === true) {
        test.modifierLabel = "display:"
    } else {
        test.modifierLabel = "display:none"
    };

    // Add +3 cards to bonus
    const tempBonus = parseInt(test.bonus)
    test.bonus = parseInt(tempBonus) + (parseInt(test.cardsPlayed) * 3)

    test.rollResult = parseInt(parseInt(test.skillValue) + parseInt(test.bonus) + parseInt(test.modifiers));

    // Determine Outcome
    test.outcome = null
    test.actionTotalContent = game.i18n.localize('torgeternity.chatText.check.result.actionTotal');
    const testDifference = test.rollResult - test.DN
    if (test.isDN === true) {
        test.actionTotalContent = "DN " + test.DN + " - " + test.rollResult + " " + game.i18n.localize('torgeternity.chatText.check.result.actionTotal');
        if (testDifference < 0) {
            test.outcome = game.i18n.localize('torgeternity.chatText.check.result.failure');
        } else if (testDifference > 9) {
            test.outcome = game.i18n.localize('torgeternity.chatText.check.result.outstandingSuccess');
        } else if (testDifference > 4) {
            test.outcome = game.i18n.localize('torgeternity.chatText.check.result.goodSuccess');
        } else {
            test.outcome = game.i18n.localize('torgeternity.chatText.check.result.standartSuccess');
        }
    }

    // Turn on + sign for modifiers?
    if (test.modifiers >= 1) {
        test.modifierPlusLabel = "display:"
    } else {
        test.modifierPlusLabel = "display:none"
    }

    // Choose Text to Display as Result
    if (test.rollTotal === 1) {
        test.resultText = game.i18n.localize('torgeternity.chatText.check.result.mishape');
        test.actionTotalLabel = "display:none";
    } else if (test.testType === "activeDefense") {
        if (test.bonus < 2) {
            test.resultText = "+ 1"
        } else {
            test.resultText = "+ " + test.bonus;
        }
        test.actionTotalLabel = "display:none"
    } else if (test.isDN === true) {
        test.resultText = test.outcome
    } else {
        test.resultText = test.rollResult;
        test.actionTotalLabel = "display:block"
    }


    // If an attack, calculate and display damage
    if (test.testType === "attack") {
        test.damageLabel = "display: block";
        //Check for basic vs. enhanced roll using isDN
        if (test.isDN === true) {
            test.damageSubLabel = "display:block";
            // Adjust toughness based on AP effects and cover modifier
            if (test.weaponAP > 0) {
                if (test.weaponAP <= test.targetArmor) {
                    test.targetAdjustedToughness = parseInt(test.targetToughness) - parseInt(test.weaponAP) + parseInt(test.coverModifier);
                } else {
                    test.targetAdjustedToughness = parseInt(test.targetToughness) - parseInt(test.targetArmor) + parseInt(test.coverModifier);
                }
            } else {
                test.targetAdjustedToughness = parseInt(test.targetToughness) + parseInt(test.coverModifier);
            }
            // Generate damage description and damage sublabel 
            if (test.resultText === game.i18n.localize('torgeternity.chatText.check.result.failure') || test.resultText === game.i18n.localize('torgeternity.chatText.check.result.mishape')) {
                test.damageDescription = game.i18n.localize('torgeternity.chatText.check.result.noDamage');;
                test.damageSubDescription = game.i18n.localize('torgeternity.chatText.check.result.attackMissed');;
            } else {
                test.damageDescription = torgDamage(test.damage, test.targetAdjustedToughness).label
                test.damageSubDescription = game.i18n.localize('torgeternity.chatText.check.result.damage') + " " + test.damage + " vs. " + test.targetAdjustedToughness + game.i18n.localize('torgeternity.chatText.check.result.toughness');
                //if auto apply damages == true in settings
                if (game.settings.get("torgeternity", "autoDamages")) {
                    applyDamages(torgDamage(test.damage, test.targetAdjustedToughness))
                }

            }
        } else {
            // Basic roll
            test.damageSubLabel = "display:none";
            test.damageDescription = test.damage + " " + game.i18n.localize('torgeternity.chatText.check.result.damage');
        }
    } else {
        test.damageLabel = "display:none"
        test.damageSubLabel = "display:none"
    }


    /* Old if (test.testType === "attack") {
       test.damageLabel = "display:"
    } else {
       test.damageLabel = "display:none"
    }; */

    // Determine whether to display damage for power roll
    if (test.testType === "power") {
        if (test.powerAttack === "true") {
            test.damageLabel = "display:"
            test.damageSubLabel = "display:none";
            test.damageDescription = test.damage + " Damage";
        } else {
            test.damageLabel = "display:none";
            test.damageSubLabel = "display:none"
        }
    };

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
        if (test.powerAttack === "true") {
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

    if (test.upTotal > 0)(
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


    let chatData = {
        user: game.user.data._id,
        speaker: ChatMessage.getSpeaker(),
        owner: test.actor,
    };

    const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-card.hbs", test)

    const messageData = {...chatData, flags: { torgeternity: { test } } }

    templatePromise.then(content => {
        if (test.diceroll !== null) {
            messageData.flavor = content;
            test.diceroll.toMessage(messageData);
        } else {
            messageData.content = content;
            ChatMessage.create(messageData);
        };
    });


}

export function activeDefenseRoll({
    testType = null,
    skillName = null,
    skillBaseAttribute = null,
    skillAdds = null,
    skillValue = null,
    unskilledUse = null,
    woundModifier = null,
    stymiedModifier = null,
    actor = null
} = {}) {
    let test = {
        actor: actor.data._id,
        actorPic: actor.data.img,
        actorType: "stormknight",
        skillName: "Active Defense",
        skillBaseAttribute: 0,
        skillAdds: null,
        skillValue: null,
        unskilledUse: null,
        woundModifier: woundModifier,
        stymiedModifier: stymiedModifier,
        testType: "activeDefense",
        possibilityTotal: 0,
        upTotal: 0,
        heroTotal: 0,
        dramaTotal: 0,
        cardsPlayed: 0,
        sizeModifier: 0,
        vulnerableModifier: 0
    };

    // What kind of actor is this?

    if (actor.data.type === "threat") {
        test.actorType = "threat"
    };

    // Roll as skilled
    let diceroll = new Roll('1d20x10x20').roll({ async: false });
    test.unskilledLabel = "display:none"
        //diceroll.toMessage();
    test.diceroll = diceroll;

    // Get Bonus and Roll Result
    test.rollTotal = diceroll.total;

    // Get modifiers
    test.woundModifier = parseInt(-(actor.data.data.wounds.value))

    if (actor.data.data.stymiedModifier === parseInt(-2)) {
        test.stymiedModifier = -2
    } else if (actor.data.data.stymiedModifier === parseInt(-4)) {
        test.stymiedModifier = -4
    }

    // Set Chat Title
    test.chatTitle = game.i18n.localize('torgeternity.sheetLabels.activeDefense');

    renderSkillChat(test, diceroll);


};

export function activeDefenseRollOld({
    actor = null
}) {
    let dicerollint = new Roll('1d20x10x20').roll({ async: false });
    //dicerollint.toMessage();
    let diceroll = dicerollint.total;
    let bonus, messageContent;


    if (diceroll <= 14) {
        messageContent = 'Bonus +1';
        bonus = 1;
    } else if (diceroll == 15) {
        messageContent = 'Bonus +2';
        bonus = 2;
    } else if (diceroll == 16) {
        messageContent = 'Bonus: +3';
        bonus = 3;
    } else if (diceroll == 17) {
        messageContent = 'Bonus: +4';
        bonus = 4;
    } else if (diceroll == 18) {
        messageContent = 'Bonus: +5';
        bonus = 5;
    } else if (diceroll == 19) {
        messageContent = 'Bonus: +6';
        bonus = 6;
    } else if (diceroll == 20) {
        messageContent = 'Bonus: +7';
        bonus = 7;
    } else if (diceroll >= 21) {
        bonus = 7 + Math.ceil((diceroll - 20) / 5)
        messageContent = `Bonus:` + bonus;
    }


    let chatData = {
        user: game.user.data._id,
        speaker: ChatMessage.getSpeaker(),
        owner: actor
    };

    let cardData = {
        bonus: messageContent,
        actorPic: actor.data.img
    };

    const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/activeDefense-card.hbs", cardData);

    templatePromise.then(content => {
        chatData.content = content;
        dicerollint.toMessage(chatData);
        ChatMessage.create(chatData);
    });

};

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
// Old BD function
/*
export function torgBD() {
   let rollResult, dieValue, finalValue, totalDice, lastDie, lastDieImage, explosions, hideBonusFlag;
   rollResult = new Roll('1d6').roll().total;
   if (rollResult == 6) {
      dieValue = 5;
   }
   else if (rollResult <= 5) {
      dieValue = rollResult
   }
   finalValue = dieValue
   lastDie = dieValue
   totalDice = 1
   while (rollResult == 6) {
      totalDice += 1
      rollResult = new Roll('1d6').roll().total;
      dieValue = rollResult
      if (rollResult == 6) {
         dieValue = 5;
      }
      lastDie = rollResult
      finalValue += parseInt(dieValue)
   }

   // Set number of explosions and flag for displaying infinity symbol
   hideBonusFlag = ""
   explosions = parseInt(totalDice) - 1
   if (explosions == 0) {
      hideBonusFlag = "display:none";
   }

   // Prepare image for last die
   if (lastDie == 1) {
      lastDieImage = "/systems/torgeternity/images/bonus-1.webp";
   }
   else if (lastDie == 2) {
      lastDieImage = "/systems/torgeternity/images/bonus-2.webp";
   }
   else if (lastDie == 3) {
      lastDieImage = "/systems/torgeternity/images/bonus-3.webp";
   }
   else if (lastDie == 4) {
      lastDieImage = "/systems/torgeternity/images/bonus-4.webp";
   }
   else if (lastDie == 5) {
      lastDieImage = "/systems/torgeternity/images/bonus-5.webp";
   }

   // Put together Chat Data
   let chatData = {
      user: game.user.data._id,
      speaker: ChatMessage.getSpeaker(),
   };

   // Assemble information needed by attack card
   let cardData = {
      totalDice: totalDice,
      explosions: explosions,
      hideBonusFlag: hideBonusFlag,
      lastDie: lastDie,
      lastDieImage: lastDieImage,
      finalValue: finalValue
   }

   // Send the chat
   const templatePromise = renderTemplate('/systems/torgeternity/templates/partials/bonus-card.hbs', cardData);

   templatePromise.then(content => {
      chatData.content = content;
      ChatMessage.create(chatData);
   });

   return finalValue

} */
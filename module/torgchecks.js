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
   var test = {
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
      var cantRollData = {
         user: game.user.data._id,
         speaker: ChatMessage.getSpeaker(),
         owner: test.actor,
      };

      var templateData = {
         message: test.skillName + " cannot be used unless it is learned (at least 1 skill add).",
         actorPic: test.actor.data.img
      };

      const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-error-card.hbs", templateData);

      templatePromise.then(content => {
         cantRollData.content = content;
         ChatMessage.create(cantRollData);
      })

      return
   };

   // Roll as skilled or unskilled
   var diceroll
   if (test.previousBonus === true) {
      //Don't roll anything
      if (test.skillAdds > 0) {
         test.unskilledLabel = "display:none"
      }
   } else if (test.testType === "skill") {
      if (test.skillAdds > 0) {
         diceroll = new Roll('1d20x10x20').evaluate({ async: false })
            ;
         test.unskilledLabel = "display:none"
      } else if (test.skillAdds === 0) {
         diceroll = new Roll('1d20x10').evaluate({ async: false })
            ;
         test.unskilledLabel = "display:block"
         // Should trigger only if this is a threat and test.skilAdds therefore equals null   
      } else {
         diceroll = new Roll('1d20x10x20').evaluate({ async: false })
            ;
         test.unskilledLabel = "display:none"
      }
   } else {
      diceroll = new Roll('1d20x10x20').evaluate({ async: false })
         ;
      test.unskilledLabel = "display:none"
   };

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
};

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
   var test = {
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
      test.damage = parseInt(test.dexterityValue) + parseInt(test.weaponDamage)+ parseInt(test.vitalAreaDamageModifier)
   } else if (test.weaponDamageType === "mindPlus") {
      test.damage = parseInt(test.mindValue) + parseInt(test.weaponDamage)+ parseInt(test.vitalAreaDamageModifier)
   } else if (test.weaponDamageType === "spiritPlus") {
      test.damage = parseInt(test.spiritValue) + parseInt(test.weaponDamage)+ parseInt(test.vitalAreaDamageModifier)
   } else {
      test.damage = parseInt(test.weaponDamage) + parseInt(test.vitalAreaDamageModifier)
   }

   // Roll as skilled or unskilled
   var diceroll = ""
   if (test.previousBonus === true) {
      //Don't roll anything
      if (test.skillAdds > 0) {
         test.unskilledLabel = "display:none"
      }
   } else if (test.testType === "skill") {
      if (test.skillAdds > 0) {
         diceroll = new Roll('1d20x10x20').evaluate({ async: false })
            ;
         test.unskilledLabel = "display:none"
      } else if (test.skillAdds === 0) {
         diceroll = new Roll('1d20x10').evaluate({ async: false })
            ;
         test.unskilledLabel = "display:block"
         // Should trigger only if this is a threat and test.skilAdds therefore equals null   
      } else {
         diceroll = new Roll('1d20x10x20').evaluate({ async: false });
         test.unskilledLabel = "display:none"
      }
   } else {
      diceroll = new Roll('1d20x10x20').evaluate({ async: false });
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


export function powerRoll(test) {

   // Cannot Attempt Power Tests Unskilled
   if (test.skillValue === "-") {
      var cantRollData = {
         user: game.user.data._id,
         speaker: ChatMessage.getSpeaker(),
         owner: test.actor,
      };

      var templateData = {
         message: test.powerName + " cannot be used without at least 1 add in the required skill.",
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
   var diceroll = new Roll('1d20x10x20').evaluate({async: false});
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
         var target = Array.from(game.user.targets)[0];
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


export function renderSkillChat(test, diceroll) {
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
      test.modifierText = "Wounds " + test.woundModifier + "\n";
      test.modifiers = parseInt(test.woundModifier)
   };

   if (test.stymiedModifier < 0) {
      test.displayModifiers = true;
      if (test.stymiedModifier == -2) {
         test.modifierText += "Stymied -2 \n";
         test.modifiers += -2;
      } else if (test.stymiedModifier == -4) {
         test.modifierText += "Very Stymied -4 \n";
         test.modifiers += -4;
      }
   };

   if (test.darknessModifier < 0) {
      test.displayModifiers = true;
      test.modifierText += "Darkness " + test.darknessModifier + "\n";
      test.modifiers += parseInt(test.darknessModifier);
   }

   if (test.movementModifier < 0) {
      test.displayModifiers = true;
      test.modifierText += "Running -2 \n";
      test.modifiers += -2;
   }

   if (test.multiModifier < 0) {
      test.displayModifiers = true;
      test.modifierText += "Multi-Action " + test.multiModifier + "\n";
      test.modifiers += parseInt(test.multiModifier);
   }

   if (test.targetsModifier < 0) {
      test.displayModifiers = true;
      test.modifierText += "Multi-Target " + test.targetsModifier + "\n";
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
         test.modifierText += "Target Size + " + test.sizeModifier + "\n"
      } else {
         test.modifierText += "Target Size " + test.sizeModifier + "\n"
      }
   }

   if (test.vulnerableModifier > 0) {
      test.displayModifiers = true;
      test.modifiers += parseInt(test.vulnerableModifier);
      if (test.vulnerableModifier === 2) {
         test.modifierText += "Target Vulnerable +2 \n"
      } else if (test.vulnerableModifier === 4) {
         test.modifierText += "Target Very Vulnerable +4 \n"
      }
   }

   if (test.calledShotModifier < 0) {
      test.modifiers += parseInt(test.calledShotModifier);
      test.modifierText += "Called Shot " + test.calledShotModifier + "\n"
   }

   if (test.burstModifier > 0) {
      test.modifiers += parseInt(test.burstModifier);
      if (test.burstModifier === 2) {
         test.modifierText += "Short Burst +2 \n"
      } else if (test.burstModifier === 4) {
         test.modifierText += "Long Burst +4 \n"
      } else if (test.burstModifier === 6) {
         test.modifierText += "Heavy Burst +6 \n"
      }
   }

   if (test.allOutModifier > 0) {
      test.modifiers += 4;
      test.modifierText += "All-Out Attack +4 \n"
   }

   if (test.aimedModifier > 0) {
      test.modifiers += 4;
      test.modifierText += "Aimed Shot +4"
   }

   if (test.concealmentModifier < 0) {
      test.modifiers += parseInt(test.concealmentModifier);
      test.modifierText += "Target Concealment " + test.concealmentModifier + "\n"
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
   test.actionTotalContent = "Action Total"
   const testDifference = test.rollResult - test.DN
   if (test.isDN === true) {
      test.actionTotalContent = "DN " + test.DN + " - " + test.rollResult + " Action Total"
      if (testDifference < 0) {
         test.outcome = "Failure"
      } else if (testDifference > 9 ) {
         test.outcome = "Outstanding Success"
      } else if (testDifference > 4) {
         test.outcome = "Good Success"
      } else {
         test.outcome = "Standard Success"
      }
   }

   // Turn on + sign for modifiers?
   if (test.modifiers >=1) {
      test.modifierPlusLabel = "display:"
   } else {
      test.modifierPlusLabel = "display:none"
   }

   // Choose Text to Display as Result
   if (test.rollTotal === 1) {
      test.resultText = "Mishap";
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
         if (test.resultText === "Failure" || test.resultText === "Mishap") {
            test.damageDescription = "(No Damage)";
            test.damageSubDescription = "Attack Missed";
         } else {
            test.damageDescription = torgDamage(test.damage,test.targetAdjustedToughness)
            test.damageSubDescription = "Damage " + test.damage + " vs. " + test.targetAdjustedToughness + " Toughness"
         }
      } else {
         // Basic roll
         test.damageSubLabel = "display:none";
         test.damageDescription = test.damage + " Damage";
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
   if (test.testType === "skill") {
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

  
   var chatData = {
      user: game.user.data._id,
      speaker: ChatMessage.getSpeaker(),
      owner: test.actor,
   };

   const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-card.hbs", test)

   const messageData = {...chatData, flags: {torgeternity: {test}}}

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
   actor = null } = {}) {
   var test = {
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
   var diceroll = new Roll('1d20x10x20').roll();
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
   test.chatTitle = "Active Defense";

   renderSkillChat(test, diceroll);


};

export function activeDefenseRollOld({
   actor = null }) {
   let dicerollint = new Roll('1d20x10x20').roll();
   //dicerollint.toMessage();
   let diceroll = dicerollint.total;



   if (diceroll <= 14) {
      var messageContent = 'Bonus +1'; var bonus = 1;
   }
   else if (diceroll == 15) {
      var messageContent = 'Bonus +2'; var bonus = 2;
   }
   else if (diceroll == 16) {
      var messageContent = 'Bonus: +3'; var bonus = 3;
   }
   else if (diceroll == 17) {
      var messageContent = 'Bonus: +4'; var bonus = 4;
   }
   else if (diceroll == 18) {
      var messageContent = 'Bonus: +5'; var bonus = 5;
   }
   else if (diceroll == 19) {
      var messageContent = 'Bonus: +6'; var bonus = 6;
   }
   else if (diceroll == 20) {
      var messageContent = 'Bonus: +7'; var bonus = 7;
   }
   else if (diceroll >= 21) {
      var bonus = 7 + Math.ceil((diceroll - 20) / 5)
      var messageContent = `Bonus:` + bonus;
   }


   var chatData = {
      user: game.user.data._id,
      speaker: ChatMessage.getSpeaker(),
      owner: actor
   };

   var cardData = {
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
   if (rollTotal == 1) {
      var bonus = -10
   }
   else if (rollTotal == 2) {
      var bonus = -8
   }
   else if (rollTotal <= 4) {
      var bonus = -6
   }
   else if (rollTotal <= 6) {
      var bonus = -4
   }
   else if (rollTotal <= 8) {
      var bonus = -2
   }
   else if (rollTotal <= 10) {
      var bonus = -1
   }
   else if (rollTotal <= 12) {
      var bonus = 0
   }
   else if (rollTotal <= 14) {
      var bonus = 1
   }
   else if (rollTotal == 15) {
      var bonus = 2
   }
   else if (rollTotal == 16) {
      var bonus = 3
   }
   else if (rollTotal == 17) {
      var bonus = 4
   }
   else if (rollTotal == 18) {
      var bonus = 5
   }
   else if (rollTotal == 19) {
      var bonus = 6
   }
   else if (rollTotal == 20) {
      var bonus = 7
   }
   else if (rollTotal >= 21) {
      var bonus = 7 + Math.ceil((rollTotal - 20) / 5)
   }
   return bonus

}

export function torgBD() {
   var diceroll;
   diceroll = new Roll('1d6x6max5').roll();

   return diceroll
}

export function torgDamage(damage,toughness) {
   const damageDiff = parseInt(damage) - parseInt(toughness)
   var torgDamage;
   if (damageDiff < -5) {
      torgDamage = "(No Damage)"
   } else if (damageDiff < 0) {
      torgDamage = "1 Shock"
   } else if (damageDiff < 5) {
      torgDamage = "2 Shock"
   } else if (damageDiff < 10) {
      torgDamage = "1 Wound, 2 Shock"
   } else {
      const wounds = Math.floor(damageDiff/5);
      const shock = (Math.floor(damageDiff/5) *2) + 2;
      torgDamage = wounds + " Wounds, " + shock + " Shock";
   }
   return torgDamage
}
// Old BD function
/*
export function torgBD() {
   var rollResult, dieValue, finalValue, totalDice, lastDie, lastDieImage, explosions, hideBonusFlag;
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
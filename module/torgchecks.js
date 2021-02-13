export function SkillCheck({
<<<<<<< HEAD
    skillName = null,
    skillValue = null,
    actor = null } = {}) {
    let dicerollint = new Roll('1d20x10x20').roll();
    dicerollint.toMessage();
    let diceroll = dicerollint.total;
=======
   testType = null,
   skillName = null,
   skillBaseAttribute = null,
   skillAdds = null,
   skillValue= null,
   unskilledUse = null,
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
      testType: testType,
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

   // Cannot Attempt Certain Tests Unskilled
   if (test.skillValue === "-") {
      var cantRollData = {
         user: game.user._id,
         speaker: ChatMessage.getSpeaker(),
         owner: actor,
      };

      var templateData = {
         message: skillName + " cannot be used unless it is learned (at least 1 skill add).",
         actorPic: actor.data.img
      };

      const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-error-card.hbs",templateData);

      templatePromise.then(content => {
         cantRollData.content = content;
         ChatMessage.create(cantRollData);
      })

      return
   };
   
   // Roll as skilled or unskilled
   var diceroll
   if (test.testType === "skill") {
      if (test.skillAdds > 0) {
         diceroll = new Roll('1d20x10x20').roll();
         test.unskilledLabel = "display:none"
      } else if (test.skillAdds === 0) {
         diceroll = new Roll('1d20x10').roll();
         test.unskilledLabel = "display:block"
      // Should trigger only if this is a threat and test.skilAdds therefore equals null   
      } else {
         diceroll = new Roll('1d20x10x20').roll();
         test.unskilledLabel = "display:none"
      }
   } else {
      diceroll = new Roll('1d20x10x20').roll();
      test.unskilledLabel = "display:none"
   };
   diceroll.toMessage();

   // Get Bonus and Roll Result
   test.rollTotal = diceroll.total;

   // Get modifiers
   test.woundModifier = parseInt(-(actor.data.data.wounds.value))

   if (actor.data.data.stymiedModifier === parseInt(-2)) {
      test.stymiedModifier = -2
   } else if (actor.data.data.stymiedModifier === -4) {
      test.stymiedModifier = -4
   }

   // Set Chat Title
   test.chatTitle = test.skillName + " Test";

   renderSkillChat(test);
};

export function weaponAttack ({
   testType = null,
   skillName = null,
   skillBaseAttribute = null,
   skillAdds = null,
   skillValue= null,
   unskilledUse = null,
   strengthValue = null,
   weaponName = null,
   weaponDamageType = null,
   weaponDamage = null,
   actor = null,
   item = null,
   actorPic = null } = {}) {
   var test = {
      actor: actor.data._id,
      item: item.data._id,
      actorPic: actorPic,
      actorType: "stormknight",
      skillName: skillName,
      skillBaseAttribute: skillBaseAttribute,
      skillAdds: skillAdds,
      skillValue: skillValue,
      unskilledUse: unskilledUse,
      strengthValue: strengthValue,
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
   };

   // What kind of actor is this?
   if (actor.data.type === "threat") {
      test.actorType = "threat"
   };
   
   // Calculate damage
   if (test.weaponDamageType === "flat") {
      test.damage = test.weaponDamage
   } else if (test.weaponDamageType === "strengthPlus") {
      test.damage = parseInt(test.strengthValue) + parseInt(test.weaponDamage)
   } else {
      test.damage = test.weaponDamage
   }
   
   // Roll as skilled or unskilled
   var diceroll
   if (test.skillAdds > 0) {
      diceroll = new Roll('1d20x10x20').roll();
      test.unskilledLabel = "display:none"
   } else if (test.skillAdds === 0) {
      diceroll = new Roll('1d20x10').roll();
      test.unskilledLabel = "display:block"
   // Should trigger only if this is a threat and test.skilAdds therefore equals null   
   } else {
      diceroll = new Roll('1d20x10x20').roll();
      test.unskilledLabel = "display:none"
   }
   diceroll.toMessage();

   // Get Bonus and Roll Result
   test.rollTotal = diceroll.total;

   // Get modifiers
   test.woundModifier = parseInt(-(actor.data.data.wounds.value))
   
   if (actor.data.data.stymiedModifier === parseInt(-2)) {
      test.stymiedModifier = -2
   } else if (actor.data.data.stymiedModifier === -4) {
      test.stymiedModifier = -4
   }

   if (Array.from(game.user.targets).length > 0) {
      var target = Array.from(game.user.targets)[0];
      if (target.actor.data.data.details.sizeBonus) {
         test.sizeModifier = target.actor.data.data.details.sizeBonus;
      };
      test.vulnerableModifier = target.actor.data.data.vulnerableModifier
   }


   // Set Chat Title
   test.chatTitle = test.weaponName;

   renderSkillChat(test);

}


export function powerRoll({
   testType = null,
   skillName = null,
   skillBaseAttribute = null,
   skillAdds = null,
   skillValue= null,
   strengthValue = null,
   powerName = null,
   powerAttack = null,
   powerDamage = null,
   actor = null,
   item = null,
   actorPic = null } = {}) {
   var test = {
      actor: actor.data._id,
      item: item.data._id,
      actorPic: actorPic,
      actorType: "stormknight",
      skillName: skillName,
      skillBaseAttribute: skillBaseAttribute,
      skillAdds: skillAdds,
      skillValue: skillValue,
      strengthValue: strengthValue,
      testType: "power",
      powerName: powerName,
      powerAttack: powerAttack,
      damage: powerDamage,
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

   // Roll dice as skilled (assumes character would not have power unless skilled)
   var diceroll = new Roll('1d20x10x20').roll();
   test.unskilledLabel = "display:none"
   diceroll.toMessage();

   // Get Bonus and Roll Result
   test.rollTotal = diceroll.total;

   // Get modifiers; only modify based on target if this is an attack
   test.woundModifier = parseInt(-(actor.data.data.wounds.value))

   if (actor.data.data.stymiedModifier === parseInt(-2)) {
      test.stymiedModifier = -2
   } else if (actor.data.data.stymiedModifier === -4) {
      test.stymiedModifier = -4
   }

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
   
   renderSkillChat(test);
   
   }


export function renderSkillChat(test) {
   // Get current bonus and make + label visible if number is positive
   test.combinedRollTotal = parseInt(test.rollTotal) + parseInt(test.upTotal) + parseInt(test.possibilityTotal) + parseInt(test.heroTotal) + parseInt(test.dramaTotal)
   test.bonus = torgBonus(test.combinedRollTotal);

   if (test.bonus >= 1) {
      test.bonusPlusLabel = "display:inline"
   } else {
      test.bonusPlusLabel = "display:none"
   }
            
   // Set Modifiers and Chat Content Relating to Modifiers
   test.displayModifiers = false;
   test.modifiers = 0;
   test.modifierText = "";

   if (test.woundModifier < 0) {
      test.displayModifiers = true;
      test.modifierText = "Wounds " + test.woundModifier + " ";
      test.modifiers = test.woundModifier
   };

   if (test.stymiedModifier < 0) {
      test.displayModifiers= true;
      if (test.stymiedModifier === -2) {
         test.modifierText += "Stymied -2 ";
         test.modifiers += -2;
      } else if (test.stymiedModifier === -4) {
         test.modifierText += "Very Stymied -4 ";
         test.modifiers += -4;
      }
   };

   if (test.sizeModifier != 0) {
      test.displayModifiers=true;
      test.modifiers += parseInt(test.sizeModifier);
      if (test.sizeModifier > 0) {
         test.modifierText += "Target Size + " + test.sizeModifier + " "
      } else {
         test.modifierText += "Target Size " + test.sizeModifier + " "
      }
   }

   if (test.vulnerableModifier > 0) {
      test.displayModifiers=true;
      test.modifiers += parseInt(test.vulnerableModifier);
      if(test.vulnerableModifier === 2) {
         test.modifierText += "Target Vulnerable +2 "
      } else if (test.vulnerableModifier === 4) {
         test.modifierText += "Target Very Vulnerable +4"
      }
   }

   if (test.displayModifiers === true) {
      test.modifierLabel = "display:"
   } else {
      test.modifierLabel = "display:none"
   };


   test.rollResult = parseInt(test.skillValue) + parseInt(test.bonus) + parseInt(test.modifiers) + (3*parseInt(test.cardsPlayed));

   // Choose Text to Display as Result
   if (test.rollTotal === 1) {
      test.resultText = "Mishap";
      test.actionTotalLabel = "display:none";
   } else {
      test.resultText = test.rollResult;
      test.actionTotalLabel = "display:block"
   };

   // If an attack, display base damage
   if (test.testType === "attack") {
      test.damageLabel = "display:"
   } else {
      test.damageLabel = "display:none"
   };

   // Determine whether to display damage for power roll
   if (test.testType === "power") {
      if (test.powerAttack === "true") {
         test.damageLabel = "display:"
      } else (
         test.damageLabel = "display:none"
      )
   };

   // Remind Player to Check for Disconnect?
   if (test.rollTotal <= 4) {
      test.disconnectLabel = "display:block"
   } else {
      test.disconnectLabel = "display:none"
   }
   
   // Label as Skill vs Attribute Test and turn on BD option if needed
   if (test.testType === "skill") {
      test.typeLabel = "Skill",
      test.bdStyle = "display:none"
   } else if (test.testType === "attack") {
      test.typeLabel = "Skill"
   } else if (test.testType === "power") {
      test.typeLabel = "Skill";
      if (test.powerAttack === "true") {
         test.bdStyle = "display:"
      } else {
         test.bdStyle = "display:none"
      }
   } else {
      test.typeLabel = "Attribute"
      test.bdStyle = "display:none"
   }

   // Display cards played label?
   if (parseInt(test.cardsPlayed) > 0) {
      test.cardsPlayedLabel = "display:"
   } else {
      test.cardsPlayedLabel = "display:none"
   };

   // Disable unavailable menu options
   if (test.possibilityTotal > 0) {
      test.possibilityStyle = "pointer-events:none;color:gray"
   }

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
>>>>>>> 293856e836bdc2e3efa95053f7b3fb5ce342240a
    
    var messageContent1 = '<p style="text-align:center;font-weight:bold">' + skillName + ' Check </p>' + '<p>' + 'Skill Value: ' + skillValue + '</p><p>' + 'Roll Total:' + diceroll + '</p><p>';
    
    
    if (diceroll == 1) {
       var messageContent = `Failure (Check for Mishap)`; var bonus = -10;}
    else if (diceroll == 2) {
       var messageContent = 'Bonus: -8 (Disconnect if 4 Case)'; var bonus = -8;}
    else if (diceroll <= 4) {
       var messageContent = 'Bonus: -6 (Disconnect if 4 Case)'; var bonus = -6;}
    else if (diceroll <= 6) {
       var messageContent = 'Bonus: -4'; var bonus = -4;}
    else if (diceroll <= 8) {
       var messageContent = 'Bonus: -2'; var bonus = -2;}
    else if (diceroll <= 10) {
       var messageContent = 'Bonus: -1'; var bonus = -1;}
    else if (diceroll <= 12) {
       var messageContent = 'Bonus: +0'; var bonus = 0;}
    else if (diceroll <= 14) {
       var messageContent = 'Bonus +1'; var bonus = 1;}
    else if (diceroll == 15) {
       var messageContent = 'Bonus +2'; var bonus = 2;}
    else if (diceroll ==16) {
       var messageContent = 'Bonus: +3'; var bonus = 3;}
    else if (diceroll == 17) {
       var messageContent = 'Bonus: +4'; var bonus = 4;}
    else if (diceroll == 18) {
       var messageContent = 'Bonus: +5'; var bonus = 5;}
    else if (diceroll == 19) {
       var messageContent = 'Bonus: +6'; var bonus = 6;}
    else if (diceroll == 20) {
       var messageContent = 'Bonus: +7'; var bonus = 7;}
    else if (diceroll >= 21) {
       var bonus = 7 + Math.ceil((diceroll - 20)/5)
       var messageContent = `Bonus:` + bonus; }
    
    var rollResult = parseInt(skillValue) + parseInt(bonus)

    var messageContent2 = '<p>' + 'Result: ' + rollResult
    var finalMessage= messageContent1 + messageContent + messageContent2
    
    var chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      owner:  actor
   };

   var cardData = {
      skillName: skillName,
      skillValue: skillValue,
      bonus: messageContent,
      result: rollResult,
      actorPic: actor.data.img
   };

   const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-card.hbs", cardData);

   templatePromise.then(content => {
      chatData.content = content;      
      ChatMessage.create(chatData);
   });
    
}

export function PossibilityCheck ({
   actor = null}) {
   let applyChanges = false;
   new Dialog({
      title: `Previous Roll Total`,
      content: `
         <form>
            <div class="form-group">
            <label>Previous Roll Total:</label>
            <input type="number" id="previousroll" name="previousroll" size="3" />
            </div>
         </form>
         `,
      buttons: {
         yes: {
            icon: "<i class='fas fa-check'></i>",
            label: `Possibility`,
            callback: () => applyChanges = true
         },
         no: {
            icon: "<i class='fas fa-times'></i>",
            label: `Cancel`
         },
   },
         default: "yes",
   close: html => {
    if (applyChanges) {

      let dicerollint = new Roll('{1d20x10x20,10}kh').roll();
      dicerollint.toMessage();
      let newroll = dicerollint.total; 

     let diceroll = newroll + parseInt(previousroll.value);

     if (diceroll == 1) {
      var messageContent = `Failure (Check for Mishap)`; }
     else if (diceroll == 2) {
      var messageContent = 'Bonus: -8 (Disconnect if 4 Case)'; }
     else if (diceroll <= 4) {
      var messageContent = 'Bonus: -6 (Disconnect if 4 Case)'; }
     else if (diceroll <= 6) {
      var messageContent = 'Bonus: -4'; }
     else if (diceroll <= 8) {
      var messageContent = 'Bonus: -2'; }
     else if (diceroll <= 10) {
      var messageContent = 'Bonus: -1'; }
     else if (diceroll <= 12) {
      var messageContent = 'Bonus: +0'; }
     else if (diceroll <= 14) {
      var messageContent = 'Bonus +1'; }
     else if (diceroll == 15) {
      var messageContent = 'Bonus +2'; }
     else if (diceroll ==16) {
      var messageContent = 'Bonus: +3'; }
     else if (diceroll == 17) {
      var messageContent = 'Bonus: +4'; }
     else if (diceroll == 18) {
      var messageContent = 'Bonus: +5'; }
     else if (diceroll == 19) {
      var messageContent = 'Bonus: +6'; }
     else if (diceroll == 20) {
      var messageContent = 'Bonus: +7'; }
     else if (diceroll >= 21) {
      var bonus = 7 + Math.ceil((diceroll - 20)/5)
      var messageContent = `Bonus: + ` + bonus; }

      var thisSpeaker = ChatMessage.getSpeaker(this.actor);

      // Put together Chat Data
      let chatData = {
         user: game.user._id,
         speaker: ChatMessage.getSpeaker(),
         owner: actor,
      };
      let cardData = {
         newbonus: messageContent,
         previousroll: previousroll.value,
         newtotal: diceroll,
         actorPic: actor.data.img
      }

      const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/possibility-card.hbs", cardData);

      templatePromise.then(content => {
         chatData.content = content;      
         ChatMessage.create(chatData);
      });
      }
   }}).render(true);
}

export function UpRoll ({
   actor = null}) {
   let applyChanges = false;
   new Dialog({
      title: `Previous Roll Total`,
      content: `
         <form>
            <div class="form-group">
            <label>Previous Roll Total:</label>
            <input type="number" id="previousroll" name="previousroll" size="3" />
            </div>
         </form>
         `,
      buttons: {
         yes: {
            icon: "<i class='fas fa-check'></i>",
            label: `Up`,
            callback: () => applyChanges = true
         },
         no: {
            icon: "<i class='fas fa-times'></i>",
            label: `Cancel`
         },
   },
         default: "yes",
   close: html => {
    if (applyChanges) {

      let dicerollint = new Roll('1d20x10x20').roll();
      dicerollint.toMessage();
      let newroll = dicerollint.total; 

     let diceroll = newroll + parseInt(previousroll.value);

     if (diceroll == 1) {
      var messageContent = `Failure (Check for Mishap)`; }
     else if (diceroll == 2) {
      var messageContent = 'Bonus: -8 (Disconnect if 4 Case)'; }
     else if (diceroll <= 4) {
      var messageContent = 'Bonus: -6 (Disconnect if 4 Case)'; }
     else if (diceroll <= 6) {
      var messageContent = 'Bonus: -4'; }
     else if (diceroll <= 8) {
      var messageContent = 'Bonus: -2'; }
     else if (diceroll <= 10) {
      var messageContent = 'Bonus: -1'; }
     else if (diceroll <= 12) {
      var messageContent = 'Bonus: +0'; }
     else if (diceroll <= 14) {
      var messageContent = 'Bonus +1'; }
     else if (diceroll == 15) {
      var messageContent = 'Bonus +2'; }
     else if (diceroll ==16) {
      var messageContent = 'Bonus: +3'; }
     else if (diceroll == 17) {
      var messageContent = 'Bonus: +4'; }
     else if (diceroll == 18) {
      var messageContent = 'Bonus: +5'; }
     else if (diceroll == 19) {
      var messageContent = 'Bonus: +6'; }
     else if (diceroll == 20) {
      var messageContent = 'Bonus: +7'; }
     else if (diceroll >= 21) {
      var bonus = 7 + Math.ceil((diceroll - 20)/5)
      var messageContent = `Bonus: + ` + bonus; }

      var thisSpeaker = ChatMessage.getSpeaker(actor);

      // Put together Chat Data
      let chatData = {
         user: game.user._id,
         speaker: ChatMessage.getSpeaker(),
         owner: actor,
      };
      let cardData = {
         newbonus: messageContent,
         previousroll: previousroll.value,
         newtotal: diceroll,
         actorPic: actor.data.img
      }

      const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/up-card.hbs", cardData);

      templatePromise.then(content => {
         chatData.content = content;      
         ChatMessage.create(chatData);
      });
      }
   }}).render(true);
   }

   export function activeDefenseRoll ({
      actor = null}) {
      let dicerollint = new Roll('1d20x10x20').roll();
      dicerollint.toMessage();
      let diceroll = dicerollint.total;
      
 
     
      if (diceroll <= 14) {
         var messageContent = 'Bonus +1'; var bonus = 1;}
      else if (diceroll == 15) {
         var messageContent = 'Bonus +2'; var bonus = 2;}
      else if (diceroll ==16) {
         var messageContent = 'Bonus: +3'; var bonus = 3;}
      else if (diceroll == 17) {
         var messageContent = 'Bonus: +4'; var bonus = 4;}
      else if (diceroll == 18) {
         var messageContent = 'Bonus: +5'; var bonus = 5;}
      else if (diceroll == 19) {
         var messageContent = 'Bonus: +6'; var bonus = 6;}
      else if (diceroll == 20) {
         var messageContent = 'Bonus: +7'; var bonus = 7;}
      else if (diceroll >= 21) {
         var bonus = 7 + Math.ceil((diceroll - 20)/5)
         var messageContent = `Bonus:` + bonus; }
      
      
      var chatData = {
         user: game.user._id,
         speaker: ChatMessage.getSpeaker(),
         owner:  actor
      };
   
      var cardData = {
         bonus: messageContent,
         actorPic: actor.data.img
      };
   
      const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/activeDefense-card.hbs", cardData);
   
      templatePromise.then(content => {
         chatData.content = content;      
         ChatMessage.create(chatData);
      });
     
}


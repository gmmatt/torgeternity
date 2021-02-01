export function SkillCheck({
   skillName = null,
   skillBaseAttribute = null,
   skillAdds = null,
   skillValue= null,
   unskilledUse = null,
   actor = null } = {}) {
   var test = {
      actor: actor,
      skillName: skillName,
      skillBaseAttribute: skillBaseAttribute,
      skillAdds: skillAdds,
      skillValue: skillValue,
      unskilledUse: unskilledUse
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
   if (test.skillAdds > 0) {
      diceroll = new Roll('1d20x10x20').roll();
      test.unskilledLabel = "display:none"
   } else {
      diceroll = new Roll('1d20x10').roll();
      test.unskilledLabel = "display:block"
   };
   diceroll.toMessage();

   // Get Bonus and Roll Result
   test.rollTotal = diceroll.total;
   test.bonus = torgBonus(test.rollTotal);
            
   test.rollResult = parseInt(test.skillValue) + parseInt(test.bonus);
    
    var chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      owner:  actor
   };

   test.actorPic = actor.data.img;

   const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-card.hbs", test);

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
   
   };

export function torgBonus (rollTotal) {
   if (rollTotal == 1) {
      var bonus = -10}
      else if (rollTotal == 2) {
      var bonus = -8 }
      else if (rollTotal <= 4) {
      var bonus = -6 }
      else if (rollTotal <= 6) {
      var bonus = -4 }
      else if (rollTotal <= 8) {
      var bonus = -2 }
      else if (rollTotal <= 10) {
      var bonus = -1 }
      else if (rollTotal <= 12) {
      var bonus = 0 }
      else if (rollTotal <= 14) {
      var bonus = 1 }
      else if (rollTotal == 15) {
      var bonus = 2 }
      else if (rollTotal ==16) {
      var bonus = 3 }
      else if (rollTotal == 17) {
      var bonus = 4 }
      else if (rollTotal == 18) {
      var bonus = 5 }
      else if (rollTotal == 19) {
      var bonus = 6 }
      else if (rollTotal == 20) {
      var bonus = 7 }
      else if (rollTotal >= 21) {
      var bonus = 7 + Math.ceil((rollTotal - 20)/5) }
      return bonus

   }


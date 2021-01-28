export function SkillCheck({
    skillName = null,
    skillValue = null,
    actor = null } = {}) {
    let dicerollint = new Roll('1d20x10x20').roll();
    dicerollint.toMessage();
    let diceroll = dicerollint.total;
    
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


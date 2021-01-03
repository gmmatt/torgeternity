export function SkillCheck({
    skillName = null,
    skillValue = null } = {}) {
    
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
        content: finalMessage};
    
    ChatMessage.create(chatData, {});
}

export function PossibilityCheck () {
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

      // Put together Chat Data
      let chatData = {
         user: game.user._id,
         speaker: ChatMessage.getSpeaker(),
         owner: ChatMessage.getSpeaker().actor,
      };
      let cardData = {
         newbonus: messageContent,
         previousroll: previousroll.value,
         newtotal: diceroll
      }

//    chatData.content = renderTemplate("systems/torgeternity/templates/partials/possibility-card.hbs", cardData); <-- HELP! could not make this work!

//    Shameless/Lazy Hack to Get Around my Problem
      chatData.content = `
      <div style="background-image: url('systems/torgeternity/images/bgparch.jpg')">
         <div class="chat-title" style="height:30px">
            Possibility Roll
         </div>
         <div class="chat-text">
            <p>Previous Roll Total: ${previousroll.value}</p>
            <p>New Roll Total: ${diceroll}</p>
            <p>New ${messageContent}</p>
         </div>
      </div>
      `
//    Back to Business
      ChatMessage.create(chatData), {};
   }
   }
}).render(true);
}

export function UpRoll () {
   let applyChanges = false;
   new Dialog({
      title: `Initial Roll Total`,
      content: `
         <form>
            <div class="form-group">
            <label>Initial Roll Total:</label>
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

      // Put together Chat Data
      let chatData = {
         user: game.user._id,
         speaker: ChatMessage.getSpeaker(),
         owner: ChatMessage.getSpeaker().actor,
      };
      let cardData = {
         newbonus: messageContent,
         previousroll: previousroll.value,
         newtotal: diceroll
      }

//    chatData.content = renderTemplate("systems/torgeternity/templates/partials/possibility-card.hbs", cardData); <-- HELP! could not make this work!

//    Shameless/Lazy Hack to Get Around my Problem
      chatData.content = `
      <div style="background-image: url('systems/torgeternity/images/bgparch.jpg')">
         <div class="chat-title" style="height:30px">
            Rolling With Up
         </div>
         <div class="chat-text">
            <p>Previous Roll Total: ${previousroll.value}</p>
            <p>New Roll Total: ${diceroll}</p>
            <p>New ${messageContent}</p>
         </div>
      </div>
      `
//    Back to Business
      ChatMessage.create(chatData), {};
   }
   }
}).render(true);
}
export function BonusRoll () {
      var rollResult, dieValue, finalValue, messageContent;
   rollResult = new Roll('1d6').roll().total;
   if (rollResult == 6) {
      dieValue = 5;}
   else if (rollResult <= 5) {
      dieValue = rollResult
   }
   finalValue = dieValue
   messageContent = "<p style='text-align:center;font-weight:bold'>Bonus Die</p>" + dieValue;
   while (rollResult == 6) {
      rollResult = new Roll('1d6').roll().total;
      dieValue = rollResult
      if (rollResult == 6) {
         dieValue = 5;}
      finalValue += parseInt(dieValue)
      messageContent += " + " + dieValue
   }

   messageContent += " = " + finalValue;

   var chatData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      content: messageContent};
   
   ChatMessage.create(chatData), {};
}
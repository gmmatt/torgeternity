export default class torgeternityItem extends Item {

   chatTemplate = {
      "perk": "systems/torgeternity/templates/partials/perk-card.hbs",
      "attack": "systems/torgeternity/templates/partials/attack-card.hbs",
      "bonus": "systems/torgeternity/templates/partials/bonus-card.hbs",
      "power": "systems/torgeternity/templates/partials/power-card.hbs",
      "gear": "systems/torgeternity/templates/partials/gear-card.hbs",
      "implant": "systems/torgeternity/templates/partials/implant-card.hbs",
      "enhancement": "systems/torgeternity/templates/partials/enhancement-card.hbs",
      "eternityshard": "systems/torgeternity/templates/partials/eternityshard-card.hbs",
      "armor": "systems/torgeternity/templates/partials/armor-card.hbs",
      "shield": "systems/torgeternity/templates/partials/shield-card.hbs",
      "spell": "systems/torgeternity/templates/partials/spell-card.hbs",
      "miracle": "systems/torgeternity/templates/partials/miracle-card.hbs",
      "psionicpower": "systems/torgeternity/templates/partials/psionicpower-card.hbs",
      "specialability": "systems/torgeternity/templates/partials/specialability-card.hbs",
      "vehicle": "systems/torgeternity/templates/partials/vehicle-card.hbs",
      "destinyCard": "systems/torgeternity/templates/partials/destinyCard.hbs",
      "cosmCard": "systems/torgeternity/templates/partials/cosmCard.hbs",
      "dramaCard": "systems/torgeternity/templates/partials/dramaCard.hbs"

   };

   async roll() {
      let chatData = {
         user: game.user.data._id,
         speaker: ChatMessage.getSpeaker()
      };

      let cardData = {
         ...this.data,
         owner: this.actor.data._id
      };
      
      chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);

      chatData.roll = true;

      return ChatMessage.create(chatData);
   };

   async weaponAttack() {
      // Roll those dice!
      let dicerollint = new Roll('1d20x10x20').roll();
      dicerollint.toMessage();
      let diceroll = dicerollint.total;

      // get Bonus number
      if (diceroll == 1) {
         var messageContent = `Failure (Check for Mishap)`;
         var bonus = -10;
      } else if (diceroll == 2) {
         var messageContent = 'Bonus: -8 (Disconnect if 4 Case)';
         var bonus = -8;
      } else if (diceroll <= 4) {
         var messageContent = 'Bonus: -6 (Disconnect if 4 Case)';
         var bonus = -6;
      } else if (diceroll <= 6) {
         var messageContent = 'Bonus: -4';
         var bonus = -4;
      } else if (diceroll <= 8) {
         var messageContent = 'Bonus: -2';
         var bonus = -2;
      } else if (diceroll <= 10) {
         var messageContent = 'Bonus: -1';
         var bonus = -1;
      } else if (diceroll <= 12) {
         var messageContent = 'Bonus: +0';
         var bonus = 0;
      } else if (diceroll <= 14) {
         var messageContent = 'Bonus +1';
         var bonus = 1;
      } else if (diceroll == 15) {
         var messageContent = 'Bonus +2';
         var bonus = 2;
      } else if (diceroll == 16) {
         var messageContent = 'Bonus: +3';
         var bonus = 3;
      } else if (diceroll == 17) {
         var messageContent = 'Bonus: +4';
         var bonus = 4;
      } else if (diceroll == 18) {
         var messageContent = 'Bonus: +5';
         var bonus = 5;
      } else if (diceroll == 19) {
         var messageContent = 'Bonus: +6';
         var bonus = 6;
      } else if (diceroll == 20) {
         var messageContent = 'Bonus: +7';
         var bonus = 7;
      } else if (diceroll >= 21) {
         var bonus = 7 + Math.ceil((diceroll - 20) / 5)
         var messageContent = `Bonus:` + bonus;
      }

      // Calculate base damage
      if (this.data.data.damageType == "flat") {
         var baseDamage = this.data.data.damage;
      } else if (this.data.data.damageType == "strengthPlus") {
         var baseDamage = parseInt(this.actor.data.data.attributes.strength) + parseInt(this.data.data.damage)
      } else {
         var baseDamage = this.data.data.damage
      }

      // Retrieve the applicable skill value from the current actor
      var skillToUse = this.actor.data.data.skills[this.data.data.attackWith];
      var skillValue = skillToUse.value;

      // Generate final Roll Result
      var rollResult = parseInt(skillValue) + parseInt(bonus)

      // Put together Chat Data
      let chatData = {
         user: game.user.data._id,
         speaker: ChatMessage.getSpeaker(),
      };

      // Assemble information needed by attack card
      
      let cardData = {
         ...this.data,
         owner: this.actor.data._id,
         bonus: messageContent,
         skillValue: skillValue,
         result: rollResult,
         baseDamage: baseDamage
      }

      // Send the chat
      chatData.content = await renderTemplate(this.chatTemplate["attack"], cardData);

      chatData.weaponAttack = true;

      return ChatMessage.create(chatData);
   };

   async bonus() {
      var rollResult;
      rollResult = new Roll('1d6x6max5').roll();

      let chatData = {
         type: 'Roll',
         user: game.user.data._id,
         roll: rollResult,
         speaker: ChatMessage.getSpeaker(),
      };

      chatData.content = await rollResult.render();


      return ChatMessage.create(chatData)
   }

   // Old Bonus Code
   /*
   async bonus() {
      var rollResult, dieValue, finalValue, totalDice, lastDie, lastDieImage, explosions, hideBonusFlag;
      rollResult = new Roll('1d6').roll().total;
      if (rollResult == 6) {
         dieValue = 5;
      } else if (rollResult <= 5) {
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
         lastDieImage = "/systems/torgeternity/images/bonus-1.webp";}
      else if (lastDie == 2) {
         lastDieImage = "/systems/torgeternity/images/bonus-2.webp";}
      else if (lastDie == 3) {
         lastDieImage = "/systems/torgeternity/images/bonus-3.webp";}
      else if (lastDie == 4) {
         lastDieImage = "/systems/torgeternity/images/bonus-4.webp";}
      else if (lastDie == 5) {
         lastDieImage = "/systems/torgeternity/images/bonus-5.webp";}

      // Put together Chat Data
      let chatData = {
         user: game.user.data._id,
         speaker: ChatMessage.getSpeaker(),
      };

      // Assemble information needed by attack card
      let cardData = {
         ...this.data,
         owner: this.actor.data._id,
         totalDice: totalDice,
         explosions: explosions,
         hideBonusFlag: hideBonusFlag,
         lastDie: lastDie,
         lastDieImage: lastDieImage,
         finalValue: finalValue
      }

      // Send the chat
      chatData.content = await renderTemplate(this.chatTemplate["bonus"], cardData);

      chatData.bonus = true;

      return ChatMessage.create(chatData);

   } */

   async power() {
      // Roll those dice!
      let dicerollint = new Roll('1d20x10x20').roll();
      dicerollint.toMessage();
      let diceroll = dicerollint.total;

      // get Bonus number
      if (diceroll == 1) {
         var messageContent = `Failure (Check for Mishap)`;
         var bonus = -10;
      } else if (diceroll == 2) {
         var messageContent = 'Bonus: -8 (Disconnect if 4 Case)';
         var bonus = -8;
      } else if (diceroll <= 4) {
         var messageContent = 'Bonus: -6 (Disconnect if 4 Case)';
         var bonus = -6;
      } else if (diceroll <= 6) {
         var messageContent = 'Bonus: -4';
         var bonus = -4;
      } else if (diceroll <= 8) {
         var messageContent = 'Bonus: -2';
         var bonus = -2;
      } else if (diceroll <= 10) {
         var messageContent = 'Bonus: -1';
         var bonus = -1;
      } else if (diceroll <= 12) {
         var messageContent = 'Bonus: +0';
         var bonus = 0;
      } else if (diceroll <= 14) {
         var messageContent = 'Bonus +1';
         var bonus = 1;
      } else if (diceroll == 15) {
         var messageContent = 'Bonus +2';
         var bonus = 2;
      } else if (diceroll == 16) {
         var messageContent = 'Bonus: +3';
         var bonus = 3;
      } else if (diceroll == 17) {
         var messageContent = 'Bonus: +4';
         var bonus = 4;
      } else if (diceroll == 18) {
         var messageContent = 'Bonus: +5';
         var bonus = 5;
      } else if (diceroll == 19) {
         var messageContent = 'Bonus: +6';
         var bonus = 6;
      } else if (diceroll == 20) {
         var messageContent = 'Bonus: +7';
         var bonus = 7;
      } else if (diceroll >= 21) {
         var bonus = 7 + Math.ceil((diceroll - 20) / 5)
         var messageContent = `Bonus:` + bonus;
      }

      // Retrieve the applicable skill value from the current actor
      var skillToUse = this.actor.data.data.skills[this.data.data.skill];
      var skillValue = skillToUse.value;

      // Generate final Roll Result
      var rollResult = parseInt(skillValue) + parseInt(bonus)

      // Put together Chat Data
      let chatData = {
         user: game.user.data._id,
         speaker: ChatMessage.getSpeaker(),
      };

      // Assemble information needed by attack card
      let cardData = {
         ...this.data,
         owner: this.actor.data._id,
         bonus: messageContent,
         skillValue: skillValue,
         result: rollResult,
         baseDamage: this.data.data.damage
      }

      // Send the chat
      chatData.content = await renderTemplate(this.chatTemplate["power"], cardData);

      chatData.power = true;

      return ChatMessage.create(chatData);
   }
}
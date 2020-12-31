export default class torgeternityItem extends Item {

    chatTemplate = {
        "perk": "systems/torgeternity/templates/partials/perk-card.hbs",
        "attack": "systems/torgeternity/templates/partials/attack-card.hbs"
    };
    
    async roll() {
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        let cardData = {
            ...this.data,
            owner: this.actor.id
        };

        chatData.content = await renderTemplate(this.chatTemplate[this.type], cardData);

        chatData.roll = true;

        return ChatMessage.create(chatData);
    };

    async attack() {
        // Roll those dice!
        let dicerollint = new Roll('1d20x10x20').roll();
        dicerollint.toMessage();
        let diceroll = dicerollint.total;
        
        // get Bonus number
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
        
        // Retrieve the applicable skill value from the current actor
           var skillValue = this.actor.data.data.skills.fireCombat.value    
        
        // Generate final Roll Result
        var rollResult = parseInt(skillValue) + parseInt(bonus)
           
        // Put together Chat Data
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker(),
        };

        // Assemble information needed by attack card
        let cardData = {
            ...this.data,
            owner: this.actor.id,
            bonus: messageContent,
            skillValue: skillValue,
            result: rollResult
        }

        // Send the chat
        chatData.content = await renderTemplate(this.chatTemplate["attack"], cardData);

        chatData.attack = true;

        return ChatMessage.create(chatData);
    }
}
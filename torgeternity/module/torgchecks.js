export function SkillCheck({
    skillName = null,
    skillValue = null } = {}) {
    // insert Skill Check Macro Code Here?
    let dicerollint = new Roll('1d20x10x20').roll();
    dicerollint.toMessage();
    let diceroll = dicerollint.total;
    
    var messageContent1 = '<p style="text-align:center;font-weight:bold">Rolling ' + skillName + ' Check </p>' + '<p>' + 'Skill Value: ' + skillValue + '</p><p>' + 'Roll Total:' + diceroll + '</p><p>';
    
    
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
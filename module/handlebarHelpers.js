export function registerHelpers(){

Handlebars.registerHelper("concatSkillValue", function (skillName) {
    var skillValue = "{{data.skills." + skillName + ".value}}";
    return skillValue;
  });
  
  Handlebars.registerHelper("concatAttributeName", function (attributeName) {
    var localName = "torgeternity.attributes." + attributeName;
    return localName;
  });
  
  Handlebars.registerHelper("concatSkillName", function (skillName) {
    var localName = "torgeternity.skills." + skillName;
    return localName;
  });
  
  Handlebars.registerHelper("concatClearanceLevel", function (clearance) {
    var localClearance = "torgeternity.clearances." + clearance;
    return localClearance;
  });
  
  Handlebars.registerHelper("concatSpecialAbility", function (description) {
    // Removes <p> and </p> from the beginning and end of special ability descriptions so that they appear inline on threat sheet
    if (description.startsWith("<p>")) {
      var updatedDescription;
      var endPoint = description.length;
      updatedDescription = description.substr(3, endPoint);
      return updatedDescription;
    } else {
      return description;
    }
  });
  
  Handlebars.registerHelper('ifequal', function (a, b, options) {
    if (a == b) { return options.fn(this); }
    return options.inverse(this);
  });
  
  Handlebars.registerHelper('ifnotequal', function (a, b, options) {
    if (a != b) { return options.fn(this); }
    return options.inverse(this);
  })

  Handlebars.registerHelper('poolList', function (actorName) {
    var testVariable = actorName;
    var poolList = "";
    if (game.cards.getName(actorName)) {
      const stack = game.cards.getName(actorName);
      const hand = stack.data.cards
      var i = 0;
      var firstItemExists = false;
      for (i = 0; i < hand.size; i++) {
        if (hand.document.availableCards[i].data.flags?.torgeternity?.pooled === true)  {
            if (firstItemExists === true) { 
              poolList += ", " + hand.document.availableCards[i].data.name;
            } else {
              poolList = hand.document.availableCards[i].data.name;
              firstItemExists = true;
            }
          }
      }
      return poolList;
    } else {
      return "No pool list?";
    }
  })
}

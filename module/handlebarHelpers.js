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
  });
  
}
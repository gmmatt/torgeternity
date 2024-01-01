import { torgeternity } from "./config.js";

export function registerHelpers() {
  Handlebars.registerHelper("concatPowerDN", function (dnValue) {
    // some power DNs are part of a localization key, some are plain text
    const dnStrings = ["veryEasy", "easy", "standard", "challenging", "hard", "veryHard", "heroic", "nearImpossible"];
    if (dnStrings.includes(dnValue) || dnValue.startsWith("target")) {
      return "torgeternity.dnTypes." + dnValue;
    }
    return dnValue;
  });

  Handlebars.registerHelper("concatSkillValue", function (skillName) {
    var skillValue = "{{system.skills." + skillName + ".value}}";
    return skillValue;
  });

  Handlebars.registerHelper("concatAttributeName", function (attributeName) {
    var localName = "torgeternity.attributes." + attributeName;
    return localName;
  });
  Handlebars.registerHelper("concatPerkType", function (type) {
    var localName = "torgeternity.perkTypes." + type;
    return localName;
  });

  Handlebars.registerHelper("concatSkillName", function (skillName) {
    var localName = "torgeternity.skills." + skillName;
    return localName;
  });
  Handlebars.registerHelper("concatPerkType", function (type) {
    var localName = "torgeternity.perkTypes." + type;
    return localName;
  });

  Handlebars.registerHelper("concatClearanceLevel", function (clearance) {
    var localClearance = "torgeternity.clearances." + clearance;
    return localClearance;
  });

  Handlebars.registerHelper("concatCardType", function (cardType) {
    var localCardType = "torgeternity.cardTypes." + cardType;
    return localCardType;
  });

  Handlebars.registerHelper("concatSpecialAbility", function (description) {
    // Removes <p> and </p> from the beginning and end of special ability descriptions so that they appear inline on threat sheet
    if (description.startsWith("<p>")) {
      let updatedDescription = description.replace("<p>", "").replace("</p>", "");
      return updatedDescription;
    } else {
      return description;
    }
  });

  // Is this actor actively defending right now?
  Handlebars.registerHelper("detectActiveDefense", function (data) {
    var i;
    const effects = data.effects;
    for (i = 0; i < effects.length; i++) {
      if (effects[i].name === "ActiveDefense") {
        return true;
      }
    }
    return false;
  });

  // Is this test an active defense roll?
  Handlebars.registerHelper("activeDefenseRoll", function (data) {
    if (data.testType === "activeDefense") {
      return true;
    }
    return false;
  });

  // Is at least one target available in this test?
  Handlebars.registerHelper("targetAvailable", function (data) {
    if (Array.from(data.targets).length > 0) {
      return true;
    } else {
      return false;
    }
  });

  Handlebars.registerHelper("ifequal", function (a, b, options) {
    if (a == b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper("iffalse", function (a, options) {
    if ((a == "false") | (a == false)) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  Handlebars.registerHelper("ifnotequal", function (a, b, options) {
    if (a != b) {
      return options.fn(this);
    }
    return options.inverse(this);
  });

  Handlebars.registerHelper("poolList", function (actorId) {
    var testVariable = actorId;
    var poolList = "";
    let actor = game.actors.get(actorId);
    if (actor.getDefaultHand()) {
      const stack = actor.getDefaultHand();
      const hand = stack.cards;
      var i = 0;
      var firstItemExists = false;
      for (i = 0; i < hand.size; i++) {
        if (hand.contents[i].flags?.torgeternity?.pooled === true) {
          if (firstItemExists === true) {
            poolList +=
              ", " +
              '<span class="pool-tooltip">' +
              hand.contents[i].name +
              "<span><img src='" +
              hand.contents[i].img +
              "'></span></span>";
          } else {
            poolList =
              "<span class='pool-tooltip'>" +
              hand.contents[i].name +
              "<span><img src='" +
              hand.contents[i].img +
              "'></span></span>";
            //poolList = hand.document.availableCards[i].data.name;
            firstItemExists = true;
          }
        }
      }
      return poolList;
    } else {
      return game.i18n.localize("torgeternity.notifications.noHands");
    }
  });

  Handlebars.registerHelper("hideElement", function (displayTo, current) {
    if (parseInt(current) > parseInt(displayTo)) {
      return "hidden";
    } else {
      return "";
    }
  });

  Handlebars.registerHelper("displaySkill", function (editstate, skill) {
    return editstate || skill.adds;
  });

  Handlebars.registerHelper("skillIsCombat", function (skill) {
    return skill.groupName === "combat";
  });

  Handlebars.registerHelper("skillIsInteraction", function (skill) {
    return skill.groupName === "interaction";
  });

  Handlebars.registerHelper("skillIsOther", function (skill) {
    return skill.groupName === "other";
  });

  Handlebars.registerHelper("log", function (message) {
    console.log(message);
  });
  Handlebars.registerHelper("cosmList", function () {
    return torgeternity.cosmTypes;
  });
  Handlebars.registerHelper("hasfinish", function (that) {
    var finished;
    try {
      finished = that.combat.combatants.find((c) => c.actorId === game.user.character.id).flags.world.turnTaken;
    }
    catch (e) {
      finished = true
    };
    return finished;
  });
}

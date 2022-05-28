export function registerHelpers() {

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
        let actor = game.actors.getName(actorName);
        if (actor.getDefaultHand()) {
            const stack = actor.getDefaultHand();
            const hand = stack.data.cards
            var i = 0;
            var firstItemExists = false;
            for (i = 0; i < hand.size; i++) {
                if (hand.document.availableCards[i].data.flags?.torgeternity?.pooled === true) {
                    if (firstItemExists === true) {
                        poolList += ", " + '<span class="pool-tooltip">' + hand.document.availableCards[i].data.name + "<span><img src='" + hand.document.availableCards[i].img + "'></span></span>";
                    } else {
                        poolList = "<span class='pool-tooltip'>" + hand.document.availableCards[i].data.name + "<span><img src='" + hand.document.availableCards[i].img + "'></span></span>"
                        //poolList = hand.document.availableCards[i].data.name;
                        firstItemExists = true;
                    }
                }
            }
            return poolList;
        } else {
            return game.i18n.localize('torgeternity.notifications.noHands');
        }
    })

    Handlebars.registerHelper('hideElement', function (displayTo, current) {
        if (parseInt(current) > parseInt(displayTo)) {
            return "hidden"
        } else {
            return ""
        }
    })

    Handlebars.registerHelper('displaySkill', function (editstate, skill) {
        return (editstate || skill.adds);
    })

    Handlebars.registerHelper('skillIsCombat', function (skill) {
        return (skill.groupName === "combat");
    })

    Handlebars.registerHelper('skillIsInteraction', function (skill) {
        return (skill.groupName === "interaction");
    })

    Handlebars.registerHelper('skillIsOther', function (skill) {
        return (skill.groupName === "other");
    })

    Handlebars.registerHelper("log", function (message) {
        console.log(message);
    })
}
import {torgeternity} from "./module/config.js";
import torgeternityItem from "./module/torgeternityItem.js"
import torgeternityItemSheet from "./module/sheets/torgeternityItemSheet.js";
import torgeternityActorSheet from "./module/sheets/torgeternityActorSheet.js";

Hooks.once("init", function() {
    console.log("torgeternity | Initializing Torg Eternity System");

    CONFIG.torgeternity = torgeternity;
    CONFIG.Item.entityClass = torgeternityItem;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("torgeternity", torgeternityItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ItemSheet);
    Actors.registerSheet("torgeternity", torgeternityActorSheet, {makeDefault: true});
});

Handlebars.registerHelper("concatSkillValue", function(skillName){
    var skillValue = "{{data.skills." + skillName + ".value}}";
    return skillValue;
});

Handlebars.registerHelper("concatSkillName", function(skillName){
    var localName = "torgeternity.skills." + skillName
    return localName;
})
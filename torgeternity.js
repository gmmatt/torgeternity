import {torgeternity} from "./module/config.js";
import * as Chat from "./module/chat.js";
import torgeternityItem from "./module/torgeternityItem.js";
import torgeternityActor from "./module/torgeternityActor.js";
import torgeternityItemSheet from "./module/sheets/torgeternityItemSheet.js";
import torgeternityActorSheet from "./module/sheets/torgeternityActorSheet.js";
  

import {preloadTemplates} from "./module/preloadTemplates.js";


Hooks.once("init", function() {
    console.log("torgeternity | Initializing Torg Eternity System");

//-------moving to a n imported module ?? ./modules/config.js

    CONFIG.torgeternity = torgeternity;
    CONFIG.Item.entityClass = torgeternityItem;
    CONFIG.Actor.entityClass = torgeternityActor;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("torgeternity", torgeternityItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ItemSheet);
    Actors.registerSheet("torgeternity", torgeternityActorSheet, {makeDefault: true});
    
    
//----------preloading handlebars templates for partials sheet 
    preloadTemplates();
//----------debug hooks
CONFIG.debug.hooks=true;

});


//----all this could be draft in another imported module ?? maybe like ./modules/handlebarsHelpers.js

Handlebars.registerHelper("concatSkillValue", function(skillName){
    var skillValue = "{{data.skills." + skillName + ".value}}";
    return skillValue;
});

Handlebars.registerHelper("concatAttributeName", function(attributeName){
    var localName = "torgeternity.attributes." + attributeName
    return localName;
});

Handlebars.registerHelper("concatSkillName", function(skillName){
    var localName = "torgeternity.skills." + skillName
    return localName;
})

Handlebars.registerHelper("concatClearanceLevel", function(clearance){
    var localClearance = "torgeternity.clearances." + clearance;
    return localClearance;
});

Hooks.on("renderChatLog", (app, html, data) => Chat.addChatListeners(html));

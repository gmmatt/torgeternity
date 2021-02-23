import {torgeternity} from "./module/config.js";
import * as Chat from "./module/chat.js";
import torgeternityItem from "./module/torgeternityItem.js";
import torgeternityActor from "./module/torgeternityActor.js";
import torgeternityItemSheet from "./module/sheets/torgeternityItemSheet.js";
import torgeternityActorSheet from "./module/sheets/torgeternityActorSheet.js";
import {sheetResize}  from "./module/sheetResize.js";
 

import {preloadTemplates} from "./module/preloadTemplates.js";
import { toggleViewMode } from "./module/viewMode.js";


Hooks.once("init", function() {
    console.log("torgeternity | Initializing Torg Eternity System");

//-------moving to a n imported module ?? ./modules/config.js

    CONFIG.torgeternity = torgeternity;
    CONFIG.Item.entityClass = torgeternityItem;
    CONFIG.Actor.entityClass = torgeternityActor;
    CONFIG.statusEffects = torgeternity.statusEffects;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("torgeternity", torgeternityItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ItemSheet);
    Actors.registerSheet("torgeternity", torgeternityActorSheet, {makeDefault: true});
    
    
//----------preloading handlebars templates for partials sheet 
    preloadTemplates();
//----------debug hooks
CONFIG.debug.hooks=true;


});

//-------------once everything ready
Hooks.once("ready", function() {
sheetResize();
toggleViewMode();
var logo = document.getElementById("logo");
logo.style.position="absolute"
logo.setAttribute("src", "/systems/torgeternity/images/vttLogo.png");
})
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

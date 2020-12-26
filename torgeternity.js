import {torgeternity} from "./module/config.js";
import torgeternityItemSheet from "./module/sheets/torgeternityItemSheet.js";
import torgeternityStormKnightSheet from "./module/sheets/torgeternityStormKnightSheet.js";
import torgeternityThreatSheet from "./module/sheets/torgeternityThreatSheet.js";

Hooks.once("init", function() {
    console.log("torgeternity | Initializing Torg Eternity System");

    CONFIG.torgeternity = torgeternity;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("torgeternity", torgeternityItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ItemSheet);
    Actors.registerSheet("torgeternity", torgeternityStormKnightSheet, {makeDefault: true});
    Actors.registerSheet("torgeternity", torgeternityThreatSheet);
});
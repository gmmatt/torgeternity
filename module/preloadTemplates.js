/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
export const preloadTemplates = async function () {

    // Define template paths to load
    const templatePaths = [

        // ACTOR--stormknights
        "systems/torgeternity/templates/actors/stormknight/main.hbs",
        "systems/torgeternity/templates/actors/stormknight/attributes.hbs",
        "systems/torgeternity/templates/actors/stormknight/skills.hbs",
        "systems/torgeternity/templates/actors/stormknight/header.hbs",
        "systems/torgeternity/templates/actors/stormknight/perks-details.hbs",
        "systems/torgeternity/templates/actors/stormknight/defense.hbs",
        "systems/torgeternity/templates/actors/stormknight/weapons-list.hbs",
        "systems/torgeternity/templates/actors/stormknight/others.hbs",
        "systems/torgeternity/templates/actors/stormknight/perks-list.hbs",
        "systems/torgeternity/templates/actors/stormknight/gear.hbs",
        "systems/torgeternity/templates/actors/stormknight/powers.hbs",
        "systems/torgeternity/templates/actors/stormknight/xp.hbs",

        // ACTOR--threats
        "systems/torgeternity/templates/actors/threat/main.hbs",
        "systems/torgeternity/templates/actors/threat/header.hbs",
        "systems/torgeternity/templates/actors/threat/stat-tab.hbs",
        "systems/torgeternity/templates/actors/threat/perks-details.hbs",
        "systems/torgeternity/templates/actors/threat/gears.hbs",
        "systems/torgeternity/templates/actors/threat/powers.hbs",
        "systems/torgeternity/templates/actors/threat/background.hbs",



        //active effect part: 
        "systems/torgeternity/templates/parts/active-effects.hbs",

    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
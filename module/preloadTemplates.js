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

      // Test Dialogs
      "systems/torgeternity/templates/testDialogs/attack-difficulty.hbs",
      "systems/torgeternity/templates/testDialogs/difficulty-selector.hbs",
      "systems/torgeternity/templates/testDialogs/disfavored.hbs",
      "systems/torgeternity/templates/testDialogs/bonus-selector.hbs",
      "systems/torgeternity/templates/testDialogs/movement-penalty-selector.hbs",
      "systems/torgeternity/templates/testDialogs/multi-action-selector.hbs",
      "systems/torgeternity/templates/testDialogs/multi-target-selector.hbs",
      "systems/torgeternity/templates/testDialogs/modifiers-table.hbs",
      "systems/torgeternity/templates/testDialogs/attack-options.hbs",
      "systems/torgeternity/templates/testDialogs/target-options.hbs",

        //active effect part: 
        "systems/torgeternity/templates/parts/active-effects.hbs",

        //chatCards
      "systems/torgeternity/templates/partials/activeDefense-card.hbs",
        "systems/torgeternity/templates/partials/armor-card.hbs",
        "systems/torgeternity/templates/partials/attack-card.hbs",
        "systems/torgeternity/templates/partials/bonus-card.hbs",
        "systems/torgeternity/templates/partials/enhancement-card.hbs",
        "systems/torgeternity/templates/partials/eternityshard-card.hbs",
        "systems/torgeternity/templates/partials/gear-card.hbs",
        "systems/torgeternity/templates/partials/implant-card.hbs",
        "systems/torgeternity/templates/partials/meleeweapon-card.hbs",
        "systems/torgeternity/templates/partials/miracle-card.hbs",
        "systems/torgeternity/templates/partials/perk-card.hbs",
        "systems/torgeternity/templates/partials/possibility-card.hbs",
        "systems/torgeternity/templates/partials/power-card.hbs",
        "systems/torgeternity/templates/partials/psionicpower-card.hbs",
        "systems/torgeternity/templates/partials/shield-card.hbs",
        "systems/torgeternity/templates/partials/skill-card.hbs",
        "systems/torgeternity/templates/partials/specialability-card.hbs",
        "systems/torgeternity/templates/partials/skill-error-card.hbs",
        "systems/torgeternity/templates/partials/spell-card.hbs",
        "systems/torgeternity/templates/partials/up-card.hbs",
        "systems/torgeternity/templates/partials/vehicle-card.hbs",






/*          //cards
        "systems/torgeternity/templates/cards/actionCard.hbs",
        "systems/torgeternity/templates/cards/hand.hbs",
*/
    ];

    // Load the template parts
    return loadTemplates(templatePaths);
};
export function prepareActiveEffectCategories(effects) {
    // Define effect header categories
    const categories = {
        temporary: {
        type: "temporary",
        label: "Temporary Effects",
        effects: []
        },
        passive: {
        type: "passive",
        label: "Passive Effects",
        effects: []
        },
        inactive: {
        type: "inactive",
        label: "Inactive Effects",
        effects: []
        }
    };

    // Iterate over active effects, classifying them into categories
    for ( let e of effects ) {
        e._getSourceName(); // Trigger a lookup for the source name
        if ( e.data.disabled ) categories.inactive.effects.push(e);
        else if ( e.isTemporary ) categories.temporary.effects.push(e);
        else categories.passive.effects.push(e);
    }
    return categories; 
}

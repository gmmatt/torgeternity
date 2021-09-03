export function onManageActiveEffect(event, owner) {
    event.preventDefault();
    const a = event.currentTarget;
    const li = a.closest("li");
    const effect = li.dataset.effectId ? owner.effects.get(li.dataset.effectId) : null;
    switch ( a.dataset.action ) {
      case "create":
        return owner.createEmbeddedDocuments("ActiveEffect", [{
          label: "New Effect",
          icon: "icons/svg/aura.svg",
          origin: owner.uuid,
          "duration.rounds": li.dataset.effectType === "temporary" ? 1 : undefined,
          disabled: li.dataset.effectType === "inactive"
        }]);
      case "edit":
        return effect.sheet.render(true);
      case "delete":
        return effect.delete();
      case "toggle":
        return effect.update({disabled: !effect.data.disabled});
    }
  }
  

export function prepareActiveEffectCategories(effects) {
    // Define effect header categories
    const categories = {
        temporary: {
        type: "temporary",
        label: `${game.i18n.localize("torgeternity.sheetLabels.tempEffects")}`,
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

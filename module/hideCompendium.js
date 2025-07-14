
/**
 * Monkey-patch the core CompendiumCollection.visible so that we can help control visibility.
 */
export async function initHideCompendium() {
  // Monkey-patch CompendiumCollection.visible getter
  Object.defineProperty(foundry.documents.collections.CompendiumCollection.prototype, 'visible',
    {
      get() {
        // Copy of CompendiumCollection.visible
        if (this.getUserLevel() < CONST.DOCUMENT_OWNERSHIP_LEVELS.OBSERVER)
          return false;
        if (!game.settings.get('torgeternity', 'hideForeignCompendium'))
          return true;
        return !this.config.hideLanguage;
      }
    });
}


export async function hideCompendium() {

  // Mark which compendiums are to be controlled.
  let langKeys;
  switch (game.settings.get('core', 'language')) {
    case 'en':
    case 'es':
      langKeys = ['(fr)', '(de)'];
      break;
    case 'de':
      langKeys = ['(fr)', '(en)'];
      break;
    case 'fr':
      langKeys = ['(en)', '(de)'];
      break;
    default:
      langKeys = ['(en)', '(de)', '(fr)'];
  }

  for (const pack of game.packs)
    for (const key of langKeys)
      if (pack.metadata.label.includes(key))
        await pack.configure({ 'hideLanguage': true });

  game.packs.initializeTree();
  ui.compendium.render();
}
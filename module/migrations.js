/**
 *
 */
export async function torgMigration() {
  const currentVersion = game.system.version;
  const migrationVersion = game.settings.get('torgeternity', 'migrationVersion');

  // if current version is not newer than migration version, nothing to do here aside from maybe some module specific migrations for premium content
  if (!isNewerVersion(currentVersion, migrationVersion)) {
    // If module images need updating, do that
    if (game.settings.get('torgeternity', 'moduleImageUpdate')) {
      await migrateImagestoWebp({ system: false, modules: true });
      ui.notifications.info('Premium Content Image Migration Complete');
    }
  } else {
  // check for new worlds, which don't need migrating, and set their migration version accordingly
  if (migrationVersion === '1.0.0' && isNewWorld()) {
    await game.settings.set('torgeternity', 'migrationVersion', currentVersion);
    console.log('Torg: New World Detected, skipping migration');
    return;
  }
  // show a UI warning
  ui.notifications.warn('Migrating Torg system version to ' + currentVersion); // TODO: Localize this

  // migrations up to 2.4.0
  if (isNewerVersion('2.4.0', migrationVersion)) {
    // code to migrate missile weappon groupName
    game.actors.forEach(async (act) => {
      if (act.data.data.skills.missileWeapons.groupName != 'combat') {
        await act.update({ 'data.skills.missileWeapons.groupName': 'combat' });
        ui.notifications.info(act.name + ' : migrated');
      }
    });
    // TODO: Add compendium actor migration here?

    // code to migrate new game settings
    const deckSettings = game.settings.get('torgeternity', 'deckSetting');
    if (deckSettings.stormknightsHands) {
      deckSettings.stormknights = deckSettings.stormknightsHands;
      deckSettings.stormknightsHands = null;
      await game.settings.set('torgeternity', 'deckSetting', deckSettings);
    }
  }

  if (isNewerVersion('2.5.0', migrationVersion)) {
    // Deck settings migration to use id
    const deckSetting = game.settings.get('torgeternity', 'deckSetting');
    const deckKeys = Object.keys(deckSetting);
    for (const key of deckKeys) {
      if (key === 'stormknights' || key === 'stormknightsHands') continue;
      let deck = game.cards.getName(deckSetting[key]);
      if (!deck) {
        deck = game.cards.get(deckSetting[key]);
        if (!deck) {
          delete deckSetting[key];
          ui.notifications.error(
            'Torg Eternity: Migrating setting for deck ' +
              key +
              'failed.  Deck settings will need to be reconfigured manually'
          );
        }
        continue;
      }
      deckSetting[key] = deck.id;
    }
    game.settings.set('torgeternity', 'deckSetting', deckSetting);

    await migrateImagestoWebp({ system: true, modules: true });
  }

  if (isNewerVersion('2.5.1', migrationVersion)) {
    // quick migration to fix any worlds which imported the incorrect decks in 2.5.0
    let needsFix = false;
    for (const deck of game.cards.contents) {
      if (deck.data?.img?.includes('jpg')) needsFix = true;
    }
    if (needsFix) await migrateImagestoWebp({ system: true, modules: false });
  }

  // migrations up to 3.3.0
  if (isNewerVersion('3.3.0', migrationVersion)) {
    // code to migrate heavy weapon groupName
    game.actors.forEach(async (act) => {
      if (act.system.skills.missileWeapons.groupName != 'combat') {
        await act.update({ 'system.skills.missileWeapons.groupName': 'combat' });
        ui.notifications.info(act.name + ' missile : migrated');
      }
    });
    game.actors.forEach(async (act) => {
      if (act.system.skills.heavyWeapons.groupName != 'combat') {
        await act.update({ 'system.skills.heavyWeapons.groupName': 'combat' });
        ui.notifications.info(act.name + 'heavy : migrated');
      }
    });
  }

  // migrations for 3.7.0
  if (isNewerVersion('3.7.0', migrationVersion)) {
    ui.notifications.info('Migrating to 3.7.0');
    console.log('Migrating to 3.7.0');
    const badArmorKeys = [
      'system.other.armor',
      'system.other.toughness',
      'system.other.fatigue',
      'system.fatigue',
    ];
    for (const actor of game.actors) {
      for (const item of actor.items) {
        if (item.type === 'armor') {
          await item.update({ 'data.groupName': 'combat' });
        }
      }
      const itemUuids = actor.items.map((item) => item.uuid);
      const armorUuids = actor.itemTypes.armor.map((item) => item.uuid);
      let sendMessage = false;
      const armorsToUpdate = [];
      for (const effect of actor.effects) {
        if (!itemUuids.includes(effect.origin) && effect.origin.includes('Item')) {
          await effect.update({
            origin: `Actor.${actor.id}.Item.${effect.origin.split('.').at(-1)}`,
          });
        }
        if (
          !itemUuids.includes(effect.origin) &&
          effect.origin.includes('Item') &&
          !effect.disabled
        ) {
          effect.update({ disabled: true });
          sendMessage = true;
        }
        if (armorUuids.includes(effect.origin) && !armorsToUpdate.includes(effect.origin)) {
          armorsToUpdate.push(effect.origin);
        }
      }
      if (sendMessage) {
        ui.notifications.info('Disabled effects on ' + actor.name + ' due to missing origin item');
      }
      for (const armorUuid of armorsToUpdate) {
        const armor = fromUuidSync(armorUuid);
        const armorData = armor.toObject();
        armor.delete();
        armorData.effects = armorData.effects
          .map((effect) => {
            effect.changes = effect.changes.filter((c) => !badArmorKeys.includes(c.key));
            return effect;
          })
          .filter((effect) => effect.changes.length > 0);
        await actor.createEmbeddedDocuments('Item', [armorData]);
      }
    }
  }

  /**
   ***********************************************************
    New migrations go here.
   
    For migration to version X.Y.Z:
   
    if(isNewerVersion("X.Y.Z", migrationVersion)){
        //whatever migration code is needed from previous version
    }
   
   *************************************************************
   */

  await game.settings.set('torgeternity', 'migrationVersion', currentVersion);

  ui.notifications.info('System Migration Complete');
  }
}

// Function to test if a world is a new world, to hude my hacky approach under a nice rug
function isNewWorld() {
  // a whole bunch of tests which would return true for a new world, until I find a neater solution
  // Some of these are subject to race conditions, as automatic setup would make them false - but they should all be slower than the simple check, and worst case for a false negative is an unnecessary migration which won't harm anything.
  const retVal = !!(
    game.scenes.size < 1 &&
    game.actors.size < 1 &&
    game.cards.size < 1 &&
    game.items.size < 1 &&
    game.settings.get('torgeternity', 'welcomeMessage') &&
    game.settings.get('torgeternity', 'setUpCards')
  );

  return retVal;
}

async function migrateImagestoWebp(options = { system: true, modules: true }) {
  const moduleUpdates = {
    'te001-core-rulebook': false,
    'te004-living-land': false,
    'te006-nile-empire': false,
  };

  function convertModuleImage(oldImg) {
    const modules = [
      /* name: module id/name
            oldVersion: Version prior to image updates
            pathArray: array of (root) folders containing only webp images in which images have been updated*/
      { name: 'te001-core-rulebook', oldVersion: '1.5.0', pathArray: [] },
      { name: 'te004-living-land', oldVersion: '1.2.0', pathArray: ['/cards/'] },
      { name: 'te006-nile-empire', oldVersion: '0.1', pathArray: ['/images/cards/'] },
    ];
    let isModule = false;
    for (const module of modules) {
      const modData = game.modules.get(module.name);
      if (!modData) continue;
      if (!isNewerVersion(modData.data.version, module.oldVersion)) {
        moduleUpdates[module.name] = true;
        continue;
      }
      if (oldImg.includes(module.name)) {
        for (const path of module.pathArray) {
          if (oldImg.includes(path)) isModule = true;
        }
      }
    }
    if (!isModule) return oldImg; // return the original value for non-module images

    let img = imageToWebp(oldImg); // convert to webp path

    // handle the card backs, which need moving to their corresponding system backs.  DE drama back gets cast to the EN one, because they're identical anyway.
    // might fail on the forge - if so, I can tweak this to grab the image path from the compendiums instead - though that relies on the module being loaded, and would be async, and.... yeah, maybe best not...
    const specialCases = [
      ['/living-land-back.jpg', 'systems/torgeternity/images/cards/living-land-back.webp'],
      ['/drama-back.jpg', 'systems/torgeternity/images/cards/drama-back.webp'],
      ['/destiny-back.jpg', 'systems/torgeternity/images/cards/destiny-back.webp'],
      [
        '/LZZR%C3%BCckseite.jpg',
        'systems/torgeternity/images/deutsch/cards/Cosmkarten/Das%20lebende%20Land/LZZR%C3%BCckseite.webp',
      ],
      [
        '/Schicksalskarten/ZZR%C3%BCckseite.jpg',
        'systems/torgeternity/images/deutsch/cards/Schicksalskarten/ZZR%C3%BCckseite.webp',
      ],
    ];
    for (const specialCase of specialCases) {
      if (oldImg.includes(specialCase[0])) return specialCase[1];
    }
    // Special case for Living Land folder migration:
    if (img.includes('/te004-living-land/')) {
      // rejig folders to match new structure
      img = img.replace('/cards/', '/images/cards/');
      if (!img.includes('/de/')) {
        // if not a DE image, must be English
        img = img.replace('/cards/', '/cards/en/');
      } else {
        img = img.replace('/schicksal/', '/destiny/');
      }
    }
    return img;
  }

  function isSystemImage(oldImg) {
    if (!oldImg.includes('/torgeternity/')) return false;
    let retVal = false;
    const pathArray = ['/cards/', '/images/deutsch/'];
    for (const path of pathArray) {
      if (oldImg.includes(path)) retVal = true;
    }
    return retVal;
  }

  function imageToWebp(img) {
    const imgarray = img.split('.');
    const extensions = ['png', 'jpg', 'jpeg'];
    if (extensions.includes(imgarray[imgarray.length - 1].toLowerCase())) {
      imgarray[imgarray.length - 1] = 'webp';
      img = imgarray.join('.');
    }
    return img;
  }

  // Deck back image migration
  function convertImage(oldImg) {
    let img = oldImg;
    if (options.system && isSystemImage(oldImg)) {
      img = imageToWebp(img);
    }
    if (options.modules) {
      img = convertModuleImage(img);
    }
    return img;
  }

  function updateAllImagesData(document) {
    const oldImg = document.data.img;
    return { img: convertImage(oldImg) };
  }

  await game.cards.updateAll(updateAllImagesData);

  // Card image migration
  function changeCardImages(document) {
    const cards = document.cards;
    const updates = [];
    for (const card of cards) {
      const _id = card.id;
      const img = convertImage(card.img);
      const face = duplicate(card.data.faces[0]);
      face.img = img;
      updates.push({ _id, faces: [face] });
    }
    return updates;
  }
  for (const deck of game.cards) {
    await deck.updateEmbeddedDocuments('Card', changeCardImages(deck));
  }
  ui.notifications.info('Migrated card images to webp format');

  /**
   *******
    //COMMENTED OUT SINCE THESE IMAGES AREN'T CHANGED YET
    //world item images migration
    await game.items.updateAll(updateAllImagesData)
   
    //migrate actor and prototype token images
    function ActorsImageData(document){
        let update = updateAllImagesData(document)
        let tokenImg = document.data.token.img
        update.token = {img: imageToWebp(tokenImg)}
        return update
    }
   
    await game.actors.updateAll(ActorsImageData)
    ui.notifications.info("Migrated actor images to webp format")
   
    //migrate item images on actors
    for(let actor of game.actors){
        actor.updateEmbeddedDocuments("Item", embedsImageData(actor.items))
    }
   
    //migrate tokens on scenes
    for(let scene of game.scenes){
        scene.updateEmbeddedDocuments("Token", embedsImageData(scene.tokens))
    }
    ui.notifications.info("Migrated token images to webp format")
   *******
   */

  // If any modules need an update, flag it to the user
  for (const key of Object.keys(moduleUpdates)) {
    if (moduleUpdates.key) {
      ui.notifications.warn('Update available for premium content ' + key);
      game.settings.set('torgeternity', 'moduleImageUpdate');
    }
  }
}

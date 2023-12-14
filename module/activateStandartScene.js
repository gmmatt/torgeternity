export async function activateStandartScene() {
    let pack, sceneId, scene;
    switch (game.settings.get("core", "language")) {

        case "fr":
            pack = game.packs.get("torgeternity.core-scenes-fr");
            sceneId = pack.index.getName("Scène standard")._id;
            scene = game.scenes.importFromCompendium(pack, sceneId).then(s => { s.activate() });

            break;

        case "de":
            pack = game.packs.get("torgeternity.core-de-scenes");
            sceneId = pack.index.getName("Standardszene")._id;
            scene = game.scenes.importFromCompendium(pack, sceneId).then(s => { s.activate() });
            break;

        default:
            pack = game.packs.get("torgeternity.core-scenes");
            sceneId = pack.index.getName("Main scene")._id;
            scene = game.scenes.importFromCompendium(pack, sceneId).then(s => { s.activate() });
            break;
    }

}
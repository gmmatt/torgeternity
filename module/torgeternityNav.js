export default class TorgeternityNav extends SceneNavigation {
    getData() {
        return mergeObject(super.getData(), { lang: game.settings.get("core", "language") })
    }
    get template() {
        return "systems/torgeternity/templates/scenes/nav.hbs";
    }
}
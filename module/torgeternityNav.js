export default class TorgeternityNav extends SceneNavigation {
    getData() {
     let context = super.getData()
     context.lang = game.settings.get("core", "language");
     context.scenes = context.scenes.map(s => ({...s, flags: game.scenes.get(s.id).flags}))
     return context
    }
    get template() {
        return "systems/torgeternity/templates/scenes/nav.hbs";
    }
}
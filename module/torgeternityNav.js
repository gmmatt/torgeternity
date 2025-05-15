/**
 *
 */
export default class TorgeternityNav extends foundry.applications.ui.SceneNavigation {
  /**
   *
   */
  getData() {
    const context = super.getData();
    context.lang = game.settings.get('core', 'language');
    context.scenes = context.scenes.map((s) => ({ ...s, flags: game.scenes.get(s.id).flags }));
    context.y1pp = game.settings.get('torgeternity', 'y1pp');
    return context;
  }
  /**
   *
   */
  get template() {
    return 'systems/torgeternity/templates/scenes/nav.hbs';
  }
}

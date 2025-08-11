/**
 *
 */
export default class TorgeternityNav extends foundry.applications.ui.SceneNavigation {

  static PARTS = {
    scenes: {
      root: true,
      template: "systems/torgeternity/templates/scenes/nav.hbs"
    },
  }
  /**
   *
   */
  async _prepareContext(options) {
    const context = await super._prepareContext(options);
    context.lang = game.settings.get('core', 'language');
    context.scenes.active = context.scenes.active.map((s) => ({ ...s, torg: game.scenes.get(s.id).torg }));
    context.scenes.inactive = context.scenes.inactive.map((s) => ({ ...s, torg: game.scenes.get(s.id).torg }));
    context.y1pp = game.settings.get('torgeternity', 'y1pp');
    context.fixedOpaque = 'fixedOpaque';
    return context;
  }
}

export default class TorgEternityTokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {

  static WAYPOINT_LABEL_TEMPLATE = 'systems/torgeternity/templates/tokenrulerlabel.hbs';

  _getWaypointLabelContext(waypoint, state) {
    const context = super._getWaypointLabelContext(waypoint, state);
    if (!context || !context.cost.total) return;
    const cost = context.cost.total;
    const move = this.token?.actor.system.other.move;
    context.torgIcon =
      (cost > 3 * move) ? "fa-person-rays" :
        (cost > move) ? "fa-person-running" :
          "fa-person-walking";

    return context;
  }
}
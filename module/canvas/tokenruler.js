export default class TorgEternityTokenRuler extends foundry.canvas.placeables.tokens.TokenRuler {

  static WAYPOINT_LABEL_TEMPLATE = 'systems/torgeternity/templates/tokenrulerlabel.hbs';

  _getWaypointLabelContext(waypoint, state) {
    const context = super._getWaypointLabelContext(waypoint, state);
    if (!context || !context.cost.total || !this.token.actor || this.token.actor.type === 'vehicle') return context;
    const cost = context.cost.total;
    const move = this.token?.actor.system.other.move;
    const walking = this.token.document.movementAction === 'walk';
    if (!walking) return context;
    if (cost > 3 * move) {
      context.torgIcon = "fa-person-rays";
      context.cssTorgMove = "moveTooFar";
    } else if (cost > move) {
      context.torgIcon = "fa-person-running"
      context.cssTorgMove = "moveFar";
    } else {
      //context.torgIcon = "fa-person-walking";
    }
    return context;
  }

  _getGridHighlightStyle(waypoint, offset) {
    const result = super._getGridHighlightStyle(waypoint, offset);
    if (waypoint.action !== 'walk') return result;
    const move = this.token?.actor.system.other.move;
    const cost = waypoint.measurement.cost;
    if (cost > 3 * move)
      result.color = 0xce0707;  // color-level-error
    else if (cost > move)
      result.color = 0xee9b3a;  // color-level-warning
    return result;
  }
}
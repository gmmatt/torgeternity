export default class TorgEternityToken extends foundry.canvas.placeables.Token {

  static #originToken;
  static #hoverToken;
  static #label;
  static #hookSet;

  _onHoverIn(event, options) {
    const result = super._onHoverIn(event, options)
    if (!game.settings.get('torgeternity', 'hoverDistance') || !this.visible) return result;
    if (!canvas.tokens.active || game.activeTool !== "select") return result;

    const originActor = game.user.character;
    if (!originActor) return result;
    const originToken = canvas.scene.tokens.find(t => t.actor === originActor);
    if (!originToken || originToken.object === this) return;

    TorgEternityToken.#originToken = originToken;
    TorgEternityToken.#hoverToken = this;
    TorgEternityToken.updateLabel(this);

    if (!TorgEternityToken.#hookSet) {
      Hooks.on('refreshToken', TorgEternityToken.updateLabel);
      TorgEternityToken.#hookSet = true;
    }

    // Ensure it is visible
    TorgEternityToken.#label?.classList.toggle('hidden', false);
    return result;
  }

  _onHoverOut(event, options) {
    const result = super._onHoverOut(event, options);
    if (!TorgEternityToken.#label) return result;  // never created if option is disabled

    // Hide the label, and mark no hover in progress.
    TorgEternityToken.#label?.classList.toggle('hidden', true);
    TorgEternityToken.#hoverToken = null;
    return result;
  }

  static updateLabel(token, flags) {
    if (token !== TorgEternityToken.#hoverToken) return;
    // Token was made hidden while the hover was already active.
    if (!token.visible) {
      TorgEternityToken.#label?.classList.toggle('hidden', true);
      TorgEternityToken.#hoverToken = null;
      return;
    }

    // Create label if it doesn't already exist
    if (!TorgEternityToken.#label) {
      const token = TorgEternityToken.#hoverToken;
      let rulerId = `token-distance-${token.document.id}`;
      if (token.isPreview) rulerId += "-preview";

      let label = document.querySelector(`#hud #measurement #${rulerId}`);
      if (!label) {
        label = document.createElement("div");
        label.classList.add("ruler-labels", "token-ruler-labels");
        if (!token.visible) label.classList.add('hidden');
        label.id = rulerId;
      }
      TorgEternityToken.#label = label;
    }
    // Ensure the label has the relevant parent
    const label = TorgEternityToken.#label;
    if (!label.parent) document.querySelector("#hud #measurement")?.appendChild(label);

    // Determine the distance from the origin to this token.
    let distance = canvas.grid.measurePath([TorgEternityToken.#originToken.object.center, token.center]).distance;
    // Account for distance needing to be from edge to edge of token, with touching tokens having a distance of 1.
    distance -= (TorgEternityToken.#originToken.height + token.document.height) / 2 - 1;
    if (distance < 0) distance = 0;

    //console.log(`show distance from ${TorgEternityToken.#originToken.name} to ${token.name}`, distance)

    // Create the label HTML
    const distLabel = distance.toNearest(0.1).toLocaleString(game.i18n.lang);
    let html = `<div class="waypoint-label token-distance last"><span class="total-measurement">${distLabel} ${canvas.grid.units}</span></div>`;
    html = foundry.utils.parseHTML(html);
    html.style.setProperty("--position-x", `${token.center.x}px`);
    // 50 to get text ABOVE the top of the token
    html.style.setProperty("--position-y", `${token.center.y - 0.5 * token.h - (50 * canvas.dimensions.uiScale)}px`);
    html.style.setProperty("--ui-scale", canvas.dimensions.uiScale);

    // Update the displayed label
    label.replaceChildren(html);
  }
}
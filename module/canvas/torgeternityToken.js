export default class TorgEternityToken extends foundry.canvas.placeables.Token {

  static #originToken;
  static #hoverToken;
  static #label;

  _onHoverIn(event, options) {
    const result = super._onHoverIn(event, options)
    if (!game.settings.get('torgeternity', 'hoverDistance') || !this.visible) return result;
    if (!(canvas.tokens.active && (game.activeTool === "select"))) return result;

    const originActor = game.user.character;
    if (!originActor) return result;
    TorgEternityToken.#originToken = canvas.scene.tokens.find(t => t.actor === originActor);
    if (TorgEternityToken.#originToken.object === this) return;

    TorgEternityToken.#hoverToken = this;
    Hooks.on('refreshToken', TorgEternityToken.drawLabel);
    TorgEternityToken.drawLabel();

    // Ensure it is visible
    TorgEternityToken.#getLabelElement().classList.toggle("hidden", false);
    return result;
  }

  _onHoverOut(event, options) {
    const result = super._onHoverIn(event, options);
    if (!TorgEternityToken.#label) return result;

    Hooks.off('refreshToken', TorgEternityToken.drawLabel);
    if (!game.settings.get('torgeternity', 'hoverDistance') || !this.visible) return result;
    //console.log(`hide distance from ${game.user.character.name} to ${this.name}`)
    TorgEternityToken.#getLabelElement().classList.toggle("hidden", true);
    return result;
  }

  static drawLabel() {
    let distance = canvas.grid.measurePath([TorgEternityToken.#originToken.object.center, TorgEternityToken.#hoverToken.center]).distance;
    // Account for distance needing to be from edge to edge of token, with touching tokens having a distance of 1.
    distance -= (TorgEternityToken.#originToken.height + TorgEternityToken.#hoverToken.document.height) / 2 - 1;
    if (distance < 0) distance = 0;

    //console.log(`show distance from ${TorgEternityToken.#originToken.name} to ${TorgEternityToken.#hoverToken.name}`, distance)

    // Create the label HTML
    const distLabel = distance.toNearest(0.1).toLocaleString(game.i18n.lang);
    let html = `<div class="waypoint-label token-distance last"><span class="total-measurement">${distLabel} ${canvas.grid.units}</span></div>`;
    html = foundry.utils.parseHTML(html);
    html.style.setProperty("--position-x", `${TorgEternityToken.#hoverToken.center.x}px`);
    // 50 to get text ABOVE the top of the token
    html.style.setProperty("--position-y", `${TorgEternityToken.#hoverToken.center.y - 0.5 * TorgEternityToken.#hoverToken.h - (50 * canvas.dimensions.uiScale)}px`);
    html.style.setProperty("--ui-scale", canvas.dimensions.uiScale);
    //console.log({ context, html });
    TorgEternityToken.#getLabelElement().replaceChildren(html);
  }

  static #getLabelElement() {
    let label = TorgEternityToken.#label;
    if (!label) {
      let rulerId = `token-distance-${TorgEternityToken.#hoverToken.document.id}`;
      if (TorgEternityToken.#hoverToken.isPreview) rulerId += "-preview";
      label = document.querySelector(`#hud #measurement #${rulerId}`);

      if (!label) {
        label = document.createElement("div");
        label.classList.add("ruler-labels", "token-ruler-labels");
        if (!TorgEternityToken.#hoverToken.visible) label.classList.add("hidden");
        label.id = rulerId;
      }
      TorgEternityToken.#label = label;
    }
    if (label.parent) return label;
    document.querySelector("#hud #measurement")?.appendChild(label);
    return label;
  }
}
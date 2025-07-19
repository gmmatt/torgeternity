export default class TorgEternityToken extends foundry.canvas.placeables.Token {

  #label;

  _onHoverIn(event, options) {
    const result = super._onHoverIn(event, options)
    if (!game.settings.get('torgeternity', 'hoverDistance') || !this.visible) return result;
    if (!(canvas.tokens.active && (game.activeTool === "select"))) return result;

    const originActor = game.user.character;
    if (!originActor) return result;
    const originToken = canvas.scene.tokens.find(t => t.actor === originActor);
    if (originToken.object === this) return;
    const path = [originToken.object.center, this.center];
    const measurement = canvas.grid.measurePath(path);

    console.log(`show distance from ${originActor.name} to ${this.name}`, measurement)

    // Create the label HTML
    const distLabel = measurement.distance.toNearest(0.01).toLocaleString(game.i18n.lang);
    let html = `<div class="waypoint-label token-distance last"><span class="total-measurement">${distLabel} ${canvas.grid.units}</span></div>`;
    html = foundry.utils.parseHTML(html);
    html.style.setProperty("--position-x", `${this.center.x}px`);
    // 50 to get text ABOVE the top of the token
    html.style.setProperty("--position-y", `${this.center.y - 0.5 * this.h - (50 * canvas.dimensions.uiScale)}px`);
    html.style.setProperty("--ui-scale", canvas.dimensions.uiScale);
    console.log({ context, html });
    this.#getLabelElement().replaceChildren(html);

    // Ensure it is visible
    this.#getLabelElement().classList.toggle("hidden", false);

    return result;
  }

  _onHoverOut(event, options) {
    const result = super._onHoverIn(event, options);
    if (!this.#label) return result;

    if (!game.settings.get('torgeternity', 'hoverDistance') || !this.visible) return result;
    console.log(`hide distance from ${game.user.character.name} to ${this.name}`)
    this.#getLabelElement().classList.toggle("hidden", true);
    return result;
  }

  #getLabelElement() {
    let label = this.#label;
    if (!label) {
      let rulerId = `token-distance-${this.document.id}`;
      if (this.isPreview) rulerId += "-preview";
      label = document.querySelector(`#hud #measurement #${rulerId}`);

      if (!label) {
        label = document.createElement("div");
        label.classList.add("ruler-labels", "token-ruler-labels");
        if (!this.visible) label.classList.add("hidden");
        label.id = rulerId;
      }
      this.#label = label;
    }
    if (label.parent) return label;
    document.querySelector("#hud #measurement")?.appendChild(label);
    return label;
  }
}
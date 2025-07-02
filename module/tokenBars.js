/**
 *
 */
export function modifyTokenBars() {
  foundry.canvas.placeables.Token.prototype._drawBar = function (number, bar, data) {
    const val = Number(data.value);
    const pct = Math.clamp(val, 0, data.max) / data.max;
    let h = Math.max(canvas.dimensions.size / 12, 8);
    if (this.height >= 2) h *= 1.6; // Enlarge the bar for large tokens
    // Draw the bar
    const color = [0.8, 1 - pct, 0];
    bar.clear().beginFill(0x005500, 1).lineStyle(1, 0x000000, 1);
    // each max draw a green rectangle in background
    for (let index = 0; index < data.max; index++) {
      bar.drawRect(index * (this.w / data.max), 0, this.w / data.max, h);
    }
    // each actual value draw a rectangle from dark green to red
    bar.beginFill(new PIXI.Color(color).toNumber(), 0.8).lineStyle(1, 0x000000, 1);
    for (let index = 0; index < Math.clamp(val, 0, data.max); index++) {
      bar.drawRect(index * (this.w / data.max), 0, this.w / data.max, h);
    }
    // Set position
    const posY = number === 0 ? this.h : -h;
    bar.position.set(0, posY);
  };
}

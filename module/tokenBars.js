export function modifyTokenBars() {

    Token.prototype._drawBar = function (number, bar, data) {
        const val = Number(data.value);
        const pct = Math.clamped(val, 0, data.max) / data.max;
        let h = Math.max((canvas.dimensions.size / 12), 8);
        if (this.data.height >= 2) h *= 1.6;  // Enlarge the bar for large tokens
        // Draw the bar
        let color = [0.8, (1 - pct), (0)];
        bar.clear()
            .beginFill(0x009900, 1)
            .lineStyle(1, 0x000000, 1)
            .drawRoundedRect(0, 0, this.w, h, 3)
            .beginFill(PIXI.utils.rgb2hex(color), 0.8)
            .lineStyle(1, 0x000000, 1)
            .drawRoundedRect(1, 1, pct * (this.w - 2), h - 2, 2);

        // Set position
        let posY = number === 0 ? this.h - h : 0;
        bar.position.set(0, posY);
    }

}
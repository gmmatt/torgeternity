export function modifyTokenBars() {

    Token.prototype._drawBar = function (number, bar, data) {
        const val = Number(data.value);
        const pct = Math.clamped(val, 0, data.max) / data.max;
        let h = Math.max((canvas.dimensions.size / 12), 8);
        if (this.height >= 2) h *= 1.6;  // Enlarge the bar for large tokens
        // Draw the bar
        let color = [0.8, (1 - pct), (0)];
        bar.clear()
            .beginFill(0x005500, 1)
            .lineStyle(1, 0x000000, 1);
            // each max draw a green rectangle in background
            for ( let index=0; index<data.max; index++){
                bar.drawRect(index*(this.w/data.max), 0, (this.w/data.max), h);
                }
           // each actual value draw a rectangle from dark green to red
           bar.beginFill(PIXI.utils.rgb2hex(color), 0.8)
            .lineStyle(1, 0x000000, 1)
            for ( let index=0; index<Math.clamped(val, 0, data.max); index++){
                               bar.drawRect(index*(this.w/data.max), 0, (this.w/data.max), h);
                }
        // Set position
        let posY = number === 0 ? this.h - h : 0;
        bar.position.set(0, posY);
    }
    
    Token.prototype._drawEffect=async function (src, i, bg, w, tint) {
        let tex = await loadTexture(src, {fallback: 'icons/svg/hazard.svg'});
        let icon = this.effects.addChild(new PIXI.Sprite(tex));
        icon.width = icon.height = w;
        const nr = Math.floor(this.data.height * 3);
        icon.x = Math.floor(i / nr) * w*-1;
        icon.y = (i % nr) * w;
        if ( tint ) icon.tint = tint;
        bg.drawRoundedRect(icon.x + 1, icon.y + 1, w - 2, w - 2, 2);
      }
    
    
      Token.prototype.drawEffects=async function () {
      this.effects.removeChildren().forEach(c => c.destroy());
      const tokenEffects = this.data.effects;
      const actorEffects = this.actor?.temporaryEffects || [];
        let overlay = {
          src: this.data.overlayEffect,
          tint: null
        };
    
        // Draw status effects
        if ( tokenEffects.length || actorEffects.length ) {
          const promises = [];
          let w = Math.round(canvas.dimensions.size / 2 / 3) * 2;
          let bg = this.effects.addChild(new PIXI.Graphics()).beginFill(0x000000, 0.40).lineStyle(1.0, 0x000000);
          let i = 0;
    
          // Draw actor effects first
          for ( let f of actorEffects ) {
            if ( !f.data.icon ) continue;
            const tint = f.data.tint ? foundry.utils.colorStringToHex(f.data.tint) : null;
            if ( f.getFlag("core", "overlay") ) {
              overlay = {src: f.data.icon, tint};
              continue;
            }
            promises.push(this._drawEffect(f.data.icon, i, bg, w, tint));
            i++;
          }
    
          // Next draw token effects
          for ( let f of tokenEffects ) {
            promises.push(this._drawEffect(f, i, bg, w, null));
            i++;
          }
          await Promise.all(promises);
        }
    
        // Draw overlay effect
        return this._drawOverlay(overlay)
    
  }
    
}
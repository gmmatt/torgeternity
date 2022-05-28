/*
initialy created by BadIdeasBureau in his module "chain-reaction" : https://github.com/BadIdeasBureau/chain-reaction
thanks to him for letting us using his code
*/


export function explode(modifier, { recursive = true } = {}) {
    if (!this.explosions) this.explosions = []

    // Match the explode or "explode once" modifier
    const rgx = /xo?([0-9]+)?([<>=]+)?([0-9]+)?/i;
    const match = modifier.match(rgx);
    if (!match) return false;
    let [max, comparison, target] = match.slice(1);

    // If no comparison or target are provided, treat the max as the target
    if (max && !(target || comparison)) {
        target = max;
        max = null;
    }

    // Determine target values
    target = Number.isNumeric(target) ? parseInt(target) : this.faces;
    comparison = comparison || "=";
    if (recursive) {
        max = Number.isNumeric(max) ? parseInt(max) : null;
    } else {
        max = 1 //handling the xo operator here passes down the chain nicer, and appears to be equivalent to current behaviour
    }
    let comparisons = { max, comparison, target }
    this.explosions.push({ comparisons, checked: 0 })
        // Recursively explode until there are no remaining results to explode
    let checked = 0;
    let initial = this.results.length;
    while (checked < this.results.length) {
        let r = this.results[checked];
        checked++;
        if (!r.active) continue;

        // Maybe we have run out of explosions


        // Determine whether to explode the result and roll again!
        for (let explosion of this.explosions) {
            if (explosion.checked >= checked) continue;
            let { max, comparison, target } = explosion.comparisons
            explosion.checked++

                if ((max !== null) && (max <= 0)) continue;
            if (DiceTerm.compareResult(r.result, comparison, target)) {
                r.exploded = true;
                this.roll();
                if (max !== null) explosion.comparisons.max -= 1;
            }
        }

        // Limit recursion
        if (checked > 1000) throw new Error("Maximum recursion depth for exploding dice roll exceeded");
    }
}
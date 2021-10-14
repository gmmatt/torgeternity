import * as torgchecks from "/systems/torgeternity/module/torgchecks.js";

export class skillDialog extends FormApplication {

    static get defaultOptions(){
        const options = super.defaultOptions;
        options.template = "systems/torgeternity/templates/skill-check.hbs";
        options.width = "auto";
        options.height = "auto";
        options.title = "Skill Test";
        options.resizeable = false;
        return options
    }

    constructor(test){
        super();
        this.test = test
    }

    activateListeners(html) {

        html.find(".skill-roll-button").click(this._onRoll.bind(this));

        super.activateListeners(html);
    }

    _onRoll(event,html) {
        // Calculate movement modifier
        if (document.getElementById("running-radio").checked) {
            this.test.movementModifier = -2
        } else {
            this.test.movementModifier = 0
        }
        torgchecks.SkillCheck(this.test);
        this.close()
    }
}
export class possibilityByCosm extends FormApplication {

    static get defaultOptions(){
        console.log(ui.windows);
        const options = super.defaultOptions;
        options.template = "systems/torgeternity/templates/possibilityByCosm.hbs";
        options.width = "auto";
        options.height = "auto";
        options.title = game.i18n.localize("torgeternity.sheetLabels.possibilityByCosm");
        options.resizeable = false;
        return options
    }

    constructor(actor){
        console.log(actor);
        super();
        this.actorPoss = actor.getFlag("torgeternity", "possibilityByCosm");
        this.actor = actor;
    }

    get template() {

        //modified path => one folder per type
        return `systems/torgeternity/templates/possibilityByCosm.hbs`;

    }

    async getData() {
        const data = super.getData();
        console.log(data);//
        data.actorPoss = this.actorPoss;
        console.log(data);//

        return data;
        
        }

    activateListeners(html) {

        html.find(".save-button").click(this.onSave.bind(this));

        super.activateListeners(html);
    }

    async onSave(event) {
        console.log(this);
        let ayslePoss = parseInt(document.getElementById("ayslePoss").value);
        let cyberpapacyPoss = parseInt(document.getElementById("cyberpapacyPoss").value);
        let coreEarthPoss = parseInt(document.getElementById("coreEarthPoss").value);
        let livingLandPoss = parseInt(document.getElementById("livingLandPoss").value);
        let nileEmpirePoss = parseInt(document.getElementById("nileEmpirePoss").value);
        let orrorshPoss = parseInt(document.getElementById("orrorshPoss").value);
        let panPacificaPoss = parseInt(document.getElementById("panPacificaPoss").value);
        let tharkoldPoss = parseInt(document.getElementById("tharkoldPoss").value);
        let otherPoss = parseInt(document.getElementById("otherPoss").value);
        let acto = this.actor;
        let possibilityByCosm = {
            ayslePoss:ayslePoss,
            cyberpapacyPoss:cyberpapacyPoss,
            coreEarthPoss:coreEarthPoss,
            livingLandPoss:livingLandPoss,
            nileEmpirePoss:nileEmpirePoss,
            orrorshPoss:orrorshPoss,
            panPacificaPoss:panPacificaPoss,
            tharkoldPoss:tharkoldPoss,
            otherPoss:otherPoss
        }
        await acto.setFlag("torgeternity","possibilityByCosm", possibilityByCosm)
        this.close();
    }
}
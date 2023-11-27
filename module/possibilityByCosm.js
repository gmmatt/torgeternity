export class possibilityByCosm extends Application {

    static get defaultOptions(){
        return mergeObject(super.defaultOptions, {
            template: "systems/torgeternity/templates/possibilityByCosm.hbs",
            width: "auto",
            height: "auto",
            title: game.i18n.localize("torgeternity.sheetLabels.possibilityByCosm"),
            resizeable: false
        });
    }

    constructor(actor){
        super();
        this.actorPoss = actor.getFlag("torgeternity", "possibilityByCosm");
        this.actor = actor;
    }

    static async create(actor){
        new possibilityByCosm(actor).render(true);
    }

    async getData() {//return mergeObject(await super.getData(), this.parameters)
        const data = super.getData();
        data.actor = this.actor;        
        data.actorPoss = this.actor.getFlag("torgeternity", "possibilityByCosm");;
        return data;
        
        }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".save-button").click(this.onSave.bind(this));
        html.find(".inputField").change(this.modifyPoss.bind(this));
        html.find(".content-link").click(this.testActiveModule.bind(this));
        
    }

    async testActiveModule(event) {
        var compendiumLink = event.target.dataset.uuid;
        try {var tes = await fromUuidSync(compendiumLink);
            if (!tes) ui.notifications.warn(game.i18n.localize("torgeternity.notifications.moduleNotActive"));
        }
        catch {err =>{return}};
    }

    async modifyPoss(event) {
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
        await acto.setFlag("torgeternity","possibilityByCosm", possibilityByCosm);
        await acto.update({system:{other:{possibilities: coreEarthPoss}}});
        console.log(possibilityByCosm);
        await this._render();
    }

    async onSave(event) {
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
        await acto.setFlag("torgeternity","possibilityByCosm", possibilityByCosm);
        await acto.update({system:{other:{possibilities: coreEarthPoss}}});
        this.close();

    }
}
export class possibilityByCosm extends FormApplication {

    static get defaultOptions(){
        const options = super.defaultOptions;
        options.template = "systems/torgeternity/templates/possibilityByCosm.hbs";
        options.width = "auto";
        options.height = "auto";
        options.title = game.user.name;
        options.resizeable = false;
        return options
    }

    constructor(poss){
        console.log(poss);
        super();
        this.poss = poss
    }

    get template() {

        //modified path => one folder per type
        return `systems/torgeternity/templates/possibilityByCosm.hbs`;

    }

    async getData() {
        const data = super.getData();
        console.log(data);//
        data.poss = this.poss;
        console.log(data);//

        return data;
        
        }

    activateListeners(html) {

        html.find(".save-button").click(this.onSave.bind(this));

        super.activateListeners(html);
    }

    async onSave(event) {
        console.log(this);
        let ayslePoss = document.getElementById("ayslePoss").value;
        let cyberpapacyPoss = document.getElementById("cyberpapacyPoss").value;
        let coreEarthPoss = document.getElementById("coreEarthPoss").value;
        let livingLandPoss = document.getElementById("livingLandPoss").value;
        let nileEmpirePoss = document.getElementById("nileEmpirePoss").value;
        let orrorshPoss = document.getElementById("orrorshPoss").value;
        let panPacificaPoss = document.getElementById("panPacificaPoss").value;
        let tharkoldPoss = document.getElementById("tharkoldPoss").value;
        let otherPoss = document.getElementById("otherPoss").value;
        let acto = this.poss.object;
        console.log(acto);
        await acto.update({
            system: {
                other: {
                    possibilitiesByCosm:{
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
                }
            }
        });
        console.log(this.poss);
        this.close();
    }
}
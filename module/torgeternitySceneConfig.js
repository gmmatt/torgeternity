export default class torgeternitySceneConfig extends SceneConfig {

    get template() {

        //modified path => one folder per type
        return `systems/torgeternity/templates/scenes/scenes-config.hbs`;

    }
    activateListeners(html) {
        super.activateListeners(html);


        let selCosm = html.find("select.cosm")[0];
        selCosm.addEventListener("change", this._onChangeCosm.bind(this));
        let selZone = html.find("select.zone-type")[0];
        selZone.addEventListener("change", this._onChangeZone.bind(this));

        let selCosm2 = html.find("select.cosm-secondary")[0];
        if (selCosm2) {
            selCosm2.addEventListener("change", this._onChangeCosm2.bind(this));
        }
    }

    _onChangeCosm(ev) {
        let cosm = ev.currentTarget.options[ev.currentTarget.selectedIndex].value;
        this.document.setFlag("torgeternity", "cosm", cosm)


    }
    _onChangeZone(ev) {
        let zone = ev.currentTarget.options[ev.currentTarget.selectedIndex].value;
        this.document.setFlag("torgeternity", "zone", zone);
        if (zone === "mixed" || zone === "dominant") {
            this.document.setFlag("torgeternity", "displayCosm2", true);
        } else {
            this.document.setFlag("torgeternity", "displayCosm2", false);

        }
        if (zone === "mixed") {
            this.document.setFlag("torgeternity", "isMixed", true);
        } else {
            this.document.setFlag("torgeternity", "isMixed", false);

        }
    }
    _onChangeCosm2(ev) {
        let cosm = ev.currentTarget.options[ev.currentTarget.selectedIndex].value;
        this.document.setFlag("torgeternity", "cosm2", cosm)
    }

}
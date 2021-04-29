export default class torgeternitySceneConfig extends SceneConfig {

    get template() {

        //modified path => one folder per type
        return `systems/torgeternity/templates/scenes/scenes-config.hbs`;

    }
    activateListeners(html) {
        super.activateListeners(html);
       let selCosm= html.find("select.cosm")[0];
       selCosm.addEventListener("change",this._onChangeCosm.bind(this));
        let selZone= html.find("select.zone-type")[0];
        selZone.addEventListener("change",this._onChangeZone.bind(this));

      }

      _onChangeCosm(ev){
          let cosm=ev.currentTarget.options[ev.currentTarget.selectedIndex].value;
          this.entity.setFlag("torgeternity","cosm",cosm)

         
      }
      _onChangeZone(ev){
        let zone=ev.currentTarget.options[ev.currentTarget.selectedIndex].value;
        this.entity.setFlag("torgeternity","zone",zone)

       
    }
}
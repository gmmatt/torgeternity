export default class torgeternitySceneConfig extends SceneConfig {

    get template() {

        //modified path => one folder per type
        return `systems/torgeternity/templates/scenes/scenes-config.hbs`;

    }
    activateListeners(html) {
        super.activateListeners(html);
       let sel= html.find("select.cosm")[0];
       sel.addEventListener("change",this._onChangeCosm.bind(this))
      }

      _onChangeCosm(ev){
          let cosm=ev.currentTarget.options[ev.currentTarget.selectedIndex].value;
          this.entity.setFlag("torgeternity","cosm",cosm)

         
      }
}
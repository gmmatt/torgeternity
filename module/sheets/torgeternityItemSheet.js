export default class torgeternityItemSheet extends ItemSheet {
    constructor(...args) {
        super(...args);

        if ( this.object.data.type === "specialability" ) {
            this.options.width= this.position.width = 530;
            this.options.height = this.position.height = 300;
        };

        if ( this.object.data.type === "specialability-rollable" ) {
            this.options.width = this.position.width = 530;
            this.options.height = this.position.height = 310;
        }
    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 530,
            height: 500,
            classes: ["torgeternity", "sheet", "item"]
        });

    }


    get template() {
        return `systems/torgeternity/templates/sheets/${this.item.data.type}-sheet.html`;
    }


    getData(){
        const data = super.getData();

        data.config = CONFIG.torgeternity;

        return data;
    }

}
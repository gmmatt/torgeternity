export default class torgeternityItemSheet extends ItemSheet {
    
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
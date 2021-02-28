import {
    onManageActiveEffect,
    prepareActiveEffectCategories
} from "/systems/torgeternity/module/effects.js";

export default class torgeternityItemSheet extends ItemSheet {
    constructor(...args) {
        super(...args);

        switch (this.object.data.type) {

            case "firearm":
            case "heavyweapon":
            case "meleeweapon":
            case "missileweapon":

                this.options.height = this.position.height = 675;
                break;
            case "miracle":
            case "psionicpower":
            case "spell":
                this.options.height = this.position.height = 750;
                break;

            case "specialability":
                this.options.width = this.position.width = 435;
                this.options.height = this.position.height = 550;
                break;

            case "vehicle":
                this.options.height = this.position.height = 630;
                break;

            case "implant":
            case "armor":
            case "shield":
                this.option.height = this.position.height = 615;
                
            default:
                this.options.height = this.position.height = 560;
        }

    }

    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            width: 530,
            height: 580,
            classes: ["torgeternity", "sheet", "item"],
            tabs: [{
                navSelector: ".sheet-tabs",
                contentSelector: ".sheet-body",
                initial: "stats"
            }],
            scrollY: [".stats", ".effects", ".background"],
            dragdrop: [{
                dragSelector: ".item-list .item",
                dropSelector: null
            }]
        });

    }


    get template() {
        return `systems/torgeternity/templates/sheets/${this.item.data.type}-sheet.html`;
    }


    getData() {
        const data = super.getData();

        data.effects = prepareActiveEffectCategories(this.entity.effects);

        data.config = CONFIG.torgeternity;

        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);
        html.find(".effect-control").click(ev => {
            if (this.item.isOwned) return ui.notifications.warn("Managing Active Effects within an Owned Item is not currently supported and will be added in a subsequent update.")
            onManageActiveEffect(ev, this.item)
        });
    }

}
export default class statuses {
    static registerStatusEffects() {
        CONFIG.statusEffects = [{
            id: "stymied",
            label: "Stymied",
            icon: "systems/torgeternity/images/status/stymied.webp",
        },
        {
            id: "very_stymied",
            label: "Very Stymied",
            icon: "systems/torgeternity/images/status/very_stymied.webp",
        },
        {
            id: "vulnerable",
            label: "Vulnerable",
            icon: "systems/torgeternity/images/status/vulnerable.webp",
        },
        {
            id: "very_vulnerable",
            label: "Very Vulnerable",
            icon: "systems/torgeternity/images/status/very_vulnerable.webp",
        }].concat(CONFIG.statusEffects);
    }
}
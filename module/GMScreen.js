export default class GMScreen extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "systems/torgeternity/templates/gmscreen/screen.html";
        options.width = "1310";
        options.height = "370";
        options.title = "Skill Test";
        options.resizable = true;
        return options
    }


    activateListeners(html) {
        super.activateListeners(html);

    }
    getData() {
        let data = super.getData();
        data.screen = game.settings.get("torgeternity", "gmScreen");
        data.lang = game.settings.get("core", "language");

        if (data.lang != "en" && data.lang != "de") {
            data.lang = "en"
        }
        return data
    }
}
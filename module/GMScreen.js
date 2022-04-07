export default class GMScreen extends Application {
    static get defaultOptions() {
        const options = super.defaultOptions;
        options.template = "systems/torgeternity/templates/gmscreen/screen.html";
        options.width = "1300";
        options.height = "600";
        options.title = game.i18n.localize("torgeternity.gmScreen.title");
        options.resizable = true;
        return options
    }


    activateListeners(html) {
        super.activateListeners(html);

        html.find(".screen-panel").click(this.clickPanel.bind(this));



    }
    clickPanel(evt) {
        let cl;

        let GMScreen = this.element.find("#gm-screen")[0];
        switch (evt.currentTarget.id) {
            case "right-panel":
                cl = "focus-right";

                break;
            case "center-panel":
                cl = "focus-center";

                break;
            case "left-panel":
                cl = "focus-left";

                break;
        }
        GMScreen.classList.toggle(cl);


    }
    getData() {
        let data = super.getData();
        let path = screen = game.settings.get("torgeternity", "gmScreen");
        let lang = game.settings.get("core", "language");
        // setting english as default
        if (lang != "en" && lang != "de") {
            lang = "en"
        }
        path == "none" ? data.background = null : data.background = `style="background-image:url(./modules/${path}/images/gmscreen/${lang}.webp)"`;
        return data
    }
}
export function hideCompendium(defaultLang, tabDirectory) {
    if (tabDirectory.tabName == "compendium") {
        let comps = tabDirectory.element[0].getElementsByClassName("directory-item");
        let hiddingKeys = [];

        switch (defaultLang) {
            case "en":
                hiddingKeys = ["(fr)", "(de)"]
                break;
            case "de":
                hiddingKeys = ["(fr)", "(en)"]

                break;
            case "fr":
                hiddingKeys = ["(en)", "(de)"]
                break;
            default:
                hiddingKeys = ["(en)", "(de)", "(fr)"]

        }

        for (let key of hiddingKeys) {
            for (let comp of comps) {
                let indexForeign = comp.innerText.indexOf(key);
                if (indexForeign !== -1) {
                    comp.style.display = "none";
                }
            }

        }
    }

}

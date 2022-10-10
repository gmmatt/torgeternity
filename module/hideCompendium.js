export function hideCompendium(defaultLang, tabDirectory) {
    console.log(tabDirectory)
    if (tabDirectory.tabName == "compendium") {
        let comps = tabDirectory.element[0].getElementsByClassName("pack-title");
        console.log(comps)
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

        }

        for (let key of hiddingKeys) {
            for (let comp of comps) {
                let indexForeign = comp.innerText.indexOf(key);
                if (indexForeign !== -1) {
                    comp.parentElement.style.display = "none";
                }
            }

        }
    }

}
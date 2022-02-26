export function hideCompendium(defaultLang, html) {
    let comps = document.getElementsByClassName("pack-title");

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
    console.log("in function____________", comps, hiddingKeys)

    for (let key of hiddingKeys) {
        for (let comp of comps) {
            let indexForeign = comp.innerText.indexOf(key);
            console.log(indexForeign);
            if (indexForeign !== -1) {
                comp.parentElement.style.display = "none";
            }
        }

    }
}
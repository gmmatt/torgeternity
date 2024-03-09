/**
 *
 * @param defaultLang
 * @param tabDirectory
 */
export function hideCompendium(defaultLang, tabDirectory) {
  if (tabDirectory.tabName == "compendium") {
    const comps = tabDirectory.element[0].getElementsByClassName("directory-item");
    let hiddingKeys = [];

    switch (defaultLang) {
      case "en":
      case "es":
        hiddingKeys = ["(fr)", "(de)"];
        break;
      case "de":
        hiddingKeys = ["(fr)", "(en)"];

        break;
      case "fr":
        hiddingKeys = ["(en)", "(de)"];
        break;
      default:
        hiddingKeys = ["(en)", "(de)", "(fr)"];
    }

    for (const key of hiddingKeys) {
      for (const comp of comps) {
        const indexForeign = comp.innerText.indexOf(key);
        if (indexForeign !== -1) {
          comp.style.display = "none";
        }
      }
    }
  }
}

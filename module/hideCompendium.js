export function initHideCompendium() {
  Hooks.on('renderCompendiumDirectory', (tabDirectory, html, user, options) => {
    if (!game.settings.get('torgeternity', 'hideForeignCompendium')) return;

    let langKeys;
    switch (game.settings.get('core', 'language')) {
      case 'en':
      case 'es':
        langKeys = ['(fr)', '(de)'];
        break;
      case 'de':
        langKeys = ['(fr)', '(en)'];
        break;
      case 'fr':
        langKeys = ['(en)', '(de)'];
        break;
      default:
        langKeys = ['(en)', '(de)', '(fr)'];
    }

    for (const element of html.querySelectorAll('li.compendium>a.compendium-name')) {
      for (const key of langKeys) {
        if (element.innerText.includes(key)) {
          //console.log(`hiding entry`)
          element.hidden = true;
        }
      }
    }

    // Any folder with at least one hidden entry will be hidden if it doesn't
    // still have some visible entries.
    for (const list of html.querySelectorAll('li.folder')) {
      //const name = list.querySelector('header span')?.innerText;
      if (list.querySelector('a.compendium-name:not([hidden])')) {
        //console.log(`li has NOT hidden: ${name}`, list)
        continue;
      }
      if (!list.querySelector('a.compendium-name[hidden]')) {
        //console.log(`li has NO hidden: ${name}`, list)
        continue;
      }
      //console.log(`found hidden li: ${name}`);
      list.hidden = true;
    }
  });
}
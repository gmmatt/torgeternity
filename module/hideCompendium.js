/**
 *
 * @param defaultLang
 * @param tabDirectory
 */
export async function hideCompendium() {
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

  const hidden_ownership = {
    GAMEMASTER: "NONE",
    ASSISTANT: "NONE",
    PLAYER: "NONE"
  }
  const normal_ownership = {
    ASSISTANT: "OWNER",
    PLAYER: "OBSERVER"
  }

  const hiding = game.settings.get('torgeternity', 'hideForeignCompendium');
  const ownership = hiding ? hidden_ownership : normal_ownership;

  for (const pack of game.packs) {
    for (const key of langKeys)
      if (pack.metadata.label.includes(key)) {
        let update = { ownership };
        if (hiding) {
          await pack.configure({
            "originalOwnership": pack.ownership,
            ownership: {
              GAMEMASTER: "NONE",
              ASSISTANT: "NONE",
              PLAYER: "NONE"
            },
          });
        } else {
          await pack.configure({
            ownership: pack.config.originalOwnership ?? {
              ASSISTANT: "OWNER",
              PLAYER: "OBSERVER"
            }
          });
        }
        console.warn(`${pack.metadata.id} -> ${pack.metadata.label} -> `, ownership);
      }
  }
}

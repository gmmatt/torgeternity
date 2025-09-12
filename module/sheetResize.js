/**
 *
 */

let ro_stormknight;
let ro_threat;

export function sheetResize() {
  Hooks.on('renderTorgeternityActorSheet', async function (sheet, element, context, options) {
    let ro;
    switch (sheet.document.type) {
      case 'stormknight':
        if (!ro_stormknight) ro_stormknight = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.width < 510 || cr.height < 650) {
              entry.target.classList.add('compact');
            } else {
              entry.target.classList.remove('compact');
            }
          }
        });
        ro_stormknight.observe(element);
        break;

      case 'threat':
        if (!ro_threat) ro_threat = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.height < 630) {
              entry.target.classList.add('tabsOff');
              entry.target.classList.remove('tabsOn');
            } else {
              entry.target.classList.remove('tabsOff');
              entry.target.classList.add('tabsOn');
            }
          }
        });
        ro_threat.observe(element);
        break;
    }
  });
}

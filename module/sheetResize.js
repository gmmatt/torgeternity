/**
 *
 */
export function sheetResize() {
  Hooks.on('renderTorgeternityActorSheet', async function (app, html, data) {
    let sheet, ro;
    switch (app.document.type) {
      case 'stormknight':
        sheet = document.getElementById(app.id);
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.width < 510 || cr.height < 650) {
              sheet.classList.add('compact');
            } else {
              sheet.classList.remove('compact');
            }
          }
        });
        ro.observe(sheet);
        break;

      case 'threat':
        sheet = document.getElementById(app.id);
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.height < 630) {
              sheet.classList.add('tabsOff');
              sheet.classList.remove('tabsOn');
            } else {
              sheet.classList.remove('tabsOff');
              sheet.classList.add('tabsOn');
            }
          }
        });
        ro.observe(sheet);
        break;
    }
  });
}

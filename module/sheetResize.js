/**
 *
 */
export function sheetResize() {
  Hooks.on('renderTorgeternityActorSheet', async function (app, html, data) {
    let ro;
    switch (app.document.type) {
      case 'stormknight':
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.width < 510 || cr.height < 650) {
              html.classList.add('compact');
            } else {
              html.classList.remove('compact');
            }
          }
        });
        ro.observe(html);
        break;

      case 'threat':
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.height < 630) {
              html.classList.add('tabsOff');
              html.classList.remove('tabsOn');
            } else {
              html.classList.remove('tabsOff');
              html.classList.add('tabsOn');
            }
          }
        });
        ro.observe(html);
        break;
    }
  });
}

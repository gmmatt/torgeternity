/**
 *
 */
export function sheetResize() {
  Hooks.on('renderTorgeternityActorSheet', async function (sheet, element, context, options) {
    let ro;
    switch (sheet.document.type) {
      case 'stormknight':
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.width < 510 || cr.height < 650) {
              element.classList.add('compact');
            } else {
              element.classList.remove('compact');
            }
          }
        });
        ro.observe(element);
        break;

      case 'threat':
        ro = new ResizeObserver((entries) => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.height < 630) {
              element.classList.add('tabsOff');
              element.classList.remove('tabsOn');
            } else {
              element.classList.remove('tabsOff');
              element.classList.add('tabsOn');
            }
          }
        });
        ro.observe(element);
        break;
    }
  });
}

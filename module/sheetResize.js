export function sheetResize() {
    Hooks.on("rendertorgeternityActorSheet", async function(app, html, data) {
        if (app.object.type === "stormknight") {
            let sheet = document.getElementById(app.id);
            var ro = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const cr = entry.contentRect;

                    if (cr.width < 510 || cr.height < 650) {
                        sheet.classList.add("compact")
                    } else {
                        sheet.classList.remove("compact");
                    }
                }

            });
            ro.observe(sheet);
        }
        if (app.object.type === "threat") {
            let sheet = document.getElementById(app.id);
            var ro = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const cr = entry.contentRect;

                    if (cr.height < 630) {
                        sheet.classList.add("tabsOff");
                        sheet.classList.remove("tabsOn");


                    } else {
                        sheet.classList.remove("tabsOff");
                        sheet.classList.add("tabsOn");
                    }
                }

            });
            ro.observe(sheet);
        }
    })


}
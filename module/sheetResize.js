export function sheetResize() {
    Hooks.on("rendertorgeternityActorSheet", async function(app, html, data) {
        if (app.object.data.type === "stormknight") {
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
        if (app.object.data.type === "threat") {
            let sheet = document.getElementById(app.id);
            var ro = new ResizeObserver(entries => {
                for (let entry of entries) {
                    const cr = entry.contentRect;

                    if (cr.height < 630) {
                        sheet.classList.add("tabsOff");
                        sheet.classList.remove("tabsOn");
                        console.log(data);
                        data.actor.update({
                            data: {
                                editstate: "none"
                            }
                        })

                    } else {
                        sheet.classList.remove("tabsOff");
                        sheet.classList.add("tabsOn");
                        data.actor.update({
                            data: {
                                editstate: "inline"
                            }
                        })
                    }
                }

            });
            ro.observe(sheet);
        }
    })


}
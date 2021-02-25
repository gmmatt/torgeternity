export function sheetResize() {
    Hooks.on("rendertorgeternityActorSheet", async function (app, html, data) {
        if (app.object.data.type==="stormknight"){
        let sheet = document.getElementById(app.id);
        var ro = new ResizeObserver(entries => {
            for (let entry of entries) {
                const cr = entry.contentRect;
                
                if (cr.width<510 ||cr.height<700){
                    sheet.classList.add("compact")
                }else{
                    sheet.classList.remove("compact");
                }
            };

        });
        ro.observe(sheet);
    }
    })
}
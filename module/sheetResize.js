export function sheetResize() {
    Hooks.on("rendertorgeternityActorSheet", async function (app, html, data) {
        console.log(html.id);

        let sheet = document.getElementById(app.id);
        console.log(sheet);
        var ro = new ResizeObserver(entries => {
            for (let entry of entries) {
                const cr = entry.contentRect;
                
                if (cr.width<510 ||cr.height<700){
                    sheet.classList.add("compact")
                    console.log("compact-style")
                }else{
                    sheet.classList.remove("compact");
                    console.log("normal-style")
                }
            };

        });
        ro.observe(sheet);
    })
}
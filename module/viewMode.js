import {
    torgeternity
} from "./config.js";
export function toggleViewMode() {
    let view = torgeternity.viewMode;
    let board = document.getElementById('board')
    board.addEventListener('auxclick', function (e) {
        if (e.button == 1) {
            console.log("middlebutton clic");
            console.log(torgeternity.viewMode);

            if (view.UI == true) {
                document.getElementById("players").style.bottom = "-100px";
                document.getElementById("hotbar").style.bottom = "-100px";
                document.getElementById("controls").style.left = "-100px";
                document.getElementById("sidebar").style.right = "-300px";
                document.getElementById("logo").style.bottom = "-100px";
                document.getElementById("navigation").style.top = "-100px";
                return view.UI = false
            }
            if (view.UI == false) {
                document.getElementById("players").style.bottom = "12px";
                document.getElementById("hotbar").style.bottom = "10px";
                document.getElementById("controls").style.left = "10px";
                document.getElementById("sidebar").style.right = "5px";
                document.getElementById("logo").style.bottom = "10px";
                document.getElementById("navigation").style.top = "12px";
                return view.UI = true
            }
        }
    })
}
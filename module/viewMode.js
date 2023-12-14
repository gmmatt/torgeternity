import { torgeternity } from "./config.js";
export function toggleViewMode() {
  let view = torgeternity.viewMode;
  let board = document.getElementById("board");
  board.addEventListener("auxclick", function (e) {
    if (e.button == 1) {
      if (view.UI == true) {
        document.getElementById("players").style.bottom = "-600px";
        document.getElementById("hotbar").style.bottom = "-600px";
        document.getElementById("controls").style.left = "-600px";
        document.getElementById("sidebar").style.right = "-600px";
        document.getElementById("logo").style.bottom = "-600px";
        document.getElementById("navigation").style.top = "-600px";
        return (view.UI = false);
      }
      if (view.UI == false) {
        document.getElementById("players").style.bottom = "12px";
        document.getElementById("hotbar").style.bottom = "10px";
        document.getElementById("controls").style.left = "10px";
        document.getElementById("sidebar").style.right = "5px";
        document.getElementById("logo").style.bottom = "10px";
        document.getElementById("navigation").style.top = "12px";
        return (view.UI = true);
      }
    }
  });
}

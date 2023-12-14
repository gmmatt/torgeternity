//------------remettre les compétence en ordre alphabétique
function strNoAccent(a) {
  var b = "áàâäãåçéèêëíïîìñóòôöõúùûüýÁÀÂÄÃÅÇÉÈÊËÍÏÎÌÑÓÒÔÖÕÚÙÛÜÝ",
    c = "aaaaaaceeeeiiiinooooouuuuyAAAAAACEEEEIIIINOOOOOUUUUY",
    d = "";
  for (var i = 0, j = a.length; i < j; i++) {
    var e = a.substr(i, 1);
    d += b.indexOf(e) !== -1 ? c.substr(b.indexOf(e), 1) : e;
  }
  return d;
}
export function alphabSort(html, data) {
  if (data.actor.type === "stormknight") {
    let skillLists = document.getElementsByClassName("skill-list");
    for (let list of skillLists) {
      const li = list.childNodes;
      let complist = [];
      for (let sk of li) {
        if (sk.tagName == "LI") {
          complist.push(sk);
        }
      }
      complist.sort(function (a, b) {
        if (a.firstElementChild.firstElementChild && b.firstElementChild.firstElementChild) {
          return strNoAccent(a.firstElementChild.firstElementChild.innerHTML) >
            strNoAccent(b.firstElementChild.firstElementChild.innerHTML)
            ? 1
            : -1;
        }
      });
      for (let sk of complist) {
        list.appendChild(sk);
      }
    }
    let attList = document.getElementsByClassName("attribut-list");
    for (let list of attList) {
      const li = list.childNodes;
      let complist = [];
      for (let sk of li) {
        if (sk.tagName == "LI") {
          complist.push(sk);
        }
      }
      complist.sort(function (a, b) {
        if (a.firstElementChild && b.firstElementChild) {
          return strNoAccent(a.firstElementChild.innerHTML) > strNoAccent(b.firstElementChild.innerHTML) ? 1 : -1;
        }
      });
      for (let sk of complist) {
        list.appendChild(sk);
      }
    }
  }
  if (data.actor.type === "threat") {
    let inlineSkillLists = html[0].getElementsByClassName("inline-skill-list");
    for (let list of inlineSkillLists) {
      const spans = list.childNodes;
      let complist = [];
      for (let sk of spans) {
        if (sk.tagName == "SPAN") {
          complist.push(sk);
        }

        complist.sort(function (a, b) {
          if (a.firstElementChild.innerText && b.firstElementChild.innerText) {
            return strNoAccent(a.firstElementChild.innerText) > strNoAccent(b.firstElementChild.innerText) ? 1 : -1;
          }
        });
        for (let sk of complist) {
          list.appendChild(sk);
        }
      }
    }

    let SkillListEdit = html[0].getElementsByClassName("skill-list-edit");
    for (let list of SkillListEdit) {
      const divs = list.childNodes;
      let complist = [];
      for (let sk of divs) {
        if (sk.tagName == "DIV") {
          complist.push(sk);
        }

        complist.sort(function (a, b) {
          if (a.firstElementChild.innerText && b.firstElementChild.innerText) {
            return strNoAccent(a.firstElementChild.innerText) > strNoAccent(b.firstElementChild.innerText) ? 1 : -1;
          }
        });
        for (let sk of complist) {
          list.appendChild(sk);
        }
      }
    }
    let AttListEdit = html[0].getElementsByClassName("attribut-list-edit");
    for (let list of AttListEdit) {
      const spans = list.childNodes;
      let complist = [];
      for (let sk of spans) {
        if (sk.tagName == "SPAN") {
          complist.push(sk);
        }

        complist.sort(function (a, b) {
          if (a.firstElementChild.innerText && b.firstElementChild.innerText) {
            return strNoAccent(a.firstElementChild.innerText) > strNoAccent(b.firstElementChild.innerText) ? 1 : -1;
          }
        });
        for (let sk of complist) {
          list.appendChild(sk);
        }
      }
    }
  }
}

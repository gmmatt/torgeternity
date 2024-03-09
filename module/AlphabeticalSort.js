// ------------remettre les compétence en ordre alphabétique
function strNoAccent(a) {
  const b = "áàâäãåçéèêëíïîìñóòôöõúùûüýÁÀÂÄÃÅÇÉÈÊËÍÏÎÌÑÓÒÔÖÕÚÙÛÜÝ";
  const c = "aaaaaaceeeeiiiinooooouuuuyAAAAAACEEEEIIIINOOOOOUUUUY";
  let d = "";
  for (let i = 0, j = a.length; i < j; i++) {
    const e = a.substr(i, 1);
    d += b.indexOf(e) !== -1 ? c.substr(b.indexOf(e), 1) : e;
  }
  return d;
}
/**
 *
 * @param html
 * @param data
 */
export function alphabSort(html, data) {
  if (data.actor.type === "stormknight") {
    const skillLists = document.getElementsByClassName("skill-list");
    for (const list of skillLists) {
      const li = list.childNodes;
      const complist = [];
      for (const sk of li) {
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
      for (const sk of complist) {
        list.appendChild(sk);
      }
    }
    const attList = document.getElementsByClassName("attribut-list");
    for (const list of attList) {
      const li = list.childNodes;
      const complist = [];
      for (const sk of li) {
        if (sk.tagName == "LI") {
          complist.push(sk);
        }
      }
      complist.sort(function (a, b) {
        if (a.firstElementChild && b.firstElementChild) {
          return strNoAccent(a.firstElementChild.innerHTML) > strNoAccent(b.firstElementChild.innerHTML) ? 1 : -1;
        }
      });
      for (const sk of complist) {
        list.appendChild(sk);
      }
    }
  }
  if (data.actor.type === "threat") {
    const inlineSkillLists = html[0].getElementsByClassName("inline-skill-list");
    for (const list of inlineSkillLists) {
      const spans = list.childNodes;
      const complist = [];
      for (const sk of spans) {
        if (sk.tagName == "SPAN") {
          complist.push(sk);
        }

        complist.sort(function (a, b) {
          if (a.firstElementChild.innerText && b.firstElementChild.innerText) {
            return strNoAccent(a.firstElementChild.innerText) > strNoAccent(b.firstElementChild.innerText) ? 1 : -1;
          }
        });
        for (const sk of complist) {
          list.appendChild(sk);
        }
      }
    }

    const SkillListEdit = html[0].getElementsByClassName("skill-list-edit");
    for (const list of SkillListEdit) {
      const divs = list.childNodes;
      const complist = [];
      for (const sk of divs) {
        if (sk.tagName == "DIV") {
          complist.push(sk);
        }

        complist.sort(function (a, b) {
          if (a.firstElementChild.innerText && b.firstElementChild.innerText) {
            return strNoAccent(a.firstElementChild.innerText) > strNoAccent(b.firstElementChild.innerText) ? 1 : -1;
          }
        });
        for (const sk of complist) {
          list.appendChild(sk);
        }
      }
    }
    const AttListEdit = html[0].getElementsByClassName("attribut-list-edit");
    for (const list of AttListEdit) {
      const spans = list.childNodes;
      const complist = [];
      for (const sk of spans) {
        if (sk.tagName == "SPAN") {
          complist.push(sk);
        }

        complist.sort(function (a, b) {
          if (a.firstElementChild.innerText && b.firstElementChild.innerText) {
            return strNoAccent(a.firstElementChild.innerText) > strNoAccent(b.firstElementChild.innerText) ? 1 : -1;
          }
        });
        for (const sk of complist) {
          list.appendChild(sk);
        }
      }
    }
  }
}

//------------remettre les compétence en ordre alphabétique 


export function alphabSort() {
    const skillLists = document.getElementsByClassName("skill-list");
    for (let list of skillLists) {
        const li = list.childNodes;
        let complist = [];
        for (let sk of li) {
            if (sk.tagName == "LI") {
                complist.push(sk);
            }
        }
        complist.sort(function(a, b) {
           if ( a.firstElementChild.firstElementChild && b.firstElementChild.firstElementChild){
            return (a.firstElementChild.firstElementChild.innerHTML > b.firstElementChild.firstElementChild.innerHTML) ? 1 : -1;
           }
        });
        for (let sk of complist) {
            list.appendChild(sk)
        }
    }
    const attList = document.getElementsByClassName("attribut-list");
    for (let list of attList) {
        const li = list.childNodes;
        let complist = [];
        for (let sk of li) {
            if (sk.tagName == "LI") {
                complist.push(sk);
            }
        }
        complist.sort(function(a, b) {
           if ( a.firstElementChild && b.firstElementChild){
            return (a.firstElementChild.innerHTML > b.firstElementChild.innerHTML) ? 1 : -1;
           }
        });
        for (let sk of complist) {
            list.appendChild(sk)
        }
    }
}
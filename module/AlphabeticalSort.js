//------------remettre les compétence en ordre alphabétique 


export function alphabSort() {
    const lists = document.getElementsByClassName("alphab-list");
    for (let list of lists) {
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
}


export function addChatListeners(html) {
    html.on('click', 'a.roll-possibility',onPossibility);
    
}

function onPossibility(event) {
    var test = {
        skillName: event.currentTarget.dataset.skillname
    };
    
}
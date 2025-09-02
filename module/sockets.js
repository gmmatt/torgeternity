import { renderSkillChat } from './torgchecks.js';

export default function activateSocketListeners() {
  game.socket.on(`system.${game.system.id}`, async (socketMessage) => {

    switch (socketMessage.request) {
      case 'replaceTestCard':
        if (!game.user.isActiveGM) return;
        game.messages.get(socketMessage.messageId).delete();
        return renderSkillChat(socketMessage.test);
        break;
    }
  })
}
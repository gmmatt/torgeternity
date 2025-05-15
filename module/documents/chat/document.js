import { torgeternity } from '../../config.js';

/**
 * ChatMessage Implementation for Torg Eternity
 * renders the chatMessage from data every time the HTML is rendered
 */
class ChatMessageTorg extends ChatMessage {
  template = '';

  async getHTML() {
    const $html = await super.getHTML();
    const html = $html[0];
    if (this.flags?.template && (this.flags?.data || this.flags?.torgeternity?.test)) {
      const template = this.flags.template;
      const templateData = this.flags?.torgeternity?.test ?? this.flags.data;

      if (
        templateData.system?.dnType?.length &&
        templateData.system?.dn.length > 0 &&
        templateData.system?.dnType?.length === 0
      ) {
        for (const [key, value] of Object.entries(torgeternity.dnTypes)) {
          if (key === templateData.system?.dn) {
            templateData.system.dnType = game.i18n.localize(value);
            break;
          }
        }
      }

      if (this.flags?.torgeternity?.test && templateData.system?.skill)
        templateData.system.translatedSkill = game.i18n.localize(
          `torgeternity.skills.${templateData.system?.skill}`
        );

      const renderedTemplate = await foundry.applications.handlebars.renderTemplate(
        template,
        templateData
      );
      const enrichedHTML = await TextEditor.enrichHTML(renderedTemplate);
      html.querySelector('.message-content').innerHTML = enrichedHTML;
    }
    return $html;
  }
}

export { ChatMessageTorg };

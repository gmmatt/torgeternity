import { torgeternity } from '../../config.js';

/**
 * ChatMessage Implementation for Torg Eternity
 * renders the chatMessage from data every time the HTML is rendered
 */
export class ChatMessageTorg extends ChatMessage {
  template = '';

  async renderHTML(options) {
    const html = await super.renderHTML(options);
    if (this.isContentVisible &&
      this.flags?.torgeternity?.template &&
      (this.flags?.data || this.flags?.torgeternity?.test)) {
      const template = this.flags.torgeternity.template;
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

      templateData.isOpen = game.settings.get('torgeternity', 'showCheckDetails') ? "open" : "";

      const renderedTemplate = await foundry.applications.handlebars.renderTemplate(template, templateData);
      const enrichedHTML = await foundry.applications.ux.TextEditor.enrichHTML(renderedTemplate);
      html.querySelector('.message-content').innerHTML = enrichedHTML;
    }
    return html;
  }
}
/**
 * ChatMessage Implementation for Torg Eternity
 * renders the chatMessage from data every time the HTML is rendered
 */
class ChatMessageTorg extends ChatMessage {
  template = "";

  async getHTML() {
    const $html = await super.getHTML();
    const html = $html[0];
    if (this.flags?.template && (this.flags?.data || this.flags?.torgeternity?.test)) {
      const template = this.flags.template;
      const templateData = this.flags?.torgeternity?.test ?? this.flags.data;
      const renderedTemplate = await renderTemplate(template, templateData);
      html.querySelector(".message-content").innerHTML = renderedTemplate;
    }
    return $html;
  }
}

export { ChatMessageTorg };

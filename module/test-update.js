import * as torgchecks from "/systems/torgeternity/module/torgchecks.js";

export class testUpdate extends FormApplication {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = "systems/torgeternity/templates/test-update.hbs";
    options.width = "auto";
    options.height = "auto";
    options.title = "Skill Test";
    options.resizeable = false;
    return options;
  }

  constructor(test) {
    super();
    this.test = test;
  }

  getData() {
    const data = super.getData();

    data.test = this.test;

    data.config = CONFIG.torgeternity;

    return data;
  }

  activateListeners(html) {
    html.find(".update-roll-button").click(this._onModify.bind(this));

    super.activateListeners(html);
  }

  _onModify(event, html) {
    // Set DN Descriptor
    this.test.DNDescriptor = document.getElementById("difficulty").value;

    // Add movement modifier
    if (document.getElementById("running-radio").checked) {
      this.test.movementModifier = -2;
    } else {
      this.test.movementModifier = 0;
    }

    // Add multi-action modifier
    if (document.getElementById("multi1-radio").checked) {
      this.test.multiModifier = 0;
    } else if (document.getElementById("multi2-radio").checked) {
      this.test.multiModifier = -2;
    } else if (document.getElementById("multi3-radio").checked) {
      this.test.multiModifier = -4;
    } else {
      this.test.multiModifier = -6;
    }

    // Add multi-target modifier
    if (document.getElementById("targets1-radio").checked) {
      this.test.targetsModifier = 0;
    } else if (document.getElementById("targets2-radio").checked) {
      this.test.targetsModifier = -2;
    } else if (document.getElementById("targets3-radio").checked) {
      this.test.targetsModifier = -4;
    } else if (document.getElementById("targets4-radio").checked) {
      this.test.targetsModifier = -6;
    } else if (document.getElementById("targets5-radio").checked) {
      this.test.targetsModifier = -8;
    } else {
      this.test.targetsModifier = -10;
    }

    // Add other modifier 1
    if (document.getElementById("other1-modifier-text").value != 0) {
      this.test.isOther1 = true;
      this.test.other1Description = document.getElementById("other1-description-text").value;
      this.test.other1Modifier = document.getElementById("other1-modifier-text").value;
    } else {
      this.test.isOther1 = false;
    }

    // Add other modifier 2
    if (document.getElementById("other2-modifier-text").value != 0) {
      this.test.isOther2 = true;
      this.test.other2Description = document.getElementById("other2-description-text").value;
      this.test.other2Modifier = document.getElementById("other2-modifier-text").value;
    } else {
      this.test.isOther2 = false;
    }

    // Add other modifier 3
    if (document.getElementById("other3-modifier-text").value != 0) {
      this.test.isOther3 = true;
      this.test.other3Description = document.getElementById("other3-description-text").value;
      this.test.other3Modifier = document.getElementById("other3-modifier-text").value;
    } else {
      this.test.isOther3 = false;
    }

    this.test.diceroll = null;

    var x = event;

    torgchecks.renderSkillChat(this.test);
    this.close();
  }
}

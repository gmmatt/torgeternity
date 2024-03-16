import * as torgchecks from "./torgchecks.js";

/**
 *
 */
export class powerDialog extends FormApplication {
  /**
   *
   */
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.template = "systems/torgeternity/templates/power-test.hbs";
    options.width = "auto";
    options.height = "auto";
    options.title = "Skill Test";
    options.resizeable = false;
    return options;
  }

  /**
   *
   * @param test
   */
  constructor(test) {
    super();
    this.test = test;
  }

  /**
   *
   */
  getData() {
    const data = super.getData();

    data.test = this.test;

    return data;
  }

  /**
   *
   * @param html
   */
  activateListeners(html) {
    html.find(".attack-roll-button").click(this._onRoll.bind(this));

    super.activateListeners(html);
  }

  /**
   *
   * @param event
   * @param html
   */
  _onRoll(event, html) {
    // Add DN based on selected difficulty
    this.test.isDN = true;

    const select = document.getElementById("difficulty");
    const value = select.options[select.selectedIndex].value;

    this.test.DN = parseInt(value);

    // Check for disfavored and flag if needed
    if (document.getElementById("disfavored").checked) {
      this.test.disfavored = true;
    } else {
      this.test.disfavored = false;
    }

    // Add bonus, if needed
    if (document.getElementById("previous-bonus").checked) {
      this.test.previousBonus = true;
      this.test.bonus = document.getElementById("bonus-text").value;
    } else {
      this.test.previousBonus = false;
      this.test.bonus = null;
    }

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

    // Add Called Shot Modifier
    if (document.getElementById("called-shot-none").checked) {
      this.test.calledShotModifier = 0;
    } else if (document.getElementById("called-shot-2").checked) {
      this.test.calledShotModifier = -2;
    } else if (document.getElementById("called-shot-4").checked) {
      this.test.calledShotModifier = -4;
    } else if (document.getElementById("called-shot-6").checked) {
      this.test.calledShotModifier = -6;
    }

    // Add Vital Hit Modifier
    if (document.getElementById("vital-area").checked) {
      this.test.vitalAreaDamageModifier = 4;
    } else {
      this.test.vitalAreaDamageModifier = 0;
    }

    // Add Concealment Modifier
    if (document.getElementById("concealment-none").checked) {
      this.test.concealmentModifier = 0;
    } else if (document.getElementById("concealment-2").checked) {
      this.test.concealmentModifier = -2;
    } else if (document.getElementById("concealment-4").checked) {
      this.test.concealmentModifier = -4;
    } else if (document.getElementById("concealment-6").checked) {
      this.test.concealmentModifier = -6;
    }

    // Add Cover Modifier
    if (document.getElementById("cover") != 0) {
      this.test.coverModifier = document.getElementById("cover").value;
    } else {
      this.test.coverModifier = 0;
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

    torgchecks.powerRoll(this.test);
    this.close();
  }
}

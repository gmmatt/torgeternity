import * as torgchecks from "../torgchecks.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "/systems/torgeternity/module/effects.js";
import { TestDialog } from "/systems/torgeternity/module/test-dialog.js";
import torgeternityItem from "/systems/torgeternity/module/torgeternityItem.js";
import { PossibilityByCosm } from "/systems/torgeternity/module/possibilityByCosm.js";

/**
 *
 */
export default class torgeternityActorSheet extends ActorSheet {
  /**
   *
   * @param {...any} args
   */
  constructor(...args) {
    super(...args);

    if (this.object.type === "threat") {
      this.options.width = this.position.width = 690;
      this.options.height = this.position.height = 645;
    }

    this._filters = {
      effects: new Set(),
    };
  }

  /**
   *
   */
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["torgeternity", "sheet", "actor"],
      width: 773,
      height: 860,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "stats" }],
      scrollY: [".stats", ".perks", ".gear", ".powers", "effects", "background"],
      dragdrop: [
        {
          dragSelector: ".item-list .item",
          dropSelector: null,
        },
      ],
    });
  }

  /**
   *
   */
  get template() {
    // modified path => one folder per type
    return `systems/torgeternity/templates/actors/${this.actor.type}/main.hbs`;
  }

  /**
   *
   * @param options
   */
  async getData(options) {
    const data = super.getData(options);

    data.meleeweapons = data.items.filter(function (item) {
      return item.type == "meleeweapon";
    });
    data.customAttack = data.items.filter(function (item) {
      return item.type == "customAttack";
    });
    data.customSkill = data.items.filter(function (item) {
      return item.type == "customSkill";
    });
    data.gear = data.items.filter(function (item) {
      return item.type == "gear";
    });
    data.eternityshard = data.items.filter(function (item) {
      return item.type == "eternityshard";
    });
    data.armor = data.items.filter(function (item) {
      return item.type == "armor";
    });
    data.shield = data.items.filter(function (item) {
      return item.type == "shield";
    });
    data.missileweapon = data.items.filter(function (item) {
      return item.type == "missileweapon";
    });
    data.firearm = data.items.filter(function (item) {
      return item.type == "firearm";
    });
    data.implant = data.items.filter(function (item) {
      return item.type == "implant";
    });
    data.heavyweapon = data.items.filter(function (item) {
      return item.type == "heavyweapon";
    });
    data.vehicle = data.items.filter(function (item) {
      return item.type == "vehicle";
    });
    data.perk = data.items.filter(function (item) {
      return item.type == "perk";
    });
    data.spell = data.items.filter(function (item) {
      return item.type == "spell";
    });
    data.miracle = data.items.filter(function (item) {
      return item.type == "miracle";
    });
    data.psionicpower = data.items.filter(function (item) {
      return item.type == "psionicpower";
    });
    data.specialability = data.items.filter(function (item) {
      return item.type == "specialability";
    });
    data.specialabilityRollable = data.items.filter(function (item) {
      return item.type == "specialability-rollable";
    });
    data.enhancement = data.items.filter(function (item) {
      return item.type == "enhancement";
    });
    data.dramaCard = data.items.filter(function (item) {
      return item.type == "dramaCard";
    });
    data.destinyCard = data.items.filter(function (item) {
      return item.type == "destinyCard";
    });
    data.cosmCard = data.items.filter(function (item) {
      return item.type == "cosmCard";
    });
    data.vehicleAddOn = data.items.filter(function (item) {
      return item.type == "vehicleAddOn";
    });

    // Enrich Text Editors
    switch (this.object.type) {
      case "stormknight":
        data.enrichedBackground = await TextEditor.enrichHTML(this.object.system.details.background, { async: true });
        break;
      case "threat":
        data.enrichedDetails = await TextEditor.enrichHTML(this.object.system.details.description, { async: true });
        break;
      case "vehicle":
        data.enrichedDescription = await TextEditor.enrichHTML(this.object.system.description, { async: true });
    }

    /* if (this.actor.system.editstate === undefined) {
            this.actor.system.editstate = "none";
        }; */

    data.effects = prepareActiveEffectCategories(this.document.effects);

    data.config = CONFIG.torgeternity;
    data.disableXP = true;
    if (game.user.isGM || !game.settings.get("torgeternity", "disableXP")) {
      data.disableXP = false;
    }

    return data;
  }

  // Skills are not Foundry "items" with IDs, so the skill data is not automatically
  //    inserted by Foundry's _onDragStart. Instead we call that function because it
  //    does some needed work and then add in the skill data in a way that will be
  //    retrievable when the skill is dropped on the macro bar.
  /**
   *
   * @param evt
   */
  _skillAttrDragStart(evt) {
    this._onDragStart(evt);
    const skillAttrData = {
      type: evt.currentTarget.attributes["data-testtype"].value,
      data: {
        name: evt.currentTarget.attributes["data-name"].value,
        attribute: evt.currentTarget.attributes["data-baseattribute"].value,
        adds: evt.currentTarget.attributes["data-adds"].value,
        value: evt.currentTarget.attributes["data-value"].value,
        unskilledUse: evt.currentTarget.attributes["data-unskilleduse"].value,
        attackType: "",
        targets: Array.from(game.user.targets),
        DNDescriptor: "standard",
        rollTotal: 0,
      },
    };
    evt.dataTransfer.setData("text/plain", JSON.stringify(skillAttrData));
  }

  // See _skillAttrDragStart above.
  /**
   *
   * @param evt
   */
  _interactionDragStart(evt) {
    this._onDragStart(evt);
    const skillNameKey = evt.currentTarget.attributes["data-name"].value;
    const skill = this.actor.system.skills[skillNameKey];
    const value = skill.value ? skill.value : skill.adds + this.actor.system.attributes[skill.baseAttribute];
    const skillAttrData = {
      type: "interaction",
      data: {
        name: skillNameKey,
        attribute: skill.baseAttribute,
        adds: skill.adds,
        value: value,
        unskilledUse: skill.unskilledUse,
        attackType: evt.currentTarget.attributes["data-attack-type"].value,
      },
    };
    evt.dataTransfer.setData("text/plain", JSON.stringify(skillAttrData));
  }

  /**
   *
   * @param html
   */
  activateListeners(html) {
    // localizing hardcoded possibility potential value
    console.log(this.actor);
    if (
      game.settings.get("core", "language") != "en" &&
      this.actor.type === "threat" &&
      this.actor.system.details.possibilitypotential === "(none)"
    ) {
      this.actor.update({
        "system.details.possibilitypotential": game.i18n.localize("torgeternity.sheetLabels.none"),
      });
    }

    if (this.actor.isOwner)
      if (this.actor.isOwner) {
        // Owner-only Listeners
        let handler = (ev) => this._onDragStart(ev);
        // Find all items on the character sheet.
        html.find("a.item-name").each((i, a) => {
          // Ignore for the header row.
          if (a.classList.contains("item-header")) return;
          // Add draggable attribute and dragstart listener.
          a.setAttribute("draggable", true);
          a.addEventListener("dragstart", handler, false);
        });
        // Find all attributes on the character sheet.
        handler = (ev) => this._skillAttrDragStart(ev);
        html.find("a.skill-roll").each((i, a) => {
          // Add draggable attribute and dragstart listener.
          a.setAttribute("draggable", true);
          a.addEventListener("dragstart", handler, false);
        });
        // Find all interactions on the character sheet.
        handler = (ev) => this._interactionDragStart(ev);
        html.find("a.interaction-attack").each((i, a) => {
          // Add draggable attribute and dragstart listener.
          a.setAttribute("draggable", true);
          a.addEventListener("dragstart", handler, false);
        });
        // listeners for items on front page of threat sheet
        if (this.object.type === "threat") {
          handler = (ev) => this._onDragStart(ev);
          html.find("a.item").each((i, a) => {
            // Add draggable attribute and dragstart listener.
            a.setAttribute("draggable", true);
            a.addEventListener("dragstart", handler, false);
          });
        }
      }

    if (this.actor.isOwner) {
      html.find(".skill-roll").click(this._onSkillRoll.bind(this));
    }

    if (this.actor.isOwner) {
      // New for skills rolls without values
      html.find(".skill-element-roll").click(this._onSkillElementRoll.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".skill-edit-toggle").click(this._onSkillEditToggle.bind(this));
    }

    // if (this.actor.isOwner) {
    //  html.find(".possibility-roll").click(this._onPossibilityRoll.bind(this));
    // }

    if (this.actor.isOwner) {
      html.find(".item-tochat").click(this._onItemChat.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".item-attackRoll").click(this._onAttackRoll.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".interaction-attack").click(this._onInteractionAttack.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".unarmed-attack").click(this._onUnarmedAttack.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".item-bonusRoll").click(this._onBonusRoll.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".item-powerRoll").click(this._onPowerRoll.bind(this));
    }

    // if (this.actor.isOwner) {
    //  html.find(".up-roll").click(this._onUpRoll.bind(this));
    // }

    if (this.actor.isOwner) {
      html.find(".item-equip").click(this._onItemEquip.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".item-create-sa").click(this._onCreateSa.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".item-create-rsa").click(this._onCreateSaR.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".activeDefense-roll").click(this._onActiveDefenseRoll.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".activeDefense-roll-glow").click(this._onActiveDefenseCancel.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".effect-control").click((ev) => onManageActiveEffect(ev, this.document));
    }

    if (this.actor.isOwner) {
      html.find(".chase-roll").click(this._onChaseRoll.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".stunt-roll").click(this._onStuntRoll.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".base-roll").click(this._onBaseRoll.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".apply-fatigue").click((ev) => {
        const newShock = parseInt(this.actor.system.shock.value) + parseInt(ev.currentTarget.dataset.fatigue);
        this.actor.update({ "system.shock.value": newShock });
      });
    }

    super.activateListeners(html);

    // Everything below here is only needed if the sheet is editable
    if (!this.options.editable) return;

    // Open Cards Hand

    html.find(".open-hand").click(this.onOpenHand.bind(this));
    html.find(".open-poss").click(this.onCosmPoss.bind(this));

    // Update Inventory Item
    html.find(".item-edit").click((ev) => {
      const li = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(li.data("itemId"));
      item.sheet.render(true);
    });

    // Delete Inventory Item
    html.find(".item-delete").click((ev) => {
      let applyChanges = false;
      new Dialog({
        title: game.i18n.localize("torgeternity.dialogWindow.itemDeletion.title"),
        content: game.i18n.localize("torgeternity.dialogWindow.itemDeletion.content"),
        buttons: {
          yes: {
            icon: '<i class="fas fa-check"></i>',
            label: game.i18n.localize("torgeternity.yesNo.true"),
            callback: () => (applyChanges = true),
          },
          no: {
            icon: '<i class="fas fa-times"></i>',
            label: game.i18n.localize("torgeternity.yesNo.false"),
          },
        },
        default: "yes",
        close: () => {
          if (applyChanges) {
            const li = $(ev.currentTarget).parents(".item");
            this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]);
            li.slideUp(200, () => this.render(false));
          }
        },
      }).render(true);
    });

    // Toggle Item Detail Visibility
    html.find(".item-name").click((ev) => {
      const section = ev.currentTarget.closest(".item");
      const detail = $(section).find(".item-detail");
      const content = detail.get(0);
      if (content != undefined && content.style.maxHeight) {
        content.style.maxHeight = null;
      } else {
        if (content) {
          content.style.maxHeight = content.scrollHeight + "px";
        }
      }
    });

    // Toggle Skill Edit Visibility
    // html.find('.skill-list-edit').click(ev => {
    //    let detail =
    // });

    // compute adds from total for threats
    if (this.actor.type == "threat") {
      html.find(".skill-element-edit .inputsFav").change(this.setThreatAdds.bind(this));
    }
  }
  /**
   *
   * @param event
   */
  async setThreatAdds(event) {
    const skill = event.target.dataset.skill;
    if (event.target.value === "0") {
      // reset the 'skill object' to hide any value (the zero)
      await this.actor.update({ [`system.skills.${skill}.adds`]: "" });
      await this.actor.update({ [`system.skills.${skill}.value`]: "" });
    } else {
      if (!!skill) {
        const skillObject = this.actor.system.skills[skill];
        const computedAdds = event.target?.value - this.actor.system.attributes[skillObject?.baseAttribute];
        await this.actor.update({ [`system.skills.${skill}.adds`]: computedAdds });
      }
    }
  }

  /**
   *
   * @param event
   */
  async onOpenHand(event) {
    const characterHand = this.object.getDefaultHand();
    // if default hand => render it
    if (characterHand) {
      characterHand.sheet.render(true);
    } else {
      await this.object.createDefaultHand();
    }
  }

  /**
   *
   * @param event
   */
  async onCosmPoss(event) {
    const actor = this.object;
    const windo = Object.values(ui.windows).find(
      (w) => w.title === game.i18n.localize("torgeternity.sheetLabels.possibilityByCosm")
    );
    if (!windo) {
      PossibilityByCosm.create(actor);
    }
  }

  /**
   *
   * @param event
   */
  async _onSkillRoll(event) {
    const skillName = event.currentTarget.dataset.name;
    const attributeName = event.currentTarget.dataset.baseattribute;
    const isAttributeTest = event.currentTarget.dataset.testtype === "attribute";
    const skillValue = event.currentTarget.dataset.value;
    let isFav;
    if (event.currentTarget.dataset.isfav === "true") {
      isFav = true;
    } else {
      isFav = false;
    }

    // Before calculating roll, check to see if it can be attempted unskilled; exit test if actor doesn't have required skill
    if (checkUnskilled(skillValue, skillName, this.actor)) {
      return;
    }

    const test = {
      testType: event.currentTarget.dataset.testtype,
      customSkill: event.currentTarget.dataset.customskill,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      isAttack: false,
      isFav: this.actor.system.skills[skillName]?.isFav || this.actor.system.attributes?.[skillName + "IsFav"] || isFav,
      skillName: isAttributeTest ? attributeName : skillName,
      skillValue: skillValue,
      targets: Array.from(game.user.targets),
      applySize: false,
      DNDescriptor: "standard",
      attackOptions: false,
      chatNote: "",
      rollTotal: 0, // A zero indicates that a rollTotal needs to be generated when renderSkillChat is called //
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  // Adapted from above, with event targetting in edit skills list
  /**
   *
   * @param event
   */
  async _onSkillElementRoll(event) {
    const skillName = event.currentTarget.dataset.name;
    const attributeName = event.currentTarget.dataset.baseattribute;
    const isUnskilledTest = event.currentTarget.dataset.unskilleduse === "0";
    const skillValue =
      event.currentTarget.dataset.value === "NaN"
        ? isUnskilledTest
          ? "-"
          : this.actor.system.attributes[attributeName]
        : event.currentTarget.dataset.value;
    let isFav;
    if (event.currentTarget.dataset.isfav === "true") {
      isFav = true;
    } else {
      isFav = false;
    }

    // Before calculating roll, check to see if it can be attempted unskilled; exit test if actor doesn't have required skill
    if (checkUnskilled(skillValue, skillName, this.actor)) {
      return;
    }

    const test = {
      testType: event.currentTarget.dataset.testtype,
      customSkill: event.currentTarget.dataset.customskill,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      isAttack: false,
      isFav: this.actor.system.skills[skillName]?.isFav || this.actor.system.attributes?.[skillName + "IsFav"] || isFav,
      skillName: skillName,
      skillValue: skillValue,
      targets: Array.from(game.user.targets),
      applySize: false,
      DNDescriptor: "standard",
      attackOptions: false,
      chatNote: "",
      rollTotal: 0, // A zero indicates that a rollTotal needs to be generated when renderSkillChat is called //
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  /**
   *
   * @param event
   */
  async _onChaseRoll(event) {
    if (!game.combats.active) {
      ui.notifications.info(game.i18n.localize("torgeternity.chatText.check.noTracker"));
      return;
    }

    const test = {
      testType: "chase",
      customSkill: "false",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: "vehicle",
      isAttack: false,
      skillName: "Vehicle Chase",
      skillValue: event.currentTarget.dataset.skillValue,
      targets: Array.from(game.user.targets),
      applySize: false,
      DNDescriptor: "highestSpeed",
      attackOptions: false,
      rollTotal: 0,
      chatNote: "",
      vehicleSpeed: event.currentTarget.dataset.speed,
      maneuverModifier: event.currentTarget.dataset.maneuver,
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  /**
   *
   * @param event
   */
  async _onBaseRoll(event) {
    const test = {
      testType: "vehicleBase",
      customSkill: "false",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: "vehicle",
      isAttack: false,
      skillName: "Vehicle Operation",
      skillValue: event.currentTarget.dataset.skillValue,
      targets: Array.from(game.user.targets),
      applySize: false,
      DNDescriptor: "standard",
      attackOptions: false,
      rollTotal: 0,
      chatNote: "",
      vehicleSpeed: event.currentTarget.dataset.speed,
      maneuverModifier: event.currentTarget.dataset.maneuver,
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  /**
   *
   * @param event
   */
  async _onStuntRoll(event) {
    let dnDescriptor = "standard";

    if (Array.from(game.user.targets).length > 0) {
      const target = Array.from(game.user.targets)[0].actor;
      if (target.type === "vehicle") {
        dnDescriptor = "targetVehicleDefense";
      }
    }
    const test = {
      testType: "stunt",
      customSkill: "false",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: "vehicle",
      isAttack: false,
      skillName: "Vehicle Stunt",
      skillValue: event.currentTarget.dataset.skillValue,
      targets: Array.from(game.user.targets),
      applySize: false,
      DNDescriptor: dnDescriptor,
      attackOptions: false,
      rollTotal: 0,
      chatNote: "",
      vehicleSpeed: event.currentTarget.dataset.speed,
      maneuverModifier: event.currentTarget.dataset.maneuver,
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  /**
   *
   * @param event
   */
  _onInteractionAttack(event) {
    let dnDescriptor = "standard";
    const attackType = event.currentTarget.getAttribute("data-attack-type");
    if (Array.from(game.user.targets).length > 0) {
      switch (attackType) {
        case "intimidation":
          dnDescriptor = "targetIntimidation";
          break;
        case "maneuver":
          dnDescriptor = "targetManeuver";
          break;
        case "taunt":
          dnDescriptor = "targetTaunt";
          break;
        case "trick":
          dnDescriptor = "targetTrick";
          break;
        default:
          dnDescriptor = "standard";
      }
    } else {
      dnDescriptor = "standard";
    }

    const test = {
      testType: "interactionAttack",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      isAttack: false,
      interactionAttackType: event.currentTarget.getAttribute("data-attack-type"),
      skillName: event.currentTarget.getAttribute("data-name"),
      skillBaseAttribute: game.i18n.localize(
        "torgeternity.skills." + event.currentTarget.getAttribute("data-base-attribute")
      ),
      skillAdds: event.currentTarget.getAttribute("data-adds"),
      skillValue: event.currentTarget.getAttribute("data-skill-value"),
      isFav: this.actor.system.skills[attackType].isFav,
      unskilledUse: true,
      darknessModifier: 0,
      DNDescriptor: dnDescriptor,
      type: "interactionAttack",
      targets: Array.from(game.user.targets),
      applySize: false,
      attackOptions: false,
      rollTotal: 0,
      chatNote: "",
      movementModifier: 0,
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  /**
   *
   * @param event
   */
  _onUnarmedAttack(event) {
    let dnDescriptor = "standard";
    if (Array.from(game.user.targets).length > 0) {
      let firstTarget = Array.from(game.user.targets).find((t) => t.actor.type !== "vehicle")?.actor;
      if (!firstTarget) firstTarget = Array.from(game.user.targets)[0].actor;
      if (firstTarget.type === "vehicle") {
        dnDescriptor = "targetVehicleDefense";
      } else {
        firstTarget.items.filter((it) => it.type === "meleeweapon").filter((it) => it.system.equipped).length !== 0
          ? (dnDescriptor = "targetMeleeWeapons")
          : (dnDescriptor = "targetUnarmedCombat");
      }
    } else {
      dnDescriptor = "standard";
    }
    let skillValue = event.currentTarget.getAttribute("data-skill-value");

    if (isNaN(skillValue)) {
      skillValue = this.actor.system.attributes.dexterity;
    } else {
      skillValue = event.currentTarget.getAttribute("data-skill-value");
    }

    const test = {
      testType: "attack",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      amountBD: 0,
      attackType: "unarmedCombat",
      isAttack: true,
      skillName: "unarmedCombat",
      skillValue: skillValue,
      isFav: this.actor.system.skills.unarmedCombat.isFav,
      unskilledUse: true,
      damage: event.currentTarget.getAttribute("data-damage"),
      weaponAP: 0,
      applyArmor: true,
      darknessModifier: 0,
      DNDescriptor: dnDescriptor,
      type: "attack",
      targets: Array.from(game.user.targets),
      applySize: true,
      attackOptions: true,
      rollTotal: 0,
      chatNote: "",
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  /**
   *
   * @param event
   */
  _onSkillEditToggle(event) {
    const toggleState = this.actor.system.editstate;
    event.preventDefault();
    if ((toggleState === null) | (toggleState === "none")) {
      this.actor.update({
        "system.editstate": true,
      });
    } else {
      this.actor.update({
        "system.editstate": null,
      });
    }
  }

  /**
   *
   * @param event
   */
  _onActiveDefenseRoll(event) {
    const dnDescriptor = "standard";

    const test = {
      testType: "activeDefense",
      activelyDefending: false,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      isAttack: false,
      skillName: "activeDefense",
      skillBaseAttribute: 0,
      skillAdds: null,
      skillValue: null,
      unskilledUse: true,
      darknessModifier: 0,
      DNDescriptor: dnDescriptor,
      type: "activeDefense",
      targetAll: Array.from(game.user.targets),
      targets: Array.from(game.user.targets),
      applySize: false,
      attackOptions: false,
      chatNote: "",
      rollTotal: 0,
      movementModifier: 0,
      vulnerableModifierAll: [0],
      sizeModifierAll: [0],
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  /**
   *
   * @param event
   */
  _onActiveDefenseCancel(event) {
    const dnDescriptor = "standard";

    const test = {
      testType: "activeDefense",
      activelyDefending: true,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      isAttack: false,
      skillName: "activeDefense",
      skillBaseAttribute: 0,
      skillAdds: null,
      skillValue: null,
      unskilledUse: true,
      darknessModifier: 0,
      DNDescriptor: dnDescriptor,
      type: "activeDefense",
      targetAll: Array.from(game.user.targets),
      targets: Array.from(game.user.targets),
      applySize: false,
      attackOptions: false,
      rollTotal: 0,
      vulnerableModifierAll: [0],
      sizeModifierAll: [0],
    };

    // If cancelling activeDefense, bypass dialog
    torgchecks.renderSkillChat(test);
  }

  /**
   *
   * @param event
   */
  _onItemChat(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);

    item.roll();
  }

  /**
   *
   * @param event
   */
  _onAttackRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);
    let attributes;
    const weaponData = item.system;
    const attackWith = weaponData.attackWith;
    const damageType = weaponData.damageType;
    const weaponDamage = weaponData.damage;
    let skillValue;
    if (this.actor.type === "vehicle") {
      skillValue = item.system.gunner.skillValue;
      attributes = 0;
    } else {
      const skillData = this.actor.system.skills[weaponData.attackWith];
      skillValue = skillData.value;
      attributes = this.actor.system.attributes;
      if (isNaN(skillValue)) {
        skillValue = skillData.unskilledUse ? attributes[skillData.baseAttribute] : "-";
      }
    }

    if (checkUnskilled(skillValue, attackWith, this.actor)) return;

    let dnDescriptor = "standard";
    const attackType = event.currentTarget.getAttribute("data-attack-type");
    let adjustedDamage = 0;

    if (Array.from(game.user.targets).length > 0) {
      let firstTarget = Array.from(game.user.targets).find((t) => t.actor.type !== "vehicle")?.actor;
      if (!firstTarget) firstTarget = Array.from(game.user.targets)[0].actor;
      if (firstTarget.type === "vehicle") {
        dnDescriptor = "targetVehicleDefense";
      } else {
        switch (attackWith) {
          case "meleeWeapons":
          case "unarmedCombat":
            firstTarget.items.filter((it) => it.type === "meleeweapon").filter((it) => it.system.equipped).length === 0
              ? (dnDescriptor = "targetUnarmedCombat")
              : (dnDescriptor = "targetMeleeWeapons");
            break;
          case "fireCombat":
          case "energyWeapons":
          case "heavyWeapons":
          case "missileWeapons":
            dnDescriptor = "targetDodge";
            break;
          default:
            dnDescriptor = "targetMeleeWeapons";
        }
      }
    } else {
      dnDescriptor = "standard";
    }

    // Calculate damage caused by this weapon
    switch (damageType) {
      case "flat":
        adjustedDamage = weaponDamage;
        break;
      case "strengthPlus":
        adjustedDamage = parseInt(attributes.strength) + parseInt(weaponDamage);
        break;
      case "charismaPlus":
        adjustedDamage = parseInt(attributes.charisma) + parseInt(weaponDamage);
        break;
      case "dexterityPlus":
        adjustedDamage = parseInt(attributes.dexterity) + parseInt(weaponDamage);
        break;
      case "mindPlus":
        adjustedDamage = parseInt(attributes.mind) + parseInt(weaponDamage);
        break;
      case "spiritPlus":
        adjustedDamage = parseInt(attributes.spirit) + parseInt(weaponDamage);
        break;
      default:
        adjustedDamage = parseInt(weaponDamage);
    }

    const test = {
      testType: "attack",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      amountBD: 0,
      attackType: attackType,
      isAttack: true,
      isFav: skillData?.isFav || false,
      skillName: attackWith,
      skillValue: Math.max(skillValue, attributes[skillData?.baseAttribute] || 0),
      unskilledUse: true,
      damage: adjustedDamage,
      weaponAP: weaponData.ap,
      applyArmor: true,
      darknessModifier: 0,
      DNDescriptor: dnDescriptor,
      type: "attack",
      targets: Array.from(game.user.targets),
      applySize: true,
      attackOptions: true,
      rollTotal: 0,
      chatNote: weaponData.chatNote,
      movementModifier: 0,
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  /**
   *
   * @param event
   */
  _onBonusRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);

    item.bonus();
  }

  /**
   *
   * @param event
   */
  _onPowerRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);
    const powerData = item.system;
    const skillName = powerData.skill;
    const skillData = this.actor.system.skills[skillName];
    // var dnDescriptor = "standard";
    let dnDescriptor = powerData.dn;
    let isAttack = false;
    let applyArmor = true;
    let applySize = true;
    let powerModifier = 0;

    // Convert yes/no options from sheet into boolean values (or else renderSkillChat gets confused)
    if (powerData.isAttack == "true") {
      isAttack = true;
    } else {
      isAttack = false;
    }

    if (powerData.applyArmor == "true") {
      applyArmor = true;
    } else {
      applyArmor = false;
    }

    if (powerData.applySize == "true") {
      applySize = true;
    } else {
      applySize = false;
    }

    // Set modifier for this power
    if (item.system.modifier > 0 || item.system.modifier < 0) {
      powerModifier = item.system.modifier;
    } else {
      powerModifier = 0;
    }

    // Set difficulty descriptor based on presense of target
    if (Array.from(game.user.targets).length > 0) {
      dnDescriptor = powerData.dn;
    } // else { //Commented out, because the dnDescriptor is derived by the incoming powerdata and should not be overwritten if it is not an attack
    /* dnDescriptor = "standard"
        };*/

    if (checkUnskilled(skillData.value, skillName, this.actor)) return;

    const test = {
      testType: "power",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorName: this.actor.name,
      actorType: this.actor.type,
      attackType: "power",
      powerName: item.name,
      powerModifier: powerModifier,
      isAttack: isAttack,
      isFav: skillData.isFav,
      skillName: skillName,
      skillBaseAttribute: game.i18n.localize(
        "torgeternity.skills." + event.currentTarget.getAttribute("data-base-attribute")
      ),
      skillAdds: skillData.adds,
      skillValue: Math.max(skillData.value, this.actor.system.attributes[skillData.baseAttribute]),
      unskilledUse: false,
      damage: powerData.damage,
      weaponAP: powerData.ap,
      applyArmor: applyArmor,
      darknessModifier: 0,
      DNDescriptor: dnDescriptor,
      type: "power",
      chatNote: "",
      targets: Array.from(game.user.targets),
      applySize: applySize,
      attackOptions: true,
      rollTotal: 0,
      movementModifier: 0,
    };

    const dialog = new TestDialog(test);
    dialog.render(true);
  }

  /**
   *
   * @param event
   */
  _onCreateSa(event) {
    event.preventDefault();
    const itemData = {
      name: game.i18n.localize("torgeternity.itemSheetDescriptions.specialability"),
      type: "specialability",
    };
    return this.actor.createEmbeddedDocuments("Item", [itemData], {
      renderSheet: true,
    });
  }

  /**
   *
   * @param event
   */
  _onCreateSaR(event) {
    event.preventDefault();
    const itemData = {
      name: game.i18n.localize("torgeternity.itemSheetDescriptions.specialabilityRollable"),
      type: "specialability-rollable",
    };
    return this.actor.createEmbeddedDocuments("Item", [itemData], {
      renderSheet: true,
    });
  }

  /**
   *
   * @param event
   */
  _onItemEquip(event) {
    const itemID = event.currentTarget.closest(".item").getAttribute("data-item-id");
    const item = this.actor.items.get(itemID);
    const doCheckOtherItems = torgeternityItem.toggleEquipState(item, this.actor);

    // for armor and shield, ensure there's only one equipped
    if (doCheckOtherItems && item.system && item.system.hasOwnProperty("equipped")) {
      const actor = this.actor;
      actor.items.forEach(function (otherItem) {
        if (otherItem._id !== item._id && otherItem.system.equipped && otherItem.type === item.type) {
          torgeternityItem.toggleEquipState(otherItem, actor);
        }
      });
    }
  }
}

/**
 *
 * @param skillValue
 * @param skillName
 * @param actor
 */
export function checkUnskilled(skillValue, skillName, actor) {
  if (skillValue === "-") {
    const cantRollData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      owner: actor,
    };

    const templateData = {
      message:
        game.i18n.localize("torgeternity.skills." + skillName) +
        " " +
        game.i18n.localize("torgeternity.chatText.check.cantUseUntrained"),
      actorPic: actor.img,
      actorName: actor.name,
    };

    const templatePromise = renderTemplate(
      "./systems/torgeternity/templates/partials/skill-error-card.hbs",
      templateData
    );

    templatePromise.then((content) => {
      cantRollData.content = content;
      ChatMessage.create(cantRollData);
    });

    return true;
  } else {
    return false;
  }
}

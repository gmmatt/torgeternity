import { torgeternity } from "../config.js";
import * as torgchecks from "../torgchecks.js";
import { onManageActiveEffect, prepareActiveEffectCategories } from "/systems/torgeternity/module/effects.js";
import { testDialog } from "/systems/torgeternity/module/test-dialog.js";
import torgeternityItem from "/systems/torgeternity/module/torgeternityItem.js";
import { possibilityByCosm } from "/systems/torgeternity/module/possibilityByCosm.js";

export default class torgeternityActorSheet extends ActorSheet {
  constructor(...args) {
    super(...args);

    if (this.object.type === "threat") {
      this.options.width = this.position.width = 645;
      this.options.height = this.position.height = 645;
    }

    this._filters = {
      effects: new Set(),
    };
  }

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

  get template() {
    //modified path => one folder per type
    return `systems/torgeternity/templates/actors/${this.actor.type}/main.hbs`;
  }

  async getData(options) {
    const data = super.getData(options);
    var firstItem = 0;

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
  _skillAttrDragStart(evt) {
    this._onDragStart(evt);
    let skillAttrData = {
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
  _interactionDragStart(evt) {
    this._onDragStart(evt);
    let skillNameKey = evt.currentTarget.attributes["data-name"].value;
    let skill = this.actor.system.skills[skillNameKey];
    let value = skill.value ? skill.value : skill.adds + this.actor.system.attributes[skill.baseAttribute];
    let skillAttrData = {
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

  activateListeners(html) {
    //localizing hardcoded possibility potential value
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
        //Owner-only Listeners
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
      html.find(".skill-edit-toggle").click(this._onSkillEditToggle.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".possibility-roll").click(this._onPossibilityRoll.bind(this));
    }

    if (this.actor.isOwner) {
      html.find(".bonus-roll").click(this._onBonusRoll.bind(this));
    }

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

    if (this.actor.isOwner) {
      html.find(".up-roll").click(this._onUpRoll.bind(this));
    }

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
        let newShock = parseInt(this.actor.system.shock.value) + parseInt(ev.currentTarget.dataset.fatigue);
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
        close: (html) => {
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
      let section = ev.currentTarget.closest(".item");
      let detail = $(section).find(".item-detail");
      let content = detail.get(0);
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
    //});

    //compute adds from total for threats
    if (this.actor.type == "threat") {
      html.find(".threat-skill-total").change(this.setThreatAdds.bind(this));
    }
  }
  async setThreatAdds(event) {
    let data = this.actor.data;

    let skill = event.currentTarget.dataset.skill;
    let skillObject = this.actor.system.skills[skill];

    system.skills[skill].adds = event.currentTarget.value - this.actor.system.attributes[skillObject.baseAttribute];
    this.actor.update(data);
  }
  async onOpenHand(event) {
    let characterHand = this.object.getDefaultHand();
    // if default hand => render it
    if (characterHand) {
      characterHand.sheet.render(true);
    } else {
      await this.object.createDefaultHand();
    }
  }

  async onCosmPoss(event) {
    let actor = this.object;
    let windo = Object.values(ui.windows).find(
      (w) => w.title === game.i18n.localize("torgeternity.sheetLabels.possibilityByCosm")
    );
    if (!windo) {
      possibilityByCosm.create(actor);
    }
  }

  async _onSkillRoll(event) {
    const skillName = event.currentTarget.dataset.name;
    const attributeName = event.currentTarget.dataset.baseattribute;
    const isAttributeTest = event.currentTarget.dataset.testtype === "attribute";
    var skillValue = event.currentTarget.dataset.value;
    var isFav;
    if (event.currentTarget.dataset.isfav === "true") {
      isFav = true;
    } else {
      isFav = false;
    }

    // Before calculating roll, check to see if it can be attempted unskilled; exit test if actor doesn't have required skill
    if (checkUnskilled(skillValue, skillName, this.actor)) {
      return;
    }

    let test = {
      testType: event.currentTarget.dataset.testtype,
      customSkill: event.currentTarget.dataset.customskill,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
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

    let dialog = new testDialog(test);
    dialog.render(true);
  }

  async _onChaseRoll(event) {
    if (!game.combats.active) {
      ui.notifications.info(game.i18n.localize("torgeternity.chatText.check.noTracker"));
      return;
    }

    let test = {
      testType: "chase",
      customSkill: "false",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
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

    let dialog = new testDialog(test);
    dialog.render(true);
  }

  async _onBaseRoll(event) {
    let test = {
      testType: "vehicleBase",
      customSkill: "false",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
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

    let dialog = new testDialog(test);
    dialog.render(true);
  }

  async _onStuntRoll(event) {
    var dnDescriptor = "standard";

    if (Array.from(game.user.targets).length > 0) {
      var target = Array.from(game.user.targets)[0].actor;
      if (target.type === "vehicle") {
        dnDescriptor = "targetVehicleDefense";
      }
    }
    let test = {
      testType: "stunt",
      customSkill: "false",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
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

    let dialog = new testDialog(test);
    dialog.render(true);
  }

  _onInteractionAttack(event) {
    var dnDescriptor = "standard";
    var attackType = event.currentTarget.getAttribute("data-attack-type");
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

    let test = {
      testType: "interactionAttack",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
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

    let dialog = new testDialog(test);
    dialog.render(true);
  }

  _onUnarmedAttack(event) {
    var dnDescriptor = "standard";
    if (Array.from(game.user.targets).length > 0) {
      var firstTarget = Array.from(game.user.targets)[0].actor;
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

    let test = {
      testType: "attack",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
      actorType: this.actor.type,
      amountBD: 0,
      attackType: "unarmedCombat",
      isAttack: true,
      skillName: "unarmedCombat",
      skillValue: Math.max(
        this.actor.system.attributes.dexterity,
        event.currentTarget.getAttribute("data-skill-value")
      ),
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

    let dialog = new testDialog(test);
    dialog.render(true);
  }

  _onSkillEditToggle(event) {
    var toggleState = this.actor.system.editstate;
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

  _onPossibilityRoll(event) {
    torgchecks.PossibilityCheck({
      actor: this.actor,
    });
  }

  _onUpRoll(event) {
    torgchecks.UpRoll({
      actor: this.actor,
    });
  }

  _onActiveDefenseRoll(event) {
    var dnDescriptor = "standard";

    let test = {
      testType: "activeDefense",
      activelyDefending: false,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
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
      targets: Array.from(game.user.targets),
      applySize: false,
      attackOptions: false,
      chatNote: "",
      rollTotal: 0,
      movementModifier: 0,
    };

    let dialog = new testDialog(test);
    dialog.render(true);
  }

  _onActiveDefenseCancel(event) {
    var dnDescriptor = "standard";

    let test = {
      testType: "activeDefense",
      activelyDefending: true,
      actor: this.actor.uuid,
      actorPic: this.actor.img,
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
      targets: Array.from(game.user.targets),
      applySize: false,
      attackOptions: false,
      rollTotal: 0,
    };

    // If cancelling activeDefense, bypass dialog
    torgchecks.renderSkillChat(test);
  }
  _onBonusRoll(event) {
    torgchecks.BonusRoll({
      actor: this.actor,
    });
  }

  _onItemChat(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);

    item.roll();
  }

  _onAttackRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);
    var attributes;
    var weaponData = item.system;
    var attackWith = weaponData.attackWith;
    var damageType = weaponData.damageType;
    var weaponDamage = weaponData.damage;
    var skillValue;
    if (this.actor.type === "vehicle") {
      skillValue = item.system.gunner.skillValue;
      attributes = 0;
    } else {
      var skillData = this.actor.system.skills[weaponData.attackWith];
      skillValue = skillData.value;
      attributes = this.actor.system.attributes;
    }

    if (checkUnskilled(skillValue, attackWith, this.actor)) return;

    var dnDescriptor = "standard";
    var attackType = event.currentTarget.getAttribute("data-attack-type");
    var adjustedDamage = 0;

    if (Array.from(game.user.targets).length > 0) {
      var firstTarget = Array.from(game.user.targets)[0].actor;
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

    let test = {
      testType: "attack",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
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

    let dialog = new testDialog(test);
    dialog.render(true);
  }

  _onBonusRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);

    item.bonus();
  }

  _onPowerRoll(event) {
    const itemID = event.currentTarget.closest(".item").dataset.itemId;
    const item = this.actor.items.get(itemID);
    var powerData = item.system;
    var skillName = powerData.skill;
    var skillData = this.actor.system.skills[skillName];
    //var dnDescriptor = "standard";
    var dnDescriptor = powerData.dn;
    var isAttack = false;
    var applyArmor = true;
    var applySize = true;
    var powerModifier = 0;

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
    /*dnDescriptor = "standard"
        };*/

    if (checkUnskilled(skillData.value, skillName, this.actor)) return;

    let test = {
      testType: "power",
      actor: this.actor.uuid,
      actorPic: this.actor.img,
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

    let dialog = new testDialog(test);
    dialog.render(true);

    /*        const itemID = event.currentTarget.closest(".item").dataset.itemId;
                const item = this.actor.items.get(itemID);
                var powerData = item.system;
                var skillData = this.actor.system.skills[powerData.skill];
        
                // Declare target variables
                var sizeModifier = 0;
                var vulnerableModifier = 0;
                var targetToughness = 0;
                var targetArmor = 0;
                var targetCharisma = 0;
                var targetDexterity = 0;
                var targetMind = 0;
                var targetSpirit = 0;
                var targetStrength = 0;
                var targetAlteration = 0;
                var targetConjuration = 0;
                var targetDivination = 0;
                var targetDodge = 0;
                var targetFaith = 0;
                var targetIntimidation = 0;
                var targetKinesis = 0;
                var targetManeuver = 0;
                var targetMeleeWeapons = 0;
                var targetPrecognition = 0;
                var targetStealth = 0;
                var targetTaunt = 0;
                var targetTrick = 0;
                var targetUnarmedCombat = 0;
                var targetWillpower = 0;
        
        
                // Exit if no target or get target data
                if (event.shiftKey) {
                    if (Array.from(game.user.targets).length === 0) {
                        var needTargetData = {
                            user: game.user._id,
                            speaker: ChatMessage.getSpeaker(),
                            owner: this.actor,
                        };
        
                        var templateData = {
                            message: game.i18n.localize('torgeternity.chatText.check.needTarget'),
                            actorPic: this.actor.img
                        };
        
                        const templatePromise = renderTemplate("./systems/torgeternity/templates/partials/skill-error-card.hbs", templateData);
        
                        templatePromise.then(content => {
                            needTargetData.content = content;
                            ChatMessage.create(needTargetData);
                        })
        
                        return;
                    } else {
                        var target = Array.from(game.user.targets)[0];
                        var targetType = target.actor.system.type;
                        var targetData = target.actor.system
        
        
                        // Set target size bonus
                        if (target.actor.system.details.sizeBonus === "tiny") {
                            sizeModifier = -6;
                        } else if (target.actor.system.details.sizeBonus === "verySmall") {
                            sizeModifier = -4;
                        } else if (target.actor.system.details.sizeBonus === "small") {
                            sizeModifier = -2;
                        } else if (target.actor.system.details.sizeBonus === "large") {
                            sizeModifier = 2;
                        } else if (target.actor.system.details.sizeBonus === "veryLarge") {
                            sizeModifier = 4;
                        } else {
                            sizeModifier = 0;
                        }
        
                        vulnerableModifier = target.actor.system.vulnerableModifier;
                        targetToughness = targetData.other.toughness;
                        targetArmor = targetData.other.armor;
                        
                        targetCharisma = targetData.attributes.charisma;
                        targetDexterity = targetData.attributes.dexterity;
                        targetMind = targetData.attributes.mind;
                        targetSpirit = targetData.attributes.spirit;
                        targetStrength = targetData.attributes.strength;
        
                        // Set defensive values that are already calculated
                        targetDodge = targetData.dodgeDefense;
                        targetIntimidation = targetData.intimidationDefense;
                        targetTaunt = targetData.tauntDefense;
                        targetTrick = targetData.trickDefense;
                        targetUnarmedCombat = targetData.unarmedCombatDefense;
                        targetMeleeWeapons = targetData.meleeWeaponsDefense;
                        targetManeuver = targetData.maneuverDefense;
        
                        // Set other defensive values
                        if (targetData.skills.alteration.value === null) {
                            targetAlteration = targetMind;
                        } else {
                            targetAlteration = targetData.skills.alteration.value;
                        }
        
                        if (targetData.skills.conjuration.value === null) {
                            targetConjuration = targetSpirit;
                        } else {
                            targetConjuration = targetData.skills.conjuration.value;
                        }
        
                        if (targetData.skills.divination.value === null) {
                            targetDivination = targetMind;
                        } else {
                            targetDivination = targetData.skills.divination.value;
                        }
        
                        if (targetData.skills.faith.value === null) {
                            targetFaith = targetSpirit;
                        } else {
                            targetFaith = targetData.skills.faith.value;
                        }
        
                        if (targetData.skills.kinesis.value === null) {
                            targetKinesis = targetSpirit;
                        } else {
                            targetKinesis = targetData.skills.kinesis.value;
                        }
        
                        if (targetData.skills.precognition.value === null) {
                            targetPrecognition = targetMind;
                        } else {
                            targetPrecognition = targetData.skills.precognition.value;
                        }
        
                        if (targetData.skills.stealth.value === null) {
                            targetStealth = targetDexterity;
                        } else {
                            targetStealth = targetData.skills.stealth.value;
                        }
        
                        if (targetData.skills.willpower.value === null) {
                            targetWillpower = targetSpirit;
                        } else {
                            targetWillpower = targetData.skills.willpower.value;
                        }
        
                    }
                };
                let test = {
                    testType: "power",
                    actor: this.actor,
                    actorPic: this.actor.img,
                    actorType: this.actor.system.type,
                    item: item,
                    skillName: skillData.name,
                    skillBaseAttribute: skillData.baseattribute,
                    skillAdds: skillData.adds,
                    skillValue: skillData.value,
                    difficulty: powerData.dn,
                    modifier: powerData.modifier,
                    powerName: item.system.name,
                    powerAttack: powerData.isAttack,
                    damage: powerData.damage,
                    ap: powerData.ap,
                    DN: 0,
                    unskilledUse: event.currentTarget.dataset.unskilleduse,
                    strengthValue: this.actor.system.attributes.strength,
                    charismaValue: this.actor.system.attributes.charisma,
                    dexterityValue: this.actor.system.attributes.dexterity,
                    mindValue: this.actor.system.attributes.mind,
                    spiritValue: this.actor.system.attributes.spirit,
                    targetToughness: targetToughness,
                    targetArmor: targetArmor,
                    targetType: targetType,
                    woundModifier: parseInt(-(this.actor.system.wounds.value)),
                    stymiedModifier: parseInt(this.actor.system.stymiedModifier),
                    darknessModifier: parseInt(this.actor.system.darknessModifier),
                    sizeModifier: 0,                                                       //Size modifiers not applied to Powers tests; must be manually applied
                    vulnerableModifier: vulnerableModifier,
                    vitalAreaDamageModifier: 0,
                    type: event.currentTarget.dataset.testtype,
                    possibilityTotal: 0,
                    upTotal: 0,
                    heroTotal: 0,
                    dramaTotal: 0,
                    cardsPlayed: 0,
                    sizeModifier: 0,
                    vulnerableModifier: 0,
                    disfavored: false,
        
                    targetCharisma: targetCharisma,
                    targetDexterity: targetDexterity,
                    targetMind: targetMind,
                    targetSpirit: targetSpirit,
                    targetStrength: targetStrength,
                    targetAlteration: targetAlteration,
                    targetConjuration: targetConjuration,
                    targetDivination: targetDivination,
                    targetDodge: targetDodge,
                    targetFaith: targetFaith,
                    targetIntimidation: targetIntimidation,
                    targetKinesis: targetKinesis,
                    targetManeuver: targetManeuver,
                    targetMeleeWeapons: targetMeleeWeapons,
                    targetPrecognition: targetPrecognition,
                    targetStealth: targetStealth,
                    targetTaunt: targetTaunt,
                    targetTrick: targetTrick,
                    targetUnarmedCombat: targetUnarmedCombat,
                    targetWillpower: targetWillpower,
        
                    dnVeryEasy: false,
                    dnEasy: false,
                    dnStandard: false,
                    dnChallenging: false,
                    dnHard: false,
                    dnVeryHard: false,
                    dnHeroic: false,
                    dnNearImpossible: false,
                    dnTargetCharisma: false,
                    dnTargetDexterity: false,
                    dnTargetMind: false,
                    dnTargetSpirit: false,
                    dnTargetStrength: false,
                    dnTargetAlteration: false,
                    dnTargetConjuration: false,
                    dnTargetDivination: false,
                    dnTargetDodge: false,
                    dnTargetFaith: false,
                    dnTargetIntimidation: false,
                    dnTargetKinesis: false,
                    dnTargetManeuver: false,
                    dnTargetMeleeWeapons: false,
                    dnTargetPrecognition: false,
                    dnTargetStealth: false,
                    dnTargetTaunt: false,
                    dnTargetTrick: false,
                    dnTargetUnarmedCombat: false,
                    dnTargetWillpower: false
        
                }
        
                // Set dn for selector
                switch(test.difficulty) {
                    case "veryEasy":
                        test.dnVeryEasy = true;
                        break;
                    case "easy":
                        test.dnEasy = true;
                        break;
                    case "standard":
                        test.dnStandard = true;
                        break;
                    case "challenging":
                        test.dnChallenging = true;
                        break;
                    case "hard":
                        test.dnHard = true;
                        break;
                    case "veryHard":
                        test.dnVeryHard = true;
                        break;
                    case "heroic":
                        test.dnHeroic = true;
                        break;
                    case "nearImpossible":
                        test.dnNearImpossible = true;
                        break;
                    case "targetCharisma":
                        test.dnTargetCharisma = true;
                        break;
                    case "targetDexterity":
                        test.dnTargetDexterity = true;
                        break;
                    case "targetMind":
                        test.dnTargetMind = true;
                        break;
                    case "targetSpirit":
                        test.dnTargetSpirit = true;
                        break;
                    case "targetStrength":
                        test.dnTargetStrength = true;
                        break;
                    case "targetAlteration":
                        test.dnTargetAlteration = true;
                        break;
                    case "targetConjuration":
                        test.dnTargetConjuration = true;
                        break;
                    case "targetDivination":
                        test.dnTargetDivination = true;
                        break;
                    case "targetDodge":
                        test.dnTargetDodge = true;
                        break;
                    case "targetFaith":
                        test.dnTargetFaith = true;
                        break;
                    case "targetIntimidation":
                        test.dnTargetIntimidation = true;
                        break;
                    case "targetKinesis":
                        test.dnTargetKinesis = true;
                        break;
                    case "targetManeuver":
                        test.dnTargetManeuver = true;
                        break;
                    case "targetMeleeWeapons":
                        test.dnTargetMeleeWeapons = true;
                        break;
                    case "targetPrecognition":
                        test.dnTargetPrecognition = true;
                        break;
                    case "targetStealth":
                        test.dnTargetStealth = true;
                        break;
                    case "targetTaunt":
                        test.dnTargetTaunt = true;
                        break;
                    case "targetTrick":
                        test.dnTargetTrick = true;
                        break;
                    case "targetUnarmedCombat":
                        test.dnTargetUnarmedCombat = true;
                        break;
                    case "targetWillpower":
                        test.dnTargetWillpower = true;
                        break;
                    default:
                        test.dnTargetStandard = true;
                }
        
                if (event.shiftKey) {
                    let testDialog = new powerDialog(test);
                    testDialog.render(true);
                } else {
                    torgchecks.powerRoll(test);
                }
            */
  }

  _onCreateSa(event) {
    event.preventDefault();
    let itemData = {
      name: game.i18n.localize("torgeternity.itemSheetDescriptions.specialability"),
      type: "specialability",
    };
    return this.actor.createEmbeddedDocuments("Item", [itemData], {
      renderSheet: true,
    });
  }

  _onCreateSaR(event) {
    event.preventDefault();
    let itemData = {
      name: game.i18n.localize("torgeternity.itemSheetDescriptions.specialabilityRollable"),
      type: "specialability-rollable",
    };
    return this.actor.createEmbeddedDocuments("Item", [itemData], {
      renderSheet: true,
    });
  }

  _onItemEquip(event) {
    const itemID = event.currentTarget.closest(".item").getAttribute("data-item-id");
    const item = this.actor.items.get(itemID);
    let doCheckOtherItems = torgeternityItem.toggleEquipState(item, this.actor);

    // for armor and shield, ensure there's only one equipped
    if (doCheckOtherItems && item.system && item.system.hasOwnProperty("equipped")) {
      let actor = this.actor;
      actor.items.forEach(function (otherItem, key) {
        if (otherItem._id !== item._id && otherItem.system.equipped && otherItem.type === item.type) {
          torgeternityItem.toggleEquipState(otherItem, actor);
        }
      });
    }
  }

  //------CARDS----

  //---general animations
  _displayCard(hand) {
    for (let i = 0; i < hand.children.length; i++) {
      if (!hand.children[i].classList.contains("focusedCard")) {
        hand.children[i].style.transformOrigin = "50% 150%";
        hand.children[i].style.transform = `rotateZ(${i * 10}deg)`;
      }
    }
    hand.style.transform = `rotateZ(${hand.children.length * -5}deg)`;
  }

  _onCardReserve(event) {
    const cardID = event.currentTarget.closest(".card").getAttribute("data-item-id");
    const card = this.actor.items.get(cardID);
    if (card.system.reserved === false) {
      card.system.reserved = true;
      card.update({
        "data.reserved": true,
      });
      game.socket.emit("system.torgeternity", {
        msg: "cardReserved",
        data: {
          player: game.user._id,
          card: card,
        },
      });
    } else {
      card.system.reserved = false;
      card.update({
        "data.reserved": false,
      });
      game.socket.emit("system.torgeternity", {
        msg: "cardReserved",
        data: {
          player: game.user._id,
          card: card,
        },
      });
    }
  }
  _onCardExchange(event) {
    /*
                let applyChanges = false;
                new Dialog({
                    title: "card exchange proposal",
                    content: "",
                    buttons: {
                        yes: {
                            icon: '<i class="fas fa-check"></i>',
                            label: "Yes",
                            callback: () => applyChanges = true
                        },
                        no: {
                            icon: '<i class="fas fa-times"></i>',
                            label: "No"
                        },
                    },
                    default: "yes",
                    close: html => {
                        if (applyChanges) {
                            const li = $(ev.currentTarget).parents(".item");
                            this.actor.deleteOwnedItem(li.data("itemId"));
                            li.slideUp(200, () => this.render(false));
                        }
                    }
                }).render(true);
        */
  }

  _onCardPlay(event) {
    const cardID = event.currentTarget.closest(".card").getAttribute("data-item-id");
    const card = this.actor.items.get(cardID);
    if (game.combat === null || card.type == "cosm") {
      card.roll();
      this.actor.deleteOwnedItem(cardID);
      game.socket.emit("system.torgeternity", {
        msg: "cardPlayed",
        data: {
          player: game.user._id,
          card: card,
        },
      });
    } else {
      if (!card.system.reserved) {
        ui.notifications.warn(game.i18n.localize("torgeternity.notifications.onlyReservedCard"));
      } else {
        card.roll();
        this.actor.deleteOwnedItem(cardID);
        game.socket.emit("system.torgeternity", {
          msg: "cardPlayed",
          data: {
            player: game.user._id,
            card: card,
          },
        });
      }
    }
  }
}

export function checkUnskilled(skillValue, skillName, actor) {
  if (skillValue === "-") {
    let cantRollData = {
      user: game.user._id,
      speaker: ChatMessage.getSpeaker(),
      owner: actor,
    };

    let templateData = {
      message: skillName + " " + game.i18n.localize("torgeternity.chatText.check.cantUseUntrained"),
      actorPic: actor.system.img,
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

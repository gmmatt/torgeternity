import { makeSkillFields } from "../shared.js";
import { torgeternity } from "../../config.js";

const fields = foundry.data.fields;
/**
 * class for shared actor data between Threats and Storm Knights
 */
export class CommonActorData extends foundry.abstract.TypeDataModel {
  /**
   *
   * @returns {object} Schema fragment for a Storm Knight or Threat
   */
  static defineSchema() {
    return {
      attributes: new fields.SchemaField({
        charisma: new fields.NumberField({ initial: 8, integer: true, nullable: false }),
        dexterity: new fields.NumberField({ initial: 8, integer: true, nullable: false }),
        mind: new fields.NumberField({ initial: 8, integer: true, nullable: false }),
        spirit: new fields.NumberField({ initial: 8, integer: true, nullable: false }),
        strength: new fields.NumberField({ initial: 8, integer: true, nullable: false }),
      }),
      other: new fields.SchemaField({
        cosm: new fields.StringField({
          initial: torgeternity.cosmTypes.none,
          choices: Object.values(torgeternity.cosmTypes),
          required: true,
        }),
        possibilities: new fields.NumberField({ initial: 3, integer: true, nullable: false }),
      }),
      shock: new fields.SchemaField({
        value: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
      }),
      skills: new fields.SchemaField({
        airVehicles: new fields.SchemaField(makeSkillFields(false, "dexterity", "other")),
        alteration: new fields.SchemaField(makeSkillFields(false, "mind", "other")),
        apportation: new fields.SchemaField(makeSkillFields(false, "spirit", "other")),
        beastRiding: new fields.SchemaField(makeSkillFields(true, "dexterity", "other")),
        computers: new fields.SchemaField(makeSkillFields(true, "mind", "other")),
        conjuration: new fields.SchemaField(makeSkillFields(false, "spirit", "other")),
        divination: new fields.SchemaField(makeSkillFields(false, "mind", "other")),
        dodge: new fields.SchemaField(makeSkillFields(true, "dexterity", "other")),
        energyWeapons: new fields.SchemaField(makeSkillFields(true, "dexterity", "combat")),
        evidenceAnalysis: new fields.SchemaField(makeSkillFields(true, "mind", "other")),
        faith: new fields.SchemaField(makeSkillFields(true, "spirit", "other")),
        find: new fields.SchemaField(makeSkillFields(true, "mind", "other")),
        fireCombat: new fields.SchemaField(makeSkillFields(true, "dexterity", "combat")),
        firstAid: new fields.SchemaField(makeSkillFields(true, "mind", "other")),
        heavyWeapons: new fields.SchemaField(makeSkillFields(true, "dexterity", "combat")),
        intimidation: new fields.SchemaField(makeSkillFields(true, "spirit", "interaction")),
        kinesis: new fields.SchemaField(makeSkillFields(false, "spirit", "other")),
        landVehicles: new fields.SchemaField(makeSkillFields(true, "dexterity", "other")),
        language: new fields.SchemaField(makeSkillFields(false, "mind", "other")),
        lockpicking: new fields.SchemaField(makeSkillFields(false, "dexterity", "other")),
        maneuver: new fields.SchemaField(makeSkillFields(true, "dexterity", "interaction")),
        medicine: new fields.SchemaField(makeSkillFields(false, "mind", "other")),
        meleeWeapons: new fields.SchemaField(makeSkillFields(true, "dexterity", "combat")),
        missileWeapons: new fields.SchemaField(makeSkillFields(true, "dexterity", "combat")),
        persuasion: new fields.SchemaField(makeSkillFields(true, "charisma", "other")),
        precognition: new fields.SchemaField(makeSkillFields(false, "mind", "other")),
        profession: new fields.SchemaField(makeSkillFields(true, "mind", "other")),
        reality: new fields.SchemaField(makeSkillFields(false, "spirit", "other")),
        scholar: new fields.SchemaField(makeSkillFields(true, "mind", "other")),
        science: new fields.SchemaField(makeSkillFields(true, "mind", "other")),
        stealth: new fields.SchemaField(makeSkillFields(true, "dexterity", "other")),
        streetwise: new fields.SchemaField(makeSkillFields(true, "charisma", "other")),
        survival: new fields.SchemaField(makeSkillFields(true, "mind", "other")),
        taunt: new fields.SchemaField(makeSkillFields(true, "charisma", "interaction")),
        telepathy: new fields.SchemaField(makeSkillFields(false, "charisma", "other")),
        tracking: new fields.SchemaField(makeSkillFields(true, "mind", "other")),
        trick: new fields.SchemaField(makeSkillFields(true, "mind", "interaction")),
        unarmedCombat: new fields.SchemaField(makeSkillFields(true, "dexterity", "combat")),
        waterVehicles: new fields.SchemaField(makeSkillFields(true, "dexterity", "other")),
        willpower: new fields.SchemaField(makeSkillFields(true, "spirit", "other")),
      }),
      wounds: new fields.SchemaField({
        max: new fields.NumberField({ initial: 3, integer: true }),
        value: new fields.NumberField({ initial: 0, integer: true }),
      }),
      editstate: new fields.BooleanField({ initial: true }),
    };
  }

  /**
   * Prepare base data for Storm Knights and Threats
   */
  prepareBaseData() {
    super.prepareBaseData();
    this.other.armor = 0;
  }

  /**
   * Prepare derived data for Storm Knights and Threats
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    // Derive Skill values for Storm Knights and Threats
    for (const skill of Object.values(this.skills)) {
      if (skill.unskilledUse === 1 || skill.adds) {
        skill.value = this.attributes[skill.baseAttribute] + skill.adds;
      } else {
        skill.value = "";
      }
    }
    this.other.move = this.attributes.dexterity;
    this.other.run = this.attributes.dexterity * 3;
    this.shock.max = this.attributes.spirit;
  }
}

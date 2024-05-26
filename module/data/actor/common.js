import { makeSkillFields } from '../shared.js';
import { torgeternity } from '../../config.js';

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
        charisma: new fields.SchemaField({
          base: new fields.NumberField({ initial: 8, integer: true, nullable: false }), // base: The base attribute what is raised with ep and such
        }),
        dexterity: new fields.SchemaField({
          base: new fields.NumberField({ initial: 8, integer: true, nullable: false }),
        }),
        mind: new fields.SchemaField({
          base: new fields.NumberField({ initial: 8, integer: true, nullable: false }),
        }),
        spirit: new fields.SchemaField({
          base: new fields.NumberField({ initial: 8, integer: true, nullable: false }),
        }),
        strength: new fields.SchemaField({
          base: new fields.NumberField({ initial: 8, integer: true, nullable: false }),
        }),
      }),
      other: new fields.SchemaField({
        cosm: new fields.StringField({
          initial: 'none',
          choices: Object.keys(torgeternity.cosmTypes),
          required: true,
        }),
        possibilities: new fields.NumberField({ initial: 3, integer: true, nullable: false }),
      }),
      shock: new fields.SchemaField({
        max: new fields.NumberField({ initial: 8, integer: true }),
        value: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
      }),
      skills: new fields.SchemaField({
        airVehicles: new fields.SchemaField(makeSkillFields(false, 'dexterity', 'other')),
        alteration: new fields.SchemaField(makeSkillFields(false, 'mind', 'other')),
        apportation: new fields.SchemaField(makeSkillFields(false, 'spirit', 'other')),
        beastRiding: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'other')),
        computers: new fields.SchemaField(makeSkillFields(true, 'mind', 'other')),
        conjuration: new fields.SchemaField(makeSkillFields(false, 'spirit', 'other')),
        divination: new fields.SchemaField(makeSkillFields(false, 'mind', 'other')),
        dodge: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'other')),
        energyWeapons: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'combat')),
        evidenceAnalysis: new fields.SchemaField(makeSkillFields(true, 'mind', 'other')),
        faith: new fields.SchemaField(makeSkillFields(true, 'spirit', 'other')),
        find: new fields.SchemaField(makeSkillFields(true, 'mind', 'other')),
        fireCombat: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'combat')),
        firstAid: new fields.SchemaField(makeSkillFields(true, 'mind', 'other')),
        heavyWeapons: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'combat')),
        intimidation: new fields.SchemaField(makeSkillFields(true, 'spirit', 'interaction')),
        kinesis: new fields.SchemaField(makeSkillFields(false, 'spirit', 'other')),
        landVehicles: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'other')),
        language: new fields.SchemaField(makeSkillFields(false, 'mind', 'other')),
        lockpicking: new fields.SchemaField(makeSkillFields(false, 'dexterity', 'other')),
        maneuver: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'interaction')),
        medicine: new fields.SchemaField(makeSkillFields(false, 'mind', 'other')),
        meleeWeapons: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'combat')),
        missileWeapons: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'combat')),
        persuasion: new fields.SchemaField(makeSkillFields(true, 'charisma', 'other')),
        precognition: new fields.SchemaField(makeSkillFields(false, 'mind', 'other')),
        profession: new fields.SchemaField(makeSkillFields(true, 'mind', 'other')),
        reality: new fields.SchemaField(makeSkillFields(false, 'spirit', 'other')),
        scholar: new fields.SchemaField(makeSkillFields(true, 'mind', 'other')),
        science: new fields.SchemaField(makeSkillFields(true, 'mind', 'other')),
        stealth: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'other')),
        streetwise: new fields.SchemaField(makeSkillFields(true, 'charisma', 'other')),
        survival: new fields.SchemaField(makeSkillFields(true, 'mind', 'other')),
        taunt: new fields.SchemaField(makeSkillFields(true, 'charisma', 'interaction')),
        telepathy: new fields.SchemaField(makeSkillFields(false, 'charisma', 'other')),
        tracking: new fields.SchemaField(makeSkillFields(true, 'mind', 'other')),
        trick: new fields.SchemaField(makeSkillFields(true, 'mind', 'interaction')),
        unarmedCombat: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'combat')),
        waterVehicles: new fields.SchemaField(makeSkillFields(true, 'dexterity', 'other')),
        willpower: new fields.SchemaField(makeSkillFields(true, 'spirit', 'other')),
      }),
      wounds: new fields.SchemaField({
        max: new fields.NumberField({ initial: 3, integer: true }),
        value: new fields.NumberField({ initial: 0, integer: true }),
      }),
      editstate: new fields.BooleanField({ initial: true }),
    };
  }

  /**
   *
   * @param {object} data the data object to migrate
   */
  static migrateData(data) {
    super.migrateData(data);
    if (data?.other && Object.hasOwn(data?.other, 'cosm')) {
      data.other.cosm = Object.keys(torgeternity.cosmTypes).includes(data.other.cosm)
        ? data.other.cosm
        : 'none';
    }

    for (const attribute of Object.keys(data.attributes)) {
      if (typeof data?.attributes?.[attribute] === 'number') {
        data.attributes[attribute] = { base: data.attributes[attribute] };
      }
    }

    for (const skill of Object.values(data.skills)) {
      if (typeof skill.adds !== 'number') {
        let skillAdd = parseInt(skill.adds);
        skillAdd = isNan(skillAdd) ? 0 : skillAdd;
        skill.adds = skillAdd;
      }
    }
  }

  /**
   * Prepare base data for Storm Knights and Threats
   */
  prepareBaseData() {
    super.prepareBaseData();
    // register value of attributes so we can work further with this
    for (const attribute of Object.keys(this.attributes)) {
      this.attributes[attribute].value = this.attributes[attribute].base;
    }

    this.shock.max = this.attributes.spirit.value;
    this.other.toughness = this.attributes.strength.value;
  }

  /**
   * Prepare derived data for Storm Knights and Threats
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.other.move = this.attributes.dexterity.value;
    this.other.run = this.attributes.dexterity.value * 3;
    this.other.toughness += this.other.armor;
    // Derive Skill values for Storm Knights and Threats
    for (const skill of Object.values(this.skills)) {
      const trained = skill.unskilledUse === 1 || skill.adds;
      skill.value = trained ? this.attributes[skill.baseAttribute].value + skill.adds : '';
    }
  }
}

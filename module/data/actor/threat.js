import { CommonActorData } from './common.js';
import { torgeternity } from '../../config.js';

const fields = foundry.data.fields;

/**
 * class for actor data specific to Threats
 */
export class ThreatData extends CommonActorData {
  /**
   *
   * @returns {object} Schema for a Threat
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      details: new fields.SchemaField({
        description: new fields.HTMLField({ initial: '', textSearch: true }),
        sizeBonus: new fields.StringField({
          initial: 'normal',
          choices: Object.keys(torgeternity.sizes),
          required: true,
        }),
      }),
    };
  }

  /**
   *
   * @param {object} data the data object to migrate
   */
  static migrateData(data) {
    super.migrateData(data);
    data.details.sizeBonus = Object.keys(torgeternity.sizes).includes(data.details.sizeBonus)
      ? data.details.sizeBonus
      : 'normal';
    for (const skill of Object.values(data.skills)) {
      skill.adds = parseInt(skill.adds) || 0;
      if (skill.value) {
        skill.adds = parseInt(skill.value) - data.attributes[skill.baseAttribute];
      }
    }
  }

  /**
   * Prepare base data for Threats
   */
  prepareBaseData() {
    super.prepareBaseData();
  }

  /**
   * Prepare derived data for Threats
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    for (const skill of Object.values(this.skills)) {
      skill.isThreatSkill = skill.isThreatSkill || !!skill.adds;
    }
  }
}

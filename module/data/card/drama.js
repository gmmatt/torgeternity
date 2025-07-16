import { torgeternity } from '../../config.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class DramaCardData extends foundry.abstract.TypeDataModel {
  /**
   *
   * @returns {object} Schema fragment for a Storm Knight or Threat
   */
  static defineSchema() {
    return {
      approvedActions: new fields.StringField({ initial: '' }),
      cosm: new fields.StringField({ initial: 'none', choices: torgeternity.cosmTypes, textSearch: true, required: true, blank: false, nullable: false }),
      dsrLine: new fields.StringField({ initial: '' }),
      heroesConditionsDramatic: new fields.StringField({ initial: '' }),
      heroesConditionsStandard: new fields.StringField({ initial: '' }),
      heroesFirstDramatic: new fields.BooleanField({ initial: true }),
      heroesFirstStandard: new fields.BooleanField({ initial: true }),
      number: new fields.NumberField({ initial: 1, integer: true }),
      rule: new fields.StringField({ initial: '' }),
      villainsConditionsDramatic: new fields.StringField({ initial: '' }),
      villainsConditionsStandard: new fields.StringField({ initial: '' }),
    };
  }

  /**
   * @inheritdoc
   */
  prepareBaseData() {
    super.prepareBaseData();
  }

  /**
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
  }
}

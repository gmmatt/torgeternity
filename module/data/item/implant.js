import { GeneralItemData } from './general.js';
import { torgeternity } from '../../config.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class ImplantItemData extends GeneralItemData {
  /**
   * @returns {object} Schema fragment for an implant
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      notes: new fields.StringField({ initial: '' }),
      implantType: new fields.StringField({
        initial: game.i18n.localize('torgeternity.perkTypes.cyberware'),
      }),
      magnitude: new fields.StringField({
        initial: 'ones',
        choices: Object.keys(torgeternity.magnitudes),
        required: true,
      }),
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

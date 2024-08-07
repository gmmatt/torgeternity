import { torgeternity } from '../../config.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class GeneralItemData extends foundry.abstract.TypeDataModel {
  /**
   *
   * @returns {object} Schema fragment for an item
   */
  static defineSchema() {
    return {
      cosm: new fields.StringField({ initial: '' }),
      description: new fields.HTMLField({ initial: '' }),
      price: new fields.StringField({ initial: '' }),
      techlevel: new fields.NumberField({ initial: 1, integer: true }),
      value: new fields.NumberField({ initial: 0, integer: true }),
      secondaryAxiom: new fields.SchemaField({
        selected: new fields.StringField({ initial: 'none' }),
        value: new fields.NumberField({ initial: null, integer: true }),
      }),
    };
  }

  /**
   * @inheritdoc
   * @param {object} data delivered data from the constructor
   */
  static migrateData(data) {
    super.migrateData(data);
    const translatedCosms = Object.keys(torgeternity.cosmTypes).reduce((acc, key) => {
      acc[key] = game.i18n.localize(torgeternity.cosmTypes[key]);
      return acc;
    }, {});

    if (data?.cosm && Object.values(translatedCosms).includes(data.cosm)) {
      for (const [key, value] of Object.entries(translatedCosms)) {
        if (value === data.cosm) {
          data.cosm = key;
          break;
        }
      }
    }
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

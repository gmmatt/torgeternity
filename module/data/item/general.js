import { torgeternity } from '../../config.js';
import { getTorgValue } from '../../torgchecks.js';
import { migrateCosm } from '../shared.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class GeneralItemData extends foundry.abstract.TypeDataModel {
  /**
   *
   * @returns {object} Schema fragment for an item
   */
  static defineSchema(itemType) {
    return {
      cosm: new fields.StringField({ initial: 'none', choices: torgeternity.cosmTypes, textSearch: true, required: true, blank: false, nullable: false }),
      description: new fields.HTMLField({ initial: '' }),
      price: new fields.StringField({ initial: '' }),
      techlevel: new fields.NumberField({ initial: 1, integer: true }),
      value: new fields.NumberField({ initial: 0, integer: true }),
      secondaryAxiom: new fields.SchemaField({
        selected: new fields.StringField({ initial: 'none' }),
        value: new fields.NumberField({ initial: null, integer: true }),
      }),
      traits: newTraitsField(itemType),
    };
  }

  /**
   * @inheritdoc
   * @param {object} data delivered data from the constructor
   */
  static migrateData(data) {
    data.cosm = migrateCosm(data.cosm);
  }

  /**
   * @inheritdoc
   */
  prepareBaseData() {
    super.prepareBaseData();
    this.value = this.price && !isNaN(this.price) ? getTorgValue(parseInt(this.price)) : null;
  }

  /**
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
  }
}


export function newTraitsField(itemType) {
  return new fields.SetField(
    new fields.StringField({
      blank: false,
      choices: itemType ? CONFIG.torgeternity.validItemTraits[itemType] : undefined,
      textSearch: true,
      trim: true,
    }),
    {
      nullable: false,
      required: true,
      label: 'torgeternity.fieldLabels.itemTraits.label',
      hint: 'torgeternity.fieldLabels.itemTraits.hint',
    });
}
import { getTorgValue } from '../../torgchecks.js';
import { BaseItemData } from './baseItemData.js'
import { calcPriceValue } from '../shared.js';

const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class GeneralItemData extends BaseItemData {
  /**
   *
   * @returns {object} Schema fragment for an item
   */
  static defineSchema(itemType) {
    return {
      ...super.defineSchema(itemType),
      price: new fields.StringField({ initial: '', nullable: false }),
      //techlevel: new fields.NumberField({ initial: 1, integer: true }),
      value: new fields.NumberField({ initial: 0, integer: true }),
      secondaryAxiom: new fields.StringField({ initial: 'none' }),
    };
  }

  static migrateData(source) {
    if (Object.hasOwn(source, 'techlevel')) {
      if (!source.axioms) source.axioms = {};
      source.axioms.tech = source.techlevel;
      delete source.techlevel;
    }

    if (source.secondaryAxiom?.selected) {
      if (source.secondaryAxiom.selected !== 'none') {
        if (!source.axioms) source.axioms = {};
        source.axioms[source.secondaryAxiom] = source.secondaryAxiom.value;
      }
      source.secondaryAxiom = source.secondaryAxiom.selected;
    }
    return super.migrateData(source);
  }

  /**
   * @inheritdoc
   */
  prepareBaseData() {
    super.prepareBaseData();
    this.value = calcPriceValue(this.price);
  }
}
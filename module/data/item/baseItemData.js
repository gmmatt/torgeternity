import { migrateCosm, makeAxiomsField } from '../shared.js';
import { torgeternity } from '../../config.js';

const fields = foundry.data.fields;

export class BaseItemData extends foundry.abstract.TypeDataModel {
  /**
 *
 * @returns {object} Schema fragment for an item
 */
  static defineSchema(itemType) {
    return {
      cosm: new fields.StringField({ initial: 'none', choices: torgeternity.cosmTypes, textSearch: true, required: true, blank: false, nullable: false }),
      description: new fields.HTMLField({ initial: '', textSearch: true }),
      traits: newTraitsField(itemType),
      axioms: makeAxiomsField()
    };
  }
  /**
   * @inheritdoc
   * @param {object} data delivered data from the constructor
   */
  static migrateData(data) {
    data.cosm = migrateCosm(data.cosm);
    if (data.traits?.length) {
      // Remove invalid traits
      const badTraits = data.traits.filter(t => !Object.hasOwn(CONFIG.torgeternity.allItemTraits, t));
      data.traits = data.traits.filter(t => Object.hasOwn(CONFIG.torgeternity.allItemTraits, t));
      if (badTraits.length) console.error(`Unsupported traits discarded: ${badTraits}`)
    }
    return super.migrateData(data);
  }
}

export function newTraitsField(itemType) {
  return new fields.SetField(
    new fields.StringField({
      // StringField options
      blank: false,
      choices: (itemType && torgeternity.specificItemTraits[itemType]) ?? CONFIG.torgeternity.allItemTraits,
      textSearch: true,
      trim: true,
    }),
    { // SetField options
      nullable: false,
      required: true,
      label: 'torgeternity.fieldLabels.itemTraits.label',
      hint: 'torgeternity.fieldLabels.itemTraits.hint',
    });
}
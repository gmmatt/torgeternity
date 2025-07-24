import { torgeternity } from '../../config.js';
import { migrateCosm } from '../shared.js';
import { newTraitsField } from './general.js';

const fields = foundry.data.fields;

/**
 * @inheritdoc
 */
export class PerkItemData extends foundry.abstract.TypeDataModel {
  /**
   * @returns {object} Schema fragment for a perk
   */
  static defineSchema() {
    return {
      category: new fields.StringField({ initial: '', textSearch: true }),
      cosm: new fields.StringField({ initial: 'none', choices: torgeternity.cosmTypes, textSearch: true, required: true, blank: false, nullable: false }),
      description: new fields.HTMLField({ initial: '' }),
      prerequisites: new fields.StringField({ initial: '' }),
      generalContradiction: new fields.BooleanField({ initial: false }),
      traits: newTraitsField('perk'),
      pulpPowers: new fields.SchemaField({
        enhancement01: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement02: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement03: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement04: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement05: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement06: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement07: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement08: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement09: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement10: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement11: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement12: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement13: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement14: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancement15: new fields.SchemaField({
          description: new fields.StringField({ initial: '' }),
          taken: new fields.BooleanField({ initial: false }),
          title: new fields.StringField({ initial: '' }),
        }),
        enhancementNumber: new fields.NumberField({ initial: 0, integer: true }),
        limitation01: new fields.StringField({ initial: '' }),
        limitation02: new fields.StringField({ initial: '' }),
        limitation03: new fields.StringField({ initial: '' }),
        limitation04: new fields.StringField({ initial: '' }),
        limitation05: new fields.StringField({ initial: '' }),
        limitation06: new fields.StringField({ initial: '' }),
        limitation07: new fields.StringField({ initial: '' }),
        limitation08: new fields.StringField({ initial: '' }),
        limitation09: new fields.StringField({ initial: '' }),
        limitation10: new fields.StringField({ initial: '' }),
        limitationNumber: new fields.NumberField({ initial: 0, integer: true }),
      }),
      timestaken: new fields.StringField({ initial: '' }),
      secondaryAxiom: new fields.SchemaField({
        selected: new fields.StringField({ initial: 'none' }),
        value: new fields.NumberField({ initial: null, integer: true }),
      }),
      transferenceID: new fields.DocumentIdField({ initial: null }), // necessary for saving perks data in race items
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
  }

  /**
   * @inheritdoc
   */
  prepareDerivedData() {
    super.prepareDerivedData();
  }
}

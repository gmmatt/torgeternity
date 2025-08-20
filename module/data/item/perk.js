import { BaseItemData } from './baseItemData.js';

const fields = foundry.data.fields;

/**
 * @inheritdoc
 */
export class PerkItemData extends BaseItemData {
  /**
   * @returns {object} Schema fragment for a perk
   */
  static defineSchema() {
    return {
      ...super.defineSchema('perk'),
      category: new fields.StringField({ initial: '', choices: CONFIG.torgeternity.perkTypes, textSearch: true }),
      prerequisites: new fields.StringField({ initial: '' }),
      generalContradiction: new fields.BooleanField({ initial: false }),
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
      secondaryAxiom: new fields.StringField({ initial: 'none' }),
      transferenceID: new fields.DocumentIdField({ initial: null }), // necessary for saving perks data in race items
    };
  }

  static migrateData(source) {
    if (source.secondaryAxiom?.selected) {
      if (source.secondaryAxiom.selected !== 'none') {
        if (!source.axioms) source.axioms = {};
        source.axioms[source.secondaryAxiom.selected] = source.secondaryAxiom.value;
      }
      source.secondaryAxiom = source.secondaryAxiom.selected;
    }
    if (!CONFIG.torgeternity.perkTypes[source.category]) {
      source.category = source.category.toLowerCase();
    }
    return super.migrateData(source);
  }
}

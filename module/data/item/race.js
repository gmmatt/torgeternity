import { torgeternity } from '../../config.js';
import { PerkItemData } from './perk.js';
import { CustomAttackItemData } from './customAttack.js';

/**
 * @inheritdoc
 */
export class RaceItemData extends foundry.abstract.TypeDataModel {
  /** @inheritdoc */
  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      name: new fields.StringField({ initial: '' }),
      description: new fields.StringField({ initial: '' }),
      attributeMaximum: new fields.SchemaField({
        charisma: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
        dexterity: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
        mind: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
        spirit: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
        strength: new fields.NumberField({ initial: 13, integer: true, nullable: false }),
      }),
      size: new fields.StringField({
        initial: 'normal',
        choices: Object.keys(torgeternity.sizes),
        required: true,
      }),
      perksData: new fields.SetField(new fields.TypeDataField({ document: PerkItemData })),
      customAttackData: new fields.SetField(
        new fields.TypeDataField({ document: CustomAttackItemData })
      ),
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

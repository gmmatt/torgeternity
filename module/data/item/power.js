const fields = foundry.data.fields;
/**
 * @inheritdoc
 */
export class PowerItemData extends foundry.abstract.TypeDataModel {
  /**
   * @inheritdoc
   */
  static defineSchema() {
    return {
      ap: new fields.NumberField({ initial: 0, integer: true }),
      applyArmor: new fields.BooleanField({ initial: true }),
      applySize: new fields.BooleanField({ initial: true }),
      axiom: new fields.NumberField({ initial: 0, integer: true }),
      castingtime: new fields.StringField({ initial: '' }),
      damage: new fields.NumberField({ initial: 0, integer: true }),
      description: new fields.HTMLField({ initial: '' }),
      dn: new fields.StringField({ initial: '' }),
      dnType: new fields.StringField({ initial: '' }),
      duration: new fields.StringField({ initial: '' }),
      good: new fields.StringField({ initial: '' }),
      isAttack: new fields.BooleanField({ initial: false }),
      modifier: new fields.StringField({ initial: '' }),
      outstanding: new fields.StringField({ initial: '' }),
      range: new fields.StringField({ initial: '' }),
      skill: new fields.StringField({ initial: '' }),
      skilllevel: new fields.StringField({ initial: '' }),
      targetDefense: new fields.StringField({ initial: '' }),
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

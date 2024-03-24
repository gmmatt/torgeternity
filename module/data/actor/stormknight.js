import { CommonActorData } from "./common.js";
import { torgeternity } from "../../config.js";
const fields = foundry.data.fields;

/**
 * class for actor data specific to Storm Knights
 */
export class StormKnightData extends CommonActorData {
  /**
   *
   * @returns {object} Schema for a Storm Knight
   */
  static defineSchema() {
    return {
      ...super.defineSchema(),
      axioms: new fields.SchemaField({
        magic: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        social: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        spirit: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        tech: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
      }),
      details: new fields.SchemaField({
        background: new fields.HTMLField({ initial: "", textSearch: true }),
        race: new fields.StringField({
          choices: Object.keys(torgeternity.races),
        }),
        sizeBonus: new fields.StringField({
          initial: "normal",
          choices: Object.keys(torgeternity.sizes),
          required: true,
        }),
      }),
      xp: new fields.SchemaField({
        earned: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        unspent: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
      }),
    };
  }

  /**
   *
   * @param {object} data the data object to migrate
   * @returns {object} the migrated data object
   */
  static migrateData(data) {
    super.migrateData(data);
    this.details.race = Object.keys(torgeternity.races).includes(this.details.race) ? this.details.race : "other";
    this.details.sizeBonus = Object.keys(torgeternity.sizes).includes(this.details.sizeBonus)
      ? this.details.sizeBonus
      : "normal";
    return data;
  }

  /**
   * Prepare base data for Storm Knights
   */
  prepareBaseData() {
    super.prepareBaseData();

    // Set axioms based on home reality
    this.axioms.magic = torgeternity.axiomByCosm[this.other.cosm]?.magic || this.axioms.magic;
    this.axioms.social = torgeternity.axiomByCosm[this.other.cosm]?.social || this.axioms.social;
    this.axioms.spirit = torgeternity.axiomByCosm[this.other.cosm]?.spirit || this.axioms.spirit;
    this.axioms.tech = torgeternity.axiomByCosm[this.other.cosm]?.tech || this.axioms.tech;

    // Set starting fatigue
    this.fatigue = 2;

    // Set clearance level
    if (this.xp.earned < 50) {
      this.details.clearance = "alpha";
    } else if (this.xp.earned < 200) {
      this.details.clearance = "beta";
    } else if (this.xp.earned < 500) {
      this.details.clearance = "gamma";
    } else if (this.xp.earned < 1000) {
      this.details.clearance = "delta";
    } else {
      this.details.clearance = "omega";
    }
  }

  /**
   * Prepare derived data for Storm Knights
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    this.other.toughness = this.attributes.strength + this.other.armor;
  }
}

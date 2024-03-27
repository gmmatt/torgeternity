import { torgeternity } from '../../config.js';
import { getTorgValue } from '../../torgchecks.js';

const fields = foundry.data.fields;
/**
 * class for shared actor data between Threats and Storm Knights
 */
export class VehicleData extends foundry.abstract.TypeDataModel {
  /**
   *
   * @returns {object} Schema fragment for a Storm Knight or Threat
   */
  static defineSchema() {
    return {
      details: new fields.SchemaField({
        sizeBonus: new fields.StringField({
          initial: 'normal',
          choices: Object.keys(torgeternity.sizes),
          required: true,
        }),
      }),
      armor: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
      axioms: new fields.SchemaField({
        magic: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        social: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        spirit: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        tech: new fields.NumberField({ initial: 10, integer: true, nullable: false }),
      }),
      description: new fields.HTMLField({ initial: '', textSearch: true }),
      maneuver: new fields.NumberField({ initial: -1, integer: true, nullable: false }),
      operator: new fields.SchemaField({
        name: new fields.StringField({ initial: '' }),
        skillValue: new fields.StringField({ initial: '' }),
      }),
      passengers: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
      price: new fields.SchemaField({
        dollars: new fields.NumberField({ initial: 100, integer: true, nullable: false }),
        magnitude: new fields.StringField({
          initial: 'ones',
          choices: Object.keys(torgeternity.magnitudes),
          required: true,
        }),
      }),
      topSpeed: new fields.SchemaField({
        kph: new fields.NumberField({ initial: 100, integer: true, nullable: false }),
      }),
      toughness: new fields.NumberField({ initial: 5, integer: true, nullable: false }),
      type: new fields.StringField({ initial: 'land' }),
      wounds: new fields.SchemaField({
        current: new fields.NumberField({ initial: 0, integer: true, nullable: false }),
        max: new fields.NumberField({ initial: 3, integer: true, nullable: false }),
      }),
    };
  }

  /**
   *
   * @param {object} data the data object to migrate
   */
  static migrateData(data) {
    super.migrateData(data);
    if (data?.details && Object.hasOwn(data?.details, 'sizeBonus')) {
      data.details.sizeBonus = Object.keys(torgeternity.sizes).includes(data.details.sizeBonus)
        ? data.details.sizeBonus
        : 'normal';
    }
    if (data?.price && Object.hasOwn(data?.price, 'magnitude')) {
      data.price.magnitude = Object.keys(torgeternity.magnitudes).includes(data.price.magnitude)
        ? data.price.magnitude
        : 'other';
    }
    if (data?.details && Object.hasOwn(data?.details, 'sizeBonus')) {
      data.details.sizeBonus = Object.keys(torgeternity.sizes).includes(data.details.sizeBonus)
        ? data.details.sizeBonus
        : 'normal';
    }
  }

  /**
   * Prepare base data for Storm Knights and Threats
   */
  prepareBaseData() {
    super.prepareBaseData();
  }

  /**
   * Prepare derived data for Storm Knights and Threats
   */
  prepareDerivedData() {
    super.prepareDerivedData();
    let convertedPrice = 0;
    switch (this.price.magnitude) {
      case 'billions':
        convertedPrice = this.price.dollars * 1000;
      case 'millions':
        convertedPrice = this.price.dollars * 1000;
      case 'thousands':
        convertedPrice = this.price.dollars * 1000;
      case 'ones':
      default:
        convertedPrice = this.price.dollars;
        break;
    }
    this.price.value = getTorgValue(convertedPrice);
    const speedValue = getTorgValue(this.topSpeed.kph) + 2;
    this.topSpeed.value = speedValue;
    let speedPenalty = 0;
    if (speedValue < 11) {
      speedPenalty = 0;
    } else if (speedValue < 15) {
      speedPenalty = -2;
    } else if (speedValue < 17) {
      speedPenalty = -4;
    } else {
      speedPenalty = -6;
    }
    this.topSpeed.penalty = speedPenalty;

    this.defense = parseInt(this.operator.skillValue + this.maneuver);
  }
}

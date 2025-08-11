import { PowerItemData } from './power.js';

/**
 * @inheritdoc
 */
export class MiracleItemData extends PowerItemData {
  static migrateData(source) {
    if (Object.hasOwn(source, 'axiom')) {
      if (!source.axioms) source.axioms = {};
      source.axioms.spirit = source.axiom;
      delete source.axiom;
    }
    return super.migrateData(source);
  }
}

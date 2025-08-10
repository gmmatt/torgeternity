import { PowerItemData } from './power.js';
/**
 * @inheritdoc
 */
export class PsionicpowerItemData extends PowerItemData {
  static migrateData(source) {
    if (Object.hasOwn(source, 'axiom')) {
      if (!source.axioms) source.axioms = {};
      source.axioms.social = source.axiom;
      delete source.axiom;
    }
    return super.migrateData(source);
  }
}

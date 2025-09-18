import { newTraitsField } from './item/baseItemData.js';

const fields = foundry.data.fields;

/**
 * Addtional fields for TorgEternity ActiveEffect
 * 
 * @param {Boolean} transferOnAttack Apply this effect to the target of the attack if the attack is successful.
 * @param {Boolean} transferOnOutcome Apply this effect to the target of the attack if the attack test has this specific outcome.
 * @param {SetField(StringField)} applyIfTrait Apply this effect to the item if the owning actor has one of these traits.
 * @param {SetField(StringField)} applyVsTrait Apply this effect to the item if the target has one of these traits.
 */
export class TorgActiveEffectData extends foundry.abstract.TypeDataModel {

  static defineSchema() {
    return {
      transferOnAttack: new fields.BooleanField({
        initial: false,
        label: 'torgeternity.activeEffect.transferOnAttack.label',
        hint: 'torgeternity.activeEffect.transferOnAttack.hint'
      }),
      transferOnOutcome: new fields.NumberField({
        choices: CONFIG.torgeternity.testOutcomeLabel,
        integer: true,
        nullable: true,
        label: 'torgeternity.activeEffect.testOutcome.label',
        hint: 'torgeternity.activeEffect.testOutcome.hint'
      }),
      applyIfAttackTrait: newTraitsField(undefined, 'torgeternity.activeEffect.applyIfAttackTrait.label', 'torgeternity.activeEffect.applyIfAttackTrait.hint'),
      applyIfDefendTrait: newTraitsField(undefined, 'torgeternity.activeEffect.applyIfDefendTrait.label', 'torgeternity.activeEffect.applyIfDefendTrait.hint'),
    }
  }
}
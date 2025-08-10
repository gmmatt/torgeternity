export default class TorgAxioms {
  constructor({ tech = 0, magic = 0, spirit = 0, society = 0 }) {
    this.tech = tech;
    this.magic = magic;
    this.spirit = spirit;
    this.society = society;
  }

  /**
   * Creates a new TorgAxioms which contains the higher value of each axiom.
   * 
   * @param {TorgAxioms} other 
   * @returns {TorgAxioms} a new instance containing the highest axiom of either `this` or `other`
   */
  highest(other) {
    return {
      tech: Math.max(this.tech, other.tech),
      magic: Math.max(this.magic, other.magic),
      spirit: Math.max(this.spirit, other.spirit),
      society: Math.max(this.society, other.society)
    }
  }

  /**
   * Does this TorgAxioms contain at least one field which is higher than in the supplied `other` TorgAxioms
   * 
   * @param {TorgAxioms} other 
   * @returns {Boolean} true if `this` contains a field which exceeds the corresponding field in `other`
   */
  isHigherThan(other) {
    return this.tech > other.tech ||
      this.magic > other.magic ||
      this.spirit > other.spirit ||
      this.society > other.society;
  }
}

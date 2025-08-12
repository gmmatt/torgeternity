const fields = foundry.data.fields;

export default class TorgeternityScene extends foundry.documents.Scene {

  async _preCreate(data, options, user) {
    const allowed = await super._preCreate(data, options, user);
    if (allowed === false) return false;

    if (!data.flags?.torgeternity) {
      this.updateSource({
        'flags.torgeternity.cosm': 'none',
        'flags.torgeternity.cosm2': 'none',
        'flags.torgeternity.zone': 'pure',
      })
    }
  }

  prepareDerivedData() {
    super.prepareDerivedData();
    const flags = this.flags?.torgeternity;
    if (flags) {
      this.torg = {
        cosm: this.flags.torgeternity.cosm,
        zone: this.flags.torgeternity.zone,
        displayCosm2: (this.flags.torgeternity.zone !== 'pure'),
        isMixed: (this.flags.torgeternity.zone === 'mixed'),
        cosm2: (this.flags.torgeternity.zone !== 'pure') && this.flags.torgeternity.cosm2
      };

      if (this.torg.cosm === 'none')
        this.torg.axioms = { tech: 0, social: 0, spirit: 0, magic: 0 }
      else {
        const zoneAxioms = { ...CONFIG.torgeternity.axiomByCosm[this.torg.cosm] };
        if (this.torg.isMixed && this.torg.cosm2) {
          const axiom2 = CONFIG.torgeternity.axiomByCosm[this.torg.cosm2];
          for (const key of Object.keys(zoneAxioms))
            if (axiom2[key] > zoneAxioms[key]) zoneAxioms[key] = axiom2[key];
        }
        this.torg.axioms = zoneAxioms;
      }
    }
  }

  /**
   * Returns true if the given 'cosm' is active within the zone of this scene.
   * (Either the single or dominant zone, or either cosm if mixed)
   * @param {*} cosm 
   * @returns 
   */
  hasCosm(cosm) {
    return this.torg.cosm === 'none' || this.torg.cosm === cosm || (this.torg.isMixed && this.torg.cosm2 === cosm);
  }
}

export default class torgeternityActor extends Actor {
    prepareBaseData() {
        

        if (this._data.type === "stormknight") {        
            const airVehiclesAdds = this.data.data.skills.airVehicles.adds
            const dexterity = this.data.data.attributes.dexterity
            this.data.data.skills.airVehicles.derivedValue = parseInt(airVehiclesAdds) + parseInt(dexterity)
        };

        if (this.data.data.editstate === undefined) {
            this.data.data.editstate = "none";
        }; 

//        this.actor.data.data.skills.airVehicles.derivedValue = this.actor.data.data.attributes.dexterity + this.actor.data.data.skills.airVehicles.adds;

    }
}

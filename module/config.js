export const torgeternity = {};
torgeternity.welcomeMessage="";

torgeternity.gameCards = {
    cardType: {
        actionCards: {},
        destinyCards: {},
        cosmCards: {}
    },
    GMDecks :{
 
        destiny : {
          compendiums:[],
          label: "destiny deck",
          remainingCards: [],
          playedCards: [],
          backImg:""
        },
        action : {
          compendiums:[],
          label: "action deck",
          remainingCards: [],
          playedCards: [],
          activeCard: {},
          backImg:""
    
        },
        cosm : {
          compendiums:[],
          label: "cosm deck",
          cosmFilter: "",
          remainingCards: [],
          playedCards: [],
          activeCard: {},
          backImg:""
    
        }
    }
    
}
torgeternity.viewMode = {
    UI: true
}
torgeternity.attributeTypes = {
    charisma: "torgeternity.attributes.charisma",
    dexterity: "torgeternity.attributes.dexterity",
    mind: "torgeternity.attributes.mind",
    spirit: "torgeternity.attributes.spirit",
    strength: "torgeternity.attributes.strength"
}

torgeternity.cosmTypes = {
    none: "torgeternity.cosms.none",
    coreEarth: "torgeternity.cosms.coreEarth",
    livingLand: "torgeternity.cosms.livingLand",
    nileEmpire: "torgeternity.cosms.nileEmpire",
    aysle: "torgeternity.cosms.aysle",
    cyberpapacy: "torgeternity.cosms.cyberpapacy",
    tharkold: "torgeternity.cosms.tharkold",
    panPacifica: "torgeternity.cosms.panPacifica",
    orrorsh: "torgeternity.cosms.orrorsh",
    other: "torgeternity.cosms.other"
}

torgeternity.perkTypes = {
    cyberware: "torgeternity.perkTypes.cyberware",
    darkness: "torgeternity.perkTypes.darkness",
    dwarf: "torgeternity.perkTypes.dwarf",
    edeinos: "torgeternity.perkTypes.edeinos",
    electricSamurai: "torgeternity.perkTypes.electricSamurai",
    elf: "torgeternity.perkTypes.elf",
    faith: "torgeternity.perkTypes.faith",
    kiPowers: "torgeternity.perkTypes.kiPowers",
    leadership: "torgeternity.perkTypes.leadership",
    light: "torgeternity.perkTypes.light",
    occult: "torgeternity.perkTypes.occult",
    occultech: "torgeternity.perkTypes.occultech",
    outsider: "torgeternity.perkTypes.outsider",
    prowess: "torgeternity.perkTypes.prowess",
    psionics: "torgeternity.perkTypes.psionics",
    pulpPowers: "torgeternity.perkTypes.pulpPowers",
    reality: "torgeternity.perkTypes.reality",
    savagery: "torgeternity.perkTypes.savagery",
    social: "torgeternity.perkTypes.social",
    spellcraft: "torgeternity.perkTypes.spellcraft",
    racial: "torgeternity.perkTypes.racial"
}

torgeternity.attackTypes = {
    unarmedCombat: "torgeternity.attackTypes.unarmedCombat",
    meleeWeapons: "torgeternity.attackTypes.meleeWeapons",
    missileWeapons: "torgeternity.attackTypes.missileWeapons",
    fireCombat: "torgeternity.attackTypes.fireCombat",
    energyWeapons: "torgeternity.attackTypes.energyWeapons",
    heavyWeapons: "torgeternity.attackTypes.heavyWeapons",
}

torgeternity.damageTypes = {
    flat: "torgeternity.damageTypes.flat",
    strengthPlus: "torgeternity.damageTypes.strengthPlus",
    charismaPlus: "torgeternity.damageTypes.charismaPlus",
    dexterityPlus: "torgeternity.damageTypes.dexterityPlus",
    mindPlus: "torgeternity.damageTypes.mindPlus",
    spiritPlus: "torgeternity.damageTypes.spiritPlus"
}

torgeternity.powerSkills = {
    alteration: "torgeternity.powerSkills.alteration",
    apportation: "torgeternity.powerSkills.apportation",
    conjuration: "torgeternity.powerSkills.conjuration",
    divination: "torgeternity.powerSkills.divination",
    kinesis: "torgeternity.powerSkills.kinesis",
    precognition: "torgeternity.powerSkills.precognition",
    telepathy: "torgeternity.powerSkills.telepathy",
    faith: "torgeternity.powerSkills.faith"
}

torgeternity.clearances = {
    alpha: "torgeternity.clearances.alpha",
    beta: "torgeternity.clearances.beta",
    gamma: "torgeternity.clearances.gamma",
    delta: "torgeternity.clearances.delta",
    omega: "torgeternity.clearances.omega"
}

torgeternity.races = {
    human: "torgeternity.races.human",
    dwarf: "torgeternity.races.dwarf",
    edeinos: "torgeternity.races.edeinos",
    elf: "torgeternity.races.elf",
    aspirants: "torgeternity.races.aspirants",
    theRace: "torgeternity.races.theRace",
    other: "torgeternity.races.other"
}

torgeternity.skills = {
    airVehicles: "torgeternity.skills.airVehicles",
    alteration: "torgeternity.skills.alteration",
    apportation: "torgeternity.skills.apportation",
    beastRiding: "torgeternity.skills.beastRiding",
    computers: "torgeternity.skills.computers",
    conjuration: "torgeternity.skills.conjuration",
    divination: "torgeternity.skills.divination",
    dodge: "torgeternity.skills.dodge",
    energyWeapons: "torgeternity.skills.energyWeapons",
    evidenceAnalysis: "torgeternity.skills.evidenceAnalysis",
    faith: "torgeternity.skills.faith",
    find: "torgeternity.skills.find",
    fireCombat: "torgeternity.skills.fireCombat",
    firstAid: "torgeternity.skills.firstAid",
    heavyWeapons: "torgeternity.skills.heavyWeapons",
    intimidation: "torgeternity.skills.intimidation",
    kinesis: "torgeternity.skills.kinesis",
    landVehicles: "torgeternity.skills.landVehicles",
    language: "torgeternity.skills.language",
    lockpicking: "torgeternity.skills.lockpicking",
    maneuver: "torgeternity.skills.maneuver",
    medicine: "torgeternity.skills.medicine",
    meleeWeapons: "torgeternity.skills.meleeWeapons",
    missileWeapons: "torgeternity.skills.missileWeapons",
    persuasion: "torgeternity.skills.persuasion",
    precognition: "torgeternity.skills.precognition",
    profession: "torgeternity.skills.profession",
    reality: "torgeternity.skills.reality",
    scholar: "torgeternity.skills.scholar",
    science: "torgeternity.skills.science",
    stealth: "torgeternity.skills.stealth",
    streetwise: "torgeternity.skills.streetwise",
    survival: "torgeternity.skills.survival",
    taunt: "torgeternity.skills.taunt",
    telepathy: "torgeternity.skills.telepathy",
    tracking: "torgeternity.skills.tracking",
    trick: "torgeternity.skills.trick",
    unarmedCombat: "torgeternity.skills.unarmedCombat",
    waterVehicles: "torgeternity.skills.waterVehicles",
    willpower: "torgeternity.skills.willpower"
}

torgeternity.stymiedStates = {
    none: "torgeternity.stymiedStates.none",
    stymied: "torgeternity.stymiedStates.stymied",
    veryStymied: "torgeternity.stymiedStates.veryStymied"
}

torgeternity.vulnerableStates = {
    none: "torgeternity.vulnerableStates.none",
    vulnerable: "torgeternity.vulnerableStates.vulnerable",
    veryVulnerable: "torgeternity.vulnerableStates.veryVulnerable"
}

torgeternity.yesNo = {
    true: "torgeternity.yesNo.true",
    false: "torgeternity.yesNo.false"
}


torgeternity.statusEffects = [
    {
        icon: 'systems/torgeternity/images/status-markers/stymied.webp',
        id: 'stymied',
        label: 'torgeternity.statusEffects.stymied',
        name: 'stymied'
    },

    {
        icon: 'systems/torgeternity/images/status-markers/very-stymied.webp',
        id: 'veryStymied',
        label: 'torgeternity.statusEffects.veryStymied',
        name: 'veryStymied'
    },

    {
        icon: 'systems/torgeternity/images/status-markers/vulnerable.webp',
        id: 'vulnerable',
        label: 'torgeternity.statusEffects.vulnerable'
    },

    {
        icon: 'systems/torgeternity/images/status-markers/very-vulnerable.webp',
        id: 'veryVulnerable',
        label: 'torgeternity.statusEffects.veryVulnerable'
    },

    {
        icon: 'systems/torgeternity/images/status-markers/disconnected.webp',
        id: 'disconnected',
        label: 'torgeternity.statusEffects.disconnected'
    },

    {
        icon: 'systems/torgeternity/images/status-markers/aiming.webp',
        id: 'aiming',
        label: 'torgeternity.statusEffects.aiming'
    },

    {
        icon: 'systems/torgeternity/images/status-markers/malfunction.webp',
        id: 'malfunction',
        label: 'torgeternity.statusEffects.malfunction'
    },

    {
        icon: 'systems/torgeternity/images/status-markers/concentrating.webp',
        id: 'concentrating',
        label: 'torgeternity.statusEffects.concentrating'
    },

    {
        icon: 'systems/torgeternity/images/status-markers/restrained.webp',
        id: 'restrained',
        label: 'torgeternity.statusEffects.restrained'
    }
    

]

torgeternity.cardTypes = {
    destiny: "Destiny",
    cosm: "Cosm",
    drama: "Drama"
}

export default class HandedCards extends Application {
    constructor(options) {
        super(options);
    
       
      }
  
      /* -------------------------------------------- */
  
    /** @override */
      static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
          id: "HandedCards",
        template: "systems/torgeternity/templates/cards/hand.hbs",
        popOut: false
      });
    }
  
      /* -------------------------------------------- */
    /*  Application Rendering
      /* -------------------------------------------- */
  
    /** @override */
    render(force, context={}) {
     
      return super.render(force, context);
    }
  
    /* -------------------------------------------- */
  
    /** @override */
    getData(options) {
  
      let cards={}
  
      // Return the data for rendering
      return cards;
    }
  
      /* -------------------------------------------- */
    /*  Event Listeners and Handlers
      /* -------------------------------------------- */
  
    /** @override */
    activateListeners(html) {
         function cardPlayed(data) {
            console.log('>>> card played', data)
          };
          
           function cardReserved(data) {
            console.log('>>> card reserved', data);
          }
          
           function cardExchangePropose(data) {
            console.log('>>> card exchange proposed', data);
          
          }
          
           function cardExchangeValide(data) {
            console.log('>>> card exchange valide', data)
          }
     
  }
}
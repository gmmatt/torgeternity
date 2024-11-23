import { PowerItemData } from './power.js';

/**
 * @inheritdoc
 */
export class MiracleItemData extends PowerItemData {
    /** 
     * @inheritdoc
     */
    prepareBaseData(){
        super.prepareBaseData();
        this.skill = 'faith';
    }
}

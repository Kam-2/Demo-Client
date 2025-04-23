import { LightningElement } from 'lwc';
export default class CasesOnMapRefresh extends LightningElement {

    //onclick refresh 
    refreshComponent(){
            //    window.location.reload();
       eval("$A.get('e.force:refreshView').fire();");

}
}
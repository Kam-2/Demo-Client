import { LightningElement,api,track } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import CancelIcn from '@salesforce/resourceUrl/CancelIcon';
import publicArtIcn from '@salesforce/resourceUrl/Defaultmarker';
import publicArtIcnClean from '@salesforce/resourceUrl/Defaultmarker1';
import publicArtIcnBlack from '@salesforce/resourceUrl/DefaultmarkerBlack';
import publicArtIcnBlue from '@salesforce/resourceUrl/DefaultmarkerBlue';
import publicArtIcnGreen from '@salesforce/resourceUrl/DefaultmarkerGreen';
import publicArtIcnHorticulture from '@salesforce/resourceUrl/DefaultmarkerHorticulture';

export default class CasesOnMapFilter extends LightningElement {
    cancel = CancelIcn
    //Values from parent comp
    @api typeSubtype = {};
    @api subtypeSubSubtype = {};
    @api typeList = [];

    //To pass to parent comp
    @api selectedFromDate = '';
    @api selectedToDate = '';
    @api isClosedCases = false;
    @api isNewCases = false;
    @api isSubmitted = false;
    @api isWorkingCases = false;

    indextoAdd = [];
    indextoRemove = [];
    
    selectedCategories = [];

    subtypeAddMap = {};
    subtypeRemoveMap = {};
            
    sub_subtypeAddMap = {};
    sub_subtypeRemoveMap = {};


 @api isHighPriority = false;
    @api isLowPriority = false;
    @api isMediumPriority = false;

get categorySubcategoryPairs() {
    const imageMap = {
        'Cleaning': publicArtIcnClean,
        'Outreach': publicArtIcnBlue,
        'Security': publicArtIcnGreen,
        '311': publicArtIcnBlack,
        'Horticulture' : publicArtIcnHorticulture,
    };
    
    return this.typeList.map(key => ({
        categories: key,
        imageUrl: imageMap[key] || publicArtIcn, // Set the image URL here
        subcategories: (this.typeSubtype[key] || []).map(subcategory => ({
            name: subcategory,
            sub_subcategories: (key === 'Security and Safety' || key === 'Cleaning Operations') ? (this.subtypeSubSubtype[subcategory] || []) : []
        }))
    }));
}
    // //From this.mapTypeSubtype keys are categories, values are subcategories and this.mapSubtype_Sub_Subtype keys are subtypes and values are sub-subtypes
    // get categorySubcategoryPairs() {
    //     console.log(JSON.stringify(this.typeList));
    //     return (this.typeList).map(key => ({
    //         categories: key,
    //             subcategories: this.typeSubtype[key].map(subcategory => ({
    //                 name: subcategory,
    //                     sub_subcategories: (key === 'Security and Safety' || key === 'Cleaning Operations') ? (this.subtypeSubSubtype[subcategory] || []) : []
    //             }))
    //                 }));
    // }
//         get categorySubcategoryPairs() {
//     console.log(JSON.stringify(this.typeList));
//     return this.typeList.map(key => ({
//         categories: key,
//         subcategories: (this.typeSubtype[key] || []).map(subcategory => ({
//             name: subcategory,
//             sub_subcategories: (key === 'Security and Safety' || key === 'Cleaning Operations') ? (this.subtypeSubSubtype[subcategory] || []) : []
//         }))
//     }));
// }

    handleFromDateChange(event) {
        this.selectedFromDate = event.target.value;
        this.checkDateRange();
        this.passDateToParent();
    }
    
    handleToDateChange(event) {
        
        this.selectedToDate = event.target.value;        
        this.checkDateRange();
        this.passDateToParent();
        
    }
    
    checkDateRange() {
        if ((this.selectedFromDate != '') && (this.selectedToDate != '')) {
            const fromDateObj = new Date(this.selectedFromDate);
            const toDateObj = new Date(this.selectedToDate);
            
            if (fromDateObj > toDateObj) {
                //alert('From date cannot be greater than To date.');
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
            message: 'From date cannot be greater than To date',
            variant: 'Error'
                                    })
                );
                this.selectedToDate = '';
                this.template.querySelector('[data-id="To Date"]').value = ''; // Update input field value in DOM
                
            }
            
            
        }
        else if (((this.selectedFromDate == '') || (this.selectedFromDate == null)) && ((this.selectedToDate != '') || (this.selectedToDate != null) )) {
            //alert('From date cannot be Empty.');
            this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
            message: 'From date cannot be Empty',
            variant: 'Error'
                                    })
                );
            this.selectedToDate = '';
            this.template.querySelector('[data-id="To Date"]').value = ''; // Update input field value in DOM
            
        }
    }
    
    handleClearFromDate()
    {
        this.selectedFromDate = '';
        this.passDateToParent();
    }
    handleClearToDate()
    {
        this.selectedToDate = '';
        this.passDateToParent();
    }

    passDateToParent() {
        const event = new CustomEvent('passdatetoparent', {
    detail: {
                startDate: this.selectedFromDate,
                endDate: this.selectedToDate
            }
        });
        this.dispatchEvent(event);
    }   
    
    handleCheckboxChange(event) {
        // if(event.target.label == 'New Cases')
        // {
        //     this.isNewCases = event.target.checked;
        // }
        // if(event.target.label == 'Working Cases')
        // {
        //     this.isWorkingCases = event.target.checked;
        // }
        // if(event.target.label == 'Closed Cases')
        // {
        //     this.isClosedCases = event.target.checked;
        // }
        const { label, checked } = event.target; 
    switch (label) {
        case 'Open':
            this.isNewCases = checked;
            break;
        case 'Working':
            this.isWorkingCases = checked;
            break;
        case 'Closed':
            this.isClosedCases = checked;
            break;
}

        this.passBooleanToParent();
    }

handlePriorityCheckboxChange(event)
{
   const { label, checked } = event.target; 
    switch (label) {
        case 'High':
            this.isHighPriority = checked;
            break;
        case 'Medium':
            this.isMediumPriority = checked;
            break;
        case 'Low':
            this.isLowPriority = checked;
            break;
}

        this.passPriorityToParent();
    }

passPriorityToParent() {
    const event = new CustomEvent('passprioritytoparent', {
    detail: {
            highPriority: this.isHighPriority,
            mediumPriority: this.isMediumPriority,
            lowPriority: this.isLowPriority
        }
    });
    this.dispatchEvent(event);
    }


    passBooleanToParent() {
    const event = new CustomEvent('passbooleantoparent', {
    detail: {
            newCase: this.isNewCases,
            closedCase: this.isClosedCases,
            workingCase: this.isWorkingCases
        }
    });
    this.dispatchEvent(event);
    }

    
    handleCategoryChange(event) {
        
        const indexValue = event.target.dataset.index;
        const category = event.target.value;
        
        var isChecked = event.target.checked;
        var catChecked = false;
        if(isChecked){
            if (!this.selectedCategories.includes(category)) {
                this.selectedCategories.push(category);
                catChecked = true;
            }
            else
            {
                // console.log('***checkbox == true this.selectedCategories alreadey there'+category+'here--'+this.selectedCategories);
                
            }
        }
        //Fetching subcategories and sub-subtypes based on category selected
        const subcategoryCheckboxes = this.template.querySelectorAll('[data-category="'+category+'"]'); 
        
        subcategoryCheckboxes.forEach((subcategoryCheckbox,index) => {
            
            if(catChecked)
            {
                subcategoryCheckbox.checked = isChecked;
            }
            else
            {
                // subcategoryCheckbox.checked = isChecked;
            }
            const subcategoryContainer = subcategoryCheckbox.closest('.subcategory');
            const subSubcategoryContainer = subcategoryCheckbox.closest('.sub-subcategory');
            
            if (subcategoryContainer) {
                
                subcategoryContainer.style.display = isChecked ? 'block' : 'none';
            }
            
            if (subSubcategoryContainer) {
                subSubcategoryContainer.style.display = isChecked ? 'block' : 'none';
            }
        });
        
        if(isChecked == true){
            this.indextoAdd.push(indexValue);
        }
        if(isChecked == false){
            this.indextoRemove.push(indexValue);
        }
        this.updateSelectAllCheckbox();
        // this.passValues();    
        this.passSubSubValues();
    }       
    
    
    handleSubcategoryChange(event) {
        const subIndexValue = event.target.dataset.index;
        const category = event.target.dataset.category;
        // passing the category to the this.selectedcategories array to omit duplicates/ add category indexes in indextoADD or index to Remove
        this.selectedCategories.push(category);
        
        var isChecked = event.target.checked;
        
        const subcategory = event.target.value;
        
        //Fetching all sub-subtypes based on selected subtypes
        const sub_subcategoryCheckboxes = this.template.querySelectorAll('[data-subcategory="'+subcategory+'"]'); 
        
        
        sub_subcategoryCheckboxes.forEach(sub_subcategoryCheckbox => {
            if ((category === 'Security and Safety') || (category === 'Cleaning Operations')) { //Hardcoding types here as other types are also having sub-subtypes
            
                const subSubcategoryContainer = sub_subcategoryCheckbox.closest('.sub-subcategory');
                
                if (subSubcategoryContainer) {
                    subSubcategoryContainer.style.display = isChecked ? 'block' : 'none';
                }
            }
        });
        
        if(isChecked == true){
            if (!(category in this.subtypeAddMap)) {
                this.subtypeAddMap[category] = [];
            }
            
            this.subtypeAddMap[category].push(subIndexValue);
        }
        if(isChecked == false){
            
            if (!(category in this.subtypeRemoveMap)) {
                this.subtypeRemoveMap[category] = [];
            }
            
            this.subtypeRemoveMap[category].push(subIndexValue);
        }

        this.updateSelectAllCheckbox(); 
        // this.passSubValues();
        this.passSubSubValues();
       
    }
    
    handleSubSubcategoryChange(event){
        const subSubIndexValue = event.target.dataset.index;
        const category = event.target.dataset.category;

        // passing the category to the this.selectedcategories array to omit duplicates/ add category indexes in indextoADD or index to Remove
        this.selectedCategories.push(category);
        var checkbox  = event.target.checked;
        const subcategory = event.target.dataset.subcategory;
        
        //Based on selections, sub-subtypes index and subtype value are passed to sub_subtypeAddMap and sub_subtypeRemoveMap
        if(checkbox == true){
            if (!(subcategory in this.sub_subtypeAddMap)) {
                this.sub_subtypeAddMap[subcategory] = [];
            }
            
            this.sub_subtypeAddMap[subcategory].push(subSubIndexValue);
        }
        if(checkbox == false){
            
            if (!(subcategory in this.sub_subtypeRemoveMap)) {
                this.sub_subtypeRemoveMap[subcategory] = [];
            }
            
            this.sub_subtypeRemoveMap[subcategory].push(subSubIndexValue);
        }
        this.updateSelectAllCheckbox();
        this.passSubSubValues();
       
    }
    
    selectAll(event) {
        var isChecked = event.target.checked;
        
        this.selectedCategories =[];
        this.indextoRemove = [];
        this.indextoAdd = [];
        this.subtypeAddMap = {};
        this.subtypeRemoveMap = {};
        this.sub_subtypeAddMap ={};
        this.sub_subtypeRemoveMap = {};

        // to check and uncheck all checkboxes based on select all selection
        const checkboxes = this.template.querySelectorAll('[data-type="Cat"],[data-type="subCat"],[data-type="sub-subCat"]');                
            checkboxes.forEach(checkbox => {
                const index = parseInt(checkbox.getAttribute('data-index')); // Convert to a number
                const type = checkbox.getAttribute('data-type');
                
                if (isChecked) {
                    checkbox.checked = isChecked; // Update the checkbox state
                    if (type == "Cat"){
                        this.indextoAdd.push(index);
                    }
                } 
                else {
                    checkbox.checked = isChecked; // Update the checkbox state
                    if (type == "Cat"){
                        this.indextoRemove.push(index);
                    }
                    
                }
                
            });
        
        //to display subtypes and sub-subtypes according to select all checkbox selection
        const allCheckboxes = this.template.querySelectorAll('[data-id="All checkbox"]'); 
        allCheckboxes.forEach(checkbox => {
            const subcategoryContainer = checkbox.closest('.subcategory');
            const subSubcategoryContainer = checkbox.closest('.sub-subcategory');
            
            if (subcategoryContainer) {
                subcategoryContainer.style.display = isChecked ? 'block' : 'none';
            }
            
            if (subSubcategoryContainer) {
                subSubcategoryContainer.style.display = isChecked ? 'block' : 'none';
            }
        });
        
        // this.passValues();     
        this.passSubSubValues();
    }

    updateSelectAllCheckbox() {

        // fetching all checkboxes
        const typeCheckboxes = this.template.querySelectorAll('[data-id="All checkbox"]'); 
        
        const selectAllCheckbox = this.template.querySelector('[data-id="selectAllCheckbox"]');
        // const typeCheckboxes = this.template.querySelectorAll('.category');
        let allChecked = true;
        
        // if any types, or subtypes or sub-subtypes are unchecked then select all checkbox will be unchecked
        for (let i = 0; i < typeCheckboxes.length; i++) {
            if (!typeCheckboxes[i].checked) {
                allChecked = false;
                break;
            }
        }
        
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = allChecked;
        }

    }
    
    passSubSubValues() {
    const event = new CustomEvent('passvaluestosubmit', {
    detail: {
            arrayAdd: this.indextoAdd,
            arrayRemove: this.indextoRemove,
            mapAdd: this.subtypeAddMap,
            mapRemove: this.subtypeRemoveMap,
            submapAdd: this.sub_subtypeAddMap,
            submapRemove: this.sub_subtypeRemoveMap
        }
    });
    this.dispatchEvent(event);
    }
    
}
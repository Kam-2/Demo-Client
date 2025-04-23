import { LightningElement,api,track } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import CancelIcn from '@salesforce/resourceUrl/CancelIcon';
import getFields from "@salesforce/apex/COM_Ctrl.getAvailableFields";
import getAllBatchCases from "@salesforce/apex/COM_Ctrl.getBatchData";
export default class CasesOnMapExport extends LightningElement {

    cancel = CancelIcn
    showModal = false;
    @api filteredLocations;
    @api mapMarkers;
    @api isFenced;
    @api isExport;

    //Hardcoding values for default fields to export as csv 
    //lstSelected = ['Id','CaseNumber','Report_Type__c','Status'];

    @api mapFieldApiValue = {};  

    @api finalTypes = [];
    @api finalSubTypes = [];
    @api totalSubValMap = {};
    @api isSubSubtypes ; 
    @api totalSubSubValMap = {};
    @api isSubtypes; 
    @api typSubTyp = {};
    @api subTypSubTyp = {};

    @api isClosedCases;
    @api isNewCases;
    @api isWorkingCases;

 @api isHighPriority;
    @api isLowPriority ;
    @api isMediumPriority;

    @api selectedFromDate;
    @api selectedToDate;

    @api finalListLat = [];
    @api finalListLong = [];

@track helpText;
@track lstSelected = [];
@track daysToRemove;
connectedCallback() {
    //to get fields for exporting from custom metadata
        getFields()    
            .then((result) => {
                this.lstSelected = result.fieldDefList;  
                this.daysToRemove = parseInt(result.daysToRemove);
    // Calculate the duration dynamically
    const durationHours = this.daysToRemove*24; // You can set this dynamically based on your requirements
    this.helpText = `The exported CSV files are also available for ${durationHours} hours on this user page before they are deleted.`;
        })
        
}
    handleOptChange(event){ 
        this.lstSelected = event.detail.value;
    }

    closeModal() {
        this.showModal = false;
        
    }

    get lstOptions() {
        const options = [];
        
        for (const [value, label] of Object.entries(this.mapFieldApiValue)) {
            options.push({ label, value });
        }
        
        return options;
        
    }


    handleExport(){ 
        if(this.isExport){

            this.showModal = true;
            if(this.isFenced)
            {
                this.rec2 = this.filteredLocations;
                
            }
            else
            {
                this.rec2 =   this.mapMarkers ;
                
            }
            
        }
        else
        {
           // alert('No Cases Selected to Export');
            this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
            message: 'No Cases are Selected to Export',
            variant: 'Error'
                                    })
                );
        }
        
        
    }
    
    downloadCSV() {
        const selectedLabels = [];
        
        for (const selectedValue of this.lstSelected) {
            if (this.mapFieldApiValue[selectedValue]) {
                selectedLabels.push(this.mapFieldApiValue[selectedValue]);
            } else {
                // Handle the case where the selectedValue is not found in the map.
                selectedLabels.push(selectedValue); // Use the value as a label.
            }
        }   
        // alert(this.finalSubTypes);
        this.valuesParams = {
                        selLabels :this.lstSelected,
                        selLabelMap : this.mapFieldApiValue,
                        listSelectedValues : this.finalTypes,
                        selectedSubTypes : this.finalSubTypes,
                        totalSubValMap : this.totalSubValMap,
                        strFromDate : this.selectedFromDate || null,
                        strToDate : this.selectedToDate || null,
                        isNewStatus :this.isNewCases,
                        isClosedStatus : this.isClosedCases,
                        isWorkingCases : this.isWorkingCases,
                        isHighPriority: this.isHighPriority,
                        isMediumPriority: this.isMediumPriority,
                        isLowPriority:this.isLowPriority,
                        lstLat : this.finalListLat,
                        lstLong : this.finalListLong,
                        typSubtypMap : this.typSubTyp,
                        subtypSubSubtypMap : this.subTypSubTyp,
                        isSubSubtypes : this.isSubSubtypes,
                        isSubtypes : this.isSubtypes,
                                            };    
        console.log(JSON.stringify(this.valuesParams));
        getAllBatchCases({params: JSON.stringify(this.valuesParams)});
        // .then((result) => {
        //         // Creating anchor element to download
        // let downloadElement = document.createElement('a');
        // // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
        // downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(result);
        // downloadElement.target = '_blank';
        // // CSV File Name
        // downloadElement.download = 'Data.csv';
        // // below statement is required if you are using firefox browser
        // document.body.appendChild(downloadElement);
        // // click() Javascript function to download CSV file
        // downloadElement.click(); 
        //     })
        //     .catch((error) => {
        //         this.error = error;
        //     });
        this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
            message: 'You will be Notified Once File Saved!!',
            variant: 'success'
                                    })
                );
                    this.showModal = false;

        // let csv = selectedLabels.join(',') + '\n';
        // this.rec2.forEach((row) => {
            
        //     const csvRowArray = this.lstSelected.map((field) => {
        //         return row[field];
        //     });
            
        //     const csvRow = csvRowArray.join(',');
        //     csv += csvRow + '\n';
        // });
        
        // // Creating anchor element to download
        // let downloadElement = document.createElement('a');
        // // This  encodeURI encodes special characters, except: , / ? : @ & = + $ # (Use encodeURIComponent() to encode these characters).
        // downloadElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
        // downloadElement.target = '_blank';
        // // CSV File Name
        // downloadElement.download = 'Data.csv';
        // // below statement is required if you are using firefox browser
        // document.body.appendChild(downloadElement);
        // // click() Javascript function to download CSV file
        // downloadElement.click(); 
        
    }

    closeModal() {
        this.showModal = false;
        
    }
   
}
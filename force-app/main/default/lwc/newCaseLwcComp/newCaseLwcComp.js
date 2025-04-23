import { LightningElement, wire, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import getFieldSetFieldsByFieldSetName from '@salesforce/apex/DynamicFieldSetControllerForCase.getFieldSetFieldsByFieldSetName';
import getObjectFields from '@salesforce/apex/DynamicFieldSetControllerForCase.getObjectFields';
import uploadFiles from '@salesforce/apex/DynamicFieldSetControllerForCase.uploadFiles';
// import getCustomSettingValues from '@salesforce/apex/DynamicFieldSetControllerForCase.getCustomSettingValues';
// import getAllTypeFieldset from '@salesforce/apex/DynamicFieldSetControllerForCase.getAllTypeFieldset';
// import getDynamicFieldMap from '@salesforce/apex/DynamicFieldSetControllerForCase.getDynamicFieldMap';
// import getSubDynamicFieldMap from '@salesforce/apex/DynamicFieldSetControllerForCase.getSubDynamicFieldMap';
import casestyle from '@salesforce/resourceUrl/Casecss';
import casestyle1 from '@salesforce/resourceUrl/DescriptionCss';

const MAX_FILE_SIZE = 2097152;
import Vfpageurl from '@salesforce/label/c.VFURL';

export default class NewCaseLwcComp extends NavigationMixin(LightningElement) {
    
    // vfRoot = "https://downtownpartnershipofbaltimore--cube84--c.sandbox.vf.force.com";
    @api recordId;
    @track formFields = [];
    @track setformFields = [];
    @track setfullformFields = [];
    @track formValues = {};
    @api pickvaue;
    

    @track fieldApiName;
    @track fieldValue;
    @track dynamicField;

    @track caseinfo = true;
    @track locationinfo = false;
    @api messageFromVF;

    @track hideaddinfo = false;
    @track savedFieldValues = {};
    lattitude;
    longitude;
    address;
    @track filesData = [];
    css = casestyle;
    @track resultMap = {};
    @track metadataDependencies = {};
    @track submetadataDependencies = {};
    
    @track previousvalue = '';
    @track previousapi = '';
    @track prevobj = {};

    @track subtypeValue = '';
    @track presentKeys = '';
    @track eletoRemove = [];
    @track val = [];
    @api toggleChng=false;
    @api showSpinner = false;
showSec = false;
    label = {
        Vfpageurl,
    };
    customsettingname='CaseCustomSetting';


    // @wire(getObjectFields, { objectName: 'Case', fieldSet_Name:'New Case Information'}) //New_Case_Information
    // wiredFields({ error, data }) {
    //     if (data) {
    //         this.formFields = data;
    //         console.log('d'+JSON.stringify(data));
    //     } else if (error) {
    //         console.error('Error fetching fields:', error);
    //     }
    // }

@api publicAssetId ='';
@api objectName ='';
@track publicAssetCreation = false;

    @wire(getObjectFields, { objectName: 'Case', fieldSet_Name: 'New Case Information' })
wiredFields({ error, data }) {
    if (data) {
        this.formFields = data.map(field => {
            // Create a shallow copy of the field object to avoid immutability issues
            const fieldCopy = { ...field };

            // Add a default value key
            fieldCopy.value = '';

            // For 'Public_Asset__c', assign the value as this.publicAssetId
            if (fieldCopy.apiName === 'Public_Asset__c') {
                fieldCopy.value = this.publicAssetId; 
                console.log('Assigned Public Asset ID:', this.publicAssetId);
            }

            console.log('Processed Field:', JSON.stringify(fieldCopy));
            return fieldCopy;
        });

        console.log('Processed Fields:', JSON.stringify(this.formFields));
    } else if (error) {
        console.error('Error fetching fields:', error);
    }
}

get vfPageReturnUrl() {
    if(this.objectName == 'Public_Asset_District360__c')
{
        return `/apex/NewPAVF?paId=${this.publicAssetId}`;
}
else
{
    return `/apex/NewCaseVF`;
}
        // return `/apex/NewCaseVF?id=${this.recordId}&anotherParam=${this.serviceComment}&vendorName=${this.selectedVendorName}`;
   
    }

    connectedCallback() {
        console.log('Public Asset ID:', this.publicAssetId);
//  console.log('Public Asset ID:', this.publicAssetId == '');
        console.log('this.objectName', this.objectName);

        this.toggleChng=true;
        window.addEventListener("message", (message) => {
            console.log(message.origin);
            //handle the message
            if (message.data.name === "EmbedVflwc") {

                this.messageFromVF = message.data.payload;
                console.log(this.messageFromVF);

                console.log("Message from payload: " + JSON.stringify(this.messageFromVF.lattitude));

            }
            this.lattitude = this.messageFromVF.latitude;
            this.longitude = this.messageFromVF.longitude;
            this.address = this.messageFromVF.autocompleteValue;

            console.log("Latitude:", latitude);
            console.log("Longitude:", longitude);
            console.log("Autocomplete Value:", autocompleteValue);
        });
    this.addStyles();
    if(this.objectName == 'Public_Asset_District360__c')
{

this.publicAssetCreation = true;
}
    }

    addStyles() {
        const link = document.createElement('link');
        link.href = casestyle1; // Reference to the static resource
        link.rel = 'stylesheet';
        link.type = 'text/css';
        document.head.appendChild(link); // Append to document head
    }


    handleTypeChange(event) {
        console.log('this.objectName', this.objectName);
        
        let apiName = event.target.fieldName;
        var Picklist_Value = event.target.value;
        var pp = 'Case';
        console.log('OUTPUT Picklist_Value: ', Picklist_Value);
        if(apiName == 'Public_Asset__c'){

if(this.objectName == 'Public_Asset_District360__c')
{
    console.log("Picklist_Value type:", typeof Picklist_Value);
     console.log('Public Asset ID:', this.publicAssetId);
    this.publicAssetId = Picklist_Value;
    console.log("this.publicAssetId type:", typeof this.publicAssetId);
 console.log('Public Asset ID:', this.publicAssetId);
this.publicAssetCreation = true;
}
        }
        if(apiName == 'Service_Request_Sub_Type__c'){
                    this.pickvaue = Picklist_Value;

        // alert('value' + this.pickvaue);
        console.log('this.pickvaue: ', this.pickvaue);
        console.log('this.pickvaue: ', this.pickvaue != '');
        if((this.pickvaue != '')){
        if((this.pickvaue != null)){

        getFieldSetFieldsByFieldSetName({ objectApiName: 'Case', fieldsetName: this.pickvaue }).then(result => {
        console.log('OUTPUT result: ', result);
        if (result && result.FieldsetFields && result.FieldsetFields.length > 0) {      
            if (result != null) {
                

                let tempData = [];
                result.FieldsetFields.forEach(field => {
                    let tempField = Object.assign({}, field);
                    tempField['isVisible'] = field.isVisible;
                    tempField['category'] = '';
                    //tempField['total'] = '';
                    tempData.push(tempField);
                })
                this.setfullformFields = tempData;
                console.log('OUTPUT setformFields : ', JSON.stringify(this.setfullformFields));
                this.template.querySelector('[data-id="additionalinfo"]').classList.remove('slds-hide');
                // this.showSec = true;
            }
            else {
                this.setfullformFields = [];
                
            }           
        }
            else {
                this.setfullformFields = [];
                this.template.querySelector('[data-id="additionalinfo"]').classList.add('slds-hide');

            }

            var fieldsetfields = this.setfullformFields;
            // Clear values after a short delay
            setTimeout(() => {
                this.setfullformFields.forEach(field => {
                    field.value = '';
                });
            }, 100);


        })
        .then(() => {
            // Clear values after setting the form fields
            this.setfullformFields.forEach(field => {
                field.value = '';
            });
        })

            .catch((error) => {
                console.log("Error updating date => " + error.body.message);
            });

        }
        else {
                this.template.querySelector('[data-id="additionalinfo"]').classList.add('slds-hide');
                this.setfullformFields = [];
        }
        }
    }
    else if(apiName == 'Service_Request_Type__c'){
        console.log('check');
                // this.template.querySelector('[data-id="additionalinfo"]').classList.add('slds-hide');
                this.setfullformFields = [];
        }
        

    }

    handleInfoChange(event) {
        const fieldName = event.target.fieldName;
        console.log('fieldName',fieldName);
        const value=event.target.value;
        console.log('184',value);
        this.setfullformFields = this.setfullformFields.map((field) => {
            if (field.apiName === fieldName) {
                return { ...field, value };
            }
            return field;
        });
       

    }
    toggleSection() {
        this.toggleChng = !this.toggleChng; // Toggle visibility state
    }

    get sectionClass() {
        return {
            'slds-section__content': true, // Always apply this class
            'slds-show': this.toggleChng,  // Show when toggleChng is true
            'slds-hide': !this.toggleChng  // Hide when toggleChng is false
        };
    }

    // Dynamic icon rotation class when section is toggled open/closed
    get iconClass() {
        return this.toggleChng ? 'slds-section__title-action-icon slds-is-open' : 'slds-section__title-action-icon';
    }
     

    validateRequiredFields() {
        // Check for required fields
        for (const field of this.setfullformFields) {
            if (field.required && field.isVisible && (field.value === null || field.value === '')) {
                return false; // Validation failed
            }
        }
        return true; // Validation passed
    }

    casessinfo() {

        event.preventDefault();
        this.template.querySelector('[data-path="caseinfo"]').classList.add('slds-is-active');
        this.template.querySelector('[data-path="locinfo"]').classList.remove('slds-is-active');
        this.template.querySelector('[data-id="caseinfo"]').classList.remove('slds-hide');
        this.template.querySelector('[data-id="locinfo"]').classList.add('slds-hide');
        this.template.querySelector('[data-path="locinfo"]').classList.add('slds-is-incomplete');
    }

    locate() {

        event.preventDefault();
        this.handleClickNext();
    }

    handleClickNext() {
        // Validation check
        const isValidationPassed = this.validateRequiredFields();

        if (isValidationPassed) {
            this.template.querySelector('[data-id="caseinfo"]').classList.add('slds-hide');
            this.template.querySelector('[data-id="locinfo"]').classList.remove('slds-hide');
            this.template.querySelector('[data-path="caseinfo"]').classList.remove('slds-is-active');
            this.template.querySelector('[data-path="caseinfo"]').classList.remove('slds-is-current');
            this.template.querySelector('[data-path="caseinfo"]').classList.add('slds-is-incomplete');
            this.template.querySelector('[data-path="locinfo"]').classList.add('slds-is-active');
            //this.template.querySelector('[data-path="locinfo"]').classList.add('slds-is-current');
            this.template.querySelector('[data-path="locinfo"]').classList.remove('slds-is-incomplete');

        } else {
            // Show an alert for validation failure
            alert('Please fill in all required fields.');
        }

    }

    handleClickBack() {

        this.template.querySelector('[data-id="caseinfo"]').classList.remove('slds-hide');
        this.template.querySelector('[data-id="locinfo"]').classList.add('slds-hide');
        this.template.querySelector('[data-path="caseinfo"]').classList.add('slds-is-active');
        this.template.querySelector('[data-path="locinfo"]').classList.remove('slds-is-active');
        this.template.querySelector('[data-path="locinfo"]').classList.add('slds-is-incomplete');
    }

    toggleSection(event) {
        this.toggleChng = !this.toggleChng;

        if (!this.toggleChng) {
            console.log('Section is closed, preserving form fields:', this.setfullformFields);
        } else {
            console.log('Section is open, preserving form fields:', this.setfullformFields);
        }
    }
    
    toggleSection1(event) {
        
        console.log(' event.currentTarget.dataset.buttonid'+ event.currentTarget.dataset.buttonid);
        let buttonid = event.currentTarget.dataset.buttonid;
        console.log('buttonid'+buttonid);
        let currentsection = this.template.querySelector('[data-id="' + buttonid + '"]');
        console.log('currentsection'+currentsection);
        if (currentsection.className.search('slds-is-open') == -1) {
            console.log('currentsection'+currentsection);
            currentsection.className = 'slds-section slds-is-open';
            this.template.querySelector('[data-id="publicinfo"]').classList.remove('slds-hide');
        } else {
            console.log('currentsection'+currentsection);
            currentsection.className = 'slds-section slds-is-close';
            this.template.querySelector('[data-id="publicinfo"]').classList.add('slds-hide');
        }
    }
 imagelimit = 0;
 previmglimit=0;
    handleFileUploaded(event) {
        
         if (this.imagelimit <= 5 )
        {   
            console.log('imagelimit be',this.imagelimit);
   if(this.imagelimit == 0)
   {
this.imagelimit = event.target.files.length;
   }
   else{
    this.previmglimit = this.imagelimit;
    this.imagelimit = this.imagelimit+event.target.files.length;

   }
                console.log('imagelimit',this.imagelimit);
if (event.target.files.length > 5) {
                        this.showToast('Error!', 'error', 'Maximum 5 images can be uploaded at a time.');
                      this.imagelimit = this.previmglimit;
                console.log('imagelimit prev in len',this.imagelimit);

}
else if (this.imagelimit > 5) {
                        this.showToast('Error!', 'error', 'Maximum 5 images can be uploaded');
    this.imagelimit = this.previmglimit;
                console.log('imagelimit prev in if',this.imagelimit);


}
       else if ((event.target.files.length > 0)&& (event.target.files.length <= 5) )  {
            for (var i = 0; i < event.target.files.length; i++) {
                if (event.target.files[i].size > MAX_FILE_SIZE) {
                    this.showToast('Error!', 'error', 'File size exceeded the upload size limit.');
                    return;
                }
                let file = event.target.files[i];
                let reader = new FileReader();
                reader.onload = e => {
                    var fileContents = reader.result.split(',')[1]
                    this.filesData.push({ 'fileName': file.name, 'fileContent': fileContents });
                };
                reader.readAsDataURL(file);
            }
        }
        }
        else
        {
                        this.showToast('Error!', 'error', 'Maximum 5 images can be uploaded');
                        this.imagelimit = this.previmglimit;
                console.log('imagelimit prev in else',this.imagelimit);


        }

    }

    showNotification(message, variant) {

        const evt = new ShowToastEvent({
            'message': message,
            'variant': variant
        });
        this.dispatchEvent(evt);
    }


    handlebacktolist() {

if(this.objectName == 'Public_Asset_District360__c')
{
//         console.log('Public Asset ID:', this.publicAssetId);
//  console.log('Public Asset ID:', this.publicAssetId == '');
//     this[NavigationMixin.Navigate]({
//             type: 'standard__objectPage',
//             attributes: {
//                 objectApiName: 'Public_Asset_District360__c', 
//                 actionName: 'list',
//             },
//         });
console.log('this.objectName++', this.objectName);
 const caseUrl = `/lightning/r/Public_Asset_District360__c/${this.publicAssetId}/view`;

        // Redirect to the Case URL
        window.location.href = caseUrl;


}
else
{

        this[NavigationMixin.Navigate]({
            type: 'standard__objectPage',
            attributes: {
                objectApiName: 'Case', 
                actionName: 'list',
            },
        });
}
         setTimeout(() => {
    console.log('refresh');
    window.location.reload();
}, 1000);
 
    }

    removeReceiptImage(event) {
this.imagelimit--;
console.log('this.imagelimit',this.imagelimit);
        var index = event.currentTarget.dataset.id;
        this.filesData.splice(index, 1);
    }

    onSubmitHandler(event) {
        event.preventDefault();
        const inputFields = this.template.querySelectorAll('lightning-input-field');

        inputFields.forEach(field => {
            const fieldName = field.fieldName;
            const value = field.value;

            // Now you can save these values to a data property or an array for later use
            // For example, you can save them to an object:
            this.savedFieldValues[fieldName] = value;
        });
        // Get data from submitted form
        const fields = event.detail.fields;
        // Here you can execute any logic before submit
        // and set or modify existing fields
        var latitude;
        var longitude;
        var decimallat;
        var decimallong;
        var addreslocation;

        if (this.lattitude !== undefined) {
            latitude = this.lattitude;
            longitude = this.longitude;
            decimallat = latitude.toString();
            decimallong = longitude.toString();
            addreslocation = this.address;
        }
        if (decimallat !== undefined) {
            fields.Latitude_District360__c = decimallat;
            fields.longitude_District360__c = decimallong;
            fields.Address_District360__c = addreslocation;
        }
        // You need to submit the form after modifications
        this.template
            .querySelector('lightning-record-edit-form').submit(fields);

    }


    handleSuccess(event) {

        const recordId = event.detail.id;

        if (this.filesData.length !== 0) {
            if (this.filesData == [] || this.filesData.length == 0) {
                this.showToast('Error', 'error', 'Please select atleat one file'); return;
            }
            this.showSpinner = true;
            uploadFiles({
                recordId: recordId,
                filedata: JSON.stringify(this.filesData)
            })
                .then(result => {
                    console.log(result);
                    if (result && result == 'success') {
//                         if(this.objectName == 'Public_Asset_District360__c')
// {
//          console.log('this.objectName++', this.objectName);
//  const caseUrl = `/lightning/r/Public_Asset_District360__c/${this.publicAssetId}/view`;

//         // Redirect to the Case URL
//         window.location.href = caseUrl;
// }
// else{
                        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Case', 
                actionName: 'view',
            },
        });
// }
                        this.filesData = [];
                        this.showToast('Success', 'success', 'Files Uploaded successfully.');
                    } else {
                        this.showToast('Error', 'error', result);
                    }
                }).catch(error => {
                    if (error && error.body && error.body.message) {
                        this.showToast('Error', 'error', error.body.message);
                    }
                }).finally(() => this.showSpinner = false);
        }
        const toastEvent = new ShowToastEvent({
            title: 'Success',
            message: 'Service Request Created Successfully',
            variant: 'success'
        });
        this.dispatchEvent(toastEvent);
                console.log('Navigating to record:', recordId);
                        console.log('Public Asset ID:', this.publicAssetId);
 console.log('Public Asset ID:', this.publicAssetId == '');

// if(this.objectName == 'Public_Asset_District360__c')
// {
//      console.log('this.objectName++', this.objectName);
//  const caseUrl = `/lightning/r/Public_Asset_District360__c/${this.publicAssetId}/view`;

//         // Redirect to the Case URL
//         window.location.href = caseUrl;
// }
// else
// {

        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: recordId,
                objectApiName: 'Case', 
                actionName: 'view',
            },
        });
            
// }
//          setTimeout(() => {
//     console.log('refresh');
//     window.location.reload();
// }, 1000);
    }

    showToast(title, variant, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: variant,
                message: message,
            })
        );
    }

}
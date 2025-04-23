import { LightningElement, api, wire,track } from 'lwc';
import {NavigationMixin} from 'lightning/navigation'
import getRelatedFilesByRecordId from '@salesforce/apex/filePreviewAndDownloadController.getRelatedFilesByRecordId'

export default class CasedisplayImage extends NavigationMixin(LightningElement) {

@api filesList = [];
  @track currentIndex = 0;
  @track isLoading = false;

@api recordpage_display;

 @api recordId;
    // filesList =[]
        fileLogo;
@api objectApiName; // Automatically provided
    label = 'Default Label';

connectedCallback() {
    this.isLoading = true; // Start loading
    this.updateLabel(this.objectApiName);
    console.log('this.objectApiName',this.objectApiName);
    }

    updateLabel(objectApiName) {
        const labels = {
            Public_Asset_District360__c: 'Public Asset Photos',
            Case: 'Service Request Photos',
            default: 'Photos'
        };

        this.label = labels[objectApiName] || labels.default;
    }
    @wire(getRelatedFilesByRecordId, {recordId: '$recordId'})
    wiredResult({data, error}){ 
        if(data){ 
            console.log(data)
            this.fileLogo=data;
            this.filesList = Object.keys(data).map(item=>({"label":data[item],
             "value": item,
             "url":`/sfc/servlet.shepherd/document/download/${item}`
            }))
            console.log(this.filesList)
            
        }
        if(error){ 
            console.log(error)
        }
    }
    previewHandler(event){
        console.log(event.target.dataset.id)
        this[NavigationMixin.Navigate]({ 
            type:'standard__namedPage',
            attributes:{ 
                pageName:'filePreview'
            },
            state:{ 
                selectedRecordId: event.target.dataset.id
            }
        })
    }

 // Getter for the current image URL
  get currentImageUrl() {
    return this.filesList[this.currentIndex]?.url || '';
  }

  // Getter for the current image label
  get currentImageLabel() {
    return this.filesList[this.currentIndex]?.label || '';
  }

  // Getter for the current image ID
  get currentImageId() {
    return this.filesList[this.currentIndex]?.value || '';
  }
   get hasMultipleImages() {
        return this.filesList.length > 1;
    }

  // Method to move to the next image
  nextImage() {
    this.isLoading = true; // Start loading
    this.currentIndex = (this.currentIndex + 1) % this.filesList.length;
  }

  // Method to move to the previous image
  previousImage() {
    this.isLoading = true; // Start loading
    this.currentIndex =
      (this.currentIndex - 1 + this.filesList.length) % this.filesList.length;
  }

  // Handle image load event
  handleImageLoad() {
    this.isLoading = false; // Stop loading when the image is loaded
  }

  // Handle image error event
  handleImageError() {
    this.isLoading = false; // Stop loading if there is an error
    // Optionally, you can show a default image or a message here
  }


}
import { LightningElement,api,track,wire } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';

import {loadScript, loadStyle} from 'lightning/platformResourceLoader';
import leafletjs from '@salesforce/resourceUrl/Leaflet1'

import getAllCases from "@salesforce/apex/COM_Ctrl.getCasedata";
import getFields from "@salesforce/apex/COM_Ctrl.getAvailableFields";
import getFilteredCases from "@salesforce/apex/COM_Ctrl.valuesSelectedFun";
import getFilteredCasesAfterSubmit from "@salesforce/apex/COM_Ctrl.valuesSelectedFunAfterSubmit";
import getFilteredSubCases from "@salesforce/apex/COM_Ctrl.subValuesSelectedFun";
// import getFilteredSub_SubCases from "@salesforce/apex/COM_Ctrl.subSubValuesSelectedFun";
import publicArtIcn from '@salesforce/resourceUrl/Defaultmarker';
import publicArtIcnClean from '@salesforce/resourceUrl/Defaultmarker1';
import publicArtIcnBlack from '@salesforce/resourceUrl/DefaultmarkerBlack';
import publicArtIcnBlue from '@salesforce/resourceUrl/DefaultmarkerBlue';
import publicArtIcnGreen from '@salesforce/resourceUrl/DefaultmarkerGreen';
import publicArtIcnHorticulture from '@salesforce/resourceUrl/DefaultmarkerHorticulture';


import FilterIcon from '@salesforce/resourceUrl/Filter';
import CancelIcn from '@salesforce/resourceUrl/CancelIcon';
import { RefreshEvent } from 'lightning/refresh';
import Heatmap from '@salesforce/resourceUrl/LHeatMap';
import LmarkerClusterJs from '@salesforce/resourceUrl/LmarkerClusterJs';
import LmarkerClusterCss from '@salesforce/resourceUrl/LmarkerClusterCss';




export default class CasesOnMapLWc extends LightningElement {

@track allRecords={};
map1 = '';
    Total;
    isLoaded = false;
    isOpenFence = false;

showMapSelection = false;
    showAccordation = false;

    // @track selectedValue = '';
    @track mapTypeSubtype = {};
    @track mapSubtype_Sub_Subtype = {};
    @track listTypeValues = [];
    @track listLogTypeValues = [];
    @track listIncidentTypeValues = [];
    @track listContactTypeValues = [];
    
    Icon = FilterIcon
    cancel = CancelIcn

    indextoAdd = [];
    indextoRemove = [];
    
    selectedCategories = [];
    subtypeAddMap = {};
    subtypeRemoveMap = {};
            
    sub_subtypeAddMap = {};
    sub_subtypeRemoveMap = {};

    isClosedCases = false;
    isNewCases = false;
    isWorkingCases = false;

    isHighPriority = false;
    isLowPriority = false;
    isMediumPriority = false;

    selectedFromDate ='';
    selectedToDate='';

    @track finalListLat = [];
    @track finalListLong = [];
    
    
    SelectedCasesCount = 0;
    @track mapFieldApiValue = {};  
    @track totalSubValMap = {};
    @track isSubSubtypes = false; 
    @track isSubtypes = false; 
    @track totalSubSubValMap = {};
    @track typSubTyp = {};
    @track subTypSubTyp = {};

    latlngcoordinates = '';
    lat='';
    long='';
    strPolygonPoints ='';
    filteredStr = '';
    finalStr ='';
    isFenced = false;
    mapMarkers=null;
    filteredlocations;
    mapMarkers=[];
    polygonLayer;

    @track finalTypes = [];
    @track finalSubTypes = [];
    @track finalSubSubTypes = [];
@track resultArr = [];
    @track finalFilters;

    isAfterSubmit = false;
    isdrawn = false;
    @track oldPolygonLayers = [];
    isSubmitted = false;

    @track valuesParams = {};    

initRecords = false;
    
     selectedMapType = 'Markers';  // Default view is markers

    mapViewMode = [
        { label: 'Markers', value: 'Markers' },
        { label: 'Heatmap', value: 'Heatmap' },
        { label: 'Clustering', value: 'Clustering' }
    ];

handleMapViewChange(event) {
    this.selectedMapType = event.detail.value;
    console.log('Selected Map Type:', this.selectedMapType);
    if(!this.showMapSelection)
    {
         console.log('Clearing existing layers from the map');
    this.map1.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.HeatLayer || layer instanceof L.MarkerClusterGroup) {
            this.map1.removeLayer(layer);
        }
    });
    console.log('Selected Map Type:', this.selectedMapType);
    console.log('Filter Selected:', this.showMapSelection);
                this.handleLayerType(this.allRecords);

    }
    
    
}

    handleValuesFromFilterComp(event) {
     
    this.indextoAdd = event.detail.arrayAdd;    
    this.indextoRemove = event.detail.arrayRemove;
    this.subtypeAddMap = event.detail.mapAdd;
    this.subtypeRemoveMap = event.detail.mapRemove;
    this.sub_subtypeAddMap = event.detail.submapAdd;
    this.sub_subtypeRemoveMap = event.detail.submapRemove;
    }

    handleDateFromFilterComp(event) {
        // Receive date from FilterChildComp and store it
         this.selectedFromDate = event.detail.startDate;
        this.selectedToDate = event.detail.endDate;
        
    }

    handleStatusFromFilterComp(event) {
        // Receive status boolean from FilterChildComp and store it        
         this.isNewCases = event.detail.newCase;
        this.isClosedCases = event.detail.closedCase;
        this.isWorkingCases = event.detail.workingCase;

    }

    handlePriorityFromFilterComp(event) {
        // Receive priority boolean from FilterChildComp and store it      
         this.isHighPriority = event.detail.highPriority;
        this.isMediumPriority = event.detail.mediumPriority;
        this.isLowPriority = event.detail.lowPriority;

    }
    //Onclick Filter Icon
    openTypes(){
        if(this.showAccordation == false){
            this.showAccordation =  true;
            this.selectedCategories =[];
            this.indextoRemove = [];
            this.indextoAdd = [];
            this.subtypeAddMap = {};
            this.subtypeRemoveMap = {};
            this.sub_subtypeAddMap ={};
            this.sub_subtypeRemoveMap = {};
            this.showMapSelection = true;
                            }
        
    }
    
    //Onclick close button
    closeAccordion(){
        this.showAccordation =  false; 
        this.selectedCategories =[];
        this.indextoRemove = [];
        this.indextoAdd = [];
        this.subtypeAddMap = {};
        this.subtypeRemoveMap = {};
        this.sub_subtypeAddMap ={};
        this.sub_subtypeRemoveMap = {};
                    this.showMapSelection = false;

    }

    
    //onclick refresh 
    refreshComponent(){
               window.location.reload();
      //  eval("$A.get('e.force:refreshView').fire();");
//       let alltypes = this.listTypeValues.map((_, index) => index).join(',');

// console.log(alltypes); 

//                 this.getSelCase(alltypes);

}

    initializeleaflet() {
        const mapRoot = this.template.querySelector(".map-root");
        
        this.map1 = L.map(mapRoot, {
            zoomControl:false
                }).setView([38.9072,-77.0369],13);
        this.layers = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',{
            maxZoom: 20,
                minZoom: 2,
                subdomains:['mt0','mt1','mt2','mt3']
        })
        
        this.map1.addLayer(this.layers); 
        
        L.control.zoom({
            position: 'bottomright'
                }).addTo(this.map1);

  getAllCases()
            
            .then((result) => {
                this.Total = result.totalCasesCount; 
                this.mapTypeSubtype = result.mapTypeSubtype;
                // this.mapSubtype_Sub_Subtype = result.mapTypeSubtype;
                // this.listLogTypeValues = result.listLogTypeValues;
                // this.listIncidentTypeValues = result.listIncidentTypeValues;
                // this.listContactTypeValues = result.listContactTypeValues;
                this.listTypeValues = result.listTypeValues;
        console.log('this.listTypeValues',JSON.stringify(this.listTypeValues));

        console.log('this.typeSubtype',JSON.stringify(this.mapTypeSubtype));
let alltypes = this.listTypeValues.map((_, index) => index).join(',');

console.log(alltypes); 
        this.getSelCase(alltypes);
this.initRecords = true;
            })

                     this.renderGeofencing();

    }
    
    connectedCallback() {
//         getAllCases()
            
//             .then((result) => {
//                 this.Total = result.totalCasesCount; 
//                 this.mapTypeSubtype = result.mapTypeSubtype;
//                 // this.mapSubtype_Sub_Subtype = result.mapTypeSubtype;
//                 // this.listLogTypeValues = result.listLogTypeValues;
//                 // this.listIncidentTypeValues = result.listIncidentTypeValues;
//                 // this.listContactTypeValues = result.listContactTypeValues;
//                 this.listTypeValues = result.listTypeValues;
//         console.log('this.listTypeValues',JSON.stringify(this.listTypeValues));

//         console.log('this.typeSubtype',JSON.stringify(this.mapTypeSubtype));
// // let alltypes = this.listTypeValues.map((_, index) => index).join(',');

// // console.log(alltypes); 
//         // this.getSelCase(alltypes);

//             })
            
            
        Promise.all([
                // loadScript(this, leafletjs + '/leaflet.js'),
                // loadStyle(this, leafletjs + '/leaflet.css'),
                // loadScript(this, leafletjs + '/leaflet.draw.js'),
                // loadStyle(this, leafletjs + '/leaflet.draw.css'),

                loadScript(this, leafletjs + '/leaflet.js')
    .then(() => loadStyle(this, leafletjs + '/leaflet.css'))
    .then(() => {
        // alert('2'); // This alert will execute after both the script and style are loaded.
        return loadScript(this, leafletjs + '/leaflet.draw.js');
    })
    // .then(() => alert('3')) // This alert will execute after the draw script is loaded.
    .then(() => loadStyle(this, leafletjs + '/leaflet.draw.css'))
    // .then(() => alert('4')) // This alert will execute after the draw style is loaded.
   .then(() => loadScript(this, Heatmap))
                 .then(() => loadScript(this, LmarkerClusterJs))
              .then(() => loadStyle(this,LmarkerClusterCss ))
            ])
            
            .then(() => {
                this.initializeleaflet();
            })
            
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error loading D3',
                            message: error.message,
                                variant: 'error'
                                    })
                );
            }); 
        
    
        // to get fields for exporting from custom metadata
        getFields()    
            .then((result) => {
                this.mapFieldApiValue = result.fieldLabelsMap;  
                
        })
        
        
    }

    renderedCallback() {
        this.sfdcBaseURL = window.location.origin;
        
    }

    renderGeofencing(){
    
    //Geo fencing snippet 
 console.log(' renderGeofencing Start ');
        
        this.polygonLayer  = new L.FeatureGroup();
        
        this.drawControl = new L.Control.Draw({
            draw: {
                //polygon: true,
                polygon: {
            icon: new L.DivIcon({
                className: 'leaflet-div-icon leaflet-editing-icon',
                iconSize: [8, 8], // Size of the icon
                html: '<div class="leaflet-pm-icon"><div class="leaflet-pm-drawing-icon">+</div></div>'
            }),
            
        },
        
                    polyline: false,
                        rectangle: false,
                            marker: false,
                                circle: false,
                                    circlemarker : false,
                                        },  
                                        edit: {
            featureGroup: this.polygonLayer, // Enable editing for this group
            edit:false,
            remove: true, // Enable the delete functionality
        },
                                            
                                            position : 'topright'
                                                }).addTo(this.map1);    
        
        this.map1.on('draw:deleted', (event) => {
        console.log('Polygon(s) deleted');
       this.map1.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.HeatLayer || layer instanceof L.MarkerClusterGroup) {
            this.map1.removeLayer(layer);
        }

                    this.finalListLat = [];
                                    this.finalListLong = [];
                                    
this.showMapSelection = false;
                            this.getSelCaseAfterSubmit(this.finalTypes,this.finalSubTypes);
                            this.initRecords =true;
    });

    this.mapMarkers = [];
        console.log('Map refreshed after deletion');
    });

        this.map1.on(L.Draw.Event.CREATED, (e) => {
            var type = e.layerType,
                layer = e.layer;
            if (type === 'marker') {
            }
         
            
            if (type === 'polygon') {
                    if (!this.isdrawn)
                    {
                    this.isdrawn = true; 

                    } 
                    else
                    {
                    for (let i = 0; i < this.oldPolygonLayers.length; i++) {
                    this.map1.removeLayer(this.oldPolygonLayers[i]);
                                this.oldPolygonLayers = []; // Clear the old layers array

                    }

                    }
                            this.oldPolygonLayers.push(layer); // Store old polygon layers
                this.latlngcoordinates = layer.getLatLngs();
                console.log('this.latlngcoordinates '+this.latlngcoordinates);

                            this.finalListLat = [];
                            this.finalListLong = [];
                 
                var strTemp = '';
                
                for (var i = 0; i < this.latlngcoordinates[0].length; i++) {
                    var latlng = this.latlngcoordinates[0][i];
                    var strLat = latlng.lat.toFixed(15);
                    var strLng = latlng.lng.toFixed(15);
    
                    if((this.finalListLat == null ) || (this.finalListLong == null) )
                        {
                            this.finalListLat = [];
                            this.finalListLong = [];
                        }
                                
                            this.finalListLat.push(strLat);
                            this.finalListLong.push(strLng);
                            this.isFenced = true;
                        
                    strTemp = strTemp.concat(strLat +','+strLng+';');
                    this.strPolygonPoints = strTemp;

                    const latlong1 = this.strPolygonPoints ;
                    const latlong = this.latlngcoordinates ;
                    const latlong2 = this.filteredStr ;
                    this.finalStr = this.filteredStr ;
                    const polygon = layer.getBounds();
                    
                        // this.isFenced = true;
                    this.filteredLocations = this.mapMarkers.filter(loc => {
                        var latLng =  L.latLng(loc.Latitude_District360__c,loc.longitude_District360__c);
                        const pol =  polygon.contains(latLng);
                        return  layer.getBounds().contains(latLng);
                        
                    })
                    
                    

                    }    

                    if(this.isAfterSubmit )
                        {
                            if((this.finalListLat == null ) || (this.finalListLong == null) )
                                {
                                    this.finalListLat = [];
                                    this.finalListLong = [];
                                }
                            this.finalListLat.push(strLat);
                            this.finalListLong.push(strLng);
                            this.isFenced = false;
                            // alert(this.finalSubTypes);
                            // alert(this.finalSubTypes == []);
                            console.log("Final Types:", JSON.stringify(this.finalTypes));
                            console.log("Final Sub Types:", this.finalSubTypes);
            this.showMapSelection = true;
                            this.getSelCaseAfterSubmit(this.finalTypes,this.finalSubTypes);

                        }
                    
                    // console.log('this.finalListLat '+this.finalListLat);
                    //     console.log('this.finalListLong '+this.finalListLong);
                      
                         
            }   
            this.polygonLayer.addLayer(layer);       
            
            
        });
        this.map1.addLayer(this.polygonLayer);
         console.log(' renderGeofencing End ');

    }




 handleSelectedValues(event) {
        const selectedValue = event.detail.Value;
        this.isSubmitted = event.detail.Submitted;
        this.getSelCase(selectedValue);
    }

    handleSelectedSubValues(event) {
        const selectedValue = event.detail.Value;
        const selectedSubValue = event.detail.SubValue;
        this.isSubmitted = event.detail.Submitted;
        this.getSelSubCase(selectedValue,selectedSubValue);
    }

    handleSelectedSubSubValues(event) {
        const selectedValue = event.detail.Value;
        const selectedSubValue = event.detail.SubValue;
        const selectedSub_SubValue = event.detail.SubSubValue;
        this.isSubmitted = event.detail.Submitted;
        //this.getSelSub_SubCase(selectedValue,selectedSubValue,selectedSub_SubValue);
    }

// Updated getSelCaseAfterSubmit method
getSelCaseAfterSubmit(selectedValueList, selectedSubValueList) {
    console.log("Final Types:", this.finalTypes);
console.log("Final Sub Types:", this.finalSubTypes);

    console.log('selectedValueList'+selectedValueList);
    console.log('selectedSubValueList '+selectedSubValueList);
    console.log('getSelCaseAfterSubmit Start');
    this.isLoaded = true;
    this.isExport = true;

    // Clear layers on map
    console.log('Clearing existing layers from the map');
    this.map1.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.HeatLayer || layer instanceof L.MarkerClusterGroup) {
            this.map1.removeLayer(layer);
        }
    });

    this.mapMarkers = [];
    this.isAfterSubmit = true;

    console.log('Preparing data parameters');
    this.valuesParams = {
        listSelectedValues: selectedValueList,
        selectedSubTypes: selectedSubValueList,
        strFromDate: this.selectedFromDate || null,
        strToDate: this.selectedToDate || null,
        isNewStatus: this.isNewCases,
        isClosedStatus: this.isClosedCases,
        isWorkingCases:this.isWorkingCases,
        isHighPriority: this.isHighPriority,
        isMediumPriority: this.isMediumPriority,
        isLowPriority:this.isLowPriority,
        lstLat: this.finalListLat || [],
        lstLong: this.finalListLong || [],
        typSubtypMap: this.typSubTyp,
        subtypSubSubtypMap: this.subTypSubTyp,
        isSubSubtypes: this.isSubSubtypes,
        isSubtypes: this.isSubtypes,
    };

    console.log('Fetching filtered cases after submit');
    getFilteredCasesAfterSubmit({ params: JSON.stringify(this.valuesParams) })
        .then((result) => {
            console.log('Filtered Cases Result:', result);
            const records = result.cases;
           // this.SelectedCasesCount = result.selectedCasesCounts;
            if(this.initRecords)
            {
            this.SelectedCasesCount = 0;
            this.initRecords =false;

            }
            else
            {
            this.SelectedCasesCount = result.selectedCasesCounts;
            }
            this.mapMarkers = result.cases;
            this.finalTypes = result.finalTypes;

            console.log('Number of Selected Cases:', this.SelectedCasesCount);
            console.log('Map Markers:', this.mapMarkers);
            console.log('Final Types:', this.finalTypes);
            console.log('Data fetched successfully, displaying layer type');
            this.handleLayerType(result.cases);
            this.isLoaded = false;
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            this.error = error;
        });
}

// Similar changes to getSelSubCase and getSelCase methods
getSelSubCase(selectedValue, selectedSubValue) {
    console.log('getSelSubCase Start');
        console.log('selectedValue'+selectedValue);
    console.log('selectedSubValue '+selectedSubValue);
    this.isLoaded = true;
    this.isExport = true;
        // Clear layers on map
    console.log('Clearing existing layers from the map');
    this.map1.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.HeatLayer || layer instanceof L.MarkerClusterGroup) {
            this.map1.removeLayer(layer);
        }
    });

    this.mapMarkers = [];
    this.isAfterSubmit = true;

    console.log('Preparing data parameters for selected sub-case');
    this.valuesParams = {
        strTypeValString: selectedValue,
        strSubTypeValString: selectedSubValue,
        strFromDate: this.selectedFromDate || null,
        strToDate: this.selectedToDate || null,
        isNewStatus: this.isNewCases,
        isClosedStatus: this.isClosedCases,
        isWorkingCases:this.isWorkingCases,
        isHighPriority: this.isHighPriority,
        isMediumPriority: this.isMediumPriority,
        isLowPriority:this.isLowPriority,
        lstLat: this.finalListLat || [],
        lstLong: this.finalListLong || [],
    };

    console.log('Fetching filtered sub-cases');
    getFilteredSubCases({ params: JSON.stringify(this.valuesParams) })
        .then((result) => {
             console.log('Filtered Sub Cases Result:', result);
            const records = result.cases;
            this.SelectedCasesCount = result.cases.length;
            this.mapMarkers = result.cases;
            this.finalTypes = result.finalTypes;
            this.finalSubTypes = result.finalSubTypes;
            this.typSubTyp = result.totalSubValMap;
            this.isSubtypes = result.isSubtypes;

            console.log('Number of Selected Cases:', this.SelectedCasesCount);
   console.log('Map Markers:', this.mapMarkers);
            console.log('Final Types:', this.finalTypes);
            console.log('Final Sub Types:', this.finalSubTypes);
            console.log('Data fetched successfully, displaying layer type');
            this.handleLayerType(result.cases);
            this.isLoaded = false;
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            this.error = error;
        });
}

getSelCase(selectedValue) {
    console.log('getSelCase Start');
        console.log('selectedValue'+selectedValue);
   // console.log('selectedSubValueList '+selectedSubValueList);
    this.isLoaded = true;
    this.isExport = true;
        // Clear layers on map
    console.log('Clearing existing layers from the map');
    console.log('Clearing existing layers from the map',this.map1.eachLayer);
if(!this.initRecords)
            {
            
    this.map1.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.HeatLayer || layer instanceof L.MarkerClusterGroup) {
            this.map1.removeLayer(layer);
        }
    });

            }
    this.mapMarkers = [];
    this.isAfterSubmit = true;
this.initRecords =false;

    console.log('Preparing data parameters for selected case');
    this.valuesParams = {
        strTypeValString: selectedValue,
        strFromDate: this.selectedFromDate || null,
        strToDate: this.selectedToDate || null,
        isNewStatus: this.isNewCases,
        isClosedStatus: this.isClosedCases,
        isWorkingCases:this.isWorkingCases,
        isHighPriority: this.isHighPriority,
        isMediumPriority: this.isMediumPriority,
        isLowPriority:this.isLowPriority,
        lstLat: this.finalListLat || [],
        lstLong: this.finalListLong || [],
    };

    console.log('Fetching filtered cases',JSON.stringify(this.valuesParams));
    getFilteredCases({ params: JSON.stringify(this.valuesParams) })
        .then((result) => {
            console.log('Filtered Cases Result:', result);
            const records = result.cases;
            if(!this.showMapSelection)
            {
                console.log('result.cases',result.cases);
                console.log('result.cases',JSON.stringify(result.cases));
this.allRecords = result.cases;
                console.log('this.allRecords',this.allRecords);
                console.log('this.allRecords',JSON.stringify(this.allRecords));


            }
            if(this.initRecords)
            {
            this.SelectedCasesCount = 0;
            this.initRecords =false;

            }
            else
            {
            this.SelectedCasesCount = result.selectedCasesCounts;
            }
            this.mapMarkers = result.cases;
            this.finalTypes = result.finalTypes;

            console.log('Number of Selected Cases:', this.SelectedCasesCount);
            console.log('Map Markers:', this.mapMarkers);
            console.log('Final Types:', this.finalTypes);
            console.log('Data fetched successfully, displaying layer type');
            this.handleLayerType(result.cases);
            this.isLoaded = false;
        })
        .catch((error) => {
            console.error('Error fetching data:', error);
            this.error = error;
        });
}

// Helper function to display layer based on selection
handleLayerType(records) {
    console.log(`Displaying layer type 11 : ${this.selectedMapType}`);
    if (this.selectedMapType === 'Markers') {
        this.displayMarkers(records);
    } else if (this.selectedMapType === 'Heatmap') {
        console.log('Heatmap In');
        this.displayHeatmap(records);
        console.log('Heatmap In');
    } else if (this.selectedMapType === 'Clustering') {
        console.log('Clustering In');
        this.displayClustering(records);
        console.log('Clustering OUT');
    }
}

// Render markers
displayMarkers(records) {
    console.log('Rendering markers on map');
    records.forEach(record => {
        let lat = record['Latitude_District360__c'];
        let long = record['longitude_District360__c'];
        let type = record['Service_Request_Type__c'];
        let caseno = record['CaseNumber'];
        let status = record['Status'];
        let recid = record['Id'];

        let iconUrl;
        switch(type) {
            case 'Cleaning': iconUrl = publicArtIcnClean; break;
            case 'Outreach': iconUrl = publicArtIcnBlue; break;
            case '311': iconUrl = publicArtIcnBlack; break;
            case 'Security': iconUrl = publicArtIcnGreen; break;
            case 'Horticulture': iconUrl = publicArtIcnHorticulture; break;
            default: iconUrl = publicArtIcn;
        }

        let marker = L.marker([lat, long], {
            icon: L.icon({ iconUrl, iconSize: [45, 45] })
        }).bindPopup(`Case No: ${caseno}<br>Type: ${type}<br>Status: ${status}<br><a href=${this.sfdcBaseURL}/${recid} target="_blank">View Case</a>`);

       // console.log(`Adding marker for Case No: ${caseno}`);
        this.map1.addLayer(marker);
    });
}

// Render heatmap
// displayHeatmap(records) {
//     console.log('Rendering heatmap on map');
//     const heatPoints = records.map(record => [
//         record['Latitude_District360__c'],
//         record['longitude_District360__c'],
//         0.5 // intensity
//     ]);

//     const heatLayer = L.heatLayer(heatPoints, { radius: 25 });
//     console.log('Adding heat layer to map');
//     this.map1.addLayer(heatLayer);
// }
// Render heatmap with intensity based on priority
displayHeatmap(records) {
    console.log('Rendering heatmap on map with priority-based intensity and color');

    // Prepare heat points with intensity based on priority
    const heatPoints = records.map(record => {
        let priority = record['Priority']; // Assuming priority field is 'Priority__c'
        let lat = record['Latitude_District360__c'];
        let long = record['longitude_District360__c'];

        // Set intensity based on priority level
        let intensity;
        switch(priority) {
            case 'High':
                intensity = 1.0; // High priority
                break;
            case 'Medium':
                intensity = 0.8; // Medium priority
                break;
            case 'Low':
                intensity = 0.6; // Low priority
                break;
            default:
                intensity = 0.7; // Default intensity for unclassified priority
        }

        return [lat, long, intensity];
    });

    // Configure heat layer with custom gradient
    const heatLayer = L.heatLayer(heatPoints, {
        radius: 35,
                    blur: 15,
                    maxZoom: 17,
        gradient: {
             0.5: 'Yellow',
            0.6: 'Yellow',   // Low priority
            0.8: 'orange',
            1.0: 'red'     // High priority
        }
    });

    console.log('Adding heat layer with priority-based coloring to map');
    this.map1.addLayer(heatLayer);
}

// Render clustering
displayClustering(records) {
    console.log('Rendering clustering on map');
    const clusterGroup = L.markerClusterGroup();
    records.forEach(record => {
        let lat = record['Latitude_District360__c'];
        let long = record['longitude_District360__c'];
        let type = record['Service_Request_Type__c'];
        let caseno = record['CaseNumber'];
        let status = record['Status'];
        let recid = record['Id'];

        let iconUrl;
        switch(type) {
            case 'Cleaning': iconUrl = publicArtIcnClean; break;
            case 'Outreach': iconUrl = publicArtIcnBlue; break;
            case '311': iconUrl = publicArtIcnBlack; break;
            case 'Security': iconUrl = publicArtIcnGreen; break;
                        case 'Horticulture': iconUrl = publicArtIcnHorticulture; break;
            default: iconUrl = publicArtIcn;
        }

        let marker = L.marker([lat, long], {
            icon: L.icon({ iconUrl, iconSize: [45, 45] })
        }).bindPopup(`Case No: ${caseno}<br>Type: ${type}<br>Status: ${status}<br><a href=${this.sfdcBaseURL}/${recid} target="_blank">View Case</a>`);

       // console.log(`Adding marker to cluster group for Case No: ${caseno}`);
        clusterGroup.addLayer(marker);
    });
    console.log('Adding cluster group to map');
    this.map1.addLayer(clusterGroup);
}
}
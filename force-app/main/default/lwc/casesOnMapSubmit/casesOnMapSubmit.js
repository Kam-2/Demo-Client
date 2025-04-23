import { LightningElement , api,track} from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
export default class CasesOnMapSubmit extends LightningElement {
    @api indextoAdd1 = [];
    @api indextoRemove1 = [];

    @api subtypeAddMap1 = {};
    @api subtypeRemoveMap1 = {};
            
    @api subSubtypeAddMap = {};
    @api subSubtypeRemoveMap = {};

    indextoAdd = [];
    indextoRemove = [];

    subtypeAddMap = {};
    subtypeRemoveMap = {};
            
    sub_subtypeAddMap = {};
    sub_subtypeRemoveMap = {};
    
    @track isSubmitted = false;
                                    
    onSubmit(){
        this.isSubmitted = true;
        
        //to convert the proxyarray to array - type
        const typeAddArray = Array.from(this.indextoAdd1);
        this.indextoAdd = typeAddArray;
        
        const typeRemoveArray = Array.from(this.indextoRemove1);
        this.indextoRemove = typeRemoveArray;
        
        //to convert the proxyMap to map - subtype
        const addMap = { ...this.subtypeAddMap1};
            for (const key in addMap) {
                if (Array.isArray(addMap[key])) {
                    this.subtypeAddMap[key] = Object.values(addMap[key]);
                }
            }
        
        const removeMap = { ...this.subtypeRemoveMap1};
            for (const key in removeMap) {
                if (Array.isArray(removeMap[key])) {
                    this.subtypeRemoveMap[key] = Object.values(removeMap[key]);
                }
            }
        
        //to convert the proxyMap to map - subtype
        const addSubMap = { ...this.subSubtypeAddMap};
            for (const key in addSubMap) {
                if (Array.isArray(addSubMap[key])) {
                    this.sub_subtypeAddMap[key] = Object.values(addSubMap[key]);
                }
            }
        
        const removeSubMap = { ...this.subSubtypeRemoveMap};
            for (const key in removeSubMap) {
                if (Array.isArray(removeSubMap[key])) {
                    this.sub_subtypeRemoveMap[key] = Object.values(removeSubMap[key]);
                }
            }
        
        if ((this.indextoAdd.length > 0 || this.indextoRemove.length > 0) && (Object.keys(this.subtypeAddMap).length == 0 && Object.keys(this.subtypeRemoveMap).length == 0  && Object.keys(this.sub_subtypeAddMap).length == 0 && Object.keys(this.sub_subtypeRemoveMap).length == 0) )
        {
            if (this.indextoAdd.length > 0 && this.indextoRemove.length == 0 ){
                
                const string = this.indextoAdd.join(',');
                this.handleType(string);
                
            }
            
            if (this.indextoAdd.length > 0 && this.indextoRemove.length > 0 ) {
                // Convert the arrays to sets for easier comparison                
                const filteredC = this.indextoRemove.filter((element) => typeof element === "string");

                var stringArray = this.indextoAdd.map(String);
                var stringRemoveArray = filteredC.map(String);

                var countToAdd = {};
                    var countToRemove = {};
                        
                        stringArray.forEach(element => {
                            countToAdd[element] = (countToAdd[element] || 0) + 1;
                        });
                
                stringRemoveArray.forEach(element => {
                    countToRemove[element] = (countToRemove[element] || 0) + 1;
                });
                
                var remainingIndexes = Object.keys(countToAdd).filter(element => {
                    var countDifference = countToAdd[element] - (countToRemove[element] || 0);
                    return countDifference > 0;
                }).map(Number);
                
                if (remainingIndexes.length > 0){     
                    // Convert the remaining indexes array to a string
                    var remainingIndexesString = remainingIndexes.join(',');
                    
                    this.handleType(remainingIndexesString);
                    
                    
                    
                }  
                else {    
                    //Nothing selected
                }
                
            }
            
        }
        
        if ((Object.keys(this.subtypeAddMap).length > 0 || Object.keys(this.subtypeRemoveMap).length > 0) && (Object.keys(this.sub_subtypeAddMap).length == 0 && Object.keys(this.sub_subtypeRemoveMap).length == 0))
        {
            if (this.indextoAdd.length > 0 && this.indextoRemove.length == 0 ){
                const string = this.indextoAdd.join(',');
                
            }
            
            if (this.indextoAdd.length == 0 && this.indextoRemove.length > 0 ){
                const string = this.indextoRemove.join(',');
                
            }
            
            if (this.indextoAdd.length > 0 ) {
                // Convert the arrays to sets for easier comparison
                const filteredC = this.indextoRemove.filter((element) => typeof element === "string");
                
                var stringArray = this.indextoAdd.map(String);
                var stringRemoveArray = filteredC.map(String);
                
                var countToAdd = {};
                    var countToRemove = {};
                        
                        stringArray.forEach(element => {
                            countToAdd[element] = (countToAdd[element] || 0) + 1;
                        });
                
                stringRemoveArray.forEach(element => {
                    countToRemove[element] = (countToRemove[element] || 0) + 1;
                });
                
                var remainingIndexes = Object.keys(countToAdd).filter(element => {
                    var countDifference = countToAdd[element] - (countToRemove[element] || 0);
                    return countDifference > 0;
                }).map(Number);
                
                if (remainingIndexes.length > 0){     
                    // Convert the remaining indexes array to a string
                    var remainingIndexesString = remainingIndexes.join(',');
                }    
            }
            var valuesAreSame = false;
            
            if (this.indextoAdd.length === this.indextoRemove.length) {
                valuesAreSame = this.indextoAdd.every(value => this.indextoRemove.includes(value));
            }

            if (remainingIndexes.length > 0){
                
                if (valuesAreSame) {
                    // Values in indextoRemove and indextoAdd are the same
                } 
                else {
                    
                    if (Object.keys(this.subtypeRemoveMap).length > 0 && Object.keys(this.subtypeAddMap).length == 0) 
                    {
                        // Convert subtypeRemoveMap to string
                        var subtypeRemoveMapString = JSON.stringify(this.subtypeRemoveMap);
                        this.handleSubType(remainingIndexesString,subtypeRemoveMapString);
                        
                    }
                    
                    if ((Object.keys(this.subtypeAddMap).length > 0) && (Object.keys(this.subtypeRemoveMap).length > 0)) 
                    {
                        
                        // Convert subtypeAddMap to string
                        var subtypeAddMapString = JSON.stringify(this.subtypeAddMap);
                        // Convert subtypeAddMap to string
                        var subtypeRemoveMapString = JSON.stringify(this.subtypeRemoveMap);
                        
                        var mapA = this.subtypeAddMap ;
                        for (let key in mapA) {
                            mapA[key] = mapA[key].map(value => `${value}`);
                        }
                        
                        var mapB = this.subtypeRemoveMap;
                        for (let key in mapB) {
                            mapB[key] = mapB[key].map(value => `${value}`);
                        }
                        
                        var mapC = {};
                            
                            for (var key in mapB) {
                                var valuesA = mapA[key];
                                var valuesB = mapB[key];
                                
                                if (valuesA) {
                                    var countA = {};
                                        var filteredValues = [];
                                    
                                    // Count occurrences of values in mapA
                                    for (var i = 0; i < valuesA.length; i++) {
                                        var value = valuesA[i];
                                        if (countA[value]) {
                                            countA[value]++;
                                        } else {
                                            countA[value] = 1;
                                        }
                                    }
                                    
                                    // Remove common values between mapA and mapB
                                    for (var i = 0; i < valuesB.length; i++) {
                                        var value = valuesB[i];
                                        if (countA[value] && countA[value] > 0) {
                                            countA[value]--;
                                        } else {
                                            filteredValues.push(value);
                                        }
                                    }
                                    
                                    if (filteredValues.length > 0) {
                                        mapC[key] = filteredValues;
                                    }
                                } else {
                                    mapC[key] = valuesB;
                                }
                            }
                        
                        var mapCString = JSON.stringify(mapC);
                        
                        this.handleSubType(remainingIndexesString,mapCString);
                        
                        
                    }
                }
            }
            else {
                // Nothing selected type and subtype
            }
            
        }
        if ((Object.keys(this.sub_subtypeAddMap).length > 0 || Object.keys(this.sub_subtypeRemoveMap).length > 0) )
        {
            if (this.indextoAdd.length > 0 && this.indextoRemove.length == 0 ){
                const string = this.indextoAdd.join(',');
                const array = string.split(' ');
            }
            
            if (this.indextoAdd.length == 0 && this.indextoRemove.length > 0 ){
                const string = this.indextoRemove.join(',');
                const array = string.split(' ');
            }
            
            if (this.indextoAdd.length > 0 ) {
                // Convert the arrays to sets for easier comparison
                const filteredC = this.indextoRemove.filter((element) => typeof element === "string");
                var stringArray = this.indextoAdd.map(String);
                var stringRemoveArray = filteredC.map(String);
                
                var countToAdd = {};
                    var countToRemove = {};
                        
                        stringArray.forEach(element => {
                            countToAdd[element] = (countToAdd[element] || 0) + 1;
                        });
                
                stringRemoveArray.forEach(element => {
                    countToRemove[element] = (countToRemove[element] || 0) + 1;
                });
                
                var remainingIndexes = Object.keys(countToAdd).filter(element => {
                    var countDifference = countToAdd[element] - (countToRemove[element] || 0);
                    return countDifference > 0;
                }).map(Number);
            
                if (remainingIndexes.length > 0){     
                    // Convert the remaining indexes array to a string
                    var remainingIndexesString = remainingIndexes.join(',');
                }    
                
            }
            // Create the subtype string to get values 
            var subtypeSelected = '';
            
            if (Object.keys(this.subtypeRemoveMap).length > 0 && Object.keys(this.subtypeAddMap).length == 0) 
            {
                // Convert subtypeRemoveMap to string
                var subtypeRemoveMapString = JSON.stringify(this.subtypeRemoveMap);
                subtypeSelected = subtypeRemoveMapString;                            
            }
            
            
            
            if ((Object.keys(this.subtypeAddMap).length > 0) && (Object.keys(this.subtypeRemoveMap).length > 0)) 
            {
                // Convert subtypeAddMap to string
                var subtypeAddMapString = JSON.stringify(this.subtypeAddMap);
                // Convert subtypeAddMap to string
                var subtypeRemoveMapString = JSON.stringify(this.subtypeRemoveMap);
                
                var mapA = this.subtypeAddMap ;
                for (let key in mapA) {
                    mapA[key] = mapA[key].map(value => `${value}`);
                }
                
                var mapB = this.subtypeRemoveMap;
                for (let key in mapB) {
                    mapB[key] = mapB[key].map(value => `${value}`);
                }
                
                var mapC = {};
                    
                    for (var key in mapB) {
                        var valuesA = mapA[key];
                        var valuesB = mapB[key];
                        
                        if (valuesA) {
                            var countA = {};
                                var filteredValues = [];
                            
                            // Count occurrences of values in mapA
                            for (var i = 0; i < valuesA.length; i++) {
                                var value = valuesA[i];
                                if (countA[value]) {
                                    countA[value]++;
                                } else {
                                    countA[value] = 1;
                                }
                            }
                            
                            // Remove common values between mapA and mapB
                            for (var i = 0; i < valuesB.length; i++) {
                                var value = valuesB[i];
                                if (countA[value] && countA[value] > 0) {
                                    countA[value]--;
                                } else {
                                    filteredValues.push(value);
                                }
                            }
                            
                            if (filteredValues.length > 0) {
                                mapC[key] = filteredValues;
                            }
                        } else {
                            mapC[key] = valuesB;
                        }
                    }
                
                var mapCString = JSON.stringify(mapC);
                
                subtypeSelected = mapCString;
            }
            let valuesAreSame = false;
            
            if (this.indextoAdd.length === this.indextoRemove.length) {
                valuesAreSame = this.indextoAdd.every(value => this.indextoRemove.includes(value));
            }
            if (remainingIndexes.length > 0){
                
                if (valuesAreSame) {
                    // Values in indexesToRemove and indexesToAdd are the same
                } 
                else {
                    
                    if (Object.keys(this.sub_subtypeRemoveMap).length > 0 && Object.keys(this.sub_subtypeAddMap).length == 0) 
                    {
                        // Convert sub_subtypeRemoveMap to string
                        var mapCString = JSON.stringify(this.sub_subtypeRemoveMap);
                        
                        
                        if ((subtypeSelected == '' || subtypeSelected == null || subtypeSelected == '{}') && (mapCString == '' || mapCString == null || mapCString == '{}') )
                        {
                            this.handleType(remainingIndexesString);
                        }
                        else if ((mapCString == '' || mapCString == null || mapCString == '{}') )
                        {
                            this.handleSubType(remainingIndexesString,subtypeSelected);
                        }
                        else {
                            if ((subtypeSelected == '' || subtypeSelected == null || subtypeSelected == '{}'))
                            {
                                subtypeSelected = {};
                                    }
                            this.handleSubSubType(remainingIndexesString,subtypeSelected,mapCString);
                        }
                        
                    }
                    
                    if ((Object.keys(this.sub_subtypeAddMap).length > 0) && (Object.keys(this.sub_subtypeRemoveMap).length > 0)) 
                    {
                        // Convert sub_subtypeAddMap to string
                        var subtypeAddMapString = JSON.stringify(this.sub_subtypeAddMap);
                        // Convert sub_subtypeAddMap to string
                        var subtypeRemoveMapString = JSON.stringify(this.sub_subtypeRemoveMap);
                        
                        var mapA = this.sub_subtypeAddMap ;
                        for (let key in mapA) {
                            mapA[key] = mapA[key].map(value => `${value}`);
                        }
                        
                        var mapB = this.sub_subtypeRemoveMap;
                        for (let key in mapB) {
                            mapB[key] = mapB[key].map(value => `${value}`);
                        }
                        
                        var mapC = {};
                            
                            for (var key in mapB) {
                                var valuesA = mapA[key];
                                var valuesB = mapB[key];
                                
                                if (valuesA) {
                                    var countA = {};
                                        var filteredValues = [];
                                    
                                    // Count occurrences of values in mapA
                                    for (var i = 0; i < valuesA.length; i++) {
                                        var value = valuesA[i];
                                        if (countA[value]) {
                                            countA[value]++;
                                        } else {
                                            countA[value] = 1;
                                        }
                                    }
                                    
                                    // Remove common values between mapA and mapB
                                    for (var i = 0; i < valuesB.length; i++) {
                                        var value = valuesB[i];
                                        if (countA[value] && countA[value] > 0) {
                                            countA[value]--;
                                        } else {
                                            filteredValues.push(value);
                                        }
                                    }
                                    
                                    if (filteredValues.length > 0) {
                                        mapC[key] = filteredValues;
                                    }
                                } else {
                                    mapC[key] = valuesB;
                                }
                            }
                        
                        var mapCString = JSON.stringify(mapC);
                        
                        if ((subtypeSelected == '' || subtypeSelected == null || subtypeSelected == '{}') && (mapCString == '' || mapCString == null || mapCString == '{}') )
                        {
                            this.handleType(remainingIndexesString);
                        }
                        else if ((mapCString == '' || mapCString == null || mapCString == '{}') )
                        {
                            this.handleSubType(remainingIndexesString,subtypeSelected);               
                        }
                        else {
                            if ((subtypeSelected == '' || subtypeSelected == null || subtypeSelected == '{}'))
                            {
                                subtypeSelected = '{}';
                            }
                            this.handleSubSubType(remainingIndexesString,subtypeSelected,mapCString);
                        }
                    }
                }
            }
            else {
                // Nothing selected type, subtype and sub-subtype
            }
            
        }
        
        if ((this.indextoAdd.length == 0 && this.indextoRemove.length == 0) && (Object.keys(this.subtypeAddMap).length == 0 && Object.keys(this.subtypeRemoveMap).length == 0) && (Object.keys(this.sub_subtypeAddMap).length == 0 && Object.keys(this.sub_subtypeRemoveMap).length == 0) )
        {
            this.isLoaded = false;
            this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
            message: 'No Service Request Types are selected',
            variant: 'Error'
                                    })
                );
                this.isSubmitted = false;
        }
        
        
    }

    handleType(selectedValue) {
        const customEvent = new CustomEvent('passselectedvalues', {
           detail: {
                Value: selectedValue,
                    Submitted: this.isSubmitted
                        }
                });
        this.dispatchEvent(customEvent);
    }

    handleSubType(selectedValue,selectedSubValue) {
        const customEvent = new CustomEvent('passselectedsubvalues', {
            detail: {
                Value: selectedValue,
                    SubValue: selectedSubValue,
                    Submitted: this.isSubmitted
                        }
        });
        this.dispatchEvent(customEvent);
    }

    handleSubSubType(selectedValue,selectedSubValue,selectedSub_SubValue) {
        const customEvent = new CustomEvent('passselectedsubsubvalues', {
            detail: {
                Value: selectedValue,
                    SubValue: selectedSubValue,
                        SubSubValue: selectedSub_SubValue,
                        Submitted: this.isSubmitted
                            }
        });
        this.dispatchEvent(customEvent);
    }

    closeAccordion(){
        const customEvent = new CustomEvent('passcloseaccord', {
                });
        this.dispatchEvent(customEvent);
    }
               
}
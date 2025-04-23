({
    init: function (cmp, event, helper) {
        var records = cmp.get('v.accountRecord');
        console.log(JSON.parse(JSON.stringify(records)));
        console.log(records.Address_District360__c);
        console.log(records.Latitude_District360__c);
        console.log(records.longitude_District360__c);
        cmp.set('v.mapMarkers', [
            {
                location: {
                    
                    Latitude: records.Latitude_District360__c,
                    Longitude: records.longitude_District360__c
                  /*  Street: records.Address_District360__c,
                    City: records.Address_District360__c,
                    State: records.Address_District360__c,
                    PostalCode: records.Address_District360__c */
                },

                title: records.CaseNumber,
                description: ''
            }
        ]);
        cmp.set('v.zoomLevel', 18);
    }

})
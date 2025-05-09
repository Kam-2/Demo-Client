/**************************************************************************************
* Class Name			: COM_Batch                        CodeCoverage = 91%
* Created Date			: 01-11-2023
* Created By			: Vigneswaran
* Class Description	    : This batch class is to get all the records as CSV file based on the final selections including filters 
							and polygon coordinates amd save to user files and also custom notification will be sent to user.
						* Schedule a class COM_Scheduleclass after creation of file 
						* On click Export button it will be called by COM_Ctrl
***************************************************************************************/
public class COM_Batch implements Database.Stateful,Database.Batchable<sObject> {
    
    private String csvData;
    //public String dynamicQuery;
    private List<String>lstSelected;
    private Map<string,string> mapFieldApiValue;
    private List<String> csvLines {get;set;}
    private List<String> selectedTypes;
    private List<String> selectedSubTypes;
    private List<String> statusValues;
    private List<String> priorityValues;
    private DateTime dateTimeValueFrom;
    private DateTime dateTimeValueTo;
    private DateTime localTime;
    private List<Decimal> finalLat;
    private List<Decimal> finalLong;
    private String minLat;
    private String maxLat;
    private String minLong;
    private String maxLong;
    //public Map<String,List<String>> totalSubValMap;
    private Map<String,List<String>> typSubtypMap;
    private Map<String,List<String>> subtypSubSubtypMap;
    //public boolean isSubSubtypes;
    //public boolean isSubtypes;
    private COM_Ctrl.FilteredCasesParams filparams;
    
    public COM_Batch(COM_Ctrl.FilteredCasesParams params)
        /*String dynamicQuery,List<String>selLabels, Map<string,string> selLabelMap,List<String>finValues,List<String>finSubValues,
Map<String,List<String>>SubValMap,List<String>selStatus, DateTime fromdate, DateTime toDate,List<Decimal>latitudeList,
List<Decimal>longitudeList, 
Map<String,List<String>>typSubtypMap,Map<String,List<String>>subtypSubSubtypMap,boolean isSubSubtypes,boolean isSubtypes) */
    { 
        system.debug(params);
        
        initializeParameters(params);
        // Create the header row based on labels
        List<String> headerRow = new List<String>();
        for (String selectedValue : lstSelected) {
            if (mapFieldApiValue.containsKey(selectedValue)) {
                headerRow.add(mapFieldApiValue.get(selectedValue));
            } else {
                headerRow.add(selectedValue); // Use the value as a label.
            }
        }
        csvLines.add(String.join(headerRow, ','));
        
    }
    
    public Database.QueryLocator start(Database.BatchableContext context) {
        return Database.getQueryLocator(filparams.dynamicQuery);
    }
    
    public void execute(Database.BatchableContext context, List<Case> scope) {
        List<case> records = new List<case>();
        if(!filparams.isSubtypes && !filparams.isSubSubtypes)
        {
            for (Case c : scope) {
                records.add(c);
            }
        }
        
        if(filparams.isSubtypes)
        {
            records = COM_FilterRecord.filSubRecords(scope,filparams.typSubtypMap);   
        }
        
        if(filparams.isSubSubtypes)
        {
            records = COM_FilterRecord.filSubSubRecords(scope,filparams.typSubtypMap,filparams.subtypSubSubtypMap);
            
        }
        
        if (!this.finalLat.isEmpty() && !this.finalLong.isEmpty()) {
            
            processRecordsWithinPolygon(records);
        }
        else
        {
            processRecords(records);
        }
        
    }
    public void finish(Database.BatchableContext context) {
        system.debug('localtime at batch finish' +localTime.formatGmt('dd-MM-yyyy HH:mm:ss'));
        // Create the CSV data as a string
        this.csvData = String.join(csvLines, '\n');
        system.debug(this.csvData);
        csvData = String.join(csvLines, '\n');
        system.debug(csvData);
        
        Blob csvBlob = Blob.valueOf(csvData);
        string fileTitle = 'Exported_Cases - '+localTime.formatGmt('dd-MM-yyyy HH:mm:ss');
        ContentVersion contentVersion = new ContentVersion();
        contentVersion.VersionData = csvBlob;
        contentVersion.Title = fileTitle;
        contentVersion.PathOnClient = 'Exported_Cases.csv';
        contentVersion.FirstPublishLocationId = UserInfo.getUserId(); // Associate with a record
        insert contentVersion;
        
          Geofencing_Export_Fields__mdt metadataRecord;
        if (Schema.sObjectType.Geofencing_Export_Fields__mdt.isAccessible()) {
            metadataRecord = [SELECT No_of_days_for_removing_file__c FROM Geofencing_Export_Fields__mdt ];
        }    
        Integer daysToRemove = metadataRecord.No_of_days_for_removing_file__c.intValue();
        Integer hoursToRemove = daysToRemove * 24;

        CustomNotificationType notificationType = [SELECT Id FROM CustomNotificationType WHERE DeveloperName = 'Case_Custom_Notification' LIMIT 1];
        
        Messaging.CustomNotification notification = new Messaging.CustomNotification();
        notification.setTitle('Hi '+UserInfo.getName());
        notification.setNotificationTypeId(notificationType.Id);
        notification.setBody('Requested geofencing CSV file has been saved in files! Requested time: ' + localTime.formatGmt('dd-MM-yyyy HH:mm:ss') + ' \n Click to download the file'+ ' \n It will only be accessible for the next '+hoursToRemove+' hours before being automatically removed.');
        
        Set<String> recipientsIds = new Set<String>();
        recipientsIds.add(UserInfo.getUserId());  // Replace 'UserId1' with the actual User ID
        
        String targetPageRef = URL.getOrgDomainURL().toExternalForm()+'/lightning/r/ContentDocument/' + contentVersion.Id + '/view';
        system.debug(targetPageRef);
        notification.setTargetId(contentVersion.Id);  
        notification.send(recipientsIds);
        //
        scheduletoDeleteFile (contentVersion.Id , fileTitle,daysToRemove);
        system.debug('after batch finish');
    }
    
    // Ray-casting algorithm to check if a point is within a polygon
    public static Boolean isLocationWithinPolygon(LatLongPair location, List<LatLongPair> polygon) {
        Integer i;
        Integer j;
        Boolean isInside = false;
        
        for (i = 0, j = polygon.size() - 1; i < polygon.size(); j = i++) {
            Decimal polyX1 = polygon[i].latitude;
            Decimal polyY1 = polygon[i].longitude;
            Decimal polyX2 = polygon[j].latitude;
            Decimal polyY2 = polygon[j].longitude;
            
            Decimal x = location.latitude;
            Decimal y = location.longitude;
            
            // Check if the point is on the boundary of the polygon
            if ((polyY1 > y) != (polyY2 > y) && (x < (polyX2 - polyX1) * (y - polyY1) / (polyY2 - polyY1) + polyX1)) {
                isInside = !isInside;
            }
        }
        
        return isInside;
    }
    
    
    // Define the LatLongPair class
    public class LatLongPair {
        public Decimal latitude { get; set; }
        public Decimal longitude { get; set; }
        
        public LatLongPair(Decimal lat, Decimal lon) {
            latitude = lat;
            longitude = lon;
        }
    }    
    public void processRecords(List<Case> records)
    {
        // Process records and convert them into CSV lines
        for (Case record : records) {
            List<String> csvRowArray = new List<String>();
            for (String field : lstSelected) {
                //  csvRowArray.add(String.valueOf(record.get(field))); // Convert field values to strings
                String fieldValue = String.valueOf(record.get(field)); // Convert field values to strings
                
                if (fieldValue != null && fieldValue.contains(',')) {
                    fieldValue = fieldValue.replace(',', ' '); // Replace commas with spaces
                }
                
                csvRowArray.add(fieldValue);
            }
            csvLines.add(String.join(csvRowArray, ','));
            
        }
    }
    public void processRecordsWithinPolygon(List<Case> records)
    {
        List<LatLongPair> polygon = new List<LatLongPair>();
        
        // Make sure both lists have the same number of elements
        if (this.finalLat.size() == this.finalLong.size()) {
            for (Integer i = 0; i < this.finalLat.size(); i++) {
                polygon.add(new LatLongPair(this.finalLat[i], this.finalLong[i]));
            }
        } 
        
        
        for (Case cs : records) {
            Decimal caseLat = Decimal.valueOf(cs.Latitude_District360__c);
            Decimal caseLon = Decimal.valueOf(cs.Longitude_District360__c);
            
            // Check if the case's coordinates are within the polygon
            if (isLocationWithinPolygon(new LatLongPair(caseLat, caseLon), polygon)) {
                List<String> csvRowArray = new List<String>();
                for (String field : lstSelected) {
                    //csvRowArray.add(String.valueOf(cs.get(field))); // Convert field values to strings
                    String fieldValue = String.valueOf(cs.get(field)); // Convert field values to strings
                    
                    if (fieldValue != null && fieldValue.contains(',')) {
                        fieldValue = fieldValue.replace(',', ' '); // Replace commas with spaces
                    }
                    csvRowArray.add(fieldValue);
                }
                csvLines.add(String.join(csvRowArray, ','));
            }
        }
    }
    public void scheduletoDeleteFile (Id fileId , string fileTitle, integer daysToRemove) {
      
        System.debug(localTime);
        
        Integer second = localTime.second();
        Integer minute = localTime.minute();
        Integer hour = localTime.hourGmt();
       // Integer day = localTime.day();
        Integer month = localTime.month();
        Integer year = localTime.year();
        
        // Format the DateTime to GMT
        String formattedDateTime = localTime.formatGMT('dd');
        
        // Extract the day component from the GMT-formatted string
        Integer day = Integer.valueOf(formattedDateTime)+daysToRemove;
        
        System.debug('Day in GMT: ' + day);
        
        // Find the number of days in the current month
        Integer daysInMonth = Date.daysInMonth(year, month);
        
        System.debug('daysInMonth: ' + daysInMonth);
        
        // If the incremented day exceeds the number of days in the month
        if (day > daysInMonth) {
            day = day - daysInMonth; 
            month++; // Move to the next month
            
            // If the incremented month exceeds 12, move to the next year
            if (month > 12) {
                month = 1; // Reset month to 1 for January
                year++; // Move to the next year
            }
        }
        
        String cronExp = second + ' ' + minute + ' ' + hour + ' ' + day + ' ' + month + ' ? ' + year;
        
        System.debug('Constructed cron expression: ' + cronExp);
        System.debug(fileId);
        COM_Scheduleclass scheduledJob = new COM_Scheduleclass(fileId);
        System.Schedule(fileTitle+' by '+UserInfo.getName(), cronExp, scheduledJob);
    }
    
    public void initializeParameters(COM_Ctrl.FilteredCasesParams params) {
        
        // Move the initialization logic from the constructor here
        this.filparams = params;
        //this.totalSubValMap = params.totalSubValMap;
        this.typSubtypMap = params.typSubtypMap;
        this.subtypSubSubtypMap = params.subtypSubSubtypMap;
        //   this.dynamicQuery = params.dynamicQuery;
        this.lstSelected = params.selLabels;
        this.mapFieldApiValue = params.selLabelMap;
        this.csvLines = new List<String>();
        this.selectedTypes = params.listSelectedValues;
        this.selectedSubTypes = params.selectedSubTypes;
        this.statusValues = params.selStatus;
        this.priorityValues = params.selPriority;
        this.dateTimeValueFrom = params.dateTimeValueFrom;
        this.dateTimeValueTo = params.dateTimeValueTo;
        
        this.finalLat = params.lstLat;
        this.finalLong = params.lstLong;
        
        this.localTime = Params.requestedTime;
        //this.isSubSubtypes = params.isSubSubtypes;
        //this.isSubtypes = params.isSubtypes;    
        if (!this.finalLat.isEmpty() && !this.finalLong.isEmpty()) {
            // Find the minimum and maximum values for latitude and longitude
            Decimal minLatDeci = this.finalLat[0];
            Decimal maxLatDeci = this.finalLat[0];
            Decimal minLongDeci = this.finalLong[0];
            Decimal maxLongDeci = this.finalLong[0];
            
            for (Decimal lat : this.finalLat) {
                minLatDeci = Math.min(minLatDeci, lat);
                maxLatDeci = Math.max(maxLatDeci, lat);
            }
            
            for (Decimal lon : this.finalLong) {
                minLongDeci = Math.min(minLongDeci, lon);
                maxLongDeci = Math.max(maxLongDeci, lon);
            }
            
            // Convert the min and max values to strings
            this.minLat = String.valueOf(minLatDeci);
            this.maxLat = String.valueOf(maxLatDeci);
            this.minLong = String.valueOf(minLongDeci);
            this.maxLong = String.valueOf(maxLongDeci);
        }
    }
    
}
//new line added
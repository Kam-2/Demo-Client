/**************************************************************************************
* Class Name			: COM_Ctrl                        CodeCoverage = 93%
* Created Date			: 21-02-2024
* Created By			: Vigneswaran
* Class Description	    : Display case records in map with respect to types, subtypes,
                          sub-subtypes, case filters, Date selected and by polgygon region in LWC.
* Dependent class : DependentPicklistValues, COM_Query, COM_FilterRecord,COM_SubValuesFun,COM_SubsubValuesFun,COM_Batch
***************************************************************************************/
public with sharing class COM_Ctrl {
    /* This method is to get fields label and api as map from custom metadata which is used in 
dynamic field selection for export */
    @AuraEnabled
    public static Map<String, Object> getAvailableFields() {
        
        Map<String, Object> responseMap = new Map<String, Object>();
        
        try {
        Map<String, String> fieldLabelsMap = new Map<String, String>();
        
            Geofencing_Export_Fields__mdt metadataRecord;
            if (Schema.sObjectType.Geofencing_Export_Fields__mdt.isAccessible()) {
                metadataRecord = [SELECT Fields_Selected__c,No_of_days_for_removing_file__c,Default_fields_to_export__c FROM Geofencing_Export_Fields__mdt ];
            }    
            
            String defaultFields = metadataRecord.Default_fields_to_export__c;
            //the 'defaultFields' variable contains the value of the 'Fields_Selected__c' field.
            List<String> fieldDefList = new List<String>();
            
            // Split the comma-separated text into a list of strings
            fieldDefList = defaultFields.split(',\\s*');
            // fieldList contains the list of strings
            
            Integer daysToRemove = metadataRecord.No_of_days_for_removing_file__c.intValue();
            
            String availableFields = metadataRecord.Fields_Selected__c;
            //the 'availableFields' variable contains the value of the 'Fields_Selected__c' field.
            List<String> fieldList = new List<String>();
            
            // Split the comma-separated text into a list of strings
            fieldList = availableFields.split(',\\s*');
            // fieldList contains the list of strings
            
            for (String apiName : fieldList) {
                Schema.SObjectField field = Case.getSObjectType().getDescribe().fields.getMap().get(apiName);
                
                if (field != null) {
                    String fieldLabel = field.getDescribe().getLabel();
                    fieldLabelsMap.put(apiName, fieldLabel);
                } else {
                    // Handle the case where the API name does not correspond to a valid field on the Case object.
                    fieldLabelsMap.put(apiName, 'Field not found');
                }
            }
            
            // the fieldLabelsMap contains API names as keys and field labels as values.
        
            responseMap.put('fieldLabelsMap', fieldLabelsMap);
            responseMap.put('fieldDefList', fieldDefList);
            responseMap.put('daysToRemove', daysToRemove);
        } 
        
        catch (Exception e) {
            // Handle exceptions here
            System.debug('Error in getAvailableFields: ' + e.getMessage());
        }
        return responseMap;
    }
    /* This method is to get total no of cases,case types, subtypes and subsubtypes.
to use in html as checkbox options */
    @AuraEnabled
    public static Map<String, Object> getCasedata() {
        
        
        Map<String, Object> responseMap = new Map<String, Object>();
        //Map<String, List<String>> mapSubtypeSubSubtype = new Map<String, List<String>>();
        Map<String, List<String>> mapTypeSubtype = new Map<String, List<String>>();
        Map<String, List<String>> orderedMap = new Map<String, List<String>>();
        list<case> allcases= new list<case>();
        list<string> listTypeValues= new list<string>();
        //list<string> listLogTypeValues= new list<string>();
        //list<string> listIncidentTypeValues= new list<string>();
        //list<string> listContactTypeValues= new list<string>();
        List<List<String>> valuesList = new List<List<String>>();
        
        
        try{
            integer intNumberOfCases = 0;
            if (Schema.sObjectType.case.isAccessible()) {
                intNumberOfCases = [select Count() from case ];
            }                                       
            //To Get Type values from Org.
            Schema.DescribeFieldResult fieldResult = case.Service_Request_Type__c.getDescribe();
            List<Schema.PicklistEntry> picklistValuesList = fieldResult.getPicklistValues();
            
            for( Schema.PicklistEntry f : picklistValuesList)
            {
                listTypeValues.add(f.getLabel());
            } 
            system.debug(listTypeValues);
            /*
            //To Get logTypes from Org.
            Schema.DescribeFieldResult fieldResult1 = case.Log_Type__c.getDescribe();
            List<Schema.PicklistEntry> picklistValuesList1 = fieldResult1.getPicklistValues();
            
            for( Schema.PicklistEntry f : picklistValuesList1)
            {
                listLogTypeValues.add(f.getLabel());
                
            } 
          
            //To Get Contacttypes from Org.
            Schema.DescribeFieldResult fieldResult2 = case.Contact_Type__c.getDescribe();
            List<Schema.PicklistEntry> picklistValuesList2 = fieldResult2.getPicklistValues();
            
            for( Schema.PicklistEntry f : picklistValuesList2)
            {
                listContactTypeValues.add(f.getLabel());
                
            }
            //To Get IncidentTypes from Org.
            Schema.DescribeFieldResult fieldResult3 = case.Incident_Type__c.getDescribe();
            List<Schema.PicklistEntry> picklistValuesList3 = fieldResult3.getPicklistValues();
            
            for( Schema.PicklistEntry f : picklistValuesList3)
            {
                listIncidentTypeValues.add(f.getLabel());
                
            } */
            //to get the dependent subtypes for the types from Org.
            Schema.sObjectField field = case.Service_Request_Sub_Type__c;
            Map<string,List<String>> dependentPicklistValues = PicklistDependencyClass.getDependentPicklistValues(field);
            
            for(integer i=0;i<listTypeValues.size();i++ )
            {        
                valuesList.add(dependentPicklistValues.get(listTypeValues.get(i)));
            }
            
            for (Integer i = 0; i < listTypeValues.size(); i++) {
                system.debug(listTypeValues.get(i));
                orderedMap .put(listTypeValues.get(i), valuesList.get(i));
            }
                                system.debug('orderedMap'+orderedMap);
            
            for (Integer i = 0; i < listTypeValues.size(); i++) {

                mapTypeSubtype.put(listTypeValues.get(i), orderedMap.get(listTypeValues.get(i)));
            }
            /*
            mapSubtypeSubSubtype = new Map<String, List<String>>(); 
            mapSubtypeSubSubtype.put('Clean Team Report', listLogTypeValues);
            mapSubtypeSubSubtype.put('Contact Report', listContactTypeValues);
            mapSubtypeSubSubtype.put('QOL Violation Report', listIncidentTypeValues);
            */
            responseMap.put('totalCasesCount', intNumberOfCases);
            responseMap.put('mapTypeSubtype', mapTypeSubtype);
            //responseMap.put('mapSubtypeSubSubtype', mapSubtypeSubSubtype);
            //responseMap.put('listLogTypeValues', listLogTypeValues);
            //responseMap.put('listIncidentTypeValues', listIncidentTypeValues);
            //responseMap.put('listContactTypeValues', listContactTypeValues);
            responseMap.put('listTypeValues', listTypeValues);
            System.debug('getCasedata: ' +listTypeValues);

            System.debug('getCasedata: ' +mapTypeSubtype);
        } 
        
        catch (Exception e) {
            // Handle exceptions here
            System.debug('Error in getCasedata: ' + e.getMessage());
        }
        return responseMap;
    }
    //This method will receive types index finally selected as string , date entered & status checked for filters and case records and actual no of cases
    @AuraEnabled
    public static LocationResponse valuesSelectedFun(String params)
    {
        LocationResponse response = new LocationResponse();
        try{
            system.debug('Entered ValuesSelectedFun');
            system.debug(params);
            FilteredCasesParams caseParams = (FilteredCasesParams)JSON.deserialize(params, FilteredCasesParams.class);
            
            string strTypeValString = caseParams.strTypeValString;
            Date strFromDate = caseParams.strFromDate;
            Date strToDate = caseParams.strToDate;
            Boolean isNewStatus = caseParams.isNewStatus;
            Boolean isClosedStatus = caseParams.isClosedStatus;
            Boolean isWorkingCases = caseParams.isWorkingCases;
             Boolean isHighPriority = caseParams.isHighPriority;
        Boolean isMediumPriority = caseParams.isMediumPriority;
        Boolean isLowPriority = caseParams.isLowPriority;
            List<Decimal> lstLat = caseParams.lstLat;
            List<Decimal> lstLong = caseParams.lstLong;
            
            List<String> typeValList = new List<String>();
            list<string> listTypeValues= new list<string>();
            list<string> listSelectedValues= new list<string>();
             
            system.debug('lstLat' + lstLat);
            system.debug('lstLong' +lstLong);
            //To Get Type values from Org.
            Schema.DescribeFieldResult fieldResult = case.Service_Request_Type__c.getDescribe();
            List<Schema.PicklistEntry> picklistValuesList = fieldResult.getPicklistValues();
            
            for( Schema.PicklistEntry f : picklistValuesList)
            {
                listTypeValues.add(f.getLabel());
            } 
            
            if (strTypeValString != null ) {
                typeValList = strTypeValString.split(',');
            }
            system.debug('listTypeValues' +listTypeValues);
            system.debug('typeValList' +typeValList);
            if(typeValList.size() >= 0 && listTypeValues.size()>0)
            {
                for(integer i=0;i<typeValList.size();i++)
                {
                    integer index = Integer.valueOf(typeValList[i]);
                    if(listTypeValues[index]=='Wayfinding Signs')
                    {listSelectedValues.add('Wayfinding Signs');}
                    else
                    {
                        system.debug('typeValList' +listTypeValues[index]);
                        listSelectedValues.add(listTypeValues[index]);
                    }
                }
            }
            
            
            MethodResult result = getStatusValuesAndDates(caseParams);
            List<String> selectedSubTypes =  new List<String>(); 
            
            QureyResults query = COM_Query.queryValCases(listSelectedValues,selectedSubTypes,result);
            
            response.cases = query.allcases;
            response.FinalTypes = listSelectedValues;
            response.FinalFilters = result;
            response.selectedCasesCounts = query.allcases.size(); 
            
        }
        catch (Exception e) {
            // Handle exceptions here
            System.debug('Error in ValuesSelectedFun: ' + e.getMessage());
        }
        return response;
        
    }
    @AuraEnabled
    public static LocationResponse valuesSelectedFunAfterSubmit(String params)
    {
        LocationResponse response = new LocationResponse();
        try{
            system.debug('Entered valuesSelectedFunAfterSubmit');
            system.debug(params);
            FilteredCasesParams caseParams = (FilteredCasesParams)JSON.deserialize(params, FilteredCasesParams.class);
            
            // Now you can access and process the caseParams object
            List<String> listSelectedValues = caseParams.listSelectedValues;
            List<String> selectedSubTypes = caseParams.selectedSubTypes;
            Date strFromDate = caseParams.strFromDate;
            Date strToDate = caseParams.strToDate;
            Boolean isNewStatus = caseParams.isNewStatus;
            Boolean isClosedStatus = caseParams.isClosedStatus;
            Boolean isWorkingCases = caseParams.isWorkingCases;
             Boolean isHighPriority = caseParams.isHighPriority;
        Boolean isMediumPriority = caseParams.isMediumPriority;
        Boolean isLowPriority = caseParams.isLowPriority;
            List<Decimal> lstLat = caseParams.lstLat;
            List<Decimal> lstLong = caseParams.lstLong;
            Map<String, List<String>> typSubtypMap = caseParams.typSubtypMap;
            Map<String, List<String>> subtypSubSubtypMap = caseParams.subtypSubSubtypMap;
            Boolean isSubSubtypes = caseParams.isSubSubtypes;
            Boolean isSubtypes = caseParams.isSubtypes;
            
            system.debug('lstLat' + lstLat);
            system.debug('lstLong' +lstLong);
            
            MethodResult result = getStatusValuesAndDates(caseParams);
            
            QureyResults query = COM_Query.queryValCases(listSelectedValues,selectedSubTypes,result); 
            system.debug('after query');
            List<case> records = new List<case>();
            if(!isSubtypes && !isSubSubtypes)
            {
                for (Case c : query.allcases) {
                    records.add(c);
                }
            }
            
            if(isSubtypes)
            {
            
                records = COM_FilterRecord.filSubRecords(query.allcases,typSubtypMap);   
            
            }
            
            if(isSubSubtypes)
            {
                records = COM_FilterRecord.filSubSubRecords(query.allcases,typSubtypMap,subtypSubSubtypMap);
                
            }
            
            response.cases = records;
            response.FinalTypes = listSelectedValues;
            response.FinalFilters = result;
            response.selectedCasesCounts = records.size();
            system.debug(query.allcases.size());
            
        }
        catch (Exception e) {
            // Handle exceptions here
            System.debug('Error in valuesSelectedFunAfterSubmit: ' + e.getMessage());
        }
        return response;
        
    }
    //This method will receive types index finally selected as string , subtypes indexes which are to unselected , date entered & status checked for filters and case records and actual no of cases    
    @AuraEnabled 
    public static LocationResponse subValuesSelectedFun(String params)
    {
        //string strIndexTypeValString,string strSubTypeValString,Date strFromDate, Date strToDate,Boolean isNewStatus,Boolean isClosedStatus,list<decimal> lstLat, list<decimal> lstLong
        LocationResponse response = new LocationResponse();
        try{
            system.debug('Entered SubValuesSelectedFun');
            system.debug(params);
            FilteredCasesParams caseParams = (FilteredCasesParams)JSON.deserialize(params, FilteredCasesParams.class);
            system.debug(caseParams);
            string strTypeValString = caseParams.strTypeValString;
            string strSubTypeValString = caseParams.strSubTypeValString;
            Date strFromDate = caseParams.strFromDate;
            Date strToDate = caseParams.strToDate;
            Boolean isNewStatus = caseParams.isNewStatus;
            Boolean isWorkingCases = caseParams.isWorkingCases;
            Boolean isClosedStatus = caseParams.isClosedStatus;
             Boolean isHighPriority = caseParams.isHighPriority;
        Boolean isMediumPriority = caseParams.isMediumPriority;
        Boolean isLowPriority = caseParams.isLowPriority;
            List<Decimal> lstLat = caseParams.lstLat;
            List<Decimal> lstLong = caseParams.lstLong;
            
            list<case> allcases= new list<case>();
            list<case> allcasesList = new list<case>();
            list<case> allcases1 = new list<case>();
            map<String,Case> allCaseMap = new map<String,Case>();
            // list<string> listTypeSelectedValues= new list<string>();
            list<string> listSelectedValues= new list<string>();
            
            Map<String, Object> responseMap =  getCasedata();
            Map<String, List<String>> mapTypeSubtype = (Map<String, List<String>>) responseMap.get('mapTypeSubtype');

            List<String> listTypeSelectedValues = COM_SubValuesFun.processTypeSelection(strTypeValString);

            Map<String, Object> reMap = COM_SubValuesFun.processSubTypeSelection(strSubTypeValString,listTypeSelectedValues);
            
            Map<String, List<Integer>> totalValMap  = (Map<String, List<Integer>>) reMap.get('totalValMap');
            Map<String, List<string>> totalSubValMap = new Map<String, List<string>>();
            List<String> listSelectedTypes = new List<String>(totalValMap.keySet());
            List<String> listSelectedSubTypes1 = new List<String>();
            for (String strType : totalValMap.keySet()) {
                List<Integer> indexList = (List<Integer>) totalValMap.get(strType);
                List<String> listSelectedSubTypes = new List<String>();   
                for (Integer index : indexList) {
                    String strSubType = mapTypeSubtype.get(strType).get(index);
                    listSelectedSubTypes.add(strSubType);
                    
                }
                totalSubValMap.put(strType, listSelectedSubTypes);
                system.debug(listSelectedSubTypes);
            }
            system.debug('totalSubValMap'+totalSubValMap);
            
            for (List<String> subTypes : totalSubValMap.values()) {
                listSelectedSubTypes1.addAll(subTypes);
            }
            system.debug(listSelectedSubTypes1);
            MethodResult result = getStatusValuesAndDates(caseParams);
            
            QureyResults query = COM_Query.queryValCases(listSelectedTypes,listSelectedSubTypes1, result);
            List<Case> records = COM_FilterRecord.filSubRecords(query.allcases,totalSubValMap);
            
            response.cases = records;
            response.FinalTypes = listSelectedTypes;
            response.finalSubTypes = listSelectedSubTypes1;
            response.FinalFilters = result;
            response.selectedCasesCounts = records.size();
            response.totalSubValMap = totalSubValMap;
            response.isSubtypes = true;

        } 
        
        catch (Exception e) {
            // Handle exceptions here
            System.debug('Error in SubValuesSelectedFun: ' + e.getMessage());
        }
        return response;
        
        
    }    
   /*
    //This method will receive types index finally selected as string , subtypes, sub-subtypes indexes which are to unselected , date entered & status checked for filters and case records and actual no of cases
    @AuraEnabled  
    public static LocationResponse subSubValuesSelectedFun(String params)
    {
        //string strTypeValString,string strSubTypeValString,string strIndexSubSubTypeValString,Date strFromDate, Date strToDate,Boolean isNewStatus,Boolean isClosedStatus,list<decimal> lstLat, list<decimal> lstLong
        LocationResponse response = new LocationResponse();
        try{
            system.debug('Entered subSubValuesSelectedFun');
            system.debug(params);
            FilteredCasesParams caseParams = (FilteredCasesParams)JSON.deserialize(params, FilteredCasesParams.class);
            
            Map<String, Object> returnMap =  COM_SubsubValuesFun.SubsubValuesMethod(caseParams);
            
            
            Map<String, List<String>> typSubTyp = (Map<String, List<String>>) returnMap.get('typSubTyp');
            Map<String, List<String>> subTypSubTyp = (Map<String, List<String>>) returnMap.get('subTypSubTyp');
            Map<String, Map<String, List<String>>> resultMap = (Map<String, Map<String, List<String>>>) returnMap.get('resultMap');
            List<String> listTypeSelectedValues = (List<String>) returnMap.get('listTypeSelectedValues');
            List<String> selectedSubTypes = (List<String>) returnMap.get('selectedSubTypes');
            
            
            MethodResult result = getStatusValuesAndDates(caseParams);
            QureyResults query = COM_Query.queryValCases(listTypeSelectedValues,selectedSubTypes,result);
            List<Case> records = COM_FilterRecord.filSubSubRecords(query.allcases,typSubTyp,subTypSubTyp);
            
            response.cases = records;
            response.FinalTypes = listTypeSelectedValues;
            response.finalSubTypes = selectedSubTypes;
            response.FinalFilters = result;
            response.selectedCasesCounts = records.size();
            response.totalSubSubValMap = resultMap;
            response.typSubTyp = typSubTyp;
            response.subTypSubTyp = subTypSubTyp;
            response.isSubSubtypes = true;
            
        }
        catch (Exception e) {
            // Handle exceptions here
            System.debug('Error in Sub_SubValuesSelectedFun: ' + e.getMessage());
        }
        return response;
        
        
    } 
    */
    @AuraEnabled
    public static void getBatchData(String params)      
    {
        try{
            system.debug('Entered getBatchData');
            system.debug(params);

            Geofencing_Export_Fields__mdt metadataRecord = [SELECT Fields_Selected__c FROM Geofencing_Export_Fields__mdt];
            
            String availableFields = metadataRecord.Fields_Selected__c;
                                    system.debug('Entered getBatchData');

            FilteredCasesParams caseParams = (FilteredCasesParams)JSON.deserialize(params, FilteredCasesParams.class);
            
            List<String> listSelectedValues = caseParams.listSelectedValues;
                        System.debug(listSelectedValues); 

            List<String> selectedSubTypes = caseParams.selectedSubTypes;
                        System.debug(selectedSubTypes); 

            Date strFromDate = caseParams.strFromDate;
                        System.debug(strFromDate); 

            Date strToDate = caseParams.strToDate;
                        System.debug(strToDate); 

            Boolean isNewStatus = caseParams.isNewStatus;
                        System.debug(isNewStatus); 

            Boolean isClosedStatus = caseParams.isClosedStatus;
                        System.debug(isClosedStatus); 

              Boolean isWorkingCases = caseParams.isWorkingCases;
            
             Boolean isHighPriority = caseParams.isHighPriority;
            
        Boolean isMediumPriority = caseParams.isMediumPriority;
            
        Boolean isLowPriority = caseParams.isLowPriority;

            List<Decimal> lstLat = caseParams.lstLat;
                        System.debug(lstLat); 

            List<Decimal> lstLong = caseParams.lstLong;
                        System.debug(lstLong); 

            Map<String, List<String>> typSubtypMap = caseParams.typSubtypMap;
            Map<String, List<String>> subtypSubSubtypMap = caseParams.subtypSubSubtypMap;
            Boolean isSubSubtypes = caseParams.isSubSubtypes;
            Boolean isSubtypes = caseParams.isSubtypes;
            Map<String, List<String>> totalSubValMap = caseParams.totalSubValMap;
            List<String> selLabels = caseParams.selLabels;
            Map<String,String> selLabelMap = caseParams.selLabelMap;
            
            //String customQuery = 'SELECT ' + availableFields + ' FROM Case where Report_Type__c IN :finalTypes ORDER BY Report_Type__c,CreatedDate DESC';                   
            
            MethodResult result = getStatusValuesAndDates(caseParams);
            
            caseParams.selPriority = result.priorityValues;
            caseParams.selStatus = result.statusValues;
            caseParams.dateTimeValueFrom = result.dateTimeValueFrom;
            caseParams.dateTimeValueTo = result.dateTimeValueTo;
            caseParams.lstLat = result.latitudeList;
            caseParams.lstLong = result.longitudeList;

            String dynamicQuery = COM_Query.buildDynamicQuery(listSelectedValues,selectedSubTypes,result);
            
            dynamicQuery += ' ORDER BY Service_Request_Type__c,Service_Request_Sub_Type__c,CreatedDate DESC';     
            
            System.debug(dynamicQuery);
            
            caseParams.dynamicQuery = String.escapeSingleQuotes(dynamicQuery);
            System.debug(caseParams.dynamicQuery);
            //To get time as per user timezone
            Datetime now = Datetime.now(); 
            Integer offset = UserInfo.getTimezone().getOffset(now); 
            caseParams.requestedTime = now.addSeconds(offset/1000);
            System.debug(caseParams.requestedTime);
             
            COM_Batch myBatch = new COM_Batch(caseParams);
            //sanitizedQuery,selLabels,selLabelMap,selectedTypes,selectedSubTypes,totalSubValMap,statusValues,dateTimeValueFrom,dateTimeValueTo,latitudeList,longitudeList
            Integer batchSize = 200; // Adjust the batch size as needed
            Database.executeBatch(myBatch, batchSize);

        }
        catch (Exception e) {
            // Handle exceptions here
            System.debug('Error in getBatchData: ' + e.getMessage());
        } 
    }
    public static MethodResult getStatusValuesAndDates(FilteredCasesParams caseParams)
    {
        Date strFromDate = caseParams.strFromDate;
        Date strToDate = caseParams.strToDate;
        Boolean isNewStatus = caseParams.isNewStatus;
        Boolean isClosedStatus = caseParams.isClosedStatus;
        Boolean isWorkingCases = caseParams.isWorkingCases;
        List<Decimal> lstLat = caseParams.lstLat;
        List<Decimal> lstLong = caseParams.lstLong;
        
        Boolean isHighPriority = caseParams.isHighPriority;
        Boolean isMediumPriority = caseParams.isMediumPriority;
        Boolean isLowPriority = caseParams.isLowPriority;
                System.debug('isHighPriority'+isHighPriority);

        MethodResult result = new MethodResult();
        result.statusValues = new List<String>();
        result.priorityValues = new List<String>();
        // if (isNewStatus && isClosedStatus) {
        //     result.statusValues.add('Open');
        //     result.statusValues.add('Closed');
        // } else if (isNewStatus) {
        //     result.statusValues.add('Open');
        // } else if (isClosedStatus) {
        //     result.statusValues.add('Closed');
        // } 
        if (isNewStatus || isClosedStatus || isWorkingCases) {
            if (isNewStatus) {
                result.statusValues.add('Open');
            }
            if (isClosedStatus) {
                result.statusValues.add('Closed');
            }
            if (isWorkingCases) {
                result.statusValues.add('Working');
            }
        }
        else {
            result.statusValues = null;
        }
        
        if (isHighPriority || isMediumPriority || isLowPriority) {
            if (isHighPriority) {
                result.priorityValues.add('High');
            }
            if (isMediumPriority) {
                result.priorityValues.add('Medium');
            }
            if (isLowPriority) {
                result.priorityValues.add('Low');
            }
        }
        else {
            result.priorityValues = null;
        }
        
        if (strFromDate != null && strToDate != null) {
            Time timeValueFrom = Time.newInstance(0, 0, 0, 0);
            result.dateTimeValueFrom = Datetime.newInstance(strFromDate, timeValueFrom);
            
            Time timeValueTo = Time.newInstance(23, 59, 59, 999);
            result.dateTimeValueTo = Datetime.newInstance(strToDate, timeValueTo);
        }
        
        if (lstLat != null && lstLong != null) {
            result.latitudeList = lstLat;
            result.longitudeList = lstLong;
        }
        System.debug('isHighPriority'+isHighPriority);
        return result;
    }
    public class MethodResult {
        public List<String> statusValues { get; set; }
        public List<String> priorityValues { get; set; }
        public Datetime dateTimeValueFrom { get; set; }
        public Datetime dateTimeValueTo { get; set; }
        public List<decimal> latitudeList { get; set; }
        public List<decimal> longitudeList { get; set; }
    }
    
    public class LocationResponse {
        @AuraEnabled 
        public List<Case> cases { get; set; }
        @AuraEnabled 
        public List<String> finalTypes { get; set; }
        @AuraEnabled 
        public List<String> finalSubTypes { get; set; }
        @AuraEnabled 
        public List<String> finalSubSubTypes { get; set; }
        @AuraEnabled 
        public MethodResult finalFilters { get; set; }
        @AuraEnabled 
        public integer selectedCasesCounts { get; set; }
        @AuraEnabled 
        public Map<String, List<string>> totalSubValMap { get; set; }
        @AuraEnabled 
        public Map<String, Map<String, List<String>>> totalSubSubValMap { get; set; }
        @AuraEnabled 
        public boolean isSubSubtypes { get; set; }
        @AuraEnabled 
        public Map<String, List<string>> typSubTyp { get; set; }
        @AuraEnabled 
        public Map<String, List<string>> subTypSubTyp { get; set; }
        @AuraEnabled 
        public boolean isSubtypes { get; set; }
        
    }
    public class QureyResults {
        public List<Case> allcases { get; set; }
        public integer selectedCasesCounts { get; set; }
    }
   public class FilteredCasesParams {
        @AuraEnabled
        public List<String> listSelectedValues { get; set; }
        @AuraEnabled
        public List<String> selectedSubTypes { get; set; }
        @AuraEnabled
        public Date strFromDate { get; set; }
        @AuraEnabled
        public Date strToDate { get; set; }
        @AuraEnabled
        public DateTime dateTimeValueFrom { get; set; }
        @AuraEnabled
        public DateTime dateTimeValueTo { get; set; }
        @AuraEnabled
        public Boolean isNewStatus { get; set; }
        @AuraEnabled
        public Boolean isWorkingCases { get; set; }
        @AuraEnabled
        public Boolean isClosedStatus { get; set; }
        @AuraEnabled
        public List<Decimal> lstLat { get; set; }
        @AuraEnabled
        public List<Decimal> lstLong { get; set; }
        @AuraEnabled
        public Map<String, List<String>> typSubtypMap { get; set; }
        @AuraEnabled
        public Map<String, List<String>> subtypSubSubtypMap { get; set; }
        @AuraEnabled
        public Boolean isSubSubtypes { get; set; }
        @AuraEnabled
        public Boolean isSubtypes { get; set; }
        @AuraEnabled
        public string strTypeValString { get; set; }    
        @AuraEnabled
        public string strSubTypeValString { get; set; }    
        @AuraEnabled
        public string strIndexSubSubTypeValString { get; set; }    
        @AuraEnabled
        public Map<String, List<String>> totalSubValMap { get; set; }
        @AuraEnabled
        public List<String> selLabels { get; set; }
        @AuraEnabled
        public List<String> selStatus { get; set; }
       @AuraEnabled
        public List<String> selPriority { get; set; }
        @AuraEnabled
        public Map<String,String> selLabelMap { get; set; }
        @AuraEnabled
        public string dynamicQuery { get; set; }
        @AuraEnabled
        public DateTime requestedTime { get; set; }
        @AuraEnabled
        public Boolean isHighPriority { get; set; }
        @AuraEnabled
        public Boolean isMediumPriority { get; set; }
        @AuraEnabled
        public Boolean isLowPriority { get; set; }
       
    }
    
    }
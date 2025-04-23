/**************************************************************************************
* Class Name			: COM_Query                        CodeCoverage = 95%
* Created Date			: 21-02-2024
* Created By			: Vigneswaran
* Class Description	    : This class is used to build dynamic query and query the records with selected values and filters
***************************************************************************************/
public with sharing class COM_Query {
    public static String buildDynamicQuery(List<String> selectedTypes,List<String> selectedSubTypes, COM_Ctrl.MethodResult result)
    {
        
        Geofencing_Export_Fields__mdt metadataRecord;
        if (Schema.sObjectType.Geofencing_Export_Fields__mdt.isAccessible()) {
            metadataRecord = [SELECT Fields_Selected__c FROM Geofencing_Export_Fields__mdt ];
        }
        
        String availableFields = metadataRecord.Fields_Selected__c;
        String dynamicQuery = 'SELECT ' + availableFields + ' FROM Case';
        system.debug(!selectedTypes.isEmpty());
        system.debug(!selectedSubTypes.isEmpty());
        if(!selectedTypes.isEmpty())
        {
            dynamicQuery += ' WHERE Service_Request_Type__c IN :selectedTypes';    
        }
        if(!selectedSubTypes.isEmpty())
        {
            dynamicQuery += ' And Service_Request_Sub_Type__c IN :selectedSubTypes';    
        }
        List<String> statusValues = result.statusValues;
        List<String> priorityValues = result.priorityValues;
        Datetime dateTimeValueFrom = result.dateTimeValueFrom;
        Datetime dateTimeValueTo = result.dateTimeValueTo;
        list<decimal> latitudeList = result.latitudeList;
        list<decimal> longitudeList = result.longitudeList;
        
        if(dateTimeValueFrom != null && dateTimeValueTo != null )
        {
            dynamicQuery += ' And CreatedDate >= :dateTimeValueFrom AND CreatedDate <= :dateTimeValueTo';                   
        }
        if(statusValues!= null)
        {
            dynamicQuery += ' And Status IN :statusValues';                   
        }
        if(priorityValues!= null)
        {
            dynamicQuery += ' And Priority IN :priorityValues';                   
        }
        if (!latitudeList.isEmpty() && !longitudeList.isEmpty()) {
            
            dynamicQuery += ' And Latitude_District360__c >= :minLat and Latitude_District360__c <= :maxLat and longitude_District360__c  <= :minLong and longitude_District360__c >= :maxLong';                   
        }
        system.debug(dynamicQuery);
        return dynamicQuery;
    }
    public static COM_Ctrl.QureyResults queryValCases(List<String> selectedTypes,List<String> selectedSubTypes,COM_Ctrl.MethodResult result)
    {
        
        Geofencing_Export_Fields__mdt metadataRecord = [SELECT Fields_Selected__c FROM Geofencing_Export_Fields__mdt];
        
        String availableFields = metadataRecord.Fields_Selected__c;
        
        
        List<String> statusValues = result.statusValues;
        List<String> priorityValues = result.priorityValues;
        Datetime dateTimeValueFrom = result.dateTimeValueFrom;
        Datetime dateTimeValueTo = result.dateTimeValueTo;
        list<decimal> latitudeList = result.latitudeList;
        list<decimal> longitudeList = result.longitudeList;
        if (!latitudeList.isEmpty() && !longitudeList.isEmpty()) {
            // Find the minimum and maximum values for latitude and longitude
            Decimal minLatDeci = latitudeList[0];
            Decimal maxLatDeci = latitudeList[0];
            Decimal minLongDeci = longitudeList[0];
            Decimal maxLongDeci = longitudeList[0];
            
            for (Decimal lat : latitudeList) {
                minLatDeci = Math.min(minLatDeci, lat);
                maxLatDeci = Math.max(maxLatDeci, lat);
            }
            
            for (Decimal lon : longitudeList) {
                minLongDeci = Math.min(minLongDeci, lon);
                maxLongDeci = Math.max(maxLongDeci, lon);
            }
            
            // Convert the min and max values to strings
            String minLat = String.valueOf(minLatDeci);
            String maxLat = String.valueOf(maxLatDeci);
            String minLong = String.valueOf(minLongDeci);
            String maxLong = String.valueOf(maxLongDeci);
            
            // Now, you have the min and max values as strings
            System.debug('Min Latitude: ' +MinLat);
            System.debug('Max Latitude: ' +MaxLat);
            System.debug('Min Longitude: ' +MinLong);
            System.debug('Max Longitude: ' +MaxLong);
        }    
        
        String dynamicQuery = buildDynamicQuery(selectedTypes,selectedSubTypes,result);
        dynamicQuery += ' ORDER BY CreatedDate DESC limit 2000';     
        System.debug(dynamicQuery);
        
        String sanitizedQuery = String.escapeSingleQuotes(dynamicQuery);
        List<Case> cases = Database.query(sanitizedQuery);    
        COM_Ctrl.QureyResults query = queryCases(cases,result );
        
        return query;
    }
    public static COM_Ctrl.QureyResults queryCases(List<Case> cases,COM_Ctrl.MethodResult result )
    {
        list<decimal> latitudeList = result.latitudeList;
        list<decimal> longitudeList = result.longitudeList;
        
        COM_Ctrl.QureyResults query = new COM_Ctrl.QureyResults();
        
        query.allcases = new List<Case>();
        system.debug('latitudeList'+latitudeList);
        system.debug('longitudeList'+longitudeList);
        
        if ((latitudeList.size() != 0) && (longitudeList.size() != 0)) {
            
            List<LatLongPair> polygon = new List<LatLongPair>();
            
            // Make sure both lists have the same number of elements
            if (latitudeList.size() == longitudeList.size()) {
                for (Integer i = 0; i < latitudeList.size(); i++) {
                    polygon.add(new LatLongPair(latitudeList[i], longitudeList[i]));
                }
            } 
            
            
            for (Case cs : cases) {
                Decimal caseLat = Decimal.valueOf(cs.Latitude_District360__c);
                Decimal caseLon = Decimal.valueOf(cs.longitude_District360__c);
                
                // Check if the case's coordinates are within the polygon
                if (isLocationWithinPolygon(new LatLongPair(caseLat, caseLon), polygon)) {
                    query.allcases.add(cs);
                }
            }
            
        }
        else
        {
            query = casesLocQuery(cases,query);
            
        }
        return query;
    }  
    public static COM_Ctrl.QureyResults casesLocQuery(List<Case> cases,COM_Ctrl.QureyResults query)
    {
        for(case  cs :cases){
            if(cs.Latitude_District360__c == null && cs.longitude_District360__c == null ) 
            {
                cs.Latitude_District360__c = '0';
                cs.longitude_District360__c = '0';
            }
            query.allcases.add(cs);
        }
        return query;
    }     
    public static Boolean isLocationWithinPolygon(LatLongPair location, List<LatLongPair> polygon) 
    {
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
    public class LatLongPair  {
        public Decimal latitude { get; set; }
        public Decimal longitude { get; set; }
        
        public LatLongPair(Decimal lat, Decimal lon) {
            latitude = lat;
            longitude = lon;
        }
    }
}
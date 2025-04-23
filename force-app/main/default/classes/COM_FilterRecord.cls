/**************************************************************************************
* Class Name			: COM_FilterRecord                        CodeCoverage = 96%
* Created Date			: 21-02-2024
* Created By			: Vigneswaran
* Class Description	    : This class is used to filter the queried records for
                          getting records by selected subtypes,sub-subtypes,latitude&longitude
***************************************************************************************/
public class COM_FilterRecord {

    public static List<Case> filSubRecords(List<Case> allcases, Map<String, List<string>> typSubtypMap)    
    {
        
        Map<String, List<Case>> resultMapFin = new Map<String, List<Case>>();
        for (Case c : allcases) {
            String key = c.Service_Request_Type__c ; 
            if (!resultMapFin.containsKey(key)) {
                resultMapFin.put(key, new List<Case>());
            }
            resultMapFin.get(key).add(c);
        }
        
        List<case> records = new List<case>();
        for (String key : resultMapFin.keySet()) {
            List<Case> cases = resultMapFin.get(key);
            for (Case c : cases) {
                String subkey = c.Service_Request_Sub_Type__c; 
                List<string> subtypes = typSubtypMap.get(key);  
                // Check if subkey exists in the list of desired subtypes
                if (subkey != null && subtypes.contains(subkey)) {
                    // If the Report_Sub_Type__c matches one of the desired subtypes, add the Case to the new list
                    records.add(c);
                }
            }
        }
        
        system.debug(records.size());
        return records;
    }
    public static List<Case> filSubSubRecords(List<Case> allcases, Map<String, List<String>> typSubTyp,Map<String,List<String>> subTypSubTyp)    
    {
        Map<String, List<Case>> resultMapFin = new Map<String, List<Case>>();
        for (Case c : allcases) {
            String key = c.Service_Request_Type__c ; 
            if (!resultMapFin.containsKey(key)) {
                resultMapFin.put(key, new List<Case>());
            }
            resultMapFin.get(key).add(c);
        }
        
        List<case> records = new List<case>();
        FilterParams filterParams = new FilterParams();
                    
        for (String key : resultMapFin.keySet()) {
            if ( (key == 'Security and Safety')||(key == 'Cleaning Operations'))
            {
                List<Case> cases = resultMapFin.get(key);
                List<string> subtypes = typSubTyp.get(key);   
                
                filterParams.cases = cases;
                filterParams.subtypes = subtypes;
                filterParams.subTypSubTyp = subTypSubTyp;
                filterParams.records = records;
                
                records = filCaseRecords(filterParams);
                
            }
            else
            {
                List<Case> cases = resultMapFin.get(key);
                filterParams.cases = cases;
                filterParams.key = key;
                filterParams.typSubTyp = typSubTyp;
                filterParams.records = records;
                
                records = filCaseRecords1(filterParams);
            }
        }
        system.debug(records.size());
        return records;
    }
    public static List<case> filCaseRecords1 (FilterParams filterParams)   
        
    {
        List<case> cases  = filterParams.cases;
        string key =  filterParams.key;
        Map<String,List<String>> typSubTyp = filterParams.typSubTyp;
        List<case> records =  filterParams.records;
            
        for (Case c : cases) {
            String subkey = c.Service_Request_Sub_Type__c; // Replace with the appropriate field to use as the map key
            List<string> subtypes = typSubTyp.get(key);   
            // Check if subkey exists in the list of desired subtypes
            if (subkey != null && subtypes.contains(subkey)) {
                // If the Report_Sub_Type__c matches one of the desired subtypes, add the Case to the new list
                records.add(c);
            }
        }
        return records;
    }
    public static List<case> filCaseRecords (FilterParams filterParams)     
    {
        List<case> cases = filterParams.cases;
        List<string> subtypes = filterParams.subtypes;
        List<case> records = filterParams.records;
        Map<String,List<String>> subTypSubTyp = filterParams.subTypSubTyp;
        for (Case c : cases) {
            String subkey = c.Service_Request_Sub_Type__c; // Replace with the appropriate field to use as the map key
            
            // Check if subkey exists in the list of desired subtypes
            if (subkey != null && subtypes.contains(subkey)) {
                if (subkey == 'Clean Team Report') {
                    String field = 'Log_Type__c';
                    
                    filterParams.field = field;
                    filterParams.c = c;
                    filterParams.subTypSubTyp = subTypSubTyp;
                    filterParams.subkey = subkey;
                    filterParams.records = records;    
                    records = filRecords (filterParams);
                    
                }
                
                else if (subkey == 'Contact Report') {
                    String field = 'Contact_Type__c';
                    
                    filterParams.field = field;
                    filterParams.c = c;
                    filterParams.subTypSubTyp = subTypSubTyp;
                    filterParams.subkey = subkey;
                    filterParams.records = records;    
                    records = filRecords (filterParams);
                    
                }
                
                else if (subkey == 'QOL Violation Report') {
                    String field = 'Incident_Type__c';
                    
                    filterParams.field = field;
                    filterParams.c = c;
                    filterParams.subTypSubTyp = subTypSubTyp;
                    filterParams.subkey = subkey;
                    filterParams.records = records;    
                    records = filRecords (filterParams);
                    
                }
                
                // If the Report_Sub_Type__c matches one of the desired subtypes, add the Case to the new list
                else
                {
                    records.add(c);
                } 
            }
        }
        return records;
    }
    public static List<case> filRecords (FilterParams filterParams) 
    {
        Map<String, List<String>> subTypSubTyp = filterParams.subTypSubTyp ;
            case c = filterParams.c;
           string subkey = filterParams.subkey ;
        string field = filterParams.field ;
        List<case> records = filterParams.records ;     

                    
        //  List<case> records = new List<case>();
        List<String> filLogType = subTypSubTyp.get(subkey);
        system.debug('filLogType'+filLogType);
        if (filLogType != null)
        {
            if(filLogType.size()!=0)
            { 
                //String subsubkey = c.Log_Type__c;  
                String subsubkey = (String)c.get(field);  
                if((subsubkey != null)&& (filLogType.contains(subsubkey)))  {
                    records.add(c);
                }
                
            }
            else
            {
                String subsubkey = (String)c.get(field);  
                if (subsubkey == null ) {
                    records.add(c);
                }
            }
            
        }
        else
        {
            records.add(c);
            
        }
        return records;
        
    }
    public class FilterParams {
        public List<case> cases { get; set; }
        public List<case> records { get; set; }
        public List<string> subtypes { get; set; }
        public Map<String,List<String>> typSubTyp { get; set; }
        public Map<String,List<String>> subTypSubTyp { get; set; }     
        public case c { get; set; }
        public string subkey { get; set; }
        public string field { get; set; }
        public string key { get; set; }
    }
}
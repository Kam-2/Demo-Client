/**************************************************************************************
* Class Name			: COM_SubValuesFun                        CodeCoverage = 98%
* Created Date			: 21-02-2024
* Created By			: Vigneswaran
* Class Description	    : This class is to process to get the map of selected types and its subtypes
***************************************************************************************/

public class COM_SubValuesFun {

    public static List<String> processTypeSelection(String strTypeValString)
    {
        List<String> listTypeSelectedValues = new List<String>();
        
        
        //iterate to get checked type checkboxes
        Map<String, Object> responseMap =  COM_Ctrl.getCasedata();
        List<String> listTypeValues = (List<String>) responseMap.get('listTypeValues');
        
        List<String> typeValList = new List<String>();
        if (strTypeValString != null ) {
            typeValList = strTypeValString.split(',');
        }
        if(typeValList.size() >= 0 && listTypeValues.size()>0){
            for(integer i=0;i<typeValList.size();i++)
            {
                integer index = Integer.valueOf(typeValList[i]);
                if(listTypeValues[index]=='Wayfinding Signs')
                {listTypeSelectedValues.add('Wayfinding Signs');}
                else
                {listTypeSelectedValues.add(listTypeValues[index]);}
            }
        }
        
        return listTypeSelectedValues;
    }
    public static Map<String, Object> processSubTypeSelection(String strSubTypeValString,List<String> listTypeSelectedValues) 
    {
        
        Map<String, Object> resultMap = new Map<String, Object>();
        Map<String, Object> responseMap =  COM_Ctrl.getCasedata();
        
        Map<String, List<String>> mapTypeSubtype = (Map<String, List<String>>) responseMap.get('mapTypeSubtype');
        
        //finalMapToQuery is used to collect the Types and its subtypes indexes (the types which are checked finally)
        // The types are removed if their subtypes matches with mapTypeSubtype values (subtypeRemoveMap will have the types with subtypes indexes changed)
        
        Map<String, List<Integer>> finalMapToQuery = getFinalMapToQuery(listTypeSelectedValues);
        
        
        Map<String, Object> subtypeRemoveMapFil = new Map<String, Object>();
        
        if ((strSubTypeValString != null))
        {
            Map<String, Object>  subtypeRemoveMap = (Map<String, Object>) JSON.deserializeUntyped(strSubTypeValString);
            for (String key : subtypeRemoveMap.keySet()) {
                if (listTypeSelectedValues.contains(key)) {
                    subtypeRemoveMapFil.put(key, subtypeRemoveMap.get(key));
                }
            }
        }
        // Create a new map to store the final result by deleting the common Key b/w subtypeRemoveMapFil and finalMapToQuery 
        // Iterate over each key-value pair in subtypeRemoveMapFil
        for (String key : subtypeRemoveMapFil.keySet()) {
            List<Object> removeIndexes = (List<Object>) subtypeRemoveMapFil.get(key);
            // Check if the key exists in finalMapToQuery
            if (finalMapToQuery.containsKey(key)) {
                // Remove the key from finalMapToQuery
                finalMapToQuery.remove(key);
            }
        }
        Map<String, List<Integer>>  filMapToQuery = getFilMapToQuery(subtypeRemoveMapFil);
        // Both finalMapToQuery and filMapToQuery will be added in totalValMap
        Map<String, List<Integer>> totalValMap = new Map<String, List<Integer>>();
        
        totalValMap.putAll(finalMapToQuery);
        totalValMap.putAll(filMapToQuery);
        Map<String, List<String>> subMap = new Map<String, List<String>>();
        List<String> selectedsubtypeList = new List<String>();
        
        // Iterating over each key-value pair in the subtypeRemoveMap
        for (String key : totalValMap.keySet()) {
            List<Integer> indexList = (List<Integer>) totalValMap.get(key);
            
            
            for (Integer index : indexList) {
                String value = mapTypeSubtype.get(key).get(index);
                selectedsubtypeList.add(value);
                
            }
            subMap.put(key,selectedsubtypeList);
        }
        resultMap.put('totalValMap', totalValMap);
        resultMap.put('selectedsubtypeList', selectedsubtypeList);
        return resultMap;
        
    }
    public static Map<String, List<Integer>> getFinalMapToQuery(List<String> listTypeSelectedValues)
    {
        
        Map<String, Object> responseMap =  COM_Ctrl.getCasedata();
        
        Map<String, List<String>> mapTypeSubtype = (Map<String, List<String>>) responseMap.get('mapTypeSubtype');
        
        //finalMapToQuery is used to collect the Types and its subtypes indexes (the types which are checked finally)
        // The types are removed if their subtypes matches with mapTypeSubtype values (subtypeRemoveMap will have the types with subtypes indexes changed)
        
        Map<String, List<Integer>> finalMapToQuery = new Map<String, List<Integer>>();
        
        
        // Iterate over each selected type in listTypeSelectedValues
        for (String selectedType : listTypeSelectedValues) {
            // Check if the selected type exists in the mapTypeSubtype map
            if (mapTypeSubtype.containsKey(selectedType)) {
                // Get the list of values for the selected type
                List<String> values = mapTypeSubtype.get(selectedType);
                
                // Create a new list to store the indexes
                List<Integer> indexes = new List<Integer>();
                
                // Iterate over each value in the list and add its index to the indexes list
                for (Integer i = 0; i < values.size(); i++) {
                    indexes.add(i);
                }
                
                // Add the type and its indexes to the final map
                finalMapToQuery.put(selectedType, indexes);
            }
        }
        return finalMapToQuery;
        
    }
    public static Map<String, List<Integer>> getFilMapToQuery(Map<String, Object> subtypeRemoveMapFil) 
    {
        Map<String, Object> responseMap =  COM_Ctrl.getCasedata();
        
        Map<String, List<String>> mapTypeSubtype = (Map<String, List<String>>) responseMap.get('mapTypeSubtype');
        
        Map<String, List<Integer>>  filMapToQuery = new Map<String, List<Integer>>();
        for (String key : subtypeRemoveMapFil.keySet()) {
            List<Object> indexList = (List<Object>) subtypeRemoveMapFil.get(key);
            List<Integer> selectedTypeIndexList = new List<Integer>();
            
            if (mapTypeSubtype.containsKey(key)) {
                List<String> values = mapTypeSubtype.get(key);
                
                // Iterating over the values to find their indexes
                for (String value : values) {
                    Integer index = values.indexOf(value);
                    selectedTypeIndexList.add(index);
                }
            }
            List<String> indexStringList = new List<String>(); // List to store the casted strings
            List<Integer> indexIntegerList = new List<Integer>();
            
            // Casting the elements of indexList to strings
            for (Object index : indexList) {
                //   indexStringList.add(mapTypeSubtype.get(key).get(Integer.valueOf(String.valueOf(index))));
                indexIntegerList.add(Integer.valueOf(String.valueOf(index)));
            }
            List<Integer> modifiedSelectedTypeIndexList = new List<Integer>();
            
            for (Integer value : selectedTypeIndexList) {
                if (!indexIntegerList.contains(value)) {
                    modifiedSelectedTypeIndexList.add(value);
                }
            }
            filMapToQuery.put(key, modifiedSelectedTypeIndexList); 
            
        } 
        return filMapToQuery;
        
    }
}
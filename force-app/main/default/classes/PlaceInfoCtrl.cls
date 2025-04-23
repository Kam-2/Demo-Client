public with sharing class PlaceInfoCtrl {


    @AuraEnabled
    public static void updateAccount(String recordId,String street,String city,String Country,
                                                String State,String Postalcode,list<String> openHours,
                                                String phone,String internationalPhone,Decimal rating,
                                                String reviews,String  urls,String placeid, 
                                                String status,Integer noofAPIConsumed){
        
        System.debug('recordId:'+recordId);
        System.debug('street:'+street);
        System.debug('city:'+city);
        System.debug('State:'+State);
        System.debug('Postalcode:'+Postalcode);
        System.debug('Open Close hours:'+openHours);
        System.debug('phone:'+phone);
        System.debug('internationalPhone:'+internationalPhone);
        System.debug('rating:'+rating);
        System.debug('reviews:'+reviews); 
        System.debug('urls:'+urls);    
        System.debug('API'+noofAPIConsumed);
        Integer totalAPIConsumed =    noofAPIConsumed;
        if(String.isNotBlank(recordId)){
        Account acc = new Account(id=recordId,BillingStreet__c=street,BillingCity__c=city,BillingState__c=State,
        BillingCountry__c=Country,BillingPostalCode__c=Postalcode,GoogleInfo_Rating__c=rating,
        GoogleInfo_Reviews__c=reviews,Google_Info_Last_Sync_Date__c = System.today(),GoogleInfo_PlaceId__c=placeid
        );
        String str = '';
        for(String hours: openHours){
            str=str+'\n'+hours;
        }
       
        /*if(reviews.length()< 1638400)
            acc.GoogleInfo_Reviews__c = reviews;
        else if(reviews.length()> 1638400){
            acc.GoogleInfo_Reviews__c = reviews.substring(0, 1638400-1);
        }  */
        
        if(str!='')
            acc.GoogleInfo_Open_Close_Hours__c = str;
        else
            acc.GoogleInfo_Open_Close_Hours__c = null;

        if(phone!=null)
            acc.GoogleInfo_Phone__c = phone;
        else {
            acc.GoogleInfo_Phone__c = null;
        }
        if(internationalPhone!=null)    
            acc.GoogleInfo_International_Phone__c=internationalPhone;
        else {
            acc.GoogleInfo_International_Phone__c=null;
        }
        if(string.isNotBlank(status))
            acc.GoogleInfo_Business_Status__c =status;
        else
        acc.GoogleInfo_Business_Status__c=null;

        if(urls!=null){
            list<object> obj = (List<object>)JSON.deserializeUntyped(urls);
            String str2 = '';
            Integer count =1;
            for(object url: obj){
                Map<String,Object> record = (Map<String,Object>) url;
                system.debug('##'+record.get('url'));
                if(count <=3){  
                    
                    str2=str2+'\n'+geturl((string)record.get('url'),totalAPIConsumed);
                    totalAPIConsumed=totalAPIConsumed+1;
                }
                count = count+1;
            }            
            acc.GoogleInfo_Image_Url__c = str2;
        }else {
            acc.GoogleInfo_Image_Url__c = null;
        }

        try{
            updateAPILimit(totalAPIConsumed);        
            update acc;
        }Catch(Exception ex){
        System.debug('@Exception :=>'+ex.getStackTraceString()+' @Message=>'+ex.getMessage());
        updateAPILimit(totalAPIConsumed);   throw new AuraHandledException(ex.getMessage());
        }
        }
        
    }
    @AuraEnabled
    public static void updateAccountAddress(String recordId,String street,String city,String Country,
                                                String State,String Postalcode){

     Account acc = new Account (id= recordId, BillingStreet =street,BillingCity=city,
     BillingState=State,BillingCountry=Country,BillingPostalCode=Postalcode,
     ShippingStreet=street, ShippingCity=city, ShippingState=State, ShippingPostalCode=Postalcode, 
     ShippingCountry=Country );      
     
     try{
     update acc;
     }Catch(Exception ex){
        System.debug('@Exception :=>'+ex.getStackTraceString()+' @Message=>'+ex.getMessage());
        throw new AuraHandledException(ex.getMessage());
    }

    }   
    @AuraEnabled
    public static Map<String,Object> checkLastSyncDate(String recordId,String objectName,string dayname){
        System.debug('objectName:'+objectName);
        System.debug('dayname:'+dayname);
		Integer diff;
        Map<string,Object> result = new Map<String,Object>();
        Google_Place_API_Rate_Limit__c apiLimit = Google_Place_API_Rate_Limit__c.getInstance('GooglePlacesAPI');
        if(objectName=='Account'){
            Date dt;
            list<Account> acc =[Select id,Name,BillingStreet__c,BillingCity__c,BillingState__c,BillingCountry__c,
            BillingPostalCode__c,GoogleInfo_Rating__c,GoogleInfo_Reviews__c,GoogleInfo_Open_Close_Hours__c,
            GoogleInfo_Phone__c,GoogleInfo_International_Phone__c,GoogleInfo_Image_Url__c,
            Google_Info_Last_Sync_Date__c,GoogleInfo_PlaceId__c,GoogleInfo_Business_Status__c from Account where id=:recordId];
            
            if(acc.size()>0 && acc[0]!=null && acc[0].Google_Info_Last_Sync_Date__c != null ){
                dt= acc[0].Google_Info_Last_Sync_Date__c;
                diff = dt.daysBetween(system.today());

            }
            system.debug(acc.size());

            if(acc.size()>0){
                if(acc[0].Google_Info_Last_Sync_Date__c!=null)
                {
                    String ymd = acc[0].Google_Info_Last_Sync_Date__c.year()+'-'+acc[0].Google_Info_Last_Sync_Date__c.month()+'-'+acc[0].Google_Info_Last_Sync_Date__c.day();
                    result.put('lastUpdatedOn',ymd);
                }
                result.put('name',acc[0].Name);
                result.put('rating',acc[0].GoogleInfo_Rating__c);
                result.put('phoneNumber',acc[0].GoogleInfo_Phone__c);
                result.put('mobileNumber',acc[0].GoogleInfo_International_Phone__c);
                result.put('place_id',acc[0].GoogleInfo_PlaceId__c);
                String address = '{'+
                '"street":'+'"'+acc[0].BillingStreet__c+'"'+
                ',"city":'+'"'+acc[0].BillingCity__c+'"'+
                ',"State":'+'"'+acc[0].BillingState__c+'"'+
                ',"Country":'+'"'+acc[0].BillingCountry__c+'"'+
                ',"Postalcode":'+'"'+acc[0].BillingPostalCode__c+'"'+
                '}';
                result.put('address',address);
                if(acc[0].GoogleInfo_Business_Status__c!=null)
                    result.put('business_status',acc[0].GoogleInfo_Business_Status__c);
                if(acc[0].GoogleInfo_Reviews__c!=null){
                    String strjsonReviews = acc[0].GoogleInfo_Reviews__c.unescapeHtml4();
                    result.put('reviews',strjsonReviews);
                //Map<String, Object> m = (Map<String, Object>)JSON.deserializeUntyped(strjsonReviews);   
                } 
                system.debug(acc[0].GoogleInfo_Open_Close_Hours__c);
                if(acc[0].GoogleInfo_Open_Close_Hours__c!=null){
                    List<String> str = new List<string>();
                    for(String st: acc[0].GoogleInfo_Open_Close_Hours__c.split('\\n')){
                        	str.add(st);
                    }
                    System.debug(str);
                    result.put('Openinghours',str);
                }   
                if(acc[0].GoogleInfo_Image_Url__c!=null){
                        String str ='';
                    for(String st: acc[0].GoogleInfo_Image_Url__c.split('\\n')){
                        if(str=='')
                        str = str+ '{'+'"url":'+ '"'+st+'"'+'}';
                        else
                        str = str+ ',{'+'"url":'+ '"'+st+'"'+'}';
                    }
                    result.put('photos','['+str+']');                   
                }   
                result.put('isExpired',false); 
                if(diff == null || diff>=30){
                    if(apiLimit!=null && diff>=30){
                        String no= apiLimit.APIRateLimit__c==null?'0':apiLimit.APIRateLimit__c;
                        Boolean hasAPIExhausted= apiLimit.IgnoreRateLimit__c?false: (Integer.valueOf(System.Label.Google_API_Rate_Limit)<Integer.valueOf(no));
                        result.put('hasAPIExhausted',hasAPIExhausted);
                    }
                    result.put('isExpired',true); 
    
                }              
                   
            }
            System.debug('objectName:'+result);
        }/*else if(objectName=='Property__c'){
            Date dt;
            
            list<Property__c> acc =[Select id,GoogleInfo_Last_Sync_Date__c,name,
            GoogleInfo_Rating__c,GoogleInfo_Phone__c,GoogleInfo_International_Phone__c,GoogleInfo_Reviews__c,
            GoogleInfo_Open_Close_Hours__c,GoogleInfo_Image_Url__c,BillingStreet__c,BillingCity__c,BillingState__c,
            BillingCountry__c,BillingPostalCode__c,GoogleInfo_PlaceId__c,GoogleInfo_Business_Status__c

            from Property__c where id=:recordId];
            if(acc.size()>0 && acc[0]!=null && acc[0].GoogleInfo_Last_Sync_Date__c != null ){
                dt= acc[0].GoogleInfo_Last_Sync_Date__c;
                diff = dt.daysBetween(system.today());
            }
            if(acc.size()>0 ){
                if(acc[0].GoogleInfo_Last_Sync_Date__c!=null)
                {
                    String ymd = acc[0].GoogleInfo_Last_Sync_Date__c.year()+'-'+acc[0].GoogleInfo_Last_Sync_Date__c.month()+'-'+acc[0].GoogleInfo_Last_Sync_Date__c.day();
                    result.put('lastUpdatedOn',ymd);
                }
                result.put('name',acc[0].Name);
                result.put('rating',acc[0].GoogleInfo_Rating__c);
                result.put('phoneNumber',acc[0].GoogleInfo_Phone__c);
                result.put('mobileNumber',acc[0].GoogleInfo_International_Phone__c);
                result.put('place_id',acc[0].GoogleInfo_PlaceId__c);

                if(acc[0].GoogleInfo_Business_Status__c!=null)
                    result.put('business_status',acc[0].GoogleInfo_Business_Status__c); 

                String address = '{'+
                '"street":'+'"'+acc[0].BillingStreet__c+'"'+
                ',"city":'+'"'+acc[0].BillingCity__c+'"'+
                ',"State":'+'"'+acc[0].BillingState__c+'"'+
                ',"Country":'+'"'+acc[0].BillingCountry__c+'"'+
                ',"Postalcode":'+'"'+acc[0].BillingPostalCode__c+'"'+
                '}';
                result.put('address',address);
                if(acc[0].GoogleInfo_Reviews__c!=null){
                    String strjsonReviews = acc[0].GoogleInfo_Reviews__c.unescapeHtml4();
                    result.put('reviews',strjsonReviews);
                //Map<String, Object> m = (Map<String, Object>)JSON.deserializeUntyped(strjsonReviews);   
                } 
                if(acc[0].GoogleInfo_Open_Close_Hours__c!=null){
                    List<String> str = new List<string>();
                    for(String st: acc[0].GoogleInfo_Open_Close_Hours__c.split('\\n')){
                        str.add(st);
                    }
                    System.debug(str);
                    result.put('Openinghours',str);
                }   
                if(acc[0].GoogleInfo_Image_Url__c!=null){
                        String str ='';
                    for(String st: acc[0].GoogleInfo_Image_Url__c.split('\\n')){
                        if(str=='')
                        str = str+ '{'+'"url":'+ '"'+st+'"'+'}';
                        else
                        str = str+ ',{'+'"url":'+ '"'+st+'"'+'}';
                    }
                    result.put('photos','['+str+']');                   
                }   
                result.put('isExpired',false);
                result.put('hasAPIExhausted',false);   
                if(diff == null || diff>=30){
                    if(apiLimit!=null && diff>=30){
                        String no= apiLimit.APIRateLimit__c==null?'0':apiLimit.APIRateLimit__c;
                        Boolean hasAPIExhausted= apiLimit.IgnoreRateLimit__c?false: (Integer.valueOf(System.Label.Google_API_Rate_Limit)<Integer.valueOf(no));
                        result.put('hasAPIExhausted',hasAPIExhausted);
                    }                
                    result.put('isExpired',true); 
                }                    
            }
        }*/
        
        return  result;
    }   

    @AuraEnabled
    public static void updatePropertyAddress(String recordId,String street,String city,String Country,
                                                String State,String Postalcode,list<String> openHours,
                                                String phone,String internationalPhone,Decimal rating,
                                                String reviews,String  urls,String placeid,String status,
                                                Integer noofAPIConsumed){
        
       /* System.debug('recordId:'+recordId);
        System.debug('street:'+street);
        System.debug('city:'+city);
        System.debug('State:'+State);
        System.debug('Postalcode:'+Postalcode);
        Integer totalAPIConsumed = noofAPIConsumed;
        if(String.isNotBlank(recordId)){
            Property__c pro = new Property__c(id=recordId,BillingStreet__c=street,BillingCity__c=city,BillingState__c=State,
            BillingCountry__c=Country,BillingPostalCode__c=Postalcode,GoogleInfo_Rating__c=rating,
            GoogleInfo_Reviews__c=reviews,GoogleInfo_Last_Sync_Date__c = System.today(),GoogleInfo_PlaceId__c=placeid);
        try{
            String str = '';
            for(String hours: openHours){
                str=str+'\n'+hours;
            }
           
             
            if(str!='')
                pro.GoogleInfo_Open_Close_Hours__c = str;
            else {
                pro.GoogleInfo_Open_Close_Hours__c = null;
            }
            if(phone!=null)
                pro.GoogleInfo_Phone__c = phone;
            else {
                pro.GoogleInfo_Phone__c = null;
            }    
            if(internationalPhone!=null)    
                pro.GoogleInfo_International_Phone__c=internationalPhone;
            else {
                pro.GoogleInfo_International_Phone__c = null;
            }
            if(string.isNotBlank(status))
                pro.GoogleInfo_Business_Status__c =status;
            else
                pro.GoogleInfo_Business_Status__c=null;

            if(urls!=null){
                list<object> obj = (List<object>)JSON.deserializeUntyped(urls);
                String str2 = '';
                Integer count =1;
                for(object url: obj){
                    Map<String,Object> record = (Map<String,Object>) url;
                    system.debug('##'+record.get('url'));
                    if(count <=3){                        
                        str2=str2+'\n'+geturl((string)record.get('url'),totalAPIConsumed);
                    }
                    totalAPIConsumed=totalAPIConsumed+1;
                    count = count+1;
                }            
                pro.GoogleInfo_Image_Url__c = str2;
            }else {
                pro.GoogleInfo_Image_Url__c = null;
            }
        updateAPILimit(totalAPIConsumed); 
        update pro;
        }Catch(Exception ex){
        System.debug('@Exception :=>'+ex.getStackTraceString()+' @Message=>'+ex.getMessage());
        updateAPILimit(totalAPIConsumed); throw new AuraHandledException(ex.getMessage());
        }
        }
        */
    }
    public static void updateAPILimit (Integer totalAPIConsumed){
        Google_Place_API_Rate_Limit__c apiLimit = Google_Place_API_Rate_Limit__c.getInstance('GooglePlacesAPI');
        if(apiLimit!=null){
            Integer totalCount = Integer.valueof(apiLimit.APIRateLimit__c)+totalAPIConsumed;
            apiLimit.APIRateLimit__c = String.valueOf(totalCount) ;
            update apiLimit;
        }else{
        apiLimit = new Google_Place_API_Rate_Limit__c(name='GooglePlacesAPI',
        APIRateLimit__c = String.valueof(totalAPIConsumed));
        Insert apiLimit;
        }    
     

    }
  /*  @AuraEnabled
    public static void updatePropertyGoogleInfoOpenCloseHours(String recordId,list<String> openHours){
        
        System.debug('recordId:'+recordId);
        System.debug('openHours:'+openHours);
        if(String.isNotBlank(recordId)){
            String str = '';
        for(String hours: openHours){
            str=str+'\n'+hours;
        }
        Property_District360__c pro = new Property_District360__c(id=recordId,GoogleInfo_Open_Close_Hours__c=str);
        try{
        update pro;
        }Catch(Exception ex){
        System.debug('@Exception :=>'+ex.getStackTraceString()+' @Message=>'+ex.getMessage());
        throw new AuraHandledException(ex.getMessage());
        }
        }
        
    } 
    @AuraEnabled
    public static void updatePropertyGoogleInfoMobile(String recordId,String phone,String internationalPhone ){
        
        System.debug('recordId:'+recordId);
        System.debug('phone:'+phone);
        System.debug('internationalPhone:'+internationalPhone);

        if(String.isNotBlank(recordId)){

        Property_District360__c pro = new  Property_District360__c(id=recordId);
        if(phone!=null)
            pro.GoogleInfo_Phone__c = phone;
        if(internationalPhone!=null)    
            pro.GoogleInfo_International_Phone__c=internationalPhone;
        try{
        update pro;
        }Catch(Exception ex){
        System.debug('@Exception :=>'+ex.getStackTraceString()+' @Message=>'+ex.getMessage());
        throw new AuraHandledException(ex.getMessage());
        }
        }
        
    } */
    
    public static string  geturl(String urls,Integer no){
        String url;
        Integer count =no+1;

        try{
            
            Http h = new Http();
    
            HttpRequest req = new HttpRequest();
            req.setEndpoint(Urls);
            req.setMethod('GET');
            req.setTimeout(60000);
            HttpResponse res = h.send(req);
            if(res.getStatusCode() == 302){

                 url= res.getHeader('Location');
            }
            return url;
        }Catch(Exception ex){
            System.debug('@Exception :=>'+ex.getStackTraceString()+' @Message=>'+ex.getMessage());
            updateAPILimit(count);
            throw new AuraHandledException(ex.getMessage());
        }    
    }
    @AuraEnabled
    public static void saveImage(String  recordId,String Urls)
    {
        Integer count =0;
        try{
        Http h = new Http();

        HttpRequest req = new HttpRequest();
        req.setEndpoint(Urls);
        req.setMethod('GET');

        HttpResponse res = h.send(req);
        if(res.getStatusCode() == 200){
            String filename = res.getHeader('Content-Disposition').split(';')[1].split('=')[1].replace('"','');
            System.debug(filename);
    
            ContentVersion ContVerFile = new ContentVersion();
            ContVerFile.VersionData =res.getBodyAsBlob();
            ContVerFile.Title = filename; 
            ContVerFile.ContentLocation= 's';
            ContVerFile.PathOnClient=filename;
            insert ContVerFile;    
            Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:ContVerFile.Id].ContentDocumentId;
            ContentDocumentLink cDe = new ContentDocumentLink();
            cDe.ContentDocumentId = conDoc;
            cDe.LinkedEntityId = recordId;
            cDe.ShareType = 'I';
            cDe.Visibility = 'AllUsers';
            insert cDe;   
        }
        if(res.getStatusCode() == 302){
        count  = count+1;   
        String url= res.getHeader('Location');
        HttpRequest req2 = new HttpRequest();
        req2.setEndpoint(url);
        req2.setMethod('GET');
        HttpResponse res2 = h.send(req2);

        System.debug(res2.getHeader('Content-Disposition')) ;
        String filename = res2.getHeader('Content-Disposition').split(';')[1].split('=')[1].replace('"','');
        System.debug(filename);
        System.debug(res2.getBody());
        updateAPILimit(count);
        ContentVersion ContVerFile = new ContentVersion();
        ContVerFile.VersionData =res2.getBodyAsBlob();
        ContVerFile.Title = filename; 
        ContVerFile.ContentLocation= 's';
        ContVerFile.PathOnClient=filename;
        insert ContVerFile;    
        Id conDoc = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =:ContVerFile.Id].ContentDocumentId;
        ContentDocumentLink cDe = new ContentDocumentLink();
        cDe.ContentDocumentId = conDoc;
        cDe.LinkedEntityId = recordId;
        cDe.ShareType = 'I';
        cDe.Visibility = 'AllUsers';
        insert cDe;   
        } 
    }Catch(Exception ex){
        System.debug('@Exception :=>'+ex.getStackTraceString()+' @Message=>'+ex.getMessage());
        updateAPILimit(count);throw new AuraHandledException(ex.getMessage());
    }
    }
    
    //added new code
    @AuraEnabled
    public static Boolean checkAddressDifference(String recordId) {
        if (String.isBlank(recordId)) {
            return false;
        }
        
        Account acc = [SELECT 
                       BillingStreet__c, BillingCity__c, BillingState__c, BillingCountry__c, BillingPostalCode__c,BillingCity,BillingCountry,BillingState,
                       BillingStreet,BillingPostalCode,ShippingStreet, ShippingCity, ShippingState, ShippingCountry, ShippingPostalCode
                       FROM Account WHERE Id = :recordId LIMIT 1];
        
        if (acc == null) {
            return false;
        }
        System.debug('acc'+acc);
        // Compare billing and shipping address fields
        Boolean isDifferent = false;
        
        if (acc.BillingStreet__c != acc.BillingStreet) {
            System.debug('495 inside if ');
                isDifferent = true;
            }
        
        if (acc.BillingCity__c != acc.BillingCity) {
            System.debug('500 inside if ');
                isDifferent = true;
            }
        
        if (acc.BillingState__c != acc.BillingState) {
            System.debug('505 inside if ');
                isDifferent = true;
            }
        
        if (acc.BillingCountry__c != acc.BillingCountry) {
            System.debug('510 inside if ');
                isDifferent = true;
            }
        
        if (acc.BillingPostalCode__c != acc.BillingPostalCode) {
            System.debug('515 inside if ');
                isDifferent = true;
            }
        if (acc.ShippingStreet != acc.BillingStreet__c) {
        System.debug('Shipping street different from BillingStreet__c');
        isDifferent = true;
    }
    
    if (acc.ShippingCity != acc.BillingCity__c) {
        System.debug('Shipping city different from BillingCity__c');
        isDifferent = true;
    }
    
    if (acc.ShippingState != acc.BillingState__c) {
        System.debug('Shipping state different from BillingState__c');
        isDifferent = true;
    }
    
    if (acc.ShippingCountry != acc.BillingCountry__c) {
        System.debug('Shipping country different from BillingCountry__c');
        isDifferent = true;
    }
    
    if (acc.ShippingPostalCode != acc.BillingPostalCode__c) {
        System.debug('Shipping postal code different from BillingPostalCode__c');
        isDifferent = true;
    }
        System.debug('isDifferent'+isDifferent);
        return isDifferent;
    }
    //ended new code
    
}
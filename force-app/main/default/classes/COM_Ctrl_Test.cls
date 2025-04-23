/**************************************************************************************
* Class Name			: COM_Ctrl_Test                        CodeCoverage = 93%
* Created Date			: 21-02-2024
* Created By			: Vigneswaran P
* Class Description		: Test class for COM_Ctrl.	
* Last modified by		:  
***************************************************************************************/
@isTest
public class COM_Ctrl_Test {
    @TestSetup
    public static void Testsetup(){
        List<Case> cases = new List<Case>();
        
        Case cs1 = new Case();
        cs1.Latitude_District360__c	 = '32.78173171';
        cs1.longitude_District360__c = '-96.79459193';
        cs1.Service_Request_Type__c = 'Cleaning';
        cs1.Service_Request_Sub_Type__c = 'Scrub Request';
        cs1.Status = 'New' ;
        cases.add(cs1);
        
        /*
        Case cs2 = new Case();
        cs2.Latitude_District360__c = '32.78262904';
        cs2.Longitude_District360__c = '-96.7933767';
        cs2.Report_Type__c = 'Cleaning Operations';
        cs2.Report_Sub_Type__c = 'Assessment Report';
        cs2.Status = 'New';
        cases.add(cs2);
        
        
        Case cs3 = new Case();
        cs3.Latitude_District360__c = '32.78207971';
        cs3.Longitude_District360__c = '-96.79283778';
        cs3.Report_Type__c = 'Security and Safety';
        cs3.Report_Sub_Type__c = 'Contact Report';
        cs3.Status = 'New';
        cases.add(cs3);
        
        
        Case cs4 = new Case();
        cs4.Latitude_District360__c = '32.78194502';
        cs4.Longitude_District360__c = '-96.79283691';
        cs4.Report_Type__c = 'Security and Safety';
        cs4.Report_Sub_Type__c = 'QOL Violation Report';
        cs4.Status = 'Closed';
        cases.add(cs4);
        
        
        Case cs5 = new Case();
        cs5.Latitude_District360__c = '32.78208128';
        cs5.Longitude_District360__c = '-96.79276754';
        cs5.Report_Type__c = 'Ambassador and Hospitality';
        cs5.Report_Sub_Type__c = 'QOL Violation Report';
        cs5.Status = 'Closed';
        cases.add(cs5);
        */
        insert cases;
    }
    @isTest
    public static void testmethod1(){
        
        COM_Ctrl.getAvailableFields();
        COM_Ctrl.getCasedata();
        
        COM_Ctrl.FilteredCasesParams caseParams = new COM_Ctrl.FilteredCasesParams();
        caseParams.strTypeValString = '0,3';
        
        caseParams.isClosedStatus = false;
        caseParams.isNewStatus = false;
        caseParams.lstLat = new List<Decimal>();
        caseParams.lstLong = new List<Decimal>();
        
        COM_Ctrl.LocationResponse response = COM_Ctrl.valuesSelectedFun(JSON.serialize(caseParams));
        List<case> casesTypes = response.cases;
        Assert.isTrue(casesTypes.size() > 0, 'Was expecting to find at least one Case created on the Test Setup'); // Succeeds
        
        caseParams.strSubTypeValString = '{"Cleaning":["1","0"]}';
        //COM_Ctrl.subValuesSelectedFun(JSON.serialize(caseParams));
        COM_Ctrl.LocationResponse responseSub = COM_Ctrl.subValuesSelectedFun(JSON.serialize(caseParams));
        List<case> casesSubtypes = responseSub.cases;
        Assert.isTrue(casesSubtypes.size() > 0, 'Was expecting to find at least one Case created on the Test Setup'); // Succeeds
        
        caseParams.strIndexSubSubTypeValString = '{"Cleaning":["1","0"]}';
        // COM_Ctrl.subSubValuesSelectedFun(JSON.serialize(caseParams));
       // COM_Ctrl.LocationResponse responseSubsubtypes = COM_Ctrl.subSubValuesSelectedFun(JSON.serialize(caseParams));
       // List<case> casesSubsubtypes = responseSubsubtypes.cases;
        //Assert.isTrue(casesSubsubtypes.size() > 0, 'Was expecting to find at least one Case created on the Test Setup'); // Succeeds
        
        Test.startTest();
        caseParams.lstLat = new List<Decimal>{32.782745855713415, 32.780868573318564, 32.781735016269160, 32.783179069102204, 32.783179069102204};
            caseParams.lstLong = new List<Decimal>{-96.801187632256344,-96.801531117975586,-96.798439746502439,-96.799985432238998,-96.799985432238998};
                
                COM_Ctrl.subValuesSelectedFun(JSON.serialize(caseParams));
        
       // COM_Ctrl.subSubValuesSelectedFun(JSON.serialize(caseParams));
        
        COM_Ctrl.valuesSelectedFunAfterSubmit('{"listSelectedValues":["Cleaning"],"selectedSubTypes":[],"strFromDate":null,"strToDate":null,"isNewStatus":false,"isClosedStatus":false,"lstLat":["32.780002121930053","32.781446202889860","32.784045489551062","32.784045489551062"],"lstLong":["-96.794317917871538","-96.797752775063941","-96.790196089240681","-96.790196089240681"],"typSubtypMap":{},"subtypSubSubtypMap":{},"isSubSubtypes":false,"isSubtypes":false}');
        
        
        COM_Ctrl.getBatchData('{"selLabels":["Id","CaseNumber","Report_Type__c","Status","Longitude_District360__c"],"selLabelMap":{"Id":"Case ID","name__c":"Name","CaseNumber":"Case Number","Service_Request_Type__c":"Report Type","Service_Request_Type__c":"Report Sub Type","Longitude_District360__c":"Longitude","Latitude_District360__c":"Latitude","Status":"Status","Priority":"Priority"},"listSelectedValues":["Cleaning"],"selectedSubTypes":["Graffiti Removal"],"totalSubValMap":{},"strFromDate":null,"strToDate":null,"isNewStatus":false,"isClosedStatus":false,"lstLat":["32.781590609696707","32.783756683672351","32.781735016269160","32.781735016269160"],"lstLong":["-96.795205945660726","-96.792459169723884","-96.791600802243636","-96.791600802243636"],"typSubtypMap":{"Cleaning":[Graffiti Removal"]},"subtypSubSubtypMap":{},"isSubSubtypes":true,"isSubtypes":false}');
        Test.stopTest();
        
        
    }
    
    
    
}
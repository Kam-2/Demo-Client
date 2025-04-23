/**************************************************************************************
* Class Name			: COM_Scheduleclass                        CodeCoverage = 91%
* Created Date			: 21-02-2024
* Created By			: Vigneswaran
* Class Description	    : This class is scheduled to delete the file created when it is scheduled
***************************************************************************************/

public class COM_Scheduleclass implements Schedulable {
    public Id recordIdToDelete { get; set; }
    public COM_Scheduleclass(Id recId) {
        this.recordIdToDelete = recId;
    }
    public void execute(SchedulableContext ctx) {
        if (recordIdToDelete != null) {
            try {
               Id ConDocId =  [SELECT Id, Title, ContentDocumentId, ContentDocument.LatestPublishedVersionId, ContentDocument.CreatedDate FROM ContentVersion where ID  =: recordIdToDelete].ContentDocumentId;
                List<ContentDocumentLink> ContentDocumentLinkList =[SELECT id,contentdocumentid,linkedentity.name,linkedentityid,linkedentity.type 
                                                                    FROM ContentDocumentLink WHERE linkedentityid in 
                                                                    (SELECT id FROM User where id=: UserInfo.getUserId())];
                
                List<ContentDocument> ConDocList = [SELECT Id, title,CreatedBy.name, ContentSize, ParentId FROM ContentDocument where Id =: ConDocId];
                delete ConDocList; 
            } 
            catch (Exception e) {
                System.debug('Error removing association: ' + e.getMessage());
            }
        } else {
            System.debug('No record ID provided to remove association.');
        }
    }
}
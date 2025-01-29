/*
**************************************************************************
@Apex Class Name    : BookInventoryController
@Test Class name	: BookInventoryControllerTest
@Created Date       : November 10, 2024
@description        : This is class is used to handle Book Inventory Details
@author             : Pradeep Kumar Reddy Dhanireddy

Modification Log:
Ver   Date         Author                               Modification
1.0   11-10-2024   Pradeep Kumar Reddy Dhanireddy       Initial Version
**************************************************************************
*/
public with sharing class BookInventoryController {
    /*
    **************************************************************
    @Method Name    : getBooks
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to get Book Details
    @param          : null
    @return         : String
    **************************************************************
    */
    @AuraEnabled
    public static String getBooks(){
        List<bookDataWrap> bdWrapList = new List<bookDataWrap>();
        try{
            Map<Id, Book__c> bookMap = new Map<Id, Book__c>([SELECT Id,Name, Author__c,Availability__c, Genre__c, Price__c, Status__c, Stock_Quantity__c,Title__c,Book_Thumbnail__c 
                                                             FROM Book__c where Status__c='Approved' WITH USER_MODE ORDER BY lastmodifiedDate desc ]);
            Map<Id, ContentDocumentLink> contentDocLinkMap = new Map<Id, ContentDocumentLink>();
            if(!bookMap.Isempty()){
                for(ContentDocumentLink cntDoclink : [SELECT LinkedEntityId,ContentDocument.FileExtension, ContentDocument.LatestPublishedVersion.Title, ContentDocument.LatestPublishedVersion.VersionData
                                                      FROM ContentDocumentLink
                                                      WHERE LinkedEntityId IN: bookMap.keySet() WITH USER_MODE order By ContentDocument.createddate desc]){
                                                        if(!contentDocLinkMap.containsKey(cntDoclink.LinkedEntityId)){
                                                          contentDocLinkMap.put(cntDoclink.LinkedEntityId,cntDoclink);
                                                        }
                                                      }
                for(Book__c bookRec : bookMap.values()){
                    
                    bookDataWrap bdWp = new bookDataWrap();
                    bdWp.Id = bookRec.Id; 
                    bdWp.title = bookRec.Title__c;
                    bdWp.author = bookRec.Author__c;
                    bdWp.availability = bookRec.Availability__c;
                    bdWp.bookName = bookRec.Name;
                    bdWp.stockQuantity = bookRec.Stock_Quantity__c;
                    bdWp.genre = bookRec.Genre__c;
                    bdWp.price = bookRec.Price__c;
                    if(!contentDocLinkMap.IsEmpty() && contentDocLinkMap.get(bookRec.Id) !=null){
                        String base64Data;
                        base64Data = 'data:image/' + contentDocLinkMap.get(bookRec.Id).ContentDocument.FileExtension + ';charset=utf-8;base64, ';
                        base64Data += EncodingUtil.base64Encode(contentDocLinkMap.get(bookRec.Id).ContentDocument.LatestPublishedVersion.VersionData);
                        bdWp.bookImage = base64Data;
                    }
                    bdWrapList.add(bdWp);
                }  
            }
        }
        catch(exception ex){          
            LogExecptionUtill.createErrorLog('BookInventoryController','getBooks',ex.getMessage());
            throw new AuraHandledException(ex.getMessage());
        }
        system.debug('bdWrapList'+bdWrapList);
        return JSON.Serialize(bdWrapList);
    }
    
    /*
    *****************************************************************
    @Method Name    : getPendingApprovalBooks
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to get Pending Approval Books
    @param          : null
    @return         : String
    *****************************************************************
    */
    @AuraEnabled
    public static String getPendingApprovalBooks(){
        List<pendingApprovalWrap> pendingBookList = new List<pendingApprovalWrap>();
        try{
            set<Id> workItemSet = new set<Id>();
            map<Id, ProcessInstanceStep> procInStepMap = new map<Id,ProcessInstanceStep>();
            for(ProcessInstanceWorkitem procIns :  [Select Id, ProcessInstanceId,ProcessInstance.SubmittedBy.Name from ProcessInstanceWorkitem where ProcessInstance.status='Pending' and ActorId=:userInfo.getUserId()]){
                workItemSet.add(procIns.ProcessInstanceId);
            }
            for(ProcessInstanceStep procInsStep :  [Select Id,ProcessInstance.TargetObjectId,Comments, ProcessInstance.SubmittedBy.Name from ProcessInstanceStep where ProcessInstanceId IN:workItemSet]){
                procInStepMap.put(procInsStep.ProcessInstance.TargetObjectId,procInsStep);
            }
            for(Book__c bok :[SELECT Id, Name,Status__c FROM Book__c where  Id IN:procInStepMap.KeySet() WITH USER_MODE ORDER BY lastmodifiedDate desc ]){
                pendingApprovalWrap paw = new pendingApprovalWrap();
                paw.bookId = bok.Id;
                paw.bookName = bok.Name;
                paw.status = bok.Status__c;
                paw.comments = procInStepMap.get(bok.Id).Comments;
                paw.submittedBy = procInStepMap.get(bok.Id).ProcessInstance.SubmittedBy.Name;
                pendingBookList.add(paw);
            }
        }
        catch(exception ex){
            LogExecptionUtill.createErrorLog('BookInventoryController','getPendingApprovalBooks', ex.getMessage());
            throw new AuraHandledException(ex.getMessage());
        }
        return JSON.Serialize(pendingBookList);
    }
    
    /*
    *****************************************************************
    @Method Name    : getDashboardMetrics
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to get Dashboard Metrics
    @param          : null
    @return         : Map<String, Integer>
    *****************************************************************
    */
    @AuraEnabled(cacheable=true)
    public static Map<String, Integer> getDashboardMetrics() {
        Map<String, Integer> metrics = new Map<String, Integer>();
        try{          
            AggregateResult[] totalSalesResult = [SELECT COUNT(Id) totalSales FROM Book__c where Status__c='Approved'];
            AggregateResult[] stockQuantityResult = [SELECT SUM(Stock_Quantity__c) stockQuantity FROM Book__c where Availability__c='Yes' and Status__c='Approved'];
            metrics.put('totalBooks', Integer.valueOf(totalSalesResult[0].get('totalSales')));
            metrics.put('availableStock', Integer.valueOf(stockQuantityResult[0].get('stockQuantity')));
            metrics.put('salesPerformance', 1234); // Placeholder for sales data
            
        }
        catch(exception ex){
            LogExecptionUtill.createErrorLog('BookInventoryController','getDashboardMetrics',  JSON.Serialize(ex.getMessage()));
            throw new AuraHandledException(ex.getMessage());
        }
        return metrics;
    }
    
    /*
    *****************************************************************
    @Method Name    : submitForApproval
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to submit Book For Approval
    @param          : String bookId
    @return         : null
    *****************************************************************
    */
    @AuraEnabled
    public static void submitForApproval(String bookId) {
        try{
            if(!String.isBlank(bookId)){
                Approval.ProcessSubmitRequest req = new Approval.ProcessSubmitRequest();          
                req.setComments('Submitting approval Request');        
                req.setObjectId(bookId);     
                Approval.ProcessResult result = Approval.process(req);  
            }
        }
        catch(exception ex){
            LogExecptionUtill.createErrorLog('BookInventoryController','submitForApproval',  JSON.Serialize(ex.getMessage()));
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
	/*
    *****************************************************************
    @Method Name    : approveRecord
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to approve Book Record
    @param          : String bookId
    @return         : null
    *****************************************************************
    */
    @AuraEnabled
    public static void approveRecord(String bookId, String comments){
        try{
			if(!String.isBlank(bookId)){
                Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
                req.setComments(comments);
                req.setAction('Approve');        
                Id workItemId = getWorkItemId(bookId); 
                if(workItemId != null){
                    req.setWorkitemId(workItemId);
                    // Submit the request for approval
                    Approval.ProcessResult result =  Approval.process(req);
                }
            }
        }
        catch(exception ex){
            LogExecptionUtill.createErrorLog('BookInventoryController','approveRecord', ex.getMessage());
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
  	/*
    *****************************************************************
    @Method Name    : rejectRecord
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to reject Book Record
    @param          : String bookId
    @return         : null
    *****************************************************************
    */
    @AuraEnabled
    public static void rejectRecord(String bookId,String comments){
        try{
            if(!String.isBlank(bookId)){
                Approval.ProcessWorkitemRequest req = new Approval.ProcessWorkitemRequest();
                req.setComments(comments);
                req.setAction('Reject');
                Id workItemId = getWorkItemId(bookId);
                if(workItemId != null){
                    req.setWorkitemId(workItemId);
                    Approval.ProcessResult result =  Approval.process(req);
                }
            }
        }
        catch(exception ex){
            LogExecptionUtill.createErrorLog('BookInventoryController','rejectRecord', ex.getMessage());
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    /*
    *****************************************************************
    @Method Name    : getWorkItemId
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to get WorkItem Id
    @param          : Id targetObjectId
    @return         : Id
    *****************************************************************
    */
    public static Id getWorkItemId(Id targetObjectId){
        Id workItemId = null;
        try{     
            for(ProcessInstanceWorkitem workItem  : [Select Id from ProcessInstanceWorkitem where ProcessInstance.TargetObjectId =: targetObjectId WITH USER_MODE]){
                workItemId  =  workItem.Id;
            }
            
        }
        catch(exception ex){
            LogExecptionUtill.createErrorLog('BookInventoryController','getWorkItemId', ex.getMessage());
        }
        return workItemId;
    }
    
    /*
    *****************************************************************
    @Method Name    : uploadFiles
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to upload Files to Books
    @param          : String recordId, String filedata
    @return         : String
    *****************************************************************
    */
    @AuraEnabled
    public static String uploadFiles(String recordId, String filedata) {
        try {
            Set<Id> docIdList = new Set<Id>();
            for(ContentDocumentLink cdl :  [SELECT Id,contentdocumentid
                                            FROM ContentDocumentLink 
                                            WHERE LinkedEntityId=:recordId ]){
                                                docIdList.add(cdl.contentdocumentid);
                                            }  
            
            if(String.isNotBlank(FileData)) {
                List<fileDataWP> files = (List<fileDataWP>) JSON.deserialize(filedata, List<fileDataWP>.class);
                System.debug(files);
                
                List<ContentVersion> cvList = new List<ContentVersion>();
                for(fileDataWP file : files) {
                    ContentVersion conVer = new ContentVersion();
                    conVer.ContentLocation = 'S'; // S = Salesforce, E = External Files
                    conVer.VersionData = EncodingUtil.base64Decode(file.fileContent);
                    conVer.Title = file.fileName;
                    conVer.PathOnClient = file.fileName;
                    cvList.add(conVer);
                }
                Insert cvList;
                
                List<ContentDocumentLink> cdList = new List<ContentDocumentLink>();
                for(ContentVersion cv : [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: cvList]) {
                    ContentDocumentLink conDocLink = New ContentDocumentLink();
                    conDocLink.LinkedEntityId = recordId;
                    conDocLink.ContentDocumentId = cv.ContentDocumentId;
                    conDocLink.Visibility = 'AllUsers';
                    conDocLink.shareType = 'V'; // V = Viewer, C = Collaborator, I = Inferred
                    cdList.add(conDocLink);
                }
                Insert cdList;        
            } else {
                return 'record Id is Blank';
            }
            return 'success';
        } catch (Exception ex) {
            LogExecptionUtill.createErrorLog('BookInventoryController','uploadFiles', ex.getMessage());
            throw new AuraHandledException(ex.getMessage());
        }
    }
    
    /*
    *****************************************************************
    @Wrapper Name   : fileDataWP
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : wrapper for file data 
    @param          : null
    @return         : fileDataWP 
    *****************************************************************
    */
    public class fileDataWP {
        public String fileName;
        public String fileContent;
    }

    /*
    *****************************************************************
    @Wrapper Name   : fileDataWP
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : wrapper for file data 
    @param          : null
    @return         : fileDataWP 
    *****************************************************************
    */
    public class pendingApprovalWrap {
        public String bookId;
        public String bookName;
        public String status;
        public String comments;
        public String submittedBy;
    }
    
    /*
    *****************************************************************
    @Wrapper Name   : bookDataWrap
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : wrapper for book data
    @param          : null
    @return         : bookDataWrap
    *****************************************************************
    */
    public class bookDataWrap {
        public String id;
        public String title;
        public String author;
        public String availability;
        public String bookName;
        public Decimal stockQuantity;
        public String bookImage;
        public String genre;
        public Decimal price;
        
    }
    
}
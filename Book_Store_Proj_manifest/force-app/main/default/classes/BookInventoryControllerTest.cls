/*
**************************************************************************
Apex Class Name    : BookInventoryControllerTest
Created Date       : November 10, 2024
@description       : This is test class for BookInventoryController class
@author            : Pradeep Kumar Reddy Dhanireddy

Modification Log:
Ver   Date         Author                               Modification
1.0   11-10-2024   Pradeep Kumar Reddy Dhanireddy       Initial Version
**************************************************************************
*/ 
@isTest
public class BookInventoryControllerTest {
    /*
    **************************************************************
    @Method Name    : setupTestData
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used for setupTestData
    @param          : null
    @return         : null
    **************************************************************
    */   
    @testSetup
    static void setupTestData() {
        // Create some test Book__c records
        List<Book__c> booksList = new List<Book__c>();
        Book__c bke1 =new Book__c(
            Name = 'Book 1',
            Author__c = 'Author 1',
            Availability__c = 'Yes',
            Genre__c = 'Genre 1',
            Price__c = 20,
            Status__c = 'Approved',
            Stock_Quantity__c = 10,
            Title__c = 'Title 1'
        );
        booksList.add(bke1);
        Book__c bke2 =new Book__c(
            Name = 'Book 2',
            Author__c = 'Author 2',
            Availability__c = 'Yes',
            Genre__c = 'Genre 2',
            Price__c = 20,
            Status__c = 'Pending Approval',
            Stock_Quantity__c = 10,
            Title__c = 'Title 2'
        );
        booksList.add(bke2);
        
        insert booksList;
        
        // Create a ContentVersion and link it to the first book
        ContentVersion contentVersion = new ContentVersion(
            Title = 'Sample Book Image',
            PathOnClient = 'bookImage.jpg',
            VersionData = Blob.valueOf('Test Image Data')
        );
        insert contentVersion;
        
        ContentVersion contentDocument = [SELECT ContentDocumentId FROM ContentVersion WHERE Id =: contentVersion.Id];
        
        // Create a ContentDocumentLink linked to the first book
        ContentDocumentLink contentDocumentLink = new ContentDocumentLink(
            LinkedEntityId = booksList[0].Id,
            ContentDocumentId = contentDocument.ContentDocumentId,
            Visibility = 'AllUsers',
            ShareType = 'V'
        );
        insert contentDocumentLink;
    }

    /*
    **************************************************************
    @Method Name    : testGetBooks
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test get Book Details
    @param          : null
    @return         : null
    **************************************************************
    */       
    @isTest
    static void testGetBooks() {
        Test.startTest();
        String booksJson = BookInventoryController.getBooks();
        System.assertNotEquals(null, booksJson, 'The returned JSON should not be null');
        System.assert(booksJson.contains('"title"'), 'The JSON should contain book details');
        Test.stopTest();
    }

    /*
    **************************************************************
    @Method Name    : testGetPendingApprovalBooks
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test pending Approval Books
    @param          : null
    @return         : null
    **************************************************************
    */       
    @isTest
    static void testGetPendingApprovalBooks() {
        Test.startTest();
        String booksJson = BookInventoryController.getPendingApprovalBooks();
        System.assertNotEquals(null, booksJson, 'The returned JSON should not be null');
        Test.stopTest();
    }

    /*
    **************************************************************
    @Method Name    : testGetDashboardMetrics
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test Dashboard Metrics
    @param          : null
    @return         : null
    **************************************************************
    */       
    @isTest
    static void testGetDashboardMetrics() {
        Test.startTest();
        Map<String, Integer> metrics = BookInventoryController.getDashboardMetrics();
        System.assertNotEquals(null, metrics, 'The metrics map should not be null');
        System.assert(metrics.containsKey('totalBooks'), 'The metrics map should contain "totalBooks" key');
        System.assert(metrics.containsKey('availableStock'), 'The metrics map should contain "availableStock" key');
        Test.stopTest();
    }

    /*
    **************************************************************
    @Method Name    : testSubmitForApproval
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test Submit For Approval
    @param          : null
    @return         : null
    **************************************************************
    */       
    @isTest
    static void testSubmitForApproval() {
        Book__c book = [SELECT Id FROM Book__c WHERE Status__c = 'Pending Approval' LIMIT 1];
        Test.startTest();
        BookInventoryController.submitForApproval(book.Id);
        // Check for approval process existence (mock testing)
        Test.stopTest();
    }

    /*
    **************************************************************
    @Method Name    : testApproveRecord
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test Approve Record
    @param          : null
    @return         : null
    **************************************************************
    */       
    @isTest
    static void testApproveRecord() {
        Book__c book = [SELECT Id FROM Book__c LIMIT 1];
        Approval.ProcessSubmitRequest req = new Approval.ProcessSubmitRequest();          
        req.setComments('Submitting approval Request');        
        req.setObjectId(book.Id);    
        Approval.ProcessResult result = Approval.process(req);
        Test.startTest();
        BookInventoryController.approveRecord(book.Id, 'test');
        // Simulate checking for successful approval
        Test.stopTest();
    }

    /*
    **************************************************************
    @Method Name    : testRejectRecord
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test Reject Record
    @param          : null
    @return         : null
    **************************************************************
    */       
    @isTest
    static void testRejectRecord() {
        Book__c book = [SELECT Id FROM Book__c LIMIT 1];
        Approval.ProcessSubmitRequest req = new Approval.ProcessSubmitRequest();          
        req.setComments('Submitting approval Request');        
        req.setObjectId(book.Id);    
        Approval.ProcessResult result = Approval.process(req);
        Test.startTest();
        BookInventoryController.rejectRecord(book.Id,'test');
        // Simulate checking for rejection
        Test.stopTest();
    }

    /*
    **************************************************************
    @Method Name    : testUploadFiles
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test Upload Files
    @param          : null
    @return         : null
    **************************************************************
    */       
    @isTest
    static void testUploadFiles() {
        Book__c book = [SELECT Id FROM Book__c LIMIT 1];
        String sampleFileData = '[{"fileName":"testFile.jpg","fileContent":"' + EncodingUtil.base64Encode(Blob.valueOf('Sample Content')) + '"}]';
        
        Test.startTest();
        String result = BookInventoryController.uploadFiles(book.Id, sampleFileData);
        System.assertEquals('success', result, 'The uploadFiles method should return "success"');
        Test.stopTest();
    }
    
    /*
    **************************************************************
    @Method Name    : testThrowSubmitException
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test Throw Submit Exception
    @param          : null
    @return         : null
    **************************************************************
    */   
   	@isTest
    static void testThrowSubmitException() {
        try{
            Test.startTest();           
            BookInventoryController.submitForApproval('test');
            Test.stopTest();
        }
        catch(exception ex){
           
        }
    }
    
    /*
    **************************************************************
    @Method Name    : testThrowApproveException
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test Throw Approve Exception
    @param          : null
    @return         : null
    **************************************************************
    */   
    @isTest
    static void testThrowApproveException() {
        try{
            Test.startTest();           
            BookInventoryController.approveRecord('test','test');
            Test.stopTest();
        }
        catch(exception ex){
           
        }
    }
    
    /*
    **************************************************************
    @Method Name    : testThrowRejectException
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to test Throw Reject Exception
    @param          : null
    @return         : null
    **************************************************************
    */   
    @isTest
    static void testThrowRejectException() {
        try{
            Test.startTest();           
            BookInventoryController.rejectRecord('test','test');
            Test.stopTest();
        }
        catch(exception ex){
           
        }
    }
    
}
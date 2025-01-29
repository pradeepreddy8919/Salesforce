/*
**************************************************************************
Apex Trigger Name  : ErrorLogEventTrigger
Created Date       : November 10, 2024
@description       : This is platform event trigger on Error_Log_Event__e
					 runs after event is published
@author            : Pradeep Kumar Reddy Dhanireddy

Modification Log:
Ver   Date         Author                               Modification
1.0   11-10-2024   Pradeep Kumar Reddy Dhanireddy       Initial Version
**************************************************************************
*/
trigger ErrorLogEventTrigger on Error_Log_Event__e (after insert) {    
    List<Error_Log__c> errorLogList = new List<Error_Log__c>();
    for(Error_Log_Event__e errlg : Trigger.new){
        Error_Log__c errLog = new Error_Log__c();
        errLog.Class_Name__c = errlg.Class_Name__c;
        errLog.Method_Name__c = errlg.Method_Name__c;
        errLog.Error_Messge__c	= errlg.Exception_Message__c ;
        errLog.Initiated_By_User__c = errlg.Initiated_By_User__c;
        errorLogList.add(errlog);    
    }
    if(!errorLogList.isempty()){
        Insert errorLogList;
    }
       
}
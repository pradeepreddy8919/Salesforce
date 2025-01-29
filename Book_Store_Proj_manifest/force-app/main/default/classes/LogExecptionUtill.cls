/*
**************************************************************************
Apex class Name    : LogExecptionUtill
Created Date       : November 10, 2024
@description       : This is used to cstore exception log
@author            : Pradeep Kumar Reddy Dhanireddy

Modification Log:
Ver   Date         Author                               Modification
1.0   11-10-2024   Pradeep Kumar Reddy Dhanireddy       Initial Version
**************************************************************************
*/
public class LogExecptionUtill {
    /*
    **************************************************************
    @Method Name    : createErrorLog
    @author         : Pradeep Kumar Reddy Dhanireddy
    @description    : method to is used to publish Error Log Event 
    @param          : String className , String methodName, String errorMessage 
    @return         : null
    **************************************************************
    */
    public static void createErrorLog(String className , String methodName, String errorMessage ){
        Error_Log_Event__e errLogEvt = new Error_Log_Event__e();
        errLogEvt.Class_Name__c = className;
        errLogEvt.Method_Name__c = methodName;
        errLogEvt.Exception_Message__c = errorMessage;
        errLogEvt.Initiated_By_User__c = userinfo.getuserid();
        EventBus.Publish(errLogEvt);
    }
    
}
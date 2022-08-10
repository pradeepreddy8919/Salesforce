************HTML***********************
<template>

	<!-- Related Account Opportunity Activities -->
	<lightning-card title="Related Account Opportunity Activities">
		<template if:true={AccOpploading}>
			<lightning-spinner alternative-text="Loading" size="medium"></lightning-spinner>
		</template>
		<template if:false={displayOpprecords}>
			<div style="height:250px;">
				<!-- <div class="slds-p-around_xx-small"> -->
				<lightning-datatable key-field="Id" data={lstOpps} columns={OpplstColumns} show-row-number-column
					hide-checkbox-column>
				</lightning-datatable>
				<!-- </div> -->
			</div>
		</template>
		<template if:true={displayOpprecords}>
			<p style="text-align: center;"><b> No data available to display </b></p>
		</template>
	</lightning-card>
	<br>
	<!-- Related Account Lead Activities -->
	<lightning-card title="Related Account Lead Activities">
		<template if:true={AccLeadloading}>
			<lightning-spinner alternative-text="Loading" size="medium"></lightning-spinner>
		</template>
		<template if:false={displayleadrecords}>
			<div style="height:250px;">
				<!-- <div class="slds-p-around_xx-small"> -->
				<lightning-datatable key-field="Id" data={lstleads} columns={LeadlstColumns} show-row-number-column
					hide-checkbox-column>
				</lightning-datatable>
				<!-- </div> -->
			</div>
		</template>
		<template if:true={displayleadrecords}>
			<p style="text-align: center;"><b> No data available to display </b></p>
		</template>
	</lightning-card>
	<!-- Campign Members -->
	<lightning-card title="Related Account Campaign Memebers">
		<template if:true={CampMemloading}>
			<lightning-spinner alternative-text="Loading" size="medium"></lightning-spinner>
		</template>
		<template if:false={displayCampMemrecords}>
			<div style="height:250px;">
				<!-- <div class="slds-p-around_xx-small"> -->
				<lightning-datatable key-field="Id" data={lstCampMem} columns={CampMemColumns} show-row-number-column
					hide-checkbox-column>
				</lightning-datatable>
				<!-- </div> -->
			</div>
		</template>
		<template if:true={displayCampMemrecords}>
			<p style="text-align: center;"><b> No data available to display </b></p>
		</template>
	</lightning-card>
	<br>
	<!-- Related Account Activities -->
	<lightning-card title="Related Account Activities">
		<template if:true={Accloading}>
			<lightning-spinner alternative-text="Loading" size="medium"></lightning-spinner>
		</template>
		<template if:false={displayAccrecords}>
			<div style="height:250px;">
				<!-- <div class="slds-p-around_xx-small"> -->
				<lightning-datatable key-field="Id" data={lstAccounts} columns={AcclstColumns} show-row-number-column
					hide-checkbox-column>
				</lightning-datatable>
				<!-- </div> -->
			</div>
		</template>
		<template if:true={displayAccrecords}>
			<p style="text-align: center;"><b> No data available to display </b></p>
		</template>
	</lightning-card>

</template>





************js*************
import { LightningElement, track, api } from 'lwc';
import fetchAccountActivites from '@salesforce/apex/MH_LeadRelatedActivites.fetchAccountActivites';
import fetchOpportunityActivites from '@salesforce/apex/MH_LeadRelatedActivites.fetchOpportunityActivites';
import fetchLeadActivites from '@salesforce/apex/MH_LeadRelatedActivites.fetchLeadActivites';
import fetchCampaignMembers from '@salesforce/apex/MH_LeadRelatedActivites.fetchCampaignMembers';

// coloumns for account activites
const ACCCOLUMNS = [
    {
        label: 'Account Name', fieldName: 'AccountURL', type: 'url',
        typeAttributes: {
            label: {
                fieldName: 'Name'
            }
        }, initialWidth: 133,
        wrapText: true
    },
    { label: 'Subject', fieldName: 'Subject', type: 'text', initialWidth: 100, wrapText: true },
    { label: 'Activity Date', fieldName: 'ActivityDate', type: 'DateTime', initialWidth: 122, wrapText: true },
    { label: 'Address', fieldName: 'Physical_Address__c', type: 'text', initialWidth: 120, wrapText: true },
    { label: 'Date of Birth', fieldName: 'MH_BirthDate__c', type: 'text', initialWidth: 120, wrapText: true },
    { label: 'Call Category', fieldName: 'MH_Call_Outcome_Category__c', type: 'text', initialWidth: 128, wrapText: true },
    { label: 'Phone', fieldName: 'Phone', type: 'Phone', wrapText: true }
];
// coloumns for opportunity activites
const OPPCOLUMNS = [
    {
        label: 'Opportunity Name', fieldName: 'OpportunityURL', type: 'url',
        typeAttributes: {
            label: {
                fieldName: 'Name'
            }
        }, wrapText: true
    },
    { label: 'Subject', fieldName: 'Subject', type: 'text', wrapText: true },
    { label: 'Activity Date', fieldName: 'ActivityDate', type: 'DateTime', wrapText: true },
    { label: 'Call Category', fieldName: 'MH_Call_Outcome_Category__c', type: 'text', wrapText: true }
];
// coloumns for lead activites
const LEADCOLUMNS = [
    {
        label: 'Lead Name', fieldName: 'LeadURL', type: 'url',
        typeAttributes: {
            label: {
                fieldName: 'Name'
            }
        }, wrapText: true
    },
    { label: 'Subject', fieldName: 'Subject', type: 'text', wrapText: true },
    { label: 'Activity Date', fieldName: 'ActivityDate', type: 'DateTime', wrapText: true },
    { label: 'Call Category', fieldName: 'MH_Call_Outcome_Category__c', type: 'text', wrapText: true }
];
// coloumns for Campaign members 
const CAMPMEMCOLUMNS = [{
    label: 'Campaign Name', fieldName: 'CampMemURL', type: 'url',
    typeAttributes: {
        label: {
            fieldName: 'CampaignName'
        }
    }, initialWidth: 190,wrapText: true
},
{ label: 'TFN', fieldName: 'CampaignTFN', type: 'text' },
{ label: 'Status', fieldName: 'CampaignStatus', type: 'text' },
{ label: 'First Name', fieldName: 'FirstName', type: 'text' },
{ label: 'Postal Code', fieldName: 'PostalCode', type: 'text', wrapText: true },
{ label: 'State', fieldName: 'State', type: 'text', wrapText: true }

];

export default class mhLeadParentRelatedActivites extends LightningElement {
    @api recordId;
    @track lstAccounts;
    @track displayAccrecords;
    @track displayOpprecords;
    @track displayleadrecords;
    @track displayCampMemrecords;
    @track lstOpps;
    @track lstleads;
    @track lstCampMem;
    @track lstCampMemActivites;
    AccOpploading;
    AccLeadloading;
    CampMemloading;
    Accloading;
    AcclstColumns = ACCCOLUMNS;
    OpplstColumns = OPPCOLUMNS;
    LeadlstColumns = LEADCOLUMNS;
    CampMemColumns = CAMPMEMCOLUMNS;



    connectedCallback() {
        this.AccOpploading = true;
        this.AccLeadloading = true;
        this.CampMemloading = true;
        this.Accloading = true;
        this.getOpportunityActivites();
        this.getLeadActivites();
        this.getCampaignMembers();
        this.getAccountActivites();
    }

    // get related account activites from apex
    getOpportunityActivites() {
        fetchOpportunityActivites({ leadid: this.recordId }).then(response => {
            // let opplist =[];
            // opplist = response;
            console.log('responeopp', JSON.stringify(response));
            this.lstOpps = this.mapactivites(response);
            if (this.lstOpps) {
              
                this.lstOpps.forEach(item => item['OpportunityURL'] = '/lightning/r/Opportunity/' + item['WhatId'] + '/view');

            }
            if (this.lstOpps.length === 0) {
                this.displayOpprecords = true;
            }
            else {
                this.displayOpprecords = false;
            }
            this.AccOpploading = false;
            console.log('lstopp', JSON.stringify(this.lstOpps));
        }).catch(error => {
            console.log('Error: ' + error);
        });
    }
    // get related lead activites from apex
    getLeadActivites() {
        fetchLeadActivites({ leadid: this.recordId }).then(response => {
            this.lstleads = this.mapactivites(response);
            console.log('leadrespone', JSON.stringify(response));
            if (this.lstleads) {
                this.lstleads.forEach(item => item['LeadURL'] = '/lightning/r/Lead/' + item['WhoId'] + '/view');
            
            }
            if (this.lstleads.length === 0) {
                console.log('true');
                this.displayleadrecords = true;
            }
            else {
                this.displayleadrecords = false;
            }
            this.AccLeadloading = false;
            console.log('lstleads', JSON.stringify(this.lstleads));
        }).catch(error => {
            console.log('Error: ' + error);
        });
    }
    // get related campaign members from apex
    getCampaignMembers() {
        console.log('truecamp');
        fetchCampaignMembers({ leadid: this.recordId }).then(response => {
            this.lstCampMem = response;
            console.log('lstCampMem', JSON.stringify(this.lstCampMem));
            if (this.lstCampMem) {
                this.lstCampMem.forEach(item => item['CampMemURL'] = '/lightning/r/CampaignMember/' + item['CampaignId'] + '/view');
                for (var i = 0; i < this.lstCampMem.length; i++) {
                    if (this.lstCampMem[i].Campaign) {
                        this.lstCampMem[i].CampaignName = this.lstCampMem[i].Campaign.Name;
                        this.lstCampMem[i].CampaignTFN = this.lstCampMem[i].Campaign.MH_TFN__c;
                        this.lstCampMem[i].CampaignStatus = this.lstCampMem[i].Campaign.Status;

                    }
                }

            }
            if (this.lstCampMem.length === 0) {
                this.displayCampMemrecords = true;
            }
            else {
                this.displayCampMemrecords = false;
            }
            this.CampMemloading = false;
            console.log('lst', JSON.stringify(this.lstCampMem));
        }).catch(error => {
            console.log('Error: ', JSON.stringify(error));
        });
    }
    // get related Account activites from apex
    getAccountActivites() {
        fetchAccountActivites({ leadid: this.recordId }).then(response => {
            console.log('responeacc', JSON.stringify(response));
            this.lstAccounts = this.mapactivites(response);
            if (this.lstAccounts) {
                this.lstAccounts.forEach(item => item['AccountURL'] = '/lightning/r/Account/' + item['WhatId'] + '/view');
				   // for (var i = 0; i < this.lstAccounts.length; i++) {
                //     if (this.lstAccounts[i].What) {
                //         this.lstAccounts[i].AccountName = this.lstAccounts[i].What.Name;
                //         this.lstAccounts[i].AccountAddress = this.lstAccounts[i].Account.Physical_Address__c;
                //         this.lstAccounts[i].AccountPhone = this.lstAccounts[i].Account.Phone;
                //         this.lstAccounts[i].AccountDOB = this.lstAccounts[i].Account.MH_BirthDate__c;
                //     }
                // }
            }
            if (this.lstAccounts.length === 0) {
                this.displayAccrecords = true;

            }
            else {
                this.displayAccrecords = false;
            }
            this.Accloading = false;
            console.log('lstacc', JSON.stringify(this.lstAccounts));
        }).catch(error => {
            console.log('Error: ' + error);
        });
    }
    mapactivites(maplist) {
        var newArr = [];
        maplist.map((item) => {
            if (item.Events && item.Events.length > 0) {
                item.Events.map((item1) => {
                    var obj = item1;
                    obj.Name = item.Name;
                    if (item.Physical_Address__c)
                        obj.Physical_Address__c = item.Physical_Address__c;
                    if (item.MH_BirthDate__c)
                        obj.MH_BirthDate__c = item.MH_BirthDate__c;
                    if (item.Phone)
                        obj.Phone = item.Phone;
                    newArr.push(obj);
                });
            }
            if (item.Tasks && item.Tasks.length > 0) {
                item.Tasks.map((item2) => {
                    var obj = item2;
                    obj.Name = item.Name;
                    if (item.Physical_Address__c)
                        obj.Physical_Address__c = item.Physical_Address__c;
                    if (item.MH_BirthDate__c)
                        obj.MH_BirthDate__c = item.MH_BirthDate__c;
                    if (item.Phone)
                        obj.Phone = item.Phone;
                    newArr.push(obj);
                });
            }
        });
        return newArr;
    }
}



*****************apex*****************

public class MH_LeadRelatedActivites {

    @AuraEnabled
    public static list<sObject> fetchAccountActivites(string leadid){
        set<id> AccountIds = getAccountIds(leadid);
        // List<Task> tsklist = [Select ID, Subject, ActivityDate, WhatId, What.Name, MH_Call_Outcome_Category__c,Account.Physical_Address__c, Account.MH_BirthDate__c,  Account.Phone  from Task 
        //                       WHERE ActivityDate  = LAST_N_DAYS:60 And WhatId IN : AccountIds LIMIT 50];
        // List<Event> evntlist= [Select ID, Subject, ActivityDate, WhatId, What.Name, MH_Call_Outcome_Category__c, Account.Physical_Address__c, Account.MH_BirthDate__c, Account.Phone  from Event 
        //                        WHERE ActivityDate  = LAST_N_DAYS:60 And WhatId IN: AccountIds LIMIT 50];
        // List<sObject> acclist=new List<sObject>();
        // acclist.addAll(tsklist);
        // acclist.addAll(evntlist);  
         list<Account> acclist=  [Select Id, Name,Physical_Address__c, MH_BirthDate__c,  Phone,(Select ID, Subject, ActivityDate, MH_Call_Outcome_Category__c from Tasks 
                              WHERE ActivityDate  = LAST_N_DAYS:60), (Select ID, Subject, ActivityDate, MH_Call_Outcome_Category__c from
                               Events WHERE ActivityDate  = LAST_N_DAYS:60) from Account where Id IN:AccountIds];
        return acclist;
    }
    @AuraEnabled
    public static list<sObject> fetchOpportunityActivites(string leadid){  
        set<id> AccountIds = getAccountIds(leadid);
        List<opportunity> oppId= [SELECT Id from opportunity where AccountId=:AccountIds ];
        set<id> oppIds = new set<id>();
        for(opportunity opp : oppId )
        {
            oppIds.add(opp.Id);
        }
        // List<Task> tsklist = [Select ID, Subject, ActivityDate, MH_Call_Outcome_Category__c, WhatId, What.Name from Task 
        //                       WHERE ActivityDate  = LAST_N_DAYS:60 And WhatId IN : oppIds LIMIT 50];
        // List<Event> evntlist= [Select ID, Subject, ActivityDate, MH_Call_Outcome_Category__c, WhatId, What.Name from Event 
        //                        WHERE ActivityDate  = LAST_N_DAYS:60 And WhatId IN: oppIds LIMIT 50];
        // List<sObject> opplist=new List<sObject>();
        // opplist.addAll(tsklist);
        // opplist.addAll(evntlist);     

       list<opportunity> opplist=  [Select Id, Name,(Select ID, Subject, ActivityDate, MH_Call_Outcome_Category__c from Tasks 
                              WHERE ActivityDate  = LAST_N_DAYS:60), (Select ID, Subject, ActivityDate, MH_Call_Outcome_Category__c from
                               Events WHERE ActivityDate  = LAST_N_DAYS:60) from opportunity where Id IN:oppIds];
        return opplist;
    }
    @AuraEnabled
    public static list<sObject> fetchLeadActivites(string leadid){
        set<id> AccountIds = getAccountIds(leadid);
        List<Lead> childleadIds= [SELECT Id from Lead where HealthCloudGA__RelatedAccount__c=:AccountIds ];
        set<id> leadIds = new set<id>();
        for(Lead le : childleadIds )
        {
            leadIds.add(le.Id);
        }
        // List<Task> tsklist = [Select ID, Subject, WhoId, Who.Name, ActivityDate, MH_Call_Outcome_Category__c from Task 
        //                       WHERE ActivityDate  = LAST_N_DAYS:60 And WhoId IN : leadIds LIMIT 50];
        // List<Event> evntlist= [Select ID, Subject, WhoId,ActivityDate,  Who.Name,MH_Call_Outcome_Category__c from Event 
        //                        WHERE ActivityDate  = LAST_N_DAYS:60 And WhoId IN: leadIds LIMIT 50];
        // List<sObject> leadlist=new List<sObject>();
        // leadlist.addAll(tsklist);
        // leadlist.addAll(evntlist);
         list<lead> leadlist=  [Select Id, Name,(Select ID, Subject, ActivityDate, MH_Call_Outcome_Category__c from Tasks 
                              WHERE ActivityDate  = LAST_N_DAYS:60), (Select ID, Subject, ActivityDate, MH_Call_Outcome_Category__c from
                               Events WHERE ActivityDate  = LAST_N_DAYS:60) from lead where Id IN:leadIds];
        return leadlist;
    }
    @AuraEnabled
    public static list<CampaignMember> fetchCampaignMembers(string leadid){
        set<id> AccountIds = getAccountIds(leadid);
        
        // List<lead> ConvertedLeads =[Select Id, name, ConvertedAccountId, ConvertedContactId, ConvertedOpportunityId from lead where ConvertedAccountId =:AccountIds ];
        set<id> oppIds = new set<id>();
        set<id> leadIds = new set<id>();
        List<opportunity> childoppIds= [SELECT Id from opportunity where AccountId =:AccountIds ];
         for(opportunity op : childoppIds )
        {
            oppIds.add(op.id);
        }
        List<CampaignMember> CampMemsopp= [SELECT Id, Campaign.Name, CampaignId, Campaign.MH_TFN__c, 
                                        Campaign.Status,FirstName, PostalCode, State from CampaignMember where MH_Opportunity__c =:oppIds limit 100 ];
        List<Lead> childleadIds= [SELECT Id from Lead where HealthCloudGA__RelatedAccount__c=:AccountIds ];
        
        for(Lead le : childleadIds )
        {
            leadIds.add(le.Id);
        }  
        List<CampaignMember> CampMemslead= [SELECT Id, Campaign.Name, CampaignId, Campaign.MH_TFN__c, 
                                        Campaign.Status,FirstName, PostalCode, State from CampaignMember where LeadId =:leadIds limit 100 ];                              
        List<sObject> CampMemlist=new List<sObject>();
        CampMemlist.addAll(CampMemsopp);
        CampMemlist.addAll(CampMemslead);
        return CampMemlist;     
    }
    // get accountIds based on leadId
    public static Set<Id> getAccountIds(string leadid){
    List<Lead> AccountId= [SELECT HealthCloudGA__RelatedAccount__c from Lead where id =:leadid AND HealthCloudGA__RelatedAccount__c !=null ];
        set<Id> AccountIds = new set<Id>();
        for(lead le : AccountId )
        {
            AccountIds.add(le.HealthCloudGA__RelatedAccount__c);
        }
            return AccountIds;
     }
    
    
}
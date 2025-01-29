/**
 * @description       : JS file for Book Approval Component
 * @author            : Pradeep Kumar Reddy Dhanireddy
 * @last modified on  : 11-11-2024
 * @last modified by  : Pradeep Kumar Reddy Dhanireddy
 * Modifications Log 
 * Ver   Date         Author                               Modification
 * 1.0   11-11-2024   Pradeep Kumar Reddy Dhanireddy    Initial Version
**/
import { LightningElement, track, wire } from 'lwc';
import getPendingApprovalBooks from '@salesforce/apex/BookInventoryController.getPendingApprovalBooks';
import approveRecord from '@salesforce/apex/BookInventoryController.approveRecord';
import rejectRecord from '@salesforce/apex/BookInventoryController.rejectRecord';
import { NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { publish, MessageContext } from 'lightning/messageService';
import BookMC from '@salesforce/messageChannel/BooksMessageChannel__c';
const columns = [
    { label: 'Book Name', fieldName: 'bookName' },
    { label: 'Comments', fieldName: 'comments' },
    { label: 'Status', fieldName: 'status' },
    { label: 'Submitted By', fieldName: 'submittedBy' },
    {
        type: "button", label: 'Approve', initialWidth: 140, typeAttributes: {
            label: 'Approve',
            name: 'Approve',
            title: 'Approve',
            disabled: false,
            value: 'approve',
            iconPosition: 'left',
            iconName: 'utility:edit',
            variant: 'Brand'
        }
    },
    {
        type: "button", label: 'Reject', initialWidth: 140, typeAttributes: {
            label: 'Reject',
            name: 'Reject',
            title: 'Reject',
            disabled: false,
            value: 'reject',
            iconPosition: 'left',
            iconName: 'utility:delete',
            variant: 'destructive'
        }
    }
];

export default class BookApprovalCmp extends NavigationMixin(LightningElement) {
    @track data;
    @track wireResult;
    @track error;
    columns = columns;
    requestsFound = false;
    showCommentsPopUp = false;
    buttonLabel = '';
    @track recId;
    @track commentsValue = '';
    @track actionName;
    @track headerLabel;
    @wire(MessageContext) messageContext;

    connectedCallback() {
        this.getPendingBooksData();
    }
    getPendingBooksData() {
        getPendingApprovalBooks({})
            .then(result => {
                if (result) {
                    this.data = JSON.parse(result);
                    if (this.data.length > 0) {
                        this.requestsFound = true;
                    } else {
                        this.requestsFound = false;
                    }
                }
            })
            .catch(error => {
                this.showToast('Error!!', error.body.message, 'error', 'dismissable');
            })
    }

    callRowAction(event) {
        this.recId = event.detail.row.bookId;
        this.actionName = event.detail.action.name;
        if (this.actionName === 'Approve') {
            this.buttonLabel = 'Approve';
            this.headerLabel = 'Approve Book'
            this.showCommentsPopUp = true;
        } else if (this.actionName === 'Reject') {
            this.buttonLabel = 'Reject';
            this.headerLabel = 'Reject Book';
            this.showCommentsPopUp = true;
        }
    }

    handleSave(event) {
        if (this.actionName === 'Approve') {
            this.approveBookRecord();
        }
        else if (this.actionName === 'Reject') {
            this.rejectBookRecord();
        }
    }
    handleChange(event) {
        this.commentsValue = event.target.value;
    }

    sendMessageService() {
        publish(this.messageContext, BookMC, { messageValue: 'Sucesss' });
    }

    showToast(title, message, variant, mode) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant,
            mode: mode
        });
        this.dispatchEvent(evt);
    }
    approveBookRecord() {
        approveRecord({ bookId: this.recId, comments: this.commentsValue })
            .then(result => {
                this.showCommentsPopUp = false;
                this.commentsValue = '';
                this.showToast('Success!!', 'Record Approved successfully!!', 'success', 'dismissable');
                this.getPendingBooksData();
                this.sendMessageService();
                return refreshApex(this.wireResult);
            })
            .catch(error => {
                this.showToast('Error!!', error.body.message, 'error', 'dismissable');
            })
    }
    rejectBookRecord() {
        rejectRecord({ bookId: this.recId, comments: this.commentsValue })
            .then(result => {
                this.showCommentsPopUp = false;
                this.commentsValue = '';
                this.getPendingBooksData();
                this.showToast('Success!!', 'Record Rejected successfully!!', 'success', 'dismissable');
                this.sendMessageService();
                return refreshApex(this.wireResult);
            })
            .catch(error => {
                this.showToast('Error!!', error.body.message, 'error', 'dismissable');
            })
    }

    closeModal() {
        this.showCommentsPopUp = false;
    }
}
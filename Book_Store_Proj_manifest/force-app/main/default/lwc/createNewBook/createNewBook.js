/**
 * @description       : JS file for Book create/Edit Component
 * @author            : Pradeep Kumar Reddy Dhanireddy
 * @last modified on  : 11-11-2024
 * @last modified by  : Pradeep Kumar Reddy Dhanireddy
 * Modifications Log 
 * Ver   Date         Author                               Modification
 * 1.0   11-11-2024   Pradeep Kumar Reddy Dhanireddy    Initial Version
**/
import { LightningElement, api, track, wire } from 'lwc';
import { updateRecord, createRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import ID_FIELD from '@salesforce/schema/Book__c.Id';
import BOOK_OBJECT from '@salesforce/schema/Book__c';
import STATUS_FIELD from '@salesforce/schema/Book__c.Status__c';
import submitForApproval from '@salesforce/apex/BookInventoryController.submitForApproval';
import isSalesStaff from "@salesforce/customPermission/Sales_Staff_Custom_Permission";
import isSalesManager from "@salesforce/customPermission/Sales_Manager_Custom_Permission";
import uploadFiles from '@salesforce/apex/BookInventoryController.uploadFiles'
import { publish, MessageContext } from 'lightning/messageService';
import BookMC from '@salesforce/messageChannel/BooksMessageChannel__c';
export default class CreateNewBook extends LightningElement {
    @api recordId;
    @track isSpinner = false;
    @track filesData = [];
    @api action = 'Create';
    @api objectApiName = 'Book__c';

    @wire(MessageContext) messageContext;

    get actionType() {
        return this.action;
    }
    get headerLabel() {
        if (this.action == 'Create') {
            return 'Create Book';
        } else if (this.action == 'Edit') {
            return 'Update Book';
        }
    }

    get saveLabel() {
        if (this.action == 'Create') {
            return 'Create';
        } else if (this.action == 'Edit') {
            return 'Update';
        }
    }
    get cancelLabel() {
        if (this.action == 'Create') {
            return 'Reset';
        } else if (this.action == 'Edit') {
            return 'Cancel';
        }
    }

    handleCancel() {
        if (this.action == 'Create') {
            const lwcInputFields = this.template.querySelectorAll('lightning-input-field');
            if (lwcInputFields) {
                lwcInputFields.forEach(field => {
                    field.reset();
                });
            }
            this.template.querySelector('c-custom-file-upload').resetFilesData();
        }
        else if (this.action == 'Edit') {
            this.dispatchEvent(
                new CustomEvent('parentrefresh', {
                    detail: {
                        progObject: 'true',

                    },
                })
            );
        }
    }

    handleUploaded(event) {
        this.filesData = event.detail.filesData;
    }

    handleSuccess(event) {
        const fields = event.detail.fields;
    }

    handleSubmit(event) {
        event.preventDefault();
        const fields = event.detail.fields;
        this.isSpinner = true;
        if (this.recordId != undefined && this.recordId != null && this.recordId != '') {
            fields[ID_FIELD.fieldApiName] = this.recordId;

            const recordInput = { fields };
            if (this.filesData !=undefined && this.filesData.length > 1) {
                this.showToast('Error', 'Please choose only one file', 'error', 'dismissable');
                this.isSpinner = false;
                return;
            } 
            
            updateRecord(recordInput)
                .then((result) => {                 
                    if (this.filesData.length == 1) {
                        this.uploadFilesData();
                    }
                    else {
                        if (isSalesStaff) {
                            this.submitForApprovalRecord(this.recordId);
                        }
                        this.isSpinner = false;
                        this.callParentMethod();
                    }

                })
                .catch((error) => {
                    this.isSpinner = false;
                    this.showToast('Error!!', error.body.message, 'error', 'dismissable');
                });
        }
        else {

            if (isSalesManager) {
                fields[STATUS_FIELD.fieldApiName] = 'Approved';
            }
            const recordInput = { apiName: BOOK_OBJECT.objectApiName, fields };
            if (this.filesData !=undefined && this.filesData.length > 1) {
                this.showToast('Error', 'Please choose only one file', 'error', 'dismissable');
                this.isSpinner = false;
                return;
            }
            createRecord(recordInput)
                .then((result) => {
                    this.recordId = result.id;
                    const lwcInputFields = this.template.querySelectorAll('lightning-input-field');
                    if (lwcInputFields) {
                        lwcInputFields.forEach(field => {
                            field.reset();
                        });
                    }              
                   
                    if (this.filesData.length == 1) {
                        this.uploadFilesData();
                    } else {
                        if (isSalesStaff) {
                            this.submitForApprovalRecord(this.recordId);
                        }
                        this.isSpinner = false;
                        this.callParentPublishMethod();
                    }

                })
                .catch((error) => {
                    this.showToast('Error', error.body.message, 'error', 'dismissable');
                });
        }
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

    callParentMethod() {
        let successMsg = ''
        if (isSalesStaff) {
            successMsg = 'Book Update Request has been sent Successfully!';
        }
        else if (isSalesManager) {
            successMsg = 'Book Updated Successfully!';
        }
        this.showToast('Success!!', successMsg, 'success', 'dismissable');
        this.isSpinner = false;
        this.showEditModal = false;
        this.dispatchEvent(
            new CustomEvent('parentrefresh', {
                detail: {
                    progObject: 'true',

                },
            })
        );
    }

    callParentPublishMethod() {
        let successMsg = ''
        if (isSalesStaff) {
            successMsg = 'Book Create Request has been sent Successfully!';
        }
        else if (isSalesManager) {
            successMsg = 'Book Created Successfully!';
        }
        this.showToast('Success!!', successMsg, 'success', 'dismissable');
        this.isSpinner = false;
        publish(this.messageContext, BookMC, { messageValue: 'Sucesss' });       
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    }
    uploadFilesData() {
        uploadFiles({
            recordId: this.recordId,
            filedata: JSON.stringify(this.filesData)
        })
            .then(result => {
                this.filesData = [];
                if (isSalesStaff) {
                    this.submitForApprovalRecord(this.recordId);
                }
                if (this.action == 'Edit') {
                    this.callParentMethod();
                } else if (this.action == 'Create') {
                    this.isSpinner = false;
                    this.callParentPublishMethod();
                }

            }).catch(error => {
                if (error && error.body && error.body.message) {
                    this.showToast('Error', error.body.message, 'error', 'dismissable');
                    this.isSpinner = false;
                }
            })

    }
    submitForApprovalRecord(recId) {
        submitForApproval({ bookId: recId })
            .then(result => {
                this.dispatchEvent(
                    new CustomEvent('parentrefresh', {
                        detail: {
                            progObject: result,

                        },
                        bubbles: true,
                        composed: true
                    })
                );
            })
            .catch(error => {
                this.showToast('Error', error.body.message, 'error', 'dismissable');
            })
    }

}
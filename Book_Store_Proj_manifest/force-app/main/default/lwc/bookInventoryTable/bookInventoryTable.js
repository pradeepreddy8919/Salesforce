/**
 * @description       : JS file for Book Inventory Table
 * @author            : Pradeep Kumar Reddy Dhanireddy
 * @last modified on  : 11-11-2024
 * @last modified by  : Pradeep Kumar Reddy Dhanireddy
 * Modifications Log 
 * Ver   Date         Author                               Modification
 * 1.0   11-11-2024   Pradeep Kumar Reddy Dhanireddy    Initial Version
**/
import { LightningElement, track, api, wire } from 'lwc';
import getBooks from '@salesforce/apex/BookInventoryController.getBooks';
import { APPLICATION_SCOPE, subscribe, MessageContext, unsubscribe } from 'lightning/messageService';
import BOOKMC from '@salesforce/messageChannel/BooksMessageChannel__c';

export default class BookInventoryTable extends LightningElement {

    subscription = null;
    @api subscribeMessage = '';
    error = ''
    booksFound = false
    @track booksData = [];
    
    @wire(MessageContext)
    messageContext;

    getBooksData() {
        getBooks({})
            .then(result => {
                this.booksData = JSON.parse(result);
                if (this.booksData.length > 0) {
                    this.booksFound = true;
                } else {
                    this.booksFound = false;
                }
            })
            .catch(error => {
                this.showToast('Error!!', error.body.message, 'error', 'dismissable');
            })
    }

    refreshTable() {
        this.getBooksData();
    }

    // Encapsulate logic for Lightning message service subscribe and unsubsubscribe
    subscribeMC() {
        if (!this.subscription) {
            this.subscription = subscribe(
                this.messageContext,
                BOOKMC,
                (message) => {
                    this.subscribeMessage = message.messageValue
                    if (this.subscribeMessage == 'Sucesss') {
                        this.refreshTable();
                    }
                },
                { scope: APPLICATION_SCOPE }
            );
        }
    }

    unsubscribeToMessageChannel() {
        unsubscribe(this.subscription);
        this.subscription = null;
    }
    // Runs when component is connected, subscribes to BOOKMC
    connectedCallback() {
        this.getBooksData();
        // should not update when this component is on a record page.
        if (this.subscription) {
            return;
        }
        this.subscribeMC();
    }
    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }
}
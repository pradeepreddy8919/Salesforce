/**
 * @description       : JS file for Book Header Dashboard
 * @author            : Pradeep Kumar Reddy Dhanireddy
 * @last modified on  : 11-11-2024
 * @last modified by  : Pradeep Kumar Reddy Dhanireddy
 * Modifications Log 
 * Ver   Date         Author                               Modification
 * 1.0   11-11-2024   Pradeep Kumar Reddy Dhanireddy    Initial Version
**/
import { track, LightningElement, wire } from 'lwc';
import getDashboardMetrics from '@salesforce/apex/BookInventoryController.getDashboardMetrics';
import { APPLICATION_SCOPE, subscribe, MessageContext, unsubscribe } from 'lightning/messageService';
import BOOKMC from '@salesforce/messageChannel/BooksMessageChannel__c';
import { refreshApex } from '@salesforce/apex';
export default class BooksHeaderDashboard extends LightningElement {

    @track totalBooks;
    @track availableStock;
    @track salesPerformance;

    @wire(MessageContext)
    messageContext;

    @wire(getDashboardMetrics)
    dashboardData({ error, data }) {
        if (data) {
            this.totalBooks = data.totalBooks;
            this.availableStock = data.availableStock;
            this.salesPerformance = data.salesPerformance;
        } else if (error) {
            this.showToast('Error!!', error.body.message, 'error', 'dismissable');
        }
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
        // should not update when this component is on a record page.
        if (this.subscription) {
            return;
        }
        this.subscribeMC();
    }
    disconnectedCallback() {
        this.unsubscribeToMessageChannel();
    }

    refreshTable() {
        refreshApex(this.dashboardData);
    }

}
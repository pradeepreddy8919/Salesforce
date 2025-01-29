/**
 * @description       : JS file for Book Title Component
 * @author            : Pradeep Kumar Reddy Dhanireddy
 * @last modified on  : 11-11-2024
 * @last modified by  : Pradeep Kumar Reddy Dhanireddy
 * Modifications Log 
 * Ver   Date         Author                               Modification
 * 1.0   11-11-2024   Pradeep Kumar Reddy Dhanireddy    Initial Version
**/
import { LightningElement, api, track } from 'lwc';
export default class BooktileCmp extends LightningElement {
  @api book;
  @track showEditModal = false;
  
  handleEditClick() {
    console.log('this.book');
    this.showEditModal = true;
  }
  callParent(event) {
    this.showEditModal = false;
    this.dispatchEvent(
      new CustomEvent('parentrefresh', {
        detail: {
          progObject: 'true',

        },
      })
    );
  }

}
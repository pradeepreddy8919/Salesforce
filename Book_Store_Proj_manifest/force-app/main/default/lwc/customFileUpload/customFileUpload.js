/**
 * @description       : JS file for custom file upload component
 * @author            : Pradeep Kumar Reddy Dhanireddy
 * @last modified on  : 11-11-2024
 * @last modified by  : Pradeep Kumar Reddy Dhanireddy
 * Modifications Log 
 * Ver   Date         Author                               Modification
 * 1.0   11-11-2024   Pradeep Kumar Reddy Dhanireddy    Initial Version
**/
import { LightningElement, api, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
const MAX_FILE_SIZE = 2097152;

export default class CustomFileUpload extends LightningElement {

    @api recordId;
    @track filesData = [];
    showSpinner = false;

    @api resetFilesData() {
        this.filesData = [];
    }
    handleFileUploaded(event) {
        if (event.target.files.length > 0) {
            for (var i = 0; i < event.target.files.length; i++) {
                if (event.target.files[i].size > MAX_FILE_SIZE) {
                    this.showToast('Error!', 'error', 'File size exceeded the upload size limit.');
                    return;
                }
                let file = event.target.files[i];
                let reader = new FileReader();
                reader.onload = e => {
                    var fileContents = reader.result.split(',')[1]
                    this.filesData.push({ 'fileName': file.name, 'fileContent': fileContents });
                };
                reader.readAsDataURL(file);
            }
        }
        this.dispatchEvent(
            new CustomEvent('uploaded', {
                detail: {
                    filesData: this.filesData,

                },
                bubbles: true,
                composed: true
            })
        );
    }



    removeReceiptImage(event) {
        var index = event.currentTarget.dataset.id;
        this.filesData.splice(index, 1);
    }

    showToast(title, variant, message) {
        this.dispatchEvent(
            new ShowToastEvent({
                title: title,
                variant: variant,
                message: message,
            })
        );
    }
}
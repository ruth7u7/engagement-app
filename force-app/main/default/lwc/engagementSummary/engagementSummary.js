import { LightningElement, api, wire, track } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getEngagementData from '@salesforce/apex/EngagementSummaryController.getEngagementData';
import createFollowUpCall from '@salesforce/apex/EngagementSummaryController.createFollowUpCall';

export default class EngagementSummary extends LightningElement {
    @api recordId;
    @track isLoading = true;
    @track isCreating = false;
    @track successMessage = '';
    engagementName = '';
    opportunityAmount = null;
    completedTaskCount = 0;
    upcomingEventCount = 0;
    _wiredResult;

    @wire(getEngagementData, { engagementId: '$recordId' })
    wiredData(result) {
        this._wiredResult = result;
        if (result.data) {
            this.engagementName = result.data.engagementName;
            this.opportunityAmount = result.data.opportunityAmount;
            this.completedTaskCount = result.data.completedTaskCount;
            this.upcomingEventCount = result.data.upcomingEventCount;
            this.isLoading = false;
        } else if (result.error) {
            this.isLoading = false;
        }
    }

    get opportunityAmountFormatted() {
        if (this.opportunityAmount == null) return '';
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(this.opportunityAmount);
    }

    async handleFollowUpCall() {
        this.isCreating = true;
        this.successMessage = '';
        try {
            await createFollowUpCall({ engagementId: this.recordId, engagementName: this.engagementName });
            this.successMessage = 'Follow-up call task created for tomorrow!';
            this.dispatchEvent(new ShowToastEvent({ title: 'Success', message: 'Follow-up call scheduled for tomorrow.', variant: 'success' }));
            await refreshApex(this._wiredResult);
        } catch (error) {
            this.dispatchEvent(new ShowToastEvent({ title: 'Error', message: error.body.message, variant: 'error' }));
        } finally {
            this.isCreating = false;
        }
    }
}
public with sharing class EngagementSummaryController {

    @AuraEnabled(cacheable=true)
    public static Map<String, Object> getEngagementData(Id engagementId) {
        Map<String, Object> result = new Map<String, Object>();

        Engagement__c eng = [
            SELECT Id, Name, Oportunidad__c,
                   Oportunidad__r.Amount
            FROM Engagement__c
            WHERE Id = :engagementId
            LIMIT 1
        ];

        result.put('engagementName', eng.Name);
        result.put('opportunityAmount',
            eng.Oportunidad__c != null
                ? eng.Oportunidad__r.Amount
                : null
        );

        Integer completedTasks = [
            SELECT COUNT()
            FROM Task
            WHERE WhatId = :engagementId
              AND Status = 'Completed'
        ];
        result.put('completedTaskCount', completedTasks);

        Integer upcomingEvents = [
            SELECT COUNT()
            FROM Event
            WHERE WhatId = :engagementId
              AND StartDateTime >= :System.now()
        ];
        result.put('upcomingEventCount', upcomingEvents);

        return result;
    }

    @AuraEnabled
    public static void createFollowUpCall(Id engagementId, String engagementName) {
        Task t = new Task();
        t.WhatId      = engagementId;
        t.Subject     = 'Follow-up on ' + engagementName;
        t.Type        = 'Call';
        t.Status      = 'Not Started';
        t.Priority    = 'Normal';
        t.ActivityDate = Date.today().addDays(1);
        insert t;
    }
}
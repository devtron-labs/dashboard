export const ENV_TRIGGER_VIEW_GA_EVENTS = {
    MaterialClicked: {
        category: 'Environment Details Trigger View',
        action: 'Select Material Clicked',
    },
    ImageClicked: {
        category: 'Environment Details Trigger View',
        action: 'Select Image Clicked',
    },
    RollbackClicked: {
        category: 'Environment Details Trigger View',
        action: 'Select Rollback Material Clicked',
    },
    CITriggered: {
        category: 'Environment Details Trigger View',
        action: 'CI Triggered',
    },
    CDTriggered: (nodeType: string) => ({
        category: 'Environment Details Trigger View',
        action: `${nodeType} Triggered`,
    }),
    BulkCITriggered: {
        category: 'Environment Details Trigger View',
        action: 'Bulk CI Triggered',
    },
    BulkCDTriggered: (nodeType: string) => ({
        category: 'Environment Details Trigger View',
        action: `Bulk ${nodeType} Triggered`,
    }),
}
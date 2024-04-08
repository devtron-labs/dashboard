export enum BulkSelectionModalTypes {
    /**
     * Modal for confirming the bulk delete operation
     */
    deleteConfirmation = 'deleteConfirmation',
    /**
     * Confirmation modal for applying the all across pages
     */
    selectAllAcrossPages = 'selectAllAcrossPages',
    /**
     * Confirmation modal for a action that clears the applied all across pages state
     */
    clearAllAcrossPages = 'clearAllAcrossPages',
}

export enum BulkSelectionEntityTypes {
    /**
     * For user permissions
     */
    users = 'users',
    /**
     * For permission groups
     */
    permissionGroups = 'permissionGroups',
}

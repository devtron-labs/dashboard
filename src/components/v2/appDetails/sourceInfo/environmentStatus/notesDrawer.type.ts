export interface NotesDrawerType {
    notes: string
    close: () => void
}

export interface CurrentSyncStatusType {
    status: string
    loadingResourceTree: boolean
}

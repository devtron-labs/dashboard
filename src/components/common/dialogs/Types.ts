export interface DeleteDialogProps {
    title: string
    description?: string
    closeDelete: () => void
    delete: () => any
    deletePrefix?: string
    deletePostfix?: string
    apiCallInProgress?: boolean
}

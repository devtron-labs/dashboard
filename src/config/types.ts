import { ReactNode } from 'react'

export type DeleteComponentModalProps = {
    // Required Props
    title: string
    component?: string
    showConfirmationModal: boolean
    closeConfirmationModal: () => void
    onDelete: () => void
    reload: () => void

    // Optional Customization
    description?: ReactNode
    renderCannotDeleteConfirmationSubTitle?: ReactNode
    errorCodeToShowCannotDeleteDialog?: number

    // Additional Configuration
    shouldStopPropagation?: boolean
    disabled?: boolean
    url?: string
    dataTestId?: string
    children?: ReactNode
}

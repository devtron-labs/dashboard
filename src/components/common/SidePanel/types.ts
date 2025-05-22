import { Dispatch, SetStateAction } from 'react'

export interface SidePanelProps {
    asideWidth: number
    setAsideWidth: Dispatch<SetStateAction<number>>
}

export interface SidePanelDocumentationProps {
    onClose: () => void
}

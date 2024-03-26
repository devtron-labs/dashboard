import { SyntheticEvent } from 'react'

export interface CommitChipCellProps {
    handleClick: (e: SyntheticEvent) => void
    commits?: string[]
}

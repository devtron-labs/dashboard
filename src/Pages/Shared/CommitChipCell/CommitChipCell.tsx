import React from 'react'
import { ReactComponent as CommitIcon } from '../../../assets/icons/ic-code-commit.svg'
import { CommitChipCellProps } from './types'

const CommitChipCell = ({ handleClick, commits }: CommitChipCellProps) => {
    return (
        commits?.length > 0 && (
            <span className="flexbox">
                <span
                    className="flexbox dc__gap-4 fs-14 lh-20 cb-5 dc__ellipsis-right mono cursor"
                    onClick={handleClick}
                >
                    <span className="flex dc__gap-4 br-4 pl-6 pr-6 bcb-1">
                        <CommitIcon className="icon-dim-14 dc__no-shrink fcb-5" />
                        <span>{commits[0].substring(0, 7)}</span>
                    </span>
                    {commits.length > 1 && <span className="flex br-4 pl-6 pr-6 bcb-1">…</span>}
                </span>
            </span>
        )
    )
}

export default CommitChipCell

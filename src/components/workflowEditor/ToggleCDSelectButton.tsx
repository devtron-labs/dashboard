import React from 'react'
import Tippy from '@tippyjs/react'
import { ToggleCDSelectButtonProps } from './types'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

export default function ToggleCDSelectButton({
    addNewPipelineBlocked,
    onClickAddNode,
    testId,
}: ToggleCDSelectButtonProps) {
    return (
        <Tippy
            className="default-tt"
            arrow={false}
            placement="top"
            content={
                <span style={{ display: 'block', width: '145px' }}>
                    {addNewPipelineBlocked
                        ? 'Cannot add new workflow or deployment pipelines when environment filter is applied.'
                        : 'Add deployment pipeline'}
                </span>
            }
        >
            <button
                className="flex h-100 pl-6 pr-6 pt-0 pb-0 dc__outline-none-imp bcn-0 dc__no-border dc__hover-b500 pt-4 pb-4 pl-6 pr-6 dc__border-left-n1--important workflow-node__title--top-right-rad-8 workflow-node__title--bottom-right-rad-8 workflow-node__title--add-cd-icon"
                data-testid={testId}
                type="button"
                onClick={onClickAddNode}
            >
                <Add className={`icon-dim-12 fcn-6 ${addNewPipelineBlocked ? 'dc__disabled' : ''}`} />
            </button>
        </Tippy>
    )
}

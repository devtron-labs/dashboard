/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

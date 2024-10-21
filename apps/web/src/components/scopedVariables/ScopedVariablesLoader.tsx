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
import { LoadScopedVariablesProps } from './types'
import { ReactComponent as Close } from '../../assets/icons/ic-close.svg'
import { ReactComponent as ICError } from '../../assets/icons/ic-error-exclamation.svg'
import { StyledProgressBar } from '../common/formFields/Widgets/Widgets'
import { FileReaderStatus } from '../common/hooks/types'
import { UPLOAD_FAILED_FALLBACK_MESSAGE, UPLOAD_FAILED_STANDARD_MESSAGE } from './constants'

export default function ScopedVariablesLoader({ status, progress, fileData, abortRead }: LoadScopedVariablesProps) {
    return (
        <div className="cursor-default w-200 flex column dc__align-start dc__content-start dc__gap-8">
            <div className="flex dc__align-start dc__gap-8 dc__align-self-stretch dc__content-start">
                <p className="dc__ellipsis-right dc__no-shrink flex-grow-1 m-0 cn-6 fs-13 fw-4 lh-20 dc__align-left">
                    {fileData?.name}
                </p>

                <button
                    type="button"
                    className="dc__no-background p-0 dc__no-border cursor dc__outline-none-imp h-20"
                    onClick={abortRead}
                >
                    <Close className="icon-dim-20" />
                </button>
            </div>

            <StyledProgressBar
                styles={{
                    height: '4px',
                    width: '100%',
                    borderRadius: '2px',
                }}
                classes={`${status?.status !== FileReaderStatus.FAILED ? '' : 'styled-progress-bar-error'}`}
                progress={progress}
            />

            {status?.status === FileReaderStatus.FAILED && (
                <div className="flex dc__align-start dc__align-self-stretch dc__gap-4 dc__content-start">
                    <ICError className="icon-dim-20" />
                    <p className="cr-5 fs-13 fw-4 lh-20 dc__align-left">
                        {status?.message?.description ? UPLOAD_FAILED_STANDARD_MESSAGE : UPLOAD_FAILED_FALLBACK_MESSAGE}
                    </p>
                </div>
            )}
        </div>
    )
}

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

import { Tooltip } from '@devtron-labs/devtron-fe-common-lib'

import { InteractiveCellTextProps } from './types'

export const InteractiveCellText = ({ text, onClickHandler, dataTestId }: InteractiveCellTextProps) => (
    <Tooltip content={text} placement="top" showOnTruncate={!!text} className="mxh-210 dc__overflow-auto">
        {typeof onClickHandler === 'function' ? (
            <button
                type="button"
                onClick={onClickHandler}
                className="flex left dc__unset-button-styles lh-20 dc__ellipsis-right fs-13 cb-5 dc__no-decor cursor"
                data-testid={dataTestId}
            >
                {text || '-'}
            </button>
        ) : (
            <p className="lh-20 dc__ellipsis-right m-0 fs-13" data-testid={dataTestId}>
                {text || '-'}
            </p>
        )}
    </Tooltip>
)

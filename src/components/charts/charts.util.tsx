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

import { Icon } from '@devtron-labs/devtron-fe-common-lib'

export const PaginationParams = {
    pageOffset: 0,
    pageSize: 20,
}

export const renderAdditionalErrorInfo = (
    handleNameChange: (index: number, suggestedName: string) => void,
    suggestedName: string,
    index: number,
): JSX.Element => {
    return (
        suggestedName && (
            <>
                . Suggested Name:
                <span className="anchor pointer" onClick={(e) => handleNameChange(index, suggestedName)}>
                    {suggestedName}
                </span>
            </>
        )
    )
}

export const renderDeprecatedWarning = () => {
    return (
        <div className="flex left dc__gap-4">
            <span className="font-ibm-plex-mono cy-7 fs-12 lh-18">DEPRECATED</span>
            <Icon name="ic-warning" color={null} size={16} />
        </div>
    )
}

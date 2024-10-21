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
import { CustomInput } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as DeleteCross } from '../../assets/icons/ic-cross.svg'
import { CreateHeaderDetailsType } from './types'

export default function CreateHeaderDetails({
    index,
    headerData,
    setHeaderData,
    removeHeader,
}: CreateHeaderDetailsType) {
    const deleteHeader = (e): void => {
        e.stopPropagation()
        removeHeader(index)
    }

    const handleInputChange = (e): void => {
        const _headerData = { ...headerData }
        _headerData[e.target.name] = e.target.value
        setHeaderData(index, _headerData)
    }

    return (
        <div className="flexbox mb-8">
            <CustomInput
                rootClassName="tag-input pt-4-imp pb-4-imp fs-13 dc__no-right-radius"
                value={headerData?.['key']}
                name="key"
                onChange={handleInputChange}
                placeholder="Enter key"
                data-testid={`header-key-${index}`}
            />
            <CustomInput
                rootClassName="tag-input pt-4-imp pb-4-imp fs-13 dc__no-border-radius dc__no-right-border dc__no-left-border"
                value={headerData?.['value']}
                name="value"
                onChange={handleInputChange}
                placeholder="Enter value"
                data-testid={`header-value-${index}`}
            />

            <div
                className="dc__border pl-4 pr-4 dc__right-radius-4 pointer flex top"
                onClick={deleteHeader}
                data-testid={`delete-header-${index}`}
            >
                <DeleteCross className="icon-dim-20 mt-4" />
            </div>
        </div>
    )
}

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

import { ComponentSizeType, CustomInput, Icon, SelectPicker } from '@devtron-labs/devtron-fe-common-lib'

import { SourceMaterialsSelectorProps } from './types'

export const SourceMaterialsSelector = ({
    repoName,
    sourceTypePickerProps,
    branchInputProps,
}: SourceMaterialsSelectorProps) => (
    <div className="flexbox-col dc__gap-8">
        {repoName && (
            <div className="flex left dc__gap-8">
                <Icon name="ic-git" color={null} size={24} />
                <p className="m-0 fs-13 lh-20 fw-6 cn-9 dc__truncate">{repoName}</p>
            </div>
        )}
        <div className="dc__grid-cols-2 dc__gap-12">
            <SelectPicker<string | number, false>
                {...sourceTypePickerProps}
                required
                isClearable={false}
                closeMenuOnSelect
                size={ComponentSizeType.large}
            />
            {!branchInputProps.hideInput && <CustomInput {...branchInputProps} type="text" required />}
        </div>
    </div>
)

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

import { FormEvent, FunctionComponent } from 'react'
import { BuildInfraMetaConfigTypes, BuildInfraInputFieldComponentProps } from './types'
import { CustomInput } from '../../../Common'
import { BUILD_INFRA_TEXT } from './constants'

const BuildInfraProfileNameField: FunctionComponent<BuildInfraInputFieldComponentProps> = ({
    handleProfileInputChange,
    currentValue,
    error,
}) => {
    const handleChange = (e: FormEvent<HTMLInputElement>) => {
        handleProfileInputChange({ action: BuildInfraMetaConfigTypes.NAME, data: { value: e.currentTarget.value } })
    }

    return (
        <div className="flexbox-col dc__gap-4 w-100 dc__align-start">
            <CustomInput
                name="profile-name"
                label={BUILD_INFRA_TEXT.PROFILE_LABEL}
                labelClassName="m-0 dc__required-field fs-13 fw-4 lh-20 cn-7"
                placeholder={BUILD_INFRA_TEXT.PROFILE_PLACEHOLDER}
                value={currentValue}
                onChange={handleChange}
                error={error}
                required
                inputWrapClassName="w-100"
            />
        </div>
    )
}

export default BuildInfraProfileNameField

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
import { ReactComponent as ErrorIcon } from '../../../Assets/Icon/ic-warning.svg'
import { BuildInfraInputFieldComponentProps, BuildInfraMetaConfigTypes } from './types'
import { BUILD_INFRA_TEXT } from './constants'

const BuildInfraProfileDescriptionField: FunctionComponent<BuildInfraInputFieldComponentProps> = ({
    handleProfileInputChange,
    currentValue,
    error,
}) => {
    const handleChange = (e: FormEvent<HTMLTextAreaElement>) => {
        handleProfileInputChange({
            action: BuildInfraMetaConfigTypes.DESCRIPTION,
            data: { value: e.currentTarget.value },
        })
    }

    return (
        <div className="flexbox-col dc__gap-4 w-100 dc__align-start">
            <label htmlFor="build-infra-profile-description" className="m-0 fs-13 fw-4 lh-20 cn-7">
                {BUILD_INFRA_TEXT.DESCRIPTION_LABEL}
            </label>

            <textarea
                data-testid="build-infra-profile-description"
                name="profile-description"
                className="form__textarea mxh-140 dc__hover-border-n300"
                id="build-infra-profile-description"
                placeholder={BUILD_INFRA_TEXT.DESCRIPTION_PLACEHOLDER}
                value={currentValue}
                onChange={handleChange}
            />

            {error && (
                <div className="form__error">
                    <ErrorIcon className="form__icon form__icon--error" />
                    {error}
                </div>
            )}
        </div>
    )
}

export default BuildInfraProfileDescriptionField

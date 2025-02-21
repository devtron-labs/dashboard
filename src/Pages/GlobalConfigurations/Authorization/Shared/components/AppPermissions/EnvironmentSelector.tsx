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

import { ACCESS_TYPE_MAP, SelectPicker, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { useMemo } from 'react'
import { ALL_ENVIRONMENTS_OPTION, DirectPermissionFieldName } from './constants'
import { DirectPermissionRowProps } from './types'
import { getDisplayTextByName, getEnvironmentDisplayText } from './utils'

const EnvironmentSelector = ({
    permission,
    handleDirectPermissionChange,
    environmentClusterOptions,
    getEnvironmentOptions,
}: Pick<
    DirectPermissionRowProps,
    'permission' | 'handleDirectPermissionChange' | 'environmentClusterOptions' | 'getEnvironmentOptions'
>) => {
    const isAccessTypeHelm = permission.accessType === ACCESS_TYPE_MAP.HELM_APPS

    const options = useMemo(() => {
        if (isAccessTypeHelm) {
            return environmentClusterOptions.map((groupOption) => ({
                label: groupOption.label,
                options: groupOption.options.map((option) => ({
                    label: option.label,
                    value: option.value,
                    description:
                        option.clusterName +
                        (option.clusterName && option.namespace ? '/' : '') +
                        (option.namespace || ''),
                    clusterName: option.clusterName,
                })),
            }))
        }

        const environments = getEnvironmentOptions(permission.entity, permission.accessType)
        return [ALL_ENVIRONMENTS_OPTION, ...environments]
    }, [isAccessTypeHelm, environmentClusterOptions])

    return (
        <SelectPicker
            inputId="dropdown-for-environment"
            value={permission.environment}
            isMulti
            name={DirectPermissionFieldName.environment}
            placeholder="Select environments"
            isDisabled={!permission.team}
            onChange={handleDirectPermissionChange}
            error={permission.environmentError}
            size={ComponentSizeType.large}
            options={options}
            multiSelectProps={{
                customDisplayText: isAccessTypeHelm
                    ? getEnvironmentDisplayText(options, permission.environment)
                    : getDisplayTextByName(DirectPermissionFieldName.environment, options, permission.environment),
            }}
            disableDescriptionEllipsis
        />
    )
}

export default EnvironmentSelector

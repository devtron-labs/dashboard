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

import {
    ComponentSizeType,
    SelectPicker,
    SelectPickerOptionType,
    UserRoleConfig,
} from '@devtron-labs/devtron-fe-common-lib'
import { useAuthorizationContext } from '../../../AuthorizationProvider'
import { RoleSelectorProps } from './types'

const JobRoleSelector = ({ permission, handleUpdateDirectPermissionRoleConfig }: RoleSelectorProps) => {
    const { customRoles } = useAuthorizationContext()
    const { possibleJobRoles } = customRoles
    const { roleConfig, team } = permission

    const selectedValue = possibleJobRoles.find((option) => option.value === roleConfig.baseRole)

    const handleChangeJobRole = (selectedOption: SelectPickerOptionType<string>) => {
        const updatedConfig: UserRoleConfig = {
            ...roleConfig,
            baseRole: selectedOption.value,
        }
        handleUpdateDirectPermissionRoleConfig(updatedConfig)
    }

    return (
        <SelectPicker
            inputId="jobs-role-selector"
            options={possibleJobRoles}
            size={ComponentSizeType.large}
            isDisabled={!team}
            onChange={handleChangeJobRole}
            value={selectedValue}
        />
    )
}

export default JobRoleSelector

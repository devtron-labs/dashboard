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

import { SelectPicker, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { SELECT_ALL_VALUE } from '../../../../../../config'
import { DirectPermissionFieldName } from './constants'
import { DirectPermissionRowProps, WorkflowListType } from './types'
import { getDisplayTextByName } from './utils'

const WorkflowSelector = ({
    permission,
    handleDirectPermissionChange,
    workflowList,
}: Pick<DirectPermissionRowProps, 'permission' | 'handleDirectPermissionChange'> & {
    workflowList: WorkflowListType
}) => {
    const options = [{ label: 'All Workflows', value: SELECT_ALL_VALUE }, ...workflowList.options]

    return (
        <SelectPicker
            inputId="dropdown-for-workflow-for-job"
            value={permission.workflow}
            isMulti
            closeMenuOnSelect={false}
            name={DirectPermissionFieldName.workflow}
            placeholder="Select workflow"
            options={options}
            isLoading={workflowList.loading}
            isDisabled={!permission.team || workflowList.loading}
            onChange={(value, actionMeta) => {
                handleDirectPermissionChange(value, actionMeta, workflowList)
            }}
            error={permission.workflowError}
            multiSelectProps={{
                customDisplayText: getDisplayTextByName(
                    DirectPermissionFieldName.workflow,
                    options,
                    permission.workflow,
                ),
            }}
            size={ComponentSizeType.large}
        />
    )
}

export default WorkflowSelector

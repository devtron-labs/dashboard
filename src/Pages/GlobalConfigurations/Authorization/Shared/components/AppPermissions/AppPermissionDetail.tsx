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

/* eslint-disable jsx-a11y/label-has-associated-control */
import { ACCESS_TYPE_MAP, Button, ButtonVariantType, ComponentSizeType } from '@devtron-labs/devtron-fe-common-lib'
import { ReactComponent as AddIcon } from '../../../../../../assets/icons/ic-add.svg'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import DirectPermission from './DirectPermission'
import { getPermissionDetailRowClass } from './utils'
import { AppPermissionsDetailType } from './types'
import { importComponentFromFELibrary } from '../../../../../../components/common'

const StatusHeaderCell = importComponentFromFELibrary('StatusHeaderCell', null, 'function')

const AppPermissionDetail = ({
    accessType,
    handleDirectPermissionChange,
    removeDirectPermissionRow,
    addNewPermissionRow,
    ...props
}: AppPermissionsDetailType) => {
    const { directPermission, showStatus } = usePermissionConfiguration()
    const isAccessTypeJob = accessType === ACCESS_TYPE_MAP.JOBS
    const rowClass = getPermissionDetailRowClass(accessType, showStatus)

    const handleAddPermission = () => {
        addNewPermissionRow(accessType)
    }

    return (
        <>
            <div className={`w-100 pt-6 pb-6 dc__gap-8 display-grid ${rowClass} fw-6 fs-12 cn-7 dc__uppercase`}>
                <label className="mb-0">Project</label>
                <label className="mb-0" style={{ order: isAccessTypeJob ? 3 : 0 }}>
                    Environment{accessType === ACCESS_TYPE_MAP.HELM_APPS ? ' or cluster/namespace' : ''}
                </label>
                <label className="mb-0" style={{ order: isAccessTypeJob ? 1 : 0 }}>
                    {isAccessTypeJob ? 'Job Name' : 'Application'}
                </label>
                {isAccessTypeJob && (
                    <label className="mb-0" style={{ order: isAccessTypeJob ? 2 : 0 }}>
                        Workflow
                    </label>
                )}
                <label className="mb-0" style={{ order: isAccessTypeJob ? 4 : 0 }}>
                    {accessType === ACCESS_TYPE_MAP.HELM_APPS ? 'Permission' : 'Role'}
                </label>
                {showStatus && (
                    <div style={{ order: 5 }}>
                        <StatusHeaderCell />
                    </div>
                )}
                <span style={{ order: showStatus ? 6 : 5 }} />
            </div>

            <div className="flexbox-col dc__gap-12">
                {directPermission.map(
                    (permission, idx) =>
                        permission.accessType === accessType && (
                            <div
                                className={`w-100 dc__gap-8 display-grid ${rowClass}`}
                                // eslint-disable-next-line react/no-array-index-key
                                key={idx}
                            >
                                <DirectPermission
                                    index={idx}
                                    permission={permission}
                                    removeRow={removeDirectPermissionRow}
                                    handleDirectPermissionChange={(value, actionMeta, workflowList?) =>
                                        handleDirectPermissionChange(idx, value, actionMeta, workflowList)
                                    }
                                    {...props}
                                />
                            </div>
                        ),
                )}
                <Button
                    text="Add Permission"
                    startIcon={<AddIcon />}
                    onClick={handleAddPermission}
                    dataTestId="add-new-permission"
                    variant={ButtonVariantType.text}
                    size={ComponentSizeType.medium}
                />
            </div>
        </>
    )
}

export default AppPermissionDetail

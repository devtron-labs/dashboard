/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-nested-ternary */
import React from 'react'
import { ReactComponent as AddIcon } from '../../../../../../assets/icons/ic-add.svg'
import { ACCESS_TYPE_MAP } from '../../../../../../config'
import { AppPermissionsDetailType } from '../userGroups/userGroups.types'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import DirectPermission from './DirectPermission'
import { PERMISSION_LABEL_CLASS } from './constants'

const AppPermissionDetail = ({
    accessType,
    handleDirectPermissionChange,
    removeDirectPermissionRow,
    AddNewPermissionRow,
    appsListHelmApps,
    appsList,
    jobsList,
    projectsList,
    environmentsList,
    envClustersList,
}: AppPermissionsDetailType) => {
    const { directPermission } = usePermissionConfiguration()
    return (
        <>
            {/* TODO (v3): Use array based map */}
            <div
                className="w-100 pt-6 pb-6 display-grid"
                style={{
                    gridTemplateColumns:
                        accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                            ? '1fr 1fr 1fr 1fr 24px'
                            : accessType === ACCESS_TYPE_MAP.HELM_APPS
                              ? '1fr 2fr 1fr 1fr 24px'
                              : '1fr 1fr 1fr 1fr 1fr 24px',
                }}
            >
                <label className={PERMISSION_LABEL_CLASS}>Project</label>
                <label
                    className={PERMISSION_LABEL_CLASS}
                    style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 3 : 0 }}
                >
                    Environment{accessType === ACCESS_TYPE_MAP.HELM_APPS ? 'or cluster/namespace' : ''}
                </label>
                <label
                    className={PERMISSION_LABEL_CLASS}
                    style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 1 : 0 }}
                >
                    {accessType === ACCESS_TYPE_MAP.JOBS ? 'Job Name' : 'Application'}
                </label>
                {accessType === ACCESS_TYPE_MAP.JOBS && (
                    <label
                        className={PERMISSION_LABEL_CLASS}
                        style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 2 : 0 }}
                    >
                        Workflow
                    </label>
                )}
                <label
                    className={PERMISSION_LABEL_CLASS}
                    style={{ order: accessType === ACCESS_TYPE_MAP.JOBS ? 4 : 0 }}
                >
                    {accessType === ACCESS_TYPE_MAP.HELM_APPS ? 'Permission' : 'Role'}
                </label>
                <span style={{ order: 5 }} />
            </div>

            <div className="flexbox-col dc__gap-12">
                {directPermission.map(
                    (permission, idx) =>
                        permission.accessType === accessType && (
                            <div
                                className="w-100 dc__gap-14 display-grid"
                                style={{
                                    // TODO (v3): Move to CSS
                                    gridTemplateColumns:
                                        accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                                            ? '1fr 1fr 1fr 1fr 24px'
                                            : accessType === ACCESS_TYPE_MAP.HELM_APPS
                                              ? '1fr 2fr 1fr 1fr 24px'
                                              : '1fr 1fr 1fr 1fr 1fr 24px',
                                }}
                            >
                                <DirectPermission
                                    index={idx}
                                    // eslint-disable-next-line react/no-array-index-key
                                    key={idx}
                                    permission={permission}
                                    removeRow={removeDirectPermissionRow}
                                    handleDirectPermissionChange={(value, actionMeta, workflowList?) =>
                                        handleDirectPermissionChange(idx, value, actionMeta, workflowList)
                                    }
                                    appsListHelmApps={appsListHelmApps}
                                    jobsList={jobsList}
                                    appsList={appsList}
                                    projectsList={projectsList}
                                    environmentsList={environmentsList}
                                    envClustersList={envClustersList}
                                />
                            </div>
                        ),
                )}
                <div>
                    <button
                        type="button"
                        className="anchor flex left dc__gap-4 fs-13 lh-20 fw-6 p-0"
                        onClick={() => AddNewPermissionRow(accessType)}
                    >
                        <AddIcon className="icon-dim-20 fcb-5" />
                        Add Permission
                    </button>
                </div>
            </div>
        </>
    )
}

export default AppPermissionDetail

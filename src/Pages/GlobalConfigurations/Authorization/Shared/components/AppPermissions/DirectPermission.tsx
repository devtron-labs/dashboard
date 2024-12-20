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

/* eslint-disable react/prop-types */
/* eslint-disable react/destructuring-assignment */
import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
    showError,
    Option,
    getIsRequestAborted,
    LoadingIndicator,
    ReactSelectInputAction,
    ACCESS_TYPE_MAP,
    EntityTypes,
    SelectPicker,
    ComponentSizeType,
    SelectPickerOptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import Select, { components } from 'react-select'
import Tippy from '@tippyjs/react'
import { sortBySelected, importComponentFromFELibrary } from '../../../../../../components/common'
import { getAllWorkflowsForAppNames } from '../../../../../../services/service'
import { HELM_APP_UNASSIGNED_PROJECT, SELECT_ALL_VALUE } from '../../../../../../config'
import { ReactComponent as TrashIcon } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { GroupHeading } from '../../../../../../components/v2/common/ReactSelect.utils'
import { useAuthorizationContext } from '../../../AuthorizationProvider'
import {
    CONFIG_APPROVER_ACTION,
    authorizationSelectStyles,
    ARTIFACT_PROMOTER_ACTION,
    TERMINAL_EXEC_ACTION,
} from '../../../constants'
import { AppOption, ClusterValueContainer, ValueContainer, WorkflowGroupHeading } from './common'
import {
    allApplicationsOption,
    ALL_ENVIRONMENTS_OPTION,
    ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE,
    DirectPermissionFieldName,
    roleSelectStyles,
} from './constants'
import { getPrimaryRoleIndex, getWorkflowOptions, parseData } from '../../../utils'
import { DirectPermissionRow } from './types'
import { usePermissionConfiguration } from '../PermissionConfigurationForm'
import { DirectPermissionsRoleFilter } from '../../../types'
import { getIsStatusDropdownDisabled } from '../../../libUtils'

const ApproverPermission = importComponentFromFELibrary('ApproverPermission')
const UserStatusUpdate = importComponentFromFELibrary('UserStatusUpdate', null, 'function')

const DirectPermission = ({
    permission,
    handleDirectPermissionChange,
    index,
    removeRow,
    appsList,
    jobsList,
    appsListHelmApps,
    projectsList,
    getEnvironmentOptions,
    environmentClusterOptions: envClusters,
    getListForAccessType,
}: DirectPermissionRow) => {
    const { customRoles } = useAuthorizationContext()
    const { showStatus, userStatus } = usePermissionConfiguration()
    const projectId =
        permission.team && permission.team.value !== HELM_APP_UNASSIGNED_PROJECT
            ? projectsList.find((project) => project.name === permission.team.value)?.id
            : null

    // creating a multiRole array since we receive , binded values from the backend and after one action, we reset that
    const multiRole = permission.action.value.split(',')
    const doesConfigApproverRoleExist = multiRole.includes(CONFIG_APPROVER_ACTION.value)
    const doesArtifactPromoterRoleExist = multiRole.includes(ARTIFACT_PROMOTER_ACTION.value)
    const doesTerminalAccessRoleExist = multiRole.includes(TERMINAL_EXEC_ACTION.value)

    const primaryActionRoleIndex = getPrimaryRoleIndex(multiRole, [
        CONFIG_APPROVER_ACTION.value,
        ARTIFACT_PROMOTER_ACTION.value,
        TERMINAL_EXEC_ACTION.value,
    ])

    const primaryActionRole = {
        label: multiRole[primaryActionRoleIndex],
        value: multiRole[primaryActionRoleIndex],
        configApprover: doesConfigApproverRoleExist || permission.action.configApprover,
        artifactPromoter: doesArtifactPromoterRoleExist || permission.action.artifactPromoter,
        terminalExec: doesTerminalAccessRoleExist || permission.action.terminalExec,
    }

    const [openMenu, setOpenMenu] = useState<DirectPermissionFieldName | ''>('')
    const [applications, setApplications] = useState([])
    const [clusterInput, setClusterInput] = useState('')
    const [envInput, setEnvInput] = useState('')
    const [appInput, setAppInput] = useState('')
    const [workflowInput, setWorkflowInput] = useState('')
    const [workflowList, setWorkflowList] = useState({ loading: false, options: [] })

    const abortControllerRef = useRef<AbortController>(new AbortController())

    const environments = getEnvironmentOptions(permission.entity)
    const isAccessTypeJob = permission.accessType === ACCESS_TYPE_MAP.JOBS
    const possibleRoles = useMemo(
        () =>
            customRoles.customRoles.map(({ roleDisplayName, roleName, roleDescription, entity, accessType }) => ({
                label: roleDisplayName,
                value: roleName,
                description: roleDescription,
                entity,
                accessType,
            })),
        [customRoles],
    )

    const _getMetaRolesForAccessType = () => {
        switch (permission.accessType) {
            case ACCESS_TYPE_MAP.DEVTRON_APPS:
                return customRoles.possibleRolesMeta
            case ACCESS_TYPE_MAP.HELM_APPS:
                return customRoles.possibleRolesMetaForHelm
            case ACCESS_TYPE_MAP.JOBS:
                return customRoles.possibleRolesMetaForJob
            default:
                throw new Error(`Unknown access type ${permission.accessType}`)
        }
    }

    const getSelectedRolesDisplay = (selectedPermissions: string[]) =>
        selectedPermissions.filter((selectedVal) => !!selectedVal).join(', ')

    const metaRolesForAccessType = _getMetaRolesForAccessType()
    const listForAccessType = getListForAccessType(permission.accessType)

    // eslint-disable-next-line react/no-unstable-nested-components
    const RoleValueContainer = ({
        children,
        getValue,
        clearValue,
        cx,
        getStyles,
        hasValue,
        isMulti,
        options,
        selectOption,
        selectProps,
        setValue,
        isDisabled,
        isRtl,
        theme,
        getClassNames,
        ...props
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }: any) => {
        const [{ value }] = getValue()
        return (
            <components.ValueContainer
                {...{
                    getValue,
                    clearValue,
                    cx,
                    getStyles,
                    hasValue,
                    isMulti,
                    options,
                    selectOption,
                    selectProps,
                    setValue,
                    isDisabled,
                    isRtl,
                    theme,
                    getClassNames,
                    ...props,
                }}
            >
                {getSelectedRolesDisplay([
                    value === SELECT_ALL_VALUE ? 'Admin' : metaRolesForAccessType[value].value,
                    ...(ApproverPermission
                        ? [
                              (permission.approver ||
                                  primaryActionRole.configApprover ||
                                  primaryActionRole.artifactPromoter) &&
                                  'Approver',
                              primaryActionRole.terminalExec && 'Terminal',
                          ]
                        : []),
                ])}
                {React.cloneElement(children[1])}
            </components.ValueContainer>
        )
    }

    const formatOptionLabel = ({ value }) => (
        <div className="flex left column">
            <span>{metaRolesForAccessType[value]?.value}</span>
            <small className="light-color">{metaRolesForAccessType[value]?.description}</small>
        </div>
    )

    // eslint-disable-next-line react/no-unstable-nested-components
    const RoleMenuList = (props) => (
        <components.MenuList {...props}>
            {props.children}
            {ApproverPermission &&
                (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS ||
                    permission.accessType === ACCESS_TYPE_MAP.HELM_APPS) && (
                    <ApproverPermission
                        optionProps={props}
                        approver={permission.approver}
                        configApprover={primaryActionRole.configApprover}
                        artifactPromoter={primaryActionRole.artifactPromoter}
                        terminalExec={primaryActionRole.terminalExec}
                        handleDirectPermissionChange={(...rest) => {
                            props.selectOption(props.selectProps.value)
                            handleDirectPermissionChange(...rest)
                        }}
                        formatOptionLabel={formatOptionLabel}
                        accessType={permission.accessType}
                        customRoles={customRoles}
                    />
                )}
        </components.MenuList>
    )

    const setWorkflowsForJobs = async (_permission: DirectPermissionsRoleFilter) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        abortControllerRef.current = new AbortController()
        setWorkflowList({ loading: true, options: [] })
        try {
            setWorkflowList({ loading: true, options: [] })
            const jobNames =
                _permission.entityName.filter((option) => option.value !== SELECT_ALL_VALUE).map((app) => app.label) ??
                []
            const {
                result: { appIdWorkflowNamesMapping },
            } = await getAllWorkflowsForAppNames(jobNames, abortControllerRef.current.signal)
            const workflowOptions = getWorkflowOptions(appIdWorkflowNamesMapping)
            abortControllerRef.current = null
            setWorkflowList({ loading: false, options: workflowOptions })
        } catch (err) {
            if (!getIsRequestAborted(err)) {
                showError(err)
            }
            setWorkflowList({ loading: false, options: [] })
        }
    }

    useEffect(() => {
        const isJobs = permission.entity === EntityTypes.JOB
        const appOptions = ((projectId && listForAccessType.get(projectId)?.result) || []).map((app) => ({
            label: isJobs ? app.jobName : app.name,
            value: isJobs ? app.appName : app.name,
        }))
        setApplications(appOptions)
        if (permission.entity === EntityTypes.JOB && permission.entityName.length > 0) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            setWorkflowsForJobs(permission)
        }
    }, [appsList, appsListHelmApps, projectId, jobsList])

    useEffect(() => {
        if (openMenu || !projectId || (environments && environments.length === 0) || applications.length === 0) {
            return
        }

        setApplications((_applications) =>
            openMenu === DirectPermissionFieldName.apps || openMenu === DirectPermissionFieldName.jobs
                ? _applications
                : sortBySelected(permission.entityName, _applications, 'value'),
        )
    }, [openMenu, permission.environment, permission.entityName, projectId])

    const formatOptionLabelClusterEnv = (option, { inputValue }) => (
        <div
            className={`flex left column ${
                option.value &&
                (option.value.startsWith(ALL_EXISTING_AND_FUTURE_ENVIRONMENTS_VALUE) ||
                    option.value.startsWith(SELECT_ALL_VALUE)) &&
                'fs-13 fw-6 cn-9'
            }`}
        >
            {!inputValue ? (
                <>
                    <span>{option.label}</span>
                    <small className={permission.accessType === ACCESS_TYPE_MAP.HELM_APPS && 'light-color'}>
                        {option.clusterName +
                            (option.clusterName && option.namespace ? '/' : '') +
                            (option.namespace || '')}
                    </small>
                </>
            ) : (
                <>
                    <span
                        // eslint-disable-next-line react/no-danger
                        dangerouslySetInnerHTML={{
                            __html: option.label.replace(
                                new RegExp(inputValue, 'gi'),
                                (highlighted) => `<mark>${highlighted}</mark>`,
                            ),
                        }}
                    />
                    {option.clusterName && option.namespace && (
                        <small
                            className={permission.accessType === ACCESS_TYPE_MAP.HELM_APPS && 'light-color'}
                            // eslint-disable-next-line react/no-danger
                            dangerouslySetInnerHTML={{
                                __html: `${option.clusterName}/${option.namespace}`.replace(
                                    new RegExp(inputValue, 'gi'),
                                    (highlighted) => `<mark>${highlighted}</mark>`,
                                ),
                            }}
                        />
                    )}
                </>
            )}
        </div>
    )

    const customFilter = (option, searchText: string) =>
        option.data.label?.toLowerCase().includes(searchText?.toLowerCase()) ||
        option.data.clusterName?.toLowerCase().includes(searchText?.toLowerCase()) ||
        option.data.namespace?.toLowerCase().includes(searchText?.toLowerCase())

    const onFocus = (name: DirectPermissionFieldName) => {
        setOpenMenu(name)
    }

    const onMenuClose = () => {
        setOpenMenu('')
    }

    const handleStatusChange = (
        status: DirectPermissionsRoleFilter['status'],
        timeToLive?: DirectPermissionsRoleFilter['timeToLive'],
    ) => {
        handleDirectPermissionChange(
            {
                status,
                timeToLive,
            },
            {
                name: DirectPermissionFieldName.status,
            },
        )
    }

    const projectOptions: SelectPickerOptionType[] = [
        ...(permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
            ? [
                  {
                      name: HELM_APP_UNASSIGNED_PROJECT,
                      description: 'Apps without an assigned project',
                  },
              ]
            : []),
        ...projectsList,
    ].map((project) => ({ label: project.name, value: project.name, description: project.description }))

    return (
        <>
            <SelectPicker
                inputId="dropdown-for-project"
                value={permission.team}
                name={DirectPermissionFieldName.team}
                placeholder="Select project"
                options={projectOptions}
                onChange={handleDirectPermissionChange}
                size={ComponentSizeType.large}
            />
            {permission.accessType === ACCESS_TYPE_MAP.HELM_APPS ? (
                <div>
                    <Select
                        classNamePrefix="dropdown-for-environment"
                        value={permission.environment}
                        isMulti
                        closeMenuOnSelect={false}
                        name={DirectPermissionFieldName.environment}
                        onFocus={() => onFocus(DirectPermissionFieldName.environment)}
                        onMenuClose={onMenuClose}
                        placeholder="Select environments"
                        options={envClusters}
                        formatOptionLabel={formatOptionLabelClusterEnv}
                        filterOption={customFilter}
                        hideSelectedOptions={false}
                        menuPlacement="auto"
                        styles={authorizationSelectStyles}
                        components={{
                            ClearIndicator: null,
                            ValueContainer: ClusterValueContainer,
                            IndicatorSeparator: null,
                            Option,
                            GroupHeading,
                        }}
                        isDisabled={!permission.team}
                        onChange={handleDirectPermissionChange}
                        blurInputOnSelect={false}
                        inputValue={clusterInput}
                        onBlur={() => {
                            setClusterInput('')
                        }}
                        onInputChange={(value, action) => {
                            if (action.action === ReactSelectInputAction.inputChange) {
                                setClusterInput(value)
                            }
                        }}
                    />
                    {permission.environmentError && <span className="form__error">{permission.environmentError}</span>}
                </div>
            ) : (
                <div style={{ order: isAccessTypeJob ? 3 : 0 }}>
                    <Select
                        classNamePrefix="dropdown-for-environment"
                        value={permission.environment}
                        isMulti
                        closeMenuOnSelect={false}
                        name={DirectPermissionFieldName.environment}
                        onFocus={() => onFocus(DirectPermissionFieldName.environment)}
                        onMenuClose={onMenuClose}
                        placeholder="Select environments"
                        options={[{ label: '', options: [ALL_ENVIRONMENTS_OPTION] }, ...environments]}
                        menuPlacement="auto"
                        hideSelectedOptions={false}
                        styles={authorizationSelectStyles}
                        components={{
                            ClearIndicator: null,
                            ValueContainer,
                            IndicatorSeparator: null,
                            Option,
                            GroupHeading,
                        }}
                        isDisabled={!permission.team}
                        onChange={handleDirectPermissionChange}
                        inputValue={envInput}
                        onBlur={() => {
                            setEnvInput('')
                        }}
                        onInputChange={(value, action) => {
                            if (action.action === ReactSelectInputAction.inputChange) {
                                setEnvInput(value)
                            }
                        }}
                    />
                    {permission.environmentError && <span className="form__error">{permission.environmentError}</span>}
                </div>
            )}
            <div style={{ order: isAccessTypeJob ? 1 : 0 }}>
                <Select
                    classNamePrefix="dropdown-for-appOrJob"
                    value={permission.entityName}
                    isMulti
                    components={{
                        ClearIndicator: null,
                        ValueContainer,
                        IndicatorSeparator: null,
                        // eslint-disable-next-line react/no-unstable-nested-components
                        Option: (props) => <AppOption props={props} permission={permission} />,
                        GroupHeading,
                        LoadingIndicator,
                    }}
                    isLoading={projectId && listForAccessType.get(projectId)?.loading}
                    isDisabled={!permission.team || (projectId && listForAccessType.get(projectId)?.loading)}
                    styles={authorizationSelectStyles}
                    closeMenuOnSelect={false}
                    name={isAccessTypeJob ? DirectPermissionFieldName.jobs : DirectPermissionFieldName.apps}
                    onFocus={() =>
                        onFocus(isAccessTypeJob ? DirectPermissionFieldName.jobs : DirectPermissionFieldName.apps)
                    }
                    onMenuClose={onMenuClose}
                    placeholder={isAccessTypeJob ? 'Select Job' : 'Select applications'}
                    options={[allApplicationsOption(permission.entity), ...applications]}
                    onChange={handleDirectPermissionChange}
                    hideSelectedOptions={false}
                    inputValue={appInput}
                    menuPlacement="auto"
                    onBlur={() => {
                        setAppInput('') // send selected options to setWorkflowsForJobs function
                        if (permission.entity === EntityTypes.JOB && !jobsList.get(projectId)?.loading) {
                            // eslint-disable-next-line @typescript-eslint/no-floating-promises
                            setWorkflowsForJobs(permission)
                        }
                    }}
                    onInputChange={(value, action) => {
                        if (action.action === ReactSelectInputAction.inputChange) {
                            setAppInput(value)
                        }
                    }}
                />
                {permission.entityNameError && <span className="form__error">{permission.entityNameError}</span>}
            </div>
            {permission.entity === EntityTypes.JOB && (
                <div style={{ order: 2 }}>
                    <Select
                        classNamePrefix="dropdown-for-workflow-for-job"
                        value={permission.workflow}
                        isMulti
                        closeMenuOnSelect={false}
                        name={DirectPermissionFieldName.workflow}
                        onFocus={() => onFocus(DirectPermissionFieldName.workflow)}
                        onMenuClose={onMenuClose}
                        placeholder="Select workflow"
                        options={[
                            { label: '', options: [{ label: 'All Workflows', value: SELECT_ALL_VALUE }] },
                            ...workflowList.options,
                        ]}
                        className="basic-multi-select"
                        menuPlacement="auto"
                        hideSelectedOptions={false}
                        styles={authorizationSelectStyles}
                        isLoading={workflowList.loading}
                        isDisabled={!permission.team || workflowList.loading}
                        components={{
                            ClearIndicator: null,
                            ValueContainer,
                            IndicatorSeparator: null,
                            Option,
                            GroupHeading: WorkflowGroupHeading,
                            LoadingIndicator,
                        }}
                        onChange={(value, actionMeta) => {
                            handleDirectPermissionChange(value, actionMeta, workflowList)
                        }}
                        inputValue={workflowInput}
                        onBlur={() => {
                            setWorkflowInput('')
                        }}
                        onInputChange={(value, action) => {
                            if (action.action === ReactSelectInputAction.inputChange) {
                                setWorkflowInput(value)
                            }
                        }}
                    />
                    {permission.workflowError && <span className="form__error">{permission.workflowError}</span>}
                </div>
            )}
            <div style={{ order: isAccessTypeJob ? 4 : 0 }}>
                <Select
                    classNamePrefix="dropdown-for-role"
                    value={primaryActionRole}
                    name="action"
                    placeholder="Select role"
                    options={parseData(possibleRoles, permission.entity, permission.accessType)}
                    formatOptionLabel={formatOptionLabel}
                    onChange={handleDirectPermissionChange}
                    isDisabled={!permission.team}
                    menuPlacement="auto"
                    blurInputOnSelect
                    styles={roleSelectStyles}
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        ValueContainer: RoleValueContainer,
                        MenuList: RoleMenuList,
                    }}
                />
            </div>
            {showStatus && (
                <div className="h-36 flexbox flex-align-center" style={{ order: 5 }}>
                    <UserStatusUpdate
                        userStatus={permission.status}
                        timeToLive={permission.timeToLive}
                        userEmail=""
                        handleChange={handleStatusChange}
                        disabled={getIsStatusDropdownDisabled(userStatus)}
                        showTooltipWhenDisabled
                        showDropdownBorder={false}
                        breakLinesForTemporaryAccess
                        dropdownClassName="flex-grow-1"
                    />
                </div>
            )}
            <Tippy className="default-tt" arrow={false} placement="top" content="Delete">
                <button
                    type="button"
                    className="dc__transparent flex p-4 icon-delete h-36"
                    onClick={() => removeRow(index)}
                    aria-label="Delete row"
                    style={{ order: showStatus ? 6 : 5 }}
                >
                    <TrashIcon className="scn-6 icon-dim-16" />
                </button>
            </Tippy>
        </>
    )
}

export default DirectPermission

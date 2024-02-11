// TODO (v3): Remove this file

import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
    showError,
    Option,
    MultiValueContainer,
    MultiValueRemove,
    multiSelectStyles,
    OptionType,
} from '@devtron-labs/devtron-fe-common-lib'
import Select, { components } from 'react-select'
import {
    sortBySelected,
    importComponentFromFELibrary,
    createClusterEnvGroup,
} from '../../../../../../components/common'
import { getAllWorkflowsForAppNames } from '../../../../../../services/service'
import { ActionTypes, EntityTypes, DirectPermissionRow, ChartPermissionRow } from './userGroups.types'
import { ACCESS_TYPE_MAP, HELM_APP_UNASSIGNED_PROJECT } from '../../../../../../config'
import { ReactComponent as CloseIcon } from '../../../../../../assets/icons/ic-close.svg'
import {
    groupHeaderStyle,
    GroupHeading,
    Option as singleOption,
} from '../../../../../../components/v2/common/ReactSelect.utils'
import { DEFAULT_ENV } from '../../../../../../components/app/details/triggerView/Constants'
import { useAuthorizationContext } from '../../../AuthorizationProvider'

const ApproverPermission = importComponentFromFELibrary('ApproverPermission')

const PERMISSION_LABEL_CLASS = 'fw-6 fs-12 cn-7 dc__uppercase mb-0'

const tempMultiSelectStyles = {
    ...multiSelectStyles,
    ...groupHeaderStyle,
    menu: (base, state) => ({
        ...base,
        top: 'auto',
        width: '140%',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
}

const allApplicationsOption = (entity) => ({
    label: entity === EntityTypes.JOB ? 'All Jobs' : 'All applications',
    value: '*',
})

const allEnvironmentsOption = {
    label: 'All environments',
    value: '*',
}

export const APPROVER_ACTION = { label: 'approver', value: 'approver' }
export const CONFIG_APPROVER_ACTION = { label: 'configApprover', value: 'configApprover' }

export const DirectPermission: React.FC<DirectPermissionRow> = ({
    permission,
    handleDirectPermissionChange,
    index,
    removeRow,
}) => {
    const { environmentsList, projectsList, appsList, envClustersList, appsListHelmApps, customRoles, jobsList } =
        useAuthorizationContext()
    const projectId =
        permission.team && permission.team.value !== HELM_APP_UNASSIGNED_PROJECT
            ? projectsList.find((project) => project.name === permission.team.value)?.id
            : null
    const multiRole = permission.action.value.split(',')
    const configApproverRoleIndex = multiRole.indexOf(CONFIG_APPROVER_ACTION.value)
    const primaryActionRoleIndex = configApproverRoleIndex === 0 ? 1 : 0
    const primaryActionRole = {
        label: multiRole[primaryActionRoleIndex],
        value: multiRole[primaryActionRoleIndex],
        configApprover: multiRole[configApproverRoleIndex]
            ? !!multiRole[configApproverRoleIndex]
            : permission.action.configApprover,
    }

    const [possibleRoles, setPossibleRoles] = useState([])
    const [openMenu, changeOpenMenu] = useState<
        'entityName/apps' | 'entityName/jobs' | 'environment' | 'workflow' | ''
    >('')
    const [environments, setEnvironments] = useState([])
    const [applications, setApplications] = useState([])
    const [envClusters, setEnvClusters] = useState([])
    const [projectInput, setProjectInput] = useState('')
    const [clusterInput, setClusterInput] = useState('')
    const [envInput, setEnvInput] = useState('')
    const [appInput, setAppInput] = useState('')
    const [workflowInput, setWorkflowInput] = useState('')
    const [workflowList, setWorkflowList] = useState({ loading: false, options: [] })

    const abortControllerRef = useRef<AbortController>(new AbortController())

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
    }) => {
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
                {value === '*'
                    ? 'Admin'
                    : permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                    ? customRoles.possibleRolesMetaForHelm[value].value
                    : permission.entity === EntityTypes.JOB
                    ? customRoles.possibleRolesMetaForJob[value].value
                    : customRoles.possibleRolesMeta[value].value}
                {ApproverPermission && (permission.approver || primaryActionRole.configApprover) && ', Approver'}
                {React.cloneElement(children[1])}
            </components.ValueContainer>
        )
    }

    const RoleMenuList = (props) => {
        return (
            <components.MenuList {...props}>
                {props.children}
                {ApproverPermission && permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS && (
                    <ApproverPermission
                        optionProps={props}
                        approver={permission.approver}
                        configApprover={primaryActionRole.configApprover}
                        handleDirectPermissionChange={(...rest: any[]) => {
                            props.selectOption(props.selectProps.value)
                            handleDirectPermissionChange(...rest)
                        }}
                        formatOptionLabel={formatOptionLabel}
                    />
                )}
            </components.MenuList>
        )
    }

    useEffect(() => {
        const envOptions = createClusterEnvGroup(
            environmentsList,
            'cluster_name',
            'environment_name',
            'environmentIdentifier',
        )

        if (permission.entity === EntityTypes.JOB) {
            const deafultEnv = {
                label: '',
                options: [
                    {
                        label: DEFAULT_ENV,
                        value: DEFAULT_ENV,
                    },
                ],
            }
            const filteredEnvOptions = envOptions.filter((envOptions) => {
                const filteredOptions = envOptions.options.filter((option) => option.isClusterCdActive)
                if (filteredOptions.length > 0) {
                    envOptions.options = filteredOptions
                }
                return filteredOptions.length > 0
            })
            setEnvironments([deafultEnv, ...filteredEnvOptions])
        } else {
            setEnvironments(envOptions)
        }
    }, [environmentsList])

    useEffect(() => {
        const customRoleOptions = customRoles.customRoles.map((role) => ({
            label: role.roleDisplayName,
            value: role.roleName,
            description: role.roleDescription,
            entity: role.entity,
            accessType: role.accessType,
        }))
        setPossibleRoles(customRoleOptions)
    }, [customRoles])

    useEffect(() => {
        const envOptions = envClustersList?.map((cluster) => ({
            label: cluster.clusterName,
            options: [
                {
                    label: `All existing + future environments in ${cluster.clusterName}`,
                    value: `#${cluster.clusterName}`,
                    namespace: '',
                    clusterName: '',
                },
                {
                    label: `All existing environments in ${cluster.clusterName}`,
                    value: `*${cluster.clusterName}`,
                    namespace: '',
                    clusterName: '',
                },
                ...cluster.environments?.map((env) => ({
                    label: env.environmentName,
                    value: env.environmentIdentifier,
                    namespace: env.namespace,
                    clusterName: cluster.clusterName,
                })),
            ],
            isVirtualEnvironment: cluster?.isVirtualCluster,
        }))

        setEnvClusters(envOptions)
    }, [envClustersList])
    useEffect(() => {
        const isJobs = permission.entity === EntityTypes.JOB
        const appOptions = (
            (projectId &&
                (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                    ? appsList
                    : isJobs
                    ? jobsList
                    : appsListHelmApps
                ).get(projectId)?.result) ||
            []
        )?.map((app) => ({
            label: isJobs ? app.jobName : app.name,
            value: isJobs ? app.appName : app.name,
        }))
        setApplications(appOptions)
        if (permission.entity === EntityTypes.JOB && permission.entityName.length > 0) {
            setWorkflowsForJobs(permission)
        }
    }, [appsList, appsListHelmApps, projectId, jobsList])

    useEffect(() => {
        if (openMenu || !projectId) {
            return
        }
        if ((environments && environments.length === 0) || applications.length === 0) {
            return
        }
        setApplications((applications) => {
            const sortedApplications =
                openMenu === 'entityName/apps' || openMenu === 'entityName/jobs'
                    ? applications
                    : sortBySelected(permission.entityName, applications, 'value')
            return sortedApplications
        })
    }, [openMenu, permission.environment, permission.entityName, projectId])

    const setWorkflowsForJobs = async (perimssion) => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort()
            abortControllerRef.current = null
        }
        abortControllerRef.current = new AbortController()
        setWorkflowList({ loading: true, options: [] })
        try {
            setWorkflowList({ loading: true, options: [] })
            const jobNames = perimssion.entityName.filter((option) => option.value != '*').map((app) => app.label)
            const {
                result: { appIdWorkflowNamesMapping },
            } = await getAllWorkflowsForAppNames(jobNames, abortControllerRef.current.signal)
            const workflowOptions = []
            for (const jobName in appIdWorkflowNamesMapping) {
                workflowOptions.push({
                    label: jobName,
                    options: appIdWorkflowNamesMapping[jobName].map((workflow) => ({
                        label: workflow,
                        value: workflow,
                    })),
                })
            }
            abortControllerRef.current = null
            setWorkflowList({ loading: false, options: workflowOptions })
        } catch (err: any) {
            if (err.errors && err.errors[0].code != 0) {
                showError(err)
            }
            setWorkflowList({ loading: false, options: [] })
        }
    }

    function formatOptionLabel({ value, label }) {
        return (
            <div className="flex left column">
                <span>
                    {
                        (permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                            ? customRoles.possibleRolesMetaForHelm
                            : permission.accessType === ACCESS_TYPE_MAP.JOBS
                            ? customRoles.possibleRolesMetaForJob
                            : customRoles.possibleRolesMeta)[value]?.value
                    }
                </span>
                <small className="light-color">
                    {
                        (permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                            ? customRoles.possibleRolesMetaForHelm
                            : permission.accessType === ACCESS_TYPE_MAP.JOBS
                            ? customRoles.possibleRolesMetaForJob
                            : customRoles.possibleRolesMeta)[value]?.description
                    }
                </small>
            </div>
        )
    }

    function formatOptionLabelClusterEnv(option, { inputValue }) {
        return (
            <div
                className={`flex left column ${
                    option.value &&
                    (option.value.startsWith('#') || option.value.startsWith('*')) &&
                    'cluster-label-all'
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
    }

    function formatOptionLabelProject(option) {
        return (
            <div className="flex left column">
                <span>{option.label}</span>
                {permission.accessType === ACCESS_TYPE_MAP.HELM_APPS && option.value === HELM_APP_UNASSIGNED_PROJECT && (
                    <>
                        <small className="light-color">Apps without an assigned project</small>
                        <div className="unassigned-project-border" />
                    </>
                )}
            </div>
        )
    }

    function customFilter(option, searchText) {
        if (
            option.data.label?.toLowerCase().includes(searchText?.toLowerCase()) ||
            option.data.clusterName?.toLowerCase().includes(searchText?.toLowerCase()) ||
            option.data.namespace?.toLowerCase().includes(searchText?.toLowerCase())
        ) {
            return true
        }
        return false
    }

    function onFocus(name: 'entityName/apps' | 'entityName/jobs' | 'environment' | 'workflow') {
        changeOpenMenu(name)
    }

    function onMenuClose() {
        changeOpenMenu('')
    }
    return (
        <>
            <Select
                value={permission.team}
                name="team"
                isMulti={false}
                placeholder="Select project"
                options={(permission.accessType === ACCESS_TYPE_MAP.HELM_APPS
                    ? [{ name: HELM_APP_UNASSIGNED_PROJECT }, ...(projectsList || [])]
                    : projectsList
                )?.map((project) => ({ label: project.name, value: project.name }))}
                className="basic-multi-select"
                classNamePrefix="select-project-dropdown"
                onChange={handleDirectPermissionChange}
                components={{
                    ClearIndicator: null,
                    IndicatorSeparator: null,
                    Option: singleOption,
                    ValueContainer: projectValueContainer,
                }}
                menuPlacement="auto"
                styles={{
                    ...tempMultiSelectStyles,
                    control: (base, state) => ({
                        ...base,
                        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
                        boxShadow: 'none',
                    }),
                    valueContainer: (base, state) => ({
                        ...base,
                        display: 'flex',
                    }),
                }}
                formatOptionLabel={formatOptionLabelProject}
                inputValue={projectInput}
                onBlur={() => {
                    setProjectInput('')
                }}
                onInputChange={(value, action) => {
                    if (action.action === 'input-change') {
                        setProjectInput(value)
                    }
                }}
            />
            {permission.accessType === ACCESS_TYPE_MAP.HELM_APPS ? (
                <div>
                    <Select
                        value={permission.environment}
                        isMulti
                        closeMenuOnSelect={false}
                        name="environment"
                        onFocus={() => onFocus('environment')}
                        onMenuClose={onMenuClose}
                        placeholder="Select environments"
                        options={envClusters}
                        formatOptionLabel={formatOptionLabelClusterEnv}
                        filterOption={customFilter}
                        className="basic-multi-select cluster-select"
                        classNamePrefix="select-helm-app-environment-dropdown"
                        hideSelectedOptions={false}
                        menuPlacement="auto"
                        styles={{
                            ...tempMultiSelectStyles,
                            option: (base, state) => ({
                                ...base,
                                padding: '4px 12px',
                                backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
                                color: 'var(--N900)',
                            }),
                        }}
                        components={{
                            ClearIndicator: null,
                            ValueContainer: clusterValueContainer,
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
                            if (action.action === 'input-change') {
                                setClusterInput(value)
                            }
                        }}
                    />
                    {permission.environmentError && <span className="form__error">{permission.environmentError}</span>}
                </div>
            ) : (
                <div style={{ order: permission.accessType === '' ? 3 : 0 }}>
                    <Select
                        value={permission.environment}
                        isMulti
                        closeMenuOnSelect={false}
                        name="environment"
                        onFocus={() => onFocus('environment')}
                        onMenuClose={onMenuClose}
                        placeholder="Select environments"
                        options={[{ label: '', options: [allEnvironmentsOption] }, ...environments]}
                        className="basic-multi-select"
                        menuPlacement="auto"
                        classNamePrefix="select-devtron-app-environment-dropdown"
                        hideSelectedOptions={false}
                        styles={tempMultiSelectStyles}
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
                            if (action.action === 'input-change') {
                                setEnvInput(value)
                            }
                        }}
                    />
                    {permission.environmentError && <span className="form__error">{permission.environmentError}</span>}
                </div>
            )}
            <div style={{ order: permission.accessType === '' ? 1 : 0 }}>
                <Select
                    value={permission.entityName}
                    isMulti
                    components={{
                        ClearIndicator: null,
                        ValueContainer,
                        IndicatorSeparator: null,
                        Option: (props) => <AppOption props={props} permission={permission} />,
                        GroupHeading,
                    }}
                    isLoading={
                        projectId
                            ? (permission.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS
                                  ? appsList
                                  : permission.entity === EntityTypes.JOB
                                  ? jobsList
                                  : appsListHelmApps
                              ).get(projectId)?.loading
                            : false
                    }
                    isDisabled={!permission.team}
                    styles={tempMultiSelectStyles}
                    closeMenuOnSelect={false}
                    name={`entityName/${permission.entity}`}
                    onFocus={() => onFocus(`entityName/${permission.entity}`)}
                    onMenuClose={onMenuClose}
                    placeholder={permission.accessType === '' ? 'Select Job' : 'Select applications'}
                    options={[allApplicationsOption(permission.entity), ...applications]}
                    className="basic-multi-select"
                    classNamePrefix="select-application-dropdown"
                    onChange={(value, actionMeta) => {
                        handleDirectPermissionChange(value, actionMeta)
                    }}
                    hideSelectedOptions={false}
                    inputValue={appInput}
                    menuPlacement="auto"
                    onBlur={(e) => {
                        setAppInput('') // send selected options to setWorkflowsForJobs function
                        if (permission.entity === EntityTypes.JOB && !jobsList.get(projectId)?.loading) {
                            setWorkflowsForJobs(permission)
                        }
                    }}
                    onInputChange={(value, action) => {
                        if (action.action === 'input-change') {
                            setAppInput(value)
                        }
                    }}
                />
                {permission.entityNameError && <span className="form__error">{permission.entityNameError}</span>}
            </div>
            {permission.entity === EntityTypes.JOB && (
                <div style={{ order: 2 }}>
                    <Select
                        value={permission.workflow}
                        isMulti
                        closeMenuOnSelect={false}
                        name="workflow"
                        onFocus={() => onFocus('workflow')}
                        onMenuClose={onMenuClose}
                        placeholder="Select workflow"
                        options={[
                            { label: '', options: [{ label: 'All Workflows', value: '*' }] },
                            ...workflowList.options,
                        ]}
                        className="basic-multi-select"
                        menuPlacement="auto"
                        classNamePrefix="select-devtron-app-workflow-dropdown"
                        hideSelectedOptions={false}
                        styles={tempMultiSelectStyles}
                        isLoading={workflowList.loading}
                        components={{
                            ClearIndicator: null,
                            ValueContainer,
                            IndicatorSeparator: null,
                            Option,
                            GroupHeading: workflowGroupHeading,
                        }}
                        isDisabled={!permission.team}
                        onChange={(value, actionMeta) => {
                            handleDirectPermissionChange(value, actionMeta, workflowList)
                        }}
                        inputValue={workflowInput}
                        onBlur={() => {
                            setWorkflowInput('')
                        }}
                        onInputChange={(value, action) => {
                            if (action.action === 'input-change') {
                                setWorkflowInput(value)
                            }
                        }}
                    />
                    {permission.workflowError && <span className="form__error">{permission.workflowError}</span>}
                </div>
            )}
            <div style={{ order: permission.accessType === '' ? 4 : 0 }}>
                <Select
                    value={primaryActionRole}
                    name="action"
                    placeholder="Select role"
                    options={ParseData(possibleRoles, permission.entity, permission.accessType)}
                    className="basic-multi-select"
                    classNamePrefix="select-user-role-dropdown"
                    formatOptionLabel={formatOptionLabel}
                    onChange={handleDirectPermissionChange}
                    isDisabled={!permission.team}
                    menuPlacement="auto"
                    blurInputOnSelect
                    styles={{
                        ...tempMultiSelectStyles,
                        option: (base, state) => ({
                            ...base,
                            borderRadius: '4px',
                            color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
                            backgroundColor: state.isSelected
                                ? 'var(--B100)'
                                : state.isFocused
                                ? 'var(--N100)'
                                : 'white',
                            fontWeight: state.isSelected ? 600 : 'normal',
                            cursor: state.isDisabled ? 'not-allowed' : 'pointer',
                            marginRight: '8px',
                        }),
                        valueContainer: (base, state) => ({
                            ...base,
                            display: 'flex',
                            flexWrap: 'nowrap',
                            textOverflow: 'ellipsis',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                        }),
                    }}
                    components={{
                        ClearIndicator: null,
                        IndicatorSeparator: null,
                        ValueContainer: RoleValueContainer,
                        MenuList: RoleMenuList,
                    }}
                />
            </div>
            <CloseIcon className="pointer mt-6" onClick={(e) => removeRow(index)} style={{ order: 5 }} />
        </>
    )
}
const workflowGroupHeading = (props) => {
    return <GroupHeading {...props} hideClusterName />
}

const AppOption = ({ props, permission }) => {
    const { selectOption, data } = props
    return (
        <div
            onClick={(e) => selectOption(data)}
            className="flex left pl-12"
            style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}
        >
            <input
                checked={props.isSelected}
                type="checkbox"
                style={{ height: '16px', width: '16px', flex: '0 0 16px' }}
            />
            <div className="flex left column w-100">
                <components.Option className="w-100 option-label-padding" {...props} />
                {data.value === '*' && (
                    <span className="fs-12 cn-6 ml-8 mb-4 mr-4">
                        {`Allow access to existing and new ${
                            permission.entity === EntityTypes.JOB ? 'jobs' : 'apps'
                        } for this project`}
                    </span>
                )}
            </div>
        </div>
    )
}



export const ChartPermission: React.FC<ChartPermissionRow> = React.memo(
    ({ chartPermission, setChartPermission, hideInfoLegend }) => {
        const { chartGroupsList } = useAuthorizationContext()
        function handleChartCreateChange(event) {
            if (event.target.checked) {
                // set admin
                setChartPermission((chartPermission) => ({
                    ...chartPermission,
                    action: ActionTypes.ADMIN,
                    entityName: [],
                }))
            } else {
                // set view or update
                setChartPermission((chartPermission) => ({
                    ...chartPermission,
                    action: ActionTypes.VIEW,
                    entityName: [],
                }))
            }
        }

        function handleChartEditChange(selected, actionMeta) {
            const { label, value } = selected
            if (value === 'Deny') {
                setChartPermission((chartPermission) => ({
                    ...chartPermission,
                    action: ActionTypes.VIEW,
                    entityName: [],
                }))
            } else {
                setChartPermission((chartPermission) => ({
                    ...chartPermission,
                    action: ActionTypes.UPDATE,
                    entityName: [],
                }))
            }
        }

        const chartGroupEditOptions: OptionType[] = useMemo(() => {
            if (chartPermission.action === ActionTypes.ADMIN) {
                return [{ label: 'All Chart Groups', value: 'All charts' }]
            }
            return [
                { label: 'Deny', value: 'Deny' },
                { label: 'Specific Chart Groups', value: 'Specific Charts' },
            ]
        }, [chartPermission.action])

        return (
            <>
                <div
                    className="w-100 display-grid dc__align-items-center"
                    style={{ gridTemplateColumns: '80px 80px 200px', rowGap: '5px' }}
                >
                    <label className={PERMISSION_LABEL_CLASS}>View</label>
                    <label className={PERMISSION_LABEL_CLASS}>Create</label>
                    <label className={PERMISSION_LABEL_CLASS}>Edit</label>
                    <div>
                        <input type="checkbox" checked disabled className="h-16 w-16" />
                    </div>
                    <div>
                        <input
                            data-testid="chart-group-create-permission-checkbox"
                            type="checkbox"
                            checked={chartPermission.action === ActionTypes.ADMIN}
                            onChange={handleChartCreateChange}
                            className="h-16 w-16"
                        />
                    </div>
                    <Select
                        value={
                            chartPermission.action === ActionTypes.ADMIN
                                ? chartGroupEditOptions[0]
                                : chartPermission.action === ActionTypes.VIEW
                                ? { label: 'Deny', value: 'Deny' }
                                : { label: 'Specific Chart Groups', value: 'Specific Charts' }
                        }
                        isDisabled={chartPermission.action === ActionTypes.ADMIN}
                        options={chartGroupEditOptions}
                        className="basic-multi-select"
                        classNamePrefix="select"
                        onChange={handleChartEditChange}
                        menuPlacement="auto"
                        components={{
                            ClearIndicator: null,
                            IndicatorSeparator: null,
                            Option,
                        }}
                        styles={{ ...tempMultiSelectStyles }}
                    />
                </div>
                {chartPermission.action === ActionTypes.UPDATE && (
                    <Select
                        value={chartPermission.entityName}
                        placeholder="Select Chart Group"
                        isMulti
                        styles={{
                            ...tempMultiSelectStyles,
                            multiValue: (base) => ({
                                ...base,
                                border: `1px solid var(--N200)`,
                                borderRadius: `4px`,
                                background: 'white',
                                height: '30px',
                                margin: '0 8px 0 0',
                                padding: '1px',
                            }),
                            menu: (base, state) => ({
                                ...base,
                                top: 'auto',
                                width: '100%',
                            }),
                        }}
                        closeMenuOnSelect={false}
                        name="entityName"
                        options={chartGroupsList?.map((chartGroup) => ({
                            label: chartGroup.name,
                            value: chartGroup.name,
                        }))}
                        onChange={(selected, actionMeta) =>
                            setChartPermission((chartPermission) => ({ ...chartPermission, entityName: selected }))
                        }
                        className="mt-8 mb-8"
                        classNamePrefix="select"
                        hideSelectedOptions={false}
                        menuPlacement="auto"
                        components={{
                            ClearIndicator: null,
                            IndicatorSeparator: null,
                            MultiValueRemove,
                            MultiValueContainer,
                            Option,
                        }}
                    />
                )}
            </>
        )
    },
)

const ValueContainer = (props) => {
    const { length } = props.getValue()
    let optionLength = props.options.length
    if (props.selectProps.name === 'environment' || props.selectProps.name === 'workflow') {
        let _optionLength = 0
        props.options.forEach((option) => {
            _optionLength += option.options?.length
        })
        optionLength = _optionLength
    }

    let count = ''
    if (
        length === optionLength &&
        (props.selectProps.name.includes('entityName') ||
            props.selectProps.name === 'environment' ||
            props.selectProps.name.includes('workflow'))
    ) {
        count = 'All'
    } else {
        count = length
    }
    let Item
    if (props.selectProps.name.includes('entityName')) {
        Item = props.selectProps.name.split('/')[1] === 'jobs' ? 'job' : 'application'
    } else {
        Item = props.selectProps.name === 'environment' ? 'environment' : 'workflow'
    }
    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && `${count} ${Item}${length !== 1 ? 's' : ''}`}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

const clusterValueContainer = (props) => {
    const { length } = props
        .getValue()
        .filter((opt) => opt.value && !opt.value.startsWith('#') && !opt.value.startsWith('*'))
    let count = ''
    const totalEnv = props.options.reduce((len, cluster) => {
        len += cluster.options.length - 2
        return len
    }, 0)
    if (length === totalEnv) {
        count = 'All environments'
    } else {
        count = `${length} environment${length !== 1 ? 's' : ''}`
    }
    return (
        <components.ValueContainer {...props}>
            {length > 0 ? (
                <>
                    {!props.selectProps.menuIsOpen && count}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const projectValueContainer = (props) => {
    const value = props.getValue()
    return (
        <components.ValueContainer {...props}>
            {value[0] ? (
                <>
                    {!props.selectProps.menuIsOpen && value[0].value}
                    {React.cloneElement(props.children[1])}
                </>
            ) : (
                <>{props.children}</>
            )}
        </components.ValueContainer>
    )
}

export const GroupRow = ({ name, description, removeRow }) => {
    return (
        <>
            <div className="anchor">{name}</div>
            <div className="dc__ellipsis-right">{description}</div>
            <CloseIcon onClick={removeRow} className="pointer" />
        </>
    )
}

export function ParseData(dataList: any[], entity: string, accessType?: string) {
    switch (entity) {
        case EntityTypes.DIRECT:
            if (accessType === ACCESS_TYPE_MAP.DEVTRON_APPS) {
                return dataList.filter(
                    (role) =>
                        role.accessType === ACCESS_TYPE_MAP.DEVTRON_APPS && role.value !== CONFIG_APPROVER_ACTION.value,
                )
            }
            return dataList.filter((role) => role.accessType === ACCESS_TYPE_MAP.HELM_APPS)

        case EntityTypes.CLUSTER:
            return dataList.filter((role) => role.entity === EntityTypes.CLUSTER)
        case EntityTypes.CHART_GROUP:
            return dataList.filter((role) => role.entity === EntityTypes.CHART_GROUP)
        case EntityTypes.JOB:
            return dataList.filter((role) => role.entity === EntityTypes.JOB)
    }
}

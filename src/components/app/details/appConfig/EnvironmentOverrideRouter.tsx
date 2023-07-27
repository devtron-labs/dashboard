import React, { useState, useEffect } from 'react'
import { useParams, useLocation, useRouteMatch, NavLink, Link } from 'react-router-dom'
import { URLS } from '../../../../config'
import { usePrevious, createClusterEnvGroup } from '../../../common'
import {
    showError,
    DeleteDialog,
    ConfirmationDialog,
    InfoColourBar,
    PopupMenu,
} from '@devtron-labs/devtron-fe-common-lib'
import { addJobEnvironment, deleteJobEnvironment, getCIConfig } from '../../../../services/service'
import { ReactComponent as Dropdown } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as Help } from '../../../../assets/icons/ic-help.svg'
import { ReactComponent as Add } from '../../../../assets/icons/ic-add.svg'
import { ReactComponent as Search } from '../../../../assets/icons/ic-search.svg'
import { ReactComponent as More } from '../../../../assets/icons/ic-more-option.svg'
import { ReactComponent as DeleteIcon } from '../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as ProtectedIcon } from '../../../../assets/icons/ic-shield-protect-fill.svg'
import warn from '../../../../assets/icons/ic-warning.svg'
import { toast } from 'react-toastify'
import './appConfig.scss'
import { DOCUMENTATION } from '../../../../config'
import { EnvironmentOverrideRouteProps, EnvironmentOverrideRouterProps } from './appConfig.type'
import ReactSelect, { components } from 'react-select'
import { groupHeading } from '../../../CIPipelineN/Constants'
import { Environment } from '../../../cdPipeline/cdPipeline.types'
import { RESOURCE_ACTION_MENU } from '../../../ResourceBrowser/Constants'
import { groupStyle } from '../../../v2/common/ReactSelect.utils'

const EnvOverridesHelpNote = () => {
    return (
        <div className="fs-12 fw-4 lh-18">
            Environment overrides allow you to manage environment specific configurations after you’ve created
            deployment pipelines. &nbsp;
            <a
                className="dc__link"
                href={DOCUMENTATION.APP_CREATE_ENVIRONMENT_OVERRIDE}
                rel="noreferrer noopener"
                target="_blank"
            >
                Learn more
            </a>
        </div>
    )
}

const EnvOverrideRoute = ({
    envOverride,
    isJobView,
    ciPipelines,
    reload,
    appId,
    workflowsRes,
    isEnvProtected,
}: EnvironmentOverrideRouteProps) => {
    const { url } = useRouteMatch()
    const location = useLocation()
    const LINK = `${url}/${URLS.APP_ENV_OVERRIDE_CONFIG}/${envOverride.environmentId}`
    const [collapsed, toggleCollapsed] = useState(location.pathname.includes(`${LINK}/`) ? false : true)
    const [showConfirmationDialog, setConfirmationDialog] = useState(false)
    const [showDelete, setDeleteView] = useState(false)
    const [deletePipeline, setDeletePipeline] = useState()

    useEffect(() => {
        if (!location.pathname.includes(`${LINK}/`) && !collapsed) {
            toggleCollapsed(true)
        }
    }, [location.pathname])

    const handleNavItemClick = () => {
        toggleCollapsed(!collapsed)
    }

    const handleDeleteConfirmation = () => {
        setDeleteView(false)
        deleteEnvHandler()
    }

    const handleCancelDelete = () => {
        setDeleteView(false)
        setDeletePipeline(null)
    }

    const deleteEnvHandler = () => {
        let requestBody = { envId: envOverride.environmentId, appId: appId }
        deleteJobEnvironment(requestBody)
            .then((response) => {
                toast.success('Deleted Successfully')
                reload()
                setDeleteView(false)
            })
            .catch((error) => {
                showError(error)
            })
    }

    const handleViewPipeline = () => {
        setDeleteView(false)
    }

    const renderDeleteDialog = (): JSX.Element => {
        return (
            <DeleteDialog
                title={`Delete configurations for environment '${envOverride.environmentName}'?`}
                delete={deleteEnvHandler}
                closeDelete={handleCancelDelete}
            >
                <DeleteDialog.Description>
                    <p className="fs-13 cn-7 lh-1-54">
                        Are you sure you want to delete configurations for this environment?
                    </p>
                </DeleteDialog.Description>
            </DeleteDialog>
        )
    }

    const renderConfirmationDeleteModal = (pipeline: any, path: string): JSX.Element => {
        return (
            <ConfirmationDialog>
                <ConfirmationDialog.Icon src={warn} />
                <ConfirmationDialog.Body
                    title={`Configurations for environment ‘${envOverride.environmentName}‘ is in use`}
                />
                <p className="fs-13 cn-7 lh-1-54">
                    {`Pipeline ‘${pipeline.name}‘ is using configurations for environment ‘${envOverride.environmentName}’.`}
                    <Link to={path} onClick={handleViewPipeline} className="ml-2">
                        View pipeline
                    </Link>
                </p>
                <p className="fs-13 cn-7 lh-1-54">
                    Base configmaps & secrets will be used if environment configurations are deleted.
                </p>
                <ConfirmationDialog.ButtonGroup>
                    <button type="button" className="cta cancel" onClick={handleCancelDelete}>
                        Cancel
                    </button>
                    <button onClick={handleDeleteConfirmation} className="cta delete cta-cd-delete-modal ml-16">
                        Delete Anyway
                    </button>
                </ConfirmationDialog.ButtonGroup>
            </ConfirmationDialog>
        )
    }

    const showDeleteDialog = (pipeline: any): JSX.Element => {
        const workFlows = workflowsRes?.workflows
        let workFlow
        if (pipeline) {
            workFlows?.forEach((workflow) => {
                workflow.tree.forEach((ciPipeline) => {
                    if (!workFlow) {
                        workFlow = pipeline.id === ciPipeline.componentId && ciPipeline
                    }
                })
            })
        }
        const path = pipeline
            ? `${url}/${URLS.APP_WORKFLOW_CONFIG}/${workFlow?.id}/ci-pipeline/${pipeline?.id}/pre-build`
            : ''
        return !showConfirmationDialog ? renderDeleteDialog() : renderConfirmationDeleteModal(pipeline, path)
    }

    const deletePopUpMenu = (): JSX.Element => {
        return (
            <PopupMenu autoClose>
                <PopupMenu.Button rootClassName="flex ml-auto" isKebab={true}>
                    <More className="icon-dim-16 fcn-6" data-testid="popup-env-delete-button" />
                </PopupMenu.Button>
                <PopupMenu.Body rootClassName="dc__border pt-4 pb-4 w-100px">
                    <div className="fs-13 fw-4 lh-20">
                        <span
                            className="flex left h-32 cursor pl-12 pr-12 cr-5 dc__hover-n50"
                            onClick={toggleDeleteDialog}
                            data-testid="delete-jobs-environment-link"
                        >
                            <DeleteIcon className="icon-dim-16 mr-8 scr-5" />
                            {RESOURCE_ACTION_MENU.delete}
                        </span>
                    </div>
                </PopupMenu.Body>
            </PopupMenu>
        )
    }

    const toggleDeleteDialog = (e) => {
        e.stopPropagation()
        setDeleteView(true)
        const pipeline = ciPipelines?.find((env) => env.environmentId === envOverride.environmentId)
        if (pipeline) {
            setConfirmationDialog(true)
            setDeletePipeline(pipeline)
        }
    }

    return (
        <div className="flex column left environment-route-wrapper top">
            <div
                className={`app-compose__nav-item flex cursor ${collapsed ? 'fw-4' : 'fw-6 no-hover'}`}
                onClick={handleNavItemClick}
            >
                <div className="flex left">
                    <Dropdown className={`icon-dim-18 rotate mr-8 ${collapsed ? 'dc__flip-90' : ''}`} />
                    {envOverride.environmentName}
                </div>
                <div className="flex">
                    {isEnvProtected && <ProtectedIcon className="icon-dim-20" />}
                    {isJobView && deletePopUpMenu()}
                    {isJobView && showDelete && showDeleteDialog(deletePipeline)}
                </div>
            </div>

            {!collapsed && (
                <div className="environment-routes">
                    {!isJobView && (
                        <NavLink
                            data-testid="env-deployment-template"
                            className="app-compose__nav-item cursor"
                            to={`${LINK}/deployment-template`}
                        >
                            Deployment template
                        </NavLink>
                    )}
                    <NavLink
                        className={`app-compose__nav-item cursor ${isJobView ? 'ml-16 w-auto-imp' : ''}`}
                        to={`${LINK}/configmap`}
                    >
                        ConfigMaps
                    </NavLink>
                    <NavLink
                        className={`app-compose__nav-item cursor ${isJobView ? 'ml-16 w-auto-imp' : ''}`}
                        to={`${LINK}/secrets`}
                    >
                        Secrets
                    </NavLink>
                </div>
            )}
        </div>
    )
}

export default function EnvironmentOverrideRouter({
    isJobView,
    workflowsRes,
    getWorkflows,
    allEnvs,
    reloadEnvironments,
}: EnvironmentOverrideRouterProps) {
    const { pathname } = useLocation()
    const { appId } = useParams<{ appId: string }>()
    const previousPathName = usePrevious(pathname)
    const [environmentList, setEnvironmentList] = useState([])
    const [addEnvironment, setEnvironmentView] = useState(true)
    const [ciPipelines, setCIPipelines] = useState([])

    useEffect(() => {
        if (allEnvs?.length) {
            let list = []
            allEnvs?.forEach((env) => {
                if (env.cluster_name !== 'default_cluster' && env.isClusterCdActive) {
                    list.push({ id: env.id, clusterName: env.cluster_name, name: env.environment_name })
                }
            })
            setEnvironmentList(list)
            getCIConfig(Number(appId))
                .then((response) => {
                    setCIPipelines(response.result?.ciPipelines)
                })
                .catch((error) => {
                    showError(error)
                })
        }
    }, [allEnvs])

    const selectEnvironment = (selection) => {
        let requestBody = { envId: selection.id, appId: appId }
        addJobEnvironment(requestBody)
            .then((response) => {
                toast.success('Saved Successfully')
                reloadEnvironments()
                setEnvironmentView(!addEnvironment)
            })
            .catch((error) => {
                showError(error)
            })
    }

    const envList = createClusterEnvGroup(environmentList, 'clusterName')

    const handleAddEnvironment = () => {
        setEnvironmentView(!addEnvironment)
    }

    const ValueContainer = (props): JSX.Element => {
        return (
            <components.ValueContainer {...props}>
                {!props.selectProps.inputValue ? (
                    <>
                        <Search className="dc__position-abs icon-dim-18 ml-8 mw-18" />
                        <span className="dc__position-abs dc__left-35 cn-5 ml-2">{props.selectProps.placeholder}</span>
                    </>
                ) : (
                    <Search className="dc__position-abs icon-dim-18 ml-8 mw-18" />
                )}
                <span className="dc__position-abs dc__left-30 cn-5 ml-2">{React.cloneElement(props.children[1])}</span>
            </components.ValueContainer>
        )
    }

    let selectedEnv: Environment = environmentList.find((env) => env.id === -1)

    const renderEnvSelector = (): JSX.Element => {
        return (
            <ReactSelect
                autoFocus
                menuIsOpen
                isSearchable
                menuPlacement="auto"
                closeMenuOnScroll={true}
                placeholder="Select Environment"
                classNamePrefix="job-pipeline-environment-dropdown"
                options={envList}
                value={selectedEnv}
                getOptionLabel={(option) => `${option.name}`}
                getOptionValue={(option) => `${option.id}`}
                isMulti={false}
                onChange={selectEnvironment}
                onBlur={handleAddEnvironment}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator: null,
                    GroupHeading: groupHeading,
                    ValueContainer: ValueContainer,
                }}
                styles={{
                    ...groupStyle(),
                    control: (base) => ({
                        ...base,
                        border: '1px solid #d6dbdf',
                        minHeight: '20px',
                        height: '30px',
                        marginTop: '4px',
                        width: '220px',
                    }),
                    container: (base) => ({
                        ...base,
                        paddingRight: '0px',
                    }),
                    valueContainer: (base) => ({ ...base, height: '28px', padding: '0px 8px' }),
                }}
            />
        )
    }

    const renderEnvsNav = (): JSX.Element => {
        if (allEnvs?.length) {
            return (
                <div className="w-100" style={{ height: 'calc(100% - 60px)' }} data-testid="env-override-list">
                    {allEnvs.map((env, index) => {
                        return (
                            !env.deploymentAppDeleteRequest && (
                                <EnvOverrideRoute
                                    envOverride={env}
                                    key={env.environmentName}
                                    isJobView={isJobView}
                                    ciPipelines={ciPipelines}
                                    reload={reloadEnvironments}
                                    appId={appId}
                                    workflowsRes={workflowsRes}
                                    isEnvProtected={env.isProtected}
                                />
                            )
                        )
                    })}
                </div>
            )
        } else if (!isJobView) {
            return (
                <InfoColourBar
                    classname="question-bar no-env-overrides"
                    message={<EnvOverridesHelpNote />}
                    Icon={Help}
                    iconClass="fcv-5"
                    iconSize={16}
                />
            )
        } else {
            return null
        }
    }

    useEffect(() => {
        if (
            previousPathName &&
            ((previousPathName.includes('/cd-pipeline') && !pathname.includes('/cd-pipeline')) ||
                (isJobView && previousPathName.includes('/pre-build') && !pathname.includes('/pre-build')) ||
                (isJobView && previousPathName.includes('/build') && !pathname.includes('/build')))
        ) {
            reloadEnvironments()
            getWorkflows()
        }
    }, [pathname])

    return (
        <div className="h-100">
            <div className="dc__border-bottom-n1 mt-8 mb-8" />
            <div className="app-compose__nav-item routes-container-header flex dc__uppercase no-hover">
                Environment Overrides
            </div>
            {isJobView && (
                <div className="flex dc__content-start dc__align-start cursor">
                    <div className="flex dc__align-center pt-8 pb-8 pl-8">
                        {addEnvironment ? (
                            <div className="flex dc__align-center" onClick={handleAddEnvironment}>
                                <Add className="icon-dim-18 fcb-5 mr-8" />
                                <div className="fw-6 fs-13 cb-5">Add Environment</div>
                            </div>
                        ) : (
                            renderEnvSelector()
                        )}
                    </div>
                </div>
            )}
            <div className="flex column left environment-routes-container top">{renderEnvsNav()}</div>
        </div>
    )
}

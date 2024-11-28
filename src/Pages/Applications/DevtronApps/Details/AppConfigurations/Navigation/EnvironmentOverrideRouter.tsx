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

import { useState, useEffect, Fragment } from 'react'
import { useParams, useLocation, useRouteMatch, NavLink, Link } from 'react-router-dom'
import {
    EnvResourceType,
    showError,
    DeleteDialog,
    ConfirmationDialog,
    InfoColourBar,
    PopupMenu,
    Progressing,
    getEnvironmentListMinPublic,
    ToastVariantType,
    ToastManager,
    SelectPicker,
} from '@devtron-labs/devtron-fe-common-lib'
import { URLS, DOCUMENTATION } from '../../../../../../config'
import { usePrevious, createClusterEnvGroup } from '../../../../../../components/common'
import { addJobEnvironment, deleteJobEnvironment, getCIConfig } from '../../../../../../services/service'
import { ReactComponent as Help } from '../../../../../../assets/icons/ic-help.svg'
import { ReactComponent as Add } from '../../../../../../assets/icons/ic-add.svg'
import { ReactComponent as More } from '../../../../../../assets/icons/ic-more-option.svg'
import { ReactComponent as DeleteIcon } from '../../../../../../assets/icons/ic-delete-interactive.svg'
import { ReactComponent as ProtectedIcon } from '../../../../../../assets/icons/ic-shield-protect-fill.svg'
import warn from '../../../../../../assets/icons/ic-warning.svg'
import { JobEnvOverrideRouteProps } from '../AppConfig.types'
import { RESOURCE_ACTION_MENU } from '../../../../../../components/ResourceBrowser/Constants'
import { renderNavItem } from './Navigation.helper'
import { useAppConfigurationContext } from '../AppConfiguration.provider'

const EnvOverridesHelpNote = () => (
    <div className="fs-12 fw-4 lh-18">
        Environment overrides allow you to manage environment specific configurations after you’ve created deployment
        pipelines. &nbsp;
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

// TODO: need to verify this
const JobEnvOverrideRoute = ({ envOverride, ciPipelines, reload, isEnvProtected }: JobEnvOverrideRouteProps) => {
    const { url } = useRouteMatch()
    const { appId, workflowsRes } = useAppConfigurationContext()
    const [showConfirmationDialog, setConfirmationDialog] = useState(false)
    const [showDelete, setDeleteView] = useState(false)
    const [deletePipeline, setDeletePipeline] = useState()

    const deleteEnvHandler = () => {
        const requestBody = { envId: envOverride.environmentId, appId }
        deleteJobEnvironment(requestBody)
            .then(() => {
                ToastManager.showToast({
                    variant: ToastVariantType.success,
                    description: 'Deleted Successfully',
                })
                reload()
                setDeleteView(false)
            })
            .catch((error) => {
                showError(error)
            })
    }

    const handleDeleteConfirmation = () => {
        setDeleteView(false)
        deleteEnvHandler()
    }

    const handleCancelDelete = () => {
        setDeleteView(false)
        setDeletePipeline(null)
    }

    const handleViewPipeline = () => {
        setDeleteView(false)
    }

    const renderDeleteDialog = (): JSX.Element => (
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

    const renderConfirmationDeleteModal = (pipeline, path: string): JSX.Element => (
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
                <button
                    type="button"
                    onClick={handleDeleteConfirmation}
                    className="cta delete cta-cd-delete-modal ml-16"
                >
                    Delete Anyway
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )

    const showDeleteDialog = (pipeline): JSX.Element => {
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

    const toggleDeleteDialog = (e) => {
        e.stopPropagation()
        setDeleteView(true)
        const pipeline = ciPipelines?.find((env) => env.environmentId === envOverride.environmentId)
        if (pipeline) {
            setConfirmationDialog(true)
            setDeletePipeline(pipeline)
        }
    }

    const deletePopUpMenu = (): JSX.Element => (
        <PopupMenu autoClose>
            <PopupMenu.Button rootClassName="flex" isKebab>
                <More className="icon-dim-16 fcn-6" data-testid="popup-env-delete-button" />
            </PopupMenu.Button>
            <PopupMenu.Body rootClassName="dc__border pt-4 pb-4 w-100px">
                <div className="fs-13 fw-4 lh-20">
                    <button
                        type="button"
                        className="dc__unset-button-styles w-100 flex left h-32 cursor pl-12 pr-12 cr-5 dc__hover-n50"
                        onClick={toggleDeleteDialog}
                        data-testid="delete-jobs-environment-link"
                    >
                        <DeleteIcon className="icon-dim-16 mr-8 scr-5" />
                        {RESOURCE_ACTION_MENU.delete}
                    </button>
                </div>
            </PopupMenu.Body>
        </PopupMenu>
    )

    return (
        <div className="flexbox dc__align-items-center dc__content-space pr-8">
            <NavLink
                data-testid="env-deployment-template"
                className="app-compose__nav-item  app-compose__nav-item--job cursor dc__gap-8"
                to={`${URLS.APP_ENV_OVERRIDE_CONFIG}/${envOverride.environmentId}/${EnvResourceType.ConfigMap}`}
            >
                <span className="dc__truncate">{envOverride.environmentName}</span>
                {isEnvProtected && <ProtectedIcon className="icon-dim-20 fcv-5" />}
            </NavLink>
            {deletePopUpMenu()}
            {showDelete && showDeleteDialog(deletePipeline)}
        </div>
    )
}

const EnvironmentOverrideRouter = () => {
    const { pathname } = useLocation()
    const { appId } = useParams<{ appId: string }>()
    const previousPathName = usePrevious(pathname)
    const [environmentOptions, setEnvironmentOptions] = useState([])
    const [addEnvironment, setEnvironmentView] = useState(true)
    const [ciPipelines, setCIPipelines] = useState([])
    const [isEnvLoading, setIsEnvLoading] = useState(false)

    const { isJobView, getWorkflows, reloadEnvironments, environments } = useAppConfigurationContext()

    const getJobOtherEnvironment = async () => {
        setIsEnvLoading(true)
        try {
            const [{ result: envListMinRes }, { result: ciConfigRes }] = await Promise.all([
                getEnvironmentListMinPublic(),
                getCIConfig(Number(appId)),
            ])
            const list = []
            envListMinRes?.forEach((env) => {
                if (env.cluster_name !== 'default_cluster' && env.isClusterCdActive) {
                    list.push({ ...env, value: env.id, clusterName: env.cluster_name, label: env.environment_name })
                }
            })
            setEnvironmentOptions(createClusterEnvGroup(list, 'clusterName'))
            setCIPipelines(ciConfigRes?.ciPipelines)
        } catch (err) {
            showError(err)
        } finally {
            setIsEnvLoading(false)
        }
    }

    const reloadEnvData = () => {
        if (isJobView) {
            getJobOtherEnvironment()
                .then(() => {})
                .catch(() => {})
        }
        reloadEnvironments()
    }

    useEffect(() => {
        if (
            previousPathName &&
            ((previousPathName.includes('/cd-pipeline') && !pathname.includes('/cd-pipeline')) ||
                // This is a serious potential bug. Need to handle this properly
                (previousPathName.includes(URLS.LINKED_CD) && !pathname.includes(URLS.LINKED_CD)) ||
                (isJobView && previousPathName.includes('/pre-build') && !pathname.includes('/pre-build')) ||
                (isJobView && previousPathName.includes('/build') && !pathname.includes('/build')))
        ) {
            reloadEnvData()
            getWorkflows()
        }
    }, [pathname])

    useEffect(() => {
        if (isJobView) {
            getJobOtherEnvironment()
                .then(() => {})
                .catch(() => {})
        }
    }, [appId])

    const selectEnvironment = async (selection) => {
        try {
            setIsEnvLoading(true)
            setEnvironmentView(!addEnvironment)
            const requestBody = { envId: selection.id, appId }
            await addJobEnvironment(requestBody)
            ToastManager.showToast({
                variant: ToastVariantType.success,
                description: 'Saved Successfully',
            })
            reloadEnvData()
        } catch (error) {
            showError(error)
        } finally {
            setIsEnvLoading(false)
        }
    }

    const handleAddEnvironment = () => {
        setEnvironmentView(!addEnvironment)
    }

    const renderEnvSelector = (): JSX.Element => (
        <SelectPicker
            inputId="job-pipeline-environment-dropdown"
            autoFocus
            menuIsOpen
            isSearchable
            placeholder="Select Environment"
            classNamePrefix="job-pipeline-environment-dropdown"
            options={environmentOptions}
            value={environmentOptions.find((env) => env.value === -1)}
            getOptionLabel={(option) => `${option.label}`}
            getOptionValue={(option) => `${option.value}`}
            onChange={selectEnvironment}
            onBlur={handleAddEnvironment}
        />
    )

    const renderEnvsNav = (): JSX.Element => {
        if (environments.length) {
            return (
                <div className="w-100" style={{ height: 'calc(100% - 60px)' }} data-testid="env-override-list">
                    {environments.map(
                        (env) =>
                            !env.deploymentAppDeleteRequest && (
                                <Fragment key={env.environmentId}>
                                    {isJobView ? (
                                        <JobEnvOverrideRoute
                                            key={env.environmentName}
                                            envOverride={env}
                                            ciPipelines={ciPipelines}
                                            reload={reloadEnvData}
                                            // isEnvProtected={env.isProtected}
                                        />
                                    ) : (
                                        renderNavItem(
                                            {
                                                title: env.environmentName,
                                                // isProtectionAllowed: env.isProtected,
                                                href: `${URLS.APP_ENV_OVERRIDE_CONFIG}/${env.environmentId}/${EnvResourceType.DeploymentTemplate}`,
                                            },
                                            // env.isProtected,
                                        )
                                    )}
                                </Fragment>
                            ),
                    )}
                </div>
            )
        }
        if (!isJobView) {
            return (
                <InfoColourBar
                    classname="question-bar no-env-overrides"
                    message={<EnvOverridesHelpNote />}
                    Icon={Help}
                    iconClass="fcv-5"
                    iconSize={16}
                />
            )
        }
        return null
    }

    return (
        <div className="h-100">
            <div className="dc__border-bottom-n1 mt-8 mb-8" />
            <div className="app-compose__nav-item routes-container-header flex dc__uppercase no-hover">
                Environment Overrides
            </div>
            {isJobView &&
                (addEnvironment ? (
                    <button
                        type="button"
                        className="px-8 py-6 flexbox dc__align-items-center dc__content-space dc__gap-8 dc__unset-button-styles w-100"
                        onClick={handleAddEnvironment}
                    >
                        <span className="fw-6 fs-13 lh-20 cb-5">Add Environment</span>
                        <Add className="icon-dim-16 fcb-5" />
                    </button>
                ) : (
                    renderEnvSelector()
                ))}
            {isEnvLoading ? (
                <Progressing styles={{ height: '80px' }} />
            ) : (
                (!!environments.length || !isJobView) && (
                    <div className="flex column left environment-routes-container top">{renderEnvsNav()}</div>
                )
            )}
        </div>
    )
}

export default EnvironmentOverrideRouter

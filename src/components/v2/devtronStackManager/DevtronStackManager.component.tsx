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

import React, { useEffect, useState } from 'react'
import { NavLink, RouteComponentProps, useHistory, useLocation } from 'react-router-dom'
import {
    showError,
    Progressing,
    VisibleModal,
    Checkbox,
    CHECKBOX_VALUE,
    Toggle,
    ConfirmationDialog,
    IMAGE_SCAN_TOOL,
    PageHeader,
    GenericFilterEmptyState,
    useMainContext,
    ToastManager,
    ToastVariantType,
    TOAST_ACCESS_DENIED,
    MarkDown,
    Button,
} from '@devtron-labs/devtron-fe-common-lib'
import Tippy from '@tippyjs/react'
import {
    InstallationType,
    InstallationWrapperType,
    ModuleDetails,
    ModuleDetailsCardType,
    ModuleDetailsViewType,
    ModuleInstallationStatusType,
    ModuleListingViewType,
    ModuleStatus,
    StackManagerNavItemType,
    StackManagerNavLinkType,
    StackManagerPageHeaderType,
    ModuleEnableType,
} from './DevtronStackManager.type'
import { ReactComponent as DiscoverIcon } from '../../../assets/icons/ic-compass.svg'
import { ReactComponent as InstalledIcon } from '../../../assets/icons/ic-check.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as InstallIcon } from '../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as RetryInstallIcon } from '../../../assets/icons/ic-arrow-clockwise.svg'
import { ReactComponent as SuccessIcon } from '../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as UpToDateIcon } from '../../../assets/icons/ic-celebration.svg'
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { ReactComponent as Info } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'
import { ReactComponent as Note } from '../../../assets/icons/ic-note.svg'
import { ReactComponent as CloseIcon } from '../../../assets/icons/ic-close.svg'
import { DOCUMENTATION, MODULE_STATUS, MODULE_TYPE_SECURITY, ModuleNameMap, URLS } from '../../../config'
import Carousel from '../../common/Carousel/Carousel'
import {
    AboutSection,
    DEVTRON_UPGRADE_MESSAGE,
    handleAction,
    isLatestVersionAvailable,
    MODULE_CONFIGURATION_DETAIL_MAP,
    ModulesSection,
    MORE_MODULE_DETAILS,
    OTHER_INSTALLATION_IN_PROGRESS_MESSAGE,
    PENDING_DEPENDENCY_MESSAGE,
    handleEnableAction,
} from './DevtronStackManager.utils'
import './devtronStackManager.component.scss'
import trivy from '../../../assets/icons/ic-clair-to-trivy.svg'
import clair from '../../../assets/icons/ic-trivy-to-clair.svg'
import warn from '../../../assets/icons/ic-error-medium.svg'
import { SuccessModalComponent } from './SuccessModalComponent'
import { EMPTY_STATE_STATUS } from '../../../config/constantMessaging'
import { getShowStackManager } from 'src/utils'

const getInstallationStatusLabel = (
    installationStatus: ModuleStatus,
    enableStatus: boolean,
    dataTestId: string,
): JSX.Element => {
    if (installationStatus === ModuleStatus.INSTALLING) {
        return (
            <div
                data-testid={`module-details-card-status-${installationStatus}`}
                className={`module-details__installation-status flex ${installationStatus}`}
            >
                <Progressing size={20} />
                <span className="fs-13 fw-6 ml-8" data-testid={`status-${dataTestId}`}>
                    Installing
                </span>
            </div>
        )
    }
    if (installationStatus === ModuleStatus.INSTALLED) {
        return (
            <div className={`module-details__installation-status flex column ${installationStatus}`}>
                <div className="flex">
                    <InstalledIcon className="icon-dim-20" />
                    <span className="fs-13 fw-6 ml-8 " data-testid={`status-${dataTestId}`}>
                        {MODULE_STATUS.Installed}
                    </span>
                </div>
                {!enableStatus && (
                    <span className="fs-12 ml-8 mb-20 fw-400 cn-7 ml-13" data-testid={`enable-status-${dataTestId}`}>
                        {MODULE_STATUS.NotEnabled}
                    </span>
                )}
            </div>
        )
    }
    if (installationStatus === ModuleStatus.INSTALL_FAILED || installationStatus === ModuleStatus.TIMEOUT) {
        return (
            <div className="module-details__installation-status flex installFailed">
                <ErrorIcon className="icon-dim-20" />
                <span className="fs-13 fw-6 ml-8" data-testid={`status-${dataTestId}`}>
                    {MODULE_STATUS.Failed}
                </span>
            </div>
        )
    }

    return <></>
}

const ModuleDetailsCard = ({
    moduleDetails,
    className,
    handleModuleCardClick,
    fromDiscoverModules,
    dataTestId,
}: ModuleDetailsCardType): JSX.Element => {
    const handleOnClick = (): void => {
        if (moduleDetails.installationStatus === ModuleStatus.UNKNOWN) {
            ToastManager.showToast({
                variant: ToastVariantType.error,
                title: 'Unknown integration status',
                description: 'There was an error fetching the integration status. Please try again later.',
            })
        } else if (handleModuleCardClick) {
            handleModuleCardClick(moduleDetails, fromDiscoverModules)
        }
    }
    return (
        <div
            data-testid="module-details-card"
            className={`module-details__card flex left column br-8 p-16 mr-20 mb-20 ${className || ''}`}
            onClick={handleOnClick}
        >
            {getInstallationStatusLabel(
                moduleDetails.installationStatus,
                moduleDetails?.moduleType === MODULE_TYPE_SECURITY ? moduleDetails.enabled : true,
                dataTestId,
            )}
            <img className="module-details__card-icon mb-16" src={moduleDetails.icon} alt={moduleDetails.title} />
            <div className="module-details__card-name fs-16 fw-4 cn-9 mb-4" data-testid={`title-${dataTestId}`}>
                {moduleDetails.title}
            </div>
            <div className="module-details__card-info dc__ellipsis-right__2nd-line fs-13 fw-4 cn-7 lh-20">
                {moduleDetails.name === MORE_MODULE_DETAILS.name ? (
                    <>
                        You can&nbsp;
                        <a
                            href="https://github.com/devtron-labs/devtron/issues/new/choose"
                            className="cb-5 fw-6"
                            target="_blank"
                            rel="noreferrer noopener"
                        >
                            submit a ticket
                        </a>
                        &nbsp;to request an integration
                    </>
                ) : (
                    moduleDetails.info
                )}
            </div>
        </div>
    )
}

export const ModulesListingView = ({
    modulesList,
    isDiscoverModulesView,
    handleModuleCardClick,
}: ModuleListingViewType): JSX.Element => {
    if (modulesList.length === 0 && !isDiscoverModulesView) {
        return <NoIntegrationsInstalledView />
    }

    return (
        <div className="flexbox flex-wrap left p-20">
            {modulesList.map((module, idx) => {
                return (
                    <ModuleDetailsCard
                        key={`module-details__card-${idx}`}
                        moduleDetails={module}
                        className="cursor"
                        handleModuleCardClick={handleModuleCardClick}
                        fromDiscoverModules={isDiscoverModulesView}
                        dataTestId={`module-card-${idx}`}
                    />
                )
            })}
            {isDiscoverModulesView && (
                <ModuleDetailsCard
                    moduleDetails={MORE_MODULE_DETAILS}
                    className="more-integrations__card"
                    fromDiscoverModules={isDiscoverModulesView}
                />
            )}
        </div>
    )
}

const getUpdateStatusLabel = (
    installationStatus: ModuleStatus,
    currentVersion: string,
    newVersion: string,
    showInitializing: boolean,
): JSX.Element | null => {
    let updateStatusLabel = null

    if (installationStatus === ModuleStatus.UPGRADING) {
        updateStatusLabel = <span className="dc__loading-dots">{showInitializing ? 'Initializing' : 'Updating'}</span>
    } else if (installationStatus === ModuleStatus.UPGRADE_FAILED || installationStatus === ModuleStatus.TIMEOUT) {
        updateStatusLabel = 'Update failed'
    } else if (installationStatus !== ModuleStatus.UNKNOWN && isLatestVersionAvailable(currentVersion, newVersion)) {
        updateStatusLabel = 'Update available'
    }

    return updateStatusLabel ? (
        <>
            <span className="dc__bullet ml-4 mr-4" />
            {updateStatusLabel}
        </>
    ) : null
}

export const NavItem = ({
    installedModulesCount,
    installationStatus,
    currentVersion,
    newVersion,
    handleTabChange,
    showInitializing,
    showVersionInfo,
}: StackManagerNavItemType): JSX.Element => {
    const { currentServerInfo, licenseData } = useMainContext()

    const getNavLink = (route: StackManagerNavLinkType): JSX.Element => {
        return (
            <NavLink
                to={`${route.href}`}
                key={route.href}
                className={`stack-manager__navlink ${route.className}`}
                activeClassName="active-route"
                {...(route.name === 'About Devtron' && { onClick: () => handleTabChange(0) })}
            >
                <div className="flex left">
                    <route.icon className="stack-manager__navlink-icon icon-dim-20" />
                    {route.name !== 'Installed' && route.name !== 'About Devtron' && (
                        <span data-testid={`${route.name.toLowerCase()}-link`} className="fs-13 ml-12">
                            {route.name}
                        </span>
                    )}
                    {route.name === 'Installed' && (
                        <div
                            data-testid="installed-link"
                            className="installed-modules-link flex dc__content-space ml-12"
                            style={{ width: '175px' }}
                        >
                            <span className="fs-13">{route.name}</span>
                            <span className="badge">{installedModulesCount || 0}</span>
                        </div>
                    )}
                    {route.name === 'About Devtron' && (
                        <div data-testid="about-devtron-link" className="about-devtron ml-12">
                            <span className="fs-13">{route.name}</span>
                            <br />
                            {showVersionInfo && (
                                <span className="fs-11 fw-4 cn-9 flex left">
                                    {currentVersion}
                                    {getUpdateStatusLabel(
                                        installationStatus,
                                        currentVersion,
                                        newVersion,
                                        showInitializing,
                                    )}
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </NavLink>
        )
    }

    const showAboutDevtronTab = getShowStackManager(currentServerInfo?.serverInfo?.installationType, !!licenseData)

    return (
        <div className="flex column left">
            <div className="section-heading cn-6 fs-12 fw-6 pl-8 mb-8 dc__uppercase">Integrations</div>
            {ModulesSection.map((route) => getNavLink(route))}
            {showAboutDevtronTab && (
                <>
                    <hr className="mt-8 mb-8 w-100 checklist__divider" />
                    {getNavLink(AboutSection)}
                </>
            )}
        </div>
    )
}

export const StackPageHeader = ({
    detailsMode,
    selectedModule,
    handleBreadcrumbClick,
}: StackManagerPageHeaderType): JSX.Element => {
    const history = useHistory()

    const handleRedirectToModule = (detailsMode) => {
        const url =
            detailsMode === 'discover' ? URLS.STACK_MANAGER_DISCOVER_MODULES : URLS.STACK_MANAGER_INSTALLED_MODULES
        history.push(url)
    }

    const renderBreadcrumbs = (headerTitleName, detailsMode) => {
        return (
            <div data-testid="module-details-header" className="m-0 flex left ">
                <div onClick={() => handleRedirectToModule(detailsMode)} className="dc__devtron-breadcrumb__item">
                    <span className="cb-5 fs-16 cursor">{headerTitleName} </span>
                </div>
                <span className="fs-16 cn-9 ml-4 mr-4"> / </span>
                <span className="fs-16 cn-9">{selectedModule?.title}</span>
            </div>
        )
    }
    return (
        <>
            {!detailsMode && <PageHeader headerName="Devtron Stack Manager" />}
            {detailsMode === 'discover' && (
                <PageHeader isBreadcrumbs breadCrumbs={() => renderBreadcrumbs('Discover integrations', 'discover')} />
            )}
            {detailsMode === 'installed' && (
                <PageHeader
                    isBreadcrumbs
                    breadCrumbs={() => renderBreadcrumbs('Installed integrations', 'installed')}
                />
            )}
        </>
    )
}

const getProgressingLabel = (isUpgradeView: boolean, canViewLogs: boolean, logPodName: string): string => {
    if (isUpgradeView && (!canViewLogs || (canViewLogs && logPodName))) {
        return 'Updating'
    }
    if (!isUpgradeView && logPodName) {
        return 'Installing'
    }

    return 'Initializing'
}
export const EnableModuleConfirmation = ({
    moduleDetails,
    setDialog,
    retryState,
    setRetryState,
    setToggled,
    setSuccessState,
    moduleNotEnabledState,
}: ModuleEnableType) => {
    const [progressing, setProgressing] = useState<boolean>(false)

    const handleCancelAction = () => {
        setDialog(false)
        setToggled(false)
    }
    const handleEnableActionButton = () => {
        setProgressing(true)
        handleEnableAction(
            moduleDetails.name,
            setRetryState,
            setSuccessState,
            setDialog,
            moduleNotEnabledState,
            setProgressing,
        )
    }
    const isModuleTrivy = moduleDetails.name === ModuleNameMap.SECURITY_TRIVY
    return (
        <ConfirmationDialog>
            <ConfirmationDialog.Icon
                src={retryState ? warn : isModuleTrivy ? trivy : clair}
                className={retryState ? 'w-40 mb-24' : `w-50 mb-24`}
            />
            <ConfirmationDialog.Body
                title={`${retryState ? 'Could not' : ''} Enable ${
                    isModuleTrivy ? IMAGE_SCAN_TOOL.Trivy : IMAGE_SCAN_TOOL.Clair
                } ${retryState ? '' : 'integration'}`}
            />
            <p className="fs-14 cn-7 lh-1-54 mb-12 ">
                {retryState
                    ? 'This integration could not be enabled. Please try again after some time.'
                    : `Only one Vulnerability scanning integration can be used at a time.`}
            </p>
            {!retryState && (
                <p className="fs-14 cn-7 lh-1-54">
                    Enabling this integration will automatically disable the other integration. Are you sure you want to
                    continue?
                </p>
            )}
            <ConfirmationDialog.ButtonGroup>
                <button
                    type="button"
                    className="cta cancel h-36 flex"
                    onClick={handleCancelAction}
                    data-testid="module-cancel-button"
                >
                    Cancel
                </button>
                <button
                    className="cta form-submit-cta ml-12 dc__no-decor form-submit-cta flex h-36 "
                    onClick={handleEnableActionButton}
                    data-testid="enable-button"
                >
                    {progressing ? (
                        <Progressing />
                    ) : retryState ? (
                        'Retry'
                    ) : (
                        `Enable ${isModuleTrivy ? IMAGE_SCAN_TOOL.Trivy : IMAGE_SCAN_TOOL.Clair}`
                    )}
                </button>
            </ConfirmationDialog.ButtonGroup>
        </ConfirmationDialog>
    )
}

const InstallationStatus = ({
    installationStatus,
    appName,
    canViewLogs,
    logPodName,
    isUpgradeView,
    latestVersionAvailable,
    isCICDModule,
    moduleDetails,
    setShowResourceStatusModal,
    isSuperAdmin,
    setSelectedModule,
    setStackDetails,
    stackDetails,
    dialog,
    setDialog,
    toggled,
    setToggled,
    retryState,
    setRetryState,
    successState,
    setSuccessState,
}: ModuleInstallationStatusType): JSX.Element => {
    const openCheckResourceStatusModal = (e) => {
        e.stopPropagation()

        if (setShowResourceStatusModal) {
            setShowResourceStatusModal(true)
        }
    }
    const [moduleNotEnabled, moduleNotEnabledState] = useState<boolean>(
        moduleDetails &&
            moduleDetails.enabled === false &&
            moduleDetails.installationStatus === ModuleStatus.INSTALLED &&
            moduleDetails.moduleType === MODULE_TYPE_SECURITY,
    )
    const renderTransitonToggle = () => {
        ToastManager.showToast({
            variant: ToastVariantType.notAuthorized,
            description: TOAST_ACCESS_DENIED.SUBTITLE,
        })
        setToggled(true)
        setTimeout(() => {
            setToggled(false)
        }, 1000)
    }
    const handleToggleButton = () => {
        if (isSuperAdmin) {
            setToggled(true)
            setDialog(true)
        } else {
            renderTransitonToggle()
        }
    }
    return (
        <div
            className={`module-details__installtion-status cn-9 br-4 fs-13 fw-6 mb-16 status-${
                moduleNotEnabled ? 'notEnabled ' : `${installationStatus} `
            } ${isUpgradeView ? 'upgrade' : ''}`}
        >
            {dialog && (
                <EnableModuleConfirmation
                    moduleDetails={moduleDetails}
                    setDialog={setDialog}
                    retryState={retryState}
                    setRetryState={setRetryState}
                    setToggled={setToggled}
                    setSuccessState={setSuccessState}
                    moduleNotEnabledState={moduleNotEnabledState}
                />
            )}
            {successState && (
                <SuccessModalComponent
                    moduleDetails={moduleDetails}
                    setSuccessState={setSuccessState}
                    setSelectedModule={setSelectedModule}
                    setStackDetails={setStackDetails}
                    stackDetails={stackDetails}
                    setToggled={setToggled}
                />
            )}
            {(installationStatus === ModuleStatus.INSTALLING || installationStatus === ModuleStatus.UPGRADING) && (
                <>
                    <Progressing size={24} />
                    <div data-testid="module-status-progressing" className="mt-12 dc__loading-dots">
                        {getProgressingLabel(isUpgradeView, canViewLogs, logPodName)}
                    </div>
                </>
            )}

            {(installationStatus === ModuleStatus.INSTALLED ||
                (installationStatus === ModuleStatus.HEALTHY && !latestVersionAvailable)) && (
                <>
                    {isUpgradeView ? (
                        <div
                            data-testid="module-status-updated"
                            className="module-details__upgrade-success flex column"
                        >
                            <UpToDateIcon className="icon-dim-40" />
                            <span className="mt-12">You're using the latest version of Devtron.</span>
                        </div>
                    ) : (
                        <div className="flexbox">
                            <div className="module-details__installtion-success flex left dc__content-space">
                                <div>
                                    <span className="flexbox column left" data-testid="module-status-installed">
                                        <SuccessIcon className="icon-dim-20 mr-12" /> Installed
                                    </span>
                                    {moduleNotEnabled ? (
                                        <div className="fs-12 fw-4 cn-7 ml-30 flex left">
                                            <span data-testid="module-not-enabled">Not enabled</span>
                                        </div>
                                    ) : (
                                        ''
                                    )}
                                </div>
                            </div>
                            {moduleNotEnabled ? (
                                <Tippy className="default-tt" arrow placement="top" content="Enable integration">
                                    <div className="ml-auto" style={{ width: '30px', height: '19px' }}>
                                        <Toggle
                                            dataTestId="toggle-button"
                                            onSelect={handleToggleButton}
                                            selected={toggled}
                                        />
                                    </div>
                                </Tippy>
                            ) : (
                                ''
                            )}
                        </div>
                    )}
                </>
            )}
            {(installationStatus === ModuleStatus.INSTALL_FAILED ||
                installationStatus === ModuleStatus.UPGRADE_FAILED ||
                installationStatus === ModuleStatus.TIMEOUT ||
                installationStatus === ModuleStatus.UNKNOWN) && (
                <div data-testid="module-status-failed" className="module-details__installtion-failed flex left">
                    <ErrorIcon className="icon-dim-20 mr-12" />
                    {installationStatus === ModuleStatus.UNKNOWN
                        ? 'Last update status: Unknown'
                        : `${isUpgradeView ? 'Update' : 'Installation'} ${
                              installationStatus === ModuleStatus.TIMEOUT ? 'request timed out' : 'failed'
                          }`}
                </div>
            )}
            {!isCICDModule &&
                moduleDetails &&
                (installationStatus == ModuleStatus.INSTALLING || installationStatus === ModuleStatus.TIMEOUT) && (
                    <a
                        className={`mt-8 dc__no-decor fs-13 fw-6 cursor ${
                            installationStatus === ModuleStatus.INSTALLING ? '' : 'ml-32'
                        }`}
                        onClick={openCheckResourceStatusModal}
                    >
                        Check resource status
                    </a>
                )}
            {appName &&
                installationStatus !== ModuleStatus.NOT_INSTALLED &&
                installationStatus !== ModuleStatus.INSTALLED &&
                installationStatus !== ModuleStatus.HEALTHY && (
                    <div
                        className={`mt-4 ${
                            installationStatus !== ModuleStatus.INSTALLING &&
                            installationStatus !== ModuleStatus.UPGRADING
                                ? 'ml-33'
                                : ''
                        }`}
                    >
                        {isUpgradeView && !canViewLogs && (
                            <NavLink
                                to={`${URLS.APP}/${URLS.EXTERNAL_APPS}/1%7Cdevtroncd%7C${appName}/${appName}/${URLS.APP_DETAILS}`}
                                target="_blank"
                            >
                                View details
                            </NavLink>
                        )}
                        {((isUpgradeView && canViewLogs) || (!isUpgradeView && isCICDModule)) && logPodName && (
                            <NavLink
                                to={`${URLS.APP}/${URLS.EXTERNAL_APPS}/1%7Cdevtroncd%7C${appName}/${appName}/${URLS.APP_DETAILS}/${URLS.APP_DETAILS_K8}/pod/${logPodName}/logs`}
                                target="_blank"
                            >
                                View logs
                            </NavLink>
                        )}
                    </div>
                )}
            {(installationStatus === ModuleStatus.INSTALLING || installationStatus === ModuleStatus.UPGRADING) && (
                <p className="module-details__installtion-note fs-12 fw-4 bcn-1 br-4">
                    NOTE: You can continue using Devtron. The {isUpgradeView ? 'update' : 'installation'} will continue
                    in the background.
                </p>
            )}
        </div>
    )
}

const GetHelpCard = (): JSX.Element => {
    return (
        <div className="module-details__get-help flex column top left br-4 cn-9 fs-13 mb-16">
            <span className="fw-6 mb-10">Facing issues?</span>
            <a
                className="module-details__help-chat cb-5 flex left"
                href="https://discord.devtron.ai/"
                target="_blank"
                rel="noreferrer noopener"
            >
                <Chat className="icon-dim-20 mr-12" /> Chat with support
            </a>
        </div>
    )
}

const ModuleUpdateNote = (): JSX.Element => {
    return (
        <div className="module-details__update-note br-4 cn-9 fs-13 mb-16">
            <div className="fs-4 mb-8">Integrations are updated along with Devtron updates.</div>
            <div className="fs-6">
                <NavLink to={URLS.STACK_MANAGER_ABOUT} className="fw-6">
                    Check for Devtron updates
                </NavLink>
            </div>
        </div>
    )
}

export const handleError = (err: any, isUpgradeView?: boolean): void => {
    if (err.code === 403) {
        ToastManager.showToast({
            variant: ToastVariantType.notAuthorized,
            description: `Only super-admin users can ${isUpgradeView ? 'update Devtron' : 'install integrations'}.`,
        })
    } else {
        showError(err)
    }
}

export const InstallationWrapper = ({
    modulesList,
    moduleDetails,
    moduleName,
    installationStatus,
    canViewLogs,
    logPodName,
    serverInfo,
    upgradeVersion,
    baseMinVersionSupported,
    isUpgradeView,
    isActionTriggered,
    releaseNotes,
    updateActionTrigger,
    showPreRequisiteConfirmationModal,
    setShowPreRequisiteConfirmationModal,
    preRequisiteChecked,
    setPreRequisiteChecked,
    setShowResourceStatusModal,
    isSuperAdmin,
    setSelectedModule,
    setStackDetails,
    stackDetails,
    dialog,
    setDialog,
    toggled,
    setToggled,
    retryState,
    setRetryState,
    successState,
    setSuccessState,
}: InstallationWrapperType): JSX.Element => {
    const history: RouteComponentProps['history'] = useHistory()
    const location: RouteComponentProps['location'] = useLocation()
    const latestVersionAvailable = isLatestVersionAvailable(serverInfo?.currentVersion, upgradeVersion)
    const otherInstallationInProgress = modulesList?.some(
        (module) => module.installationStatus === ModuleStatus.INSTALLING && module.name !== moduleName,
    )
    const dependentModuleList =
        modulesList?.filter((module) => moduleDetails.dependentModules.indexOf(Number(module.id)) >= 0) || []
    const isPendingDependency =
        !isUpgradeView && dependentModuleList.some((module) => module.installationStatus !== ModuleStatus.INSTALLED)
    const belowMinSupportedVersion = baseMinVersionSupported
        ? isLatestVersionAvailable(serverInfo?.currentVersion, baseMinVersionSupported)
        : false
    const [preRequisiteList, setPreRequisiteList] = useState<
        { version: string; prerequisiteMessage: string; tagLink: string }[]
    >([])

    useEffect(() => {
        if (releaseNotes) {
            fetchPreRequisiteListFromReleaseNotes()
        }
    }, [releaseNotes])

    const fetchPreRequisiteListFromReleaseNotes = () => {
        const _preRequisiteList = []
        for (let index = 0; index < releaseNotes.length; index++) {
            const element = releaseNotes[index]
            if (element.releaseName === serverInfo?.currentVersion) {
                break
            }
            if (element.prerequisite && element.prerequisiteMessage) {
                _preRequisiteList.push({
                    version: element.releaseName,
                    prerequisiteMessage: element.prerequisiteMessage,
                    tagLink: element.tagLink,
                })
            }
        }
        setPreRequisiteList(_preRequisiteList.reverse())
    }

    const handleActionButtonClick = () => {
        if (isActionTriggered) {
        } else if (!isUpgradeView || preRequisiteChecked || preRequisiteList.length === 0) {
            if (!isUpgradeView && (belowMinSupportedVersion || isPendingDependency || otherInstallationInProgress)) {
                return
            }
            setShowPreRequisiteConfirmationModal && setShowPreRequisiteConfirmationModal(false)
            updateActionTrigger(true)
            handleAction(
                moduleName,
                isUpgradeView,
                upgradeVersion,
                updateActionTrigger,
                history,
                location,
                moduleDetails && (moduleDetails.moduleType ? moduleDetails.moduleType : undefined),
            )
        } else {
            setShowPreRequisiteConfirmationModal(true)
        }
    }

    const handlePrerequisiteCheckedChange = (): void => {
        setPreRequisiteChecked(!preRequisiteChecked)
    }

    const hidePrerequisiteConfirmationModal = (): void => {
        setShowPreRequisiteConfirmationModal(false)
        setPreRequisiteChecked(false)
    }

    const renderPrerequisiteConfirmationModal = (): JSX.Element | null => {
        if (!showPreRequisiteConfirmationModal) {
            return null
        }
        return (
            <VisibleModal className="transition-effect">
                <div className="modal__body upload-modal dc__no-top-radius mt-0 p-0 w-600">
                    <div className="flexbox dc__content-space pl-20 pr-20 pt-16 pb-16 dc__border-bottom">
                        <div className="fw-6 fs-16 cn-9">
                            {`Pre-requisites for update to ${upgradeVersion.toLowerCase()}`}
                        </div>
                        <CloseIcon className="pointer mt-2" onClick={hidePrerequisiteConfirmationModal} />
                    </div>
                    <div className="p-20">
                        <div className="fw-6 fs-13 cn-9 mb-12">
                            Please ensure you follow below pre-requisites steps in order.
                        </div>
                        {preRequisiteList.map((preRequisite) => (
                            <div className="fw-4 fs-13 cn-7 mb-12">
                                <div>Pre-requisites for {preRequisite.version}:</div>
                                <MarkDown
                                    className="pre-requisite-modal__mark-down"
                                    breaks
                                    markdown={preRequisite.prerequisiteMessage}
                                />
                                <a className="cb-5" href={preRequisite.tagLink} target="_blank" rel="noreferrer">
                                    View full release note
                                </a>
                            </div>
                        ))}
                        <div className="en-2 bw-1 flexbox dc__content-space pt-8 pr-12 pb-8 pl-12 br-4">
                            <span className="cn-9 fs-13 fw-6">Facing issues?</span>
                            <a
                                className="pre-requisite-modal__help-chat fs-13 cb-5 flex left"
                                href="https://discord.devtron.ai/"
                                target="_blank"
                                rel="noreferrer noopener"
                            >
                                <Chat className="icon-dim-20 mr-12" /> Chat with support
                            </a>
                        </div>
                    </div>
                    <div className="p-16 dc__border-top flexbox dc__content-space">
                        <Checkbox
                            isChecked={preRequisiteChecked}
                            value={CHECKBOX_VALUE.CHECKED}
                            onChange={handlePrerequisiteCheckedChange}
                        >
                            <span className="mr-5 cn-9 fw-4 fs-13">
                                I have completed all pre-requisite steps required for the upgrade
                            </span>
                        </Checkbox>
                        <button
                            onClick={handleActionButtonClick}
                            disabled={!preRequisiteChecked}
                            className="cta ml-12 dc__no-decor"
                        >
                            Update
                        </button>
                    </div>
                </div>
            </VisibleModal>
        )
    }

    const getDisabledButtonTooltip = (): string => {
        if (belowMinSupportedVersion) {
            return DEVTRON_UPGRADE_MESSAGE
        }
        if (otherInstallationInProgress) {
            return OTHER_INSTALLATION_IN_PROGRESS_MESSAGE
        }
        return PENDING_DEPENDENCY_MESSAGE
    }

    const isInstallButtonDisabled =
        !isUpgradeView && (belowMinSupportedVersion || isPendingDependency || otherInstallationInProgress)

    const getUpdateRetryButtonTextAndIcon = (): {
        text: string | null
        Icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>> | null
    } => {
        if (
            installationStatus === ModuleStatus.NOT_INSTALLED ||
            (installationStatus === ModuleStatus.HEALTHY && latestVersionAvailable)
        ) {
            return isUpgradeView
                ? { text: `Update to ${upgradeVersion.toLowerCase()}`, Icon: null }
                : { text: 'Install', Icon: InstallIcon }
        }
        if (
            installationStatus === ModuleStatus.INSTALL_FAILED ||
            installationStatus === ModuleStatus.UPGRADE_FAILED ||
            installationStatus === ModuleStatus.TIMEOUT ||
            installationStatus === ModuleStatus.UNKNOWN
        ) {
            return { text: `Retry ${isUpgradeView ? 'update' : 'install'}`, Icon: RetryInstallIcon }
        }

        return { text: null, Icon: null }
    }

    const { text, Icon } = getUpdateRetryButtonTextAndIcon()

    return (
        <>
            <div className="module-details__install-wrapper">
                {serverInfo?.installationType && serverInfo.installationType === InstallationType.OSS_KUBECTL ? (
                    <NotSupportedNote isUpgradeView={isUpgradeView} />
                ) : (
                    <>
                        {installationStatus !== ModuleStatus.INSTALLING &&
                            installationStatus !== ModuleStatus.UPGRADING &&
                            installationStatus !== ModuleStatus.INSTALLED &&
                            (installationStatus !== ModuleStatus.HEALTHY ||
                                (installationStatus === ModuleStatus.HEALTHY && latestVersionAvailable)) && (
                                <>
                                    {text && (
                                        <Button
                                            dataTestId="install-module-button"
                                            onClick={handleActionButtonClick}
                                            disabled={isInstallButtonDisabled}
                                            isLoading={isActionTriggered}
                                            tooltipProps={{
                                                content: getDisabledButtonTooltip(),
                                            }}
                                            showTooltip={isInstallButtonDisabled}
                                            text={text}
                                            startIcon={Icon ? <Icon /> : null}
                                            fullWidth
                                        />
                                    )}
                                    {isUpgradeView && preRequisiteList.length > 0 && (
                                        <div className="flexbox pt-10 pr-16 pb-10 pl-16 bcy-1 ey-2 bw-1 br-4 mt-12 mb-16">
                                            <Note className="module-details__install-icon icon-dim-16 mt-4 mr-8" />
                                            <div>
                                                <div className="cn-9 fw-6 fs-13">Pre-requisites for this update</div>
                                                <div
                                                    className="cb-5 fw-6 fs-13 pointer"
                                                    onClick={handleActionButtonClick}
                                                >
                                                    View details
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {!isUpgradeView && belowMinSupportedVersion && <UpgradeNote />}
                                </>
                            )}
                        {((installationStatus !== ModuleStatus.NOT_INSTALLED &&
                            installationStatus !== ModuleStatus.HEALTHY) ||
                            (installationStatus === ModuleStatus.HEALTHY && !latestVersionAvailable)) && (
                            <InstallationStatus
                                installationStatus={installationStatus}
                                appName={serverInfo?.releaseName}
                                canViewLogs={canViewLogs}
                                logPodName={logPodName}
                                isUpgradeView={isUpgradeView}
                                latestVersionAvailable={latestVersionAvailable}
                                isCICDModule={moduleName === ModuleNameMap.CICD}
                                moduleDetails={moduleDetails}
                                setShowResourceStatusModal={setShowResourceStatusModal}
                                isSuperAdmin={isSuperAdmin}
                                setSelectedModule={setSelectedModule}
                                setStackDetails={setStackDetails}
                                stackDetails={stackDetails}
                                dialog={dialog}
                                setDialog={setDialog}
                                toggled={toggled}
                                setToggled={setToggled}
                                retryState={retryState}
                                setRetryState={setRetryState}
                                successState={successState}
                                setSuccessState={setSuccessState}
                            />
                        )}
                        {moduleDetails && moduleDetails.isModuleConfigurable && !moduleDetails.isModuleConfigured && (
                            <ModuleNotConfigured moduleName={moduleName} />
                        )}
                        {!isUpgradeView && installationStatus === ModuleStatus.INSTALLED && <ModuleUpdateNote />}
                    </>
                )}
                {serverInfo?.installationType &&
                    (serverInfo.installationType === InstallationType.OSS_KUBECTL ||
                        installationStatus === ModuleStatus.INSTALL_FAILED ||
                        installationStatus === ModuleStatus.UPGRADE_FAILED ||
                        installationStatus === ModuleStatus.TIMEOUT ||
                        installationStatus === ModuleStatus.UNKNOWN) && <GetHelpCard />}
                {!isUpgradeView && modulesList && <DependentModuleList modulesList={dependentModuleList} />}
            </div>
            {renderPrerequisiteConfirmationModal()}
        </>
    )
}

export const ModuleDetailsView = ({
    modulesList,
    moduleDetails,
    setDetailsMode,
    serverInfo,
    upgradeVersion,
    logPodName,
    fromDiscoverModules,
    isActionTriggered,
    handleActionTrigger,
    history,
    location,
    setShowResourceStatusModal,
    isSuperAdmin,
    setSelectedModule,
    setStackDetails,
    stackDetails,
    dialog,
    setDialog,
    retryState,
    setRetryState,
    successState,
    setSuccessState,
    toggled,
    setToggled,
}: ModuleDetailsViewType): JSX.Element | null => {
    useEffect(() => {
        if (!moduleDetails && !new URLSearchParams(location.search).get('id')) {
            setDetailsMode('')
            history.push(
                fromDiscoverModules ? URLS.STACK_MANAGER_DISCOVER_MODULES : URLS.STACK_MANAGER_INSTALLED_MODULES,
            )
        }
    }, [])

    return moduleDetails ? (
        <div className="module-details__view-container pb-40">
            <Carousel className="module-details__carousel" imageUrls={moduleDetails.assets} />
            <div className="module-details__view-wrapper mt-24">
                <div className="module-details__feature-wrapper">
                    <img
                        className="module-details__feature-icon mb-8"
                        src={moduleDetails.icon}
                        alt={moduleDetails.title}
                    />
                    <h2 data-testid="module-details-title" className="module-details__feature-heading cn-9 fs-20 fw-6">
                        {moduleDetails.title}
                    </h2>
                    <div className="module-details__divider mt-24 mb-24" />
                    <MarkDown
                        className="module-details__feature-info fs-14 fw-4 cn-9"
                        breaks
                        markdown={moduleDetails.description}
                    />
                </div>
                <InstallationWrapper
                    modulesList={modulesList}
                    moduleDetails={moduleDetails}
                    moduleName={moduleDetails.name}
                    installationStatus={moduleDetails.installationStatus}
                    serverInfo={serverInfo}
                    upgradeVersion={upgradeVersion}
                    baseMinVersionSupported={moduleDetails.baseMinVersionSupported}
                    logPodName={logPodName}
                    isActionTriggered={isActionTriggered}
                    updateActionTrigger={(isActionTriggered) =>
                        handleActionTrigger(`moduleAction-${moduleDetails.name?.toLowerCase()}`, isActionTriggered)
                    }
                    setShowResourceStatusModal={setShowResourceStatusModal}
                    isSuperAdmin={isSuperAdmin}
                    setSelectedModule={setSelectedModule}
                    setStackDetails={setStackDetails}
                    stackDetails={stackDetails}
                    dialog={dialog}
                    setDialog={setDialog}
                    toggled={toggled}
                    setToggled={setToggled}
                    retryState={retryState}
                    setRetryState={setRetryState}
                    successState={successState}
                    setSuccessState={setSuccessState}
                />
            </div>
        </div>
    ) : null
}

export const NoIntegrationsInstalledView = (): JSX.Element => {
    const history: RouteComponentProps['history'] = useHistory()
    const redirectToDiscoverModules = () => {
        history.push(URLS.STACK_MANAGER_DISCOVER_MODULES)
    }

    const renderDiscoverIntegrationsButton = () => {
        return (
            <button
                type="button"
                className="empty-state__discover-btn flex fs-13 fw-6 br-4"
                onClick={redirectToDiscoverModules}
            >
                <DiscoverIcon className="discover-icon" /> <span className="ml-8">Discover integrations</span>
            </button>
        )
    }

    return (
        <div className="no-integrations__installed-view dc__position-rel">
            <GenericFilterEmptyState
                classname="fs-16"
                title={EMPTY_STATE_STATUS.DEVTRON_STACK_MANAGER.TITLE}
                subTitle={EMPTY_STATE_STATUS.DEVTRON_STACK_MANAGER.SUBTITLE}
                isButtonAvailable
                renderButton={renderDiscoverIntegrationsButton}
            />
        </div>
    )
}

const ModuleNotConfigured = ({ moduleName }: { moduleName: string }): JSX.Element | null => {
    const configNoteDetail = MODULE_CONFIGURATION_DETAIL_MAP[moduleName]
    return (
        <div className="mb-16">
            <div className="pt-10 pr 16 pb-10 pl-16 flex top left br-4 cn-9 bcy-1 ey-2">
                <div className="icon-dim-20 mr-12">
                    <Warning className="icon-dim-20 warning-icon-y7" />
                </div>
                <div>
                    <h2 className="fs-13 fw-6 lh-20 mb-4 mt-0">{configNoteDetail.title}</h2>
                    <NavLink
                        exact
                        to={configNoteDetail.link}
                        activeClassName="active"
                        className="mt-8 dc__no-decor fs-13 fw-6"
                    >
                        {configNoteDetail.linkText}
                    </NavLink>
                </div>
            </div>
        </div>
    )
}

const UpgradeNote = (): JSX.Element => {
    return (
        <div className="mb-16">
            <div className="pt-10 pr 16 pb-10 pl-16 flex top left br-4 cn-9 bcb-1 eb-2">
                <div className="icon-dim-20 mr-12">
                    <Info className="icon-dim-20" />
                </div>
                <div>
                    <p className="fs-13 fw-4 mb-0 lh-20">{DEVTRON_UPGRADE_MESSAGE}</p>
                    <NavLink
                        exact
                        to={URLS.STACK_MANAGER_ABOUT}
                        activeClassName="active"
                        className="mt-8 dc__no-decor fs-13 fw-6"
                    >
                        Check for Devtron updates
                    </NavLink>
                </div>
            </div>
        </div>
    )
}

export const NotSupportedNote = ({ isUpgradeView }: { isUpgradeView: boolean }): JSX.Element => {
    return (
        <div className="not-supported__note-wrapper mb-16">
            <div className="not-supported__note flex top left br-4 cn-9 bcy-1">
                <div className="icon-dim-20 mr-12">
                    <Warning className="not-supported__note-icon icon-dim-20" />
                </div>
                <div>
                    <h2 className="m-0 p-0 fs-13 fw-6 lh-20">
                        {isUpgradeView
                            ? 'Updates from UI are currently not supported for kubectl installations'
                            : 'Integrations are currently not supported for Devtron installed via kubectl'}
                    </h2>
                    <p className="fs-13 fw-4 mb-0 mt-4 lh-20">
                        {isUpgradeView ? (
                            <>
                                Please refer&nbsp;
                                <a
                                    className="cb-5 fw-6"
                                    href={DOCUMENTATION.DEVTRON_UPGRADE}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    steps to upgrade using CLI
                                </a>
                            </>
                        ) : (
                            'This functionality is available only for Devtron installed via Helm charts'
                        )}
                    </p>
                </div>
            </div>
        </div>
    )
}

const DependentModuleList = ({ modulesList }: { modulesList: ModuleDetails[] }): JSX.Element => {
    const history: RouteComponentProps['history'] = useHistory()
    const location: RouteComponentProps['location'] = useLocation()
    const queryParams = new URLSearchParams(location.search)

    const handleModuleCardClick = (moduleDetails: ModuleDetails) => {
        queryParams.set('id', moduleDetails.name)
        history.push(
            `${
                moduleDetails.installationStatus !== ModuleStatus.INSTALLED
                    ? URLS.STACK_MANAGER_DISCOVER_MODULES_DETAILS
                    : URLS.STACK_MANAGER_INSTALLED_MODULES_DETAILS
            }?${queryParams.toString()}`,
        )
    }
    return modulesList?.length ? (
        <div>
            <div className="fs-14 fw-6 cn-9 mb-16 mt-16">Pre-requisite integrations</div>
            {modulesList.map((module, idx) => {
                return (
                    <ModuleDetailsCard
                        key={`module-details__card-${idx}`}
                        moduleDetails={module}
                        className="cursor dependent-module__card"
                        handleModuleCardClick={handleModuleCardClick}
                        fromDiscoverModules={false}
                    />
                )
            })}
        </div>
    ) : null
}

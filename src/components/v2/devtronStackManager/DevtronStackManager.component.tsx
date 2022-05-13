import React, { useEffect } from 'react'
import { NavLink, RouteComponentProps, useHistory, useLocation } from 'react-router-dom'
import {
    ModuleDetailsCardType,
    ModuleStatus,
    ModuleDetailsViewType,
    ModuleListingViewType,
    StackManagerNavItemType,
    StackManagerNavLinkType,
    StackManagerPageHeaderType,
    ModuleInstallationStatusType,
    InstallationWrapperType,
    InstallationType,
} from './DevtronStackManager.type'
import EmptyState from '../../EmptyState/EmptyState'
import { ReactComponent as DiscoverIcon } from '../../../assets/icons/ic-compass.svg'
import { ReactComponent as InstalledIcon } from '../../../assets/icons/ic-check.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as InstallIcon } from '../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as RetyrInstallIcon } from '../../../assets/icons/ic-arrow-clockwise.svg'
import { ReactComponent as SuccessIcon } from '../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as UpToDateIcon } from '../../../assets/icons/ic-celebration.svg'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { ReactComponent as Info } from '../../../assets/icons/info-filled.svg'
import { ReactComponent as Warning } from '../../../assets/icons/ic-warning.svg'

import { Progressing, showError, ToastBody } from '../../common'
import NoIntegrations from '../../../assets/img/empty-noresult@2x.png'
import LatestVersionCelebration from '../../../assets/gif/latest-version-celebration.gif'
import { URLS } from '../../../config'
import Carousel from '../../common/Carousel/Carousel'
import { toast } from 'react-toastify'
import {
    AboutSection,
    handleAction,
    isLatestVersionAvailable,
    ModulesSection,
    MORE_MODULE_DETAILS,
} from './DevtronStackManager.utils'
import { MarkDown } from '../../charts/discoverChartDetail/DiscoverChartDetails'
import './devtronStackManager.component.scss'

const getInstallationStatusLabel = (installationStatus: ModuleStatus): JSX.Element => {
    if (installationStatus === ModuleStatus.INSTALLING) {
        return (
            <div className={`module-details__installation-status flex ${installationStatus}`}>
                <Progressing size={20} />
                <span className="fs-13 fw-6 ml-8">Installing</span>
            </div>
        )
    } else if (installationStatus === ModuleStatus.INSTALLED) {
        return (
            <div className={`module-details__installation-status flex ${installationStatus}`}>
                <InstalledIcon className="icon-dim-20" />
                <span className="fs-13 fw-6 ml-8">Installed</span>
            </div>
        )
    } else if (installationStatus === ModuleStatus.INSTALL_FAILED || installationStatus === ModuleStatus.TIMEOUT) {
        return (
            <div className={`module-details__installation-status flex installFailed`}>
                <ErrorIcon className="icon-dim-20" />
                <span className="fs-13 fw-6 ml-8">Failed</span>
            </div>
        )
    }

    return <></>
}

const ModuleDeailsCard = ({
    moduleDetails,
    className,
    handleModuleCardClick,
    fromDiscoverModules,
}: ModuleDetailsCardType): JSX.Element => {
    return (
        <div
            className={`module-details__card flex left column br-8 p-20 mr-20 mb-20 ${className || ''}`}
            {...(handleModuleCardClick && { onClick: () => handleModuleCardClick(moduleDetails, fromDiscoverModules) })}
        >
            {getInstallationStatusLabel(moduleDetails.installationStatus)}
            <img className="module-details__card-icon mb-16" src={moduleDetails.icon} alt={moduleDetails.title} />
            <div className="module-details__card-name fs-16 fw-6 cn-9 mb-4">{moduleDetails.title}</div>
            <div className="module-details__card-info fs-13 fw-4 cn-7">
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
                    <ModuleDeailsCard
                        key={`module-details__card-${idx}`}
                        moduleDetails={module}
                        className="cursor"
                        handleModuleCardClick={handleModuleCardClick}
                        fromDiscoverModules={isDiscoverModulesView}
                    />
                )
            })}
            {isDiscoverModulesView && (
                <ModuleDeailsCard
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
        updateStatusLabel = <span className="loading-dots">{showInitializing ? 'Initializing' : 'Updating'}</span>
    } else if (installationStatus === ModuleStatus.UPGRADE_FAILED || installationStatus === ModuleStatus.TIMEOUT) {
        updateStatusLabel = 'Update failed'
    } else if (installationStatus !== ModuleStatus.UNKNOWN && isLatestVersionAvailable(currentVersion, newVersion)) {
        updateStatusLabel = 'Update available'
    }

    return updateStatusLabel ? (
        <>
            <span className="bullet ml-4 mr-4" />
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
                    <route.icon className={`stack-manager__navlink-icon icon-dim-20`} />
                    {route.name !== 'Installed' && route.name !== 'About Devtron' && (
                        <span className="fs-13 ml-12">{route.name}</span>
                    )}
                    {route.name === 'Installed' && (
                        <div className="installed-modules-link flex content-space ml-12" style={{ width: '175px' }}>
                            <span className="fs-13">{route.name}</span>
                            <span className="badge">{installedModulesCount || 0}</span>
                        </div>
                    )}
                    {route.name === 'About Devtron' && (
                        <div className="about-devtron ml-12">
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

    return (
        <div className="flex column left">
            <div className="section-heading cn-6 fs-12 fw-6 pl-8 mb-8 text-uppercase">Integrations</div>
            {ModulesSection.map((route) => getNavLink(route))}
            <hr className="mt-8 mb-8 w-100 checklist__divider" />
            {getNavLink(AboutSection)}
        </div>
    )
}

export const PageHeader = ({
    detailsMode,
    selectedModule,
    handleBreadcrumbClick,
}: StackManagerPageHeaderType): JSX.Element => {
    return (
        <section className="page-header flex left">
            {!detailsMode && <div className="flex left page-header__title cn-9 fs-14 fw-6">Devtron Stack Manager</div>}
            {detailsMode === 'discover' && (
                <div className="flex left page-header__title cn-9 fs-14 fw-6">
                    <NavLink to={URLS.STACK_MANAGER_DISCOVER_MODULES} onClick={handleBreadcrumbClick}>
                        Discover integrations
                    </NavLink>
                    <span className="mr-4 ml-4">/</span>
                    <span>{selectedModule?.title}</span>
                </div>
            )}
            {detailsMode === 'installed' && (
                <div className="flex left page-header__title cn-9 fs-14 fw-6">
                    <NavLink to={URLS.STACK_MANAGER_INSTALLED_MODULES} onClick={handleBreadcrumbClick}>
                        Installed integrations
                    </NavLink>
                    <span className="mr-4 ml-4">/</span>
                    <span>{selectedModule?.title}</span>
                </div>
            )}
        </section>
    )
}

const getProgressingLabel = (isUpgradeView: boolean, canViewLogs: boolean, logPodName: string): string => {
    if (isUpgradeView && (!canViewLogs || (canViewLogs && logPodName))) {
        return 'Updating'
    } else if (!isUpgradeView && logPodName) {
        return 'Installing'
    }

    return 'Initializing'
}

const InstallationStatus = ({
    installationStatus,
    appName,
    canViewLogs,
    logPodName,
    isUpgradeView,
    latestVersionAvailable,
}: ModuleInstallationStatusType): JSX.Element => {
    return (
        <div
            className={`module-details__installtion-status cn-9 br-4 fs-13 fw-6 mb-16 status-${installationStatus} ${
                isUpgradeView ? 'upgrade' : ''
            }`}
        >
            {(installationStatus === ModuleStatus.INSTALLING || installationStatus === ModuleStatus.UPGRADING) && (
                <>
                    <Progressing size={24} />
                    <div className="mt-12 loading-dots">
                        {getProgressingLabel(isUpgradeView, canViewLogs, logPodName)}
                    </div>
                </>
            )}
            {(installationStatus === ModuleStatus.INSTALLED ||
                (installationStatus === ModuleStatus.HEALTHY && !latestVersionAvailable)) && (
                <>
                    {isUpgradeView ? (
                        <div className="module-details__upgrade-success flex column">
                            <img src={LatestVersionCelebration} />
                            <UpToDateIcon className="icon-dim-40" />
                            <span className="mt-12">You're using the latest version of Devtron.</span>
                        </div>
                    ) : (
                        <div className="module-details__installtion-success flex left">
                            <SuccessIcon className="icon-dim-20 mr-12" /> Installed
                        </div>
                    )}
                </>
            )}
            {(installationStatus === ModuleStatus.INSTALL_FAILED ||
                installationStatus === ModuleStatus.UPGRADE_FAILED ||
                installationStatus === ModuleStatus.TIMEOUT ||
                installationStatus === ModuleStatus.UNKNOWN) && (
                <div className="module-details__installtion-failed flex left">
                    <ErrorIcon className="icon-dim-20 mr-12" />
                    {installationStatus === ModuleStatus.UNKNOWN
                        ? 'Last update status: Unknown'
                        : `${isUpgradeView ? 'Update' : 'Installation'} ${
                              installationStatus === ModuleStatus.TIMEOUT ? 'request timed out' : 'failed'
                          }`}
                </div>
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
                        {((isUpgradeView && canViewLogs) || !isUpgradeView) && logPodName && (
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
        <div className="module-details__get-help flex column top left br-4 cn-9 fs-13">
            <span className="fw-6 mb-10">Facing issues?</span>
            {/* <a
                className="module-details__help-guide cb-5 flex left"
                href="https://discord.devtron.ai/"
                target="_blank"
                rel="noreferrer noopener"
            >
                <File className="icon-dim-20 mr-12" /> Troubleshooting guide
            </a> */}
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
        <div className="module-details__update-note br-4 cn-9 fs-13">
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
        toast.info(
            <ToastBody
                title="Access denied"
                subtitle={`Only super-admin users can ${isUpgradeView ? 'update Devtron' : 'install integrations'}.`}
            />,
            {
                className: 'devtron-toast unauthorized',
            },
        )
    } else {
        showError(err)
    }
}

export const InstallationWrapper = ({
    moduleName,
    installationStatus,
    canViewLogs,
    logPodName,
    serverInfo,
    upgradeVersion,
    isUpgradeView,
    isActionTriggered,
    updateActionTrigger,
}: InstallationWrapperType): JSX.Element => {
    const history: RouteComponentProps['history'] = useHistory()
    const location: RouteComponentProps['location'] = useLocation()
    const latestVersionAvailable = isLatestVersionAvailable(serverInfo?.currentVersion, upgradeVersion)

    const handleActionButtonClick = () => {
        if (isActionTriggered) {
            return
        } else {
            updateActionTrigger(true)
            handleAction(moduleName, isUpgradeView, upgradeVersion, updateActionTrigger, history, location)
        }
    }

    return (
        <div className="module-details__install-wrapper">
            {serverInfo?.installationType && serverInfo.installationType !== InstallationType.OSS_HELM ? (
                <>
                    {serverInfo.installationType === InstallationType.OSS_KUBECTL && (
                        <NotSupportedNote isUpgradeView={isUpgradeView} />
                    )}
                    {serverInfo.installationType === InstallationType.ENTERPRISE && <ManagedByNote />}
                </>
            ) : (
                <>
                    {installationStatus !== ModuleStatus.INSTALLING &&
                        installationStatus !== ModuleStatus.UPGRADING &&
                        installationStatus !== ModuleStatus.INSTALLED &&
                        (installationStatus !== ModuleStatus.HEALTHY ||
                            (installationStatus === ModuleStatus.HEALTHY && latestVersionAvailable)) && (
                            <button
                                className="module-details__install-button cta flex mb-16"
                                onClick={handleActionButtonClick}
                            >
                                {isActionTriggered && <Progressing />}
                                {!isActionTriggered &&
                                    (installationStatus === ModuleStatus.NOT_INSTALLED ||
                                        (installationStatus === ModuleStatus.HEALTHY && latestVersionAvailable)) && (
                                        <>
                                            {isUpgradeView ? (
                                                `Update to ${upgradeVersion.toLowerCase()}`
                                            ) : (
                                                <>
                                                    <InstallIcon className="module-details__install-icon icon-dim-16 mr-8" />
                                                    Install
                                                </>
                                            )}
                                        </>
                                    )}
                                {!isActionTriggered &&
                                    (installationStatus === ModuleStatus.INSTALL_FAILED ||
                                        installationStatus === ModuleStatus.UPGRADE_FAILED ||
                                        installationStatus === ModuleStatus.TIMEOUT ||
                                        installationStatus === ModuleStatus.UNKNOWN) && (
                                        <>
                                            <RetyrInstallIcon className="module-details__retry-install-icon icon-dim-16 mr-8" />
                                            {`Retry ${isUpgradeView ? 'update' : 'install'}`}
                                        </>
                                    )}
                            </button>
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
                        />
                    )}
                    {!isUpgradeView && installationStatus === ModuleStatus.INSTALLED && <ModuleUpdateNote />}
                </>
            )}
            {serverInfo?.installationType &&
                (serverInfo.installationType === InstallationType.OSS_KUBECTL ||
                    (serverInfo.installationType === InstallationType.OSS_HELM &&
                        (installationStatus === ModuleStatus.INSTALL_FAILED ||
                            installationStatus === ModuleStatus.UPGRADE_FAILED ||
                            installationStatus === ModuleStatus.TIMEOUT ||
                            installationStatus === ModuleStatus.UNKNOWN))) && <GetHelpCard />}
        </div>
    )
}

export const ModuleDetailsView = ({
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
        <div className="module-details__view-container">
            <Carousel className="module-details__carousel" imageUrls={moduleDetails.assets} />
            <div className="module-details__view-wrapper mt-24">
                <div className="module-details__feature-wrapper">
                    <h2 className="module-details__feature-heading cn-9 fs-20 fw-6">{moduleDetails.title}</h2>
                    <div className="module-details__divider mt-24 mb-24" />
                    <MarkDown
                        className="module-details__feature-info fs-13 fw-4 cn-9"
                        breaks={true}
                        markdown={moduleDetails.description}
                    />
                </div>
                <InstallationWrapper
                    moduleName={moduleDetails.name}
                    installationStatus={moduleDetails.installationStatus}
                    serverInfo={serverInfo}
                    upgradeVersion={upgradeVersion}
                    logPodName={logPodName}
                    isActionTriggered={isActionTriggered}
                    updateActionTrigger={(isActionTriggered) =>
                        handleActionTrigger(`moduleAction-${moduleDetails.name?.toLowerCase()}`, isActionTriggered)
                    }
                />
            </div>
        </div>
    ) : null
}

export const NoIntegrationsInstalledView = (): JSX.Element => {
    const history: RouteComponentProps['history'] = useHistory()

    return (
        <div className="no-integrations__installed-view">
            <EmptyState>
                <EmptyState.Image>
                    <img src={NoIntegrations} width="250" height="200" alt="no results" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h2 className="fs-16 fw-4 c-9">No integrations installed</h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>Installed integrations will be available here</EmptyState.Subtitle>
                <EmptyState.Button>
                    <button
                        type="button"
                        className="empty-state__discover-btn flex fs-13 fw-6 br-4"
                        onClick={() => history.push(URLS.STACK_MANAGER_DISCOVER_MODULES)}
                    >
                        <DiscoverIcon className="discover-icon" /> <span className="ml-8">Discover integrations</span>
                    </button>
                </EmptyState.Button>
            </EmptyState>
        </div>
    )
}

const ManagedByNote = (): JSX.Element => {
    return (
        <div className="managed-by__note-wrapper mb-16">
            <div className="managed-by__note flex top left br-4 cn-9 bcb-1">
                <div className="icon-dim-20 mr-12">
                    <Info className="icon-dim-20" />
                </div>
                <div>
                    <h2 className="managed-by__note-title m-0 p-0 fs-13 fw-6 lh-20">Managed by Devtron Labs</h2>
                    <p className="fs-13 fw-4 mb-0 mt-4 lh-20">
                        Devtron stack is managed by Devtron Labs.
                        <br />
                        For any support, please contact your Devtron representative.
                    </p>
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
                                    href="https://docs.devtron.ai/devtron/setup/upgrade"
                                    target="_blank"
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

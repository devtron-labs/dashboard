import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ModuleDetailsCardType, ModuleStatus, ModuleDetails, ServerInfo } from './DevtronStackManager.type'
import EmptyState from '../../EmptyState/EmptyState'
import { ReactComponent as DiscoverIcon } from '../../../assets/icons/ic-compass.svg'
import { ReactComponent as DevtronIcon } from '../../../assets/icons/ic-devtron.svg'
import { ReactComponent as InstalledIcon } from '../../../assets/icons/ic-check.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as InstallIcon } from '../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as RetyrInstallIcon } from '../../../assets/icons/ic-arrow-clockwise.svg'
import { ReactComponent as SuccessIcon } from '../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as UpToDateIcon } from '../../../assets/icons/ic-celebration.svg'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { Progressing, showError, ToastBody } from '../../common'
import NoExtensions from '../../../assets/img/empty-noresult@2x.png'
import LatestVersionCelebration from '../../../assets/gif/latest-version-celebration.gif'
import { URLS } from '../../../config'
import Carousel from '../../common/Carousel/Carousel'
import { toast } from 'react-toastify'
import { handleAction, MODULE_DETAILS_INFO, MODULE_DETAILS_MAP, MODULE_ICON_MAP } from './DevtronStackManager.utils'
import './devtronStackManager.component.scss'

// Start: Carousel images
import CarouselImage1 from '../../../assets/img/ic-empty-ea-app-detail.png'
import CarouselImage2 from '../../../assets/img/ic-empty-ea-charts.png'
import CarouselImage3 from '../../../assets/img/ic-empty-ea-app-detail.png'
import CarouselImage4 from '../../../assets/img/ic-empty-ea--security.png'
// End: Carousel images

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
            <img
                className="module-details__card-icon mb-16"
                src={MODULE_ICON_MAP[moduleDetails.icon]}
                alt={moduleDetails.name}
            />
            <div className="module-details__card-name fs-16 fw-6 cn-9 mb-4">{moduleDetails.name}</div>
            <div className="module-details__card-info fs-13 fw-4 cn-7">{moduleDetails.info}</div>
        </div>
    )
}

export const ModulesListingView = ({
    modulesList,
    isDiscoverModulesView,
    handleModuleCardClick,
    history,
}: {
    modulesList: ModuleDetails[]
    isDiscoverModulesView?: boolean
    handleModuleCardClick: (moduleDetails: ModuleDetails, fromDiscoverModules: boolean) => void
    history: any
}): JSX.Element => {
    return modulesList.length > 0 ? (
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
                    moduleDetails={MODULE_DETAILS_MAP['moreExtensions']}
                    className="more-extensions__card"
                    fromDiscoverModules={isDiscoverModulesView}
                />
            )}
        </div>
    ) : (
        <NoModulesInstalledView history={history} />
    )
}

export const NavItem = ({
    installedModulesCount,
    currentVersion,
}: {
    installedModulesCount: number
    currentVersion: string
}): JSX.Element => {
    const ExtentionsSection = [
        {
            name: 'Discover',
            href: URLS.STACK_MANAGER_DISCOVER_MODULES,
            icon: DiscoverIcon,
            className: 'discover-modules__nav-link',
        },
        {
            name: 'Installed',
            href: URLS.STACK_MANAGER_INSTALLED_MODULES,
            icon: InstalledIcon,
            className: 'installed-modules__nav-link',
        },
    ]
    const AboutSection = {
        name: 'About Devtron',
        href: URLS.STACK_MANAGER_ABOUT,
        icon: DevtronIcon,
        className: 'about-devtron__nav-link',
    }

    const getNavLink = (route) => {
        return (
            <NavLink
                to={`${route.href}`}
                key={route.href}
                className={`stack-manager__navlink ${route.className}`}
                activeClassName="active-route"
            >
                <div className="flex left">
                    <route.icon className={`stack-manager__navlink-icon icon-dim-20`} />
                    {route.name !== 'Installed' && route.name !== 'About Devtron' && (
                        <span className="fs-13 ml-12">{route.name}</span>
                    )}
                    {route.name === 'About Devtron' && (
                        <div className="about-devtron ml-12">
                            <span className="fs-13">{route.name}</span>
                            <br />
                            <span className="fs-11">{currentVersion}</span>
                        </div>
                    )}
                    {route.name === 'Installed' && (
                        <div className="installed-modules-link flex content-space ml-12" style={{ width: '175px' }}>
                            <span className="fs-13">{route.name}</span>
                            <span className="badge">{installedModulesCount || 0}</span>
                        </div>
                    )}
                </div>
            </NavLink>
        )
    }

    return (
        <div className="flex column left">
            <div className="section-heading cn-6 fs-12 fw-6 pl-8 mb-8">EXTENSIONS</div>
            {ExtentionsSection.map((route) => getNavLink(route))}
            <hr className="mt-8 mb-8 w-100 checklist__divider" />
            {getNavLink(AboutSection)}
        </div>
    )
}

export const PageHeader = ({
    detailsMode,
    selectedModule,
    handleBreadcrumbClick,
}: {
    detailsMode: string
    selectedModule: ModuleDetails
    handleBreadcrumbClick: () => void
}) => {
    return (
        <section className="page-header flex left">
            {!detailsMode && <div className="flex left page-header__title cn-9 fs-14 fw-6">Devtron Stack Manager</div>}
            {detailsMode === 'discover' && (
                <div className="flex left page-header__title cn-9 fs-14 fw-6">
                    <NavLink to={URLS.STACK_MANAGER_DISCOVER_MODULES} onClick={handleBreadcrumbClick}>
                        Discover modules
                    </NavLink>
                    <span className="mr-4 ml-4">/</span>
                    <span>{selectedModule?.name}</span>
                </div>
            )}
            {detailsMode === 'installed' && (
                <div className="flex left page-header__title cn-9 fs-14 fw-6">
                    <NavLink to={URLS.STACK_MANAGER_INSTALLED_MODULES} onClick={handleBreadcrumbClick}>
                        Installed modules
                    </NavLink>
                    <span className="mr-4 ml-4">/</span>
                    <span>{selectedModule?.name}</span>
                </div>
            )}
        </section>
    )
}

const InstallationStatus = ({
    installationStatus,
    appName,
    logPodName,
    isUpgradeView,
    upgradeVersion,
}: {
    installationStatus: ModuleStatus
    appName?: string
    logPodName?: string
    isUpgradeView?: boolean
    upgradeVersion?: string
}) => {
    return (
        <div
            className={`module-details__installtion-status cn-9 br-4 fs-13 fw-6 mb-16 status-${installationStatus} ${
                isUpgradeView ? 'upgrade' : ''
            }`}
        >
            {(installationStatus === ModuleStatus.INSTALLING || installationStatus === ModuleStatus.UPGRADING) && (
                <>
                    <Progressing size={24} />
                    <div className="mt-12">
                        {logPodName
                            ? isUpgradeView
                                ? `Upgrading to ${upgradeVersion}`
                                : 'Installing'
                            : 'Initializing'}
                        &nbsp;...
                    </div>
                </>
            )}
            {(installationStatus === ModuleStatus.INSTALLED || installationStatus === ModuleStatus.HEALTHY) && (
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
                        : `${isUpgradeView ? 'Upgrade' : 'Installation'} ${
                              installationStatus === ModuleStatus.TIMEOUT ? 'request timed out' : 'failed'
                          }`}
                </div>
            )}
            {logPodName &&
                appName &&
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
                        <NavLink
                            to={`${URLS.APP}/${URLS.EXTERNAL_APPS}/1%7Cdevtroncd%7C${appName}/${appName}/${URLS.APP_DETAILS}/${URLS.APP_DETAILS_K8}/pod/${logPodName}/logs`}
                        >
                            View logs
                        </NavLink>
                    </div>
                )}
            {(installationStatus === ModuleStatus.INSTALLING || installationStatus === ModuleStatus.UPGRADING) && (
                <p className="module-details__installtion-note fs-12 fw-4 bcn-1 br-4">
                    NOTE: You can continue using Devtron. The installation will continue in the background.
                </p>
            )}
        </div>
    )
}

const GetHelpCard = () => {
    return (
        <div className="module-details__get-help flex column top left br-4 cn-9 fs-13">
            <span className="fw-6 mb-10">Facing issues?</span>
            <a
                className="module-details__help-guide cb-5 flex left"
                href="https://discord.devtron.ai/"
                target="_blank"
                rel="noreferrer noopener"
            >
                <File className="icon-dim-20 mr-12" /> Troubleshooting guide
            </a>
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

const ModuleUpdateNote = () => {
    return (
        <div className="module-details__update-note br-4 cn-9 fs-13">
            <div className="fs-4 mb-8">Modules are updated along with Devtron updates.</div>
            <div className="fs-6">
                <NavLink to={URLS.STACK_MANAGER_ABOUT} className="fw-6">
                    Check for Devtron updates
                </NavLink>
            </div>
        </div>
    )
}

export const handleError = (err) => {
    if (err.code === 403) {
        toast.info(<ToastBody title="Access denied" subtitle="You don't have access to perform this action." />, {
            className: 'devtron-toast unauthorized',
        })
    } else {
        showError(err)
    }
}

export const InstallationWrapper = ({
    moduleName,
    installationStatus,
    appName,
    logPodName,
    isUpgradeView,
    upgradeVersion,
}: {
    moduleName?: string
    installationStatus: ModuleStatus
    appName?: string
    logPodName?: string
    isUpgradeView?: boolean
    upgradeVersion?: string
}) => {
    return (
        <div className="module-details__install-wrapper">
            {!(
                installationStatus === ModuleStatus.INSTALLING ||
                installationStatus === ModuleStatus.UPGRADING ||
                installationStatus === ModuleStatus.INSTALLED ||
                installationStatus === ModuleStatus.HEALTHY
            ) && (
                <button
                    className="module-details__install-button cta flex mb-16"
                    onClick={() => handleAction(moduleName, isUpgradeView, upgradeVersion)}
                >
                    {installationStatus === ModuleStatus.NOT_INSTALLED && (
                        <>
                            <InstallIcon className="module-details__install-icon icon-dim-16 mr-8" />
                            {isUpgradeView ? `Upgrade to ${upgradeVersion}` : 'Install'}
                        </>
                    )}
                    {(installationStatus === ModuleStatus.INSTALL_FAILED ||
                        installationStatus === ModuleStatus.UPGRADE_FAILED ||
                        installationStatus === ModuleStatus.TIMEOUT ||
                        installationStatus === ModuleStatus.UNKNOWN) && (
                        <>
                            <RetyrInstallIcon className="module-details__retry-install-icon icon-dim-16 mr-8" />
                            {isUpgradeView ? `Retry upgrade to ${upgradeVersion}` : ' Retry install'}
                        </>
                    )}
                </button>
            )}
            {installationStatus !== ModuleStatus.NOT_INSTALLED && (
                <InstallationStatus
                    installationStatus={installationStatus}
                    appName={appName}
                    logPodName={logPodName}
                    isUpgradeView={isUpgradeView}
                    upgradeVersion={upgradeVersion}
                />
            )}
            {!isUpgradeView && installationStatus === ModuleStatus.INSTALLED && <ModuleUpdateNote />}
            {(installationStatus === ModuleStatus.INSTALL_FAILED ||
                installationStatus === ModuleStatus.UPGRADE_FAILED ||
                installationStatus === ModuleStatus.TIMEOUT ||
                installationStatus === ModuleStatus.UNKNOWN) && <GetHelpCard />}
        </div>
    )
}

export const ModuleDetailsView = ({
    moduleDetails,
    handleModuleSelection,
    setDetailsMode,
    serverInfo,
    logPodName,
    fromDiscoverModules,
    history,
    location,
}: {
    moduleDetails: ModuleDetails
    handleModuleSelection: (moduleDetails: ModuleDetails, fromDiscoverModules: boolean, moduleId: string) => void
    setDetailsMode: React.Dispatch<React.SetStateAction<string>>
    serverInfo: ServerInfo
    logPodName?: string
    fromDiscoverModules?: boolean
    history: any
    location: any
}): JSX.Element | null => {
    const _moduleDetails = MODULE_DETAILS_INFO[moduleDetails?.id]

    useEffect(() => {
        const moduleId = new URLSearchParams(location.search).get('id')
        if (!moduleDetails) {
            if (!moduleId) {
                setDetailsMode('')
                history.push(
                    fromDiscoverModules ? URLS.STACK_MANAGER_DISCOVER_MODULES : URLS.STACK_MANAGER_INSTALLED_MODULES,
                )
            } else {
                handleModuleSelection(null, fromDiscoverModules, moduleId)
            }
        }
    }, [])
    return _moduleDetails ? (
        <div className="module-details__view-container">
            <Carousel
                className="module-details__carousel mb-24"
                imageUrls={[CarouselImage1, CarouselImage2, CarouselImage3, CarouselImage4]}
            />
            <div className="module-details__view-wrapper">
                <div className="module-details__feature-wrapper">
                    <h2 className="module-details__feature-heading cn-9 fs-20 fw-6">{_moduleDetails.name}</h2>
                    <div className="module-details__divider mt-24 mb-24" />
                    <div className="module-details__feature-info fs-13 fw-4">
                        {_moduleDetails.infoList.map((info, idx) => {
                            return <p key={`info-${idx}`}>{info}</p>
                        })}
                        <h3 className="module-details__features-list-heading fs-13 fw-6">Features</h3>
                        <ul className="module-details__features-list pl-22 mb-24">
                            {_moduleDetails.featuresList.map((feature, idx) => {
                                return <li key={`feature-${idx}`}>{feature}</li>
                            })}
                        </ul>
                    </div>
                </div>
                <InstallationWrapper
                    moduleName={_moduleDetails.name}
                    installationStatus={moduleDetails.installationStatus}
                    appName={serverInfo?.releaseName}
                    logPodName={logPodName}
                />
            </div>
        </div>
    ) : null
}

export const NoModulesInstalledView = ({ history }): JSX.Element => {
    return (
        <div className="no-modules__installed-view">
            <EmptyState>
                <EmptyState.Image>
                    <img src={NoExtensions} width="250" height="200" alt="no results" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h2 className="fs-16 fw-4 c-9">No extensions installed</h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>Installed extensions will be available here</EmptyState.Subtitle>
                <EmptyState.Button>
                    <button
                        type="button"
                        className="empty-state__discover-btn flex fs-13 fw-6 br-4"
                        onClick={() => history.push(URLS.STACK_MANAGER_DISCOVER_MODULES)}
                    >
                        <DiscoverIcon className="discover-icon" /> <span className="ml-8">Discover extensions</span>
                    </button>
                </EmptyState.Button>
            </EmptyState>
        </div>
    )
}

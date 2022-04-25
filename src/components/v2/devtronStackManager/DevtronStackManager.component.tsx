import React, { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { ModuleDetailsCardType, ModuleStatus, ModuleDetails, ModuleDetailsInfo } from './DevtronStackManager.type'
import EmptyState from '../../EmptyState/EmptyState'
import CICDIcon from '../../../assets/img/ic-build-deploy.png'
import MoreExtentionsIcon from '../../../assets/img/ic-more-extensions.png'
import { ReactComponent as DiscoverIcon } from '../../../assets/icons/ic-compass.svg'
import { ReactComponent as DevtronIcon } from '../../../assets/icons/ic-devtron.svg'
import { ReactComponent as InstalledIcon } from '../../../assets/icons/ic-check.svg'
import { ReactComponent as ErrorIcon } from '../../../assets/icons/ic-error-exclamation.svg'
import { ReactComponent as InstallIcon } from '../../../assets/icons/ic-arrow-forward.svg'
import { ReactComponent as RetyrInstallIcon } from '../../../assets/icons/ic-arrow-clockwise.svg'
import { ReactComponent as SuccessIcon } from '../../../assets/icons/appstatus/healthy.svg'
import { ReactComponent as DiscordOnlineIcon } from '../../../assets/icons/ic-discord-online.svg'
import { Progressing } from '../../common'
import VersionUpToDate from '../../../assets/img/ic-empty-tests.svg'
import NoExtensions from '../../../assets/img/empty-noresult@2x.png'
import { URLS } from '../../../config'
import Carousel from '../../common/Carousel/Carousel'

// Start: Carousel images
import CarouselImage1 from '../../../assets/img/ic-empty-ea-app-detail.png'
import CarouselImage2 from '../../../assets/img/ic-empty-ea-charts.png'
import CarouselImage3 from '../../../assets/img/ic-empty-ea-app-detail.png'
import CarouselImage4 from '../../../assets/img/ic-empty-ea--security.png'
// End: Carousel images

const MODULE_ICON_MAP = {
    ciCd: CICDIcon,
    moreExtensions: MoreExtentionsIcon,
}

export const MODULE_DETAILS_MAP: Record<string, ModuleDetails> = {
    ciCd: {
        id: 'ciCd',
        name: 'Build and Deploy (CI/CD)',
        info: 'Enables continous code integration and deployment.',
        icon: 'ciCd',
        installationStatus: ModuleStatus.NONE,
    },
    moreExtensions: {
        id: 'moreExtensions',
        name: 'More extensions coming soon',
        info: "We're building a suite of extensions to serve your software delivery lifecycle.",
        icon: 'moreExtensions',
        installationStatus: ModuleStatus.NONE,
    },
}

const MODULE_DETAILS_INFO: Record<string, ModuleDetailsInfo> = {
    ciCd: {
        name: 'Build and Deploy (CI/CD)',
        infoList: [
            'Continuous integration (CI) and continuous delivery (CD) embody a culture, set of operating principles, and collection of practices that enable application development teams to deliver code changes more frequently and reliably. The implementation is also known as the CI/CD pipeline.',
            'CI/CD is one of the best practices for devops teams to implement. It is also an agile methodology best practice, as it enables software development teams to focus on meeting business requirements, code quality, and security because deployment steps are automated.',
        ],
        featuresList: [
            "Discovery: What would the users be searching for when they're looking for a CI/CD offering?",
            'Detail: The CI/CD offering should be given sufficient importance (on Website, Readme). (Eg. Expand capability with CI/CD module [Discover more modules])',
            'Installation: Ability to install CI/CD module with the basic installation.',
            'In-Product discovery: How easy it is to discover the CI/CD offering primarily once the user is in the product. (Should we talk about modules on the login page?)',
        ],
    },
}

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
        <NoExtensionsInstalledView history={history} />
    )
}

export const NavItem = ({ installedModulesCount }: { installedModulesCount: number }): JSX.Element => {
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
                            <span className="fs-11">v0.3.25</span>
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
    logPodName,
}: {
    installationStatus: ModuleStatus
    logPodName?: string
}) => {
    // if ()
    return (
        <div className={`module-details__installtion-status cn-9 br-4 fs-13 fw-6 mb-16 ${installationStatus}`}>
            {installationStatus === ModuleStatus.INSTALLING && (
                <>
                    <Progressing size={24} />
                    <div className="mt-12">{logPodName ? 'Installing' : 'Initializing'} ...</div>
                </>
            )}
            {installationStatus === ModuleStatus.INSTALLED && (
                <div className="module-details__installtion-success flex left">
                    <SuccessIcon className="icon-dim-20 mr-12" /> Installed
                </div>
            )}
            {(installationStatus === ModuleStatus.INSTALL_FAILED || installationStatus === ModuleStatus.TIMEOUT) && (
                <div className="module-details__installtion-failed flex left">
                    <ErrorIcon className="icon-dim-20 mr-12" /> Installation failed
                </div>
            )}
            {logPodName && (
                <div className="mt-4">
                    <NavLink
                        to={`/app/ea/1%7Cdevtroncd%7Cdevtron/devtron/details/k8s-resources/pod/${logPodName}/logs`}
                    >
                        View logs
                    </NavLink>
                </div>
            )}
            {installationStatus === ModuleStatus.INSTALLING && (
                <p className="module-details__installtion-note fs-12 fw-4 bcn-1 br-4">
                    NOTE: You can continue using Devtron. The installation will continue in the background.
                </p>
            )}
        </div>
    )
}

const GetHelpCard = () => {
    return (
        <a
            className="module-details__get-help flex br-4 cn-9 fs-13"
            href="https://discord.devtron.ai/"
            target="_blank"
            rel="noreferrer noopener"
        >
            <div className="mr-16">
                <span className="fw-6">Facing issues?</span>
                <br />
                <span className="fw-4">Ping us! We're here to help.</span>
            </div>
            <div className="icon-dim-40">
                <DiscordOnlineIcon />
            </div>
        </a>
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

export const ModuleDetailsView = ({
    moduleDetails,
    handleModuleSelection,
    setDetailsMode,
    fromDiscoverModules,
    history,
    location,
}: {
    moduleDetails: ModuleDetails
    handleModuleSelection: (moduleDetails: ModuleDetails, fromDiscoverModules: boolean, moduleId: string) => void
    setDetailsMode: React.Dispatch<React.SetStateAction<string>>
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
                <div className="module-details__install-wrapper">
                    {!(
                        moduleDetails.installationStatus === ModuleStatus.INSTALLING ||
                        moduleDetails.installationStatus === ModuleStatus.INSTALLED
                    ) && (
                        <button className="module-details__install-button cta flex mb-16">
                            {(moduleDetails.installationStatus === ModuleStatus.NOT_INSTALLED ||
                                moduleDetails.installationStatus === ModuleStatus.AVAILABLE) && (
                                <>
                                    <InstallIcon className="module-details__install-icon icon-dim-16 mr-8" />
                                    Install
                                </>
                            )}
                            {(moduleDetails.installationStatus === ModuleStatus.INSTALL_FAILED ||
                                moduleDetails.installationStatus === ModuleStatus.TIMEOUT) && (
                                <>
                                    <RetyrInstallIcon className="module-details__retry-install-icon icon-dim-16 mr-8" />
                                    Retry install
                                </>
                            )}
                        </button>
                    )}
                    {moduleDetails.installationStatus !== ModuleStatus.NOT_INSTALLED && (
                        <InstallationStatus installationStatus={moduleDetails.installationStatus} logPodName={''} />
                    )}
                    {moduleDetails.installationStatus === ModuleStatus.INSTALLED && <ModuleUpdateNote />}
                    {(moduleDetails.installationStatus === ModuleStatus.INSTALL_FAILED ||
                        moduleDetails.installationStatus === ModuleStatus.TIMEOUT) && <GetHelpCard />}
                </div>
            </div>
        </div>
    ) : null
}

export const NoExtensionsInstalledView = ({ history }): JSX.Element => {
    return (
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
    )
}

export const VersionUpToDateView = ({ history }): JSX.Element => {
    return (
        <div className="flexbox h-100">
            <EmptyState>
                <EmptyState.Image>
                    <img src={VersionUpToDate} width="250" height="200" alt="no results" />
                </EmptyState.Image>
                <EmptyState.Title>
                    <h2 className="fs-16 fw-4 c-9">You're using the latest version</h2>
                </EmptyState.Title>
                <EmptyState.Subtitle>v0.3.25</EmptyState.Subtitle>
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

import React from 'react'
import { NavLink } from 'react-router-dom'
import { ModuleDetails, ModuleDetailsCardType, ModuleInstallationStates } from './DevtronStackManager.type'
import EmptyState from '../../EmptyState/EmptyState'
import CICDIcon from '../../../assets/img/ic-build-deploy.png'
import MoreExtentionsIcon from '../../../assets/img/ic-more-extensions.png'
import { ReactComponent as DiscoverIcon } from '../../../assets/icons/ic-compass.svg'
import { ReactComponent as DevtronIcon } from '../../../assets/icons/ic-devtron.svg'
import { ReactComponent as InstalledIcon } from '../../../assets/icons/ic-check.svg'
import VersionUpToDate from '../../../assets/img/ic-empty-tests.svg'
import NoExtensions from '../../../assets/img/empty-noresult@2x.png'
import { URLS } from '../../../config'

const MODULE_ICON_MAP = {
    'ci-cd': CICDIcon,
    'more-extensions': MoreExtentionsIcon,
}

export const MoreExtentionsDetails: ModuleDetails = {
    name: 'More extensions coming soon',
    info: "We're building a suite of extensions to serve your software delivery lifecycle.",
    icon: 'more-extensions',
    installationState: ModuleInstallationStates.NONE,
}

export const ModuleDeailsCard = ({ moduleDetails, className }: ModuleDetailsCardType): JSX.Element => {
    return (
        <div className={`module-details__card flex left column br-8 p-20 mr-20 mb-20 ${className || ''}`}>
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
    history,
}: {
    modulesList: ModuleDetails[]
    isDiscoverModulesView?: boolean
    history: any
}): JSX.Element => {
    return modulesList.length > 0 ? (
        <div className="flexbox flex-wrap left p-20">
            {modulesList.map((module, idx) => {
                return <ModuleDeailsCard key={`module-details__card-${idx}`} moduleDetails={module} />
            })}
            {isDiscoverModulesView && (
                <ModuleDeailsCard moduleDetails={MoreExtentionsDetails} className="more-extensions__card" />
            )}
        </div>
    ) : (
        <NoExtensionsInstalledView history={history} />
    )
}

export const NavItem = (): JSX.Element => {
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
                            <span className="badge">0</span>
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

import React, { Component } from 'react'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import {
    ModuleNameMap,
    MODULE_STATUS_POLLING_INTERVAL,
    MODULE_STATUS_RETRY_COUNT,
    SERVER_MODE,
    URLS,
} from '../../../config'
import { ReactComponent as ApplicationsIcon } from '../../../assets/icons/ic-nav-applications.svg'
import { ReactComponent as ChartStoreIcon } from '../../../assets/icons/ic-nav-helm.svg'
import { ReactComponent as DeploymentGroupIcon } from '../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as SecurityIcon } from '../../../assets/icons/ic-nav-bug.svg'
import { ReactComponent as BulkEditIcon } from '../../../assets/icons/ic-nav-code.svg'
import { ReactComponent as GlobalConfigIcon } from '../../../assets/icons/ic-nav-gear.svg'
import { ReactComponent as StackManagerIcon } from '../../../assets/icons/ic-nav-stack.svg'
import { getLoginInfo } from '../index'
import NavSprite from '../../../assets/icons/navigation-sprite.svg'
import TextLogo from '../../../assets/icons/ic-nav-devtron.svg'
import { Command, CommandErrorBoundary } from '../../command'
import { ModuleStatus, ServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.type'
import ReactGA from 'react-ga4'
import './navigation.scss'
import { ReactComponent as ClusterIcon } from '../../../assets/icons/ic-cluster.svg'
import { getModuleInfo } from '../../v2/devtronStackManager/DevtronStackManager.service'

const NavigationList = [
    {
        title: 'Applications',
        type: 'link',
        iconClass: 'nav-short-apps',
        icon: ApplicationsIcon,
        href: URLS.APP,
        isAvailableInEA: true,
    },
    {
        title: 'Chart Store',
        type: 'link',
        iconClass: 'nav-short-helm',
        icon: ChartStoreIcon,
        href: URLS.CHARTS,
        isAvailableInEA: true,
    },
    {
        title: 'Deployment Groups',
        type: 'link',
        iconClass: 'nav-short-bulk-actions',
        icon: DeploymentGroupIcon,
        href: URLS.DEPLOYMENT_GROUPS,
        isAvailableInEA: false,
        forceHideEnvKey: 'HIDE_DEPLOYMENT_GROUP',
    },
    {
        title: 'Security',
        type: 'link',
        href: URLS.SECURITY,
        iconClass: 'nav-security',
        icon: SecurityIcon,
        moduleName: ModuleNameMap.SECURITY,
    },
    {
        title: 'Clusters',
        type: 'link',
        href: URLS.CLUSTER_LIST,
        iconClass: 'nav-short-clusters',
        icon: ClusterIcon,
        isAvailableInEA: true,
    },
    {
        title: 'Bulk Edit',
        type: 'link',
        href: URLS.BULK_EDITS,
        iconClass: 'nav-bulk-update',
        icon: BulkEditIcon,
        isAvailableInEA: false,
    },
    {
        title: 'Global Configurations',
        type: 'link',
        href: URLS.GLOBAL_CONFIG,
        iconClass: 'nav-short-global',
        icon: GlobalConfigIcon,
        isAvailableInEA: true,
    },
]

const NavigationStack = {
    title: 'Devtron Stack Manager',
    type: 'link',
    iconClass: 'nav-short-stack',
    icon: StackManagerIcon,
    href: URLS.STACK_MANAGER,
}
interface NavigationType extends RouteComponentProps<{}> {
    serverMode: SERVER_MODE
    fetchingServerInfo: boolean
    serverInfo: ServerInfo
    getCurrentServerInfo: (section: string) => Promise<void>
    moduleInInstallingState: string
    installedModuleMap: React.MutableRefObject<Record<string, boolean>>
}
export default class Navigation extends Component<
    NavigationType,
    {
        loginInfo: any
        showLogoutCard: boolean
        showHelpCard: boolean
        showMoreOptionCard: boolean
        isCommandBarActive: boolean
        forceUpdateTime: number
    }
> {
    securityModuleStatusTimer = null
    constructor(props) {
        super(props)
        this.state = {
            loginInfo: getLoginInfo(),
            showLogoutCard: false,
            showHelpCard: false,
            showMoreOptionCard: false,
            isCommandBarActive: false,
            forceUpdateTime: Date.now(),
        }
        this.onLogout = this.onLogout.bind(this)
        this.toggleLogoutCard = this.toggleLogoutCard.bind(this)
        this.toggleHelpCard = this.toggleHelpCard.bind(this)
        this.toggleCommandBar = this.toggleCommandBar.bind(this)
        this.getSecurityModuleStatus(MODULE_STATUS_RETRY_COUNT)
    }

    componentWillUnmount() {
        if (this.securityModuleStatusTimer) {
            clearTimeout(this.securityModuleStatusTimer)
        }
    }

    componentDidUpdate(prevProps) {
        if (
            this.props.moduleInInstallingState !== prevProps.moduleInInstallingState &&
            this.props.moduleInInstallingState === ModuleNameMap.SECURITY
        ) {
            this.getSecurityModuleStatus(MODULE_STATUS_RETRY_COUNT)
        }
    }

    async getSecurityModuleStatus(retryOnError: number): Promise<void> {
        if (this.props.installedModuleMap.current?.[ModuleNameMap.SECURITY]) {
            return
        }
        try {
            const { result } = await getModuleInfo(ModuleNameMap.SECURITY)
            if (result?.status === ModuleStatus.INSTALLED) {
                this.props.installedModuleMap.current = {
                    ...this.props.installedModuleMap.current,
                    [ModuleNameMap.SECURITY]: true,
                }
                this.setState({ forceUpdateTime: Date.now() })
            } else if (result?.status === ModuleStatus.INSTALLING) {
                this.securityModuleStatusTimer = setTimeout(() => {
                    this.getSecurityModuleStatus(MODULE_STATUS_RETRY_COUNT)
                }, MODULE_STATUS_POLLING_INTERVAL)
            }
        } catch (error) {
            if (retryOnError >= 0) {
                this.getSecurityModuleStatus(retryOnError--)
            }
        }
    }

    toggleLogoutCard() {
        this.setState({ showLogoutCard: !this.state.showLogoutCard })
    }

    toggleHelpCard() {
        this.setState({ showHelpCard: !this.state.showHelpCard })
    }

    toggleCommandBar(flag: boolean): void {
        this.setState({ isCommandBarActive: flag })
    }

    onLogout(): void {
        document.cookie = `argocd.token=; expires=Thu, 01-Jan-1970 00:00:01 GMT;path=/`
        this.props.history.push('/login')
    }

    renderNavButton(item) {
        return (
            <button
                type="button"
                key={`side-nav-${item.title}`}
                className="dc__transparent pl-0"
                onClick={(e) => {
                    if (!this.state.isCommandBarActive) {
                        ReactGA.event({
                            category: 'Command Bar',
                            action: 'Open (Click)',
                            label: `${this.props.location.pathname.replace(/\d+/g, '')}`,
                        })
                    } else {
                        ReactGA.event({
                            category: 'Command Bar',
                            action: 'Close',
                            label: '',
                        })
                    }
                    this.toggleCommandBar(!this.state.isCommandBarActive)
                }}
            >
                <div className="short-nav--flex">
                    <div className="svg-container flex">
                        <item.icon className="icon-dim-20" />
                    </div>
                    <div className="expandable-active-nav">
                        <div className="title-container flex left">{item.title}</div>
                    </div>
                </div>
            </button>
        )
    }

    renderNavLink(item, className = '') {
        return (
            <NavLink
                to={item.href}
                key={`side-nav-${item.title}`}
                onClick={(event) => {
                    ReactGA.event({
                        category: 'Main Navigation',
                        action: `${item.title} Clicked`,
                    })
                }}
                className={`flex left ${className || ''}`}
                activeClassName="active-nav"
            >
                <div className="short-nav__item-selected" />
                <div className="short-nav--flex">
                    <div className={`svg-container flex ${item.iconClass}`}>
                        <item.icon className="icon-dim-20" />
                    </div>
                    <div className="expandable-active-nav">
                        <div className="title-container flex left">{item.title}</div>
                    </div>
                </div>
            </NavLink>
        )
    }

    render() {
        return (
            <>
                <nav>
                    <aside className="short-nav nav-grid nav-grid--collapsed" style={{ marginBottom: 30 }}>
                        <NavLink
                            to={URLS.APP}
                            onClick={(event) => {
                                ReactGA.event({
                                    category: 'Main Navigation',
                                    action: 'Devtron Logo Clicked',
                                })
                            }}
                        >
                            <div className="short-nav--flex">
                                <svg className="devtron-logo" viewBox="0 0 40 40">
                                    <use href={`${NavSprite}#nav-short-devtron-logo`}></use>
                                </svg>
                                <div className="pl-12 pt-10">
                                    <img src={TextLogo} alt="devtron" className="devtron-logo devtron-logo--text" />
                                </div>
                            </div>
                        </NavLink>
                        {NavigationList.map((item, index) => {
                            if (
                                (!item.forceHideEnvKey ||
                                    (item.forceHideEnvKey && !window?._env_?.[item.forceHideEnvKey])) &&
                                ((this.props.serverMode !== SERVER_MODE.EA_ONLY && !item.moduleName) ||
                                    (this.props.serverMode === SERVER_MODE.EA_ONLY && item.isAvailableInEA) ||
                                    this.props.installedModuleMap.current?.[item.moduleName])
                            ) {
                                if (item.type === 'button') {
                                    return this.renderNavButton(item)
                                } else {
                                    return this.renderNavLink(item)
                                }
                            }
                        })}
                        <div className="short-nav__divider" />
                        {this.renderNavLink(NavigationStack, 'short-nav__stack-manager')}
                    </aside>
                </nav>
                <CommandErrorBoundary toggleCommandBar={this.toggleCommandBar}>
                    <Command
                        location={this.props.location}
                        match={this.props.match}
                        history={this.props.history}
                        isCommandBarActive={this.state.isCommandBarActive}
                        toggleCommandBar={this.toggleCommandBar}
                    />
                </CommandErrorBoundary>
            </>
        )
    }
}

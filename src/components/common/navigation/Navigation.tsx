import React, { Component, Fragment } from 'react'
import ReactDOM from 'react-dom'
import { NavLink, RouteComponentProps } from 'react-router-dom'
import { DOCUMENTATION, SERVER_MODE, URLS } from '../../../config'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Discord } from '../../../assets/icons/ic-discord-fill.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-pencil.svg'
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { ReactComponent as ApplicationsIcon } from '../../../assets/icons/ic-nav-applications.svg'
import { ReactComponent as ChartStoreIcon } from '../../../assets/icons/ic-nav-helm.svg'
import { ReactComponent as DeploymentGroupIcon } from '../../../assets/icons/ic-nav-rocket.svg'
import { ReactComponent as SecurityIcon } from '../../../assets/icons/ic-nav-bug.svg'
import { ReactComponent as BulkEditIcon } from '../../../assets/icons/ic-nav-code.svg'
import { ReactComponent as GlobalConfigIcon } from '../../../assets/icons/ic-nav-gear.svg'
import { ReactComponent as StackManagerIcon } from '../../../assets/icons/ic-nav-stack.svg'
import { getLoginInfo } from '../index'
import { getRandomColor } from '../helpers/Helpers'
import NavSprite from '../../../assets/icons/navigation-sprite.svg'
import TextLogo from '../../../assets/icons/ic-nav-devtron.svg'
import { Command, CommandErrorBoundary } from '../../command'
import { InstallationType, ServerInfo } from '../../v2/devtronStackManager/DevtronStackManager.type'
import ReactGA from 'react-ga'
import './navigation.scss'

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
    },
    {
        title: 'Security',
        type: 'link',
        href: URLS.SECURITY,
        iconClass: 'nav-security',
        icon: SecurityIcon,
        isAvailableInEA: false,
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

const HelpOptions = [
    {
        name: 'View documentation',
        link: DOCUMENTATION.HOME_PAGE,
        icon: File,
        showSeparator: true,
    },
    {
        name: 'Chat with support',
        link: 'https://discord.devtron.ai/',
        icon: Chat,
    },
    {
        name: 'Join discord community',
        link: 'https://discord.devtron.ai/',
        icon: Discord,
        showSeparator: true,
    },
    {
        name: 'Raise an issue/request',
        link: 'https://github.com/devtron-labs/devtron/issues/new/choose',
        icon: Edit,
    },
]

interface NavigationType extends RouteComponentProps<{}> {
    serverMode: SERVER_MODE
    fetchingServerInfo: boolean
    serverInfo: ServerInfo
    getCurrentServerInfo: (section: string) => Promise<void>
}
export default class Navigation extends Component<
    NavigationType,
    {
        loginInfo: any
        showLogoutCard: boolean
        showHelpCard: boolean
        showMoreOptionCard: boolean
        isCommandBarActive: boolean
    }
> {
    constructor(props) {
        super(props)
        this.state = {
            loginInfo: getLoginInfo(),
            showLogoutCard: false,
            showHelpCard: false,
            showMoreOptionCard: false,
            isCommandBarActive: false,
        }
        this.onLogout = this.onLogout.bind(this)
        this.toggleLogoutCard = this.toggleLogoutCard.bind(this)
        this.toggleHelpCard = this.toggleHelpCard.bind(this)
        this.toggleCommandBar = this.toggleCommandBar.bind(this)
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
                className="transparent pl-0"
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
                                this.props.serverMode === SERVER_MODE.FULL ||
                                (this.props.serverMode === SERVER_MODE.EA_ONLY && item.isAvailableInEA)
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
                        <div
                            className={`short-nav__bottom-options ${
                                window._env_?.HIDE_DISCORD ? 'sticky__bottom-options' : ''
                            }`}
                        ></div>
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

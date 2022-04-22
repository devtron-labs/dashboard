import React, { Component } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { SERVER_MODE, URLS } from '../../../config';
import { ReactComponent as MoreOption } from '../../../assets/icons/ic-more-option.svg'
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg'
import { ReactComponent as File } from '../../../assets/icons/ic-file-text.svg'
import { ReactComponent as Discord } from '../../../assets/icons/ic-discord-fill.svg'
import { ReactComponent as Edit } from '../../../assets/icons/ic-edit.svg' // use pencil
import { ReactComponent as Chat } from '../../../assets/icons/ic-chat-circle-dots.svg'
import { getLoginInfo } from '../index';
import { getRandomColor } from '../helpers/Helpers';
import NavSprite from '../../../assets/icons/navigation-sprite.svg';
import TextLogo from '../../../assets/icons/ic-nav-devtron.svg';
import ReactDOM from 'react-dom';
import { Command, CommandErrorBoundary } from '../../command';
import ReactGA from 'react-ga';
import './navigation.scss';

const NavigationList = [
	{
		title: 'Search (⌘+/)',
		type: 'button',
		iconClass: 'nav-short-search',
		href: URLS.APP,
		isAvailableInEA: true,
	},
	{
		title: 'Applications',
		type: 'link',
		iconClass: 'nav-short-apps',
		href: URLS.APP,
		isAvailableInEA: true,
	},
	{
		title: 'Charts',
		type: 'link',
		iconClass: 'nav-short-helm',
		href: URLS.CHARTS,
		isAvailableInEA: true,
	},
	{
		title: 'Deployment Groups',
		type: 'link',
		iconClass: 'nav-short-bulk-actions',
		href: URLS.DEPLOYMENT_GROUPS,
		isAvailableInEA: false,
	},
	{
		title: 'Security',
		type: 'link',
		href: URLS.SECURITY,
		iconClass: 'nav-security',
		isAvailableInEA: false,
	},
	{
		title: 'Bulk Edit',
		type: 'link',
		href: URLS.BULK_EDITS,
		iconClass: 'nav-bulk-update',
		isAvailableInEA: false,
	},
	{
		title: 'Global Configurations',
		type: 'link',
		href: URLS.GLOBAL_CONFIG,
		iconClass: 'nav-short-global',
		isAvailableInEA: true,
	},

];

const NavigationListBottom = [
	{
		title: 'Documentation',
		iconClass: 'nav-short-documentation',
		href: 'https://docs.devtron.ai/',
	},
	{
		title: 'View on Github',
		iconClass: 'nav-short-github',
		href: 'https://github.com/devtron-labs/devtron',
	}
];

const NavigationStack = {
	title: 'Devtron Stack Manager',
	type: 'link',
	iconClass: 'nav-short-stack',
	href: URLS.STACK_MANAGER,
};

const HelpOptions = [
    {
        name: 'View documentation',
		link: 'https://devtron.ai/blog/',
        icon: File,
		showSeparator: true
    },
    {
        name: 'Chat with support',
		link: 'https://discord.gg/jsRG5qx2gp',
        icon: Chat,
    },
    {
        name: 'Join discord community',
		link: 'https://discord.gg/jsRG5qx2gp',
        icon: Discord,
		showSeparator: true
    },
    {
        name: 'Raise an issue/request',
		link: 'https://github.com/devtron-labs/devtron/issues',
        icon: Edit,
    },
]

interface NavigationType extends RouteComponentProps<{}>{
	serverMode: SERVER_MODE
}
export default class Navigation extends Component<NavigationType, { loginInfo: any; showLogoutCard: boolean; showHelpCard: boolean; showMoreOptionCard: boolean; isCommandBarActive: boolean; }> {
	constructor(props) {
		super(props);
		this.state = {
			loginInfo: getLoginInfo(),
			showLogoutCard: false,
			showHelpCard: false,
			showMoreOptionCard: false,
			isCommandBarActive: false,
		}
		this.onLogout = this.onLogout.bind(this);
		this.toggleLogoutCard = this.toggleLogoutCard.bind(this);
		this.toggleHelpCard = this.toggleHelpCard.bind(this);
		this.toggleMoreOptionCard = this.toggleMoreOptionCard.bind(this);
		this.toggleCommandBar = this.toggleCommandBar.bind(this);
	}

	toggleLogoutCard() {
		this.setState({ showLogoutCard: !this.state.showLogoutCard })
	}

	toggleHelpCard() {
		this.setState({ showHelpCard: !this.state.showHelpCard })
	}

	toggleMoreOptionCard() {
		this.setState({ showMoreOptionCard: !this.state.showMoreOptionCard })
	}

	toggleCommandBar(flag: boolean): void {
		this.setState({ isCommandBarActive: flag });
	}

	onLogout(): void {
		document.cookie = `argocd.token=; expires=Thu, 01-Jan-1970 00:00:01 GMT;path=/`;
		this.props.history.push('/login');
	}

	renderLogout() {
		let email: string = this.state.loginInfo ? this.state.loginInfo['email'] || this.state.loginInfo['sub'] : "";
		return ReactDOM.createPortal(<div className="transparent-div" onClick={this.toggleLogoutCard}>
			<div className="logout-card">
				<div className="flexbox flex-justify p-16">
					<div className="logout-card-user ">
						<p className="logout-card__name ellipsis-right">{email}</p>
						<p className="logout-card__email ellipsis-right">{email}</p>
					</div>
					<p className="logout-card__initial fs-16 icon-dim-32 mb-0" style={{ backgroundColor: getRandomColor(email) }}>{email[0]}</p>
				</div>
				<div className="logout-card__logout cursor" onClick={this.onLogout}>Logout</div>
			</div>
		</div>, document.getElementById('root'))
	}

	renderHelpCard() {
		return ReactDOM.createPortal(
            <div className="transparent-div" onClick={this.toggleHelpCard}>
                <div className="help-card">
                    {HelpOptions.map((option) => {
                        return (
                            <>
                                <div className="help-card__option">
                                    <a
                                        key={option.name}
                                        className="help-card__link flex left cn-9"
                                        href={option.link}
                                        target="_blank"
                                        rel="noreferrer noopener"
                                        onClick={(event) => {
                                            ReactGA.event({
                                                category: 'Main Navigation',
                                                action: `${option.name} Clicked`,
                                            })
                                        }}
                                    >
                                        <option.icon className="help-card__icon icon-dim-20" />
                                        <div className="help-card__option-name ml-12 cn-9 fs-14">{option.name}</div>
                                    </a>
                                </div>
                                {option.showSeparator && <div className="help-card__option-separator" />}
                            </>
                        )
                    })}
                    <div className="help-card__update-option mt-4">
                        <span>Devtron v0.3.25</span>
                        <br />
                        <NavLink to={URLS.STACK_MANAGER_ABOUT}>Check for Updates</NavLink>
                    </div>
                </div>
            </div>,
            document.getElementById('root'),
        )
	}

	renderMoreOption() {
		return ReactDOM.createPortal(<div className="transparent-div" onClick={this.toggleMoreOptionCard}>
			<div className="more-option-card ">
				<div className="more-option-card__title">
					<a className="more-option-card__link" href="https://devtron.ai/blog/" target="_blank" rel="noreferrer noopener"
						onClick={(event) => {
							ReactGA.event({
								category: 'Main Navigation',
								action: 'Devtron Blog Clicked',
							})
						}}>
						<div className="more-option-card__rect">Devtron Blog</div>
					</a>
				</div>
				<div className="more-option-card__title">
					<a className="more-option-card__link" href="https://github.com/devtron-labs/devtron/issues" target="_blank" rel="noreferrer noopener" onClick={(event) => {
						ReactGA.event({
							category: 'Main Navigation',
							action: 'Create Issue Clicked',
						})
					}}>
						<div className="more-option-card__rect">Create an issue</div>
					</a>
				</div>
				<div className="more-option-card__title">
					<a className="more-option-card__link" href=" https://github.com/devtron-labs/devtron" target="_blank" rel="noreferrer noopener" onClick={(event) => {
						ReactGA.event({
							category: 'Main Navigation',
							action: 'Star Github Repo Clicked',
						})
					}}>
						<div className="more-option-card__rect">Star GitHub Repo</div>
					</a>
				</div>
				<div className="more-option-card__title">
					<a className="more-option-card__link" href="https://discord.gg/jsRG5qx2gp" target="_blank" rel="noreferrer noopener" onClick={(event) => {
						ReactGA.event({
							category: 'Main Navigation',
							action: `Join Discord community clicked`,
						})
					}}>
						<div className="more-option-card__rect">Join Discord Community</div>
					</a>
				</div>
				<div className="more-option-card__title">
					<a className="more-option-card__link" href="https://github.com/devtron-labs/devtron/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer noopener" onClick={(event) => {
						ReactGA.event({
							category: 'Main Navigation',
							action: `Become Contributor Clicked`,
						})
					}}>
						<div className="more-option-card__rect">Become a contributor</div>
					</a>
				</div>
			</div>
		</div>, document.getElementById('root'))
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
                        <svg className="short-nav-icon icon-dim-20" viewBox="0 0 24 24">
                            <use href={`${NavSprite}#${item.iconClass}`}></use>
                        </svg>
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
				<div className="short-nav__item-selected"/>
                <div className="short-nav--flex">
                    <div className={`svg-container flex ${item.iconClass}`}>
                        <svg
                            className={`short-nav-icon ${
                                item.iconClass === 'nav-bulk-update' || item.iconClass === 'nav-short-stack'
                                    ? 'ml-4 mt-4 icon-dim-24'
                                    : 'icon-dim-20 '
                            }`}
                            viewBox="0 0 24 24"
                        >
                            <use href={`${NavSprite}#${item.iconClass}`}></use>
                        </svg>
                    </div>
                    <div className="expandable-active-nav">
                        <div className="title-container flex left">{item.title}</div>
                    </div>
                </div>
            </NavLink>
        )
	}

	render() {
		let email: string = this.state.loginInfo ? this.state.loginInfo['email'] || this.state.loginInfo['sub'] : "";
		return <>
			<nav>
				<aside className="short-nav nav-grid nav-grid--collapsed" style={{marginBottom:30}}>
				<NavLink to={URLS.APP} onClick={(event) => {
						ReactGA.event({
							category: 'Main Navigation',
							action: 'Devtron Logo Clicked',
						});
					}}>
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
					{this.props.serverMode === SERVER_MODE.EA_ONLY && (
                            <>
                                <div className="short-nav__divider" />
								{this.renderNavLink(NavigationStack, 'short-nav__stack-manager')}
                            </>
                        )}
					<div></div>
					<div className="short-nav__bottom-options">
					{this.props.serverMode !== SERVER_MODE.EA_ONLY &&
                            NavigationListBottom.map((item) => {
                                return (
                                    <a
                                        href={item.href}
                                        rel="noreferrer noopener"
                                        className=""
                                        key={item.title}
                                        target="_blank"
                                        onClick={(event) => {
                                            ReactGA.event({
                                                category: 'Main Navigation',
                                                action: `${item.title} Clicked`,
                                            })
                                        }}
                                    >
                                        <div className="short-nav--flex">
                                            <div className="short-nav__icon-container icon-dim-40 flex">
                                                <svg className="icon-dim-20 cursor" viewBox="0 0 24 24">
                                                    <use href={`${NavSprite}#${item.iconClass}`}></use>
                                                </svg>
                                            </div>
                                            <div className="expandable-active-nav">
                                                <div className="title-container flex left">{item.title}</div>
                                            </div>
                                        </div>
                                    </a>
                                )
                            })}
						{this.props.serverMode === SERVER_MODE.EA_ONLY && (
                            <>
								<div
									className="nav-short-help cursor"
									onClick={(event) => {
										ReactGA.event({
											category: 'Main Navigation',
											action: `Help Clicked`,
										})
									}}
								>
									<div className="short-nav--flex" onClick={this.toggleHelpCard}>
										<div className="short-nav__icon-container icon-dim-40 flex">
											<Help className="help-option-icon icon-dim-24" />
										</div>
										<div className="expandable-active-nav">
											<div className="title-container flex left">Help</div>
										</div>
									</div>
								</div>
								{this.state.showHelpCard && this.renderHelpCard()}
							</>
                        )}
					<div className="short-nav--flex">
						<div className="short-nav__icon-container icon-dim-40 flex">
							<div className="logout-card__initial icon-dim-24 fs-12 logout-card__initial--nav" onClick={this.toggleLogoutCard} style={{ backgroundColor: getRandomColor(email) }}>
								{email[0]}
							</div>
						</div>
						<div><button type="button" className="transparent ellipsis-right expandable-active-nav title-container" onClick={this.toggleLogoutCard}>{email}</button></div>
					</div>
					{this.state.showLogoutCard && this.renderLogout()}
					{this.props.serverMode !== SERVER_MODE.EA_ONLY && (
                            <>
                                <div className="short-nav--flex">
                                    <div className="short-nav__icon-container icon-dim-40 flex ">
                                        <div className="icon-dim-40" onClick={this.toggleMoreOptionCard}>
                                            <MoreOption className="icon-dim-24 ml-8 mt-8 fcn-0 cursor" />
                                        </div>
                                    </div>
                                    <div>
                                        <button
                                            type="button"
                                            className="flex left transparent expandable-active-nav title-container"
                                            onClick={this.toggleMoreOptionCard}
                                        >
                                            More Option
                                        </button>
                                    </div>
                                </div>
                                {this.state.showMoreOptionCard ? this.renderMoreOption() : null}
                            </>
                        )}
					</div>
				</aside>

			</nav>
			<CommandErrorBoundary toggleCommandBar={this.toggleCommandBar}>
				<Command location={this.props.location}
					match={this.props.match}
					history={this.props.history}
					isCommandBarActive={this.state.isCommandBarActive}
					toggleCommandBar={this.toggleCommandBar}
				/>
			</CommandErrorBoundary>
		</>
	}
}
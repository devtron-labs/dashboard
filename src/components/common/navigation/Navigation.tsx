import React, { Component } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { URLS } from '../../../config';
import { ReactComponent as Documentation } from '../../../assets/icons/ic-document.svg'
import { ReactComponent as Discord } from '../../../assets/icons/ic-discord.svg'
import { ReactComponent as Github } from '../../../assets/icons/git/github.svg'
import { ReactComponent as MoreOption } from '../../../assets/icons/ic-more-option.svg'
import { getLoginInfo, isMacOS } from '../index';
import { getRandomColor } from '../helpers/Helpers';
import NavSprite from '../../../assets/icons/navigation-sprite.svg';
import TextLogo from '../../../assets/icons/ic-nav-devtron.svg';
import ReactDOM from 'react-dom';
import ReactGA from 'react-ga';
import './navigation.scss';

interface NavigationProps extends RouteComponentProps<{}> {
	isCommandBarActive: boolean;
	toggleCommandBar: (flag: boolean) => void;
}

const navigationList = [
	{
		title: isMacOS() ? 'Search (⌘+/)' : 'Search (Ctrl+/)',
		type: 'button',
		iconClass: 'nav-short-search',
		href: URLS.APP,
	},
	{
		title: 'Applications',
		type: 'link',
		iconClass: 'nav-short-apps',
		href: URLS.APP,
	},
	{
		title: 'Charts',
		type: 'link',
		iconClass: 'nav-short-helm',
		href: URLS.CHARTS,
	},
	{
		title: 'Deployment Groups',
		type: 'link',
		iconClass: 'nav-short-bulk-actions',
		href: URLS.DEPLOYMENT_GROUPS,
	},
	{
		title: 'Security',
		type: 'link',
		href: URLS.SECURITY,
		iconClass: 'nav-security',
	},
	{
		title: 'Global Configurations',
		type: 'link',
		href: URLS.GLOBAL_CONFIG,
		iconClass: 'nav-short-global'
	},
];

export default class Navigation extends Component<NavigationProps, { loginInfo: any; showLogoutCard: boolean; showMoreOptionCard: boolean; }> {

	constructor(props) {
		super(props);
		this.state = {
			loginInfo: getLoginInfo(),
			showLogoutCard: false,
			showMoreOptionCard: false,
		}
		this.deleteCookie = this.deleteCookie.bind(this);
		this.toggleLogoutCard = this.toggleLogoutCard.bind(this);
		this.toggleMoreOptionCard = this.toggleMoreOptionCard.bind(this);
	}

	toggleLogoutCard() {
		this.setState({ showLogoutCard: !this.state.showLogoutCard })
	}

	toggleMoreOptionCard() {
		this.setState({ showMoreOptionCard: !this.state.showMoreOptionCard })
	}

	deleteCookie(): void {
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
				<div className="logout-card__logout cursor" onClick={this.deleteCookie}>Logout</div>
			</div>
		</div>, document.getElementById('root'))
	}

	renderMoreOption() {
		return ReactDOM.createPortal(<div className="transparent-div" onClick={this.toggleMoreOptionCard}>
			<div className="more-option-card ">
				<div className="more-option-card__title  ">
					<a className="more-option-card__link" href="https://devtron.ai/blog/" target="_blank" rel="noreferrer noopener"><div className="more-option-card__rect " >Devtron Blog</div></a>
				</div>
				<div className="more-option-card__title">
					<a className="more-option-card__link" href="https://github.com/devtron-labs/devtron/issues" target="_blank" rel="noreferrer noopener"><div className="more-option-card__rect ">Create an issue</div></a>
				</div>
				<div className="more-option-card__title">
					<a className="more-option-card__link" href=" https://github.com/devtron-labs/devtron" target="_blank" rel="noreferrer noopener"><div className="more-option-card__rect ">Star GitHub repo</div></a>
				</div>
				<div className="more-option-card__title">
					<a className="more-option-card__link" href="https://github.com/devtron-labs/devtron/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer noopener"><div className="more-option-card__rect ">Become a contributor</div></a>
				</div>
			</div>
		</div>, document.getElementById('root'))
	}

	render() {
		let email: string = this.state.loginInfo ? this.state.loginInfo['email'] || this.state.loginInfo['sub'] : "";
		return <>
			<nav>
				<aside className="short-nav nav-grid nav-grid--collapsed">
					<NavLink to={URLS.APP} >
						<div className="short-nav--flex">
							<svg className="devtron-logo" viewBox="0 0 40 40">
								<use href={`${NavSprite}#nav-short-devtron-logo`}></use>
							</svg>
							<div className="pl-12 pt-10">
								<img src={TextLogo} alt="devtron" className="devtron-logo devtron-logo--text" />
							</div>
						</div>
					</NavLink>
					{navigationList.map((item, index) => {
						if (item.type === "button") return <button type="button" key={index}
							className="transparent"
							onClick={(event) => {
								if (!this.props.isCommandBarActive) {
									ReactGA.event({
										category: 'Command Bar',
										action: 'Open (Click)',
										label: `${this.props.location.pathname.replace(/\d+/g, '')}`,
									});
								}
								else {
									ReactGA.event({
										category: 'Command Bar',
										action: 'Close',
										label: '',
									});
								}
								this.props.toggleCommandBar(!this.props.isCommandBarActive);
							}}>
							<div className="short-nav--flex">
								<div className="svg-container flex ">
									<svg className="short-nav-icon icon-dim-20" viewBox="0 0 24 24">
										<use href={`${NavSprite}#${item.iconClass}`}></use>
									</svg>
								</div>
								<div className="expandable-active-nav expandable-active-nav--no-padding">
									<div className="title-container flex left">
										{item.title}
									</div>
								</div>
							</div>
						</button>
						else return <NavLink to={item.href} key={index} className="" activeClassName="active-nav">
							<div className="short-nav--flex">
								<div className="svg-container flex  ">
									<svg className="short-nav-icon icon-dim-20" viewBox="0 0 24 24">
										<use href={`${NavSprite}#${item.iconClass}`}></use>
									</svg>
								</div>
								<div className="expandable-active-nav  ">
									<div className="title-container flex left">
										{item.title}
									</div>
								</div>
							</div>
						</NavLink>
					})}
					<div></div>
					<div className="short-nav--flex">
						<div><a rel="noreferrer noopener" className="flex icon-dim-40 br-8" href="https://docs.devtron.ai/" target="_blank"><Documentation className="icon-dim-20 fcn-0 cursor" /> </a></div>
						<div><a rel="noreferrer noopener" className="flex left icon-dim-40 expandable-active-nav title-container" href="https://docs.devtron.ai/" target="_blank">Documentation</a></div>
					</div>
					<div className="short-nav--flex">
						<div><a rel="noreferrer noopener" className="flex icon-dim-40 br-8" href="https://github.com/devtron-labs/devtron" target="_blank"><Github className="icon-dim-20 fcn-0 cursor" /></a></div>
						<div><a rel="noreferrer noopener" className="flex left icon-dim-40 expandable-active-nav title-container" href="https://github.com/devtron-labs/devtron" target="_blank">View on GitHub</a></div>
					</div>
					<div className="short-nav--flex">
						<div><a rel="noreferrer noopener" className="flex icon-dim-40 br-8" href="https://discord.com/invite/72JDKy4" target="_blank"><Discord className="icon-dim-20 fcn-0 cursor" /></a></div>
						<div><a rel="noreferrer noopener" className="flex left icon-dim-40 expandable-active-nav title-container" href="https://discord.com/invite/72JDKy4" target="_blank">Discord Community</a></div>
					</div>
					<div className="short-nav--flex">
						<div className="icon-dim-40 flex">
							<div className="logout-card__initial icon-dim-24 fs-12 logout-card__initial--nav" onClick={this.toggleLogoutCard} style={{ backgroundColor: getRandomColor(email) }}>
								{email[0]}
							</div>
						</div>
						<div><button type="button" className="transparent ellipsis-right expandable-active-nav title-container" onClick={this.toggleLogoutCard}>{email}</button></div>
					</div>
					{this.state.showLogoutCard ? this.renderLogout() : null}
					<div className="short-nav--flex">
						<div className="icon-dim-40 flex ">
							<div className="icon-dim-32 ml-5 mt-5" onClick={this.toggleMoreOptionCard} >
								<MoreOption className="icon-dim-24 fcn-0 cursor" />
							</div>
						</div>
						<div><button type="button" className="flex left transparent expandable-active-nav title-container" onClick={this.toggleMoreOptionCard}>More Option</button></div>
					</div>
					{this.state.showMoreOptionCard ? this.renderMoreOption() : null}
				</aside>
			</nav>
		</>
	}
}
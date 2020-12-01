import React, { Component } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { URLS } from '../../../config';
import { ReactComponent as Documentation } from '../../../assets/icons/ic-document.svg'
import { getLoginInfo } from '../index';
import { getRandomColor } from '../helpers/Helpers';
import NavSprite from '../../../assets/icons/navigation-sprite.svg';
import TextLogo from '../../../assets/icons/ic-nav-devtron.svg';
import TagManager from 'react-gtm-module';
import ReactDOM from 'react-dom';
import { Command } from '../../command';
import './navigation.scss';

const navigationList = [
	{
		title: 'Search (⌘+/)',
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
		href: `${URLS.GLOBAL_CONFIG}`,
		iconClass: 'nav-short-global'
	},
];

export default class Navigation extends Component<RouteComponentProps<{}>, { loginInfo: any; showLogoutCard: boolean; isCommandBarActive: boolean; }> {

	constructor(props) {
		super(props);
		this.state = {
			loginInfo: getLoginInfo(),
			showLogoutCard: false,
			isCommandBarActive: false,
		}
		this.deleteCookie = this.deleteCookie.bind(this);
		this.toggleLogoutCard = this.toggleLogoutCard.bind(this);
		this.toggleCommandBar = this.toggleCommandBar.bind(this);
	}

	componentDidMount() {
		const tagManagerArgs = {
			gtmId: 'GTM-59Q5GDK'
		}
		TagManager.initialize(tagManagerArgs)
	}

	toggleLogoutCard() {
		this.setState({ showLogoutCard: !this.state.showLogoutCard })
	}

	toggleCommandBar(flag: boolean): void {
		this.setState({ isCommandBarActive: flag });
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
					<p className="logout-card__initial icon-dim-32 mb-0" style={{ backgroundColor: getRandomColor(email) }}>{email[0]}</p>
				</div>
				<div className="logout-card__logout cursor" onClick={this.deleteCookie}>Logout</div>
			</div>
		</div>, document.getElementById('root'))
	}

	render() {
		let email: string = this.state.loginInfo ? this.state.loginInfo['email'] || this.state.loginInfo['sub'] : "";
		return <>
			<nav>
				<aside className="short-nav nav-grid nav-grid--collapsed">
					<NavLink to={URLS.APP} className="flex">
						<svg className="devtron-logo" viewBox="0 0 40 40">
							<use href={`${NavSprite}#nav-short-devtron-logo`}></use>
						</svg>
					</NavLink>
					{navigationList.map((item, index) => {
						if (item.type === "button") return <button type="button" key={index}
							className="transparent"
							onClick={(e) => this.toggleCommandBar(!this.state.isCommandBarActive)}>
							<div className="svg-container flex">
								<svg className="short-nav-icon icon-dim-24" viewBox="0 0 24 24">
									<use href={`${NavSprite}#${item.iconClass}`}></use>
								</svg>
							</div>
						</button>
						else return <NavLink to={item.href} key={index} className="flex" activeClassName="active-nav">
							<div className="svg-container flex">
								<svg className="short-nav-icon" viewBox="0 0 24 24">
									<use href={`${NavSprite}#${item.iconClass}`}></use>
								</svg>
							</div>
						</NavLink>
					}
					)}
					<div></div>
					<a rel="noreferrer noopener" className="flex icon-dim-40 br-8" href="https://docs.devtron.ai/" target="_blank"><Documentation className="icon-dim-24 fcn-0 cursor" /></a>
					<div className="icon-dim-40 flex">
						<div className="logout-card__initial icon-dim-32 logout-card__initial--nav" onClick={this.toggleLogoutCard} style={{ backgroundColor: getRandomColor(email) }}>
							{email[0]}
						</div>
					</div>
					{this.state.showLogoutCard ? this.renderLogout() : null}
					<div className="hubspot-placeholder"></div>
				</aside>
				<aside className="expanded-nav nav-grid">
					<NavLink to={URLS.APP} className="flex left">
						<img src={TextLogo} alt="devtron" className="devtron-logo devtron-logo--text" />
					</NavLink>
					{navigationList.map((item, index) => {
						if (item.type === "button") return <button type="button" key={index}
							className="transparent"
							onClick={(e) => this.toggleCommandBar(!this.state.isCommandBarActive)}>
							<div className="title-container flex left">
								{item.title}
							</div>
						</button>
						else return <NavLink to={item.href} key={index} className="flex left" activeClassName="active-nav">
							<div className="title-container flex left">
								{item.title}
							</div>
						</NavLink>
					})}
					<div></div>
					<a rel="noreferrer noopener" className="flex left icon-dim-40 title-container" href="https://docs.devtron.ai/" target="_blank">Documentation</a>
					<button type="button" className="transparent ellipsis-right title-container" onClick={this.toggleLogoutCard}>{email}</button>
					<div className="hubspot-placeholder"></div>
				</aside>
			</nav>
			<Command location={this.props.location}
				match={this.props.match}
				history={this.props.history}
				isTabMode={true}
				isCommandBarActive={this.state.isCommandBarActive}
				toggleCommandBar={this.toggleCommandBar}
			/>
		</>
	}
}
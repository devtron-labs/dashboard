import React, { Component } from 'react';
import { NavLink, RouteComponentProps } from 'react-router-dom';
import { ReactComponent as MoreOption } from '../../../assets/icons/ic-more-option.svg'
import { getLoginInfo } from '../index';
import { getRandomColor } from '../helpers/Helpers';
import NavSprite from '../../../assets/icons/navigation-sprite.svg';
import TextLogo from '../../../assets/icons/ic-nav-devtron.svg';
import { ReactComponent as Help } from '../../../assets/icons/ic-help.svg';
import ReactDOM from 'react-dom';
import { Command, CommandErrorBoundary } from '../../command';
import ReactGA from 'react-ga';
import { NavigationList, NavigationListBottom } from './navigation.util';
import { URLS } from '../../../config';
import './navigation.scss';

export interface NavigationState {
	loginInfo: any;
	showHelpCard: boolean;
	showLogoutCard: boolean;
	showMoreOptionCard: boolean;
	isCommandBarActive: boolean;
	isNewVersionAvailable: boolean;
	currentversion: string;
	latestVersion: string;
	showInfobar: boolean;
}
export default class Navigation extends Component<RouteComponentProps<{}>, NavigationState> {

	constructor(props) {
		super(props);
		this.state = {
			loginInfo: getLoginInfo(),
			showLogoutCard: false,
			showMoreOptionCard: false,
			isCommandBarActive: false,
			showHelpCard: false,
			isNewVersionAvailable: false,
			currentversion: "1.8.2",
			latestVersion: "1.8.4",
			showInfobar: true,
		}
		this.deleteCookie = this.deleteCookie.bind(this);
		this.toggleLogoutCard = this.toggleLogoutCard.bind(this);
		this.toggleMoreOptionCard = this.toggleMoreOptionCard.bind(this);
		this.toggleCommandBar = this.toggleCommandBar.bind(this);
		this.toggleHelpCard = this.toggleHelpCard.bind(this);
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

	deleteCookie(): void {
		document.cookie = `argocd.token=; expires=Thu, 01-Jan-1970 00:00:01 GMT;path=/`;
		this.props.history.push('/login');
	}

	renderHelpCard() {
		let isLatest = this.state.currentversion === this.state.latestVersion;
		return ReactDOM.createPortal(<div className="transparent-div" onClick={this.toggleHelpCard}>
			<div className="nav-grid__card help-card p-8 br-4 bcn-0">
				<a href="https://docs.devtron.ai/" rel="noreferrer noopener" target="_blank" className="block pt-10 pb-10 pl-8 pr-8 m-0 fs-13 fw-5 lh-1-54 cn-9">Documentation</a>
				<div className="pt-10 pb-10 pl-8 pr-8">
					<p className="m-0 fs-13 fw-5 lh-1-54 cn-9">What's New{isLatest ? null : <span className="inline-block ml-8 br-5 icon-dim-10 bcy-5"></span>}</p>
					<p className="m-0 fs-12 fw-5 lh-1-54 cb-5">New Version Available({this.state.latestVersion})</p>
				</div>
			</div>
		</div>, document.getElementById('root'))
	}

	renderLogout() {
		let email: string = this.state.loginInfo ? this.state.loginInfo['email'] || this.state.loginInfo['sub'] : "";
		return ReactDOM.createPortal(<div className="transparent-div" onClick={this.toggleLogoutCard}>
			<div className="nav-grid__card logout-card">
				<div className="flexbox flex-justify p-16">
					<div className="logout-card-user ">
						<p className="logout-card__name ellipsis-right">{email}</p>
						<p className="logout-card__email ellipsis-right">{email}</p>
					</div>
					<p className="logout-card__initial fs-16 icon-dim-32 mb-0" style={{ backgroundColor: getRandomColor(email) }}>{email[0]}</p>
				</div>
				<div className="logout-card__logout clickable cursor" onClick={this.deleteCookie}>Logout</div>
			</div>
		</div>, document.getElementById('root'))
	}

	renderMoreOption() {
		return ReactDOM.createPortal(<div className="transparent-div" onClick={this.toggleMoreOptionCard}>
			<div className="nav-grid__card more-option-card">
				<div className="more-option-card__title clickable">
					<a className="more-option-card__link" href="https://devtron.ai/blog/" target="_blank" rel="noreferrer noopener"
						onClick={(event) => {
							ReactGA.event({
								category: 'Main Navigation',
								action: 'Devtron Blog Clicked',
							})
						}}>
						<div className="fs-14 fw-5 cn-9 pt-10 pb-10 pl-16 pr-16">Devtron Blog</div>
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

	render() {
		let email: string = this.state.loginInfo ? this.state.loginInfo['email'] || this.state.loginInfo['sub'] : "";
		let isLatest = this.state.currentversion === this.state.latestVersion;

		return <>
			<nav>
				<aside className="short-nav nav-grid nav-grid--collapsed">
					<NavLink to={URLS.APP} onClick={(event) => {
						ReactGA.event({
							category: 'Main Navigation',
							action: 'Devtron Logo Clicked',
						});
					}}>
						<div className="short-nav--flex">
							<svg className="devtron-logo icon-dim-40" viewBox="0 0 40 40">
								<use href={`${NavSprite}#nav-short-devtron-logo`}></use>
							</svg>
							<div className="pl-12 pt-10">
								<img src={TextLogo} alt="devtron" className="devtron-logo devtron-logo--text" />
							</div>
						</div>
					</NavLink>
					{NavigationList.map((item, index) => {
						if (item.type === "button") return <button type="button" key={index}
							className="transparent"
							onClick={(e) => {
								if (!this.state.isCommandBarActive) {
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
								this.toggleCommandBar(!this.state.isCommandBarActive);
							}}>
							<div className="short-nav--flex">
								<div className="svg-container flex">
									<svg className="short-nav-icon icon-dim-20" viewBox="0 0 24 24">
										<use href={`${NavSprite}#${item.iconClass}`}></use>
									</svg>
								</div>
								<div className="expandable-active-nav">
									<div className="title-container flex left">
										{item.title}
									</div>
								</div>
							</div>
						</button>
						else return <NavLink to={item.href} key={index} onClick={(event) => {
							ReactGA.event({
								category: 'Main Navigation',
								action: `${item.title} Clicked`,
							});
						}} className="" activeClassName="active-nav">
							<div className="short-nav--flex">
								<div className="svg-container flex">
									<svg className="short-nav-icon icon-dim-20" viewBox="0 0 24 24">
										<use href={`${NavSprite}#${item.iconClass}`}></use>
									</svg>
								</div>
								<div className="expandable-active-nav">
									<div className="title-container flex left">
										{item.title}
									</div>
								</div>
							</div>
						</NavLink>
					})}
					<div></div>
					<div className="cursor"
						onClick={(event) => {
							this.toggleHelpCard();
							ReactGA.event({
								category: 'Main Navigation',
								action: `Help Clicked`,
							});
						}}>
						<div className="short-nav--flex">
							<div className="icon-dim-40 flex position-rel">
								{isLatest ? null : <span className="inline-block br-5 icon-dim-10 bcy-5 en-0 bw-2" style={{ position: 'absolute', top: "7px", right: "11px" }}></span>}
								<Help className="icon-dim-24 fcn-0" />
							</div>
							<div className="expandable-active-nav">
								<div className="title-container flex left">
									Help
								</div>
							</div>
						</div>
					</div>
					{this.state.showHelpCard ? this.renderHelpCard() : null}
					{NavigationListBottom.map(((item) => {
						return <a href={item.href} rel="noreferrer noopener" className="" target="_blank"
							onClick={(event) => {
								ReactGA.event({
									category: 'Main Navigation',
									action: `${item.title} Clicked`,
								});
							}}>
							<div className="short-nav--flex">
								<div className="icon-dim-40 flex">
									<svg className="icon-dim-20 cursor" viewBox="0 0 24 24">
										<use href={`${NavSprite}#${item.iconClass}`}></use>
									</svg>
								</div>
								<div className="expandable-active-nav">
									<div className="title-container flex left">
										{item.title}
									</div>
								</div>
							</div>
						</a>
					}))}
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
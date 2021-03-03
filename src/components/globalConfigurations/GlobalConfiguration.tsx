import React, { lazy, useState, useEffect, Suspense } from 'react';
import { Route, NavLink, Router, Switch, Redirect } from 'react-router-dom'
import { useHistory, useLocation } from 'react-router';
import { URLS } from '../../config';
import { Toggle, Progressing, ErrorBoundary } from '../common';
import arrowTriangle from '../../assets/icons/appstatus/ic-dropdown.svg';
import { AddNotification } from '../notifications/AddNotification';
import { ReactComponent as Error } from '../../assets/icons/ic-error-exclamation.svg';
import { ReactComponent as FormError } from '../../assets/icons/ic-warning.svg';
import { getHostURLConfiguration } from '../../services/service';
import { GlobalConfigCheckList } from '../checkList/GlobalConfigCheckList';
import { getAppCheckList } from '../../services/service';
import { showError } from '../common';
import './globalConfigurations.scss';

const HostURLConfiguration = lazy(() => import('../hostURL/HostURL'))
const GitOpsConfiguration = lazy(() => import('../gitOps/GitOpsConfiguration'))
const GitProvider = lazy(() => import('../gitProvider/GitProvider'))
const Docker = lazy(() => import('../dockerRegistry/Docker'))
const ClusterList = lazy(() => import('../cluster/Cluster'))
const ChartRepo = lazy(() => import('../chartRepo/ChartRepo'))
const Notifier = lazy(() => import('../notifications/Notifications'));
const Project = lazy(() => import('../project/ProjectList'));
const UserGroup = lazy(() => import('../userGroups/UserGroup'));
const SSOLogin = lazy(() => import('../login/SSOLogin'));

const ConfigRequired = [
    { name: 'Host URL', href: URLS.GLOBAL_CONFIG_HOST_URL, component: HostURLConfiguration },
    { name: 'GitOps ', href: URLS.GLOBAL_CONFIG_GITOPS, component: GitOpsConfiguration },
    { name: 'Projects', href: URLS.GLOBAL_CONFIG_PROJECT, component: Project },
    { name: 'Clusters & Environments', href: URLS.GLOBAL_CONFIG_CLUSTER, component: ClusterList },
    { name: 'Git accounts', href: URLS.GLOBAL_CONFIG_GIT, component: GitProvider },
    { name: 'Docker registries', href: URLS.GLOBAL_CONFIG_DOCKER, component: Docker },
]

const ConfigOptional = [
    { name: 'Chart Repositories', href: URLS.GLOBAL_CONFIG_CHART, component: ChartRepo },
    { name: 'SSO login services', href: URLS.GLOBAL_CONFIG_LOGIN, component: SSOLogin },
    { name: 'User access', href: URLS.GLOBAL_CONFIG_AUTH, component: UserGroup },
    { name: 'Notifications', href: URLS.GLOBAL_CONFIG_NOTIFIER, component: Notifier },
]

export default function GlobalConfiguration({ ...props }) {
    const location = useLocation();
    const [hostURLConfig, setIsHostURLConfig] = useState(undefined);
    const [checkList, setCheckList] = useState({
        isLoading: true,
        isAppCreated: false,
        appChecklist: undefined,
        chartChecklist: undefined,
        appStageCompleted: 0,
        chartStageCompleted: 0,
    });

    useEffect(() => {
        getHostURLConfig();
        fetchCheckList();
    }, [])

    useEffect(() => {
        if (location.pathname.includes(URLS.GLOBAL_CONFIG_HOST_URL)) {
            getHostURLConfig();
        }

    }, [location.pathname])

    function getHostURLConfig() {
        getHostURLConfiguration().then((response) => {
            setIsHostURLConfig(response.result);
        }).catch((error) => {

        })
    }

    function fetchCheckList(): void {
        getAppCheckList().then((response) => {
            let appChecklist = response.result.appChecklist;
            let chartChecklist = response.result.chartChecklist;
            let appStageArray: number[] = Object.values(appChecklist);
            let chartStageArray: number[] = Object.values(chartChecklist);
            let appStageCompleted: number = appStageArray.reduce((item, sum) => {
                sum = sum + item;
                return sum;
            }, 0)
            let chartStageCompleted: number = chartStageArray.reduce((item, sum) => {
                sum = sum + item;
                return sum;
            }, 0)

            setCheckList({
                isLoading: false,
                isAppCreated: response.result.isAppCreated,
                appChecklist,
                chartChecklist,
                appStageCompleted,
                chartStageCompleted,
            })
        }).catch((error) => {
            showError(error);
        })
    }

    return (
        <main className="global-configuration">
            <section className="page-header flex left">
                <div className="flex left page-header__title">Global configurations</div>
            </section>
            <Router history={useHistory()}>
                <section className="global-configuration__navigation">
                    <NavItem hostURLConfig={hostURLConfig} />
                </section>
                <section className="global-configuration__component-wrapper">
                    <Suspense fallback={<Progressing pageLoader />}>
                        <ErrorBoundary>
                            <Body getHostURLConfig={getHostURLConfig} checkList={checkList} />
                        </ErrorBoundary>
                    </Suspense>
                </section>
            </Router>
        </main>
    )
}

function NavItem({ hostURLConfig }) {
    const location = useLocation();
    let showError = (!hostURLConfig || hostURLConfig.value !== window.location.origin) && !location.pathname.includes(URLS.GLOBAL_CONFIG_HOST_URL);

    return <div className="flex column left">
        {ConfigRequired.map(route => <NavLink to={`${route.href}`} key={route.href} activeClassName="active-route"><div className="flexbox flex-justify"><div>{route.name}</div>
            {route.href.includes(URLS.GLOBAL_CONFIG_HOST_URL) && showError ? <Error className="global-configuration__error-icon icon-dim-20" /> : ''}</div>
        </NavLink>)}
        <hr className="mt-8 mb-8 w-100 checklist__divider" />
        {ConfigOptional.map(route => <NavLink to={`${route.href}`} key={route.href} activeClassName="active-route"><div className="flexbox flex-justify"><div>{route.name}</div>
            {route.href.includes(URLS.GLOBAL_CONFIG_HOST_URL) && showError ? <Error className="global-configuration__error-icon icon-dim-20" /> : ''}</div>
        </NavLink>)}
    </div>
}

function Body({ getHostURLConfig, checkList }) {
    const location = useLocation();

    return <Switch location={location}>
        <Route path={URLS.GLOBAL_CONFIG_HOST_URL} render={(props) => {
            return <div className="flexbox h-100">
                <HostURLConfiguration {...props} refreshGlobalConfig={getHostURLConfig} />
                <GlobalConfigCheckList {...checkList} {...props} />
            </div>
        }} />
        <Route path={URLS.GLOBAL_CONFIG_GITOPS} render={(props) => {
            return <div className="flexbox h-100">
                <GitOpsConfiguration {...props} />
                <GlobalConfigCheckList {...checkList} {...props} />
            </div>
        }} />
        <Route path={URLS.GLOBAL_CONFIG_PROJECT} render={(props) => {
            return <div className="flexbox h-100">
                <Project {...props} />
                <GlobalConfigCheckList {...checkList} {...props} />
            </div>
        }} />
        <Route path={URLS.GLOBAL_CONFIG_CLUSTER} render={(props) => {
            return <div className="flexbox h-100">
                <ClusterList {...props} />
                <GlobalConfigCheckList {...checkList} {...props} />
            </div>
        }} />
        <Route path={URLS.GLOBAL_CONFIG_GIT} render={(props) => {
            return <div className="flexbox h-100">
                <GitProvider {...props} />
                <GlobalConfigCheckList {...checkList} {...props} />
            </div>
        }} />
        <Route path={URLS.GLOBAL_CONFIG_DOCKER} render={(props) => {
            return <div className="flexbox h-100">
                <Docker {...props} />
                <GlobalConfigCheckList {...checkList} {...props} />
            </div>
        }} />

        <Route path={URLS.GLOBAL_CONFIG_CHART} render={(props) => {
            return <ChartRepo />
        }} />
        <Route path={URLS.GLOBAL_CONFIG_LOGIN} render={(props) => {
            return <SSOLogin {...props} />
        }} />
        <Route path={URLS.GLOBAL_CONFIG_AUTH} render={(props) => {
            return <UserGroup />
        }} />
        <Route path={URLS.GLOBAL_CONFIG_NOTIFIER} render={(props) => {
            return <Notifier {...props} />
        }} />
        <Route path={`${URLS.GLOBAL_CONFIG_NOTIFIER}/edit`} render={(props) => {
            return <AddNotification {...props} />
        }} />
        <Redirect to={URLS.GLOBAL_CONFIG_HOST_URL} />
    </Switch>
}

function Logo({ src = "", style = {}, className = "", children = null }) {
    return <>
        {src && <img src={src} alt="" className={`list__logo ${className}`} style={style} />}
        {children}
    </>
}

function Title({ title = "", subtitle = "", style = {}, className = "", tag = "", ...props }) {
    return <div className="flex column left">
        <div className={`list__title ${className}`}>{title} {tag && <span className="tag">{tag}</span>}</div>
        {subtitle && <div className={`list__subtitle ${className}`}>{subtitle}</div>}
    </div>
}

function ListToggle({ onSelect, enabled = false, ...props }) {
    return <Toggle {...props} onSelect={onSelect} selected={enabled} />
}

function DropDown({ className = "", style = {}, src = null, ...props }) {
    if (React.isValidElement(src)) return src
    return <img {...props} src={src || arrowTriangle} alt="" className={`list__arrow ${className}`} style={style} />
}

export function List({ children = null, className = "", ...props }) {
    return <div className={`list ${className}`} {...props}>
        {children}
    </div>
}

export function CustomInput({ name, value, error, onChange, label, type = "text", disabled = false, autoComplete = "off", labelClassName = "" }) {
    return <div className="flex column left top">
        <label className={`form__label ${labelClassName}`} >{label}</label>
        <input type={type}
            name={name}
            autoComplete="off"
            className="form__input"
            onChange={e => { e.persist(); onChange(e) }}
            value={value}
            disabled={disabled}
        />
        {error && <div className="form__error">{error}</div>}
    </div>
}

export function ProtectedInput({ name, value, error, onChange, label, type = "text", tabIndex = 1, disabled = false, hidden = true, labelClassName = "" }) {
    const [shown, toggleShown] = useState(false)
    useEffect(() => {
        toggleShown(!hidden)
    }, [hidden])

    return (
        <div className="flex column left top form__label">
            <label htmlFor="" className={`${labelClassName}`}>{label}</label>
            <div className="position-rel w-100">
                <input type={shown ? 'text' : 'password'} tabIndex={tabIndex}
                    className={error ? "form__input form__input--error" : "form__input"}
                    name={name}
                    onChange={e => { e.persist(); onChange(e) }}
                    value={value}
                    disabled={disabled} />
                <ShowHide className="protected-input__toggle" hidden={!shown} defaultOnClick={e => toggleShown(!shown)} disabled={disabled} />
            </div>
            {error && <div className="form__error">
                <FormError className="form__icon form__icon--error" />
                {error}
            </div>}
        </div>
    )
}

export function ShowHide({ hidden = true, className = "", onClick = null, defaultOnClick = null, disabled = false }) {
    return hidden ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className} viewBox="0 0 24 24" onClick={disabled ? () => { } : (onClick || defaultOnClick)}>
        <g fill="none" fillRule="evenodd">
            <path d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z" />
            <path fill="#767D84" d="M12 6a9.77 9.77 0 0 1 8.82 5.5 9.647 9.647 0 0 1-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm-1.07 1.14L13 9.21c.57.25 1.03.71 1.28 1.28l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.05-1.07.14zM2.01 3.87l2.68 2.68A11.738 11.738 0 0 0 1 11.5C2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02a2.5 2.5 0 0 1-2.5-2.5c0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75a4.6 4.6 0 0 0-.36 1.78 4.507 4.507 0 0 0 6.27 4.14l.98.98c-.88.24-1.8.38-2.75.38a9.77 9.77 0 0 1-8.82-5.5c.7-1.43 1.72-2.61 2.93-3.53z" />
        </g>
    </svg>
        :
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" className={className} viewBox="0 0 24 24" onClick={disabled ? () => { } : (onClick || defaultOnClick)}>
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h24v24H0z" />
                <path fill="#959BA1" d="M12 6a9.77 9.77 0 0 1 8.82 5.5A9.77 9.77 0 0 1 12 17a9.77 9.77 0 0 1-8.82-5.5A9.77 9.77 0 0 1 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z" />
            </g>
        </svg>
}


ProtectedInput.ShowHide = ShowHide
List.Logo = Logo
List.Title = Title
List.Toggle = ListToggle
List.DropDown = DropDown
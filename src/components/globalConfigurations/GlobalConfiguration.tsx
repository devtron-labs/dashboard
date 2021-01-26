import React, { lazy, useState, useEffect, Suspense } from 'react';
import { Route, NavLink, Router, Switch, Redirect } from 'react-router-dom'
import { useHistory, useLocation } from 'react-router';
import { URLS } from '../../config';
import './globalConfigurations.scss';
import { Toggle, Progressing, ErrorBoundary } from '../common';
import arrowTriangle from '../../assets/icons/appstatus/ic-dropdown.svg';
import { AddNotification } from '../notifications/AddNotification';

const GitProvider = lazy(() => import('../gitProvider/GitProvider'))
const Docker = lazy(() => import('../dockerRegistry/Docker'))
const ClusterList = lazy(() => import('../cluster/Cluster'))
const ChartRepo = lazy(() => import('../chartRepo/ChartRepo'))
const Notifier = lazy(() => import('../notifications/Notifications'));
const Project = lazy(() => import('../project/ProjectList'));
const UserGroup = lazy(() => import('../userGroups/UserGroup'));
const SSOLogin = lazy(()=> import('../login/SSOLogin'));

const routes = [
    { name: 'Git accounts', href: URLS.GLOBAL_CONFIG_GIT, component: GitProvider },
    { name: 'Docker registries', href: URLS.GLOBAL_CONFIG_DOCKER, component: Docker },
    { name: 'Clusters & Environments', href: URLS.GLOBAL_CONFIG_CLUSTER, component: ClusterList },
    { name: 'Chart Repository', href: URLS.GLOBAL_CONFIG_CHART, component: ChartRepo},
    { name: 'Projects', href: URLS.GLOBAL_CONFIG_PROJECT, component: Project },
    { name: 'User access', href: URLS.GLOBAL_CONFIG_AUTH, component: UserGroup },
    { name: 'Notification', href: URLS.GLOBAL_CONFIG_NOTIFIER, component: Notifier },
    { name: 'SSO Login Services', href:URLS.GLOBAL_CONFIG_LOGIN, component: SSOLogin},
]

export default function GlobalConfiguration({ ...props }) {
    return (
        <main className="global-configuration">
            <section className="page-header flex left">
                <div className="flex left page-header__title">Global configurations</div>
            </section>
            <Router history={useHistory()}>
                <section className="global-configuration__navigation">
                    <LeftNav />
                </section>
                <section className="global-configuration__component-wrapper">
                    <Suspense fallback={<Progressing pageLoader />}>
                        <ErrorBoundary>
                            <Body />
                        </ErrorBoundary>
                    </Suspense>
                </section>
            </Router>
        </main>
    )
}

function LeftNav({ ...props }) {
    return (
        <div className="flex column left">
            {routes.map(route => <NavLink to={`${route.href}`} key={route.href} activeClassName="active-route">{route.name}</NavLink>)}
        </div>
    )
}

function Body({ ...props }) {
    const location = useLocation()
    return (
        <Switch location={location}>
            <Route path={`${URLS.GLOBAL_CONFIG_NOTIFIER}/edit`} render={(props) => <AddNotification history={props.history} match={props.match} location={props.location} />} />
            {routes.map(({ href, component: Component }) => <Route key={href} path={href} component={Component} />)}
            <Redirect to={URLS.GLOBAL_CONFIG_GIT} />
        </Switch>
    )
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

List.Logo = Logo
List.Title = Title
List.Toggle = ListToggle
List.DropDown = DropDown

export function List({ children = null, className = "", ...props }) {
    return <div className={`list ${className}`} {...props}>
        {children}
    </div>
}

export function CustomInput({ name, value, error, onChange, label, type = "text", disabled = false, autoComplete="off" }) {
    return <div className="flex column left top">
        <label className="form__label">{label}</label>
        <input type={type}
            name={name}
            autoComplete="off"
            className="form__input"
            onChange={e => { e.persist(); onChange(e) }}
            value={value}
            disabled={disabled} />
        {error && <div className="form__error">{error}</div>}
    </div>
}

export function ProtectedInput({ name, value, error, onChange, label, type = "text", disabled = false, hidden = true }) {
    const [shown, toggleShown] = useState(false)
    useEffect(() => {
        toggleShown(!hidden)
    }, [hidden])

    return (
        <div className="flex column left top">
            <label htmlFor="" className="form__label">{label}</label>
            <div className="flex protected-input-container">
                <input type={shown ? 'text' : 'password'} name={name} onChange={e => { e.persist(); onChange(e) }} value={value} disabled={disabled} />
                <ShowHide hidden={!shown} defaultOnClick={e => toggleShown(!shown)} disabled={disabled} />
            </div>
            {error && <div className="form__error">{error}</div>}
        </div>
    )
}

export function ShowHide({ hidden = true, onClick = null, defaultOnClick = null, disabled = false }) {
    return hidden ? <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" onClick={disabled ? () => { } : (onClick || defaultOnClick)}>
        <g fill="none" fillRule="evenodd">
            <path d="M0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0zm0 0h24v24H0V0z" />
            <path fill="#767D84" d="M12 6a9.77 9.77 0 0 1 8.82 5.5 9.647 9.647 0 0 1-2.41 3.12l1.41 1.41c1.39-1.23 2.49-2.77 3.18-4.53C21.27 7.11 17 4 12 4c-1.27 0-2.49.2-3.64.57l1.65 1.65C10.66 6.09 11.32 6 12 6zm-1.07 1.14L13 9.21c.57.25 1.03.71 1.28 1.28l2.07 2.07c.08-.34.14-.7.14-1.07C16.5 9.01 14.48 7 12 7c-.37 0-.72.05-1.07.14zM2.01 3.87l2.68 2.68A11.738 11.738 0 0 0 1 11.5C2.73 15.89 7 19 12 19c1.52 0 2.98-.29 4.32-.82l3.42 3.42 1.41-1.41L3.42 2.45 2.01 3.87zm7.5 7.5l2.61 2.61c-.04.01-.08.02-.12.02a2.5 2.5 0 0 1-2.5-2.5c0-.05.01-.08.01-.13zm-3.4-3.4l1.75 1.75a4.6 4.6 0 0 0-.36 1.78 4.507 4.507 0 0 0 6.27 4.14l.98.98c-.88.24-1.8.38-2.75.38a9.77 9.77 0 0 1-8.82-5.5c.7-1.43 1.72-2.61 2.93-3.53z" />
        </g>
    </svg>
        :
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" onClick={disabled ? () => { } : (onClick || defaultOnClick)}>
            <g fill="none" fillRule="evenodd">
                <path d="M0 0h24v24H0z" />
                <path fill="#959BA1" d="M12 6a9.77 9.77 0 0 1 8.82 5.5A9.77 9.77 0 0 1 12 17a9.77 9.77 0 0 1-8.82-5.5A9.77 9.77 0 0 1 12 6m0-2C7 4 2.73 7.11 1 11.5 2.73 15.89 7 19 12 19s9.27-3.11 11-7.5C21.27 7.11 17 4 12 4zm0 5a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5m0-2c-2.48 0-4.5 2.02-4.5 4.5S9.52 16 12 16s4.5-2.02 4.5-4.5S14.48 7 12 7z" />
            </g>
        </svg>
}


ProtectedInput.ShowHide = ShowHide
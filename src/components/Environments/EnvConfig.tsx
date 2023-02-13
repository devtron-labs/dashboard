import React, { Suspense, useEffect, useState } from 'react'
import { NavLink, Route, Switch, useLocation, useParams, useRouteMatch } from 'react-router-dom'
import { URLS } from '../../config'
import { ReactComponent as Dropdown } from '../../assets/icons/ic-chevron-down.svg'
import { ErrorBoundary, Progressing } from '../common'
import EnvironmentOverride from '../EnvironmentOverride/EnvironmentOverride'

export default function EnvConfig() {
    const [environments, setEnvironments] = useState([])
    return <div className='env-compose'>
        <div className='env-compose__nav flex column left top dc__position-rel dc__overflow-scroll'><EnvApplication /></div>
        <div className='env-compose__main'><AppOverrides environments={environments} setEnvironments={setEnvironments} /></div>
    </div>
}

function EnvApplication() {
    const apps = [21,19]
    return (
        <div className="pt-4 pb-4 w-100">
            <div className="cn-6 pl-8 pr-8  fs-12 fw-6 w-100">APPLICATION</div>
            {apps.map((appId) => <ApplicationRoutes appId={appId} />)}
        </div>
    )
}

function ApplicationRoutes({appId}) {
    const { url } = useRouteMatch()
    const location = useLocation()
    const LINK = `${url}/${appId}`
    const [collapsed, toggleCollapsed] = useState(location.pathname.includes(`${LINK}/`) ? false : true)

    useEffect(() => {
        if (!location.pathname.includes(`${LINK}/`) && !collapsed) {
            toggleCollapsed(true)
        }
    }, [location.pathname])

    const handleNavItemClick = () => {
        toggleCollapsed(!collapsed)
    }
    return (
        <div className="flex column left environment-route-wrapper top">
            <div
                className={`env-compose__nav-item flex cursor ${collapsed ? 'fw-4' : 'fw-6 no-hover'}`}
                onClick={handleNavItemClick}
            >
                {'devtron'}
                <Dropdown
                    className="icon-dim-24 rotate"
                    style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                />
            </div>
            {!collapsed && (
                <div className="environment-routes pl-8 w-100">
                    <NavLink className="env-compose__nav-item cursor" to={`${LINK}/deployment-template`}>
                        Deployment template
                    </NavLink>
                    <NavLink className="env-compose__nav-item cursor" to={`${LINK}/configmap`}>
                        ConfigMaps
                    </NavLink>
                    <NavLink className="env-compose__nav-item cursor" to={`${LINK}/secrets`}>
                        Secrets
                    </NavLink>
                </div>
            )}
        </div>
    )
}


function AppOverrides({environments, setEnvironments}) {
    const { path,url } = useRouteMatch()
    const location = useLocation()
    const params = useParams<{ appId: string; envId: string }>()
    console.log(url,location);
    
    return (
        <ErrorBoundary>
            <Suspense fallback={<Progressing pageLoader />}>
                <Switch>
                    <Route
                        path={`${path}/:appId(\\d+)?`}
                        render={(props) => (
                            <EnvironmentOverride environments={environments} setEnvironments={setEnvironments} />
                        )}
                    />
                </Switch>
            </Suspense>
        </ErrorBoundary>
    )
}
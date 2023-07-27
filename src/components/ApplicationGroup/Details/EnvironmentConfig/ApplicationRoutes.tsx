import React, { useState, useEffect } from 'react'
import { useRouteMatch, useLocation, NavLink, useParams } from 'react-router-dom'
import { ReactComponent as Dropdown } from '../../../../assets/icons/ic-chevron-down.svg'
import { ReactComponent as ProtectedIcon } from '../../../../assets/icons/ic-shield-protect-fill.svg'
import { ApplicationRouteType } from '../../AppGroup.types'

export default function ApplicationRoute({ envListData }: ApplicationRouteType) {
    const { appId } = useParams<{ envId: string; appId: string }>()
    const { url } = useRouteMatch()
    const location = useLocation()
    const oldUrlSubstring = `/edit/${appId}`
    const newUrlSubstring = `/edit/${envListData.id}`
    const basePath = url.replace(oldUrlSubstring, newUrlSubstring)
    const [collapsed, toggleCollapsed] = useState(+appId === envListData.id)

    useEffect(() => {
        if (+appId !== envListData.id) {
            toggleCollapsed(true)
        } else {
            toggleCollapsed(false)
        }
    }, [location.pathname])

    const handleNavItemClick = () => {
        toggleCollapsed(!collapsed)
    }
    return (
        <div className="flex column left environment-route-wrapper top">
            <div
                data-testid={`app-group-dropdown-${envListData.name}`}
                className={`env-compose__nav-item flex cursor ${collapsed ? 'fw-4' : 'fw-6 no-hover'}`}
                onClick={handleNavItemClick}
            >
                <div className="flex left">
                    <Dropdown
                        className="icon-dim-24 rotate mr-4"
                        style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                    />
                    <div className="dc__truncate-text dc__mxw-155">{envListData.name}</div>
                </div>
                {envListData.isProtected && <ProtectedIcon className="mw-20 icon-dim-20" />}
            </div>
            {!collapsed && (
                <div className="environment-routes pl-28 w-100">
                    <NavLink
                        data-testid={`application-group-deployment-template-${envListData.name}`}
                        className="env-compose__nav-item cursor"
                        to={`${basePath}/deployment-template`}
                    >
                        Deployment template
                    </NavLink>
                    <NavLink
                        data-testid={`application-group-config-map-${envListData.name}`}
                        className="env-compose__nav-item cursor"
                        to={`${basePath}/configmap`}
                    >
                        ConfigMaps
                    </NavLink>
                    <NavLink
                        data-testid={`application-group-secret-${envListData.name}`}
                        className="env-compose__nav-item cursor"
                        to={`${basePath}/secrets`}
                    >
                        Secrets
                    </NavLink>
                </div>
            )}
        </div>
    )
}

import React, { useState, useEffect } from 'react'
import { useRouteMatch, useLocation, NavLink } from 'react-router-dom'
import { ApplicationRouteType } from '../EnvironmentGroup.types'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'

export default function ApplicationRoute({ envListData }: ApplicationRouteType) {
    const { url } = useRouteMatch()
    const location = useLocation()
    const newPath = `/${location.pathname.split('/').splice(1, 4).join('/')}`
    const link = `${url}/${envListData.id}`
    const [collapsed, toggleCollapsed] = useState(newPath !== link)

    useEffect(() => {
        if (newPath !== link && !collapsed) {
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
                <div className="dc__truncate-text dc__mxw-180">{envListData.name}</div>
                <Dropdown
                    className="icon-dim-24 rotate"
                    style={{ ['--rotateBy' as any]: `${Number(!collapsed) * 180}deg` }}
                />
            </div>
            {!collapsed && (
                <div className="environment-routes pl-8 w-100">
                    <NavLink className="env-compose__nav-item cursor" to={`${link}/deployment-template`}>
                        Deployment template
                    </NavLink>
                    <NavLink className="env-compose__nav-item cursor" to={`${link}/configmap`}>
                        ConfigMaps
                    </NavLink>
                    <NavLink className="env-compose__nav-item cursor" to={`${link}/secrets`}>
                        Secrets
                    </NavLink>
                </div>
            )}
        </div>
    )
}

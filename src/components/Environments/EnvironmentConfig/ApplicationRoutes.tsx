import React, { useState, useEffect } from 'react'
import { useParams, useRouteMatch, useLocation, NavLink } from 'react-router-dom'
import { ConfigAppList } from '../EnvironmentGroup.types'
import { ReactComponent as Dropdown } from '../../../assets/icons/ic-chevron-down.svg'

export default function ApplicationRoutes({ envListData }: { envListData: ConfigAppList }) {
    const { url } = useRouteMatch()
    const location = useLocation()
    const LINK = `${url}/${envListData.id}`
    const [collapsed, toggleCollapsed] = useState(!location.pathname.match(LINK))
    

    useEffect(() => {
        if (!!location.pathname.match(LINK) && !collapsed) {
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
                {envListData.name}
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

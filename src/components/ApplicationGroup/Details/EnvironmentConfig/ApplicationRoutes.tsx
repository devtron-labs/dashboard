import React, { useState, useEffect } from 'react'
import { useRouteMatch, useLocation, NavLink, useParams } from 'react-router-dom'
import { ReactComponent as Dropdown } from '../../../../assets/icons/ic-chevron-down.svg'
import { ApplicationRouteType } from '../../AppGroup.types'

export default function ApplicationRoute({ envListData }: ApplicationRouteType) {
    const { appId } = useParams<{ envId: string; appId: string }>()
    const { url } = useRouteMatch()
    const location = useLocation()
    const basePath = url.replace(`edit/${appId}`, `edit/${envListData.id}`)
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
                    <NavLink className="env-compose__nav-item cursor" to={`${basePath}/deployment-template`}>
                        Deployment template
                    </NavLink>
                    <NavLink className="env-compose__nav-item cursor" to={`${basePath}/configmap`}>
                        ConfigMaps
                    </NavLink>
                    <NavLink className="env-compose__nav-item cursor" to={`${basePath}/secrets`}>
                        Secrets
                    </NavLink>
                </div>
            )}
        </div>
    )
}

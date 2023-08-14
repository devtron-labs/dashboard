import React, { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { SERVER_MODE, URLS } from '../../../config'
import { mainContext } from '../../common/navigation/NavigationRoutes'

function AddChartSource({className}: {className?: string}) {
    const { serverMode } = useContext(mainContext)

    return (
        <div className={`chart-list__add w-200 en-2 bw-1 br-4 bcn-0 fw-4 fs-13 cn-9 mt-8 ${className}`}>
            <NavLink className="add-repo-row dc__no-decor pl-8 pr-8 flex left cn-9" to={URLS.GLOBAL_CONFIG_CHART}>
                Add Chart repositories
            </NavLink>

            {serverMode !== SERVER_MODE.EA_ONLY && (
                <NavLink
                    className="add-repo-row dc__no-decor pl-8 pr-8 flex left cn-9"
                    to={`${URLS.GLOBAL_CONFIG_DOCKER}/0`}
                >
                    Add OCI Registries
                </NavLink>
            )}
        </div>
    )
}

export default AddChartSource

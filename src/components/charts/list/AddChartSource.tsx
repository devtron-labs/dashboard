import React from 'react'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../../config'

function AddChartSource() {
    return (
        <div className="chart-list__add w-200 en-2 bw-1 br-4 bcn-0 fw-4 fs-13 cn-9 mt-8">
    {        console.log(' hi')}
            <NavLink className="dc__no-decor pl-8 pr-8 flex left cn-9" to={URLS.GLOBAL_CONFIG_CHART}>
                Add Chart repositories
            </NavLink>

            <NavLink className="dc__no-decor pl-8 pr-8 flex left cn-9" to={`${URLS.GLOBAL_CONFIG_DOCKER}/0`}>
                Add OCI Registries
            </NavLink>
        </div>
    )
}

export default AddChartSource

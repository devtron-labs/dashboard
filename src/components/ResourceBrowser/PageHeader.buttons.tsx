import React from 'react'
import { NavLink } from 'react-router-dom'
import { URLS } from '../../config'
import { ReactComponent as Add } from '../../assets/icons/ic-add.svg'

export const renderCreateResourceButton = (callback: (e: React.MouseEvent) => void): (() => JSX.Element) => {
    return () => (
        <div>
            <button
                className="cursor flex cta small h-28 pl-8 pr-10 pt-5 pb-5 lh-n fcb-5 mr-16"
                data-testid="create-resource"
                type="button"
                onClick={callback}
            >
                <Add className="icon-dim-16 fcb-5 mr-5" />
                Create resource
            </button>
            <span className="dc__divider" />
        </div>
    )
}

export const addClusterButton = (): JSX.Element => (
    <div>
        <NavLink
            className="flex dc__no-decor cta small h-28 pl-8 pr-10 pt-5 pb-5 lh-n fcb-5 mr-16"
            to={URLS.GLOBAL_CONFIG_CLUSTER}
        >
            <Add data-testid="add_cluster_button" className="icon-dim-16 mr-4 fcb-5 dc__vertical-align-middle" />
            Add cluster
        </NavLink>
        <span className="dc__divider" />
    </div>
)

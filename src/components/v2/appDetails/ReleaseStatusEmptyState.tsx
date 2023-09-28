import React from 'react'
import { ReactComponent as InfoIcon } from '../../../assets/icons/info-filled.svg'
function ReleaseStatusEmptyState({ message, description }) {
    return (
        <div className="bcn-0 flex h-100">
            <div className="flex column h-100 w-50">
                <InfoIcon className="icon-dim-24 info-icon-n6" />
                <span className="mt-8 cn-9 fs-13 fw-6 lh-20 dc__text-center">{message}</span>
                {description && <p className="mt-4 cn-7 fs-13 fw-4 lh-20 dc__text-justify">{description}</p>}
            </div>
        </div>
    )
}

export default ReleaseStatusEmptyState

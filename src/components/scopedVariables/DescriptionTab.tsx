import React from 'react'
import { DescriptorTabProps } from './types'
import { DESCRIPTOR_TABS } from './constants'

const DescriptorTab = ({ handleCurrentViewUpdate, currentView, targetView }: DescriptorTabProps) => {
    const handleViewChange = () => {
        handleCurrentViewUpdate(targetView)
    }

    return (
        <button
            className={`scoped-variables-tab pt-8 pr-16 pb-0 pl-0 fs-13 fw-4 lh-20 dc__capitalize cn-9 dc__no-background flex column dc__content-center dc__align-start dc__no-border dc__outline-none-imp ${
                currentView === targetView ? 'scoped-variables-active-tab' : ''
            }`}
            type="button"
            onClick={handleViewChange}
        >
            <div className="pb-6">{DESCRIPTOR_TABS[targetView]}</div>
        </button>
    )
}

export default DescriptorTab

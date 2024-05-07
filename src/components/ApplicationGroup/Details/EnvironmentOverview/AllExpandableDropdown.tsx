import React from 'react'
import { AllExpandableDropdownTypes } from '../../AppGroup.types'

export const AllExpandableDropdown = ({
    expandedAppIds,
    setExpandedAppIds,
    bulkRotatePodsMap,
    SvgImage,
    iconClassName,
    dropdownLabel = '',
    isExpandableButtonClicked,
    setExpandableButtonClicked,
}: AllExpandableDropdownTypes) => {
    const handleAllExpand = () => {
        if (expandedAppIds.length === Object.keys(bulkRotatePodsMap).length) {
            setExpandedAppIds([])
            setExpandableButtonClicked(false)
        } else {
            setExpandedAppIds(Object.keys(bulkRotatePodsMap).map((appId) => +appId))
            setExpandableButtonClicked(!isExpandableButtonClicked)
        }
    }

    return (
        <div className="flex dc__gap-4 cursor" onClick={handleAllExpand}>
            {dropdownLabel}
            <SvgImage className={`rotate fcn-9 flex ${iconClassName}`} onClick={handleAllExpand} />
        </div>
    )
}

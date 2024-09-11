/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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

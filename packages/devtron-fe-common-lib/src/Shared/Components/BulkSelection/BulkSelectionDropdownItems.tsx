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

import { BulkSelectionDropdownItemsProps } from './types'

const BulkSelectionDropdownItems = <T,>({
    locator,
    label,
    isSelected,
    handleBulkSelection,
    icon: Icon,
    iconClass,
}: BulkSelectionDropdownItemsProps<T>) => {
    const handleSelect = () => {
        handleBulkSelection({
            action: locator,
        })
    }

    return (
        <button
            data-testid={`bulk-action-${locator}`}
            onClick={handleSelect}
            className={`dc__no-border dc__outline-none-imp w-100 flexbox h-32 dc__align-items-center pt-6 pr-8 pb-6 pl-8 dc__gap-8 ${
                isSelected
                    ? 'cb-5 bcb-1 icon-stroke-b5 fs-13 fw-6 lh-20'
                    : 'dc__no-background cn-9 fs-13 fw-4 lh-20 dc__hover-n50'
            }`}
            type="button"
        >
            <Icon className={`icon-dim-16 ${iconClass || ''}`} />
            {label}
        </button>
    )
}

export default BulkSelectionDropdownItems

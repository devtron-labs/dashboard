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

import { DESCRIPTOR_TABS } from './constants'
import { DescriptorTabProps } from './types'

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

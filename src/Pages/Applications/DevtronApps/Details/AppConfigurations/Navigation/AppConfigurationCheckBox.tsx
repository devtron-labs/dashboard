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

import { CustomNavItemsType } from '../AppConfig.types'

interface HelpBoxType {
    selectedNav: CustomNavItemsType
    isJobView?: boolean
    totalSteps?: number
}

const HelpBox = ({ selectedNav, isJobView, totalSteps }: HelpBoxType) => (
    <div className="help-container">
        <div>
            {selectedNav?.currentStep}/{isJobView ? '2' : totalSteps} Completed
        </div>
        <div className="progress-container">
            <div className="progress-tracker" style={{ width: `${selectedNav?.flowCompletionPercent}%` }} />
        </div>
        <div className="fs-13 font-weight-600">{selectedNav?.title}</div>
        <div className="need-help font-weight-600">
            <a className="dc__link" href={selectedNav?.supportDocumentURL} target="_blank" rel="noreferrer noopener">
                Need help?
            </a>
        </div>
    </div>
)

export default HelpBox

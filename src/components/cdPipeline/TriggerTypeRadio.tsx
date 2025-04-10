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

import { InfoIconTippy, RadioGroup, RadioGroupItem, TriggerType } from '@devtron-labs/devtron-fe-common-lib'

import { TriggerTypeRadioProps } from './cdPipeline.types'

const TriggerTypeRadioInfoTippyAdditionalContentItem = ({
    heading,
    description,
}: {
    heading: string
    description: string
}) => (
    <div>
        <span className="cn-9 fs-13 fw-6 lh-20">{heading}:&nbsp;</span>
        <span className="cn-9 fs-13 fw-4 lh-20">{description}</span>
    </div>
)

const TriggerTypeRadioInfoTippyAdditionalContent = () => (
    <div className="flexbox-col dc__gap-20 p-12">
        <TriggerTypeRadioInfoTippyAdditionalContentItem
            heading="Manual"
            description="Users can trigger the pipeline manually."
        />
        <TriggerTypeRadioInfoTippyAdditionalContentItem
            heading="Automatic"
            description="Pipeline triggers automatically when a new container image is received from the previous stage. Users can also trigger the pipeline manually."
        />
    </div>
)

const TriggerTypeRadio = ({ value, onChange }: TriggerTypeRadioProps) => (
    <div className="cd-pipeline__trigger-type">
        <div className="flexbox dc__gap-6">
            <span className="cn-7 fs-13 fw-4 lh-20">When do you want the pipeline to execute?</span>
            <InfoIconTippy
                heading="Pipeline trigger mode"
                additionalContent={<TriggerTypeRadioInfoTippyAdditionalContent />}
            />
        </div>

        <RadioGroup value={value} name="trigger-type" onChange={onChange} className="chartrepo-type__radio-group">
            <RadioGroupItem dataTestId="cd-auto-mode-button" value={TriggerType.Auto}>
                Automatic
            </RadioGroupItem>
            <RadioGroupItem dataTestId="cd-manual-mode-button" value={TriggerType.Manual}>
                Manual
            </RadioGroupItem>
        </RadioGroup>
    </div>
)

export default TriggerTypeRadio

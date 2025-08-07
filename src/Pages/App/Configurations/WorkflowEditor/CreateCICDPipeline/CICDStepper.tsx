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

import { Icon } from '@devtron-labs/devtron-fe-common-lib'

import { CICDStepperProps } from './types'

export const CICDStepper = ({ config }: CICDStepperProps) => (
    <div className="ci-cd-pipeline__stepper-container flexbox-col flex-grow-1 dc__align-self-start">
        {config.map(({ id, icon, title, content }) => (
            <div key={id} className="ci-cd-pipeline__stepper flex left top dc__gap-8">
                <div className="dc__position-rel flex p-7 br-6 border__secondary bg__modal--primary">
                    <Icon name={icon} color={null} size={20} />
                </div>
                <div className="flexbox-col flex-grow-1 br-6 border__secondary dc__overflow-hidden">
                    <div className="px-11 pt-8 pb-7 border__secondary--bottom bg__modal--primary">
                        <p className="m-0 fs-13 lh-20 fw-6 cn-9">{title}</p>
                    </div>
                    <div className="flex-grow-1 p-16 bg__primary">{content}</div>
                </div>
            </div>
        ))}
    </div>
)

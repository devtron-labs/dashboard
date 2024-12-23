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

import { ChangeEvent, useEffect } from 'react'
import { Checkbox, CHECKBOX_VALUE } from '@devtron-labs/devtron-fe-common-lib'
import { ExportConfigurationProps } from './types'

export const ExportConfiguration = <ConfigValueType extends string>({
    selectedConfig,
    setSelectedConfig,
    configuration,
}: ExportConfigurationProps<ConfigValueType>) => {
    const { title, options } = configuration

    const handleConfigSelectionChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSelectedConfig((prev) => ({
            ...prev,
            [e.target.name]: e.target.checked,
        }))
    }

    useEffect(
        () => () => {
            setSelectedConfig({} as Record<ConfigValueType, boolean>)
        },
        [],
    )

    return (
        <div className="fs-13 lh-20 flexbox-col dc__gap-8 flex-grow-1">
            <h3 className="fw-6 cn-9 m-0 fs-13 lh-20 dc__truncate">{title}</h3>
            <div>
                {options.map(({ label, value, description }) => (
                    <div
                        className={`py-6 flex left dc__gap-8 ${description ? 'top' : ''} dc__hover-n50 br-4`}
                        key={value}
                    >
                        <Checkbox
                            value={CHECKBOX_VALUE.CHECKED}
                            name={value}
                            dataTestId={`check-${label}`}
                            id={value}
                            isChecked={selectedConfig[value]}
                            onChange={handleConfigSelectionChange}
                            rootClassName="m-0 w-20 h-20"
                        />
                        <label className="m-0 flexbox-col cursor" htmlFor={value}>
                            <span className="fs-13 fw-4 lh-20 cn-9 dc__truncate">{label}</span>
                            {description && (
                                <span className="fs-12 fw-4 lh-18 cn-7 dc__ellipsis-right__2nd-line">
                                    {description}
                                </span>
                            )}
                        </label>
                    </div>
                ))}
            </div>
        </div>
    )
}

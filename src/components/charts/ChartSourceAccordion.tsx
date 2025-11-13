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

import { useState } from 'react'

import { Checkbox, CHECKBOX_VALUE } from '@devtron-labs/devtron-fe-common-lib'

import { ReactComponent as Dropdown } from '@Icons/ic-chevron-down.svg'
import AddChartSource from '@Components/charts/list/AddChartSource'

import { ChartSourceAccordionProps, SelectedChartRepositoryType } from './charts.types'

export const ChartSourceAccordion = ({ header, options, value, onChange, dataTestId }: ChartSourceAccordionProps) => {
    const [collapsed, setCollapse] = useState<boolean>(true)
    const toggleDropdown = (): void => {
        setCollapse(!collapsed)
    }

    const onChangeToggleSource = (option: SelectedChartRepositoryType) => () => {
        onChange(option)
    }

    return (
        <div>
            <div
                className="flex fs-12 h-36 pt-8 pb-8 cn-6 fw-6 ml-8 dc__content-space cursor"
                data-testid={dataTestId}
                onClick={toggleDropdown}
            >
                {header}
                <Dropdown
                    className="icon-dim-24 rotate"
                    style={{ ['--rotateBy' as any]: collapsed ? '180deg' : '0deg' }}
                />
            </div>

            {collapsed && (
                <div>
                    <div className="flex left">
                        <AddChartSource text="Add chart source" />{' '}
                    </div>
                    {options.map((option) => (
                        <div
                            className="dc__position-rel flex left cursor dc__hover-n50"
                            data-testid={`${option.label}-chart-repo`}
                        >
                            <Checkbox
                                rootClassName="ml-7 h-32 fs-13 mb-0 mr-10 w-100"
                                isChecked={!!value?.filter((selectedVal) => selectedVal.value === option.value).length}
                                value={CHECKBOX_VALUE.CHECKED}
                                onChange={onChangeToggleSource(option)}
                            >
                                <div className="dc__ellipsis-right ml-5 dc__mxw-180">{option.label}</div>
                            </Checkbox>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

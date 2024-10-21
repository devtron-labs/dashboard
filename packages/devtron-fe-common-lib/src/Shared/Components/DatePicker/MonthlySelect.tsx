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

import { MONTHLY_DATE_OPTIONS } from './utils'
import { MonthlySelectProps } from './types'
import { DATE_PICKER_IDS } from './constants'
import { SelectPicker } from '../SelectPicker'

export const MonthlySelect = ({
    selectedMonthlyDate,
    onChange,
    dataTestId = DATE_PICKER_IDS.MONTH,
}: MonthlySelectProps) => (
    <div className="dc__no-shrink">
        <SelectPicker
            inputId={DATE_PICKER_IDS.MONTH}
            placeholder="Day 1"
            options={MONTHLY_DATE_OPTIONS}
            isSearchable={false}
            value={selectedMonthlyDate}
            onChange={onChange}
            data-testid={dataTestId}
        />
    </div>
)

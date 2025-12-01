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

/* eslint-disable react/prop-types */
import moment from 'moment'

import {
    ComponentSizeType,
    DATE_TIME_FORMATS,
    DateTimePicker,
    InfoBlock,
    SelectPicker,
} from '@devtron-labs/devtron-fe-common-lib'

import { getDateInMilliseconds, getOptions } from './apiToken.utils'
import { ExpirationDateProps } from './types'

const ExpirationDate = ({
    selectedExpirationDate,
    onChangeSelectFormData,
    handleDatesChange,
    customDate,
}: ExpirationDateProps) => (
    <div className="w-100">
        <div className="flex left bottom dc__gap-16">
            <div className="w-200">
                <SelectPicker<number | Date, false>
                    label="Expiration"
                    required
                    inputId="token-expiry-duration"
                    value={selectedExpirationDate}
                    options={getOptions(customDate)}
                    classNamePrefix="select-token-expiry-duration"
                    onChange={onChangeSelectFormData}
                    size={ComponentSizeType.large}
                />
            </div>

            {selectedExpirationDate.label !== 'Custom' && selectedExpirationDate.label !== 'No expiration' && (
                <span className="fs-13 fw-4 cn-9">
                    <span>This token will expire on</span>&nbsp;
                    {moment(getDateInMilliseconds(selectedExpirationDate.value)).format(
                        DATE_TIME_FORMATS.DD_MMM_YYYY_HH_MM,
                    )}
                </span>
            )}
            {selectedExpirationDate.label === 'No expiration' && (
                <span className="ml-16 fs-13 fw-4 cn-9">The token will never expire!</span>
            )}
            {selectedExpirationDate.label === 'Custom' && (
                <DateTimePicker
                    id="expiration-date-picker"
                    date={customDate}
                    onChange={handleDatesChange}
                    isTodayBlocked
                />
            )}
        </div>
        {selectedExpirationDate.label === 'No expiration' && (
            <div className="mt-16">
                <InfoBlock
                    variant="warning"
                    description="Devtron strongly recommends that you set an expiration date for your token to help keep your information secure."
                />
            </div>
        )}
    </div>
)

export default ExpirationDate

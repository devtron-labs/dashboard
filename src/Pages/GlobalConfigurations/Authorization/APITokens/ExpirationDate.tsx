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
import ReactSelect from 'react-select'
import moment from 'moment'
import { InfoColourBar, multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'
import { MomentDateFormat } from '../../../../config'
import { SingleDatePickerComponent } from '../../../../components/common'
import { DropdownIndicator } from '../../../../components/security/security.util'
import { getOptions, getDateInMilliseconds } from './apiToken.utils'
import { Option } from '../../../../components/v2/common/ReactSelect.utils'
import { ReactComponent as Warn } from '../../../../assets/icons/ic-warning.svg'

const ExpirationDate = ({ selectedExpirationDate, onChangeSelectFormData, handleDatesChange, customDate }) => (
    <div className="w-100">
        <span className="form__label dc__required-field">Expiration</span>
        <div className="flex left">
            <ReactSelect
                value={selectedExpirationDate}
                options={getOptions(customDate)}
                className="select-width w-200"
                classNamePrefix="select-token-expiry-duration"
                isSearchable={false}
                onChange={onChangeSelectFormData}
                components={{
                    IndicatorSeparator: null,
                    DropdownIndicator,
                    Option,
                }}
                styles={{
                    ...multiSelectStyles,
                    control: (base) => ({
                        ...base,
                        minHeight: '36px',
                        fontWeight: '400',
                        backgroundColor: 'var(--N50)',
                        cursor: 'pointer',
                    }),
                    dropdownIndicator: (base) => ({
                        ...base,
                        padding: '0 8px',
                    }),
                }}
            />
            {selectedExpirationDate.label !== 'Custom' && selectedExpirationDate.label !== 'No expiration' && (
                <span className="ml-16 fs-13 fw-4 cn-9">
                    <span>This token will expire on</span>&nbsp;
                    {moment(getDateInMilliseconds(selectedExpirationDate.value)).format(MomentDateFormat)}
                </span>
            )}
            {selectedExpirationDate.label === 'No expiration' && (
                <span className="ml-16 fs-13 fw-4 cn-9">The token will never expire!</span>
            )}
            {selectedExpirationDate.label === 'Custom' && (
                <div className="w-200 ml-16">
                    <SingleDatePickerComponent
                        date={customDate}
                        handleDatesChange={handleDatesChange}
                        readOnly
                        isTodayBlocked
                    />
                </div>
            )}
        </div>
        {selectedExpirationDate.label === 'No expiration' && (
            <div className="mt-16">
                <InfoColourBar
                    classname="warn"
                    Icon={Warn}
                    message="Devtron strongly recommends that you set an expiration date for your token to help keep your information secure."
                    iconClass="warning-icon"
                />
            </div>
        )}
    </div>
)

export default ExpirationDate

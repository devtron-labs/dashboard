import React from 'react'
import ReactSelect from 'react-select'
import moment from 'moment'
import { MomentDateFormat } from '../../config'
import { multiSelectStyles, SingleDatePickerComponent } from '../common'
import { DropdownIndicator } from '../security/security.util'
import { getOptions, getDateInMilliseconds } from './authorization.utils'
import { Option } from '../v2/common/ReactSelect.utils'
import InfoColourBar from '../common/infocolourBar/InfoColourbar'
import { ReactComponent as Warn } from '../../assets/icons/ic-warning.svg'

function ExpirationDate({ selectedExpirationDate, onChangeSelectFormData, handleDatesChange, customDate }) {
    return (
        <div className="w-100">
            <span className="form__label">
                Expiration <span className="cr-5"> *</span>
            </span>
            <div className="flex left">
                <ReactSelect
                    value={selectedExpirationDate}
                    options={getOptions(customDate)}
                    className="select-width w-200"
                    isSearchable={false}
                    onChange={(e) => onChangeSelectFormData(e)}
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
                            readOnly={true}
                            isTodayBlocked={true}
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
}

export default ExpirationDate

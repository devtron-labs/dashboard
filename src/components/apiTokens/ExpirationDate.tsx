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
import { API_LIST_MESSAGING } from './constants'

function ExpirationDate({ selectedExpirationDate, onChangeSelectFormData, handleDatesChange, customDate }) {
    return (
        <div className="w-100">
            <span className="form__label">
                {API_LIST_MESSAGING.EXPIRATION} <span className="cr-5"> *</span>
            </span>
            <div className="flex left">
                <ReactSelect
                    value={selectedExpirationDate}
                    options={getOptions(customDate)}
                    className="select-width w-200"
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
                        <span>{API_LIST_MESSAGING.TOKEN_WILL_EXPIRE_ON}</span>&nbsp;
                        {moment(getDateInMilliseconds(selectedExpirationDate.value)).format(MomentDateFormat)}
                    </span>
                )}
                {selectedExpirationDate.label === 'No expiration' && (
                    <span className="ml-16 fs-13 fw-4 cn-9">{API_LIST_MESSAGING.TOKEN_WILL_NEVER_EXPIRE}</span>
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
                        message={API_LIST_MESSAGING.NO_EXPIRATION_DATE_MESSAGE}
                        iconClass="warning-icon"
                    />
                </div>
            )}
        </div>
    )
}

export default ExpirationDate

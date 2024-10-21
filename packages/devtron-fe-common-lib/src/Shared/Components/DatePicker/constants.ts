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

const selectedStyles = {
    background: 'var(--B100)',
    color: 'var(--B500)',

    hover: {
        background: 'var(--B500)',
        color: '#fff',
    },
}

const selectedSpanStyles = {
    background: 'var(--B100)',
    color: 'var(--B500)',
    hover: {
        background: 'var(--B500)',
        color: '#fff',
    },
}

const hoveredSpanStyles = {
    background: 'var(--B100)',
    color: 'var(--B500)',
}

export const customDayStyles = {
    selectedStartStyles: selectedStyles,
    selectedEndStyles: selectedStyles,
    hoveredSpanStyles,
    selectedSpanStyles,
    selectedStyles,
    border: 'none',
}

export const MONTHLY_DATES_CONFIG = {
    'Day 1': '1',
    'Day 2': '2',
    'Day 3': '3',
    'Day 4': '4',
    'Day 5': '5',
    'Day 6': '6',
    'Day 7': '7',
    'Day 8': '8',
    'Day 9': '9',
    'Day 10': '10',
    'Day 11': '11',
    'Day 12': '12',
    'Day 13': '13',
    'Day 14': '14',
    'Day 15': '15',
    'Day 16': '16',
    'Day 17': '17',
    'Day 18': '18',
    'Day 19': '19',
    'Day 20': '20',
    'Day 21': '21',
    'Day 22': '22',
    'Day 23': '23',
    'Day 24': '24',
    'Day 25': '25',
    'Day 26': '26',
    'Day 27': '27',
    'Day 28': '28',
    'Third Last Day': '-3',
    'Second Last Day': '-2',
    'Last Day': '-1',
}

export const TIME_OPTIONS_CONFIG = {
    '12:00 AM': '00:00:00',
    '12:30 AM': '00:30:00',
    '01:00 AM': '01:00:00',
    '01:30 AM': '01:30:00',
    '02:00 AM': '02:00:00',
    '02:30 AM': '02:30:00',
    '03:00 AM': '03:00:00',
    '03:30 AM': '03:30:00',
    '04:00 AM': '04:00:00',
    '04:30 AM': '04:30:00',
    '05:00 AM': '05:00:00',
    '05:30 AM': '05:30:00',
    '06:00 AM': '06:00:00',
    '06:30 AM': '06:30:00',
    '07:00 AM': '07:00:00',
    '07:30 AM': '07:30:00',
    '08:00 AM': '08:00:00',
    '08:30 AM': '08:30:00',
    '09:00 AM': '09:00:00',
    '09:30 AM': '09:30:00',
    '10:00 AM': '10:00:00',
    '10:30 AM': '10:30:00',
    '11:00 AM': '11:00:00',
    '11:30 AM': '11:30:00',
    '12:00 PM': '12:00:00',
    '12:30 PM': '12:30:00',
    '01:00 PM': '13:00:00',
    '01:30 PM': '13:30:00',
    '02:00 PM': '14:00:00',
    '02:30 PM': '14:30:00',
    '03:00 PM': '15:00:00',
    '03:30 PM': '15:30:00',
    '04:00 PM': '16:00:00',
    '04:30 PM': '16:30:00',
    '05:00 PM': '17:00:00',
    '05:30 PM': '17:30:00',
    '06:00 PM': '18:00:00',
    '06:30 PM': '18:30:00',
    '07:00 PM': '19:00:00',
    '07:30 PM': '19:30:00',
    '08:00 PM': '20:00:00',
    '08:30 PM': '20:30:00',
    '09:00 PM': '21:00:00',
    '09:30 PM': '21:30:00',
    '10:00 PM': '22:00:00',
    '10:30 PM': '22:30:00',
    '11:00 PM': '23:00:00',
    '11:30 PM': '23:30:00',
}

export const DATE_PICKER_PLACEHOLDER = {
    DATE: 'Select date',
    TIME: 'Select time',
    MONTH: 'Select month',
    DEFAULT_TIME: '12:00 AM',
    DEFAULT_MONTHLY_DATE: 'Day 1',
}

export const DATE_PICKER_IDS = {
    DATE: 'date_picker',
    MONTH: 'month_picker',
    TIME: 'time_picker',
}

export const reactSelectStyles = {
    container: (base) => ({
        ...base,
        height: '36px',
    }),
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        minHeight: '36px',
        cursor: 'pointer',
        borderColor: 'var(--N200)',
        backgroundColor: 'var(--N50)',

        ...(state.isDisabled
            ? {
                  borderColor: 'var(--N200)',
                  backgroundColor: 'var(--N100)',
                  cursor: 'not-allowed',
              }
            : {}),

        '&:hover': {
            borderColor: 'var(--N400)',
        },
        '&:focus, &:focus-within': {
            borderColor: 'var(--B500)',
            outline: 'none',
        },
    }),
    valueContainer: (base) => ({
        ...base,
        padding: 0,
        width: '180px',
    }),
    input: (base) => ({
        ...base,
        padding: 0,
        margin: 0,
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        padding: 0,
    }),
    option: (base) => ({
        ...base,
        fontSize: '13px',
        cursor: 'pointer',
    }),
    menuList: (base) => ({
        ...base,
        position: 'relative',
        paddingBottom: '0px',
        maxHeight: '250px',
        width: '200px',
    }),
}

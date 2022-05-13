import React from 'react'
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg'
import { components } from 'react-select'
import { multiSelectStyles } from '../../../common'

export const styles = {
    ...multiSelectStyles,
    menu: (base) => ({ ...base, zIndex: 9999, textAlign: 'left', width: '150%' }),
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        minHeight: '12px',
        cursor: 'pointer',
        border: 0,
        outline: 'none',
        boxShadow: 'none',
        fontSize: '13px',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: 600,
        color: '#06c',
        marginLeft: 0,
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        color: 'var(--N900)',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
        padding: '0 4px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        height: '20px',
        padding: 0,
    }),
    indicatorsContainer: (base) => ({
        ...base,
        padding: 0,
    }),
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
}

export function Option(props) {
    return (
        <components.Option {...props}>
            <div className={`flex left pt-8 pb-8 pl-8 pr-8 ${props.isSelected ? 'bcb-1' : ''}`}>
                <div
                    className={`app-summary__icon icon-dim-22 ${props.data.status
                        .toLocaleLowerCase()
                        .replace(/\s+/g, '')} mr-8`}
                ></div>
                <div>
                    <div className="cn-9 fs-13"> {props.label}</div>
                    <div className="cn-7 flex left">
                        <span className="text-capitalize">Deploy</span> <div className="bullet ml-4 bullet--d2 mr-4" />{' '}
                        {props.data.author}
                    </div>
                </div>
            </div>
        </components.Option>
    )
}

export const firstLettterCapitalize = (historicalName) => {
    if (typeof historicalName !== 'string') return ''
    let capitalizeHistoricanName = historicalName.charAt(0).toUpperCase() + historicalName.slice(1)
    return capitalizeHistoricanName.replace('_', ' ')
}

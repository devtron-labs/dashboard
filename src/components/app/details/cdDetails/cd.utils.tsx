import React from 'react';
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg';
import { components } from 'react-select';
import { multiSelectStyles } from '../../../common';

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
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: 600,
        color: '#06c',
        direction: 'rtl',
        marginLeft: '2px',
    }),
    option: (base, state) => ({
        ...base,
        backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        color: 'var(--N900)',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        cursor: 'pointer',
    }),
    valueContainer: (base, state) => ({
        ...base,
        height: '20px',
        padding: 0,
    }),
    indicatorsContainer: (base) => ({
        ...base,
        // height: '40px',
        padding: 0,
    }),
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
};

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
                    <div> {props.label}</div>
                    <div>Deploy {props.data.author}</div>
                </div>
            </div>
        </components.Option>
    );
}

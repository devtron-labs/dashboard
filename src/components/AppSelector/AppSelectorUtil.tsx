import React from 'react';
import { components } from 'react-select';
import { ReactComponent as DropDownIcon } from '../../assets/icons/ic-chevron-down.svg';

export const appSelectorStyle = {
    control: (base, state) => ({
        ...base,
        border: state.menuIsOpen ? '1px solid var(--B500)' : 'unset',
        boxShadow: 'none',
        color: 'var(--N900)',
        minHeight: '32px',
        minWidth: state.menuIsOpen ? '300px' : 'unset',
        justifyContent: state.menuIsOpen ? 'space-between' : 'flex-start',
    }),
    valueContainer: (base, state) => ({
        ...base,
        display: 'flex',
        flexDirection: 'row-reverse',
        flexBasis: '0px',
        justifyContent: 'flex-end',
        padding: state.selectProps.menuIsOpen ? '0 0 0 4px' : '0',
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
        height: '30px',
    }),
    singleValue: (base, state) => ({
        ...state,
        flexBasis: 0,
        height: '32px',
    }),
    menu: (base, state) => ({
        ...base,
        minWidth: '300px',
        fontSize: '14px',
        fontWeight: 'normal',
    }),
    menuList: (base, state) => ({
        ...base,
        padding: '8px',
    }),
    option: (base, state) => ({
        ...base,
        borderRadius: '4px',
        color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N100)' : 'white',
        fontWeight: state.isSelected ? 600 : 'normal',
        marginRight: '8px',
    }),
    input: (base, state) => ({
        ...base,
        margin: '0',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        padding: '0 4px 0 4px',
    }),
};

export const DropdownIndicator = (props) => {
    return (
        <components.DropdownIndicator {...props}>
            <DropDownIcon
                className={`rotate`}
                style={{
                    ['--rotateBy' as any]: props.selectProps.menuIsOpen ? '180deg' : '0deg',
                    height: '24px',
                    width: '24px',
                }}
            />
        </components.DropdownIndicator>
    );
};

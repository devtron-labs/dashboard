import React from 'react';
import { components } from 'react-select';
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';

export const styles = {
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        height: '40px',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
    }),
    singleValue: (base, state) => {
        return ({
            ...base,
            fontWeight: 500,
            color: 'var(--N900)'
        })
    },
    option: (base, state) => {
        return ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--B100)' : "var(--N000)",
        })
    }
}


export function Option(props) {
    const { selectOption, data } = props;
    const style = { height: '16px', width: '16px', flex: '0 0 16px' }
    const onClick = (e) => selectOption(data);
    return <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'dc__transparent' }}>
        {props.isSelected ? (
            <Check onClick={onClick} className="mr-8 icon-dim-16" style={style} />
        ) : (
            <span onClick={onClick} className="mr-8" style={style} />
        )}
        <components.Option {...props} />
    </div>
};

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n5" />
    </components.DropdownIndicator>
}
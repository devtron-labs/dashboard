import React from 'react';
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { ReactComponent as CheckNotSelected } from '../../assets/icons/ic-checkbox-unselected.svg';
import { components } from 'react-select';

export const styles = {
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
    }),
    menu: (base, state) => {
        return ({
            ...base,
            backgroundColor: state.Selected ? "white" : "white"
        })
    },
    singleValue: (base, state) => {
        return ({
            ...base,
            color: 'var(--N900)'
        })
    },
    option: (base, state) => {
        return ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        })
    }
}

export function Option(props) {
    const { selectOption, data } = props;
    const style = { height: '16px', width: '16px', flex: '0 0 16px' }
    const onClick = (e) => selectOption(data);
    return <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
        {props.isSelected ? <Check onClick={onClick} className="mr-8 icon-dim-16" style={style} />
            : <span onClick={onClick} className="mr-8" style={style} />}
        <components.Option {...props} />
    </div>
};

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n5" />
    </components.DropdownIndicator>
}
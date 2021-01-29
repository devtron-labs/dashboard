import { components } from 'react-select';
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as CheckSelected } from '../../assets/icons/ic-checkbox-selected.svg';
import { ReactComponent as CheckNotSelected } from '../../assets/icons/ic-checkbox-unselected.svg';
import React from 'react';

export const styles = {
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
        boxShadow: 'none',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: "500",
    }),
    placeholder: (base, state) => ({
        ...base,
        fontWeight: "500",
    }),
    option: (base, state) => {
        return ({
            ...base,
            fontWeight: "500",
            color: 'var(--N900)',
            fontSize: '12px',
            padding: '8px 24px',
        })
    },
}

export const menuList = {
    menuList: (base, state) => ({
        ...base,
        maxHeight: "180px",
    }),
}

export const smallMenuList = {
    menuList: (base, state) => ({
        ...base,
        maxHeight: "90px",
    }),
}


export function ValueContainer(props) {
    if (!props.hasValue) return <components.ValueContainer {...props}>
    </components.ValueContainer>
    else {
        return <components.ValueContainer {...props}>
            <p style={{ margin: '0px' }}>
                {props?.selectProps?.name}
                <span className="badge">{props.getValue()?.length}</span>
            </p>
        </components.ValueContainer>
    }
}

export function Option(props) {
    return <components.Option {...props}>
        <p className="m-0 ellipsis-right lowercase">
            {props.isSelected ? <CheckSelected className="icon-dim-24 vertical-align-middle mr-5" />
                : <CheckNotSelected className="icon-dim-24 vertical-align-middle mr-5" />}
            {props.label}</p>
    </components.Option>

}

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n4" />
    </components.DropdownIndicator>
}

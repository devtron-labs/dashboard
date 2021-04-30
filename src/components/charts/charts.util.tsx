import { components } from 'react-select';
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg';
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

export const ValueContainer = props => {
    let length = props.getValue().length;
    let count = ''
    if (length === props.options.length) {
        count = 'All'
    }
    else {
        count = length
    }

    return (
        <components.ValueContainer  {...props}>
            {length > 0 ?
                <>{!props.selectProps.menuIsOpen &&
                    <> {length == 1 ? "Repository" : "Repositories"}: <span className="badge">{count}</span></>
                }
                    {React.cloneElement(props.children[1])}
                </>
                : <>{props.children}
                </>}
        </components.ValueContainer>
    );
};

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n4" />
    </components.DropdownIndicator>
}

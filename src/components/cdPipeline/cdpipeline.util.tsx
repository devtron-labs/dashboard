import React from 'react';
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg';
import { ReactComponent as CheckNotSelected } from '../../assets/icons/ic-checkbox-unselected.svg';
import { components } from 'react-select';
import { ReactComponent as Search} from '../../assets/icons/ic-nav-search.svg'

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
    multiValue: (base ,state) => {
        return({
            ...base,
            backgroundColor: 'var(--N0)',
            border: '1px solid var(--N200)',
            borderRadius: '4px'
        })
    },
    option: (base, state) => {
        return ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
            paddingLeft: '8px',
        })
    }
}

export function Option(props) {
    const { selectOption, data } = props;
    const style = { flex: '0 0' , alignText: 'left' }
    const onClick = (e) => selectOption(data);
    return <div className="flex left" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
        {props.isSelected ? <Check onClick={onClick} className="icon-dim-16" style={style} />
            : <span onClick={onClick} style={style} />}
        <components.Option {...props} />
    </div>
};

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n5" />
    </components.DropdownIndicator>
}

export const NUMBER_OF_APPROVALS = 6

export const ValueContainer = (props) => {
    return (
        <components.ValueContainer {...props}>
            <div className="flex left w-100">
            <Search className='icon-dim-16 scn-6 mr-8' />
               {props.children}
            </div>
        </components.ValueContainer>
    )
}
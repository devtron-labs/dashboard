import { components } from 'react-select';
import { ReactComponent as ArrowDown } from '../../../assets/icons/ic-chevron-down.svg';
import React from 'react';

export const ValueContainer = props => {
    let length = props.getValue().length;
    let count = ''
    if (length === props.options.length && (props.selectProps.name === 'entityName' || props.selectProps.name === 'environment')) {
        count = 'All'
    }
    else {
        count = length
    }

    const Item = props.selectProps.name === 'cluster' ? 'Cluster' : 'Namespace'
    const counting = <span className="badge">{count}</span>

    return (
        <components.ValueContainer  {...props}>
            {length > 0 ?
                <>
                    {!props.selectProps.menuIsOpen && ` ${Item}${length !== 1 ? "s" : ""} ${count}`}
                    {React.cloneElement(props.children[1])}
                </>
                : <>{props.children}</>}
        </components.ValueContainer>
    );
};

export const DropdownIndicator = props => {
    return (
        <components.DropdownIndicator {...props}>
            <ArrowDown className={`rotate scn-2`} style={{ ['--rotateBy' as any]: props.selectProps.menuIsOpen ? '180deg' : '0deg', height: '20px', width: '20px' }} />
        </components.DropdownIndicator>
    )
}
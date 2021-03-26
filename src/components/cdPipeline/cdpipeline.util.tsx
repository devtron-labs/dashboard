import React from 'react';
import { ReactComponent as ArrowDown } from '../../assets/icons/ic-chevron-down.svg';
import { components } from 'react-select';
import { ReactComponent as CheckSelected } from '../../assets/icons/ic-checkbox-selected.svg';
import { ReactComponent as CheckNotSelected } from '../../assets/icons/ic-checkbox-unselected.svg';


export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n5" />
    </components.DropdownIndicator>
}


export function Option(props) {
    return <components.Option {...props}>
        <p className="m-0 ellipsis-right lowercase">
            {props.isSelected ? <CheckSelected className="icon-dim-24 vertical-align-middle mr-5" />
                : <CheckNotSelected className="icon-dim-24 vertical-align-middle mr-5" />}
            {props.label}</p>
    </components.Option>

}
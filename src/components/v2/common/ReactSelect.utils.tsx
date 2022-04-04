import React from 'react';
import { ReactComponent as ArrowDown } from '../assets/icons/ic-chevron-down.svg';
import { ReactComponent as Check } from '../assets/icons/ic-check.svg';
import { components } from 'react-select';
import Tippy from '@tippyjs/react';

export const styles = {
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
    }),
    menu: (base, state) => {
        return ({
            ...base,
            top: `0px`,
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
    const { selectOption, data, showTippy } = props
    const style = { height: '16px', width: '16px', flex: '0 0 16px' }
    const onClick = (e) => selectOption(data)
    
    const getOption = () => {
        return <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
                {props.isSelected ? (
                    <Check onClick={onClick} className="mr-8 icon-dim-16" style={style} />
                ) : (
                    <span onClick={onClick} className="mr-8" style={style} />
                )}
                <components.Option {...props} />
            </div>
    }

    return showTippy ? (
        <Tippy className="default-white" arrow={false} placement="right" content={data.label}>
            {getOption()}
        </Tippy>
    ) : getOption()
};

export function DropdownIndicator(props) {
    return <components.DropdownIndicator {...props}>
        <ArrowDown className="icon-dim-20 icon-n5" />
    </components.DropdownIndicator>
}
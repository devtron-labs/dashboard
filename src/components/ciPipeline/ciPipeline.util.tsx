import React, { components } from 'react-select'
import { ReactComponent as Check } from '../../assets/icons/ic-check.svg'

export const CiPipelineSourceTypeBaseOptions = [
    {
        label: 'Branch Fixed',
        value: 'SOURCE_TYPE_BRANCH_FIXED',
        isDisabled: false,
        isSelected: false,
        isWebhook: false,
    },
    {
        label: 'Branch Regex',
        value: 'SOURCE_TYPE_BRANCH_REGEX',
        isDisabled: false,
        isSelected: false,
        isWebhook: false,
    },
]

export const reactSelectStyles = {
    container: (base, state) => ({
        ...base,
        height: '40px',
    }),
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        height: '40px',
        backgroundColor: state.isDisabled ? 'var(--N50)' : 'var(--N000)',
        borderColor: state.isDisabled ? 'var(--N200)' : base.borderColor,
    }),
    menu: (base, state) => {
        return {
            ...base,
            top: `38px`,
        }
    },
    singleValue: (base, state) => {
        return {
            ...base,
            fontWeight: 500,
            color: 'var(--N900)',
        }
    },
    option: (base, state) => {
        return {
            ...base,
            color: state.isDisabled ? 'var(--N500)' : 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N50)' : 'var(--N000)',
        }
    },
}

export function Option(props) {
    const { selectOption, data } = props
    const style = { height: '16px', width: '16px', flex: '0 0 16px' }
    const onClick = (e) => selectOption(data)
    return (
        <div className="flex left pl-12" style={{ background: props.isFocused ? 'var(--N100)' : 'transparent' }}>
            {/* {props.isSelected ? ( */}
            {/* // <Check onClick={onClick} className="mr-8 icon-dim-16" style={style} /> */}
            {/* // ) : ( */}
            <span onClick={onClick} className="mr-8" style={style} />
            {/* )} */}
            <components.Option {...props} />
        </div>
    )
}

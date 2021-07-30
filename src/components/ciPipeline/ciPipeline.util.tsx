import { components } from 'react-select';

export const CiPipelineSourceTypeBaseOptions = [
    { label: 'Branch Fixed', value: 'SOURCE_TYPE_BRANCH_FIXED', isDisabled: false, isSelected: true, isWebhook: false },
];

export const reactSelectStyles = {
    container: (base, state) => ({
        ...base,
        height: '40px'
    }),
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        height: '40px',
        backgroundColor: state.isDisabled ? 'var(--N100)' : 'var(--N000)',
        borderColor: state.isDisabled ? 'var(--N200)' : base.borderColor
    }),
    menu: (base, state) => {
        return ({
            ...base,
            top: `38px`
        })
    },
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
            color: state.isDisabled ? 'var(--N500)' : 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'var(--N000)'
        })
    }
} 
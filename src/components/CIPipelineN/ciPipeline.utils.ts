export const tempMultiSelectStyles = {
    control: (base, state) => ({
        ...base,
        border: state.isFocused ? '1px solid #06c' : '1px solid #d6dbdf',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: 'none',
        height: '30px',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    placeholder: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    option: (base, state) => {
        return {
            ...base,
            fontWeight: '500',
            color: 'var(--N900)',
            fontSize: '12px',
            padding: '5px 10px',
        }
    },
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: 'var(--N100) !important',
        padding: '0px 10px',
        display: 'flex',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: 'var(--N100) !important',
        border: '1ps solid var(--N200) !important',
    }),
}

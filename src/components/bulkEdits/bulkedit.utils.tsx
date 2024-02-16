export const multiSelectStyles = {
    control: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
        border: 'none',
        boxShadow: 'none',
    }),
    option: (base, state) => {
        return {
            ...base,
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
            color: 'var(--N900)',
        }
    },
    container: (base, state) => ({
        ...base,
        cursor: state.isDisabled ? 'not-allowed' : 'normal',
    }),
}

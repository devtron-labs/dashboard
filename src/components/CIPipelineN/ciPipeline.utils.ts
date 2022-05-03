export const baseSelectStyles = {
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: 'none',
        height: '32px',
        fontSize: '12px',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    placeholder: (base, state) => ({
        ...base,
        fontWeight: '500',
    }),
    option: (base, state) => ({
        ...base,
        fontWeight: '500',
        color: 'var(--N900)',
        fontSize: '12px',
        padding: '5px 10px',
    }),
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '30px',
        fontSize: '12px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: 'var(--N50) !important',
    }),
    menu: (base, state) => ({
        ...base,
        marginTop: '0',
    }),
}

export const pluginSelectStyle = {
    ...baseSelectStyles,
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: '4px',
        height: '28px',
        fontSize: '12px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '26px',
        fontSize: '12px',
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: 'var(--N50) !important',
        borderTopRightRadius: '4px',
        borderBottomRightRadius: '4px',
    }),
}

export const yamlEditorSelectStyle = {
    control: (base, state) => ({
        ...base,
        boxShadow: 'none',
        minHeight: 'auto',
        border: 'none',
        width: 'max-content',
    }),
    option: (base, state) => ({
        ...base,
        fontWeight: '500',
        color: 'var(--N900)',
        fontSize: '12px',
        padding: '5px 10px',
        minWidth: '200px',
    }),
    dropdownIndicator: (styles) => ({ ...styles, padding: 0 }),
    menu: (base, state) => ({
        ...base,
        width: '150px',
    }),
}

export const selectWithDefaultBG = {
    ...baseSelectStyles,
    control: (base, state) => ({
        ...base,
        border: 'none',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: 'none',
        height: '32px',
        fontSize: '12px',
        width: 'max-content',
    }),
    valueContainer: (base, state) => ({
        ...base,
        display: 'flex',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
    }),
}

export const outputFormatSelectStyle = {
    ...baseSelectStyles,
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: 'none',
        height: '3px',
        borderTopRightRadius: '4px',
        fontSize: '12px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '30px',
        fontSize: '12px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: 'var(--N50) !important',
        borderTopRightRadius: '4px',
    }),
}

export const containerImageSelectStyles = {
    ...baseSelectStyles,
    control: (base, state) => ({
        ...base,
        border: '1px solid var(--N200)',
        boxShadow: 'none',
        minHeight: 'auto',
        borderRadius: '4px',
        height: '32px',
        fontSize: '12px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        background: 'var(--N50) !important',
        padding: '0px 10px',
        display: 'flex',
        height: '30px',
        borderTopLeftRadius: '4px',
        borderBottomLeftRadius: '4px',
        fontSize: '12px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        background: 'var(--N50) !important',
        borderTopRightRadius: '4px',
        borderBottomRightRadius: '4px',
    }),
}

import { multiSelectStyles } from '@devtron-labs/devtron-fe-common-lib'

export const FILTER_STYLE = {
    ...multiSelectStyles,
    control: (base) => ({
        ...base,
        minHeight: '36px',
        fontWeight: '400',
        backgroundColor: 'var(--N50)',
        cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '0 8px',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
}
export const HISTORY_LABEL = {
    APPLICATION: 'Application',
    ENVIRONMENT: 'Environment',
    PIPELINE: 'Pipeline',
}
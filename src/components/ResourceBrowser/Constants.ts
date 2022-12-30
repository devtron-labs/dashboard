import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'

export const clusterSelectStyle = {
    ...multiSelectStyles,
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        textAlign: 'left',
        minWidth: '150px',
        maxWidth: '380px',
    }),
    control: (base, state) => ({
        ...base,
        borderColor: 'transparent',
        backgroundColor: 'transparent',
        cursor: 'pointer',
        height: '28px',
        minHeight: '28px',
    }),
    singleValue: (base, state) => ({
        ...base,
        fontWeight: 600,
        color: 'var(--N900)',
        direction: 'rtl',
        textAlign: 'left',
        marginLeft: '2px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        height: '28px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        height: '28px',
        padding: '0 6px',
    }),
}

export const RESOURCE_ACTION_MENU = {
    manifest: 'Manifest',
    Events: 'Events',
    logs: 'Logs',
    terminal: 'Terminal',
    delete: 'Delete',
}

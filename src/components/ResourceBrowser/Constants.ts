import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'

export const CLUSTER_SELECT_STYLE = {
    ...multiSelectStyles,
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        textAlign: 'left',
        minWidth: '250px',
        maxWidth: '380px',
    }),
    control: (base, state) => ({
        ...base,
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

export const ALL_NAMESPACE_OPTION = {value: 'all', label: 'All namespaces'}

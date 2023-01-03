import { AggregationKeys, AggregationKeysType } from '../app/types'
import { multiSelectStyles } from '../v2/common/ReactSelectCustomization'

export const CLUSTER_SELECT_STYLE = {
    ...multiSelectStyles,
    menu: (base) => ({
        ...base,
        zIndex: 9999,
        textAlign: 'left',
    }),
    control: (base, state) => ({
        ...base,
        backgroundColor: 'transparent',
        cursor: 'pointer',
        height: '28px',
        minHeight: '30px',
    }),
    singleValue: (base, state) => ({
        ...base,
        color: 'var(--N900)',
        direction: 'rtl',
        textAlign: 'left',
        marginLeft: '2px',
    }),
    indicatorsContainer: (base, state) => ({
        ...base,
        height: '30px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        height: '30px',
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

export const ALL_NAMESPACE_OPTION = { value: 'all', label: 'All namespaces' }

export const ORDERED_AGGREGATORS: AggregationKeysType[] = [
    AggregationKeys.Workloads,
    AggregationKeys['Config & Storage'],
    AggregationKeys.Networking,
    AggregationKeys.RBAC,
    AggregationKeys.Administration,
    AggregationKeys.Other,
    AggregationKeys['Custom Resource'],
]

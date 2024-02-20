import { SELECT_ALL_VALUE } from '../../../../../../config'
import { authorizationSelectStyles } from '../userGroups/UserGroup'
import { ActionTypes, ACTION_LABEL, EntityTypes, K8sPermissionFilter } from '../userGroups/userGroups.types'

export const apiGroupAll = (permission, isLabel = false) => {
    if (permission === '') {
        return isLabel ? 'All API groups' : SELECT_ALL_VALUE
    }
    if (permission === 'k8sempty') {
        return isLabel ? 'K8s core groups (eg. service, pod, etc.)' : 'k8sempty'
    }
    return permission
}

export const HEADER_OPTIONS = ['CLUSTER', 'API GROUP', 'KIND', 'NAMESPACE', 'RESOURCE', 'ROLE']

export const multiSelectAllState = (selected, actionMeta, setState, options) => {
    if (actionMeta.action === 'select-option' && actionMeta.option.value === SELECT_ALL_VALUE) {
        setState(options)
    } else if (
        (actionMeta.action === 'deselect-option' && actionMeta.option.value === SELECT_ALL_VALUE) ||
        (actionMeta.action === 'remove-value' && actionMeta.removedValue.value === SELECT_ALL_VALUE)
    ) {
        setState([])
    } else if (actionMeta.action === 'deselect-option' || actionMeta.action === 'remove-value') {
        setState(selected.filter((o) => o.value !== SELECT_ALL_VALUE))
    } else if (selected.length === options.length - 1) {
        setState(options)
    } else {
        setState(selected)
    }
}

// eslint-disable-next-line default-param-last
export const getPermissionObject = (idx = 0, k8sPermission?: K8sPermissionFilter) => {
    if (k8sPermission) {
        return {
            key: idx,
            cluster: k8sPermission.cluster,
            namespace: k8sPermission.namespace,
            group: k8sPermission.group,
            kind: k8sPermission.kind,
            resource: k8sPermission.resource,
            action: k8sPermission.action,
            entity: k8sPermission.entity,
        }
    }
    return {
        key: idx,
        cluster: null,
        namespace: null,
        group: null,
        kind: null,
        resource: null,
        action: { value: ActionTypes.VIEW, label: ACTION_LABEL[ActionTypes.VIEW] },
        entity: EntityTypes.CLUSTER,
    }
}

export const k8sRoleSelectionStyle = {
    ...authorizationSelectStyles,
    option: (base, state) => ({
        ...authorizationSelectStyles.option(base, state),
        marginRight: '8px',
    }),
    valueContainer: (base, state) => ({
        ...authorizationSelectStyles.valueContainer(base),
        display: 'flex',
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
    }),
}

export const excludeKeyAndClusterValue = ({ cluster, ...rest }: K8sPermissionFilter): K8sPermissionFilter => {
    return {
        cluster: { label: cluster.label, value: cluster.label },
        ...rest,
    }
}

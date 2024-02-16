import React from 'react'
import { authorizationSelectStyles } from '../userGroups/UserGroup'
import { ActionTypes, ACTION_LABEL, EntityTypes, K8sPermissionFilter } from '../userGroups/userGroups.types'

export const apiGroupAll = (permission, isLabel = false) => {
    if (permission === '') {
        return isLabel ? 'All API groups' : '*'
    }
    if (permission === 'k8sempty') {
        return isLabel ? 'K8s core groups (eg. service, pod, etc.)' : 'k8sempty'
    }
    return permission
}

export const HEADER_OPTIONS = ['CLUSTER', 'API GROUP', 'KIND', 'NAMESPACE', 'RESOURCE', 'ROLE']

export const multiSelectAllState = (selected, actionMeta, setState, options) => {
    if (actionMeta.action === 'select-option' && actionMeta.option.value === '*') {
        setState(options)
    } else if (
        (actionMeta.action === 'deselect-option' && actionMeta.option.value === '*') ||
        (actionMeta.action === 'remove-value' && actionMeta.removedValue.value === '*')
    ) {
        setState([])
    } else if (actionMeta.action === 'deselect-option' || actionMeta.action === 'remove-value') {
        setState(selected.filter((o) => o.value !== '*'))
    } else if (selected.length === options.length - 1) {
        setState(options)
    } else {
        setState(selected)
    }
}

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

export const excludeKeyAndClusterValue = ({ key, cluster, ...rest }) => {
    return {
        cluster: { label: cluster.label, value: cluster.label },
        ...rest,
    }
} 

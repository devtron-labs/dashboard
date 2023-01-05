import { ActionTypes, ACTION_LABEL } from '../userGroups.types'

export const apiGroupAll = (permission, isLabel = false) => {
    if (permission === '') {
        return isLabel ? 'All API groups' : '*'
    } else if (permission === 'k8sempty') {
        return isLabel ? 'K8s core groups (eg. service, pod, etc.)' : 'k8sempty'
    } else return permission
}

export const k8sPermissionRoles = [
    { value: ActionTypes.VIEW, label: ACTION_LABEL[ActionTypes.VIEW], infoText: 'View allowed K8s resources.' },
    {
        value: ActionTypes.EDIT,
        label: ACTION_LABEL[ActionTypes.ADMIN],
        infoText: 'Create, view, edit & delete allowed K8s resources.',
    },
    {
        value: ActionTypes.ADMIN,
        label: ACTION_LABEL[ActionTypes.MANAGER],
        infoText: 'Can perform all actions and provide access to permitted K8s resources to other users.',
    },
]

export const HEADER_OPTIONS = ['CLUSTER', 'API GROUP', 'KIND', 'NAMESPACE', 'RESOURCE', 'ROLE']

export const multiSelectAllState = (selected,actionMeta, setState, options) => {
    if (actionMeta.action === 'select-option' && actionMeta.option.value === "*") {
        setState(options)
    } else if ((actionMeta.action === 'deselect-option' && actionMeta.option.value === '*') || (actionMeta.action === 'remove-value' &&  actionMeta.removedValue.value === '*')) {
        setState([])
    } else if (actionMeta.action === 'deselect-option' || actionMeta.action === 'remove-value') {
        setState(selected.filter((o) => o.value !== '*'))
    } else if (selected.length === selected.length - 1) {
        setState(options)
    } else {
        setState(selected)
    }
}

export const getEmptyPermissionObject = (idx = 0, k8sPermission = null) => {
    return {
        key: idx,
        cluster: k8sPermission?.cluster,
        namespace: k8sPermission?.namespace,
        group: k8sPermission?.group,
        kind: k8sPermission?.kind,
        resource: k8sPermission?.resource,
        action: k8sPermission?.action || { value: ActionTypes.VIEW, label: ActionTypes.VIEW },
    }
}

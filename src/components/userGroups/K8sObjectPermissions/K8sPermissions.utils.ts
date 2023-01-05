import React from 'react'
import { multiSelectStyles } from '../../v2/common/ReactSelectCustomization'
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

export const k8sPermissionStyle = {
    ...multiSelectStyles,
    control: (base) => ({
        ...base,
        minHeight: '36px',
        fontWeight: '400',
        backgroundColor: 'var(--N00)',
        cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '0 8px',
    }),
}

export const k8sRoleSelectionStyle = {
    ...multiSelectStyles,
    option: (base, state) => ({
        ...base,
        borderRadius: '4px',
        color: state.isSelected ? 'var(--B500)' : 'var(--N900)',
        backgroundColor: state.isSelected ? 'var(--B100)' : state.isFocused ? 'var(--N100)' : 'white',
        fontWeight: state.isSelected ? 600 : 'normal',
        marginRight: '8px',
    }),
    control: (base) => ({
        ...base,
        minHeight: '36px',
        fontWeight: '400',
        backgroundColor: 'var(--N00)',
        cursor: 'pointer',
    }),
    dropdownIndicator: (base) => ({
        ...base,
        padding: '0 8px',
    }),
    valueContainer: (base, state) => ({
        ...base,
        display: 'flex',
        color: state.selectProps.menuIsOpen ? 'var(--N500)' : base.color,
    }),
}

export const resourceMultiSelectstyles = {
    ...multiSelectStyles,
    control: (base) => ({
        ...base,
        fontWeight: '400',
        backgroundColor: 'var(--N00)',
        cursor: 'pointer',
    }),
    dropdownIndicator: (base, state) => ({
        ...base,
        transition: 'all .2s ease',
        transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
    }),
    multiValue: (base) => ({
        ...base,
        border: `1px solid var(--N200)`,
        borderRadius: `4px`,
        background: 'white',
        height: '30px',
        margin: '4px 8px 4px 0',
        padding: '1px',
    }),
}

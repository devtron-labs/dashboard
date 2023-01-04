import { ActionTypes } from '../userGroups.types'

export const apiGroupAll = (permission, label = false) => {
    if (permission === '') {
        return label ? 'All API groups' : '*'
    } else if (permission === 'k8sempty') {
        return label ? 'K8s core groups (eg. service, pod, etc.)' : ''
    } else return permission
}

export const k8sPermissionRoles = [
    { value: ActionTypes.VIEW, label: ActionTypes.VIEW, infoText: 'View allowed K8s resources.' },
    {
        value: ActionTypes.ADMIN,
        label: ActionTypes.MANAGER,
        infoText: 'Create, view, edit & delete allowed K8s resources.',
    },
    {
        value: ActionTypes.EDIT,
        label: ActionTypes.ADMIN,
        infoText: 'Can perform all actions and provide access to allowed K8s resources to other users.',
    },
]

export const headerOptions = ['CLUSTER', 'API GROUP', 'KIND', 'NAMESPACE', 'OBJECT', 'ROLE']

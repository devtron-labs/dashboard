export enum FILE_NAMES {
    Apps = 'Devtron Apps',
    Users = 'Devtron Apps Users Data',
    Groups = 'Devtron Apps Permission Groups',
}

export interface ExportToCsvProps {
    apiPromise: any
    fileName: FILE_NAMES
    className?: string
}

export const APPLIST_EXPORT_HEADERS = [
    { label: 'App Name', key: 'appName' },
    { label: 'App ID', key: 'appId' },
    { label: 'Project Name', key: 'projectName' },
    { label: 'Project ID', key: 'projectId' },
    { label: 'Application Status', key: 'status' },
    { label: 'Environment Name', key: 'environmentName' },
    { label: 'Environment ID', key: 'environmentId' },
    { label: 'Cluster Name', key: 'clusterName' },
    { label: 'Cluster ID', key: 'clusterId' },
    { label: 'Namespace Name', key: 'namespace' },
    { label: 'Namespace ID', key: 'namespaceId' },
    { label: 'Last Deployed', key: 'lastDeployedTime' },
]

export const USER_EXPORT_HEADERS = [
    { label: 'Email address', key: 'emailId' },
    { label: 'User ID', key: 'userId' },
    { label: 'Superadmin', key: 'superAdmin' },
    { label: 'Group permissions', key: 'groups' },
    { label: 'Project', key: 'project' },
    { label: 'Environment', key: 'environment' },
    { label: 'Application', key: 'application' },
    { label: 'Role', key: 'role' },
]

export const USER_EXPORT_HEADER_ROW = {
    emailId: 'Email address',
    userId: 'User ID',
    superAdmin: 'Superadmin',
    groups: 'Group permissions',
    project: 'Project',
    environment: 'Environment',
    application: 'Application',
    role: 'Role',
}

export const GROUP_EXPORT_HEADERS = [
    { label: 'Group Name', key: 'groupName' },
    { label: 'Group ID', key: 'groupId' },
    { label: 'Description', key: 'description' },
    { label: 'Project', key: 'project' },
    { label: 'Environment', key: 'environment' },
    { label: 'Application', key: 'application' },
    { label: 'Role', key: 'role' },
]

export const GROUP_EXPORT_HEADER_ROW = {
    groupName: 'Group Name',
    groupId: 'Group ID',
    description: 'Description',
    project: 'Project',
    environment: 'Environment',
    application: 'Application',
    role: 'Role',
}

export const CSV_HEADERS = {
    [FILE_NAMES.Apps]: APPLIST_EXPORT_HEADERS,
    [FILE_NAMES.Users]: USER_EXPORT_HEADERS,
    [FILE_NAMES.Groups]: GROUP_EXPORT_HEADERS,
}

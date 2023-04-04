import React from 'react'
import { ACCESS_TYPE_MAP } from '../../config'
import { Nodes } from '../app/types'

export enum EntityTypes {
    CHART_GROUP = 'chart-group',
    DIRECT = 'apps',
    DOCKER = 'docker',
    GIT = 'git',
    CLUSTER = 'cluster',
    NOTIFICATION = 'notification',
}

export enum ActionTypes {
    MANAGER = 'manager',
    ADMIN = 'admin',
    TRIGGER = 'trigger',
    VIEW = 'view',
    UPDATE = 'update',
    EDIT = 'edit',
    APPROVER = 'approver'
}

export type ActionRoleType = ActionTypes.MANAGER | ActionTypes.VIEW | ActionTypes.TRIGGER | ActionTypes.ADMIN

export enum DefaultUserKey {
    SYSTEM = 'system',
    ADMIN = 'admin',
}

export const DefaultUserValue = {
    system: 'System',
    admin: 'Admin',
}

export const ACTION_LABEL = {
    [ActionTypes.ADMIN]: 'Admin',
    [ActionTypes.VIEW]: 'View',
    [ActionTypes.MANAGER]: 'Manager',
}

export interface CollapsedUserOrGroupProps {
    index: number
    email_id?: string
    id?: number
    name?: string
    description?: string
    type: 'user' | 'group'
    updateCallback: (index: number, payload: any) => void
    deleteCallback: (index: number) => void
    createCallback: (payload: any) => void
}
interface RoleFilter {
    entity: EntityTypes.DIRECT | EntityTypes.CHART_GROUP | EntityTypes.CLUSTER
    team?: OptionType
    entityName?: OptionType[]
    environment?: OptionType[]
    action?: any
    cluster?: OptionType
    namespace?: OptionType
    group?: OptionType
    kind?: OptionType
    resource?: any
}

export interface DirectPermissionsRoleFilter extends RoleFilter {
    entity: EntityTypes.DIRECT
    team: OptionType
    entityName: OptionType[]
    entityNameError?: string
    environment: OptionType[]
    environmentError?: string
    action: {
        label: string
        value: ActionRoleType
    }
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS,
    approver?: boolean
}

export interface ChartGroupPermissionsFilter extends RoleFilter {
    entity: EntityTypes.CHART_GROUP
    team?: never
    environment?: never
    action: ActionTypes.ADMIN | ActionTypes.MANAGER | ActionTypes.TRIGGER | ActionTypes.VIEW | ActionTypes.UPDATE | '*'
}

export interface APIRoleFilter {
    entity: EntityTypes.DIRECT | EntityTypes.CHART_GROUP | EntityTypes.CLUSTER
    team?: string
    entityName?: string
    environment?: string
    action: ActionTypes.ADMIN | ActionTypes.MANAGER | ActionTypes.TRIGGER | ActionTypes.VIEW | ActionTypes.UPDATE | '*'
    accessType?: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS
    cluster?: any
    namespace?: any
    group?: any
    kind?: any
    resource?: any
}

export interface OptionType {
    label: string
    value: string
}

export interface UserConfig {
    id: number
    email_id: string
    groups: string[]
    roleFilters: RoleFilter[]
}

export interface CreateUser {
    id: number
    email_id: string
    groups: string[]
    roleFilters: APIRoleFilter[]
    superAdmin: boolean
}

export interface CreateGroup {
    id: number
    name: string
    description: string
    roleFilters: APIRoleFilter[]
}

export interface K8sPermissionFilter {
    entity: EntityTypes
    cluster: OptionType
    namespace: OptionType
    group: OptionType
    action: OptionType
    kind: OptionType
    resource: any
    key?: number
}
export interface K8sPermission {
    k8sPermission: any[]
    setK8sPermission: (any) => void
}

export enum UserRoleType {
    SuperAdmin = 'SuperAdmin',
    Admin = 'Admin',
    Manager = 'Manager',
    Trigger = 'Trigger',
    View = 'View,',
}

export interface K8sListItemCardType {
    key?: number
    k8sPermission: K8sPermissionFilter
    handleK8sPermission: (action: string, key?: number, data?: any) => void
    index: number
    namespaceMapping: Record<string, OptionType[]>
    setNamespaceMapping: React.Dispatch<React.SetStateAction<Record<number, OptionType[]>>>
    apiGroupMapping: Record<number, OptionType[]>
    setApiGroupMapping: React.Dispatch<React.SetStateAction<Record<number, OptionType[]>>>
    kindMapping: Record<number, OptionType[]>
    setKindMapping: React.Dispatch<React.SetStateAction<Record<number, OptionType[]>>>
    objectMapping: Record<number, OptionType[]>
    setObjectMapping: React.Dispatch<React.SetStateAction<Record<number, OptionType[]>>>
    selectedPermissionAction: {
        action: string
        index: number
    }
}

export interface K8sPermissionModalType {
    selectedPermissionAction: {
        action: string
        index: number
    }
    k8sPermission: K8sPermissionFilter
    setK8sPermission: (...rest) => void
    close: () => void
}

export interface AppPermissionsType {
    data: CreateGroup | CreateUser
    directPermission: DirectPermissionsRoleFilter[]
    setDirectPermission: (...rest) => void
    chartPermission: ChartGroupPermissionsFilter
    setChartPermission: (ChartGroupPermissionsFilter: ChartGroupPermissionsFilter) => void
    hideInfoLegend?: boolean
    k8sPermission?: K8sPermissionFilter[]
    setK8sPermission?: React.Dispatch<React.SetStateAction<K8sPermissionFilter[]>>
    currentK8sPermissionRef?: React.MutableRefObject<K8sPermissionFilter[]>
}
export interface AppPermissionsDetailType {
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS
    handleDirectPermissionChange: (...rest) => void
    removeDirectPermissionRow: (index: number) => void
    AddNewPermissionRow: (accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS) => void
    directPermission: DirectPermissionsRoleFilter[]
    hideInfoLegend?: boolean
}

export const K8S_PERMISSION_INFO_MESSAGE = {
    [Nodes.CronJob]: 'Specified role will be provided for child Job(s), Pod(s) of selected CronJob(s).',
    [Nodes.Job]: 'Specified role will be provided for child Pod(s) of selected Job(s).',
    [Nodes.Deployment]: 'Specified role will be provided for child ReplicaSet(s) and Pod(s) of selected Deployment(s).',
    [Nodes.ReplicaSet]: 'Specified role will be provided for child Pod(s) of selected ReplicaSet(s).',
    [Nodes.Rollout]: 'Specified role will be provided for child ReplicaSet(s) and Pod(s) of selected Rollout(s).',
    [Nodes.StatefulSet]: 'Specified role will be provided for child Pod(s) of selected StatefulSet(s).',
    [Nodes.DaemonSet]: 'Specified role will be provided for child Pod(s) of selected DaemonSet(s).',
}

export const ALL_NAMESPACE = { label: 'All Namespaces / Cluster scoped', value: '*' }

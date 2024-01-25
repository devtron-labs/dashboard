// TODO (v3): Remove this file

import React from 'react'
import { ACCESS_TYPE_MAP } from '../../../../../../config'
import { PermissionGroup, User } from '../../../types'
import { Nodes } from '../../../../../../components/app/types'
import { ChartGroup } from '../../../../../../components/charts/charts.types'
import { OptionType } from '@devtron-labs/devtron-fe-common-lib'

export enum EntityTypes {
    CHART_GROUP = 'chart-group',
    DIRECT = 'apps',
    JOB = 'jobs',
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

export const ACTION_LABEL = {
    [ActionTypes.ADMIN]: 'Admin',
    [ActionTypes.VIEW]: 'View',
    [ActionTypes.MANAGER]: 'Manager',
}

interface RoleFilter {
    entity: EntityTypes.DIRECT | EntityTypes.CHART_GROUP | EntityTypes.CLUSTER | EntityTypes.JOB
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
    entity: EntityTypes.DIRECT | EntityTypes.JOB
    team: OptionType
    entityName: OptionType[]
    entityNameError?: string
    environment: OptionType[]
    environmentError?: string
    workflowError?: string
    action: {
        label: string
        value: string
        configApprover?: boolean
    }
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS
    workflow?: OptionType[]
    approver?: boolean
}

export interface ChartGroupPermissionsFilter extends RoleFilter {
    entity: EntityTypes.CHART_GROUP
    team?: never
    environment?: never
    action: string
}

export interface APIRoleFilter {
    entity: EntityTypes.DIRECT | EntityTypes.CHART_GROUP | EntityTypes.CLUSTER | EntityTypes.JOB
    team?: string
    entityName?: string
    environment?: string
    action: string
    accessType?: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS
    cluster?: any
    namespace?: any
    group?: any
    kind?: any
    resource?: any
    workflow?: string
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
    customRoles:CustomRoleAndMeta
}
export interface UserGroup {
    appsList: Map<number, { loading: boolean; result: { id: number; name: string }[]; error: any }>
    userGroupsList: any[]
    environmentsList: any[]
    projectsList: any[]
    chartGroupsList: ChartGroup[]
    fetchAppList: (projectId: number[]) => void
    envClustersList: any[]
    fetchAppListHelmApps: (projectId: number[]) => void
    fetchJobsList: (projectId: number[]) => void
    jobsList: Map<number, { loading: boolean; result: { id: number; jobName: string }[]; error: any }>
    appsListHelmApps: Map<number, { loading: boolean; result: { id: number; name: string }[]; error: any }>
    customRoles: CustomRoleAndMeta
    isAutoAssignFlowEnabled: boolean
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
    data: PermissionGroup | User
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
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS
    handleDirectPermissionChange: (...rest) => void
    removeDirectPermissionRow: (index: number) => void
    AddNewPermissionRow: (
        accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS,
    ) => void
    directPermission: DirectPermissionsRoleFilter[]
    hideInfoLegend?: boolean
    selectedJobs?: string[]
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

export interface CustomRoles {
    id: number
    roleName: string
    roleDisplayName: string
    roleDescription: string
    entity: EntityTypes
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS
}
export interface CustomRoleAndMeta {
    customRoles: CustomRoles[]
    possibleRolesMeta: {}
    possibleRolesMetaForHelm: {}
    possibleRolesMetaForCluster: {}
    possibleRolesMetaForJob: {}
}

export const ViewChartGroupPermission:APIRoleFilter = {
    entity: EntityTypes.CHART_GROUP,
    action: ActionTypes.VIEW,
}

// TODO (v3): Remove this file

import React from 'react'
import { OptionType, ServerError } from '@devtron-labs/devtron-fe-common-lib'
import { ACCESS_TYPE_MAP } from '../../../../../../config'
import { Nodes } from '../../../../../../components/app/types'
import { ChartGroup } from '../../../../../../components/charts/charts.types'
import { K8sPermissionActionType } from '../K8sObjectPermissions/constants'

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
    APPROVER = 'approver',
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    action?: any
    cluster?: OptionType
    namespace?: OptionType
    group?: OptionType
    kind?: OptionType
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    accessType?: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cluster?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    namespace?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    group?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    kind?: any
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resource: any
    key?: number
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    handleK8sPermission: (action: K8sPermissionActionType, key?: number, data?: any) => void
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
        action: K8sPermissionActionType
        index: number
    }
}

export interface CustomRoles {
    id: number
    roleName: string
    roleDisplayName: string
    roleDescription: string
    entity: EntityTypes
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS
}

export type MetaPossibleRoles = Record<
    CustomRoles['roleName'],
    {
        value: CustomRoles['roleDisplayName']
        description: CustomRoles['roleDescription']
    }
>

export interface CustomRoleAndMeta {
    customRoles: CustomRoles[]
    possibleRolesMeta: MetaPossibleRoles
    possibleRolesMetaForHelm: MetaPossibleRoles
    possibleRolesMetaForCluster: MetaPossibleRoles
    possibleRolesMetaForJob: MetaPossibleRoles
}

export interface UserGroup {
    customRoles: CustomRoleAndMeta
    isAutoAssignFlowEnabled: boolean
}

export interface K8sPermissionModalType {
    selectedPermissionAction: {
        // TODO: Review: should be clone, edit, delete and add probably
        action: K8sPermissionActionType
        index: number
    }
    updatedK8sPermission: K8sPermissionFilter
    close: () => void
}

type AppsList = Map<number, { loading: boolean; result: { id: number; name: string }[]; error: ServerError }>
type JobsList = Map<number, { loading: boolean; result: { id: number; jobName: string }[]; error: ServerError }>

export interface AppPermissionsDetailType {
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS
    handleDirectPermissionChange: (...rest) => void
    removeDirectPermissionRow: (index: number) => void
    AddNewPermissionRow: (
        accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS | ACCESS_TYPE_MAP.JOBS,
    ) => void
    appsListHelmApps: AppsList
    jobsList: JobsList
    appsList: AppsList
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    environmentsList: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    projectsList: any[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    envClustersList: any[]
    getListForAccessType: (accessType: ACCESS_TYPE_MAP) => AppsList | JobsList
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

export const ViewChartGroupPermission: APIRoleFilter = {
    entity: EntityTypes.CHART_GROUP,
    action: ActionTypes.VIEW,
}

export interface DirectPermissionRow
    extends Pick<
        AppPermissionsDetailType,
        | 'appsList'
        | 'jobsList'
        | 'appsListHelmApps'
        | 'projectsList'
        | 'environmentsList'
        | 'envClustersList'
        | 'getListForAccessType'
    > {
    permission: DirectPermissionsRoleFilter
    handleDirectPermissionChange: (...rest) => void
    index: number
    removeRow: (index: number) => void
}

export interface ChartPermissionRow {
    chartGroupsList: ChartGroup[]
}

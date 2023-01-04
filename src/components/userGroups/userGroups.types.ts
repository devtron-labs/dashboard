import { ACCESS_TYPE_MAP } from '../../config';

export enum EntityTypes {
    CHART_GROUP = 'chart-group',
    DIRECT = '',
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
}
export interface CollapsedUserOrGroupProps {
    index: number;
    email_id?: string;
    id?: number;
    name?: string;
    description?: string;
    type: 'user' | 'group';
    updateCallback: (index: number, payload: any) => void;
    deleteCallback: (index: number) => void;
    createCallback: (payload: any) => void;
}
interface RoleFilter {
    entity: EntityTypes.DIRECT | EntityTypes.CHART_GROUP | EntityTypes.CLUSTER;
    team?: OptionType;
    entityName?: OptionType[];
    environment?: OptionType[];
    action?: any;
    cluster?: OptionType,
    namespace?: OptionType,
    group?: OptionType,
    kind?: OptionType,
    resource?: any
}

export interface DirectPermissionsRoleFilter extends RoleFilter {
    entity: EntityTypes.DIRECT;
    team: OptionType;
    entityName: OptionType[];
    entityNameError?: string;
    environment: OptionType[];
    environmentError?: string;
    action: {
        label: string;
        value: ActionTypes.ADMIN | ActionTypes.MANAGER | ActionTypes.TRIGGER | ActionTypes.VIEW;
    };
    accessType: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS;
}

export interface ChartGroupPermissionsFilter extends RoleFilter {
    entity: EntityTypes.CHART_GROUP;
    team?: never;
    environment?: never;
    action: ActionTypes.ADMIN | ActionTypes.MANAGER | ActionTypes.TRIGGER | ActionTypes.VIEW | ActionTypes.UPDATE | '*';
}

export interface APIRoleFilter {
    entity: EntityTypes.DIRECT | EntityTypes.CHART_GROUP | EntityTypes.CLUSTER;
    team?: string;
    entityName?: string;
    environment?: string;
    action: ActionTypes.ADMIN | ActionTypes.MANAGER | ActionTypes.TRIGGER | ActionTypes.VIEW | ActionTypes.UPDATE | '*';
    accessType?: ACCESS_TYPE_MAP.DEVTRON_APPS | ACCESS_TYPE_MAP.HELM_APPS;
    cluster?: OptionType,
    namespace?: any,
    group?: any,
    kind?: any,
    resource?: any
}

export interface OptionType {
    label: string;
    value: string;
}

export interface UserConfig {
    id: number;
    email_id: string;
    groups: string[];
    roleFilters: RoleFilter[];
}

export interface CreateUser {
    id: number;
    email_id: string;
    groups: string[];
    roleFilters: APIRoleFilter[];
    superAdmin: boolean;
}

export interface CreateGroup {
    id: number;
    name: string;
    description: string;
    roleFilters: APIRoleFilter[];
}

export interface K8sPermissionFilter {
    entity: EntityTypes.CLUSTER,
    cluster: OptionType,
    namespace: OptionType,
    group: OptionType,
    action: OptionType,
    kind: OptionType,
    resource: any
}

export enum UserRoleType {
    SuperAdmin = 'SuperAdmin',
    Admin = 'Admin',
    Manager = 'Manager',
    Trigger = 'Trigger',
    View = 'View,',
}

const possibleRolesMeta = {
    [ActionTypes.VIEW]: {
        value: 'View',
        description: 'View allowed K8s resources.',
    },
    [ActionTypes.ADMIN]: {
        value: 'Admin',
        description: 'Create, view, edit & delete allowed K8s resources.',
    },
    [ActionTypes.EDIT]: {
        value: 'Manager',
        description: 'Can perform all actions and provide access to allowed K8s resources to other users.',
    },
}
 
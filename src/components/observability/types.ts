import { FiltersTypeEnum, TableProps } from ".yalc/@devtron-labs/devtron-fe-common-lib/dist"

export enum GlanceMetricsKeys {
    REACHABLE_CUSTOMERS = 'customers',
    TOTAL_PROJECTS = 'Projects',
    TOTAL_VMs = 'vms',
    HEALTH_STATUS = 'healthStatus',
}


export interface ObservabilityProject {
    id: string,
    name: string,
    description: string,
    status: string,
    totalVms: number,
    activeVms: number,
    healthStatus: string
}

export type ProjectTableProps = TableProps<
    ObservabilityProject,
    FiltersTypeEnum.STATE,
    {}
>

export enum ProjectListFields {
    PROJECT_ID = 'id',
    PROJECT_NAME = 'name',
    PROJECT_DESCRIPTION = 'description',
    PROJECT_STATUS = 'status',
    TOTAL_VMS = 'totalVms',
    ACTIVE_VMS = 'activeVms',
    HEALTH_STATUS = 'healthStatus',
}

export interface ObservabilityVM {
    id: string,
    name: string,
    ipAddress: string,
    status: string,
    cpu: number,
    memory: number,
    disk: number
}

export type VMTableProps = TableProps<
    ObservabilityVM,
    FiltersTypeEnum.STATE,
    {}
>

export enum VMListFields {
    VM_ID = 'id',
    VM_NAME = 'name',
    VM_IPADDRESS = 'ipAddress',
    VM_STATUS = 'status',
    VM_CPU = 'cpu',
    VM_MEMORY = 'memory',
    VM_DISK = 'disk',
}

export enum ObservabilityFilters {
    customer = 'customer',
    project = 'project',
    vm = 'vm',
}

export enum TabDetailsSegment {
    'OVERVIEW' = 'Overview',
    'PROJECTS' = 'Projects'
}

export interface TabDetailsSearchParams {
    tab: TabDetailsSegment
}
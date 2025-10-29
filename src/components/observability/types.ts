import { FiltersTypeEnum, IconName, TableProps } from '.yalc/@devtron-labs/devtron-fe-common-lib/dist'

export enum GlanceMetricsKeys {
    REACHABLE_CUSTOMERS = 'customers',
    TOTAL_PROJECTS = 'Projects',
    TOTAL_VMs = 'vms',
    HEALTH_STATUS = 'healthStatus',
}

export type ObservabilityStatus = 'ACTIVE' | 'INACTIVE'

export interface BaseObservability {
    id: number
    name: string
    status: ObservabilityStatus
}

export interface CustomerObservabilityDTO extends BaseObservability {
    project: number
    totalVms: number
    activeVms: number
    healthStatus: string
}

export type CustomerTableProps = TableProps<CustomerObservabilityDTO, FiltersTypeEnum.STATE, {}>

export interface ObservabilityProject
    extends BaseObservability,
    Pick<CustomerObservabilityDTO, 'activeVms' | 'totalVms' | 'healthStatus'> {
    description: string
}

export type ProjectTableProps = TableProps<ObservabilityProject, FiltersTypeEnum.STATE, {}>

export interface ObservabilityVM extends BaseObservability {
    ipAddress: string
    cpu: number
    memory: number
    disk: number
}

export type VMTableProps = TableProps<ObservabilityVM, FiltersTypeEnum.STATE, {}>

export enum ProjectListFields {
    PROJECT_ID = 'id',
    PROJECT_NAME = 'name',
    PROJECT_DESCRIPTION = 'description',
    STATUS = 'status',
    TOTAL_VMS = 'totalVms',
    ACTIVE_VMS = 'activeVms',
    HEALTH_STATUS = 'healthStatus',
    PROJECTS = 'projects',
}

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
    'PROJECTS' = 'Projects',
}

export interface TabDetailsSearchParams {
    tab: TabDetailsSegment
}

export interface MetricsInfoCardProps {
    dataTestId: string
    metricTitle: string
    metricValue: string
    metricUnit?: string
    valueOutOf?: string
    iconName: IconName
    tooltipContent: string
    redirectionLink?: string
}

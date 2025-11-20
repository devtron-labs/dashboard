import { ObservabilityGlanceMetricKeys } from './constants'
import { CustomerObservabilityDTO, ObservabilityOverviewDTO } from './types'

export const getObservabilityData: () => Promise<ObservabilityOverviewDTO> = () =>
    Promise.resolve({
        glanceConfig: {
            [ObservabilityGlanceMetricKeys.TOTAL_CUSTOMERS]: 4,
            [ObservabilityGlanceMetricKeys.TOTAL_VMS]: 20,
            [ObservabilityGlanceMetricKeys.PROJECTS]: 2,
            [ObservabilityGlanceMetricKeys.HEALTH_STATUS]: 50,
            [ObservabilityGlanceMetricKeys.TOTAL_CLUSTER]: 2,
            [ObservabilityGlanceMetricKeys.RUNNING_VMS]: 40,
        },
        metrics: [
            {
                id: 1,
                name: 'Tenants1',
                cpu: { capacity: 36, utilization: '10.75' },
                memory: { capacity: 141, utilization: '22.75' },
                disk: { capacity: 50, utilization: '32.75' },
            },
            {
                id: 2,
                name: 'Tenant2',
                cpu: { capacity: 36, utilization: '20.75' },
                memory: { capacity: 121, utilization: '40.75' },
                disk: { capacity: 50, utilization: '60.75' },
            },
            {
                id: 3,
                name: 'Tenants3',
                cpu: { capacity: 36, utilization: '6.75' },
                memory: { capacity: 141, utilization: '2.75' },
                disk: { capacity: 50, utilization: '22.75' },
            },
            {
                id: 4,
                name: 'Tenants4',
                cpu: { capacity: 36, utilization: '6.75' },
                memory: { capacity: 141, utilization: '22.75' },
                disk: { capacity: 50, utilization: '22.75' },
            },
        ],
    })

export const getProjectList: () => Promise<any> = () =>
    Promise.resolve([
        {
            id: 1,
            name: 'Project-1',
            description: 'Description of Project-1',
            status: 'Active',
            totalVms: 40,
            activeVms: 50,
            healthStatus: '80%',
        },
        {
            id: 2,
            name: 'Project-2',
            description: 'Description of Project-2',
            status: 'Active',
            totalVms: 40,
            activeVms: 50,
            healthStatus: '80%',
        },
        {
            id: 3,
            name: 'Project-3',
            description: 'Description of Project-3',
            status: 'Active',
            totalVms: 40,
            activeVms: 50,
            healthStatus: '80%',
        },
        {
            id: 4,
            name: 'Project-4',
            description: 'Description of Project-4',
            status: 'Active',
            totalVms: 40,
            activeVms: 50,
            healthStatus: '80%',
        },
        {
            id: 5,
            name: 'Project-5',
            description: 'Description of Project-5',
            status: 'Active',
            totalVms: 40,
            activeVms: 50,
            healthStatus: '80%',
        },
    ])

export const getVMList: () => Promise<any> = () =>
    Promise.resolve([
        {
            id: 1,
            name: 'PIS-Web-Server-01',
            ipAddress: '192.168.1.101',
            status: 'running',
            cpu: 40,
            memory: 50,
            disk: 80,
        },
        {
            id: 2,
            name: 'PIS-DB-Server-01',
            ipAddress: '192.168.1.102',
            status: 'running',
            cpu: 40,
            memory: 50,
            disk: 80,
        },
    ])

export const getCustomerListData: () => Promise<CustomerObservabilityDTO[]> = () =>
    Promise.resolve([
        {
            id: 1,
            name: 'Tenants1',
            status: 'ACTIVE',
            project: 2,
            totalVms: 14,
            healthStatus: '80%',
            activeVms: 2,
        },
        {
            id: 2,
            name: 'Tenant2',
            status: 'INACTIVE',
            project: 34,
            totalVms: 4,
            healthStatus: '20%',
            activeVms: 1,
        },
        {
            id: 3,
            name: 'Tenants3',
            status: 'INACTIVE',
            project: 34,
            totalVms: 4,
            healthStatus: '20%',
            activeVms: 1,
        },
        {
            id: 4,
            name: 'tenants4',
            status: 'ACTIVE',
            project: 34,
            totalVms: 4,
            healthStatus: '30%',
            activeVms: 1,
        },
    ])

export const getProjectOverViewCards: () => Promise<any> = () =>
    Promise.resolve([
        {
            tooltipContent: '',
            dataTestId: 'cpu_id',
            metricValue: '16',
            metricTitle: 'CPU',
            iconName: 'ic-bg-cpu',
        },
        {
            tooltipContent: '',
            dataTestId: 'disk_id',
            metricValue: '400',
            metricTitle: 'DISK',
            iconName: 'ic-bg-cpu',
        },
        {
            tooltipContent: '',
            dataTestId: 'memory_id',
            metricValue: '1000',
            metricTitle: 'MEMORY',
            iconName: 'ic-bg-cpu',
        },
        {
            tooltipContent: '',
            dataTestId: 'running_id',
            metricValue: '10',
            metricTitle: 'RUNNING VMs',
            iconName: 'ic-bg-cpu',
        },
    ])

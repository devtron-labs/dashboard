import { ObservabilityGlanceMetricKeys } from './constants'
import { CustomerObservabilityDTO, ObservabilityOverviewDTO } from './types'

export const getObservabilityData: () => Promise<Partial<ObservabilityOverviewDTO>> = () =>
    Promise.resolve({
        [ObservabilityGlanceMetricKeys.TOTAL_CUSTOMERS]: 10,
        [ObservabilityGlanceMetricKeys.TOTAL_VMS]: 20,
        [ObservabilityGlanceMetricKeys.PROJECTS]: 30,
        [ObservabilityGlanceMetricKeys.HEALTH_STATUS]: 50,
        // [ObservabilityGlanceMetricKeys.RUNNING_VMS]: 40,
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
            name: 'Customer1',
            status: 'ACTIVE',
            projects: 2,
            totalVms: 14,
            healthStatus: '80%',
            activeVms: 2,
            icon: 'ic-devtron',
        },
        {
            id: 2,
            name: 'Customer2',
            status: 'INACTIVE',
            projects: 34,
            totalVms: 4,
            healthStatus: '20%',
            activeVms: 1,
            icon: 'ic-helm',
        },
    ] as unknown as CustomerObservabilityDTO[])

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

export const getObservabilityData: () => Promise<any> = () =>
    Promise.resolve({
        totalClusters: 10,
        totalVMs: 20,
        totalProjects: 30,
        totalCustomers: 40,
        healthStatus: 50,
    })

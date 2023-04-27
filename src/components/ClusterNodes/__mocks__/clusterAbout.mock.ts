export const clusterId = 1
export const mockSuccessResponse = {
    code: 200,
    result: {
        cluster_name: 'default_cluster',
        cluster_id: clusterId,
        cluster_created_on: new Date().toISOString(),
        cluster_created_by: "Admin",
    }
}
export const mockFailedResponse = {
    code: 404,
}
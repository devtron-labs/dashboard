import React from 'react';

export const clusterId = "1"
export const mockSuccessResponseWithOutNote = {
    code: 200,
    status:"Ok",
    result: {
        clusterName: 'default_cluster_with_out_note',
        clusterId: clusterId,
        clusterCreatedOn: new Date().toISOString(),
        clusterCreatedBy: "System",
    }
}
export const mockSuccessResponseWithNote = {
    code: 200,
    status:"Ok",
    result: {
        clusterName: 'default_cluster_with_note',
        clusterId: clusterId,
        clusterCreatedOn: new Date().toISOString(),
        clusterCreatedBy: "System",
        clusterNote: {
            id: 1,
            description: "This is a test note",
            updatedBy: "Admin",
            updatedOn: new Date().toISOString(),
        }
    }
}
export const mockFailedResponse = {
    code: 404,
    status:"Not Found",
    errors: [{code:"000",internalMessage:"[{pg: no rows in result set}]",userMessage:"pg: no rows in result set"}]
}

export const mockMarkDownEditorComponent: JSX.Element = <div data-testid="mark-down-test-response">Mark Down Test Response</div>
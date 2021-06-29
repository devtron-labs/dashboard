import { get, post } from '../../services/api';

export function getReadme() {
    return get(`app-store/application/readme/240`)
}

export function updateBulkList(request): Promise<any>{
    const URL = `bulk-update`;
    return post(URL, request);
}

export function getOutputListMin(): Promise<{
    appNameIncludes: string;
    appNameExcludes: string;
    envId: number;
    isGlobal: boolean;
    patchJson: string;
}[]> {
    return new Promise((resolve, reject) => {
        resolve([{
            "appNameIncludes": "demo",
            "appNameExcludes": "docker-config",
            "envId": 5,
            "isGlobal": true,
            "patchJson": "string"
        },
        {
            "appNameIncludes": "demo-env",
            "appNameExcludes": "docker-config",
            "envId": 5,
            "isGlobal": true,
            "patchJson": "string"
        },
        {
            "appNameIncludes": "demo_live",
            "appNameExcludes": "docker-config",
            "envId": 5,
            "isGlobal": true,
            "patchJson": "string"
        },
        {
            "appNameIncludes": "demo-env",
            "appNameExcludes": "docker-config",
            "envId": 5,
            "isGlobal": true,
            "patchJson": "string"
        },
    ])
    })
}

// export function getImpactedObjectsListMin(): Promise<{
    
// }>{

// }
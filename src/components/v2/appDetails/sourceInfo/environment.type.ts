
export interface AppEnvironment {
    environmentName: string
    environmentId: number
    appMetrics: boolean;
    infraMetrics: boolean;
    prod: boolean;
    isSelected? : boolean;
}

export interface NodeStreamMap {
    group: string
    kind: string
    message: string
    name: string
    namespace: string
    status: string
    syncPhase: string
    version: string
}

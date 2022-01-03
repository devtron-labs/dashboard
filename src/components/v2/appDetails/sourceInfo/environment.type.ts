
export interface AppEnvironment {
    environmentName: string
    environmentId: number
    appMetrics: boolean;
    infraMetrics: boolean;
    prod: boolean;
    isSelected? : boolean;
}

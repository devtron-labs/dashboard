import { AppEnvironment } from "../../../services/service.types";

/**
 * Mock data for the shimmer loader
 */
export const loadingEnvironmentList: AppEnvironment[] = Array.from(Array(10).keys()).map(index => ({
        environmentId: index,
        environmentName: '',
        appMetrics: false,
        infraMetrics: false,
        prod: false,
    }))

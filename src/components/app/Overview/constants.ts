import { AppEnvironment } from '../../../services/service.types'

/**
 * Mock data for the shimmer loader
 */
export const loadingEnvironmentList: AppEnvironment[] = Array.from(Array(3).keys()).map((index) => ({
    environmentId: index,
    environmentName: '',
    appMetrics: false,
    infraMetrics: false,
    prod: false,
}))

/**
 * Tabs for the overview of the app(s)
 */
export const OVERVIEW_TABS = {
    ABOUT: 'about',
    ENVIRONMENTS: 'environments',
    JOB_PIPELINES: 'job-pipelines',
    DEPENDENCIES: 'dependencies',
} as const

export const TAB_SEARCH_KEY = 'tab'

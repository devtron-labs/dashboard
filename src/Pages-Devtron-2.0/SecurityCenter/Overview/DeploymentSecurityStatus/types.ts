import { DeploymentSecurityStatusKeys } from '../types'

export interface CoverageCardProps {
    metricKey: DeploymentSecurityStatusKeys
    coveragePercent: number
    isLoading?: boolean
}

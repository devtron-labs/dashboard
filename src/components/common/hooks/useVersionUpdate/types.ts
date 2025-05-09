export interface VersionUpdateProps {
    toastEligibleRoutes: {
        path: string
        exact: boolean
        condition: boolean
        component: JSX.Element
        eligibleLocation: string
    }[]
}

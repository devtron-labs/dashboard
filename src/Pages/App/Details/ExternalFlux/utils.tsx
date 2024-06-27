export const getAppStatus = (appStatus: string) => {
    if (appStatus === 'True') {
        return 'Ready'
    }
    if (appStatus === 'False') {
        return 'Not Ready'
    }
    return appStatus
}

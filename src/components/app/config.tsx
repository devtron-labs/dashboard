export const Colors = {
    yellow: '#FF7E5B',
    red: '#FF3E3E',
    green: '#1DAD70',
    orange: '#FF7E5B',
    gray: 'rgba(128, 128, 128, 1)',
}

/**
 * @deprecated
 */
export const statusIcon = {
    failed: 'failed',
    queued: 'queued',
    suspended: 'suspended',
    starting: 'progressing',
    initiating: 'progressing',
    unknown: 'unknown',
    degraded: 'degraded',
    healthy: 'healthy',
    notdeployed: 'not-deployed',
    missing: 'missing',
    progressing: 'progressing',
    deploymentinitiated: 'progressing',
    hibernating: 'hibernating',
    succeeded: 'healthy',
    timedout: 'timed-out',
    unabletofetch: 'failed',
}

export const AppListViewType = {
    LOADING: 'LOADING',
    LIST: 'LIST',
    EMPTY: 'LIST_EMPTY',
    NO_RESULT: 'NO_RESULT',
    ERROR: 'ERROR',
}

export const CI_PIPELINE_VIEW = {
    SELECT_PIPELINE: 'SELECT_PIPELINE',
}

export const TriggerStatus = {
    pending: Colors.orange,
    starting: Colors.yellow,
    running: Colors.yellow,
    succeeded: Colors.green,
    failed: Colors.red,
    error: Colors.red,
    cancelled: Colors.gray,
    notbuilt: Colors.gray,
    nottriggered: Colors.gray,
}

export const APP_STATUS = {
    Degraded: 'Degraded',
    Healthy: 'Healthy',
    Hibernating: 'HIBERNATING',
    Missing: 'Missing',
    Progressing: 'Progressing',
    'Not Deployed': 'NOT DEPLOYED',
}

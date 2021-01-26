export const Colors = {
    yellow: "#FF7E5B",
    red: '#FF3E3E',
    green: '#1DAD70',
    orange: "#FF7E5B",
    gray: 'rgba(128, 128, 128, 1)',
};

export const statusColor = {
    suspended: '#ffaa00',
    unknown: 'var(--N700)',
    degraded: '#f32e2e',
    healthy: 'var(--G500)',
    notdeployed: 'var(--N700)',
    missing: 'var(--N700)',
    progressing: "#FF7E5B",
    starting: "#FF7E5B",
    succeeded: '#1dad70',
    running: '#FF7E5B',
    failed: '#f33e3e',
    cancelled: '#767d84',
    aborted: '#767d84',
}

export const statusIcon = {
    failed:'failed',
    suspended: 'suspended',
    starting: "progressing",
    unknown: 'unknown',
    degraded: 'degraded',
    healthy: 'healthy',
    notdeployed: 'not-deployed',
    missing: 'missing',
    progressing: 'progressing',
    deploymentinitiated: 'progressing',
    hibernating: 'hibernating'
}

export const AppListViewType = {
    LOADING: "LOADING",
    LIST: "LIST",
    EMPTY: "LIST_EMPTY",
    NO_RESULT: "NO_RESULT",
    ERROR: "ERROR",
}

export const CI_PIPELINE_VIEW = {
    SELECT_PIPELINE: "SELECT_PIPELINE",
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
    nottriggered: Colors.gray
}
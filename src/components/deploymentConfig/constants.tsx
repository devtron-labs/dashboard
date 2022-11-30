import { DOCUMENTATION } from '../../config'

export const ConfigType = {
    DEPLOYMENT: 'DEPLOYMENT',
    CONFIGMAP: 'CONFIGMAP',
}

export const getCommonSelectStyles = (styleOverrides = {}) => {
    return {
        control: (base, state) => ({
            ...base,
            minHeight: '32px',
            boxShadow: 'none',
            border: 'none',
            cursor: 'pointer',
        }),
        valueContainer: (base, state) => ({
            ...base,
            padding: '0',
            fontSize: '13px',
            fontWeight: '600',
        }),
        option: (base, state) => ({
            ...base,
            color: 'var(--N900)',
            backgroundColor: state.isFocused ? 'var(--N100)' : 'white',
        }),
        container: (base, state) => ({
            ...base,
            width: '100%',
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: 'var(--N400)',
            padding: '0 8px',
            transition: 'all .2s ease',
            transform: state.selectProps.menuIsOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        }),
        loadingMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        noOptionsMessage: (base) => ({
            ...base,
            color: 'var(--N600)',
        }),
        ...styleOverrides,
    }
}

export const BASIC_FIELDS = {
    CONTAINER_PORT: 'container_port',
    PORT: 'port',
    INGRESS: 'ingress',
    ENABLED: 'enabled',
    HOSTS: 'hosts',
    HOST: 'host',
    PATHS: 'paths',
    PATH: 'path',
    RESOURCES: 'resources',
    RESOURCES_CPU: 'resources_cpu',
    RESOURCES_MEMORY: 'resources_memory',
    LIMITS: 'limits',
    REQUESTS: 'requests',
    CPU: 'cpu',
    MEMORY: 'memory',
    ENV_VARIABLES: 'envVariables',
    NAME: 'name',
    VALUE: 'value',
}

export const BASIC_FIELD_MAPPING = {
    [BASIC_FIELDS.PORT]: '/ContainerPort/0/port',
    [BASIC_FIELDS.ENABLED]: '/ingress/enabled',
    [BASIC_FIELDS.HOSTS]: '/ingress/hosts',
    [BASIC_FIELDS.RESOURCES]: '/resources',
    [BASIC_FIELDS.ENV_VARIABLES]: '/EnvVariables',
}

export const BASIC_FIELD_PARENT_PATH = {
    [BASIC_FIELDS.CONTAINER_PORT]: '/ContainerPort',
    [BASIC_FIELDS.INGRESS]: '/ingress',
}

export const EDITOR_VIEW = {
    UNDEFINED: 'UNDEFINED',
    BASIC: 'BASIC',
    ADVANCED: 'ADVANCED',
}

export const CHART_TYPE_TAB_KEYS = { DEVTRON_CHART: 'devtronChart', CUSTOM_CHARTS: 'customCharts' }
export const CHART_TYPE_TAB = { devtronChart: 'Charts by Devtron', customCharts: 'Custom charts' }
export const CHART_DOCUMENTATION_LINK = {
    'Job & CronJob': DOCUMENTATION.JOB_CRONJOB,
    'Rollout Deployment': DOCUMENTATION.ROLLOUT,
}
export const RECOMMENDED_CHART_NAME = 'Deployment'

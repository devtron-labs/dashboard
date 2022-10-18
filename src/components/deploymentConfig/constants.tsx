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

export const BASIC_FIELD_MAPPING = {
  port: '/ContainerPort/0/port',
  host: '/ingress/hosts/0/host',
  paths: '/ingress/hosts/0/paths',
  resources: '/resources',
  envVariables: '/EnvVariables',
  hosts: '/ingress/hosts',
  resourcesMemory: '/resources/limits/memory',
  resourcesCPU: '/resources/limits/cpu',
}

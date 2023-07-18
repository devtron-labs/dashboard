export const SelectorMessaging = {
    WARNING_WITH_NO_TARGET: 'You have entered a custom target platform, please ensure it is valid.',
    WARNING_WITH_USING_NO_TARGET: 'You are using a custom target platform, please ensure it is valid.',
    PALTFORM_DESCRIPTION:
        'If target platform is not set, Devtron will build image for architecture and operating system of the k8s node on which CI is running',
    PALTFORM_DESCRIPTION_WITH_NO_TARGET: 'Target platform is not set',
    TARGET_SELECTOR_MENU: 'Type to enter a target platform. Press Enter to accept.',
}

export const AUTO_DETECT = 'Autodetect'
export const VERSION_DETECT_OPTION = {
    label: AUTO_DETECT,
    value: AUTO_DETECT,
    infoText: 'Detect version during build time',
}
export const USE_CUSTOM_BUILDER = 'Use custom builder: Enter builder image tag'
export const CI_BUILDPACK_OPTION_TEXTS = {
    BuilderTippyContent: {
        heading: 'Builder',
        infoText:
            "A builder is an image that contains a set of buildpacks which provide your app's dependencies, a stack, and the OS layer for your app image.",
        documentationLinkText: 'View documentation',
        selectBuilder: 'Select a Builder',
        additionalContent: {
            label: 'If using custom builder, builder image should be:',
            listItems: [
                'publicly available OR',
                'available in selected container registry OR',
                'accessible from the build node',
            ],
        },
    },
    ProjectPathTippyContent: {
        label: 'Build Context (Relative)',
        heading: 'Project Path',
        infoText: 'In case of monorepo, specify the path of the GIT Repo for the deployment of the project.',
    },
    Language: 'Language',
    Version: 'Version',
}

export const LANGUAGE_SELECT_STYLES = {
    control: (base, state) => ({
        ...base,
        minHeight: '36px',
        boxShadow: 'none',
        backgroundColor: 'var(--N50)',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
        cursor: 'pointer',
    }),
    menu: (base) => ({
        ...base,
        marginTop: '0',
        minWidth: '226px',
    }),
}

export const VERSION_SELECT_STYLES = {
    control: (base, state) => ({
        ...base,
        minHeight: '36px',
        boxShadow: 'none',
        backgroundColor: 'var(--N50)',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
        cursor: 'pointer',
    }),
    valueContainer: (base) => ({
        ...base,
        small: {
            display: 'none',
        },
    }),
    menu: (base) => ({
        ...base,
        marginTop: '0',
        minWidth: '226px',
    }),
}

export const BUILDER_SELECT_STYLES = {
    control: (base, state) => ({
        ...base,
        minHeight: '36px',
        boxShadow: 'none',
        backgroundColor: 'var(--N50)',
        border: state.isFocused ? '1px solid var(--B500)' : '1px solid var(--N200)',
        cursor: 'pointer',
    }),
    menu: (base) => ({
        ...base,
        marginTop: '0',
        minWidth: '226px',
    }),
}
export const RootBuildContext = './'
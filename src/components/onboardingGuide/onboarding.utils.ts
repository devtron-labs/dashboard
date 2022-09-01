import { updatePostHogEvent } from '../../services/service'

export const POSTHOG_EVENT_ONBOARDING = {
    PREVIEW: 'Preview',
    DEPLOY_CUSTOM_APP_CI_CD: 'Deploy custom app using CI/CD pipelines',
    INSTALL_CUSTOM_CI_CD: 'Install CI/CD',
    VIEW_APPLICATION: 'View helm application',
    BROWSW_HELM_CHART: 'Browse helm chart',
    CONNECT_CLUSTER: 'Connect cluster',
    CONNECT_CHART_REPOSITORY: 'Connect chart repository',
    TOOLTIP_OKAY: 'Tooltip okay',
    TOOLTIP_DONT_SHOW_AGAIN: 'Tooltip Dont show again',
    HELP: 'Clicked Help'
}

export const OnClickedHandler = (key) => {
    let payload = {
        eventType: key,
        key: 'login-count',
        value: '',
        active: true,
    }
    updatePostHogEvent(payload)
}

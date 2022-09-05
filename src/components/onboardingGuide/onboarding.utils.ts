import { URLS } from '../../config'
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

export const LOGIN_COUNT = 'login-count'

export const MAX_LOGIN_COUNT = 5

export const handlePostHogEventUpdate = (e, eventName?: string): void => {
    const payload = {
        eventType: eventName || e.target?.dataset.posthog,
        key: LOGIN_COUNT,
        value: '',
        active: true,
    }
    updatePostHogEvent(payload)
}

export const NAVIGATION = {
  AUTOCOMPLETE: `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}?hOffset=0&namespace=1&offset=0`,
  HELM_APPS: `${URLS.APP}/${URLS.APP_LIST}/${URLS.APP_LIST_HELM}`
}
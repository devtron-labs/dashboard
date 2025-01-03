// ------------ Configuration Constants ------------

export enum ConfigurationsTabTypes {
    SES = 'ses',
    SMTP = 'smtp',
    SLACK = 'slack',
    WEBHOOK = 'webhook',
}

export const ConfigurationTabText = {
    SES: 'Email (SES)',
    SMTP: 'Email (SMTP)',
    SLACK: 'Slack',
    WEBHOOK: 'Webhook',
}

export const EmptyConfigurationSubTitle = {
    [ConfigurationsTabTypes.SES]:
        'SES configuration will be used to send email notifications to the desired email address',
    [ConfigurationsTabTypes.SMTP]:
        'SMTP configuration will be used to send email notifications to the desired email address',
    [ConfigurationsTabTypes.SLACK]: 'Configure slack webhook to send notifications to a slack channel',
    [ConfigurationsTabTypes.WEBHOOK]: 'Configure webhook to send event data to external tools',
}
// ------------ SES Configuration Constants ------------
export const DEFAULT_MASKED_SECRET_KEY = '*******'

export enum SESFieldKeys {
    CONFIG_NAME = 'configName',
    ACCESS_KEY = 'accessKey',
    SECRET_KEY = 'secretKey',
    REGION = 'region',
    FROM_EMAIL = 'fromEmail',
}

export const DefaultSESValidationKeys = {
    [SESFieldKeys.CONFIG_NAME]: true,
    [SESFieldKeys.ACCESS_KEY]: true,
    [SESFieldKeys.SECRET_KEY]: true,
    [SESFieldKeys.REGION]: true,
    [SESFieldKeys.FROM_EMAIL]: true,
}

export enum SlackRegion {
    PROJECT_ID = 'project_id',
    CONFIG_NAME = 'configName',
    WEBHOOK_URL = 'webhookUrl',
}

export const DefaultSlackKeys = {
    [SlackRegion.PROJECT_ID]: 0,
    [SlackRegion.CONFIG_NAME]: '',
    [SlackRegion.WEBHOOK_URL]: '',
    isLoading: false,
    isError: false,
}
export const DefaultSlackValidationKeys = {
    [SlackRegion.PROJECT_ID]: true,
    [SlackRegion.CONFIG_NAME]: true,
    [SlackRegion.WEBHOOK_URL]: true,
}

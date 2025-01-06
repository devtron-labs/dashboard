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

export enum SlackRegion {
    PROJECT_ID = 'project_id',
    CONFIG_NAME = 'configName',
    WEBHOOK_URL = 'webhookUrl',
    CONFIG_ID = 'configId',
}

export const ConfigValidationKeys = { isValid: true, message: '' }

export const DefaultSESValidations = {
    configName: ConfigValidationKeys,
    accessKey: ConfigValidationKeys,
    secretKey: ConfigValidationKeys,
    region: ConfigValidationKeys,
    fromEmail: ConfigValidationKeys,
}

// ------------ SMTP Configuration Constants ------------
export enum SMTPFieldKeys {
    CONFIG_NAME = 'configName',
    HOST = 'host',
    PORT = 'port',
    AUTH_USER = 'authUser',
    AUTH_PASSWORD = 'authPassword',
    FROM_EMAIL = 'fromEmail',
    DEFAULT = 'default',
}

export const DefaultSMTPValidation = {
    configName: ConfigValidationKeys,
    host: ConfigValidationKeys,
    port: ConfigValidationKeys,
    authUser: ConfigValidationKeys,
    authPassword: ConfigValidationKeys,
    fromEmail: ConfigValidationKeys,
}

// ------------ Slack Configuration Constants ------------

export enum SlackFieldKeys {
    CONFIG_NAME = 'configName',
    WEBHOOK_URL = 'webhookUrl',
    PROJECT_ID = 'projectId',
}

export const DefaultSlackKeys = {
    [SlackRegion.PROJECT_ID]: 0,
    [SlackRegion.CONFIG_NAME]: '',
    [SlackRegion.WEBHOOK_URL]: '',
    isLoading: false,
    isError: false,
    id: 0,
}
export const DefaultSlackValidations = {
    [SlackRegion.PROJECT_ID]: ConfigValidationKeys,
    [SlackRegion.CONFIG_NAME]: ConfigValidationKeys,
    [SlackRegion.WEBHOOK_URL]: ConfigValidationKeys,
}

export const DefaultWebhookConfig = {
    configName: '',
    webhookUrl: '',
    isLoading: false,
    isError: false,
    payload: '',
    header: [{ key: '', value: '' }],
}

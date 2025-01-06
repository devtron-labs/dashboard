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

export enum ConfigurationFieldKeys {
    CONFIG_NAME = 'configName',
    ACCESS_KEY = 'accessKey',
    SECRET_KEY = 'secretKey',
    REGION = 'region',
    FROM_EMAIL = 'fromEmail',
    PROJECT_ID = 'project_id',
    WEBHOOK_URL = 'webhookUrl',
    CONFIG_ID = 'configId',
    HOST = 'host',
    PORT = 'port',
    AUTH_USER = 'authUser',
    AUTH_PASSWORD = 'authPassword',
    DEFAULT = 'default',
    PAYLOAD = 'payload',
}

// ------------ SES Configuration Constants ------------
export const DEFAULT_MASKED_SECRET_KEY = '*******'

export const ConfigValidationKeys = { isValid: true, message: '' }

export const DefaultSESValidations = {
    configName: ConfigValidationKeys,
    accessKey: ConfigValidationKeys,
    secretKey: ConfigValidationKeys,
    region: ConfigValidationKeys,
    fromEmail: ConfigValidationKeys,
}

// ------------ SMTP Configuration Constants ------------

export const DefaultSMTPValidation = {
    configName: ConfigValidationKeys,
    host: ConfigValidationKeys,
    port: ConfigValidationKeys,
    authUser: ConfigValidationKeys,
    authPassword: ConfigValidationKeys,
    fromEmail: ConfigValidationKeys,
}

// ------------ Slack Configuration Constants ------------

export const DefaultSlackKeys = {
    [ConfigurationFieldKeys.PROJECT_ID]: 0,
    [ConfigurationFieldKeys.CONFIG_NAME]: '',
    [ConfigurationFieldKeys.WEBHOOK_URL]: '',
    isLoading: false,
    isError: false,
    id: 0,
}
export const DefaultSlackValidations = {
    [ConfigurationFieldKeys.PROJECT_ID]: ConfigValidationKeys,
    [ConfigurationFieldKeys.CONFIG_NAME]: ConfigValidationKeys,
    [ConfigurationFieldKeys.WEBHOOK_URL]: ConfigValidationKeys,
}

// ------------ Slack Configuration Constants ------------

export const DefaultHeaders = { key: '', value: '' }

export const DefaultWebhookConfig = {
    configName: '',
    webhookUrl: '',
    isLoading: false,
    isError: false,
    payload: '',
    header: [DefaultHeaders],
}

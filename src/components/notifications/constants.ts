// ------------ Configuration Constants ------------

import { SlackFormType } from './types'

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
    PROJECT_ID = 'projectId',
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

export const ConfigValidationKeys = { isValid: true, message: '' }

export const DefaultSESValidations = {
    [ConfigurationFieldKeys.CONFIG_NAME]: ConfigValidationKeys,
    [ConfigurationFieldKeys.ACCESS_KEY]: ConfigValidationKeys,
    [ConfigurationFieldKeys.SECRET_KEY]: ConfigValidationKeys,
    [ConfigurationFieldKeys.REGION]: ConfigValidationKeys,
    [ConfigurationFieldKeys.FROM_EMAIL]: ConfigValidationKeys,
}

export const SESSortableHeaderTitle = {
    CONFIG_NAME: 'Name',
    ACCESS_KEY: 'Access Key Id',
    EMAIL: "Sender's Email",
}

// ------------ SMTP Configuration Constants ------------

export const DefaultSMTPValidation = {
    [ConfigurationFieldKeys.CONFIG_NAME]: ConfigValidationKeys,
    [ConfigurationFieldKeys.HOST]: ConfigValidationKeys,
    [ConfigurationFieldKeys.PORT]: ConfigValidationKeys,
    [ConfigurationFieldKeys.AUTH_USER]: ConfigValidationKeys,
    [ConfigurationFieldKeys.AUTH_PASSWORD]: ConfigValidationKeys,
    [ConfigurationFieldKeys.FROM_EMAIL]: ConfigValidationKeys,
}

// ------------ Slack Configuration Constants ------------

export const DefaultSlackKeys: SlackFormType = {
    [ConfigurationFieldKeys.PROJECT_ID]: 0,
    [ConfigurationFieldKeys.CONFIG_NAME]: '',
    [ConfigurationFieldKeys.WEBHOOK_URL]: '',
    isLoading: false,
    id: null,
}

export const DefaultSlackValidations = {
    [ConfigurationFieldKeys.PROJECT_ID]: ConfigValidationKeys,
    [ConfigurationFieldKeys.CONFIG_NAME]: ConfigValidationKeys,
    [ConfigurationFieldKeys.WEBHOOK_URL]: ConfigValidationKeys,
}

// ------------ Webhook Configuration Constants ------------

export const DefaultWebhookConfig = {
    [ConfigurationFieldKeys.CONFIG_NAME]: '',
    [ConfigurationFieldKeys.WEBHOOK_URL]: '',
    [ConfigurationFieldKeys.PAYLOAD]: '',
    isLoading: false,
    header: {},
}

export const DefaultWebhookValidations = {
    [ConfigurationFieldKeys.CONFIG_NAME]: ConfigValidationKeys,
    [ConfigurationFieldKeys.WEBHOOK_URL]: ConfigValidationKeys,
    [ConfigurationFieldKeys.PAYLOAD]: ConfigValidationKeys,
}

export const SlackIncomingWebhookUrl = 'https://slack.com/marketplace/A0F7XDUAZ-incoming-webhooks'

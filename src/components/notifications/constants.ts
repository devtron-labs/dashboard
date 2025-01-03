export enum ConfigurationsTabTypes {
    SES = 'ses',
    SMTP = 'smtp',
    SLACK = 'slack',
    WEBHOOK = 'webhook',
}

export const EmptyConfigurationSubTitle = {
    [ConfigurationsTabTypes.SES]:
        'SES configuration will be used to send email notifications to the desired email address',
    [ConfigurationsTabTypes.SMTP]:
        'SMTP configuration will be used to send email notifications to the desired email address',
    [ConfigurationsTabTypes.SLACK]: 'Configure slack webhook to send notifications to a slack channel',
    [ConfigurationsTabTypes.WEBHOOK]: 'Configure webhook to send event data to external tools',
}

export const ConfigurationTabText = {
    SES: 'Email (SES)',
    SMTP: 'Email (SMTP)',
    SLACK: 'Slack',
    WEBHOOK: 'Webhook',
}

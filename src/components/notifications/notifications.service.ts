import { Routes } from '../../config/constants'
import { get, post, trash, put, ResponseType, sortCallback } from '@devtron-labs/devtron-fe-common-lib'
import { NotificationConfiguration } from './NotificationTab'
import { PipelineType } from './AddNotification'
import { SMTPConfigResponseType, WebhookAttributesResponseType } from './types'

interface UpdateNotificationEvent {
    id: number
    eventTypeIds: number[]
}

interface SaveNotificationPayload {
    notificationConfigRequest: {
        teamId: number[]
        appId: number[]
        envId: number[]
        pipelineId: number
        pipelineType: 'CI' | 'CD'
        eventTypeIds: number[]
    }[]
    providers: { configId: number; dest: 'ses' | 'slack' | ''; recipient: string }[]
    sesConfigId: number
}

interface SaveNotificationResponseType extends ResponseType {
    result?: number
}

interface UpdateNotificationResponseType extends ResponseType {
    result?: number
}

interface DeleteNotificationResponseType extends ResponseType {
    result?: undefined
}

interface GetNotificationResponseType extends ResponseType {
    result?: {
        total: number
        settings: NotificationConfiguration[]
    }
}

interface GetPipelinesResponseType extends ResponseType {
    result?: PipelineType[]
}

interface UpdateConfigResponseType extends ResponseType {
    result?: number[]
}

interface GetChannelsResponseType extends ResponseType {
    result?: {
        configId: number
        dest: 'ses' | 'slack' | ''
        recipient: string
    }[]
}

interface SESConfigResponseType extends ResponseType {
    result?: {
        configName: string
        accessKey: string
        secretKey: string
        region: string
        fromEmail: string
        default: boolean
    }
}

function createSaveNotificationPayload(selectedPipelines, providers, sesConfigId: number): SaveNotificationPayload {
    let allPipelines = selectedPipelines.map((config) => {
        let eventTypeIds = []
        if (config.trigger) eventTypeIds.push(1)
        if (config.success) eventTypeIds.push(2)
        if (config.failure) eventTypeIds.push(3)

        let teamId = config.appliedFilters.filter((filter) => filter.type === 'project').map((p) => p.id)
        let appId = config.appliedFilters.filter((filter) => filter.type === 'application').map((app) => app.id)
        let envId = config.appliedFilters.filter((filter) => filter.type === 'environment').map((e) => e.id)

        return {
            teamId,
            appId,
            envId,
            pipelineId: config.pipelineId,
            pipelineType: config.type,
            eventTypeIds: eventTypeIds,
        }
    })
    providers = providers.map((p) => {
        if (p.data.configId) {
            return {
                configId: p.data.configId,
                dest: p.data.dest,
                recipient: '',
            }
        } else
            return {
                configId: 0,
                dest: p.data.dest || '',
                recipient: p.data.recipient,
            }
    })
    return {
        notificationConfigRequest: allPipelines,
        providers: providers,
        sesConfigId: sesConfigId,
    }
}

export function saveNotification(selectedPipelines, providers, sesConfigId): Promise<SaveNotificationResponseType> {
    const URL = `${Routes.NOTIFIER}`
    let payload = createSaveNotificationPayload(selectedPipelines, providers, sesConfigId)
    return post(URL, payload)
}

export function getChannelConfigs(): Promise<ResponseType> {
    const URL = `${Routes.NOTIFIER}/channel`
    return get(URL)
}

export function getWebhookAttributes(): Promise<WebhookAttributesResponseType> {
    return get(`${Routes.NOTIFIER}/variables`)
}

export function getConfigs(): Promise<ResponseType> {
    return getChannelConfigs().then((response) => {
        let slackConfigs = response.result?.slackConfigs || []
        slackConfigs = slackConfigs.sort((a, b) => {
            return sortCallback('configName', a, b)
        })
        slackConfigs = slackConfigs.map((slackConfig) => {
            return {
                id: slackConfig.id,
                slackChannel: slackConfig.configName,
                projectId: slackConfig.teamId || 0,
                webhookUrl: slackConfig.webhookUrl || '',
            }
        })
        let sesConfigs = response.result?.sesConfigs || []
        sesConfigs = sesConfigs.sort((a, b) => {
            return sortCallback('configName', a, b)
        })
        sesConfigs = sesConfigs.map((sesConfig) => {
            return {
                id: sesConfig.id,
                name: sesConfig.configName || '',
                accessKeyId: sesConfig.accessKey || '',
                email: sesConfig.fromEmail || '',
                isDefault: sesConfig.default || false,
            }
        })
        let smtpConfigs = response.result?.smtpConfigs || []
        smtpConfigs = smtpConfigs.sort((a, b) => {
            return sortCallback('configName', a, b)
        })
        smtpConfigs = smtpConfigs.map((smtpConfig) => {
            return {
                id: smtpConfig.id,
                name: smtpConfig.configName || '',
                host: smtpConfig.host || '',
                port: smtpConfig.port || '',
                authUser: smtpConfig.authUser || '',
                authPassword: smtpConfig.authPassword || '',
                email: smtpConfig.fromEmail || '',
                isDefault: smtpConfig.default || false,
            }
        })
        let webhookConfigs = response.result?.webhookConfigs || []
        webhookConfigs.sort((a, b) => {
            return sortCallback('configName', a, b)
        })
        webhookConfigs = webhookConfigs.map((webhookConfig) => {
            return {
                id: webhookConfig.id,
                name: webhookConfig.configName || '',
                webhookUrl: webhookConfig.webhookUrl || '',
            }
        })
        return {
            ...response,
            result: {
                slackConfigurationList: slackConfigs,
                sesConfigurationList: sesConfigs,
                smtpConfigurationList: smtpConfigs,
                webhookConfigurationList: webhookConfigs,
            },
        }
    })
}

export function getNotificationConfigurations(offset: number, pageSize: number): Promise<GetNotificationResponseType> {
    const URL = `${Routes.NOTIFIER}?offset=${offset}&size=${pageSize}`
    return get(URL).then((response) => {
        let settings = response.result.settings || []
        let parsedSettings = settings.map((config) => {
            let providers = config.providerConfigs || []
            providers = providers.map((p) => {
                let o = {
                    ...p,
                    configId: p.id,
                }
                delete o['id']
                return o
            })
            return {
                id: config.id,
                pipelineId: config.pipeline?.id || undefined,
                appName: config?.pipeline?.appName,
                branch: config?.pipeline?.branches?.join(', '),
                pipelineName: config.pipeline?.name || undefined,
                pipelineType: config.pipelineType || '',
                environmentName: config?.pipeline?.environmentName || undefined,
                trigger: config.eventTypes.includes(1),
                success: config.eventTypes.includes(2),
                failure: config.eventTypes.includes(3),
                isSelected: false,
                providers: providers,
                appliedFilters: {
                    project: config.team || [],
                    application: config.app || [],
                    environment: config.environment || [],
                },
                isVirtualEnvironment: config?.pipeline?.isVirtualEnvironment
            }
        })
        return {
            ...response,
            result: {
                ...response.result,
                settings: parsedSettings,
            },
        }
    })
}

export function updateNotificationEvents(data: UpdateNotificationEvent[]): Promise<UpdateNotificationResponseType> {
    const URL = `${Routes.NOTIFIER}`
    let payload = {
        updateType: 'events',
        notificationConfigRequest: data,
    }
    return put(URL, payload)
}

export function updateNotificationRecipients(
    notificationList,
    savedRecipient,
    newRecipients,
    selectedEmailAgent,
): Promise<UpdateNotificationResponseType> {
    const URL = `${Routes.NOTIFIER}`
    newRecipients = newRecipients.map((r) => r.data)
    let savedRecipientSet = new Set()
    for (let i = 0; i < savedRecipient.length; i++) {
        let key = savedRecipient[i].configId + savedRecipient[i].name
        savedRecipientSet.add(key)
    }
    let notificationConfigRequest = notificationList.map((config) => {
        let updatedProviders = []
        let emailChannel = selectedEmailAgent?.toLowerCase()
        for (let i = 0; i < config.providers.length; i++) {
            let key = config.providers[i].configId + config.providers[i].name
            if (savedRecipientSet.has(key)) {
                updatedProviders.push(config.providers[i])
                if (config.providers[i].dest === 'smtp' || config.providers[i].dest === 'ses') {
                    emailChannel = config.providers[i].dest
                }
            }
        }
        updatedProviders = updatedProviders.concat(newRecipients)
        updatedProviders = updatedProviders.map((r) => {
            if (r.configId) {
                return {
                    configId: r.configId,
                    dest: r.dest === 'slack' || r.dest === "webhook" ? r.dest : emailChannel,
                    recipient: '',
                }
            } else
                return {
                    configId: 0,
                    dest: emailChannel || '',
                    recipient: r.recipient,
                }
        })
        return {
            ...config,
            providers: updatedProviders,
        }
    })
    let payload = {
        updateType: 'recipients',
        notificationConfigRequest: notificationConfigRequest,
    }
    return put(URL, payload)
}

export function deleteNotifications(requestBody, singleDeletedId): Promise<DeleteNotificationResponseType> {
    const URL = `${Routes.NOTIFIER}`
    let payload
    if (singleDeletedId) {
        payload = {
            id: [singleDeletedId],
        }
    } else {
        payload = {
            id: requestBody.map((e) => e.id),
        }
    }
    return trash(URL, payload)
}

export function saveEmailConfiguration(data, channel: string): Promise<UpdateConfigResponseType> {
    const URL = `${Routes.NOTIFIER}/channel`
    let payload = {
        channel: channel,
        configs: [data],
    }
    return post(URL, payload)
}

export function getSESConfiguration(sesConfigId: number): Promise<SESConfigResponseType> {
    const URL = `${Routes.NOTIFIER}/channel/ses/${sesConfigId}`
    return get(URL)
}

export function getSMTPConfiguration(smtpConfigId: number): Promise<SMTPConfigResponseType> {
    const URL = `${Routes.NOTIFIER}/channel/smtp/${smtpConfigId}`
    return get(URL)
}

export function getSlackConfiguration(slackConfigId: number, isDeleteComponent?: boolean): Promise<ResponseType> {
    return getChannelConfigs().then((response) => {
        let list = response.result.slackConfigs || []
        let config = list.find((config) => config.id === slackConfigId)
        if (isDeleteComponent) {
            return {
                ...response,
                result: config,
            }
        } else {
            return {
                ...response,
                result: {
                    configName: config.configName,
                    webhookUrl: config.webhookUrl,
                    projectId: config.teamId,
                },
            }
        }
    })
}

export function getWebhookConfiguration(webhookConfigId: number): Promise<ResponseType> {
    return get(`${Routes.NOTIFIER}/channel/webhook/${webhookConfigId}`)
}

export function saveUpdateWebhookConfiguration(data): Promise<UpdateConfigResponseType> {
    const headerObj = {};
    const headerPayload = data.payload != '' ? JSON.parse(data.payload) : {}
    data.header.forEach((element) => {
        if (element.key != '') {
            headerObj[element.key] = element.value
        }
    });

    let payload = {
        channel: 'webhook',
        configs: [
            {
                id: (Number)(data.id),
                configName: data.configName,
                webhookUrl: data.webhookUrl,
                header: headerObj,
                payload: headerPayload,
            },
        ],
    }
    return post(`${Routes.NOTIFIER}/channel`, payload)
}

export function saveSlackConfiguration(data): Promise<UpdateConfigResponseType> {
    const URL = `${Routes.NOTIFIER}/channel`
    let payload = {
        channel: 'slack',
        configs: [
            {
                configName: data.configName,
                webhookUrl: data.webhookUrl,
                teamId: data.projectId,
            },
        ],
    }
    return post(URL, payload)
}

export function updateSlackConfiguration(data): Promise<UpdateConfigResponseType> {
    const URL = `${Routes.NOTIFIER}/channel`
    let payload = {
        channel: 'slack',
        configs: [
            {
                id: data.id,
                configName: data.configName,
                webhookUrl: data.webhookUrl,
                teamId: data.projectId,
            },
        ],
    }
    return post(URL, payload)
}

export function getChannelsAndEmailsFilteredByEmail(): Promise<GetChannelsResponseType> {
    return getChannelsAndEmails().then((response) => {
        return {
            ...response,
            result: response.result
                ? response.result.filter((p) => !(p.recipient === 'admin' || p.recipient === 'system'))
                : [],
        }
    })
}

function getChannelsAndEmails(): Promise<GetChannelsResponseType> {
    const URL = `${Routes.NOTIFIER}/recipient?value=`
    return get(URL)
}

export function getPipelines(filters): Promise<GetPipelinesResponseType> {
    const URL = `${Routes.NOTIFIER}/search`
    let payload = {
        teamId: filters.filter((p) => p.type == 'project').map((p) => p.value),
        envId: filters.filter((p) => p.type == 'environment').map((p) => p.value),
        appId: filters.filter((p) => p.type == 'application').map((p) => p.value),
        pipelineName: filters.find((p) => p.type == 'pipeline')?.value,
    }
    return post(URL, payload).then((response) => {
        let parsedResult = response.result?.map((row) => {
            let projects = row.team
                ? row.team.map((team) => {
                    return {
                        type: 'project',
                        ...team,
                    }
                })
                : []
            let app = row.app
                ? row.app.map((team) => {
                    return {
                        type: 'application',
                        ...team,
                    }
                })
                : []
            let environment = row.environment
                ? row.environment?.map((team) => {
                    return {
                        type: 'environment',
                        ...team,
                    }
                })
                : []
            return {
                appliedFilters: projects.concat(app, environment),
                checkbox: { isChecked: false, value: 'INTERMEDIATE' },
                pipelineId: row.pipeline?.id,
                appName: row?.pipeline?.appName,
                branch: row?.pipeline?.branches?.join(', '),
                pipelineName: row.pipeline?.name,
                environmentName: row?.pipeline?.environmentName,
                type: row.pipelineType,
                trigger: false,
                success: false,
                failure: false,
            }
        })
        let matchingPipelines = parsedResult.filter((r) => r.appliedFilters.length == 0)
        let directPipelines = parsedResult.filter((r) => r.appliedFilters.length > 0)

        return {
            code: response.code,
            status: response.status,
            result: directPipelines.concat(matchingPipelines),
        }
    })
}

export function getAddNotificationInitData(): Promise<{
    channelOptions: any[]
    smtpConfigOptions: any[]
    sesConfigOptions: any[]
}> {
    return Promise.all([getChannelsAndEmailsFilteredByEmail(), getChannelConfigs()]).then(
        ([providerRes, channelRes]) => {
            let providerOptions = providerRes.result || []
            let sesConfigOptions = channelRes.result.sesConfigs || []
            let smtpConfigOptions = channelRes.result.smtpConfigs || []
            return {
                channelOptions: providerOptions.map((p) => {
                    return {
                        label: p.recipient,
                        value: p.configId,
                        data: p,
                    }
                }),
                sesConfigOptions,
                smtpConfigOptions,
            }
        },
    )
}

export function deleteNotification(request): Promise<any> {
    return trash(`${Routes.NOTIFIER}/channel`, request)
}

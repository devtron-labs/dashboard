/*
 * Copyright (c) 2024. Devtron Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { get, post, trash, put, ResponseType, sortCallback } from '@devtron-labs/devtron-fe-common-lib'
import { Routes } from '../../config/constants'
import { NotificationConfiguration } from './NotificationTab'
import { FilterOptions, PipelineType } from './AddNotification'
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
    const allPipelines = selectedPipelines.map((config) => {
        const eventTypeIds = []
        if (config.trigger) {
            eventTypeIds.push(1)
        }
        if (config.success) {
            eventTypeIds.push(2)
        }
        if (config.failure) {
            eventTypeIds.push(3)
        }

        const teamId = config.appliedFilters
            .filter((filter) => filter.type === FilterOptions.PROJECT)
            .map((p) => p.id)
        const appId = config.appliedFilters
            .filter((filter) => filter.type === FilterOptions.APPLICATION)
            .map((app) => app.id)
        const envId = config.appliedFilters.filter((filter) => filter.type === FilterOptions.ENVIRONMENT).map((e) => e.id)
        const clusterId = config.appliedFilters
            .filter((filter) => filter.type === FilterOptions.CLUSTER)
            .map((e) => e.id)

        return {
            teamId,
            appId,
            envId,
            clusterId,
            pipelineId: config.pipelineId,
            pipelineType: config.type,
            eventTypeIds,
        }
    })
    providers = providers.map((p) => {
        if (p.data.configId) {
            return {
                configId: p.data.configId,
                dest: p.data.dest,
                recipient: '',
            }
        }
        return {
            configId: 0,
            dest: p.data.dest || '',
            recipient: p.data.recipient,
        }
    })
    return {
        notificationConfigRequest: allPipelines,
        providers,
        sesConfigId,
    }
}

export function saveNotification(selectedPipelines, providers, sesConfigId): Promise<SaveNotificationResponseType> {
    const URL = `${Routes.NOTIFIER}`
    const payload = createSaveNotificationPayload(selectedPipelines, providers, sesConfigId)
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
        const settings = response.result.settings || []
        const parsedSettings = settings.map((config) => {
            let providers = config.providerConfigs || []
            providers = providers.map((p) => {
                const o = {
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
                providers,
                appliedFilters: {
                    project: config.team || [],
                    application: config.app || [],
                    environment: config.environment || [],
                    cluster: config.cluster || [],
                },
                isVirtualEnvironment: config?.pipeline?.isVirtualEnvironment,
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
    const payload = {
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
    const savedRecipientSet = new Set()
    for (let i = 0; i < savedRecipient.length; i++) {
        const key = savedRecipient[i].configId + savedRecipient[i].name
        savedRecipientSet.add(key)
    }
    const notificationConfigRequest = notificationList.map((config) => {
        let updatedProviders = []
        let emailChannel = selectedEmailAgent?.toLowerCase()
        for (let i = 0; i < config.providers.length; i++) {
            const key = config.providers[i].configId + config.providers[i].name
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
                    dest: r.dest === 'slack' || r.dest === 'webhook' ? r.dest : emailChannel,
                    recipient: '',
                }
            }
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
    const payload = {
        updateType: 'recipients',
        notificationConfigRequest,
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
    const payload = {
        channel,
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
        const list = response.result.slackConfigs || []
        const config = list.find((config) => config.id === slackConfigId)
        if (isDeleteComponent) {
            return {
                ...response,
                result: config,
            }
        }
        return {
            ...response,
            result: {
                configName: config.configName,
                webhookUrl: config.webhookUrl,
                projectId: config.teamId,
            },
        }
    })
}

export function getWebhookConfiguration(webhookConfigId: number): Promise<ResponseType> {
    return get(`${Routes.NOTIFIER}/channel/webhook/${webhookConfigId}`)
}

export function saveUpdateWebhookConfiguration(data): Promise<UpdateConfigResponseType> {
    const headerObj = {}
    const headerPayload = data.payload !== '' ? data.payload : ''
    data.header.forEach((element) => {
        if (element.key != '') {
            headerObj[element.key] = element.value
        }
    })

    const payload = {
        channel: 'webhook',
        configs: [
            {
                id: Number(data.id),
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
    const payload = {
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
    const payload = {
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
    const payload = {
        teamId: filters.filter((p) => p.type === FilterOptions.PROJECT).map((p) => p.value),
        envId: filters.filter((p) => p.type === FilterOptions.ENVIRONMENT).map((p) => p.value),
        appId: filters.filter((p) => p.type === FilterOptions.APPLICATION).map((p) => p.value),
        clusterId: filters.filter((p) => p.type === FilterOptions.CLUSTER).map(p => p.value),
        pipelineName: filters.find((p) => p.type == 'pipeline')?.value,
    }
    return post(URL, payload).then((response) => {
        const parsedResult = response.result?.map((row) => {
            const projects = row.team
                ? row.team.map((team) => {
                      return {
                          type: FilterOptions.PROJECT,
                          ...team,
                      }
                  })
                : []
            const app = row.app
                ? row.app.map((team) => {
                      return {
                          type: FilterOptions.APPLICATION,
                          ...team,
                      }
                  })
                : []
            const environment = row.environment
                ? row.environment?.map((team) => {
                      return {
                          type: FilterOptions.ENVIRONMENT,
                          ...team,
                      }
                  })
                : []
            const cluster = row.cluster
                ? row.cluster?.map((cluster) => {
                      return {
                          type: FilterOptions.CLUSTER,
                          ...cluster,
                      }
                  })
                : []

            return {
                appliedFilters: projects.concat(app, environment, cluster),
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
        const matchingPipelines = parsedResult.filter((r) => r.appliedFilters.length == 0)
        const directPipelines = parsedResult.filter((r) => r.appliedFilters.length > 0)

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
            const providerOptions = providerRes.result || []
            const sesConfigOptions = channelRes.result.sesConfigs || []
            const smtpConfigOptions = channelRes.result.smtpConfigs || []
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

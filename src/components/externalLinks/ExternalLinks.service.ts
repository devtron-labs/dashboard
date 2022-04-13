import { Routes } from '../../config'
import { get, post, put, trash } from '../../services/api'
import {
    ExternalLink,
    ExternalLinkResponse,
    ExternalLinkUpdateResponse,
    MonitoringTool,
    MonitoringToolResponse,
} from './ExternalLinks.type'

const MOCK_MONITORING_TOOL = [
    {
        label: 'Grafana',
        value: 'Grafana',
        icon: 'https://bitnami.com/assets/stacks/grafana/img/grafana-stack-220x234.png',
    },
    {
        label: 'Kibana',
        value: 'Kibana',
        icon: 'https://bitnami.com/assets/stacks/kibana/img/kibana-stack-220x234.png',
    },
]

const MOCK_URLS = [
    '/app/{appId}/details/{envId}',
    '/app/{appId}/edit/workflow/{podName}',
    '/app/{appId}/env/{envId}/details/pod/{podName}',
    '/app/{appId}/env/{envId}/details/container/{containerName}',
]

export const getMonitoringTools = (): Promise<MonitoringToolResponse> => {
    // return get(`${Routes.EXTERNAL_LINKS_API}/tools`)

    return Promise.resolve({
        result: MOCK_MONITORING_TOOL.map((item, idx) => ({
            id: idx,
            name: item.label,
            icon: item.icon,
        })) as MonitoringTool[],
        code: 200,
        status: 'Ok',
    })
}

export const getExternalLinks = (clusterId?: number): Promise<ExternalLinkResponse> => {
    // return get(`${Routes.EXTERNAL_LINKS_API}${clusterId ? '?clusterId=${clusterId}' : ''}`)

    const externalLinks: ExternalLink[] = []

    for (let i = 0; i < 4; i++) {
        externalLinks.push({
            id: i,
            monitoringToolId: i,
            name: [0, 1].includes(i) ? 'Grafana' : 'Kibana',
            url: MOCK_URLS[i],
            clusterIds: i === 0 ? ['*'] : i === 1 ? ['1'] : ['1', '2', '3'],
        })
    }

    return Promise.resolve({
        result: externalLinks,
        code: 200,
        status: 'Ok',
    })
}

export const saveExternalLinks = (request: ExternalLink[]): Promise<ExternalLinkUpdateResponse> => {
    return post(`${Routes.EXTERNAL_LINKS_API}`, request)
}

export const updateExternalLink = (request: ExternalLink): Promise<ExternalLinkUpdateResponse> => {
    return put(`${Routes.EXTERNAL_LINKS_API}`, request)
}

export const deleteExternalLink = (externalLinkId: number): Promise<ExternalLinkUpdateResponse> => {
    return trash(`${Routes.EXTERNAL_LINKS_API}?id=${externalLinkId}`)
}

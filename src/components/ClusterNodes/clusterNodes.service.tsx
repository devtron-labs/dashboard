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

import moment from 'moment'

import {
    APIOptions,
    ClusterDetail,
    get,
    getIsRequestAborted,
    getUrlWithSearchParams,
    noop,
    post,
    put,
    ResponseType,
    ROUTES as COMMON_ROUTES,
    showError,
} from '@devtron-labs/devtron-fe-common-lib'

import { Moment12HourFormat, Routes } from '../../config'
import { CLUSTER_DESCRIPTION_DUMMY_DATA, defaultClusterShortDescription } from './constants'
import {
    ClusteNotePatchRequest,
    ClusterCapacityResponse,
    ClusterDescriptionResponse,
    ClusterDetailsType,
    ClusterEditManifestType,
    ClusterListResponse,
    ClusterNoteResponse,
    ClusterShortDescriptionPatchRequest,
    DescriptionDataType,
    EditTaintsRequest,
    ERROR_TYPE,
    GetClusterOverviewDetailsProps,
    NodeDetailResponse,
    TerminalDataType,
    UpdateNodeRequestBody,
} from './types'

export const getClusterDetails = (clusterId: string, signal?): Promise<ClusterDescriptionResponse> =>
    get(`${Routes.CLUSTER_DESCRIPTION}?id=${clusterId}`, { signal })

export const patchClusterNote = (requestPayload: ClusteNotePatchRequest): Promise<ClusterNoteResponse> =>
    put(Routes.CLUSTER_NOTE, requestPayload)

export const patchApplicationNote = (requestPayload: ClusteNotePatchRequest): Promise<ClusterNoteResponse> =>
    put(Routes.APPLICATION_NOTE, requestPayload)

export const getClusterList = (abortControllerRef?: APIOptions['abortControllerRef']): Promise<ClusterListResponse> =>
    get(Routes.CLUSTER_LIST, { abortControllerRef })

export const getClusterListWithInstalledClusters = (abortControllerRef?: APIOptions['abortControllerRef']) =>
    get<ClusterDetail[]>(getUrlWithSearchParams(Routes.CLUSTER_LIST, { includeInstallations: true }), {
        abortControllerRef,
    })

/** @deprecated - use `getClusterListRaw` from fe-common-lib */
export const getClusterListMin = (): Promise<ClusterListResponse> => get(COMMON_ROUTES.CLUSTER_LIST_RAW)

export const getClusterListMinWithInstalledClusters = (abortControllerRef?: APIOptions['abortControllerRef']) =>
    get<ClusterDetail[]>(getUrlWithSearchParams(COMMON_ROUTES.CLUSTER_LIST_RAW, { includeInstallations: true }), {
        abortControllerRef,
    })

export const getClusterCapacity = (clusterId: string, signal?): Promise<ClusterCapacityResponse> =>
    get(`${Routes.CLUSTER_CAPACITY}/${clusterId}`, { signal })

export const updateClusterShortDescription = (
    requestPayload: ClusterShortDescriptionPatchRequest,
): Promise<ResponseType> => put(`${Routes.CLUSTER_DESCRIPTION}`, requestPayload)

export const getNodeCapacity = (clusterId: string, nodeName: string): Promise<NodeDetailResponse> =>
    get(`${COMMON_ROUTES.NODE_CAPACITY}?clusterId=${clusterId}&name=${nodeName}`)

export const updateNodeManifest = (
    clusterId: string,
    nodeName: string,
    nodeData: UpdateNodeRequestBody,
): Promise<ResponseType> => put(`${COMMON_ROUTES.NODE_CAPACITY}?clusterId=${clusterId}&name=${nodeName}`, nodeData)

export const clusterTerminalStart = (data: TerminalDataType, option: APIOptions): Promise<ResponseType> =>
    post(`${Routes.CLUSTER_TERMINAL}/${Routes.START}`, data, option)

export const clusterTerminalUpdate = (data: TerminalDataType, option: APIOptions): Promise<ResponseType> =>
    put(`${Routes.CLUSTER_TERMINAL}/${Routes.UPDATE}`, data, option)

export const clusterTerminalDisconnect = (terminalAccessId): Promise<ResponseType> =>
    post(`${Routes.CLUSTER_TERMINAL}/${Routes.DISCONNECT}?terminalAccessId=${terminalAccessId}`, null)

export const clusterDisconnectAndRetry = (data: TerminalDataType): Promise<ResponseType> =>
    post(`${Routes.CLUSTER_TERMINAL}/${Routes.DISCONNECT_RETRY}`, data)

export const clusterTerminalStop = (terminalAccessId): Promise<ResponseType> =>
    put(`${Routes.CLUSTER_TERMINAL}/${Routes.STOP}?terminalAccessId=${terminalAccessId}`, null)

export const clusterTerminalTypeUpdate = (data: TerminalDataType): Promise<ResponseType> =>
    put(`${Routes.CLUSTER_TERMINAL}/${Routes.UPDATE_SHELL}`, data)

export const clusterNamespaceList = (): Promise<ResponseType> => get(Routes.CLUSTER_NAMESPACE)

export const getClusterManifest = (terminalAccessId: number): Promise<ResponseType> =>
    get(`${Routes.CLUSTER_TERMINAL}/${Routes.POD_MANIFEST}?terminalAccessId=${terminalAccessId}`)

export const getClusterEvents = (terminalAccessId: number): Promise<ResponseType> =>
    get(`${Routes.CLUSTER_TERMINAL}/${Routes.POD_EVENTS}?terminalAccessId=${terminalAccessId}`)

export const updateTaints = (taintData: EditTaintsRequest): Promise<ResponseType> => put(Routes.TAINTS_EDIT, taintData)

export const clusterManifestEdit = (data: ClusterEditManifestType, option: APIOptions): Promise<ResponseType> =>
    put(`${Routes.CLUSTER_TERMINAL}/${Routes.EDIT}`, data, option)

export const getClusterOverviewDetails = async ({
    clusterId,
    requestAbortControllerRef,
    fetchClusterConfig,
}: GetClusterOverviewDetailsProps) => {
    try {
        const { result } = await getClusterDetails(clusterId, requestAbortControllerRef.current.signal)

        const { clusterName = '' } = result

        if (clusterName) {
            fetchClusterConfig(clusterName).catch(noop)
        }

        const _clusterNote = result.clusterNote
        let _moment: moment.Moment
        const clusterDetails = {} as ClusterDetailsType
        clusterDetails.clusterName = clusterName
        clusterDetails.shortDescription = result.description || defaultClusterShortDescription
        clusterDetails.addedBy = result.clusterCreatedBy
        _moment = moment(result.clusterCreatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
        clusterDetails.addedOn = _moment.format(Moment12HourFormat)
        clusterDetails.serverURL = result.serverUrl

        const data: DescriptionDataType = CLUSTER_DESCRIPTION_DUMMY_DATA

        if (_clusterNote) {
            data.descriptionText = _clusterNote.description
            data.descriptionId = _clusterNote.id
            data.descriptionUpdatedBy = _clusterNote.updatedBy
            _moment = moment(_clusterNote.updatedOn, 'YYYY-MM-DDTHH:mm:ssZ')
            data.descriptionUpdatedOn = _moment.isValid() ? _moment.format(Moment12HourFormat) : _clusterNote.updatedOn
        }

        return {
            clusterDetails,
            descriptionData: data,
        }
    } catch (error) {
        if (!getIsRequestAborted(error)) {
            showError(error)
        }
        throw error
    }
}

export const getClusterOverviewClusterCapacity = async ({
    clusterId,
    requestAbortControllerRef,
}: Pick<GetClusterOverviewDetailsProps, 'clusterId' | 'requestAbortControllerRef'>) => {
    try {
        const { result: clusterCapacity } = await getClusterCapacity(
            clusterId,
            requestAbortControllerRef.current.signal,
        )

        const _errorList = []
        const _nodeErrors = Object.keys(clusterCapacity.nodeErrors || {})
        const _nodeK8sVersions = clusterCapacity.nodeK8sVersions || []
        if (_nodeK8sVersions.length > 1) {
            let majorVersion
            let minorVersion

            const diffType = _nodeK8sVersions.reduce((dt, _nodeK8sVersion) => {
                if (dt === 'Major') {
                    return dt
                }

                const elementArr = _nodeK8sVersion.split('.')
                const [_majorVersion, _minorVersion] = elementArr

                if (!majorVersion) {
                    majorVersion = _majorVersion
                }

                if (!minorVersion) {
                    minorVersion = _minorVersion
                }

                if (majorVersion !== _majorVersion) {
                    return 'Major'
                }

                if (dt !== 'Minor' && minorVersion !== elementArr[1]) {
                    return 'Minor'
                }

                return dt
            }, '')

            if (diffType !== '') {
                _errorList.push({
                    errorText: `${diffType} version diff identified among nodes. Current versions `,
                    errorType: ERROR_TYPE.VERSION_ERROR,
                    filterText: _nodeK8sVersions,
                })
            }
        }

        if (_nodeErrors.length > 0) {
            _nodeErrors.forEach((_nodeError) => {
                const _errorLength = clusterCapacity.nodeErrors[_nodeError].length
                _errorList.push({
                    errorText: `${_nodeError} on ${
                        _errorLength === 1 ? `${_errorLength} node` : `${_errorLength} nodes`
                    }`,
                    errorType: _nodeError,
                    filterText: clusterCapacity.nodeErrors[_nodeError],
                })
            })
        }

        return {
            clusterErrorList: _errorList,
            clusterCapacityData: clusterCapacity,
        }
    } catch (error) {
        if (!getIsRequestAborted(error)) {
            showError(error)
        }
        throw error
    }
}

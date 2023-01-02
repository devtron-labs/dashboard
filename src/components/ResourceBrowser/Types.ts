import React from 'react'
import { ResponseType } from '../../services/service.types'
import { Nodes } from '../app/types'
import { LogSearchTermType, SelectedResourceType } from '../v2/appDetails/appDetails.type'

export interface ResourceDetail {
    name: string
    status: string
    namespace: string
    age: string
    ready: string
    restarts: string
    containers: string[]
}

export interface GVKType {
    Group: string
    Version: string
    Kind: Nodes
}

export interface ResourceListResponse extends ResponseType {
    result?: ResourceDetail[]
}

export interface ApiResourceType {
    gvk: GVKType
    namespaced: boolean
}

export interface APIResourceResponse extends ResponseType {
    result?: ApiResourceType[]
}

export interface K8SObjectType {
    name: string
    isExpanded: boolean
    namespaced: boolean
    child: GVKType[]
}

export interface ResourceListPayloadType {
    clusterId: number
    k8sRequest: {
        resourceIdentifier: {
            groupVersionKind: GVKType
            namespace?: string
        }
        patch?: string
    }
}

export interface CreateResourcePayload {
    clusterId: number
    manifest: string
}

export enum CreateResourceStatus {
    failed = 'Failed',
    created = 'Created',
    updated = 'Updated',
}

export interface ResourceType {
    kind: string
    name: string
    isUpdate: boolean
    error: string
}

export interface CreateResourceResponse extends ResponseType {
    result?: ResourceType[]
}

export interface ResourceDetailsPropType extends LogSearchTermType {
    selectedResource: SelectedResourceType
}

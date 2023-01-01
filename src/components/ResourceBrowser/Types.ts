import React from 'react'
import { MultiValue } from 'react-select'
import { ResponseType } from '../../services/service.types'
import { LabelTag, Nodes, OptionType } from '../app/types'

export interface ResourceDetail {
    name: string
    status: string
    namespace: string
    age: string
    ready: string
    restarts: string
}

export interface GVKType {
    Group: string
    Version: string
    Kind: Nodes
}

export interface ResourceListResponse extends ResponseType {
    result?: ResourceDetail[]
}

interface ApiResourceType {
    gvk: GVKType
}

export interface APIResourceResponse extends ResponseType {
    result?: ApiResourceType[]
}

export interface K8SObjectType {
    name: string
    isExpanded: boolean
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

export enum CreateResourceStatus {
    failed = 'Failed',
    created = 'Created',
    updated = 'Updated',
}

export interface ResourceType {
    kind: string
    name: string
    status: CreateResourceStatus
    message: string
}

export interface CreateResourceResponse extends ResponseType {
    result: ResourceType[]
}

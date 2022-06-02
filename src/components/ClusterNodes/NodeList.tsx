import React, { useState, useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import { useRouteMatch } from 'react-router'
import './clusterNodes.scss'
import { ReactComponent as Search } from '../../assets/icons/ic-search.svg'
import { ReactComponent as Clear } from '../../assets/icons/ic-error.svg'
import { getNodeList } from './clusterNodes.service'
import { Progressing, showError, sortObjectArrayAlphabetically } from '../common'
import { NodeDetail, NodeListResponse } from './types'
import { URLS } from '../../config'

const nodeListData = [
    {
        id: 10,
        name: 'ip-172-31-2-152.us-east-2.compute.internal',
        status: 'Not running',
        roles: ['Worker'],
        errors: ['string'],
        k8sVersion: '1.12.6_121',
        pods: 21,
        taints: 3,
        cpu: {
            name: 'string',
            usage: '',
            capacity: '6,503 GHz',
            request: 'string',
            limits: 'string',
        },
        memory: {
            name: 'string',
            usage: '',
            capacity: '26 TB',
            request: 'string',
            limits: 'string',
        },
        age: '',
    },
    {
        id: 11,
        name: 'ip-172-31-2-152.us-east-2.compute.internal',
        status: 'Not running',
        roles: ['Worker'],
        errors: ['string'],
        k8sVersion: '1.12.6_1546',
        pods: 13,
        taints: 0,
        cpu: {
            name: 'string',
            usage: '34',
            capacity: '6,503 GHz',
            request: 'string',
            limits: 'string',
        },
        memory: {
            name: 'string',
            usage: '65',
            capacity: '26 TB',
            request: 'string',
            limits: 'string',
        },
        age: '2d',
    },
    {
        id: 12,
        name: 'ip-172-31-2-152.us-east-2.compute.internal',
        status: 'Running',
        roles: ['Worker'],
        errors: [],
        k8sVersion: '1.12.6_1546',
        pods: 21,
        taints: 3,
        cpu: {
            name: 'string',
            usage: '34',
            capacity: '6,503 GHz',
            request: 'string',
            limits: 'string',
        },
        memory: {
            name: 'string',
            usage: '65',
            capacity: '26 TB',
            request: 'string',
            limits: 'string',
        },
        age: '8d',
    },
    {
        id: 13,
        name: 'ip-172-31-2-152.us-east-2.compute.internal',
        status: 'Not running',
        roles: ['Worker'],
        errors: ['string'],
        k8sVersion: '1.12.6_1546',
        pods: 21,
        taints: 3,
        cpu: {
            name: 'string',
            usage: '',
            capacity: '6,503 GHz',
            request: 'string',
            limits: 'string',
        },
        memory: {
            name: 'string',
            usage: '',
            capacity: '26 TB',
            request: 'string',
            limits: 'string',
        },
        age: '8d',
    },
    {
        id: 14,
        name: 'ip-172-31-2-152.us-east-2.compute.internal',
        status: 'Running',
        roles: ['Worker'],
        errors: [],
        k8sVersion: '1.12.6_1548',
        pods: 21,
        taints: 0,
        cpu: {
            name: 'string',
            usage: '54',
            capacity: '6,503 GHz',
            request: 'string',
            limits: 'string',
        },
        memory: {
            name: 'string',
            usage: '34',
            capacity: '26 TB',
            request: 'string',
            limits: 'string',
        },
        age: '24h',
    },
]

export default function NodeList() {
    const match = useRouteMatch()
    const [loader, setLoader] = useState(false)
    const [searchApplied, setSearchApplied] = useState(false)
    const [searchText, setSearchText] = useState('')
    const [clusterList, setClusterList] = useState<NodeDetail[]>([])

    useEffect(() => {
        //setLoader(true)
        // getClusterList()
        //     .then((response: ClusterListResponse) => {
        //         if (response.result) {
        //             setClusterList(response.result)
        //         }
        //         setLoader(false)
        //     })
        //     .catch((error) => {
        //         showError(error)
        //         setLoader(false)
        //     })
    }, [])

    const handleFilterChanges = (selected, key): void => {}

    const renderSearch = (): JSX.Element => {
        return (
            <form
                onSubmit={(e) => handleFilterChanges(e, 'search')}
                className="search position-rel margin-right-0 en-2 bw-1 br-4"
            >
                <Search className="search__icon icon-dim-18" />
                <input
                    type="text"
                    placeholder="Search charts"
                    value={searchText}
                    className="search__input bcn-0"
                    onChange={(event) => {
                        setSearchText(event.target.value)
                    }}
                />
                {searchApplied ? (
                    <button
                        className="search__clear-button"
                        type="button"
                        onClick={(e) => handleFilterChanges(e, 'clear')}
                    >
                        <Clear className="icon-dim-18 icon-n4 vertical-align-middle" />
                    </button>
                ) : null}
            </form>
        )
    }

    if (loader) {
        return <Progressing />
    }

    return (
        <div className="node-list">
            {renderSearch()}
            <div className="mt-16 en-2 bw-1 bcn-0" style={{ minHeight: 'calc(100vh - 125px)' }}>
                <div className="node-list-row fw-6 cn-7 fs-12 border-bottom pt-8 pb-8 pr-20 pl-20 text-uppercase">
                    <div>Node</div>
                    <div>Status</div>
                    <div>Role</div>
                    <div>Errors</div>
                    <div>K8s version</div>
                    <div>Pods</div>
                    <div>Taints</div>
                    <div>CPU Usage</div>
                    <div>Mem Usage</div>
                    <div>Age</div>
                </div>
                {nodeListData?.map((nodeData) => (
                    <div className="node-list-row fw-4 cn-9 fs-13 border-bottom-n1 pt-12 pb-12 pr-20 pl-20">
                        <div className="cb-5 ellipsis-right">
                            <NavLink to={`${match.url}/${nodeData.id}${URLS.NODE_DETAILS}`}>{nodeData.name}</NavLink>
                        </div>
                        <div>{nodeData.status || '-'}</div>
                        <div>{nodeData.roles || '-'}</div>
                        <div>{nodeData.errors?.length > 0 ? nodeData.errors.length : ''}</div>
                        <div>{nodeData.k8sVersion || '-'}</div>
                        <div>{nodeData.pods || '-'}</div>
                        <div>{nodeData.taints || '-'}</div>
                        <div>{nodeData.cpu?.usage ? nodeData.cpu.usage + '%' : '-'}</div>
                        <div>{nodeData.memory?.usage ? nodeData.memory.usage + '%' : '-'}</div>
                        <div>{nodeData.age || '-'}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}

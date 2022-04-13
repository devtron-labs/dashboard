import React, { useEffect, useState } from 'react'
import dots from '../../assets/icons/appstatus/ic-menu-dots.svg'
import emptyPageIcon from '../../assets/icons/ic-empty-data.svg'
import { PopupMenu, Pod as PodIcon, Trash, showError, copyToClipboard, not, useSearchString } from '../common';
import { NavLink } from 'react-router-dom'
import { useRouteMatch, useParams, generatePath, useHistory, useLocation } from 'react-router';
import { toast } from 'react-toastify'
import { deleteResource } from './service'
import { ReactComponent as DropDown } from '../../assets/icons/ic-dropdown-filled.svg'
import { AggregatedNodes, Nodes, NodeType, NodeDetailTabs, NodeDetailTabsType, AggregationKeys, AggregationKeysType, AppDetails } from './types'
import { ReactComponent as ErrorImage } from '../../assets/icons/misc/errorInfo.svg';
import { ReactComponent as Clipboard } from '../../assets/icons/ic-copy.svg';
import { ReactComponent as CubeIcon } from '../../assets/icons/ic-object.svg';
import { getAggregator } from './details/appDetails/utils';
import Tippy from '@tippyjs/react';
import { getMonitoringToolIcon, NodeLevelExternalLinks } from '../externalLinks/ExternalLinks.component';
import { ExternalLink, OptionTypeWithIcon } from '../externalLinks/ExternalLinks.type';

interface ResourceTree {
    appName: string;
    environmentName: string;
    nodes: AggregatedNodes;
    describeNode: (name: string, containerName?: string) => void;
    isAppDeployment: boolean;
    appId: number;
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    appDetails: AppDetails
}

function ignoreCaseCompare(a: string, b: string): boolean {
    return a.toLowerCase() === b.toLowerCase()
}

function getGenricRowFields(kind: NodeType): string[] {
    switch (kind) {
        case Nodes.Service:
            return ['name', 'url', '']
        case Nodes.Pod:
            return ['name', 'external-links', 'ready', ''] // empty string denotes menu
        case Nodes.Containers:
            return ['name', 'external-links']
        default:
            return ['name', '']
    }
}

export const StatusFilterButton: React.FC<{ status: string; count?: number }> = ({ status, count }) => {
    const location = useLocation()
    const history = useHistory()
    const { queryParams } = useSearchString()

    const statusFilter = queryParams.has('status') ? queryParams.get('status') : ''
    return (
        <Tippy
            className="default-tt"
            arrow={false}
            placement="bottom"
            content={status === 'All' ? 'All Objects' : status}
        >
            <div
                data-testid={`${status}-filter-button`}
                onClick={(e) => {
                    if (status.toLowerCase() === 'all') {
                        queryParams.delete('status')
                    }
                    else {
                        queryParams.set('status', status);
                    }
                    history.replace(location.pathname + '?' + queryParams.toString());
                }}
                style={{
                    height: '32px',
                    border: (!statusFilter && status.toLowerCase() === 'all') || ignoreCaseCompare(statusFilter, status) ? '1px solid var(--B500)' : '1px solid var(--N200)',
                    background: (!statusFilter && status.toLowerCase() === 'all') || ignoreCaseCompare(statusFilter, status) ? 'var(--B100)' : 'transparent',
                }}
                className="pointer ml-8 br-4 flex left p-6"
            >
                {status !== 'All' && <div className={`app-summary__icon icon-dim-16 mr-6 ${status.toLowerCase()} ${status.toLowerCase()}--node`} style={{ zIndex: 'unset' }} />}
                <span className="capitalize">{count || status}</span>
            </div>
        </Tippy>
    );
}
const ResourceTreeNodes: React.FC<ResourceTree> = ({ nodes, describeNode, isAppDeployment = false, appName, environmentName, appId, externalLinks, monitoringTools, appDetails }) => {
    const { url, path } = useRouteMatch()
    const params = useParams<{ appId: string, envId: string, kind?: NodeType }>()
    const history = useHistory()
    const { queryParams, searchParams } = useSearchString()
    const [podLevelExternalLinks, setPodLevelExternalLinks] = useState<OptionTypeWithIcon[]>([])
    const [containerLevelExternalLinks, setContainerLevelExternalLinks] = useState<OptionTypeWithIcon[]>([])

    const orderedAggregators: AggregationKeysType[] = [
        AggregationKeys.Workloads,
        AggregationKeys.Networking,
        AggregationKeys['Config & Storage'],
        AggregationKeys['Custom Resource'],
        AggregationKeys.RBAC,
        AggregationKeys.Administration,
        AggregationKeys.Other
    ];

    useEffect(() => {
        if (externalLinks.length > 0 && monitoringTools.length > 0) {
            const _podLevelExternalLinks = []
            const _containerLevelExternalLinks = []

            externalLinks.forEach(
                (link) => {
                    if (link.url.includes('{podName}') && !link.url.includes('{containerName}')) {
                        _podLevelExternalLinks.push({
                            label: link.name,
                            value: link.url,
                            icon: getMonitoringToolIcon(monitoringTools, link.monitoringToolId),
                        })
                    } else if (link.url.includes('{containerName}')) {
                        _containerLevelExternalLinks.push({
                            label: link.name,
                            value: link.url,
                            icon: getMonitoringToolIcon(monitoringTools, link.monitoringToolId),
                        })
                    }
                }
            )
            setPodLevelExternalLinks(_podLevelExternalLinks)
            setContainerLevelExternalLinks(_containerLevelExternalLinks)
        } else {
            setPodLevelExternalLinks([])
            setContainerLevelExternalLinks([])
        }
    }, [externalLinks, monitoringTools])

    useEffect(() => {
        if (!searchParams.status || !params.kind) return;
        outerloop:
        for (let kind of Object.keys(nodes.nodes)) {
            const kindNodes = nodes.nodes[kind];
            for (let [nodeName, nodeDetails] of kindNodes) {
                if ((nodeDetails?.status || nodeDetails?.health?.status) === searchParams.status) {
                    history.push(generatePath(path, { ...params, kind: nodeDetails.kind }) + '?' + queryParams.toString())
                    break outerloop
                }
            }
        }
    }, [searchParams.status]);

    if (!params.kind) {
        if (nodes.nodes.Pod) {
            history.replace(`${url}/Pod`)
        }
        else {
            const allNodes = Object.keys(nodes.nodes)
            if (allNodes.length) {
                history.replace(`${url}/${allNodes[0]}`)
            }
        }
        return null
    }
    return (
        <div
            style={{
                width: '100%',
                display: 'grid',
                gridTemplateColumns: '270px 1fr',
                height: '700px',
                maxHeight: '700px',
                overflow: 'hidden',
                gridTemplateRows: '72px 1fr',
            }}
        >
            <div className="flex left pl-24 pr-24 bcn-0" style={{ gridColumn: '1 / span 2' }}>
                <span className="fs-14 fw-6 cn-7 flex"><CubeIcon className="icon-dim-20 mr-8 fcn-7" /> APPLICATION OBJECTS</span>
                <div style={{ marginLeft: 'auto' }} className="flex right">
                    <StatusFilterButton status={'All'} />
                    {Object.entries(nodes.statusCount).map(([status, count]) => (
                        <StatusFilterButton key={status} status={status} count={count} />
                    ))}
                </div>
            </div>
            <div
                className="bcn-0"
                style={{
                    height: '100%',
                    gridColumn: '1 / span 1',
                    gridRow: '2',
                    overflowY: 'auto',
                    borderRight: '1px solid var(--N200)',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridColumnGap: '8px',
                        gridTemplateColumns: '24px 1fr',
                        gridAutoRows: '36px',
                        placeItems: 'center',
                    }}
                    className="p-8"
                >
                    {orderedAggregators
                        .filter((aggregator) => !!nodes.aggregation[aggregator])
                        .map((aggregator) => (
                            <NodeGroup
                                key={aggregator}
                                title={aggregator as AggregationKeysType}
                                data={nodes.aggregation[aggregator]}
                                aggregatedNodes={nodes}
                            />
                        ))}
                </div>
            </div>
            <div style={{ gridColumn: '2', gridRow: '2', overflowY: 'auto' }} className="bcn-0">
                {(function (kind: NodeType) {
                    if (kind === 'Pod') {
                        return nodes.nodes[kind] ? (
                            <AllPods
                                appName={appName}
                                nodes={nodes}
                                environmentName={environmentName}
                                isAppDeployment={isAppDeployment}
                                pods={nodes.nodes[kind]}
                                describeNode={describeNode}
                                appId={appId}
                                podLevelExternalLinks={podLevelExternalLinks}
                                containerLevelExternalLinks={containerLevelExternalLinks}
                                appDetails={appDetails}
                            />
                        ) : null;
                    } else {
                        return nodes.nodes[kind] ? (
                            <GenericInfo
                                nodes={nodes}
                                describeNode={describeNode}
                                type={params.kind}
                                Data={nodes.nodes[kind]}
                                appName={appName}
                                environmentName={environmentName}
                                appId={appId}
                                podLevelExternalLinks={podLevelExternalLinks}
                                containerLevelExternalLinks={containerLevelExternalLinks}
                                appDetails={appDetails}
                            />
                        ) : null;
                    }
                })(params.kind as NodeType)}
            </div>
        </div>
    );
}

export const NodeGroup: React.FC<{ title: AggregationKeysType, data: Object; aggregatedNodes: AggregatedNodes }> = ({ title, data, aggregatedNodes }) => {
    const [collapsed, setCollapsed] = useState(true)
    const { url, path } = useRouteMatch()
    const params = useParams<{ appId: string; envId: string; kind: NodeType; tab?: NodeDetailTabsType }>()
    const location = useLocation();
    const { searchParams, queryParams } = useSearchString()
    const filterStatus = queryParams.has('status') ? queryParams.get('status') : '';

    useEffect(() => {
        const aggregator = getAggregator(params.kind);
        if (aggregator === title) {
            setCollapsed(false);
        }
    }, [params.kind]);

    if (filterStatus && filterStatus !== 'All') {
        if (
            !aggregatedNodes ||
            !aggregatedNodes.aggregatorStatusCount ||
            !aggregatedNodes.aggregatorStatusCount[title] ||
            !aggregatedNodes.aggregatorStatusCount[title][filterStatus]
        )
            return null;
    }

    return (
        <>
            <>
                <DropDown
                    onClick={(e) => setCollapsed(not)}
                    className={`rotate icon-dim-24 pointer ${!collapsed ? 'fcn-9' : 'fcn-5'}`}
                    style={{ ['--rotateBy' as any]: collapsed ? '-90deg' : '0deg' }}
                />
                <div data-testid={title} onClick={(e) => setCollapsed(not)} className="fs-14 pointer w-100 fw-6 flex left pl-8 pr-8">
                    {title}
                    {aggregatedNodes.aggregatorStatusCount[title]?.Degraded > 0 && collapsed && (
                        <ErrorImage
                            className="icon-dim-16 rotate"
                            style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                        />
                    )}
                </div>
            </>
            {!collapsed &&
                Object.keys(data)
                    .filter((kind) => !filterStatus || (aggregatedNodes.nodeStatusCount[kind] && aggregatedNodes.nodeStatusCount[kind][filterStatus]))
                    .map((kind) => (
                        <React.Fragment key={kind}>
                            <span />
                            <NavLink
                                activeClassName="active"
                                data-testid={kind + "-anchor"}
                                key={kind}
                                to={generatePath(path, { ...params, kind }) + location.search}
                                style={{ height: '36px' }}
                                className="no-decor fs-14 cn-9 node-link w-100 flex left pl-8 pr-8"
                            >
                                {kind}
                                {aggregatedNodes?.nodeStatusCount[kind]?.Degraded > 0 && (
                                    <ErrorImage
                                        className="icon-dim-16 rotate"
                                        style={{ ['--rotateBy' as any]: '180deg', marginLeft: 'auto' }}
                                    />
                                )}
                            </NavLink>
                        </React.Fragment>
                    ))}
        </>
    );
}


interface AllPods {
    appName: string;
    environmentName: string;
    isAppDeployment: boolean;
    pods: Map<string, any>;
    nodes: AggregatedNodes;
    describeNode: (nodeName: string, containerName?: string) => void;
    appId: number;
    podLevelExternalLinks: OptionTypeWithIcon[]
    containerLevelExternalLinks: OptionTypeWithIcon[]
    appDetails: AppDetails
}
export const AllPods: React.FC<AllPods> = ({ isAppDeployment, pods, describeNode, appName, environmentName, nodes, appId, podLevelExternalLinks, containerLevelExternalLinks, appDetails }) => {
    const params = useParams<{ appId: string, envId: string }>()
    const podsArray = Array.from(pods).map(([podName, pod], idx) => pod)
    const [podTab, selectPodTab] = useState<'old' | 'new'>('new')

    const { newPods, oldPods, newPodStats, oldPodStats, allPodStats } = podsArray.reduce((agg, curr, idx) => {
        let podStatus = curr.info.filter(({ name, value }) => name === 'Status Reason')[0]?.value || ''
        podStatus = podStatus.toLowerCase()
        curr.status = podStatus
        if (curr.isNew) {
            agg.newPods.set(curr.name, curr)
            agg.newPodStats[podStatus] = (agg.newPodStats[podStatus] || 0) + 1
            agg.newPodStats['all'] += 1
        }
        else {
            agg.oldPods.set(curr.name, curr);
            agg.oldPodStats[podStatus] = (agg.oldPodStats[podStatus] || 0) + 1;
            agg.oldPodStats['all'] += 1;
        }
        agg.allPodStats[podStatus] = (agg.allPodStats[podStatus] || 0) + 1;
        agg.allPodStats['all'] += 1;
        return agg
    }, {
        newPods: new Map(),
        oldPods: new Map(),
        newPodStats: { running: 0, all: 0 },
        oldPodStats: { running: 0, all: 0 },
        allPodStats: { running: 0, all: 0 }
    });
    return (
        <div>
            {isAppDeployment ? (
                <>
                    <div className="flex left old-new-switch-container">
                        <div
                            className={`no-decor old-new-link flex left column pl-16 pr-16 pointer ${podTab === 'new' ? 'active' : ''
                                }`}
                            onClick={(e) => selectPodTab('new')}
                            data-testid="all-pods-new"
                        >
                            <div className="fs-14 fw-6">New Pods ({newPodStats.all})</div>
                            <div className="flex left fs-12 cn-9">
                                {Object.keys(newPodStats)
                                    .filter((n) => n !== 'all')
                                    .map((status, idx) => (
                                        <React.Fragment key={idx}>
                                            {!!idx && <span className="bullet mr-4 ml-4"></span>}
                                            <span key={idx} data-testid={`new-pod-status-${status}`}>
                                                {newPodStats[status]} {status}
                                            </span>
                                        </React.Fragment>
                                    ))}
                            </div>
                        </div>
                        <div
                            className={`no-decor old-new-link flex left column pl-16 pr-16 pointer ${podTab === 'old' ? 'active' : ''
                                }`}
                            onClick={(e) => selectPodTab('old')}
                            data-testid="all-pods-old"
                        >
                            <div className="fs-14 fw-6">Old Pods ({oldPodStats.all})</div>
                            <div className="flex left fs-12 cn-9">
                                {Object.keys(oldPodStats)
                                    .filter((n) => n !== 'all')
                                    .map((status, idx) => (
                                        <React.Fragment key={idx}>
                                            {!!idx && <span className="bullet mr-4 ml-4"></span>}
                                            <span key={idx}>
                                                {oldPodStats[status]} {status}
                                            </span>
                                        </React.Fragment>
                                    ))}
                            </div>
                        </div>
                    </div>
                    <NestedTable
                        type={Nodes.Pod}
                        Data={podTab === 'new' ? newPods : oldPods}
                        nodes={nodes}
                        describeNode={describeNode}
                        level={1}
                        appName={appName}
                        environmentName={environmentName}
                        appId={appId}
                        podLevelExternalLinks={podLevelExternalLinks}
                        containerLevelExternalLinks={containerLevelExternalLinks}
                        appDetails={appDetails}
                    />
                </>
            ) : (
                <GenericInfo
                    nodes={nodes}
                    level={1}
                    Data={nodes.nodes[Nodes.Pod]}
                    type={Nodes.Pod}
                    describeNode={describeNode}
                    appName={appName}
                    environmentName={environmentName}
                    appId={appId}
                    podLevelExternalLinks={podLevelExternalLinks}
                    containerLevelExternalLinks={containerLevelExternalLinks}
                    appDetails={appDetails}
                />
            )}
        </div>
    );
}

export const GenericInfo: React.FC<{ appName: string; environmentName: string; nodes: AggregatedNodes; level?: number; Data: Map<string, any>; type: NodeType; describeNode: (nodeName: string, containerName?: string) => void, appId: number, podLevelExternalLinks: OptionTypeWithIcon[], containerLevelExternalLinks: OptionTypeWithIcon[], appDetails: AppDetails }> = ({ appName, environmentName, nodes, Data, type, describeNode, level = 1 , appId, podLevelExternalLinks, containerLevelExternalLinks, appDetails }) => {
    return (
        <div className={`generic-info-container flex left column top w-100`}>
            {level === 1 && (
                <div
                    className="flex left column w-100 generic-info-header"
                >
                    <div style={{ height: '64px' }} className="pl-16 pr-16 flex column left">
                        <div className="fs-14 fw-6 cn-9">{type} ({nodes.nodes[type].size})</div>
                        <div className="flex left">
                            {nodes.nodeStatusCount[type] &&
                                Object.entries(nodes.nodeStatusCount[type]).map(([status, count], idx, arr) => (
                                    <React.Fragment key={status}>
                                        <div>
                                            {count} {status.toLowerCase()}
                                        </div>
                                        {idx !== arr.length - 1 && <span className="bullet ml-6 mr-6"></span>}
                                    </React.Fragment>
                                ))}
                        </div>
                    </div>
                </div>
            )}
            <NestedTable
                type={type}
                Data={Data}
                nodes={nodes}
                describeNode={describeNode}
                level={level}
                appName={appName}
                environmentName={environmentName}
                appId={appId}
                podLevelExternalLinks={podLevelExternalLinks}
                containerLevelExternalLinks={containerLevelExternalLinks}
                appDetails={appDetails}
            />
        </div>
    );
}

export const NestedTable: React.FC<{ appName: string; environmentName: string; level: number; type: NodeType; Data: Map<string, any>; nodes: AggregatedNodes; describeNode: (nodeName: string, containerName: string) => void , appId: number, podLevelExternalLinks: OptionTypeWithIcon[], containerLevelExternalLinks: OptionTypeWithIcon[], appDetails: AppDetails }> = ({ appName, environmentName, level, type, Data, nodes, describeNode , appId, podLevelExternalLinks, containerLevelExternalLinks, appDetails }) => {
    const tableColumns = getGenricRowFields(type)
    return (
        <table className={`resource-tree ${level === 1 ? 'ml-10' : ''}`} style={{ width: level === 1 ? 'calc( 100% - 10px )' : '100%' }}>
            <thead>
                <tr>
                    <th></th>
                    {/* for dropdown */}
                    {tableColumns.map((field) => (
                        <th key={field}>
                            {field === 'name' && level > 1 ? type : field === 'external-links' ? '' : field}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {Array.from(Data)?.map(([nodeName, nodeDetails], idx) => (
                    <GenericRow
                        nodes={nodes}
                        key={idx}
                        nodeName={nodeName}
                        nodeDetails={nodeDetails}
                        describeNode={describeNode}
                        level={level}
                        appName={appName}
                        environmentName={environmentName}
                        appId={appId}
                        podLevelExternalLinks={podLevelExternalLinks}
                        containerLevelExternalLinks={containerLevelExternalLinks}
                        appDetails={appDetails}
                    />
                ))}
                {Data.size === 0 && (
                    <tr>
                        <td colSpan={tableColumns.length + 1}>
                            <div className="w-100 flex" style={{ height: '400px' }}>
                                <NoPod selectMessage="No Available Pods" />
                            </div>
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    );
}

const URL: React.FC<{ url: string }> = ({ url }) => {
    return (
        <td>
            <div className="flex left">
                {url}
                <Clipboard
                    className="icon-dim-16 ml-8"
                    onClick={(e) => copyToClipboard(url, () => toast.success('Copied to clipboard'))}
                    style={{ cursor: 'pointer' }}
                />
            </div>
        </td>
    );
};

export const Name: React.FC<{ nodeDetails: any, describeNode: (nodeName: string, containerName?: string) => void, addExtraSpace: boolean }> = ({ nodeDetails, describeNode, addExtraSpace }) => {
    const { path } = useRouteMatch();
    const history = useHistory();
    const params = useParams();
    const { queryParams } = useSearchString();
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        if (!copied) return
        setTimeout(() => setCopied(false), 2000)
    }, [copied])

    function showManifest(tab) {
        queryParams.set('kind', nodeDetails.kind === Nodes.Containers ? Nodes.Pod : nodeDetails.kind);
        const newUrl = generatePath(path, { ...params, tab }) + '?' + queryParams.toString();
        describeNode(nodeDetails?.name);
        history.push(newUrl);
    }
    return (
        <td className="hover-trigger" data-testid={`${nodeDetails.name}-hover-trigger`}>
            <div className="flex left top" {...(addExtraSpace && { style: { marginRight: '48px' }})}>
                <div className="flex left column">
                    <div className="flex left">
                        {nodeDetails?.name}
                        <Tippy
                            className="default-tt"
                            arrow={false}
                            placement="bottom"
                            content={copied ? 'Copied!' : 'Copy to clipboard.'}
                            trigger='mouseenter click'
                        >
                            <Clipboard
                                className="hover-only icon-dim-18 pointer"
                                onClick={(e) => copyToClipboard(nodeDetails?.name, () => setCopied(true))}
                            />
                        </Tippy>
                    </div>
                    {(nodeDetails?.status || nodeDetails?.health?.status) && (
                        <span
                            className={` app-summary__status-name f-${(
                                nodeDetails?.status || nodeDetails?.health?.status
                            ).toLowerCase()}`}
                        >
                            {nodeDetails?.status || nodeDetails?.health?.status}
                        </span>
                    )}
                </div>
                {nodeDetails.kind !== Nodes.Containers && (
                    <>
                        <span
                            data-testid={`${nodeDetails.name}-manifest`}
                            className="hover-only fw-6 anchor pointer ml-6"
                            onClick={(e) => showManifest(NodeDetailTabs.MANIFEST)}
                        >
                            MANIFEST
                        </span>
                        <span
                            data-testid={`${nodeDetails.name}-events`}
                            className="hover-only fw-6 anchor pointer ml-6"
                            onClick={(e) => showManifest(NodeDetailTabs.EVENTS)}
                        >
                            EVENTS
                        </span>
                    </>
                )}

                {[Nodes.Pod, Nodes.Containers].includes(nodeDetails.kind) && (
                    <span
                        data-testid={`${nodeDetails.name}-logs`}
                        className="hover-only fw-6 anchor pointer ml-6"
                        onClick={(e) => showManifest(NodeDetailTabs.LOGS)}
                    >
                        LOGS
                    </span>
                )}
                {nodeDetails.kind.toLowerCase() === 'pod' ?
                    <span data-testid={`${nodeDetails.name}-logs`}
                        className="hover-only fw-6 anchor pointer ml-6"
                        onClick={(e) => showManifest(NodeDetailTabs.TERMINAL)}>
                        TERMINAL
                    </span> : null}
            </div>
        </td>
    );
}

interface MenuProps {
    appName: string;
    environmentName: string;
    nodeDetails;
    describeNode;
    appId: number;
}

export const Menu: React.FC<MenuProps> = ({ appName, environmentName, nodeDetails, describeNode, appId }) => {
    const { path } = useRouteMatch();
    const history = useHistory();
    const params = useParams();
    const { queryParams } = useSearchString();

    function describeNodeWrapper(tab) {
        queryParams.set('kind', Nodes.Pod);
        const newUrl = generatePath(path, { ...params, tab }) + '?' + queryParams.toString();
        describeNode(nodeDetails.name);
        history.push(newUrl);
    }

    return (
        <td style={{ width: '40px' }}>
            <PopupMenu autoClose>
                <PopupMenu.Button isKebab={true}>
                    <img src={dots} className="pod-info__dots" />
                </PopupMenu.Button>
                <PopupMenu.Body>
                    <PodPopup
                        kind={nodeDetails?.kind}
                        name={nodeDetails.name}
                        version={nodeDetails?.version}
                        group={nodeDetails?.group}
                        namespace={nodeDetails.namespace}
                        describeNode={describeNodeWrapper}
                        appName={appName}
                        environmentName={environmentName}
                        appId={appId}
                    />
                </PopupMenu.Body>
            </PopupMenu>
        </td>
    );
}

export const GenericRow: React.FC<{ appName: string; environmentName: string; nodes: AggregatedNodes, nodeName: string; nodeDetails: any; describeNode: (nodeName: string, containerName?: string) => void; level?: number, appId: number, podLevelExternalLinks: OptionTypeWithIcon[], containerLevelExternalLinks: OptionTypeWithIcon[], appDetails: AppDetails }> = ({ appName, environmentName, nodes, nodeName, nodeDetails, describeNode, level, appId, podLevelExternalLinks, containerLevelExternalLinks, appDetails }) => {
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const tableColumns = getGenricRowFields(nodeDetails.kind)

    return (
        <React.Fragment>
            <tr className={`data-row `}>
                <td>
                    {(nodeDetails.children || nodeDetails?.containers?.length) ? (
                        <DropDown
                            data-testid="collapse-icon"
                            className="icon-dim-24 rotate"
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setCollapsed(not);
                            }}
                            style={{ ['--rotateBy' as any]: collapsed ? '-90deg' : '0deg' }}
                        />
                    ) : null}
                </td>
                {tableColumns.map((column) => {
                    if (column === 'url') {
                        return <URL key={column} url={nodeDetails.url} />;
                    } else if (column === 'name') {
                        return <Name key={column} nodeDetails={nodeDetails} describeNode={describeNode} addExtraSpace={nodeDetails.kind === Nodes.Containers && containerLevelExternalLinks.length > 0} />;
                    } else if (column === 'external-links' && nodeDetails.kind === Nodes.Pod && podLevelExternalLinks.length > 0) {
                        return (
                            <td>
                                <NodeLevelExternalLinks
                                    appDetails={appDetails}
                                    nodeLevelExternalLinks={podLevelExternalLinks}
                                    podName={nodeName}
                                />
                            </td>
                        )
                    } else if (column === 'external-links' && nodeDetails.kind === Nodes.Containers && containerLevelExternalLinks.length > 0) {
                        return (
                            <td>
                                <NodeLevelExternalLinks
                                    appDetails={appDetails}
                                    nodeLevelExternalLinks={containerLevelExternalLinks}
                                    podName={nodeName}
                                    containerName={nodeName}
                                />
                            </td>
                        )
                    } else if (column === '') {
                        return (
                            <Menu nodeDetails={nodeDetails}
                                describeNode={describeNode}
                                appName={appName}
                                environmentName={environmentName}
                                key={column}
                                appId={appId}
                            />
                        );
                    } else {
                        return <td key={column}>{nodeDetails[column] || ''}</td>;
                    }
                })}
            </tr>
            {!collapsed && (nodeDetails.children || nodeDetails.containers) && (
                <tr style={{ height: '100%' }}>
                    <td className="indent-line"></td>
                    <td colSpan={tableColumns.length} style={{ padding: '0' }}>
                        {nodeDetails.children &&
                            Object.keys(nodeDetails.children).map((childrenType) => (
                                <NestedTable
                                    appName={appName}
                                    environmentName={environmentName}
                                    level={level + 1}
                                    key={childrenType}
                                    type={childrenType as NodeType}
                                    describeNode={describeNode}
                                    nodes={nodes}
                                    Data={nodeDetails.children[childrenType].reduce((agg, childName) => {
                                        agg.set(childName, nodes.nodes[childrenType].get(childName))
                                        return agg
                                    }, new Map)}
                                    appId={appId}
                                    podLevelExternalLinks={podLevelExternalLinks}
                                    containerLevelExternalLinks={containerLevelExternalLinks}
                                    appDetails={appDetails}
                                />
                            ))}
                        {nodeDetails.kind === Nodes.Pod && nodeDetails?.containers?.length ?
                            <NestedTable
                                type={Nodes.Containers}
                                describeNode={(containerName) => describeNode(nodeDetails?.name, containerName)}
                                level={level + 1}
                                Data={nodeDetails.containers.reduce((agg, containerName) => {
                                    agg.set(containerName, { name: containerName, kind: Nodes.Containers })
                                    return agg;
                                }, new Map)}
                                nodes={nodes}
                                appName={appName}
                                environmentName={environmentName}
                                appId={appId}
                                podLevelExternalLinks={podLevelExternalLinks}
                                containerLevelExternalLinks={containerLevelExternalLinks}
                                appDetails={appDetails}
                            /> : ''}
                        {nodeDetails.kind === Nodes.Pod && nodeDetails?.initContainers?.length ?
                            <NestedTable
                                type={Nodes.InitContainers}
                                describeNode={(containerName) => describeNode(nodeDetails?.name, containerName)}
                                level={level + 1}
                                Data={nodeDetails.initContainers.reduce((agg, containerName) => {
                                    agg.set(containerName, { name: containerName, kind: Nodes.Containers })
                                    return agg;
                                }, new Map)}
                                nodes={nodes}
                                appName={appName}
                                environmentName={environmentName}
                                appId={appId}
                                podLevelExternalLinks={podLevelExternalLinks}
                                containerLevelExternalLinks={containerLevelExternalLinks}
                                appDetails={appDetails}
                            /> : ''}
                    </td>
                </tr>
            )}
        </React.Fragment>
    );
}

const PodPopup: React.FC<{appName: string, environmentName: string, name: string, kind: NodeType, group, version, namespace: string, describeNode: (tab?: NodeDetailTabsType) => void, appId: number}> = ({ appName, environmentName, name, kind, version, group, namespace, describeNode , appId}) => {
    const params = useParams<{ appId: string; envId: string }>();
    async function asyncDeletePod(e) {
        let apiParams = {
            appId: appId,
            appName,
            kind: kind,
            group: group,
            env: environmentName,
            envId: +params.envId,
            namespace,
            version: version,
            name,
        };
        try {
            await deleteResource(apiParams);
            toast.success('Deletion initiated successfully.');
        } catch (err) {
            showError(err);
        }
    }

    return <div className="pod-info__popup-container">
        {kind === Nodes.Pod ? <span className="flex pod-info__popup-row"
            onClickCapture={e => describeNode(NodeDetailTabs.EVENTS)}>
            View Events
        </span> : ''}
        {kind === Nodes.Pod ? <span className="flex pod-info__popup-row"
            onClick={e => describeNode(NodeDetailTabs.LOGS)}>
            View Container Logs
        </span> : ''}
        <span className="flex pod-info__popup-row pod-info__popup-row--red"
            onClick={asyncDeletePod}>
            <span>Delete</span>
            <Trash className="icon-dim-20" />
        </span>
    </div>
}

export function NoPod({ selectMessage = "Select a pod to view events", style = {} }) {
    return <div data-testid="no-pod" className="no-pod no-pod--pod" style={{ ...style }}>
        <PodIcon color="var(--N400)" style={{ width: '48px', height: '48px', marginBottom: '12px' }} />
        <p>{selectMessage}</p>
    </div>
}

export function EmptyPage({ title = "Data not available" }) {
    return <div className="flex column" style={{ height: '100%', width: '100%' }}>
        <img src={emptyPageIcon} style={{ height: '48px', width: '48px', marginBottom: '8px' }} />
        <div className="title" style={{ fontSize: '16px', marginBottom: '4px', color: 'var(--N900)' }}>{title}</div>
        <div className="subtitle" style={{ fontSize: '12px', color: 'var(--N700)', width: '200px', textAlign: 'center' }}>please modify configuration and redeploy.</div>
    </div>
}

export default ResourceTreeNodes

export function getAllContainers(nodeDetails) {
    let allContainers = nodeDetails.containers.concat(nodeDetails.initContainers);
    return allContainers.reduce((agg, containerName) => {
        agg.set(containerName, { name: containerName, kind: Nodes.Containers })
        return agg;
    }, new Map)
}
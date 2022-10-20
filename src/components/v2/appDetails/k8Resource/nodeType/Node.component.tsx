import React, { useEffect, useRef, useState } from 'react';
import { useRouteMatch, useParams, useHistory } from 'react-router';
import IndexStore from '../../index.store';
import Tippy from '@tippyjs/react';
import { copyToClipboard } from '../../../../common';
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { ReactComponent as Clipboard } from '../../../../../assets/icons/ic-copy.svg';
import PodHeaderComponent from './PodHeader.component';
import { NodeType, Node, iNode, AppType } from '../../appDetails.type';
import './nodeType.scss';
import { getNodeDetailTabs } from '../nodeDetail/nodeDetail.util';
import NodeDeleteComponent from './NodeDelete.component';
import AppDetailsStore from '../../appDetails.store';
import { toast } from 'react-toastify';
import { getNodeStatus } from './nodeType.util';
import { useSharedState } from '../../../utils/useSharedState';
import { NodeLevelExternalLinks } from '../../../../externalLinks/ExternalLinks.component';
import { ExternalLink, OptionTypeWithIcon } from '../../../../externalLinks/ExternalLinks.type';
import { getMonitoringToolIcon } from '../../../../externalLinks/ExternalLinks.utils';
import { NoPod } from '../../../../app/ResourceTreeNodes';

function NodeComponent({
    handleFocusTabs,
    externalLinks,
    monitoringTools,
    isDevtronApp
}: {
    handleFocusTabs: () => void,
    externalLinks: ExternalLink[]
    monitoringTools: OptionTypeWithIcon[]
    isDevtronApp?:boolean
}) {
    const { path, url } = useRouteMatch();
    const history = useHistory();
    const markedNodes = useRef<Map<string, boolean>>(new Map<string, boolean>())
    const [selectedNodes, setSelectedNodes] = useState<Array<iNode>>();
    const [selectedHealthyNodeCount, setSelectedHealthyNodeCount] = useState<Number>(0);
    const [copied, setCopied] = useState(false);
    const [tableHeader, setTableHeader] = useState([]);
    const [firstColWidth, setFirstColWidth] = useState('');
    const [podType, setPodType] = useState(false);
    const [detailedNode, setDetailedNode] = useState<{ name: string; containerName?: string }>(null);
    const appDetails = IndexStore.getAppDetails();
    const params = useParams<{ nodeType: NodeType, resourceName: string }>();
    const podMetaData = IndexStore.getPodMetaData();
    const [filteredNodes] = useSharedState(
        IndexStore.getAppDetailsFilteredNodes(),
        IndexStore.getAppDetailsNodesFilteredObservable(),
    );
    const [podLevelExternalLinks, setPodLevelExternalLinks] = useState<OptionTypeWithIcon[]>([])
    const [containerLevelExternalLinks, setContainerLevelExternalLinks] = useState<OptionTypeWithIcon[]>([])
    const isPodAvailable: boolean = params.nodeType === NodeType.Pod.toLowerCase() && isDevtronApp;

    useEffect(() => {
        if (externalLinks.length > 0) {
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
    }, [externalLinks])

    useEffect(() => {
        if (!copied) return;
        setTimeout(() => setCopied(false), 2000);
    }, [copied]);

    useEffect(() => {
        if (params.nodeType) {
            let tableHeader: string[], _fcw: string;

            switch (params.nodeType) {
                case NodeType.Pod.toLowerCase():
                    if(appDetails.appType == AppType.EXTERNAL_HELM_CHART){
                        tableHeader = ['Name', ''];
                    }else{
                        tableHeader = ['Name', 'Ready', 'Restarts', 'Age', 'Links', ''];
                    }
                    _fcw = 'col-7';
                    break;
                case NodeType.Service.toLowerCase():
                    tableHeader = ['Name', 'URL', ''];
                    _fcw = 'col-6';
                    break;
                default:
                    tableHeader = ['Name', ''];
                    _fcw = 'col-11';
                    break;
            }

            setTableHeader(tableHeader);
            setFirstColWidth(_fcw);

            let [_ignore, _selectedResource] = url.split("group/")
            let _selectedNodes: Array<iNode>
            if (_selectedResource) {
                _selectedResource = _selectedResource.replace(/\/$/, '')
                _selectedNodes =IndexStore.getPodsForRootNode(_selectedResource).sort((a,b) => a.name > b.name? 1: -1)
            } else {
                _selectedNodes = IndexStore.getiNodesByKind(params.nodeType).sort((a,b) => a.name > b.name? 1: -1)
            }
            let _healthyNodeCount = 0;

            _selectedNodes.forEach((node: Node) => {
                if (node.health?.status.toLowerCase() === 'healthy') {
                    _healthyNodeCount++;
                }
            });
            let podsType = []
            if(isPodAvailable){
                podsType = ( _selectedNodes.filter(el => podMetaData.some((f) =>  f.name === el.name && f.isNew === podType)))
            }

            setSelectedNodes( isPodAvailable ? [...podsType]: [..._selectedNodes]);

            setSelectedHealthyNodeCount(_healthyNodeCount);
        }
    }, [params.nodeType, podType, url, filteredNodes]);

    const getElapsedTime = (createdAt : Date) => {
        let currentDate = new Date()
        let timeDiffInseconds = Math.floor((currentDate.getTime() - createdAt.getTime())/1000)
        let days = Math.floor(timeDiffInseconds/(24*60*60))
        timeDiffInseconds = timeDiffInseconds%(24*60*60) 
        let hrs = Math.floor(timeDiffInseconds/(60*60))
        timeDiffInseconds = timeDiffInseconds%(60*60)
        let mins = Math.floor(timeDiffInseconds/60)
        let secs = timeDiffInseconds%60 
        let elapsedTime = ""
        if(days >= 1) elapsedTime+=(days+"d")
        if(hrs >= 1) elapsedTime+=(hrs+"h")
        if(elapsedTime.length > 0)return elapsedTime
        if(mins >= 1) elapsedTime+=(mins+"m")
        if(secs >= 1) elapsedTime+=(secs+"s")
        return elapsedTime
    };

    const markNodeSelected = (nodes: Array<iNode>, nodeName: string) => {
        const updatedNodes = nodes.map((node) => {
            if (node.name === nodeName) {
                node.isSelected = !node.isSelected
                markedNodes.current.set(
                    node.name,
                    markedNodes.current.has(node.name) ? !markedNodes.current.get(node.name) : node.isSelected,
                )
            } else if (node.childNodes?.length > 0) {
                markNodeSelected(node.childNodes, nodeName)
            }

            return node
        })

        setSelectedNodes(updatedNodes)
    };

    const describeNode = (name: string, containerName: string) => {
        setDetailedNode({ name, containerName });
    };

    const handleActionTabClick = (node: iNode, _tabName: string, containerName?: string) => {
        let [_url, _ignore] = url.split("/group/")
        _url = `${_url.split('/').slice(0, -1).join('/')}/${node.kind.toLowerCase()}/${
            node.name
        }/${_tabName.toLowerCase()}`;

        if (containerName) {
            _url = `${_url}?container=${containerName}`;
        }

        const isAdded = AppDetailsStore.addAppDetailsTab(node.kind, node.name, _url);

        if (isAdded) {
            history.push(_url);
        } else {
            toast.error(
                <div>
                    <div>Max 5 tabs allowed</div>
                    <p>Please close an open tab and try again.</p>
                </div>,
            );
        }
    };

    const makeNodeTree = (nodes: Array<iNode>, showHeader?: boolean) => {
        let _currentNodeHeader = ''
        return nodes.map((node, index) => {
            const nodeName = `${node.name}.${node.namespace} : { portnumber }`
            const _isSelected = markedNodes.current.get(node.name)

            // Only render node kind header when it's the first node or it's a different kind header
            _currentNodeHeader = index === 0 || _currentNodeHeader !== node.kind ? node.kind : ''

            return (
                <React.Fragment key={'grt' + index}>
                    {showHeader && !!_currentNodeHeader && (
                        <div className="fw-6 pt-10 pb-10 pl-16 dc__border-bottom-n1">
                            <span>{node.kind}</span>
                        </div>
                    )}
                    <div className="node-row m-0 resource-row">
                        <div className={`resource-row__content ${firstColWidth} pt-9 pb-9 cursor dc__content-space`}>
                            <div className="flex dc__align-start">
                                <div
                                    className="flex left top ml-2"
                                    onClick={() => {
                                        markNodeSelected(selectedNodes, node.name);
                                    }}
                                >
                                    {node.childNodes?.length > 0 ? (
                                        <DropDown
                                            className={`rotate icon-dim-24 pointer ${_isSelected ? 'fcn-9' : 'fcn-5'} `}
                                            style={{ ['--rotateBy' as any]: !_isSelected ? '-90deg' : '0deg' }}
                                        />
                                    ) : (
                                        <span className="pl-12 pr-12"></span>
                                    )}
                                    <div>
                                        <div>{node.name}</div>
                                        <div
                                            className={` app-summary__status-name f-${(
                                                node?.status ||
                                                node?.health?.status ||
                                                ''
                                            ).toLowerCase()}`}
                                        >
                                            {getNodeStatus(node)}
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Tippy
                                        className="default-tt"
                                        arrow={false}
                                        placement="bottom"
                                        content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                        trigger="mouseenter click"
                                    >
                                        <Clipboard
                                            className="resource-action-tabs__active icon-dim-12 pointer ml-8 mr-8"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                copyToClipboard(node?.name, () => setCopied(true));
                                            }}
                                        />
                                    </Tippy>
                                    {getNodeDetailTabs(node.kind).map((kind, index) => {
                                        return (
                                            <a
                                                key={'tab__' + index}
                                                onClick={() => {
                                                    if (node.kind === NodeType.Containers) {
                                                        handleActionTabClick(node['pNode'], kind, node.name);
                                                    } else {
                                                        handleActionTabClick(node, kind);
                                                    }
                                                    handleFocusTabs();
                                                }}
                                                className="fw-6 cb-5 ml-6 cursor resource-action-tabs__active"

                                            >
                                                {kind}
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {params.nodeType === NodeType.Service.toLowerCase() && (
                            <div className={'col-5 pt-9 pb-9 flex left'}>
                                {nodeName}
                                <Tippy
                                    className="default-tt"
                                    arrow={false}
                                    placement="bottom"
                                    content={copied ? 'Copied!' : 'Copy to clipboard.'}
                                    trigger="mouseenter click"
                                >
                                    <Clipboard
                                        className="resource-action-tabs__active pl-4 icon-dim-16 pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(nodeName, () => setCopied(true));
                                        }}
                                    />
                                </Tippy>
                            </div>
                        )}

                        {params.nodeType === NodeType.Pod.toLowerCase() && (
                            <div className={'flex left col-1 pt-9 pb-9'}>
                                {' '}
                                {node.info?.filter((_info) => _info.name === 'Containers')[0]?.value}{' '}
                            </div>
                        )}
                    
                        {params.nodeType === NodeType.Pod.toLowerCase() && (
                            <div className={'flex left col-1 pt-9 pb-9'}>
                                {(node.kind !== 'Containers') && (node.info?.map((_info) => _info.name === 'Restart Count' ?_info.value : 0).sort((a,b) => a > b ? -1: 1)[0])}
                            </div>
                        )}
                        {params.nodeType === NodeType.Pod.toLowerCase() && (
                            <div className={'flex left col-1 pt-9 pb-9'}>
                                {' '}
                                {getElapsedTime(new Date(node.createdAt))}{' '}
                            </div>
                        )}
                        <div className={'flex left col-1 pt-9 pb-9'}>
                            {node.kind === NodeType.Pod && podLevelExternalLinks.length > 0 && (
                                <NodeLevelExternalLinks
                                    helmAppDetails={appDetails}
                                    nodeLevelExternalLinks={podLevelExternalLinks}
                                    podName={node.name}
                                />
                            )}
                            {node.kind === NodeType.Containers && containerLevelExternalLinks.length > 0 && (
                                <NodeLevelExternalLinks
                                    helmAppDetails={appDetails}
                                    nodeLevelExternalLinks={containerLevelExternalLinks}
                                    podName={node['pNode']?.name}
                                    containerName={node.name}
                                    addExtraSpace={true}
                                />
                            )}
                        </div>
                        <div className={'flex col-1 pt-9 pb-9 flex-row-reverse'}>
                            <NodeDeleteComponent nodeDetails={node} appDetails={appDetails} />
                        </div>
                    </div>

                    {node.childNodes?.length > 0 && _isSelected && (
                        <div className="ml-22 indent-line">
                            <div>{makeNodeTree(node.childNodes, true)}</div>
                        </div>
                    )}
                </React.Fragment>
            );
        });
    };

    return (
        <>
            {selectedNodes && (
                <div className="node-container-fluid">
                    {isPodAvailable ? (
                        <PodHeaderComponent callBack={setPodType} />
                    ) : (
                        <div className="node-detail__sticky-header dc__border-bottom-n1 pt-10 pb-10">
                            <div className="pl-16 fw-6 fs-14 dc__capitalize">
                                <span className="pr-4">{selectedNodes && selectedNodes[0]?.kind}</span>
                                <span>({selectedNodes?.length})</span>
                            </div>
                            {selectedHealthyNodeCount > 0 && (
                                <div className="pl-16"> {selectedHealthyNodeCount} healthy</div>
                            )}
                        </div>
                    )}

                    <div className="node-row dc__border-bottom-n1 fw-6 m-0">
                        {tableHeader.map((cell, index) => {
                            return (
                                <div
                                    key={'gpt_' + index}
                                    className={`${
                                        index === 0 ? `node-row__pdding ${firstColWidth}` : 'col-1'
                                    } pt-9 pb-9`}
                                >
                                    {cell}
                                </div>
                            )
                        })}
                    </div>
                    {params.nodeType === NodeType.Pod.toLowerCase() && containerLevelExternalLinks.length > 0 && (
                        <div className="fs-12 fw-4 cn-9 bcn-1 lh-16 pt-4 pb-4 pl-32 pr-32">
                            Expand pods to view external links for containers.
                        </div>
                    )}
                    {selectedNodes.length > 0 ? (
                        makeNodeTree(selectedNodes)
                    ) : (
                        <div className="w-100 flex" style={{ height: '400px' }}>
                            <NoPod selectMessage="No Available Pods" />
                        </div>
                    )}
                </div>
            )}
        </>
    )
}

export default NodeComponent;
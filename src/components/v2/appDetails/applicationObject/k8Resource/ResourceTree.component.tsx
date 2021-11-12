import React, { useEffect } from 'react'
import { ReactComponent as DropDown } from '../../../../../assets/icons/ic-dropdown-filled.svg';
import { iNode, iNodes } from './node.type';
import { NodeTreeActions, useNodeTree } from './useNodeTreeReducer';
import { useHistory, useRouteMatch, } from 'react-router';
import { URLS } from '../../../../../config';
import { useSharedState } from '../../../utils/useSharedState';
import AppDetailsStore from '../../appDetail.store';

function ResourceTreeComponent() {
    const [nodes] = useSharedState(AppDetailsStore.getAppDetailsNodes(), AppDetailsStore.getAppDetailsNodesObservable())

    const [{ treeNodes }, dispatch] = useNodeTree(nodes);
    const history = useHistory();
    const { url } = useRouteMatch();

    useEffect(() => {
        //console.log("ResourceTreeComponent", nodes)
    }, [])
    
    //const params = useParams<{ appId: string, envId: string, name: string, action: string, node: string }>()

    // useEffect(() => {
    //     const link = url.split(URLS.APP_DETAILS)[0] + URLS.APP_DETAILS + '/'
    //     if (!params.action || NodeDetailTabs[params.action.toUpperCase()] === undefined) {
    //         history.push(link + URLS.APP_DETAILS_K8)
    //     }
    // }, [params.action])

    // useEffect(() => {
    //     let newUrl = window.location.href.split(`details`)[1] + URLS.APP_DETAILS_K8
    //     console.log(newUrl)
    //     history.push(newUrl)
    // }, [window.location.href])

    const handleNodeClick = (treeNode: iNode, e: any) => {
        e.stopPropagation()
       
        if (treeNode.childNodes?.length > 0) {
            dispatch({
                type: NodeTreeActions.MarkActive,
                node: treeNode
            })
        }
        else {
            let link = `${url.split(URLS.APP_DETAILS_K8)[0]}${URLS.APP_DETAILS_K8}/${treeNode.name.toLowerCase()}`;
            history.push(link);
        }
    }

    const makeNodeTree = (treeNodes: iNodes) => {
        return treeNodes.map((treeNode: iNode, index: number) => {
            return (
                <div key={index + treeNode.name}>
                    <div className="container-fluid cursor fw-6 cn-9  fs-14" onClick={(e) => handleNodeClick(treeNode, e)} >
                        <div className="row flex left pt-6 pb-6">
                            <div className="col-md-2">
                                {(treeNode.childNodes?.length > 0) && <DropDown className="icon-dim-20" />}
                            </div>
                            <div className="col-md-10">
                                <span> {treeNode.name}</span>
                            </div>
                        </div>
                    </div>
                    { (treeNode.childNodes?.length > 0 && treeNode.isSelected) &&
                        <div className="pl-16">{makeNodeTree(treeNode.childNodes)} </div>
                    }
                </div>
            )
        })
    }

    return (
        <div>
            {makeNodeTree(treeNodes)}
        </div>
    )
}

export default ResourceTreeComponent

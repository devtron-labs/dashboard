import { NodeType } from "../../appDetails.type"
import { NodeDetailTab } from "./nodeDetail.type"

export const getNodeDetailTabs = (nodeType: NodeType) => {

    if (nodeType.toLowerCase() === NodeType.Pod.toLowerCase()) {
        return [
            NodeDetailTab.MANIFEST,
            NodeDetailTab.EVENTS,
            NodeDetailTab.LOGS,
            NodeDetailTab.TERMINAL
        ]
    }


    return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS]

}
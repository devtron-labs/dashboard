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
    } else if (nodeType.toLowerCase() === NodeType.Containers.toLowerCase()) {
        return [
            NodeDetailTab.LOGS,
        ]
    } else {
        return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS]
    }

}
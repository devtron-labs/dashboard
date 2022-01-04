import { NodeType } from "../../appDetails.type"
import { NodeDetailTab } from "./nodeDetail.type"

export const getNodeDetailTabs = (nodeType: NodeType) => {

    if (nodeType === NodeType.Pod) {

        return [
            NodeDetailTab.MANIFEST,
            NodeDetailTab.EVENTS,
            NodeDetailTab.LOGS,
            NodeDetailTab.TERMINAL
        ]
    } else if (nodeType === NodeType.Containers) {
        return [
            NodeDetailTab.LOGS,
        ]
    } else {
        return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS]
    }

}
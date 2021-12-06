import { NodeType } from "../../appDetails.type"
import { NodeDetailTab } from "./nodeDetail.type"

export const getNodeDetailTabs = (nodeType: NodeType) => {

    if (nodeType === NodeType.Pod) {
        return [
            NodeDetailTab.MANIFEST,
            NodeDetailTab.EVENTS,
            NodeDetailTab.LOGS,
            NodeDetailTab.TERMINAL,
            NodeDetailTab.SUMMARY
        ]
    }


    return [NodeDetailTab.MANIFEST, NodeDetailTab.EVENTS]

}
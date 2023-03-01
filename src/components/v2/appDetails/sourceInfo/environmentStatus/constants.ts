import { NodeStatus } from "../../appDetails.type";

export const STATUS_SORTING_ORDER = {
    [NodeStatus.Missing]: 1,
    [NodeStatus.Degraded]: 2,
    [NodeStatus.Progressing]: 3,
    [NodeStatus.Healthy]: 4,
}
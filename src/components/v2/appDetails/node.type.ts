import { Node, NodeType } from "./appDetail.type";

export interface iNodes extends Array<iNode> { }

export interface iNode extends Node {
  childNodes: iNodes;
  type: NodeType;
  isSelected: boolean
}

// export enum iNodeType {
//   Service = 'Service',
//   Pod = 'Pod',
//   GenericInfo = 'GenericInfo',
// }

export enum NodeDetailTabs {
  EVENTS = 'EVENTS',
  LOGS = 'LOGS',
  MANIFEST = 'MANIFEST',
  DESCRIBE = 'DESCRIBE',
  TERMINAL = "TERMINAL",
  SUMMARY = "SUMMARY"
};
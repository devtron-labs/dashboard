import { iLink } from "../../utils/tabUtils/tab.type";

export interface iNodes extends Array<iNode> { }

export interface iNode extends iLink {
  childNodes: iNodes;
  type: iNodeType;
}

export enum iNodeType {
  Service = 'Service',
  AllPod = 'AllPods',
  GenericInfo = 'GenericInfo',
}

export enum NodeDetailTabs {
  EVENTS = 'EVENTS',
  LOGS = 'LOGS',
  MANIFEST = 'MANIFEST',
  DESCRIBE = 'DESCRIBE',
  TERMINAL = "TERMINAL",
  SUMMARY = "SUMMARY"
};
import { iLink } from "../../../utils/tabUtils/tab.type";

export interface iNodes extends Array<iNode> { }

export interface iNode extends iLink {
  childNodes?: iNodes;
  type: iNodeType;
}

export enum iNodeType {
  Service = 'service',
  Pods = 'pods',
  GenericInfo = 'genericInfo',
  Graph = 'graph',
}

export enum NodeDetailTabs {
  EVENTS = 'events',
  LOGS = 'logs',
  MANIFEST = 'manifest',
  DESCRIBE = 'descibe',
  TERMINAL = "terminal",
  SUMMARY = "summary"
};
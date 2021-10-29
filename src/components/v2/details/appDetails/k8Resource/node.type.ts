import { iTab } from "../resourceTree/tab.type";

export interface iNodes extends Array<iNode> { }

export interface iNode extends iTab {
  childNodes: iNodes;
  type: iNodeType;
}

export enum iNodeType{
  Service= 'Service',
  AllPod= 'AllPods',
  GenericInfo='GenericInfo',
}
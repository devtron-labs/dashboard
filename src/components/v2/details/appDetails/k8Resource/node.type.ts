import { iTab } from "../resourceTree/tab.type";

export interface iNodes extends Array<iNode> { }

export interface iNode extends iTab {
  childNodes: iNodes;
  nodeType: iNodeType;
}

export enum iNodeType{
  Service= 'Service',
  Pod= 'Pod',
  Endpoint='Endpoint',
  CronJob = 'CronJob',
  Job = 'Job',
}
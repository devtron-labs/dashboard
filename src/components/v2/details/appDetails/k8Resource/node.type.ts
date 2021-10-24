import { iTab } from "../resourceTree/tab.type";

export interface iNodes extends Array<iNode> { }

export interface iNode extends iTab {
  childNodes: iNodes
}

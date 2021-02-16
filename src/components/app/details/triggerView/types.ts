import { RouteComponentProps } from 'react-router';
import { CIMaterialType } from './MaterialHistory';

export type CDMdalTabType = "SECURITY" | "CHANGES";

export interface CDMaterialProps {
  material: CDMaterialType[];
  isLoading: boolean;
  materialType: string;
  envName: string;
  stageType: string;
  changeTab?: (materrialId: string | number, artifactId: number, tab: CDMdalTabType) => void;
  triggerDeploy: (stageType: string) => void;
  selectImage: (index: number, materialType: string) => void;
  toggleSourceInfo: (materialIndex: number) => void;
  closeCDModal: () => void;
}

export interface CDMaterialType {
  id: string;
  materialInfo: {
    revision: string;
    modifiedTime: string;
    author: string;
    message: string;
    commitLink: string;
    tag: string;
  }[];
  tab: CDMdalTabType;
  scanEnabled: boolean;
  scanned: boolean;
  vulnerabilitiesLoading: boolean;
  lastExecution: string; //timestamp
  vulnerabilities: VulnerabilityType[];
  vulnerable: boolean;
  deployedTime: string;
  buildTime: string;
  image: string;
  isSelected: boolean;
  showSourceInfo: boolean;
  latest: boolean;
}

interface VulnerabilityType {

}

export interface CIMaterialRouterProps {
  appId: string;
  envId: string;
}

export interface CIMaterialProps extends RouteComponentProps<CIMaterialRouterProps> {
  material: CIMaterialType[];
  pipelineId: number;
  title: string;
  isLoading: boolean;
  pipelineName: string;
}

export interface NodeAttr {
  parents: string | number[] | string[];
  x: number;
  y: number;
  title: string;
  description?: string;
  triggerType?: string;
  id: string;
  icon?: string;
  status?: string;
  isSource: boolean;
  isGitSource: boolean;
  isRoot: boolean;
  downstreams: string[];
  type: 'CI' | 'GIT' | 'PRECD' | 'CD' | 'POSTCD';
  parentCiPipeline?: number;
  parentAppId?: number;
  url?: string;
  branch?: string;
  sourceType?: string;
  colorCode?: string;
  isExternalCI?: boolean;
  isLinkedCI?: boolean;
  environmentName?: string; //used for CDs
  environmentId?: string;
  inputMaterialList?: any[]
  rollbackMaterialList?: any[]; //used for CDs
  linkedCount?: number; //used for CI 
  deploymentStrategy?: string;
  height: number;
  width: number;
  preNode?: NodeAttr, //used for CDs
  postNode?: NodeAttr, //used for CDs
  stageIndex?: number; //used for CDs
}

export interface DownStreams {
  id: string;
  text: string;
}

interface InputMaterials {
  time: string;
  user: string;
  commitLink: string;
  isActive: boolean;
}

export interface TriggerCDNodeProps extends RouteComponentProps<{ appId: string }> {
  x: number;
  y: number;
  height: number;
  width: number;
  status: string;
  id: string;
  downstreams?: string[];
  title: string;
  environmentName: string;
  environmentId: string;
  triggerType: string;
  colourCode: string;
  deploymentStrategy: string;
  inputMaterialList: InputMaterials[];
  rollbackMaterialList: InputMaterials[];
  stageIndex: number;
  type: 'CD';
}

export interface TriggerPrePostCDNodeProps extends RouteComponentProps<{ appId: string }> {
  x: number;
  y: number;
  height: number;
  width: number;
  status: string;
  id: string;
  environmentId: string;
  title: string;
  triggerType: string;
  colourCode: string;
  stageIndex: number;
  type: 'PRECD' | 'CD' | 'POSTCD';
  downstreams?: string[];
  inputMaterialList: InputMaterials[];
  rollbackMaterialList: InputMaterials[];
}

export interface TriggerEdgeType {
  startNode: any,
  endNode: any
}

export interface WorkflowProps extends RouteComponentProps<{ appId: string }> {
  id: string;
  name: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  nodes: NodeAttr[];
}

export interface TriggerViewRouterProps {
  appId: string;
  envId: string;
}

export interface TriggerViewProps extends RouteComponentProps<TriggerViewRouterProps> {

}

export interface WorkflowType {
  id: string;
  name: string;
  startX: number;
  startY: number;
  width: number;
  height: number;
  nodes: NodeAttr[];
  dag: any;
}

export interface TriggerViewState {
  code: number;
  view: string;
  workflows: WorkflowType[];
  showCDModal: boolean;
  showCIModal: boolean;
  nodeType: null | 'CI' | 'CD' | 'PRECD' | 'POSTCD';
  ciPipelineName: string;
  ciNodeId: number | null;
  cdNodeId: number;
  materialType: '' | 'inputMaterialList' | 'rollbackMaterialList';
  isLoading: boolean;
  invalidateCache: boolean;
  isHostErrorShown: boolean,

}

//-- begining of response type objects for trigger view

export interface TriggerViewResponse {
  ciPipelineId: number
  ciPipelineName: string
  cdPipelineId: number
  cdPipelineName: string
  status: string
  statusMessage: string
  lastDeployedTime: string
  lastDeployedBy: string
  materialInfo: any
  releaseVersion: string
  dataSource: string
  conditions?: ApplicationConditionResponse[]
}

export interface ApplicationConditionResponse {
  type: string
  message: string
}

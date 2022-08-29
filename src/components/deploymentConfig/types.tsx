import { RouteComponentProps } from 'react-router';
import { ServerError } from '../../modals/commonTypes';

export interface DeploymentObject {
    id: number | null;
    appId: number | null;
    refChartTemplate: string;
    refChartTemplateVersion: string;
    chartRepositoryId: number;
    valuesOverrride: any;
    defaultAppOverride: any;
}

export interface DeploymentConfigState {
    code: number;
    errors: ServerError[];
    successMessage: string | null;
    configStatus: number;
    view: string;
    chartReferences: { id: number, version: string }[];
    template: {
        latestAppConfig: DeploymentConfigTemplate & {jsonSubsetStr: string , yamlSubset: any};
        previousAppConfig: DeploymentConfigTemplate;
    }
    configMap: ConfigMap;
    latestChartRef: number;
    isUnsaved: boolean;
    showDialog: boolean;
}

export interface DeploymentConfigTemplate {
    id: number;
    appId: number | null;
    refChartTemplate: string;
    refChartTemplateVersion: string;
    chartRefId: number;
    valuesOverride: any;
    latest: boolean;
    defaultAppOverride: any;
    isAppMetricsEnabled ?: boolean;
}

export interface DeploymentConfigRouterProps {
    appId: string;
    history: any;
}

export interface ConfigMap {
    id: number;
    appId: number | null;
    environmentId: number;
    pipelineId: number;
    configMapValuesOverride: any;
    secretsValuesOverride: any;
    configMapJsonStr: string;
    secretsJsonStr: string;
    configMapYaml: string;
    secretsYaml: string;
}

export interface ConfigMapRequest {
    id: number;
    app_id: number;
    environment_id: number;
    pipeline_id: number;
    config_map_data: any;
    secret_data: any;
}

export interface DeploymentConfigProps extends RouteComponentProps<DeploymentConfigRouterProps> {
    respondOnSuccess?: () => void;
}

export interface EsoData {
    secretKey: string
    key: string
    property: string
}
export interface SecretFormProps {
    id: number
    appChartRef: { id: number; version: string; name: string }
    appId: number
    roleARN: string
    name: string
    index: number
    external: boolean
    externalType: string
    secretData: { key: string; name: string; property: string; isBinary: boolean }[]
    esoSecretData?: { secretStore: any; esoData: EsoData[] }
    type: string
    data: { k: string; v: string }[]
    isUpdate: boolean
    mountPath: string
    keyValueEditable?: boolean
    filePermission: string
    subPath: boolean
    update: (...args) => void
    collapse: (...args) => void
    initialise?: () => void
}

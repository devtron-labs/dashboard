import { Routes } from "../../config";
import { get } from "../../services/api";
import {ResponseType} from '../../services/service.types';
import { EnvAppList } from "./EnvironmentGroup.types";

export interface EnvApplist extends ResponseType {
    result?: EnvAppList[]
}

export const getEnvAppList = (envId: number): Promise<EnvApplist> => {
    let url = `${Routes.ENVIRONMENT_APPS}?clusterIds=${envId}`
    return get(url);
}
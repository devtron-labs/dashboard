import { Routes } from '../../config';
import { post, put, get } from '../../services/api';

export const getGitOpsConfiguration = (id: number): Promise<any> => {
  const URL = `${Routes.GITOPS}/${id}`;
  return get(URL);
}

export const updateGitOpsConfiguration = (request: any) => {
  const URL = `${Routes.GITOPS}`;
  return put(URL, request);
}

export const saveGitOpsConfiguration = (request: any) => {
  const URL = `${Routes.GITOPS}`;
  return post(URL, request);
}
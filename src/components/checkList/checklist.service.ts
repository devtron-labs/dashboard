import { Routes } from '../../config';
import { post, put, get } from '../../services/api';

export function getAppCheckList(): Promise<any> {
    const URL = `${Routes.APP_CHECKLIST}`;
    return get(URL);
  } 
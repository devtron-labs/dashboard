import { Subject } from 'rxjs';
import { getVersionConfig } from './service';
const serverModeSubject = new Subject();
let serverMode: string;

export const dataService = {
    refreshServerModeData: () => {
        getVersionConfig().then((response) => {
            if (response.code == 200) {
              serverMode = response.result.serverMode;
              serverModeSubject.next(serverMode);
            }
        });
    },
    getServerModeData: () => serverMode,
    serverModeObservable: () => serverModeSubject.asObservable(),
};

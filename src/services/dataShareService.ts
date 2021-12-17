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
              setTimeout(()=>{
                serverMode = 'Full';
                serverModeSubject.next(serverMode);

                setTimeout(()=>{
                  serverMode = 'EA_ONLY';
                  serverModeSubject.next(serverMode);
                },10*1000);
              },10*1000);
            }
        });
    },
    getServerModeData: () => serverMode,
    serverModeObservable: () => serverModeSubject.asObservable(),
};

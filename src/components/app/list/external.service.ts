import { ResponseType } from "../../../services/service.types";
import { get } from "../../../services/api";

export function getExternalSearchQueryList(): Promise<{
    appname: string;
    environment: string;
    queryMatch: string;
}[]> {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve([{
                appname: "shivani",
                environment: "default_cluster/devtroncd ",
                queryMatch: "19 June 2019,04:02 PM",
            },
            {
                appname: "testing",
                environment: "default_cluster/devtroncd ",
                queryMatch: "19 June 2019,04:02 PM",
            },
            {
                appname: "demo",
                environment: "default_cluster/devtroncddefaultdefault_cluster/devtroncddefault",
                queryMatch: "Gerena is a municipality in the Province of Seville, Spain. It is 25 km northwest of the provincial capital, Seville, and 10 km north of Olivares. Gerena is a municipality in the Province of Seville, Spain. It is 25 km northwest of the provincial capital, Seville, and 10 km north of Olivares",
            },
            {
                appname: "devtron",
                environment: "default_cluster/devtroncd ",
                queryMatch: "19 June 2019,04:02 PM",
            },
            ])
        }, 1000)
    })
}
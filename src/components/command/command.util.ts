import { getAppListMin } from '../../services/service';

export function getSuggestedCommands(args) {
    let lastIndex = args.length - 2;
    let arg = args[lastIndex];
    console.log(arg)

    switch (arg) {
        case 'app': return getApplications();
        case 'chart': return [];
        case 'pod': return [];
        case 'pod': return [];
        default: return []
    }

}

function getApplications() {

    getAppListMin().then((response) => {
        console.log(response);
        return [];
    })
}

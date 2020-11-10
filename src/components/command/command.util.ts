
export function getSuggestedCommands(args) {
    return [
        { title: 'Go to app', desc: 'app/app_name', arguments: [{ value: 'app' }, { value: '/' }] },
        { title: 'To a section in an application', desc: 'app/app_name/configure', arguments: [{ value: 'app' }, { value: '/' }] },
        { title: 'Other locations', desc: 'Try user access or helm charts', arguments: [{ value: 'app' }, { value: '/' }] },
    ];
}

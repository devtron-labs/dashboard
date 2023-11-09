export function createGitCommitUrl(url: string, revision: string): string {
    if (!url || !revision) {
        return "NA"
    }
    if (url.indexOf("gitlab") > 0 || url.indexOf("github") > 0 || url.indexOf("azure") > 0) {
        let urlpart = url.split("@")
        if (urlpart.length > 1) {
            return 'https://' + urlpart[1].split('.git')[0].replace(':', '/') + '/commit/' + revision
        }
        if (urlpart.length == 1) {
            return urlpart[0].split(".git")[0] + "/commit/" + revision
        }
    }
    if (url.indexOf("bitbucket") > 0) {
        let urlpart = url.split("@")
        if (urlpart.length > 1) {
            return 'https://' + urlpart[1].split('.git')[0].replace(':', '/') + '/commits/' + revision
        }
        if (urlpart.length == 1) {
            return urlpart[0].split(".git")[0] + "/commits/" + revision
        }
    }
    return "NA"
}
import { fetchAPI } from '../../../services/fetchAPI';

export function getReleases():Promise<any> {
    const URL = `https://api.github.com/repos/rashmirai21/rrai/releases`;
    // return fetchAPI(URL, 'GET');
    return new Promise((resolve, reject)=>{
        resolve([
            {
              "url": "https://api.github.com/repos/rashmirai21/rrai/releases/37725312",
              "assets_url": "https://api.github.com/repos/rashmirai21/rrai/releases/37725312/assets",
              "upload_url": "https://uploads.github.com/repos/rashmirai21/rrai/releases/37725312/assets{?name,label}",
              "html_url": "https://github.com/rashmirai21/rrai/releases/tag/v1.0.0",
              "id": 37725312,
              "author": {
                "login": "rashmirai21",
                "id": 73386090,
                "node_id": "MDQ6VXNlcjczMzg2MDkw",
                "avatar_url": "https://avatars.githubusercontent.com/u/73386090?v=4",
                "gravatar_id": "",
                "url": "https://api.github.com/users/rashmirai21",
                "html_url": "https://github.com/rashmirai21",
                "followers_url": "https://api.github.com/users/rashmirai21/followers",
                "following_url": "https://api.github.com/users/rashmirai21/following{/other_user}",
                "gists_url": "https://api.github.com/users/rashmirai21/gists{/gist_id}",
                "starred_url": "https://api.github.com/users/rashmirai21/starred{/owner}{/repo}",
                "subscriptions_url": "https://api.github.com/users/rashmirai21/subscriptions",
                "organizations_url": "https://api.github.com/users/rashmirai21/orgs",
                "repos_url": "https://api.github.com/users/rashmirai21/repos",
                "events_url": "https://api.github.com/users/rashmirai21/events{/privacy}",
                "received_events_url": "https://api.github.com/users/rashmirai21/received_events",
                "type": "User",
                "site_admin": false
              },
              "node_id": "MDc6UmVsZWFzZTM3NzI1MzEy",
              "tag_name": "v1.0.0",
              "target_commitish": "release-candidate",
              "name": "test",
              "draft": false,
              "prerelease": false,
              "created_at": "2021-02-08T07:53:48Z",
              "published_at": "2021-02-08T07:59:29Z",
              "assets": [
          
              ],
              "tarball_url": "https://api.github.com/repos/rashmirai21/rrai/tarball/v1.0.0",
              "zipball_url": "https://api.github.com/repos/rashmirai21/rrai/zipball/v1.0.0",
              "body": "Loading\r\n![loading](https://user-images.githubusercontent.com/73386090/107190975-8ac3ad00-6a11-11eb-8a5c-3e1f300bd788.gif)\r\n\r\nhttps://user-images.githubusercontent.com/73386090/107191053-a62eb800-6a11-11eb-9103-a321b4e2b8d1.mov\r\n\r\n\r\n<img width=\"1440\" alt=\"sso\" src=\"https://user-images.githubusercontent.com/73386090/107191029-9f07aa00-6a11-11eb-912e-d92f5832eb7f.png\">\r\n"
            }
          ])
    })
}

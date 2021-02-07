export function getGitOpsConfigurationList(): Promise<{
  code: number,
  status: string;
  result:[
      {
        id: number,
        provider: string,
        host: string,
        token:  string,
        username: string ,
        active: boolean,
        gitLabGroupId: string,
        gitHUbOrgId: string
      }
      ]}[]>{
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
            {
              code: 200,
              status: "OK",
              result: [
                  { 
                      id: 1,
                      provider: "Gitlab/Github",
                      username: "devtron",
                      token: "abdgdgdg",
                      gitLabGroupId: "10001",
                      gitHUbOrgId:"234",
                      host: "http://github.com",
                      active: true
                  }
              ]
                
            }
        ])
      }, 1000)
    })
  }
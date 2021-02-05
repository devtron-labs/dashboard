export function getGitOpsConfigurationList(): Promise<{
  code: number,
  status: string;
  result:[
      {
        orgOrGroupId: string,
        id: number,
        provider: string,
        host: string,
        token:  string,
        username: string ,
        active: boolean,}
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
                      orgOrGroupId: "10001",
                      host: "http://github.com",
                      active: true
                  }
              ]
                
            }
        ])
      }, 1000)
    })
  }
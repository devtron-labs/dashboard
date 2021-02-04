export function getGitOpsConfigurationList(): Promise<{
    id: string,
    url: string,
    customGitOpsState: {
        password: { value: string, error: string }, 
        username: { value: string, error: string },
    },
  }[]> {
    return new Promise((resolve, reject) => {
      setTimeout((id ,tab) => {
        resolve([
            {
                id: 'gitLab',
                url: 'GitLab.com',
                customGitOpsState: {
                    password: { value: '2783yebgdi7' ,error: 'no errpr' }, 
                    username: { value: 'shivani', error: 'yes' },
                },
            },
        ])
      }, 1000)
    })
  }
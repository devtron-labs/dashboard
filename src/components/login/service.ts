export default function getLoginList(): Promise<{
      id: number;
      name: string;
      label: string;
      iconClass: string;
     
    }[]> {
      return new Promise((resolve, reject) => {
        setTimeout((id ,tab) => {
    
          resolve([
            {   
                id: 1,
                name: "google",
                label: "Login with Google",
                iconClass: "login-google",
             }
          ]
          )
        }, 1000)
      })}
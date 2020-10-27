# Main Components #
* SecretForm
* Secret

## SecretForm ##
* main component responsible for save and update secret

## Save or Update Secret Payload ##
```
{
    id: number;
    appId: number;
    configData: {
        name: string;
        type: "environment" | "volume";
        mountPath: string;
        external: boolean;
        externalType: string;
        data?: Map<string, string>; 
   }
}
```
* mountpath = "" if type = "environment"
 
 
 ### or ###
```
{
    id: number;
    appId: number;
    configData: {
        name: string;
        roleARN?: string;
        type: "environment" | "volume";
        external: boolean;
        mountPath: string;
        externalType: string;
        secretData?: {
            key: string; 
            name:string; 
            property?: string; 
            isBinary: boolean;
        }[];
    }
}
```

* ? fields are optional


## Misc ##
* used `KeyValueInput` form data
* used `KeyValueFileInput` for secretData
* `secretDataYaml` is yaml format of secretData
* `secretData` is used for rendering parameter 
* `handleSecretDataChange` handles change in secretData, converts to YAML
* NOTE: 'fileName' in secretData will be mapped to 'key' in secreDataYaml
 


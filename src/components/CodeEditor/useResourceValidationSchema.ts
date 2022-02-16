import { useEffect } from 'react';

function useResourceValidationSchema(yaml: any, validatorSchema ,isKubernetes: boolean = true){
    useEffect(() => {
        if (!validatorSchema) return;
        yaml &&
            yaml.yamlDefaults.setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                hover: true,
                completion: true,
                isKubernetes: isKubernetes,
                format: true,
                schemas:[
                    {
                        uri: 'https://devtron.ai/schema.json', // id of the first schema
                        fileMatch: ['*'], // associate with our model
                        schema: validatorSchema,
                    }]
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [validatorSchema]);
}

export default useResourceValidationSchema;

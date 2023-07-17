#!/bin/bash
if [ $# -ge 1 ]
then
    ENV=$1
    if [[ $ENV != "dev" ]] && [[ $ENV != "staging" ]] && [[ $ENV != "production" ]]; 
    then
        echo -e "INVALID ENVIRONMENT!"
        echo "Suported: dev, staging, production"
        exit -1;
    fi
else
    echo "Environment not supplied!";
    exit -1;
fi

aws codebuild update-project --cli-input-json file://configs/config-${ENV}.json --profile apillon
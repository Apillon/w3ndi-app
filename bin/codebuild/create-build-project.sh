aws codebuild create-project --cli-input-json file://config-dev.json --profile apillon
aws codebuild create-webhook --cli-input-json file://webhook-dev.json --profile apillon

aws codebuild create-project --cli-input-json file://config-staging.json --profile apillon
aws codebuild create-webhook --cli-input-json file://webhook-staging.json --profile apillon

aws codebuild create-project --cli-input-json file://config-production.json --profile apillon
aws codebuild create-webhook --cli-input-json file://webhook-production.json --profile apillon
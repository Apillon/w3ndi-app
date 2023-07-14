aws codebuild update-project --cli-input-json file://config-dev.json --profile apillon
aws codebuild update-project --cli-input-json file://config-staging.json --profile apillon
aws codebuild update-project --cli-input-json file://config-production.json --profile apillon

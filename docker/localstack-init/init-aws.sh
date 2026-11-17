#!/bin/bash
# LocalStack initialization script for local development

echo "Initializing LocalStack AWS resources for Pharma Cold Track..."

export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Create DynamoDB tables
awslocal dynamodb create-table \
    --table-name dev-excursions \
    --attribute-definitions AttributeName=excursion_id,AttributeType=S AttributeName=timestamp,AttributeType=N \
    --key-schema AttributeName=excursion_id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
    --billing-mode PAY_PER_REQUEST

# Create SNS Topics
awslocal sns create-topic --name dev-critical-alerts
awslocal sns create-topic --name dev-excursion-alerts

# Create S3 Buckets
awslocal s3 mb s3://dev-pharma-audit-logs
awslocal s3 mb s3://dev-pharma-iot-errors

echo "LocalStack initialization completed successfully!"
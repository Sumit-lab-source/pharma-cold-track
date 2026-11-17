#!/bin/bash
# Pharma Cold Track - Infrastructure Deployment Script
# Deploys Terraform modules in correct dependency order

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="/Users/sumitsaurav/pharma-cold-track"
INFRA_DIR="${PROJECT_ROOT}/infra"
TERRAFORM_VERSION="1.17.1"
AWS_REGION="${AWS_REGION:-us-east-1}"
ENVIRONMENT="${ENVIRONMENT:-dev}"
ACCOUNT_ID="${ACCOUNT_ID:-}"

# Module deployment order (dependencies: kms -> vpc -> dynamodb -> iot -> iam)
MODULES=("kms" "vpc" "dynamodb" "iot" "iam")

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."

    # Check Terraform
    if ! command -v terraform &> /dev/null; then
        log_error "Terraform not found. Installing..."
        brew tap hashicorp/tap && brew install hashicorp/tap/terraform
    fi

    # Check AWS CLI
    if ! command -v aws &> /dev/null; then
        log_error "AWS CLI not found. Please install AWS CLI v2."
        exit 1
    fi

    # Check AWS credentials
    if ! aws sts get-caller-identity &> /dev/null; then
        log_error "AWS credentials not configured. Run 'aws configure' or set up IAM role."
        exit 1
    fi

    # Get account ID if not provided
    if [[ -z "$ACCOUNT_ID" ]]; then
        ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
        log_info "Using AWS Account ID: $ACCOUNT_ID"
    fi

    # Verify Terraform version
    local tf_version=$(terraform version -json | jq -r '.terraform_version')
    log_info "Terraform version: $tf_version"

    log_success "Prerequisites check passed"
}

# Create S3 backend bucket and DynamoDB lock table
setup_backend() {
    log_info "Setting up Terraform backend..."

    local bucket_name="pharma-cold-track-terraform-state"
    local table_name="terraform-locks"

    # Create S3 bucket
    if ! aws s3 ls "s3://$bucket_name" 2>&1 | grep -q 'NoSuchBucket'; then
        log_info "S3 bucket $bucket_name already exists"
    else
        log_info "Creating S3 bucket: $bucket_name"
        aws s3 mb "s3://$bucket_name" --region "$AWS_REGION"
        aws s3api put-bucket-versioning --bucket "$bucket_name" --versioning-configuration Status=Enabled
        aws s3api put-bucket-encryption --bucket "$bucket_name" --server-side-encryption-configuration '{
            "Rules": [{"ApplyServerSideEncryptionByDefault": {"SSEAlgorithm": "AES256"}}]
        }'
        aws s3api put-public-access-block --bucket "$bucket_name" --public-access-block-configuration \
            BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
        log_success "S3 bucket created with encryption and versioning"
    fi

    # Create DynamoDB lock table
    if aws dynamodb describe-table --table-name "$table_name" --region "$AWS_REGION" &> /dev/null; then
        log_info "DynamoDB table $table_name already exists"
    else
        log_info "Creating DynamoDB lock table: $table_name"
        aws dynamodb create-table \
            --table-name "$table_name" \
            --attribute-definitions AttributeName=LockID,AttributeType=S \
            --key-schema AttributeName=LockID,KeyType=HASH \
            --billing-mode PAY_PER_REQUEST \
            --region "$AWS_REGION" \
            --tags Key=Project,Value=pharma-cold-track Key=Environment,Value="$ENVIRONMENT"
        aws dynamodb wait table-exists --table-name "$table_name" --region "$AWS_REGION"
        log_success "DynamoDB lock table created"
    fi
}

# Uncomment backend blocks in Terraform files
enable_backend() {
    log_info "Enabling Terraform backend configuration..."

    for module in "${MODULES[@]}"; do
        local tf_file="${INFRA_DIR}/${module}/main.tf"
        if [[ -f "$tf_file" ]]; then
            # Uncomment backend block
            sed -i '' 's|# backend "s3" {|backend "s3" {|' "$tf_file"
            sed -i '' 's|#   bucket         = "pharma-cold-track-terraform-state"|  bucket         = "pharma-cold-track-terraform-state"|' "$tf_file"
            sed -i '' "s|#   key            = \"infrastructure/${module}/terraform.tfstate\"|  key            = \"infrastructure/${module}/terraform.tfstate\"|" "$tf_file"
            sed -i '' "s|#   region         = \"us-east-1\"|  region         = \"${AWS_REGION}\"|" "$tf_file"
            sed -i '' 's|#   encrypt        = true|  encrypt        = true|' "$tf_file"
            sed -i '' 's|#   dynamodb_table = "terraform-locks"|  dynamodb_table = "terraform-locks"|' "$tf_file"
            sed -i '' 's|#   use_lockfile   = true|  use_lockfile   = true|' "$tf_file"
            sed -i '' 's|# }|}|' "$tf_file"
            log_info "Enabled backend for $module"
        fi
    done
}

# Deploy a single module
deploy_module() {
    local module=$1
    local module_dir="${INFRA_DIR}/${module}"

    log_info "Deploying module: $module"

    cd "$module_dir"

    # Initialize
    log_info "Initializing Terraform for $module..."
    terraform init -upgrade

    # Plan
    log_info "Planning $module..."
    terraform plan \
        -var "aws_region=$AWS_REGION" \
        -var "secondary_region=us-west-2" \
        -var "environment=$ENVIRONMENT" \
        -var "account_id=$ACCOUNT_ID" \
        -out="tfplan-${module}.out"

    # Apply
    log_info "Applying $module..."
    terraform apply "tfplan-${module}.out"

    log_success "Module $module deployed successfully"
}

# Package Lambda function
package_lambda() {
    log_info "Packaging Lambda function..."

    local lambda_dir="${PROJECT_ROOT}/services/iot-processor"
    local zip_file="${lambda_dir}/excursion_processor.zip"

    cd "$lambda_dir"

    # Install dependencies if requirements.txt exists
    if [[ -f "requirements.txt" ]]; then
        log_info "Installing Python dependencies..."
        pip install -r requirements.txt -t package/
        cd package
        zip -r "../excursion_processor.zip" .
        cd ..
    else
        zip -r "$zip_file" excursion_processor.py
    fi

    log_success "Lambda packaged: $zip_file"
}

# Main deployment flow
main() {
    log_info "=== Pharma Cold Track Infrastructure Deployment ==="
    log_info "Environment: $ENVIRONMENT"
    log_info "AWS Region: $AWS_REGION"
    log_info "Account ID: $ACCOUNT_ID"
    echo

    check_prerequisites
    setup_backend
    enable_backend
    package_lambda

    log_info "Starting module deployment in order..."
    for module in "${MODULES[@]}"; do
        deploy_module "$module"
    done

    log_success "=== All infrastructure deployed successfully! ==="
    log_info "Next steps:"
    log_info "1. Configure AppSync GraphQL API"
    log_info "2. Set up Cognito User Pool with MFA"
    log_info "3. Configure S3 Object Lock for audit logs"
    log_info "4. Set up GitHub Actions CI/CD"
    log_info "5. Run end-to-end integration tests"
}

# Handle script arguments
case "${1:-}" in
    plan)
        check_prerequisites
        enable_backend
        for module in "${MODULES[@]}"; do
            cd "${INFRA_DIR}/${module}"
            terraform plan \
                -var "aws_region=$AWS_REGION" \
                -var "secondary_region=us-west-2" \
                -var "environment=$ENVIRONMENT" \
                -var "account_id=$ACCOUNT_ID"
        done
        ;;
    destroy)
        log_warning "Destroying infrastructure in reverse order..."
        for module in $(printf '%s\n' "${MODULES[@]}" | tac); do
            cd "${INFRA_DIR}/${module}"
            terraform destroy \
                -var "aws_region=$AWS_REGION" \
                -var "secondary_region=us-west-2" \
                -var "environment=$ENVIRONMENT" \
                -var "account_id=$ACCOUNT_ID"
        done
        ;;
    *)
        main
        ;;
esac
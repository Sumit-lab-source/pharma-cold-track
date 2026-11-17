# Pharma Cold Track - IAM Infrastructure
# Centralized IAM management for service roles, users, and compliance access
# Ensures Principle of Least Privilege (PoLP) and GxP auditability

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Backend configuration - comment out for local development
  # Uncomment and configure bucket/key for production
  # backend "s3" {
  #   bucket         = "pharma-cold-track-terraform-state"
  #   key            = "infrastructure/iam/terraform.tfstate"
  #   region         = "us-east-1"
  #   encrypt        = true
  #   dynamodb_table = "terraform-locks"
  #   use_lockfile   = true
  # }
}

provider "aws" {
  region = var.aws_region
  default_tags {
    tags = {
      Project     = "pharma-cold-track"
      Environment = var.environment
      Compliance  = "GxP"
      Component   = "iam"
    }
  }
}

# ---------------------------------------------------------
# Variables
# ---------------------------------------------------------
variable "aws_region" {
  description = "AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}

# ---------------------------------------------------------
# 1. API GATEWAY ROLE - For AppSync/API calls
# ---------------------------------------------------------
resource "aws_iam_role" "api_gateway_role" {
  name = "${var.environment}-api-gateway-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "appsync.amazonaws.com" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "api_gateway_policy" {
  name = "${var.environment}-api-gateway-policy"
  role = aws_iam_role.api_gateway_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = ["dynamodb:Query", "dynamodb:GetItem", "dynamodb:BatchGetItem"]
        Resource = ["arn:aws:dynamodb:${var.aws_region}:*:table/${var.environment}-*"]
      },
      {
        Effect = "Allow"
        Action = ["lambda:InvokeFunction"]
        Resource = ["arn:aws:lambda:${var.aws_region}:*:function:${var.environment}-*"]
      }
    ]
  })
}

# ---------------------------------------------------------
# 2. AUDIT COMPLIANCE ROLE - Read-only restricted access
# For regulatory auditors (requires MFA)
# ---------------------------------------------------------
resource "aws_iam_role" "compliance_auditor" {
  name = "ComplianceAuditRole"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { AWS = "arn:aws:iam::${var.account_id}:root" }
      Action = "sts:AssumeRole"
      Condition = {
        Bool = { "aws:MultiFactorAuthPresent": "true" }
      }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "compliance_read_only" {
  role       = aws_iam_role.compliance_auditor.name
  policy_arn = "arn:aws:iam::aws:policy/ReadOnlyAccess"
}

# ---------------------------------------------------------
# 3. ECS/LAMBDA TASK EXECUTION ROLES
# Generic execution roles for backend compute
# ---------------------------------------------------------
resource "aws_iam_role" "backend_execution" {
  name = "${var.environment}-backend-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = ["lambda.amazonaws.com", "ecs-tasks.amazonaws.com"] }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "backend_execution_logs" {
  role       = aws_iam_role.backend_execution.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

variable "account_id" { type = string }

output "api_gateway_role_arn" { value = aws_iam_role.api_gateway_role.arn }
output "compliance_auditor_role_arn" { value = aws_iam_role.compliance_auditor.arn }

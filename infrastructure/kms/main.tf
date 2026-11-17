# Pharma Cold Track - KMS Infrastructure
# Customer Managed Keys (CMK) for all encryption at rest
# Automatic key rotation, key policies for least privilege access

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
  #   key            = "infrastructure/kms/terraform.tfstate"
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
      Component   = "kms"
    }
  }
}

provider "aws" {
  alias  = "secondary"
  region = var.secondary_region
  default_tags {
    tags = {
      Project     = "pharma-cold-track"
      Environment = var.environment
      Compliance  = "GxP"
      Component   = "kms"
    }
  }
}

# ---------------------------------------------------------
# Variables
# ---------------------------------------------------------
variable "aws_region" {
  description = "Primary AWS Region"
  type        = string
  default     = "us-east-1"
}

variable "secondary_region" {
  description = "Secondary AWS Region for multi-region keys"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "account_id" {
  description = "AWS Account ID"
  type        = string
}

# ---------------------------------------------------------
# Data Sources
# ---------------------------------------------------------
data "aws_caller_identity" "current" {}
data "aws_iam_policy_document" "kms_key_policy" {}
data "aws_partition" "current" {}

# ---------------------------------------------------------
# 1. PRIMARY KMS KEY - Application Data Encryption
# Used by DynamoDB, S3, Kinesis, Lambda env vars, Secrets Manager
# ---------------------------------------------------------
resource "aws_kms_key" "primary" {
  description             = "${var.environment} Pharma Cold Track Primary Encryption Key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  multi_region            = true
  key_usage               = "ENCRYPT_DECRYPT"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  policy                  = data.aws_iam_policy_document.primary_kms_policy.json

  tags = {
    Name        = "${var.environment}-pharma-primary-key"
    Purpose     = "application-data-encryption"
    Compliance  = "GxP-21CFR11"
    Rotation    = "annual"
  }
}

resource "aws_kms_replica_key" "primary_secondary" {
  provider                 = aws.secondary
  primary_key_arn          = aws_kms_key.primary.arn
  description              = "${var.environment} Pharma Cold Track Primary Encryption Key (Replica)"
  deletion_window_in_days  = 30
  policy                   = data.aws_iam_policy_document.primary_kms_policy.json
}

# Primary Key Policy - Least Privilege
data "aws_iam_policy_document" "primary_kms_policy" {
  statement {
    sid    = "AllowRootAdminAccess"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:${data.aws_partition.current.partition}:iam::${var.account_id}:root"]
    }
    actions = ["kms:*"]
    resources = ["*"]
  }

  statement {
    sid    = "AllowDynamoDBServiceAccess"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["dynamodb.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:dynamodb:tableName"
      values   = [
        "${var.environment}-telemetry",
        "${var.environment}-excursions",
        "${var.environment}-shipments",
        "${var.environment}-devices",
        "${var.environment}-audit-logs",
        "${var.environment}-compliance-reports",
        "${var.environment}-user-profiles"
      ]
    }
  }

  statement {
    sid    = "AllowS3ServiceAccess"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["s3.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:s3:arn"
      values   = [
        "arn:${data.aws_partition.current.partition}:s3:::${var.environment}-pharma-audit-logs-*",
        "arn:${data.aws_partition.current.partition}:s3:::${var.environment}-pharma-iot-errors-*",
        "arn:${data.aws_partition.current.partition}:s3:::${var.environment}-pharma-reports-*"
      ]
    }
  }

  statement {
    sid    = "AllowKinesisServiceAccess"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["kinesis.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:kinesis:streamName"
      values   = [
        "${var.environment}-telemetry-stream",
        "${var.environment}-device-status-stream"
      ]
    }
  }

  statement {
    sid    = "AllowLambdaServiceAccess"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:lambda:functionName"
      values   = [
        "${var.environment}-excursion-processor",
        "${var.environment}-telemetry-aggregator",
        "${var.environment}-compliance-report-generator"
      ]
    }
  }

  statement {
    sid    = "AllowCloudWatchLogsAccess"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["logs.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:logs:arn"
      values   = [
        "arn:${data.aws_partition.current.partition}:logs:${var.aws_region}:${var.account_id}:log-group:/aws/lambda/${var.environment}-*:*",
        "arn:${data.aws_partition.current.partition}:logs:${var.aws_region}:${var.account_id}:log-group:/aws/iot/${var.environment}-*:*",
        "arn:${data.aws_partition.current.partition}:logs:${var.aws_region}:${var.account_id}:log-group:/aws/vpc/${var.environment}-*:*"
      ]
    }
  }

  statement {
    sid    = "AllowSecretsManagerAccess"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["secretsmanager.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:secretsmanager:arn"
      values   = [
        "arn:${data.aws_partition.current.partition}:secretsmanager:${var.aws_region}:${var.account_id}:secret:${var.environment}-pharma-*"
      ]
    }
  }

  statement {
    sid    = "AllowBackupServiceAccess"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["backup.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:Decrypt",
      "kms:Encrypt",
      "kms:GenerateDataKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:backup:resourceArn"
      values   = [
        "arn:${data.aws_partition.current.partition}:dynamodb:${var.aws_region}:${var.account_id}:table/${var.environment}-*"
      ]
    }
  }
}

# ---------------------------------------------------------
# 2. AUDIT LOG KEY - Separate key for immutable audit trail
# Stricter policy, no admin decrypt without MFA
# ---------------------------------------------------------
resource "aws_kms_key" "audit_logs" {
  description             = "${var.environment} Pharma Cold Track Audit Logs Key (Immutable)"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  multi_region            = true
  key_usage               = "ENCRYPT_DECRYPT"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  policy                  = data.aws_iam_policy_document.audit_kms_policy.json

  tags = {
    Name        = "${var.environment}-pharma-audit-logs-key"
    Purpose     = "audit-log-encryption"
    Compliance  = "GxP-21CFR11-Immutable"
    Rotation    = "annual"
  }
}

resource "aws_kms_replica_key" "audit_logs_secondary" {
  provider                 = aws.secondary
  primary_key_arn          = aws_kms_key.audit_logs.arn
  description              = "${var.environment} Pharma Cold Track Audit Logs Key (Replica)"
  deletion_window_in_days  = 30
  policy                   = data.aws_iam_policy_document.audit_kms_policy.json
}

data "aws_iam_policy_document" "audit_kms_policy" {
  statement {
    sid    = "AllowRootAdminAccess"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:${data.aws_partition.current.partition}:iam::${var.account_id}:root"]
    }
    actions = ["kms:*"]
    resources = ["*"]
    condition {
      test     = "Bool"
      variable = "aws:MultiFactorAuthPresent"
      values   = ["true"]
    }
  }

  statement {
    sid    = "AllowAuditWriteOnly"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [
        "arn:${data.aws_partition.current.partition}:iam::${var.account_id}:role/${var.environment}-lambda-*",
        "arn:${data.aws_partition.current.partition}:iam::${var.account_id}:role/${var.environment}-ecs-*"
      ]
    }
    actions = [
      "kms:Encrypt",
      "kms:GenerateDataKey",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:dynamodb:tableName"
      values   = ["${var.environment}-audit-logs"]
    }
  }

  statement {
    sid    = "AllowAuditReadCompliance"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = [
        "arn:${data.aws_partition.current.partition}:iam::${var.account_id}:role/ComplianceAuditRole",
        "arn:${data.aws_partition.current.partition}:iam::${var.account_id}:role/SecurityAuditRole"
      ]
    }
    actions = [
      "kms:Decrypt",
      "kms:ReEncryptFrom",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "Bool"
      variable = "aws:MultiFactorAuthPresent"
      values   = ["true"]
    }
  }

  statement {
    sid    = "AllowS3AuditAccess"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["s3.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:aws:s3:arn"
      values   = ["arn:${data.aws_partition.current.partition}:s3:::${var.environment}-pharma-audit-logs-*"]
    }
  }

  statement {
    sid    = "DenyKeyDeletion"
    effect = "Deny"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions = [
      "kms:ScheduleKeyDeletion",
      "kms:DisableKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringNotEquals"
      variable = "aws:PrincipalArn"
      values   = ["arn:${data.aws_partition.current.partition}:iam::${var.account_id}:root"]
    }
  }
}

# ---------------------------------------------------------
# 3. PII/PHI KEY - For any patient/customer identifiable data
# Extra restrictions, separate from operational data
# ---------------------------------------------------------
resource "aws_kms_key" "pii" {
  description             = "${var.environment} Pharma Cold Track PII/PHI Encryption Key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  multi_region            = true
  key_usage               = "ENCRYPT_DECRYPT"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  policy                  = data.aws_iam_policy_document.pii_kms_policy.json

  tags = {
    Name        = "${var.environment}-pharma-pii-key"
    Purpose     = "pii-phi-encryption"
    Compliance  = "HIPAA-GDPR"
    Rotation    = "annual"
  }
}

resource "aws_kms_replica_key" "pii_secondary" {
  provider                 = aws.secondary
  primary_key_arn          = aws_kms_key.pii.arn
  description              = "${var.environment} Pharma Cold Track PII/PHI Key (Replica)"
  deletion_window_in_days  = 30
  policy                   = data.aws_iam_policy_document.pii_kms_policy.json
}

data "aws_iam_policy_document" "pii_kms_policy" {
  statement {
    sid    = "AllowRootAdminAccess"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:${data.aws_partition.current.partition}:iam::${var.account_id}:root"]
    }
    actions = ["kms:*"]
    resources = ["*"]
    condition {
      test     = "Bool"
      variable = "aws:MultiFactorAuthPresent"
      values   = ["true"]
    }
  }

  statement {
    sid    = "AllowPIISpecificServices"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = [
        "dynamodb.${var.aws_region}.amazonaws.com",
        "s3.${var.aws_region}.amazonaws.com",
        "lambda.${var.aws_region}.amazonaws.com"
      ]
    }
    actions = [
      "kms:Encrypt",
      "kms:Decrypt",
      "kms:ReEncrypt*",
      "kms:GenerateDataKey*",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "kms:EncryptionContext:Purpose"
      values   = ["PII", "PHI", "PatientData"]
    }
  }

  statement {
    sid    = "DenyAllOtherAccess"
    effect = "Deny"
    principals {
      type        = "AWS"
      identifiers = ["*"]
    }
    actions = ["kms:*"]
    resources = ["*"]
    condition {
      test     = "StringNotEquals"
      variable = "kms:EncryptionContext:Purpose"
      values   = ["PII", "PHI", "PatientData"]
    }
  }
}

# ---------------------------------------------------------
# 4. CLOUDTRAIL KEY - For CloudTrail log encryption
# ---------------------------------------------------------
resource "aws_kms_key" "cloudtrail" {
  description             = "${var.environment} Pharma Cold Track CloudTrail Key"
  deletion_window_in_days = 30
  enable_key_rotation     = true
  multi_region            = false # CloudTrail requires single-region key for log encryption
  key_usage               = "ENCRYPT_DECRYPT"
  customer_master_key_spec = "SYMMETRIC_DEFAULT"
  policy                  = data.aws_iam_policy_document.cloudtrail_kms_policy.json

  tags = {
    Name        = "${var.environment}-pharma-cloudtrail-key"
    Purpose     = "cloudtrail-encryption"
    Compliance  = "GxP-Audit"
  }
}

data "aws_iam_policy_document" "cloudtrail_kms_policy" {
  statement {
    sid    = "AllowRootAdminAccess"
    effect = "Allow"
    principals {
      type        = "AWS"
      identifiers = ["arn:${data.aws_partition.current.partition}:iam::${var.account_id}:root"]
    }
    actions = ["kms:*"]
    resources = ["*"]
  }

  statement {
    sid    = "AllowCloudTrailService"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.${var.aws_region}.amazonaws.com"]
    }
    actions = [
      "kms:GenerateDataKey*",
      "kms:Encrypt",
      "kms:DescribeKey"
    ]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:SourceArn"
      values   = ["arn:${data.aws_partition.current.partition}:cloudtrail:${var.aws_region}:${var.account_id}:trail/${var.environment}-pharma-*"]
    }
  }

  statement {
    sid    = "AllowCloudTrailDecrypt"
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["cloudtrail.${var.aws_region}.amazonaws.com"]
    }
    actions = ["kms:Decrypt"]
    resources = ["*"]
  }
}

# ---------------------------------------------------------
# 5. ALIASES for easier reference
# ---------------------------------------------------------
resource "aws_kms_alias" "primary" {
  name          = "alias/${var.environment}-pharma-primary"
  target_key_id = aws_kms_key.primary.key_id
}

resource "aws_kms_alias" "audit_logs" {
  name          = "alias/${var.environment}-pharma-audit-logs"
  target_key_id = aws_kms_key.audit_logs.key_id
}

resource "aws_kms_alias" "pii" {
  name          = "alias/${var.environment}-pharma-pii"
  target_key_id = aws_kms_key.pii.key_id
}

resource "aws_kms_alias" "cloudtrail" {
  name          = "alias/${var.environment}-pharma-cloudtrail"
  target_key_id = aws_kms_key.cloudtrail.key_id
}

# ---------------------------------------------------------
# 6. GRANTS for cross-account/service access (if needed)
# ---------------------------------------------------------
# Example: Grant for cross-account audit access
# resource "aws_kms_grant" "audit_cross_account" {
#   key_id     = aws_kms_key.audit_logs.key_id
#   grantee_principal = "arn:aws:iam::AUDIT_ACCOUNT_ID:role/ComplianceAuditor"
#   operations = ["Decrypt", "ReEncryptFrom", "DescribeKey"]
#   constraints {
#     encryption_context_equals = {
#       "aws:dynamodb:tableName" = "${var.environment}-audit-logs"
#     }
#   }
# }

# ---------------------------------------------------------
# Outputs
# ---------------------------------------------------------
output "primary_key_id" {
  value       = aws_kms_key.primary.key_id
  description = "Primary KMS Key ID"
}

output "primary_key_arn" {
  value       = aws_kms_key.primary.arn
  description = "Primary KMS Key ARN"
}

output "primary_key_arn_secondary" {
  value       = aws_kms_replica_key.primary_secondary.arn
  description = "Primary KMS Key ARN (Secondary Region)"
}

output "audit_logs_key_id" {
  value       = aws_kms_key.audit_logs.key_id
  description = "Audit Logs KMS Key ID"
}

output "audit_logs_key_arn" {
  value       = aws_kms_key.audit_logs.arn
  description = "Audit Logs KMS Key ARN"
}

output "audit_logs_key_arn_secondary" {
  value       = aws_kms_replica_key.audit_logs_secondary.arn
  description = "Audit Logs KMS Key ARN (Secondary Region)"
}

output "pii_key_id" {
  value       = aws_kms_key.pii.key_id
  description = "PII/PHI KMS Key ID"
}

output "pii_key_arn" {
  value       = aws_kms_key.pii.arn
  description = "PII/PHI KMS Key ARN"
}

output "pii_key_arn_secondary" {
  value       = aws_kms_replica_key.pii_secondary.arn
  description = "PII/PHI KMS Key ARN (Secondary Region)"
}

output "cloudtrail_key_id" {
  value       = aws_kms_key.cloudtrail.key_id
  description = "CloudTrail KMS Key ID"
}

output "cloudtrail_key_arn" {
  value       = aws_kms_key.cloudtrail.arn
  description = "CloudTrail KMS Key ARN"
}
# Pharma Cold Track - DynamoDB Infrastructure
# Tables for real-time telemetry, excursions, audit logs, and compliance records
# Uses Global Tables for multi-region active-active HA and PITR for backup

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
  #   key            = "infrastructure/dynamodb/terraform.tfstate"
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
      Component   = "dynamodb"
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
      Component   = "dynamodb"
      Replication = "secondary"
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
  description = "Secondary AWS Region for Global Tables"
  type        = string
  default     = "us-west-2"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "kms_key_arn" {
  description = "KMS Key ARN for encryption at rest"
  type        = string
}

variable "kms_key_arn_secondary" {
  description = "KMS Key ARN for encryption at rest in secondary region"
  type        = string
}

# ---------------------------------------------------------
# 1. TELEMETRY TABLE - Real-time sensor data
# High write throughput, TTL for auto-expiry of raw telemetry
# ---------------------------------------------------------
resource "aws_dynamodb_table" "telemetry" {
  name           = "${var.environment}-telemetry"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "device_id"
  range_key      = "timestamp"

  attribute {
    name = "device_id"
    type = "S"
  }
  attribute {
    name = "timestamp"
    type = "N"
  }
  attribute {
    name = "shipment_id"
    type = "S"
  }
  attribute {
    name = "gps_geohash"
    type = "S"
  }

  # GSI for querying by shipment
  global_secondary_index {
    name            = "shipment-timestamp-index"
    hash_key        = "shipment_id"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # GSI for geospatial queries (nearby trucks)
  global_secondary_index {
    name            = "geohash-timestamp-index"
    hash_key        = "gps_geohash"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # TTL for raw telemetry (keep 30 days, then move to S3)
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  replica {
    region_name = var.secondary_region
    kms_key_arn = var.kms_key_arn_secondary
  }
}

# ---------------------------------------------------------
# 2. EXCURSIONS TABLE - Temperature deviation records
# Immutable audit trail for regulatory compliance
# ---------------------------------------------------------
resource "aws_dynamodb_table" "excursions" {
  name           = "${var.environment}-excursions"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "excursion_id"
  range_key      = "timestamp"

  attribute {
    name = "excursion_id"
    type = "S"
  }
  attribute {
    name = "timestamp"
    type = "N"
  }
  attribute {
    name = "device_id"
    type = "S"
  }
  attribute {
    name = "shipment_id"
    type = "S"
  }
  attribute {
    name = "severity"
    type = "S"
  }
  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "device-timestamp-index"
    hash_key        = "device_id"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "shipment-timestamp-index"
    hash_key        = "shipment_id"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "severity-status-index"
    hash_key        = "severity"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "status-timestamp-index"
    hash_key        = "status"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # NO TTL - Excursions are permanent audit records (7-10 year retention)
  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  replica {
    region_name = var.secondary_region
    kms_key_arn = var.kms_key_arn_secondary
  }
}

# ---------------------------------------------------------
# 3. SHIPMENTS TABLE - Active shipment tracking
# Links devices, routes, products, and compliance requirements
# ---------------------------------------------------------
resource "aws_dynamodb_table" "shipments" {
  name           = "${var.environment}-shipments"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "shipment_id"

  attribute {
    name = "shipment_id"
    type = "S"
  }
  attribute {
    name = "status"
    type = "S"
  }
  attribute {
    name = "customer_id"
    type = "S"
  }
  attribute {
    name = "departure_timestamp"
    type = "N"
  }

  global_secondary_index {
    name            = "status-timestamp-index"
    hash_key        = "status"
    range_key       = "departure_timestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "customer-timestamp-index"
    hash_key        = "customer_id"
    range_key       = "departure_timestamp"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  replica {
    region_name = var.secondary_region
    kms_key_arn = var.kms_key_arn_secondary
  }
}

# ---------------------------------------------------------
# 4. DEVICES TABLE - IoT device registry and metadata
# Device certificates, calibration, maintenance schedules
# ---------------------------------------------------------
resource "aws_dynamodb_table" "devices" {
  name           = "${var.environment}-devices"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "device_id"

  attribute {
    name = "device_id"
    type = "S"
  }
  attribute {
    name = "thing_group"
    type = "S"
  }
  attribute {
    name = "status"
    type = "S"
  }
  attribute {
    name = "calibration_due"
    type = "N"
  }

  global_secondary_index {
    name            = "group-status-index"
    hash_key        = "thing_group"
    range_key       = "status"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "calibration-index"
    hash_key        = "status"
    range_key       = "calibration_due"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  replica {
    region_name = var.secondary_region
    kms_key_arn = var.kms_key_arn_secondary
  }
}

# ---------------------------------------------------------
# 5. AUDIT LOGS TABLE - Immutable system audit trail
# 21 CFR Part 11 compliant - all user/system actions
# ---------------------------------------------------------
resource "aws_dynamodb_table" "audit_logs" {
  name           = "${var.environment}-audit-logs"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "aggregate_id"  # e.g., shipment_id, device_id, user_id
  range_key      = "event_timestamp"

  attribute {
    name = "aggregate_id"
    type = "S"
  }
  attribute {
    name = "event_timestamp"
    type = "N"
  }
  attribute {
    name = "event_type"
    type = "S"
  }
  attribute {
    name = "user_id"
    type = "S"
  }
  attribute {
    name = "correlation_id"
    type = "S"
  }

  global_secondary_index {
    name            = "event-type-index"
    hash_key        = "event_type"
    range_key       = "event_timestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "user-timestamp-index"
    hash_key        = "user_id"
    range_key       = "event_timestamp"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "correlation-index"
    hash_key        = "correlation_id"
    range_key       = "event_timestamp"
    projection_type = "ALL"
  }

  # NO TTL - Audit logs are permanent (10+ years)
  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  replica {
    region_name = var.secondary_region
    kms_key_arn = var.kms_key_arn_secondary
  }
}

# ---------------------------------------------------------
# 6. COMPLIANCE REPORTS TABLE - Generated regulatory reports
# FDA/EMA submission records, deviation reports
# ---------------------------------------------------------
resource "aws_dynamodb_table" "compliance_reports" {
  name           = "${var.environment}-compliance-reports"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "report_id"

  attribute {
    name = "report_id"
    type = "S"
  }
  attribute {
    name = "shipment_id"
    type = "S"
  }
  attribute {
    name = "report_type"
    type = "S"
  }
  attribute {
    name = "generated_at"
    type = "N"
  }
  attribute {
    name = "status"
    type = "S"
  }

  global_secondary_index {
    name            = "shipment-type-index"
    hash_key        = "shipment_id"
    range_key       = "generated_at"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "type-status-index"
    hash_key        = "report_type"
    range_key       = "status"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  replica {
    region_name = var.secondary_region
    kms_key_arn = var.kms_key_arn_secondary
  }
}

# ---------------------------------------------------------
# 7. USERS & RBAC TABLE - Cognito sync + custom attributes
# Role assignments, facility access, delegation records
# ---------------------------------------------------------
resource "aws_dynamodb_table" "user_profiles" {
  name           = "${var.environment}-user-profiles"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "user_id"

  attribute {
    name = "user_id"
    type = "S"
  }
  attribute {
    name = "email"
    type = "S"
  }
  attribute {
    name = "facility_id"
    type = "S"
  }
  attribute {
    name = "role"
    type = "S"
  }

  global_secondary_index {
    name            = "email-index"
    hash_key        = "email"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "facility-role-index"
    hash_key        = "facility_id"
    range_key       = "role"
    projection_type = "ALL"
  }

  server_side_encryption {
    enabled     = true
    kms_key_arn = var.kms_key_arn
  }

  point_in_time_recovery {
    enabled = true
  }

  replica {
    region_name = var.secondary_region
    kms_key_arn = var.kms_key_arn_secondary
  }
}

# ---------------------------------------------------------
# Backup Plans (AWS Backup) - Additional to PITR
# ---------------------------------------------------------
resource "aws_backup_vault" "main" {
  name = "${var.environment}-pharma-backup-vault"
}

resource "aws_backup_plan" "dynamodb_daily" {
  name = "${var.environment}-dynamodb-daily-backup"

  rule {
    rule_name         = "daily-backup-35-day-retention"
    schedule          = "cron(0 2 * * ? *)"  # 2 AM UTC daily
    target_vault_name = aws_backup_vault.main.name
    lifecycle {
      delete_after = 2555 # 7 years
      cold_storage_after = 90
    }
    recovery_point_tags = {
      Environment = var.environment
      Compliance  = "GxP"
      BackupType  = "daily"
    }
  }

  rule {
    rule_name         = "weekly-backup-10-year-retention"
    schedule          = "cron(0 3 ? * SUN *)"  # 3 AM UTC Sundays
    target_vault_name = aws_backup_vault.main.name
    lifecycle {
      delete_after = 3650 # 10 years
      cold_storage_after = 30
    }
    recovery_point_tags = {
      Environment = var.environment
      Compliance  = "GxP"
      BackupType  = "weekly"
    }
  }
}

resource "aws_backup_selection" "dynamodb_tables" {
  name         = "${var.environment}-dynamodb-backup-selection"
  iam_role_arn = aws_iam_role.backup.arn
  plan_id      = aws_backup_plan.dynamodb_daily.id

  selection_tag {
    type  = "STRINGEQUALS"
    key   = "Compliance"
    value = "GxP"
  }
}

resource "aws_iam_role" "backup" {
  name = "${var.environment}-backup-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "backup.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "backup" {
  role = aws_iam_role.backup.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:DescribeTable",
          "dynamodb:Scan",
          "dynamodb:Query",
          "dynamodb:GetItem",
          "dynamodb:BatchGetItem"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey"
        ]
        Resource = [var.kms_key_arn, var.kms_key_arn_secondary]
      }
    ]
  })
}

# ---------------------------------------------------------
# Outputs
# ---------------------------------------------------------
output "table_names" {
  value = {
    telemetry         = aws_dynamodb_table.telemetry.name
    excursions        = aws_dynamodb_table.excursions.name
    shipments         = aws_dynamodb_table.shipments.name
    devices           = aws_dynamodb_table.devices.name
    audit_logs        = aws_dynamodb_table.audit_logs.name
    compliance_reports = aws_dynamodb_table.compliance_reports.name
    user_profiles     = aws_dynamodb_table.user_profiles.name
  }
}

output "table_arns" {
  value = {
    telemetry         = aws_dynamodb_table.telemetry.arn
    excursions        = aws_dynamodb_table.excursions.arn
    shipments         = aws_dynamodb_table.shipments.arn
    devices           = aws_dynamodb_table.devices.arn
    audit_logs        = aws_dynamodb_table.audit_logs.arn
    compliance_reports = aws_dynamodb_table.compliance_reports.arn
    user_profiles     = aws_dynamodb_table.user_profiles.arn
  }
}
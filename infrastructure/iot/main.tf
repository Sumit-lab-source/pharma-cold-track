# Pharma Cold Track - IoT Core Infrastructure
# Manages device provisioning, telemetry ingestion, and rule engine for real-time processing

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
  #   key            = "infrastructure/iot/terraform.tfstate"
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
      Component   = "iot-core"
    }
  }
}

# ---------------------------------------------------------
# Variables
# ---------------------------------------------------------
variable "aws_region" {
  description = "AWS Region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "prod"
}

variable "kms_key_arn" {
  description = "KMS Key ARN for IoT Core encryption"
  type        = string
}

# ---------------------------------------------------------
# IoT Core - Thing Groups (Fleet Organization)
# ---------------------------------------------------------
resource "aws_iot_thing_group" "trucks" {
  name = "${var.environment}-trucks"
  parent_group_name = null

  tags = {
    Environment = var.environment
    FleetType   = "refrigerated-transport"
  }
}

resource "aws_iot_thing_group" "trailers" {
  name = "${var.environment}-trailers"
  parent_group_name = null

  tags = {
    Environment = var.environment
    FleetType   = "reefer-trailers"
  }
}

resource "aws_iot_thing_group" "sensors" {
  name = "${var.environment}-sensors"
  parent_group_name = null

  tags = {
    Environment = var.environment
    DeviceType  = "temperature-sensor"
  }
}

# Dynamic thing group for trucks with active excursions
resource "aws_iot_thing_group" "excursion_alert" {
  name            = "${var.environment}-excursion-alert"
  parent_group_name = null

  tags = {
    Environment = var.environment
    AlertType   = "temperature-excursion"
  }
}

# ---------------------------------------------------------
# IoT Core - Thing Types (Device Definitions)
# ---------------------------------------------------------
resource "aws_iot_thing_type" "truck" {
  name = "${var.environment}-truck"

  properties {
    description = "Refrigerated truck with GPS and telemetry"
    searchable_attributes  = ["vehicle_id", "route_id", "driver_id"]
  }

  tags = {
    DeviceCategory = "vehicle"
  }
}

resource "aws_iot_thing_type" "trailer" {
  name = "${var.environment}-trailer"

  properties {
    description = "Reefer trailer with independent temperature control"
    searchable_attributes  = ["trailer_id", "reefer_unit_model", "temperature_range_min"]
  }

  tags = {
    DeviceCategory = "trailer"
  }
}

resource "aws_iot_thing_type" "temperature_sensor" {
  name = "${var.environment}-temperature-sensor"

  properties {
    description = "Calibrated temperature sensor for pharmaceutical transport"
    searchable_attributes  = ["sensor_id", "calibration_date", "calibration_due_date"]
  }

  tags = {
    DeviceCategory = "sensor"
  }
}

# ---------------------------------------------------------
# IoT Core - Policy for Device Authentication (X.509)
# ---------------------------------------------------------
resource "aws_iot_policy" "device_policy" {
  name   = "${var.environment}-device-policy"
  policy = data.aws_iam_policy_document.iot_device.json
}

data "aws_iam_policy_document" "iot_device" {
  statement {
    sid    = "AllowConnect"
    effect = "Allow"
    actions = [
      "iot:Connect"
    ]
    resources = [
      "arn:aws:iot:${var.aws_region}:${data.aws_caller_identity.current.account_id}:client/$${iot:Connection.Thing.ThingName}"
    ]
    condition {
      test     = "Bool"
      variable = "iot:Connection.Thing.IsAttached"
      values   = ["true"]
    }
  }

  statement {
    sid    = "AllowPublishTelemetry"
    effect = "Allow"
    actions = [
      "iot:Publish"
    ]
    resources = [
      "arn:aws:iot:${var.aws_region}:${data.aws_caller_identity.current.account_id}:topic/pharma/telemetry/$${iot:Connection.Thing.ThingName}",
      "arn:aws:iot:${var.aws_region}:${data.aws_caller_identity.current.account_id}:topic/pharma/alerts/$${iot:Connection.Thing.ThingName}",
      "arn:aws:iot:${var.aws_region}:${data.aws_caller_identity.current.account_id}:topic/pharma/status/$${iot:Connection.Thing.ThingName}"
    ]
  }

  statement {
    sid    = "AllowSubscribeCommands"
    effect = "Allow"
    actions = [
      "iot:Subscribe",
      "iot:Receive"
    ]
    resources = [
      "arn:aws:iot:${var.aws_region}:${data.aws_caller_identity.current.account_id}:topicfilter/pharma/commands/$${iot:Connection.Thing.ThingName}",
      "arn:aws:iot:${var.aws_region}:${data.aws_caller_identity.current.account_id}:topicfilter/pharma/config/$${iot:Connection.Thing.ThingName}"
    ]
  }

  statement {
    sid    = "AllowUpdateShadow"
    effect = "Allow"
    actions = [
      "iot:UpdateThingShadow",
      "iot:GetThingShadow"
    ]
    resources = [
      "arn:aws:iot:${var.aws_region}:${data.aws_caller_identity.current.account_id}:thing/$${iot:Connection.Thing.ThingName}"
    ]
  }
}

data "aws_caller_identity" "current" {}

# ---------------------------------------------------------
# IoT Core - Role Alias for Credential Provider
# ---------------------------------------------------------
resource "aws_iam_role" "iot_credential_provider" {
  name = "${var.environment}-iot-credential-provider"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "credentials.iot.amazonaws.com"
      }
      Action = "sts:AssumeRole"
      Condition = {
        StringEquals = {
          "iot:ThingGroupName" = aws_iot_thing_group.trucks.name
        }
      }
    }]
  })
}

resource "aws_iot_role_alias" "device_credential" {
  alias    = "${var.environment}-device-credential"
  role_arn = aws_iam_role.iot_credential_provider.arn
}

# ---------------------------------------------------------
# IoT Core - Rules Engine for Telemetry Processing
# ---------------------------------------------------------
resource "aws_iot_topic_rule" "telemetry_to_kinesis" {
  name        = "${var.environment}-telemetry-to-kinesis"
  description = "Route validated telemetry to Kinesis for stream processing"
  enabled     = true
  sql         = "SELECT *, topic(3) as device_id, timestamp() as ingest_timestamp FROM 'pharma/telemetry/+' WHERE temperature IS NOT NULL AND gps_lat IS NOT NULL AND gps_lon IS NOT NULL"
  sql_version = "2016-03-23"

  kinesis {
    role_arn = aws_iam_role.iot_to_kinesis.arn
    stream_name = aws_kinesis_stream.telemetry.name
    partition_key = "$${device_id}"
  }

  error_action {
    s3 {
      role_arn = aws_iam_role.iot_to_s3_error.arn
      bucket_name = aws_s3_bucket.iot_errors.bucket
      key = "telemetry-errors/$${timestamp()}/$${device_id}.json"
    }
  }
}

resource "aws_iot_topic_rule" "excursion_detection" {
  name        = "${var.environment}-excursion-detection"
  description = "Detect temperature excursions and trigger immediate alerts"
  enabled     = true
  sql         = <<-EOT
    SELECT
      *,
      topic(3) as device_id,
      timestamp() as alert_timestamp,
      CASE
        WHEN temperature < 0 OR temperature > 15 THEN 'S1_CRITICAL'
        WHEN temperature > 8 AND temperature <= 15 THEN 'S2_HIGH'
        WHEN temperature >= 1.9 AND temperature < 2 THEN 'S3_MODERATE'
        ELSE 'NORMAL'
      END as severity_level
    FROM 'pharma/telemetry/+'
    WHERE temperature < 2 OR temperature > 8
  EOT
  sql_version = "2016-03-23"

  sns {
    role_arn = aws_iam_role.iot_to_sns.arn
    target_arn = aws_sns_topic.excursion_alerts.arn
    message_format = "RAW"
  }

  error_action {
    s3 {
      role_arn = aws_iam_role.iot_to_s3_error.arn
      bucket_name = aws_s3_bucket.iot_errors.bucket
      key = "excursion-errors/$${timestamp()}/$${device_id}.json"
    }
  }
}

resource "aws_iot_topic_rule" "device_status" {
  name        = "${var.environment}-device-status"
  description = "Track device connectivity and shadow updates"
  enabled     = true
  sql         = "SELECT *, topic(3) as device_id, timestamp() as status_timestamp FROM 'pharma/status/+'"
  sql_version = "2016-03-23"

  kinesis {
    role_arn = aws_iam_role.iot_to_kinesis.arn
    stream_name = aws_kinesis_stream.device_status.name
    partition_key = "$${topic(3)}"
  }
}

# ---------------------------------------------------------
# Kinesis Streams for Telemetry Ingestion
# ---------------------------------------------------------
resource "aws_kinesis_stream" "telemetry" {
  name             = "${var.environment}-telemetry-stream"
  shard_count      = 10
  retention_period = 168 # 7 days

  stream_mode_details {
    stream_mode = "PROVISIONED"
  }

  tags = {
    Environment = var.environment
    DataType    = "telemetry"
    Retention   = "7-days"
  }
}

resource "aws_kinesis_stream" "device_status" {
  name             = "${var.environment}-device-status-stream"
  shard_count      = 2
  retention_period = 168

  tags = {
    Environment = var.environment
    DataType    = "device-status"
  }
}

# Kinesis streams are encrypted via KMS key_id in stream encryption
# ---------------------------------------------------------
# SNS Topics for Alerting
# ---------------------------------------------------------
resource "aws_sns_topic" "excursion_alerts" {
  name = "${var.environment}-excursion-alerts"

  # Delivery policy for high-priority alerts
  delivery_policy = jsonencode({
    healthyRetryPolicy = {
      minDelayTarget = 1
      maxDelayTarget = 60
      numRetries = 10
      numMaxDelayRetries = 5
      numNoDelayRetries = 3
      numMinDelayRetries = 2
      backoffFunction = "exponential"
    }
    throttlePolicy = {
      maxReceivesPerSecond = 1000
    }
  })
}

resource "aws_sns_topic" "critical_alerts" {
  name = "${var.environment}-critical-alerts"
  # For S1 Critical - immediate paging
  display_name = "Pharma S1 Critical Excursion Alerts"
}

resource "aws_sns_topic" "compliance_reports" {
  name = "${var.environment}-compliance-reports"
  # For daily/weekly regulatory reports
}

# ---------------------------------------------------------
# S3 Bucket for IoT Error Handling
# ---------------------------------------------------------
resource "aws_s3_bucket" "iot_errors" {
  bucket = "${var.environment}-pharma-iot-errors-${data.aws_caller_identity.current.account_id}"

  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "aws:kms"
        kms_master_key_id = var.kms_key_arn
      }
      bucket_key_enabled = true
    }
  }

  versioning {
    enabled = true
  }

  lifecycle_rule {
    enabled = true
    expiration {
      days = 2555 # 7 years
    }
  }
}

resource "aws_s3_bucket_public_access_block" "iot_errors" {
  bucket = aws_s3_bucket.iot_errors.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ---------------------------------------------------------
# IAM Roles for IoT Actions
# ---------------------------------------------------------
resource "aws_iam_role" "iot_to_kinesis" {
  name = "${var.environment}-iot-to-kinesis"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "iot.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "iot_to_kinesis" {
  name = "${var.environment}-iot-to-kinesis-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "kinesis:PutRecord",
        "kinesis:PutRecords"
      ]
      Resource = [
        aws_kinesis_stream.telemetry.arn,
        aws_kinesis_stream.device_status.arn
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "iot_to_kinesis" {
  role       = aws_iam_role.iot_to_kinesis.name
  policy_arn = aws_iam_policy.iot_to_kinesis.arn
}

resource "aws_iam_role" "iot_to_sns" {
  name = "${var.environment}-iot-to-sns"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "iot.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "iot_to_sns" {
  name = "${var.environment}-iot-to-sns-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "sns:Publish"
      ]
      Resource = [
        aws_sns_topic.excursion_alerts.arn,
        aws_sns_topic.critical_alerts.arn
      ]
    }]
  })
}

resource "aws_iam_role_policy_attachment" "iot_to_sns" {
  role       = aws_iam_role.iot_to_sns.name
  policy_arn = aws_iam_policy.iot_to_sns.arn
}

resource "aws_iam_role" "iot_to_s3_error" {
  name = "${var.environment}-iot-to-s3-error"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "iot.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "iot_to_s3_error" {
  name = "${var.environment}-iot-to-s3-error-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "s3:PutObject",
        "s3:PutObjectAcl"
      ]
      Resource = "${aws_s3_bucket.iot_errors.arn}/*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "iot_to_s3_error" {
  role       = aws_iam_role.iot_to_s3_error.name
  policy_arn = aws_iam_policy.iot_to_s3_error.arn
}

# ---------------------------------------------------------
# Lambda Permission for SNS
# ---------------------------------------------------------
resource "aws_lambda_permission" "sns_invoke" {
  statement_id  = "AllowSNSInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.excursion_processor.arn
  principal     = "sns.amazonaws.com"
  source_arn    = aws_sns_topic.excursion_alerts.arn
}

# ---------------------------------------------------------
# Lambda Function for Excursion Processing
# ---------------------------------------------------------
resource "aws_lambda_function" "excursion_processor" {
  function_name = "${var.environment}-excursion-processor"
  runtime       = "python3.12"
  handler       = "lambda_function.lambda_handler"
  role          = aws_iam_role.lambda_excursion.arn
  timeout       = 60
  memory_size   = 512
  filename      = "${path.module}/../../services/iot-processor/excursion_processor.zip"

  environment {
    variables = {
      ENVIRONMENT = var.environment
      DYNAMODB_TABLE = "${var.environment}-excursions"
      SNS_CRITICAL = aws_sns_topic.critical_alerts.arn
    }
  }

  tags = {
    Environment = var.environment
    Compliance  = "GxP"
  }
}

resource "aws_iam_role" "lambda_excursion" {
  name = "${var.environment}-lambda-excursion-processor"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "lambda.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_policy" "lambda_excursion" {
  name = "${var.environment}-lambda-excursion-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "logs:CreateLogGroup",
          "logs:CreateLogStream",
          "logs:PutLogEvents"
        ]
        Resource = "arn:aws:logs:${var.aws_region}:${data.aws_caller_identity.current.account_id}:log-group:/aws/lambda/${var.environment}-excursion-processor:*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:GetItem",
          "dynamodb:Query"
        ]
        Resource = "arn:aws:dynamodb:${var.aws_region}:${data.aws_caller_identity.current.account_id}:table/${var.environment}-excursions"
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.critical_alerts.arn
      },
      {
        Effect = "Allow"
        Action = [
          "kms:Decrypt",
          "kms:Encrypt",
          "kms:GenerateDataKey"
        ]
        Resource = var.kms_key_arn
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_excursion" {
  role       = aws_iam_role.lambda_excursion.name
  policy_arn = aws_iam_policy.lambda_excursion.arn
}

# ---------------------------------------------------------
# CloudWatch Logging for IoT
# ---------------------------------------------------------
resource "aws_cloudwatch_log_group" "iot_logs" {
  name              = "/aws/iot/${var.environment}-pharma"
  retention_in_days = 3653
  kms_key_id        = var.kms_key_arn
}

# ---------------------------------------------------------
# IoT Logging Role
# ---------------------------------------------------------
resource "aws_iam_role" "iot_logging" {
  name = "${var.environment}-iot-logging-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = {
        Service = "iot.amazonaws.com"
      }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "iot_logging" {
  role = aws_iam_role.iot_logging.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:PutMetricFilter",
        "logs:PutRetentionPolicy"
      ]
      Resource = [
        aws_cloudwatch_log_group.iot_logs.arn,
        "${aws_cloudwatch_log_group.iot_logs.arn}:*"
      ]
    }]
  })
}

# ---------------------------------------------------------
# Outputs
# ---------------------------------------------------------
output "telemetry_stream_arn" {
  value       = aws_kinesis_stream.telemetry.arn
  description = "Telemetry Kinesis Stream ARN"
}

output "excursion_alerts_topic_arn" {
  value       = aws_sns_topic.excursion_alerts.arn
  description = "Excursion Alerts SNS Topic ARN"
}

output "device_policy_name" {
  value       = aws_iot_policy.device_policy.name
  description = "IoT Device Policy Name"
}

output "role_alias_name" {
  value       = aws_iot_role_alias.device_credential.alias
  description = "IoT Role Alias for Credential Provider"
}

output "thing_groups" {
  value = {
    trucks   = aws_iot_thing_group.trucks.name
    trailers = aws_iot_thing_group.trailers.name
    sensors  = aws_iot_thing_group.sensors.name
    alerts   = aws_iot_thing_group.excursion_alert.name
  }
}
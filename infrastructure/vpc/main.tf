# Pharma Cold Track - VPC Infrastructure
# Provides a secure, multi-AZ VPC with private subnets for all compute resources
# and controlled egress via NAT Gateways.

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
  #   key            = "infrastructure/vpc/terraform.tfstate"
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
      Owner       = "pharma-logistics-team"
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

variable "vpc_cidr" {
  description = "CIDR block for VPC"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of AZs to use"
  type        = list(string)
  default     = ["us-east-1a", "us-east-1b", "us-east-1c"]
}

# ---------------------------------------------------------
# VPC
# ---------------------------------------------------------
resource "aws_vpc" "main" {
  cidr_block           = var.vpc_cidr
  enable_dns_hostnames = true
  enable_dns_support   = true
  instance_tenancy     = "default"

  tags = {
    Name = "${var.environment}-pharma-vpc"
  }
}

# ---------------------------------------------------------
# Subnets - Private (Application/Database)
# ---------------------------------------------------------
resource "aws_subnet" "private" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = false

  tags = {
    Name = "${var.environment}-private-${var.availability_zones[count.index]}"
    Type = "private"
  }
}

# ---------------------------------------------------------
# Subnets - Public (NAT Gateways, ALB)
# ---------------------------------------------------------
resource "aws_subnet" "public" {
  count                   = length(var.availability_zones)
  vpc_id                  = aws_vpc.main.id
  cidr_block              = cidrsubnet(var.vpc_cidr, 8, count.index + 10)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.environment}-public-${var.availability_zones[count.index]}"
    Type = "public"
  }
}

# ---------------------------------------------------------
# Internet Gateway
# ---------------------------------------------------------
resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "${var.environment}-igw"
  }
}

# ---------------------------------------------------------
# NAT Gateways (One per AZ for HA)
# ---------------------------------------------------------
resource "aws_eip" "nat" {
  count  = length(var.availability_zones)
  domain = "vpc"

  tags = {
    Name = "${var.environment}-nat-eip-${var.availability_zones[count.index]}"
  }
}

resource "aws_nat_gateway" "main" {
  count         = length(var.availability_zones)
  allocation_id = aws_eip.nat[count.index].id
  subnet_id     = aws_subnet.public[count.index].id

  tags = {
    Name = "${var.environment}-nat-${var.availability_zones[count.index]}"
  }

  depends_on = [aws_internet_gateway.main]
}

# ---------------------------------------------------------
# Route Tables
# ---------------------------------------------------------
resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "${var.environment}-public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}

resource "aws_route_table" "private" {
  count  = length(var.availability_zones)
  vpc_id = aws_vpc.main.id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[count.index].id
  }

  tags = {
    Name = "${var.environment}-private-rt-${var.availability_zones[count.index]}"
  }
}

resource "aws_route_table_association" "private" {
  count          = length(var.availability_zones)
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[count.index].id
}

# ---------------------------------------------------------
# VPC Flow Logs (Compliance Requirement)
# ---------------------------------------------------------
resource "aws_cloudwatch_log_group" "vpc_flow_logs" {
  name              = "/aws/vpc/${var.environment}-pharma-flow-logs"
  retention_in_days = 3653 # 10 years for GxP compliance
  kms_key_id        = aws_kms_key.flow_logs.arn
}

resource "aws_kms_key" "flow_logs" {
  description             = "KMS Key for VPC Flow Logs encryption"
  deletion_window_in_days = 30
  enable_key_rotation     = true

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "Allow CloudWatch Logs to use key"
        Effect = "Allow"
        Principal = {
          Service = "logs.${var.aws_region}.amazonaws.com"
        }
        Action = [
          "kms:Encrypt*",
          "kms:Decrypt*",
          "kms:ReEncrypt*",
          "kms:GenerateDataKey*",
          "kms:DescribeKey"
        ]
        Resource = "*"
      },
      {
        Sid    = "Allow admin access"
        Effect = "Allow"
        Principal = {
          AWS = "arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"
        }
        Action = "kms:*"
        Resource = "*"
      }
    ]
  })
}

data "aws_caller_identity" "current" {}

resource "aws_flow_log" "main" {
  iam_role_arn    = aws_iam_role.flow_logs.arn
  log_destination = aws_cloudwatch_log_group.vpc_flow_logs.arn
  traffic_type    = "ALL"
  vpc_id          = aws_vpc.main.id

  max_aggregation_interval = 600
}

resource "aws_iam_role" "flow_logs" {
  name = "${var.environment}-vpc-flow-logs-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = {
        Service = "vpc-flow-logs.amazonaws.com"
      }
    }]
  })
}

resource "aws_iam_policy" "flow_logs" {
  name = "${var.environment}-vpc-flow-logs-policy"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "logs:DescribeLogGroups",
        "logs:DescribeLogStreams"
      ]
      Effect   = "Allow"
      Resource = "*"
    }]
  })
}

resource "aws_iam_role_policy_attachment" "flow_logs" {
  role       = aws_iam_role.flow_logs.name
  policy_arn = aws_iam_policy.flow_logs.arn
}

# ---------------------------------------------------------
# Security Groups
# ---------------------------------------------------------
resource "aws_security_group" "lambda_private" {
  name        = "${var.environment}-lambda-private-sg"
  description = "Security group for Lambda functions in private subnets"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.environment}-lambda-private-sg"
  }
}

resource "aws_security_group" "dynamodb_endpoint" {
  name        = "${var.environment}-dynamodb-vpce-sg"
  description = "Security group for DynamoDB VPC Endpoint"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    security_groups = [aws_security_group.lambda_private.id]
  }

  tags = {
    Name = "${var.environment}-dynamodb-vpce-sg"
  }
}

resource "aws_security_group" "iot_core" {
  name        = "${var.environment}-iot-core-sg"
  description = "Security group for IoT Core VPC Endpoint (if using private link)"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda_private.id]
  }

  tags = {
    Name = "${var.environment}-iot-core-sg"
  }
}

# ---------------------------------------------------------
# VPC Endpoints (PrivateLink) - Critical for GxP
# ---------------------------------------------------------
resource "aws_vpc_endpoint" "dynamodb" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.dynamodb"
  vpc_endpoint_type   = "Gateway"
  route_table_ids     = [for rt in aws_route_table.private : rt.id]
  policy              = data.aws_iam_policy_document.dynamodb_vpce.json
}

data "aws_iam_policy_document" "dynamodb_vpce" {
  statement {
    sid    = "AllowDynamoDBAccess"
    effect = "Allow"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = ["dynamodb:*"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:PrincipalTag/Compliance"
      values   = ["GxP"]
    }
  }
}

resource "aws_vpc_endpoint" "kms" {
  vpc_id            = aws_vpc.main.id
  service_name      = "com.amazonaws.${var.aws_region}.kms"
  vpc_endpoint_type = "Interface"
  subnet_ids        = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.dynamodb_endpoint.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "s3" {
  vpc_id              = aws_vpc.main.id
  service_name        = "com.amazonaws.${var.aws_region}.s3"
  vpc_endpoint_type   = "Gateway"
  route_table_ids     = [for rt in aws_route_table.private : rt.id]
  policy              = data.aws_iam_policy_document.s3_vpce.json
}

data "aws_iam_policy_document" "s3_vpce" {
  statement {
    sid    = "AllowS3Access"
    effect = "Allow"
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    actions = ["s3:*"]
    resources = ["*"]
    condition {
      test     = "StringEquals"
      variable = "aws:PrincipalTag/Compliance"
      values   = ["GxP"]
    }
  }
}

resource "aws_vpc_endpoint" "logs" {
  vpc_id             = aws_vpc.main.id
  service_name       = "com.amazonaws.${var.aws_region}.logs"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.dynamodb_endpoint.id]
  private_dns_enabled = true
}

resource "aws_vpc_endpoint" "sts" {
  vpc_id             = aws_vpc.main.id
  service_name       = "com.amazonaws.${var.aws_region}.sts"
  vpc_endpoint_type  = "Interface"
  subnet_ids         = aws_subnet.private[*].id
  security_group_ids = [aws_security_group.dynamodb_endpoint.id]
  private_dns_enabled = true
}

# ---------------------------------------------------------
# Outputs
# ---------------------------------------------------------
output "vpc_id" {
  value       = aws_vpc.main.id
  description = "Main VPC ID"
}

output "private_subnet_ids" {
  value       = aws_subnet.private[*].id
  description = "Private Subnet IDs"
}

output "public_subnet_ids" {
  value       = aws_subnet.public[*].id
  description = "Public Subnet IDs"
}

output "lambda_sg_id" {
  value       = aws_security_group.lambda_private.id
  description = "Lambda Security Group ID"
}

output "dynamodb_vpce_id" {
  value       = aws_vpc_endpoint.dynamodb.id
  description = "DynamoDB VPC Endpoint ID"
}
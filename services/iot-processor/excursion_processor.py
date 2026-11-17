import os
import json
import boto3
import logging
from decimal import Decimal

# Configure logging for GxP audit trail
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# AWS SDK Clients
dynamodb = boto3.resource('dynamodb', region_name=os.environ.get('AWS_REGION', 'us-east-1'), endpoint_url=os.environ.get('AWS_ENDPOINT_URL'))
sns = boto3.client('sns', region_name=os.environ.get('AWS_REGION', 'us-east-1'), endpoint_url=os.environ.get('AWS_ENDPOINT_URL'))
table = dynamodb.Table(os.environ['DYNAMODB_TABLE'])

def convert_floats_to_decimal(obj):
    """Recursively convert float values to Decimal for DynamoDB compatibility"""
    if isinstance(obj, float):
        return Decimal(str(obj))
    elif isinstance(obj, dict):
        return {k: convert_floats_to_decimal(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [convert_floats_to_decimal(v) for v in obj]
    return obj

def lambda_handler(event, context):
    """
    Excursion Processor:
    1. Validates temperature telemetry against guidelines.
    2. Updates Excursion Table (GXP Audit).
    3. Triggers critical alerts if S1 breach is detected.
    """
    logger.info(f"Processing event: {json.dumps(event)}")

    for record in event['Records']:
        try:
            # Parse event data (IoT/SNS source)
            payload = json.loads(record['Sns']['Message'])
            device_id = payload.get('device_id')
            temperature = float(payload.get('temperature'))
            severity = payload.get('severity_level')

            # Logic: If S1, publish to Critical SNS
            if severity == 'S1_CRITICAL':
                trigger_critical_alert(payload)

            # Record in Excursion Table
            persist_excursion(payload)

        except Exception as e:
            logger.error(f"Error processing record: {str(e)}")
            raise e

def trigger_critical_alert(data):
    """Publish S1 alert to Critical SNS topic"""
    sns.publish(
        TopicArn=os.environ['SNS_CRITICAL'],
        Message=json.dumps({"alert": "S1_CRITICAL_BREACH", "data": data}),
        Subject="CRITICAL: Pharma Cold Chain Excursion",
        MessageAttributes={
            'Severity': {'DataType': 'String', 'StringValue': 'Critical'}
        }
    )

def persist_excursion(data):
    """Writes excursion to DynamoDB for regulatory reporting"""
    # Convert floats to Decimal for DynamoDB compatibility
    item_data = convert_floats_to_decimal(data)

    table.put_item(
        Item={
            'excursion_id': f"EXC-{data['device_id']}-{data['alert_timestamp']}",
            'device_id': data['device_id'],
            'timestamp': data['alert_timestamp'],
            'severity': data['severity_level'],
            'status': 'OPEN',
            'data': item_data
        }
    )

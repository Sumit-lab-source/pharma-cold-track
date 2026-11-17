# ADR-001: Use AWS IoT Core and Kinesis for Real-Time Telemetry Ingestion

## Status
Accepted

## Context
PharmaTrack requires ingestion of real-time temperature, GPS, and sensor telemetry from thousands of refrigerated vehicles and smart containers globally. The system must adhere to strict GxP and FDA 21 CFR Part 11 requirements with guaranteed message delivery, secure MQTT transport over TLS 1.3, and minimal latency (<500ms).

## Decision
We chose **AWS IoT Core** combined with **Amazon Kinesis Data Streams** and **AWS Lambda**:
1. **AWS IoT Core** manages X.509 certificate-based authentication for all cold chain monitoring devices without shared secrets.
2. **Kinesis Data Streams** buffers and streams high-throughput telemetry payloads reliably.
3. **AWS Lambda** processes telemetry streams in real time to detect temperature excursions (S1, S2, S3) and trigger automated alerts.

## Consequences
- **Positive**: High throughput, fault-tolerant ingestion pipeline with enterprise security standards.
- **Negative**: Requires operational management of IoT certificates and MQTT broker policies.

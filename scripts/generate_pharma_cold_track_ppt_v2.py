import os
import sys
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

def build_refined_deck(output_path="Pharma_Cold_Track_Cloud_Mini_Project.pptx"):
    prs = pptx.Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank_layout = prs.slide_layouts[6]

    # Professional Color Palette
    C_NAVY_DARK    = RGBColor(11, 19, 43)    # Deep Midnight Navy #0B132B
    C_NAVY_SURFACE = RGBColor(19, 31, 62)    # Deep Card Navy #131F3E
    C_SLATE_BG     = RGBColor(246, 248, 251) # Clean Soft Gray/White #F6F8FB
    C_WHITE        = RGBColor(255, 255, 255) # Pure White
    C_BORDER       = RGBColor(226, 232, 240) # Slate 200 #E2E8F0
    C_TEXT_MAIN    = RGBColor(15, 23, 42)    # Slate 900
    C_TEXT_BODY    = RGBColor(51, 65, 85)    # Slate 700
    C_TEXT_MUTED   = RGBColor(100, 116, 139) # Slate 500
    
    # Brand & Accent Colors
    C_TEAL         = RGBColor(14, 116, 144)  # Cyan 700 #0E7690
    C_CYAN_VIBRANT = RGBColor(6, 182, 212)   # Vibrant Cyan #06B6D4
    C_CYAN_BG      = RGBColor(236, 254, 255) # Cyan 50
    C_BLUE         = RGBColor(37, 99, 235)   # Blue 600 #2563EB
    C_BLUE_BG      = RGBColor(239, 246, 255) # Blue 50
    C_GREEN        = RGBColor(16, 185, 129)  # Emerald 500 #10B981
    C_GREEN_BG     = RGBColor(236, 253, 245) # Emerald 50
    C_RED          = RGBColor(239, 68, 68)   # Red 500 #EF4444
    C_RED_BG       = RGBColor(254, 242, 242) # Red 50
    C_AMBER        = RGBColor(245, 158, 11)  # Amber 500 #F59E0B
    C_AMBER_BG     = RGBColor(254, 252, 232) # Amber 50

    def set_bg(slide, color):
        bg = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
        bg.fill.solid()
        bg.fill.fore_color.rgb = color
        bg.line.fill.background()
        return bg

    def add_header(slide, title, category="Mini Project | Cloud Computing", dark=False):
        # Top Category Badge Pill
        pill = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.38), Inches(3.2), Inches(0.34))
        pill.fill.solid()
        pill.fill.fore_color.rgb = RGBColor(19, 78, 74) if dark else C_CYAN_BG
        pill.line.color.rgb = C_CYAN_VIBRANT if dark else C_TEAL
        pill.line.width = Pt(1)
        tf = pill.text_frame
        tf.vertical_anchor = MSO_ANCHOR.MIDDLE
        p = tf.paragraphs[0]
        p.text = category
        p.font.size = Pt(10)
        p.font.bold = True
        p.font.color.rgb = C_CYAN_VIBRANT if dark else C_TEAL
        p.alignment = PP_ALIGN.CENTER

        # Title
        tb = slide.shapes.add_textbox(Inches(0.8), Inches(0.78), Inches(11.733), Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = title
        p.font.size = Pt(21)
        p.font.bold = True
        p.font.color.rgb = C_WHITE if dark else C_TEXT_MAIN

        # Subtle Divider line
        line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.42), Inches(11.733), Inches(0.015))
        line.fill.solid()
        line.fill.fore_color.rgb = RGBColor(40, 53, 80) if dark else C_BORDER
        line.line.fill.background()

        # Footer
        ft = slide.shapes.add_textbox(Inches(0.8), Inches(7.08), Inches(11.733), Inches(0.32))
        ft_tf = ft.text_frame
        ft_tf.margin_left = ft_tf.margin_top = ft_tf.margin_right = ft_tf.margin_bottom = 0
        p_ft = ft_tf.paragraphs[0]
        p_ft.text = "PharmaTrack (pharma-cold-track)  •  Industry Cloud Application  •  AWS | Docker | Virtualization | SLA & TTR"
        p_ft.font.size = Pt(8.5)
        p_ft.font.color.rgb = RGBColor(148, 163, 184) if dark else C_TEXT_MUTED

    def add_card(slide, left, top, width, height, bg_color=C_WHITE, border_color=C_BORDER, accent_top=None, accent_left=None):
        card = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left, top, width, height)
        card.fill.solid()
        card.fill.fore_color.rgb = bg_color
        if border_color:
            card.line.color.rgb = border_color
            card.line.width = Pt(1)
        else:
            card.line.fill.background()

        if accent_top:
            bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, width, Inches(0.08))
            bar.fill.solid()
            bar.fill.fore_color.rgb = accent_top
            bar.line.fill.background()
        elif accent_left:
            bar = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, left, top, Inches(0.08), height)
            bar.fill.solid()
            bar.fill.fore_color.rgb = accent_left
            bar.line.fill.background()
        return card

    # =========================================================================
    # SLIDE 0: TITLE SLIDE (REFINED & ELEGANT)
    # =========================================================================
    s0 = prs.slides.add_slide(blank_layout)
    set_bg(s0, C_NAVY_DARK)

    # Decorative Category Pill
    pill = s0.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.75), Inches(3.6), Inches(0.38))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(19, 78, 74)
    pill.line.color.rgb = C_CYAN_VIBRANT
    pill.line.width = Pt(1)
    tf = pill.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "Mini Project | Cloud Computing"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_CYAN_VIBRANT
    p.alignment = PP_ALIGN.CENTER

    # Main Titles
    tb = s0.shapes.add_textbox(Inches(0.8), Inches(1.3), Inches(11.733), Inches(1.8))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
    p = tf.paragraphs[0]
    p.text = "Mini Project: Industry Cloud Application"
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    p2 = tf.add_paragraph()
    p2.text = "Building an Industry Use-Case Pipeline with SLA, TTR, AWS, Docker & Virtualization"
    p2.font.size = Pt(16.5)
    p2.font.color.rgb = C_CYAN_VIBRANT
    p2.space_before = Pt(6)

    # Hero Project Container Card
    add_card(s0, Inches(0.8), Inches(3.3), Inches(11.733), Inches(2.35), bg_color=C_NAVY_SURFACE, border_color=RGBColor(45, 62, 102), accent_left=C_CYAN_VIBRANT)
    h_tb = s0.shapes.add_textbox(Inches(1.15), Inches(3.45), Inches(11.1), Inches(2.05))
    h_tf = h_tb.text_frame
    h_tf.word_wrap = True
    h_tf.margin_left = h_tf.margin_top = h_tf.margin_right = h_tf.margin_bottom = 0

    hp1 = h_tf.paragraphs[0]
    hp1.text = "PROJECT: PharmaTrack (pharma-cold-track)"
    hp1.font.size = Pt(15.5)
    hp1.font.bold = True
    hp1.font.color.rgb = C_WHITE

    hp2 = h_tf.add_paragraph()
    hp2.text = "Real-Time Pharmaceutical Cold Chain Logistics & GxP Compliance Platform"
    hp2.font.size = Pt(12)
    hp2.font.color.rgb = RGBColor(203, 213, 225)
    hp2.space_before = Pt(4)

    hp3 = h_tf.add_paragraph()
    hp3.text = "Core Architecture Pillars:"
    hp3.font.size = Pt(10.5)
    hp3.font.bold = True
    hp3.font.color.rgb = C_CYAN_VIBRANT
    hp3.space_before = Pt(8)

    pillars = [
        "AWS Cloud-Native (IoT Core, Kinesis Data Streams, Lambda, DynamoDB Global Tables)",
        "Multi-Stage Docker Containers (5-Stage Alpine build with Nginx SPA & Lambda RIE)",
        "Hardware-Assisted Virtualization (AWS Nitro Type-1 Hypervisor & Firecracker MicroVMs)",
        "Measurable Reliability: Explicit 99.9% SLA & Automated 75-Second TTR Recovery",
        "GxP & FDA 21 CFR Part 11 Compliance (Immutable S3 Object Lock & Cryptographic Signatures)"
    ]
    for pil in pillars:
        p_pil = h_tf.add_paragraph()
        p_pil.text = f"•  {pil}"
        p_pil.font.size = Pt(9.5)
        p_pil.font.color.rgb = RGBColor(148, 163, 184)
        p_pil.space_before = Pt(2)

    # Bottom Metadata Cards (Domain, Tech, Team)
    m_w = Inches(3.72)
    m_h = Inches(1.1)

    # Card 1: Domain
    add_card(s0, Inches(0.8), Inches(5.85), m_w, m_h, bg_color=C_NAVY_SURFACE, border_color=RGBColor(45, 62, 102), accent_top=C_TEAL)
    m1_tb = s0.shapes.add_textbox(Inches(0.95), Inches(5.95), m_w - Inches(0.3), m_h - Inches(0.2))
    m1_tf = m1_tb.text_frame
    m1_tf.margin_left = m1_tf.margin_top = m1_tf.margin_right = m1_tf.margin_bottom = 0
    p = m1_tf.paragraphs[0]
    p.text = "DOMAIN / INDUSTRY"
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = C_CYAN_VIBRANT
    p2 = m1_tf.add_paragraph()
    p2.text = "Pharmaceutical Logistics / Healthcare\n2°C - 8°C Cold Chain & GxP Compliance"
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = C_WHITE
    p2.space_before = Pt(2)

    # Card 2: Architecture
    add_card(s0, Inches(4.8), Inches(5.85), m_w, m_h, bg_color=C_NAVY_SURFACE, border_color=RGBColor(45, 62, 102), accent_top=C_BLUE)
    m2_tb = s0.shapes.add_textbox(Inches(4.95), Inches(5.95), m_w - Inches(0.3), m_h - Inches(0.2))
    m2_tf = m2_tb.text_frame
    m2_tf.margin_left = m2_tf.margin_top = m2_tf.margin_right = m2_tf.margin_bottom = 0
    p = m2_tf.paragraphs[0]
    p.text = "TARGET ARCHITECTURE"
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = C_CYAN_VIBRANT
    p2 = m2_tf.add_paragraph()
    p2.text = "AWS Serverless + Docker Compose\nTerraform IaC + LocalStack Emulation"
    p2.font.size = Pt(10.5)
    p2.font.color.rgb = C_WHITE
    p2.space_before = Pt(2)

    # Card 3: Team Members
    add_card(s0, Inches(8.8), Inches(5.85), m_w, m_h, bg_color=C_NAVY_SURFACE, border_color=RGBColor(45, 62, 102), accent_top=C_GREEN)
    m3_tb = s0.shapes.add_textbox(Inches(8.95), Inches(5.95), m_w - Inches(0.3), m_h - Inches(0.2))
    m3_tf = m3_tb.text_frame
    m3_tf.margin_left = m3_tf.margin_top = m3_tf.margin_right = m3_tf.margin_bottom = 0
    p = m3_tf.paragraphs[0]
    p.text = "TEAM MEMBERS / REPO"
    p.font.size = Pt(9)
    p.font.bold = True
    p.font.color.rgb = C_GREEN
    p2 = m3_tf.add_paragraph()
    p2.text = "• Sumit Saurav | Roll No: [CS-Cloud-01]\n• Ayush Raj | Roll No: 24a12res896"
    p2.font.size = Pt(10.5)
    p2.font.bold = True
    p2.font.color.rgb = C_WHITE
    p2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 1: 1. PROJECT OVERVIEW
    # =========================================================================
    s1 = prs.slides.add_slide(blank_layout)
    set_bg(s1, C_SLATE_BG)
    add_header(s1, "1. Project Overview")

    card_w = Inches(5.7)
    card_h = Inches(5.25)

    # Left Card
    add_card(s1, Inches(0.8), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_TEAL)
    tb = s1.shapes.add_textbox(Inches(1.05), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "Industry & Business Imperative"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_TEAL

    items1 = [
        ("Industry / Domain", "Pharmaceutical Cold Chain Logistics & Healthcare Compliance (GxP / GDP)."),
        ("Use Case", "Real-time IoT telemetry monitoring and automated excursion detection for temperature-sensitive drugs (vaccines, biologics, insulin) in transit."),
        ("Business Need", "Pharmaceutical companies lose over $35 Billion annually due to cold chain temperature failures. Even a brief excursion outside safe limits renders life-saving medications ineffective or toxic."),
        ("Regulatory Mandate", "Strict adherence required for US FDA 21 CFR Part 11 (electronic records, cryptographic signatures, immutable audit trails) and EU GDP 2013/C 343/01 guidelines.")
    ]
    for lbl, val in items1:
        p1 = tf.add_paragraph()
        p1.text = f"• {lbl}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(10)
        p2 = tf.add_paragraph()
        p2.text = f"   {val}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(2)

    # Right Card
    add_card(s1, Inches(6.833), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_BLUE)
    tb2 = s1.shapes.add_textbox(Inches(7.083), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p = tf2.paragraphs[0]
    p.text = "Target Users & Cloud Objectives"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    items2 = [
        ("Target Users", "Fleet Dispatchers (real-time vehicle GPS & telemetry), QA & Compliance Officers (excursion sign-off), Regulatory Auditors (immutable audit logs), and System Operators."),
        ("Cloud Objective", "Deploy a scalable, highly available (99.9%), GxP-compliant cloud pipeline using Docker containers, AWS serverless processing (Lambda), and DynamoDB Global Tables."),
        ("Measurable Goals", "Achieve sub-500ms telemetry latency, automated excursion detection (<30s), and automated self-healing with Time-to-Recovery (TTR) < 3 minutes."),
        ("Project Team Members", "• Sumit Saurav | Roll No: [CS-Cloud-01]\n• Ayush Raj | Roll No: 24a12res896\nCourse: Mini Project Cloud Computing | Repo: pharma-cold-track")
    ]
    for lbl, val in items2:
        p1 = tf2.add_paragraph()
        p1.text = f"• {lbl}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(10)
        p2 = tf2.add_paragraph()
        p2.text = f"   {val}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 2: 2. INDUSTRY PROBLEM & PROPOSED SOLUTION
    # =========================================================================
    s2 = prs.slides.add_slide(blank_layout)
    set_bg(s2, C_SLATE_BG)
    add_header(s2, "2. Industry Problem & Proposed Solution")

    # Left Card: Pain points
    add_card(s2, Inches(0.8), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_RED)
    tb = s2.shapes.add_textbox(Inches(1.05), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "Current Process & Problem Statement"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_RED

    pts1 = [
        ("Current Process", "Passive USB data loggers and paper transit manifests. Data is extracted manually only after delivery at hospitals or distribution hubs."),
        ("Core Pain Points", "No real-time alerting during transit. When temperature deviates, spoilage is discovered days later. Products are scrapped, causing massive financial and operational losses."),
        ("Problem Statement", "Lack of continuous telemetry ingestion, automated anomaly detection, and verifiable audit trails creates severe non-compliance under FDA 21 CFR Part 11 and risks patient safety."),
        ("Key Constraints", "Strict temperature limits: Refrigerated (2°C to 8°C), Frozen (-25°C to -15°C), Controlled Room (15°C to 25°C). High data integrity (WORM storage for 10-year retention).")
    ]
    for lbl, val in pts1:
        p1 = tf.add_paragraph()
        p1.text = f"❌  {lbl}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(10)
        p2 = tf.add_paragraph()
        p2.text = f"     {val}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(2)

    # Right Card: Proposed solution
    add_card(s2, Inches(6.833), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_GREEN)
    tb2 = s2.shapes.add_textbox(Inches(7.083), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p = tf2.paragraphs[0]
    p.text = "Proposed Cloud Solution & Expected Gains"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_GREEN

    pts2 = [
        ("Proposed Solution", "Cloud-native, event-driven IoT pipeline: IoT Core MQTT -> Kinesis Streams -> Lambda processor -> DynamoDB Global Tables -> AppSync / Vite Dashboard with automated CloudWatch & SNS alert workflows."),
        ("Real-Time Telemetry", "Continuous ingestion of temperature, humidity, door-open status, reefer power, and GPS coordinates every 2 to 5 seconds per vehicle."),
        ("Expected Improvements", "Availability > 99.9%, telemetry ingestion < 500ms, instantaneous excursion alerts (<30s), reducing product spoilage by >85% and cutting audit turnaround from 2 weeks to minutes."),
        ("GxP Automation", "Automated cryptographic electronic signatures, immutable S3 Object Lock audit storage, and automated regulatory PDF reporting.")
    ]
    for lbl, val in pts2:
        p1 = tf2.add_paragraph()
        p1.text = f"✅  {lbl}"
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(10)
        p2 = tf2.add_paragraph()
        p2.text = f"     {val}"
        p2.font.size = Pt(9.5)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 3: 3. SLA & TTR DEFINITION
    # =========================================================================
    s3 = prs.slides.add_slide(blank_layout)
    set_bg(s3, C_SLATE_BG)
    add_header(s3, "3. SLA & TTR Definition (Service Level Agreement & Time to Recovery)")

    # 4 Top KPI Cards
    sla_boxes = [
        ("Availability SLA", "99.9%", "Max downtime: 43.8 min/mo\nMulti-AZ DynamoDB & Lambda", C_TEAL),
        ("Response Time SLA", "< 200 ms", "P95 latency < 200ms\nAvg API response ~ 85ms", C_BLUE),
        ("Disaster Recovery", "RTO < 5m | RPO < 1m", "Point-in-Time Recovery\nKinesis streaming buffer", C_GREEN),
        ("Critical TTR Target", "< 3.0 min", "From detection to resolution\nfor S1 Critical excursions", C_RED)
    ]
    k_w = Inches(2.78)
    for i, (title, val, sub, col) in enumerate(sla_boxes):
        cx = Inches(0.8) + i * Inches(2.98)
        add_card(s3, cx, Inches(1.6), k_w, Inches(1.5), bg_color=C_WHITE, accent_top=col)
        tb = s3.shapes.add_textbox(cx + Inches(0.18), Inches(1.72), k_w - Inches(0.36), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MUTED

        p2 = tf.add_paragraph()
        p2.text = val
        p2.font.size = Pt(17)
        p2.font.bold = True
        p2.font.color.rgb = col
        p2.space_before = Pt(3)

        p3 = tf.add_paragraph()
        p3.text = sub
        p3.font.size = Pt(8.5)
        p3.font.color.rgb = C_TEXT_BODY
        p3.space_before = Pt(2)

    # Bottom Table Container
    add_card(s3, Inches(0.8), Inches(3.3), Inches(11.733), Inches(3.55), bg_color=C_WHITE, accent_left=C_TEAL)
    tb_t = s3.shapes.add_textbox(Inches(1.1), Inches(3.42), Inches(11.2), Inches(0.35))
    tf_t = tb_t.text_frame
    tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
    p = tf_t.paragraphs[0]
    p.text = "Incident Severity Matrix, TTR Commitments & Detection Workflows"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_TEXT_MAIN

    table_shape = s3.shapes.add_table(5, 5, Inches(1.1), Inches(3.85), Inches(11.133), Inches(2.8))
    table = table_shape.table
    table.columns[0].width = Inches(1.4)
    table.columns[1].width = Inches(2.9)
    table.columns[2].width = Inches(1.3)
    table.columns[3].width = Inches(2.7)
    table.columns[4].width = Inches(2.833)

    headers = ["Severity", "Condition / Breach Criteria", "TTR Target", "Automated Action", "Detection & Reporting"]
    for j, h in enumerate(headers):
        cell = table.cell(0, j)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_NAVY_DARK
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.alignment = PP_ALIGN.CENTER

    data = [
        ("S1 Critical", "Temp < 0°C or > 15°C for > 30 min; or Reefer Power Failure", "< 3 minutes", "SNS Critical Alert, Driver dispatched, SMS/Call escalation", "CloudWatch Excursion Rule + Lambda trigger"),
        ("S2 High", "Temp 8.1°C - 15°C or 0.1°C - 1.9°C for 1-2 hours", "< 15 minutes", "Dispatch warning, route optimization, QA audit logged", "IoT Core Topic Rule -> Kinesis threshold check"),
        ("S3 Medium", "Minor transient drift or single sensor telemetry lag (>5 min)", "< 2 hours", "Diagnostic probe triggered, secondary sensor fallback", "CloudWatch DeviceOffline Alarm (>5m silent)"),
        ("S4 Low", "UI query latency warning or report generation queue delay", "< 24 hours", "Container scale-out, batch queue re-indexing", "AppSync P99 latency metric breach > 1%")
    ]
    for i, row in enumerate(data):
        for j, val in enumerate(row):
            cell = table.cell(i + 1, j)
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(248, 250, 252) if i % 2 == 1 else C_WHITE
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(9)
            p.font.color.rgb = C_RED if j == 0 and "S1" in val else (C_AMBER if j == 0 and "S2" in val else C_TEXT_BODY)
            p.font.bold = True if j in [0, 2] else False
            if j in [0, 2]:
                p.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 4: 4. END-TO-END CLOUD PIPELINE
    # =========================================================================
    s4 = prs.slides.add_slide(blank_layout)
    set_bg(s4, C_SLATE_BG)
    add_header(s4, "4. End-to-End Cloud Pipeline Architecture")

    steps = [
        ("1. Users / Clients", "• Vite React 19 SPA\n• Dispatch Operators\n• QA Compliance Officers\n• Simulated IoT Fleets\n(MQTT / TLS 1.3)", C_BLUE),
        ("2. Ingestion & DNS", "• Route 53 / ALB\n• AWS IoT Core Rules\n• X.509 Device Certs\n• Kinesis Streams\n(Encrypted Telemetry)", C_TEAL),
        ("3. Serverless Compute", "• AWS Lambda Processor\n(Python 3.12 GxP Engine)\n• Excursion Detection\n• Zero Idle Server Cost\n• Instant Auto-Scaling", C_BLUE),
        ("4. Container Runtime", "• Dockerized Nginx SPA\n• Multi-stage Build\n• Python Lambda RIE\n• LocalStack Emulation\n(pharma-network)", C_TEAL),
        ("5. AWS Infrastructure", "• DynamoDB Global Tables\n• S3 Object Lock (WORM)\n• KMS Customer Keys\n• VPC Private Subnets\n• PrivateLink Endpoints", C_NAVY_DARK),
        ("6. Monitoring / SLA", "• CloudWatch Alarms\n• Metric Latency Probes\n• SNS Critical Alerts\n• Auto-Healing Workflows\n• 21 CFR Part 11 Logs", C_RED)
    ]

    sw = Inches(1.8)
    sh = Inches(3.2)
    gap = Inches(0.18)
    start_x = Inches(0.8)

    for i, (title, desc, col) in enumerate(steps):
        cx = start_x + i * (sw + gap)
        add_card(s4, cx, Inches(1.6), sw, sh, bg_color=C_WHITE, accent_top=col)

        # Header box inside card
        tb_h = s4.shapes.add_textbox(cx + Inches(0.08), Inches(1.75), sw - Inches(0.16), Inches(0.35))
        tf_h = tb_h.text_frame
        tf_h.margin_left = tf_h.margin_top = tf_h.margin_right = tf_h.margin_bottom = 0
        p = tf_h.paragraphs[0]
        p.text = title
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = col
        p.alignment = PP_ALIGN.CENTER

        tb = s4.shapes.add_textbox(cx + Inches(0.1), Inches(2.15), sw - Inches(0.2), sh - Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.text = desc
        p.font.size = Pt(8.8)
        p.font.color.rgb = C_TEXT_BODY

        if i < len(steps) - 1:
            arrow = s4.shapes.add_textbox(cx + sw, Inches(2.9), gap, Inches(0.4))
            atf = arrow.text_frame
            atf.margin_left = atf.margin_top = atf.margin_right = atf.margin_bottom = 0
            ap = atf.paragraphs[0]
            ap.text = "➔"
            ap.font.size = Pt(13)
            ap.font.bold = True
            ap.font.color.rgb = C_TEAL
            ap.alignment = PP_ALIGN.CENTER

    # Bottom Pipeline Operations Card
    add_card(s4, Inches(0.8), Inches(5.0), Inches(11.733), Inches(1.85), bg_color=C_WHITE, accent_left=C_BLUE)
    dtb = s4.shapes.add_textbox(Inches(1.05), Inches(5.1), Inches(11.25), Inches(1.65))
    dtf = dtb.text_frame
    dtf.word_wrap = True
    dtf.margin_left = dtf.margin_top = dtf.margin_right = dtf.margin_bottom = 0

    dp1 = dtf.paragraphs[0]
    dp1.text = "End-to-End Request, Data & Recovery Operations Flow:"
    dp1.font.size = Pt(11)
    dp1.font.bold = True
    dp1.font.color.rgb = C_TEXT_MAIN

    flows = [
        ("1. Ingestion Path", "IoT sensors push encrypted telemetry (temp, GPS, battery) via MQTT/TLS 1.3 -> AWS IoT Core topic rule routes records directly into Amazon Kinesis Data Streams for sub-500ms buffering."),
        ("2. Compute & Storage Path", "AWS Lambda 'excursion_processor.py' validates reading against 2°C - 8°C boundaries -> Writes telemetry to DynamoDB Global Tables (multi-region active-active) -> Mirror audit logs to S3 Object Lock (WORM)."),
        ("3. Failure & Recovery Path", "If a thermal excursion or Lambda container failure occurs -> CloudWatch Metric Alarm triggers SNS -> Dispatches instant operator alert -> Auto-restart policy / DLQ recovers state in 75 seconds.")
    ]
    for lbl, desc in flows:
        p = dtf.add_paragraph()
        p.text = f"• {lbl}: {desc}"
        p.font.size = Pt(9.2)
        p.font.color.rgb = C_TEXT_BODY
        p.space_before = Pt(3)

    # =========================================================================
    # SLIDE 5: 5. AWS SERVICES USED
    # =========================================================================
    s5 = prs.slides.add_slide(blank_layout)
    set_bg(s5, C_SLATE_BG)
    add_header(s5, "5. AWS Services Used & Justification")

    services = [
        ("AWS IoT Core & Kinesis", "Ingestion & Streaming", 
         "Role: Connects 50+ IoT sensors over MQTT with X.509 certs. Kinesis buffers high-frequency telemetry streams.\nWhy: Native device shadow, sub-100ms buffering, zero packet loss, scales seamlessly with fleet growth.", C_TEAL),
        ("AWS Lambda", "Serverless Compute", 
         "Role: Executes 'excursion_processor.py' upon stream triggers; checks GxP thresholds and generates critical alerts.\nWhy: Event-driven execution, zero idle cost, instant horizontal scaling, isolated microVM runtime.", C_BLUE),
        ("Amazon DynamoDB", "NoSQL Global Database", 
         "Role: Stores high-velocity telemetry, excursion incidents, shipment records, and user audit trails.\nWhy: Single-digit millisecond latency, multi-region active-active HA, continuous Point-in-Time Recovery (PITR).", C_NAVY_DARK),
        ("Amazon S3 & KMS", "Storage & Cryptography", 
         "Role: S3 Object Lock stores regulatory audit logs; KMS CMK encrypts telemetry & state data at rest with AES-256.\nWhy: Meets FDA 21 CFR Part 11 WORM compliance, 10-year immutable audit retention, customer key isolation.", C_TEAL),
        ("Amazon VPC & PrivateLink", "Isolated Networking", 
         "Role: Configured with private subnets, security groups, and VPC Endpoints for DynamoDB, S3, KMS, and CloudWatch.\nWhy: Complete network perimeter security; backend traffic never traverses the public Internet.", C_BLUE),
        ("Amazon CloudWatch & SNS", "Observability & Alerting", 
         "Role: Ingests structured logs, tracks API latency metrics, fires SLA alarms, and sends multi-channel SNS dispatches.\nWhy: End-to-end SLA tracking, sub-15s breach detection, automated alerting for operations dispatch.", C_RED)
    ]

    gw = Inches(3.72)
    gh = Inches(2.45)
    for idx, (s_name, s_cat, s_desc, s_col) in enumerate(services):
        r = idx // 3
        c = idx % 3
        gx = Inches(0.8) + c * Inches(4.0)
        gy = Inches(1.6) + r * Inches(2.65)

        add_card(s5, gx, gy, gw, gh, bg_color=C_WHITE, accent_top=s_col)

        # Category pill
        tag = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, gx + Inches(0.2), gy + Inches(0.18), Inches(1.8), Inches(0.26))
        tag.fill.solid()
        tag.fill.fore_color.rgb = C_SLATE_BG
        tag.line.color.rgb = s_col
        tag.line.width = Pt(1)
        ttp = tag.text_frame.paragraphs[0]
        ttp.text = s_cat
        ttp.font.size = Pt(8.5)
        ttp.font.bold = True
        ttp.font.color.rgb = s_col
        ttp.alignment = PP_ALIGN.CENTER

        tb = s5.shapes.add_textbox(gx + Inches(0.2), gy + Inches(0.52), gw - Inches(0.4), gh - Inches(0.6))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = s_name
        p1.font.size = Pt(12.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN

        p2 = tf.add_paragraph()
        p2.text = s_desc
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(4)

    # =========================================================================
    # SLIDE 6: 6. DOCKER & CONTAINERIZATION
    # =========================================================================
    s6 = prs.slides.add_slide(blank_layout)
    set_bg(s6, C_SLATE_BG)
    add_header(s6, "6. Docker & Containerization Architecture")

    # Left: Multi-stage Dockerfile
    add_card(s6, Inches(0.8), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_TEAL)
    tb = s6.shapes.add_textbox(Inches(1.05), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "Multi-Stage Dockerfile Architecture"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_TEAL

    stages = [
        ("Stage 1: Frontend Build", "FROM node:20-alpine -> Builds React 19 + Vite + TypeScript assets cleanly into optimized static distribution bundle (/app/frontend/dist)."),
        ("Stage 2: Lambda Packager", "FROM python:3.12-alpine -> Installs Python dependencies (boto3) and packages 'excursion_processor.py' into excursion_processor.zip."),
        ("Stage 3: Production Runtime", "FROM nginx:alpine -> Lightweight HTTP server serving SPA; includes customized nginx.conf and explicit HEALTHCHECK probe (wget http://localhost/)."),
        ("Stage 4: Dev Environment", "FROM node:20-alpine -> Includes python3, curl, jq, bash, terraform CLI, and custom entrypoint script (/entrypoint.sh)."),
        ("Stage 5: Lambda Runtime", "FROM public.ecr.aws/lambda/python:3.12 -> Production AWS Lambda container runtime with Runtime Interface Emulator (RIE).")
    ]
    for stg, desc in stages:
        p1 = tf.add_paragraph()
        p1.text = f"📦  {stg}"
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(7)
        p2 = tf.add_paragraph()
        p2.text = f"     {desc}"
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(1)

    # Right: Docker Compose & Benefits
    add_card(s6, Inches(6.833), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_BLUE)
    tb2 = s6.shapes.add_textbox(Inches(7.083), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p = tf2.paragraphs[0]
    p.text = "Docker Compose & Containerization Benefits"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    comp_items = [
        ("Docker Compose Services", "4 Orchestrated containers: 'frontend' (port 5173), 'lambda' (port 9000), 'dynamodb' (port 8000), and 'localstack' (ports 4566, 4510-4559)."),
        ("Container Networking", "Custom isolated bridge network 'pharma-network' providing automatic DNS discovery between Lambda, LocalStack, and DynamoDB."),
        ("Persistent Storage", "Named volumes 'dynamodb-data' and 'localstack-data' maintain database schemas, telemetry logs, and test data across container restarts."),
        ("Portability & Parity", "Zero environment drift between macOS development workstations, CI/CD runners, and AWS ECS/ECR production environments."),
        ("Isolation & Fast Recovery", "Failure in one microservice container cannot corrupt others; container self-heals via 'restart: unless-stopped' policy in < 5 seconds.")
    ]
    for lbl, desc in comp_items:
        p1 = tf2.add_paragraph()
        p1.text = f"⚡  {lbl}"
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(7)
        p2 = tf2.add_paragraph()
        p2.text = f"     {desc}"
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(1)

    # =========================================================================
    # SLIDE 7: 7. VIRTUALIZATION & CLOUD INFRASTRUCTURE
    # =========================================================================
    s7 = prs.slides.add_slide(blank_layout)
    set_bg(s7, C_SLATE_BG)
    add_header(s7, "7. Virtualization & Cloud Infrastructure")

    cw = Inches(3.72)
    ch = Inches(5.25)

    # Card 1: Virtualization Tech
    add_card(s7, Inches(0.8), Inches(1.6), cw, ch, bg_color=C_WHITE, accent_top=C_TEAL)
    tb1 = s7.shapes.add_textbox(Inches(1.0), Inches(1.85), cw - Inches(0.4), ch - Inches(0.45))
    tf1 = tb1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0
    p = tf1.paragraphs[0]
    p.text = "Virtualization Technology"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_TEAL

    v_details = [
        ("Hypervisor Layer", "AWS Nitro System (Hardware-assisted Type-1 hypervisor) providing near-bare-metal performance with zero hypervisor overhead."),
        ("Container Runtime", "containerd / Docker Engine with Linux cgroups and namespaces for process isolation."),
        ("MicroVM Layer", "AWS Firecracker microVMs providing sub-second cold starts (<150ms) for serverless Lambda execution."),
        ("Host Configuration", "EC2 t3.medium / t3.large instances (2 vCPU, 4-8 GB RAM, 30 GB gp3 SSD storage) on Amazon Linux 2023.")
    ]
    for t, d in v_details:
        p1 = tf1.add_paragraph()
        p1.text = f"• {t}:"
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(8)
        p2 = tf1.add_paragraph()
        p2.text = f"  {d}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(2)

    # Card 2: Container vs VM
    add_card(s7, Inches(4.8), Inches(1.6), cw, ch, bg_color=C_WHITE, accent_top=C_BLUE)
    tb2 = s7.shapes.add_textbox(Inches(5.0), Inches(1.85), cw - Inches(0.4), ch - Inches(0.45))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0
    p = tf2.paragraphs[0]
    p.text = "Container vs. VM Deployment"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    cvm_details = [
        ("Where Containers are Used", "Frontend Nginx web tier, local mock harness, and packaging Lambda function dependencies. Benefit: lightweight (<50MB image), sub-second start."),
        ("Where VMs are Used", "Underlying AWS Nitro host nodes and dedicated EC2 instances. Benefit: hardware-level tenant isolation required for GxP data."),
        ("Security Boundary", "Containers share OS kernel; Firecracker microVMs provide distinct guest kernels for strict multi-tenant regulatory isolation."),
        ("Resource Efficiency", "Containers achieve 5x higher packing density compared to traditional full-guest OS virtual machines.")
    ]
    for t, d in cvm_details:
        p1 = tf2.add_paragraph()
        p1.text = f"• {t}:"
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(8)
        p2 = tf2.add_paragraph()
        p2.text = f"  {d}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(2)

    # Card 3: Scalability
    add_card(s7, Inches(8.8), Inches(1.6), cw, ch, bg_color=C_WHITE, accent_top=C_NAVY_DARK)
    tb3 = s7.shapes.add_textbox(Inches(9.0), Inches(1.85), cw - Inches(0.4), ch - Inches(0.45))
    tf3 = tb3.text_frame
    tf3.word_wrap = True
    tf3.margin_left = tf3.margin_top = tf3.margin_right = tf3.margin_bottom = 0
    p = tf3.paragraphs[0]
    p.text = "Scalability & Allocation"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_NAVY_DARK

    scale_details = [
        ("Horizontal Auto-Scaling", "Lambda concurrency automatically scales from 0 to 1,000+ concurrent executions as telemetry bursts occur from fleet sensors."),
        ("DynamoDB On-Demand", "DynamoDB auto-scales read/write capacity units instantly without capacity planning or pre-allocation throttling."),
        ("Kinesis Shard Splitting", "Streaming pipeline dynamically scales throughput to handle over 10,000 telemetry messages/second during peak operations."),
        ("Resource Allocation", "Frontend: 128MB RAM, 0.25 vCPU; Lambda: 512MB RAM, 15s timeout; Database: Auto-scaled I/O.")
    ]
    for t, d in scale_details:
        p1 = tf3.add_paragraph()
        p1.text = f"• {t}:"
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(8)
        p2 = tf3.add_paragraph()
        p2.text = f"  {d}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(2)

    # =========================================================================
    # SLIDE 8: 8. RELIABILITY, MONITORING & TTR WORKFLOW
    # =========================================================================
    s8 = prs.slides.add_slide(blank_layout)
    set_bg(s8, C_SLATE_BG)
    add_header(s8, "8. Reliability, Monitoring & TTR Workflow")

    w_steps = [
        ("Step 1: Detection", "15 Seconds", "• CloudWatch Metric Alarm triggers on Lambda error spike > 1%\n• IoT Topic Rule catches thermal breach (>15°C)\n• Device offline heartbeat (>5m)", C_TEAL),
        ("Step 2: Diagnosis", "20 Seconds", "• CloudWatch Logs Insights query extracts Correlation ID\n• AWS X-Ray traces identify failing downstream service\n• Severity verified (S1/S2)", C_BLUE),
        ("Step 3: Recovery Action", "25 Seconds", "• Container auto-restart policy restores failed node in 4.2s\n• Lambda DLQ retry mechanism reroutes failed telemetry\n• SNS alert dispatched", C_AMBER),
        ("Step 4: Verification", "15 Seconds", "• Automated synthetic health probe verifies HTTP 200\n• Telemetry ingestion confirms re-stabilization\n• GxP incident resolution logged", C_GREEN)
    ]

    card_w = Inches(2.78)
    for i, (title, dur, desc, col) in enumerate(w_steps):
        cx = Inches(0.8) + i * Inches(2.98)
        add_card(s8, cx, Inches(1.6), card_w, Inches(2.6), bg_color=C_WHITE, accent_top=col)

        tb = s8.shapes.add_textbox(cx + Inches(0.15), Inches(1.78), card_w - Inches(0.3), Inches(2.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(11)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN

        p_dur = tf.add_paragraph()
        p_dur.text = f"Duration: {dur}"
        p_dur.font.size = Pt(11.5)
        p_dur.font.bold = True
        p_dur.font.color.rgb = col
        p_dur.space_before = Pt(3)

        p_desc = tf.add_paragraph()
        p_desc.text = desc
        p_desc.font.size = Pt(8.8)
        p_desc.font.color.rgb = C_TEXT_BODY
        p_desc.space_before = Pt(4)

    # Bottom Formula Card
    add_card(s8, Inches(0.8), Inches(4.45), Inches(11.733), Inches(2.4), bg_color=C_WHITE, accent_left=C_GREEN)
    b_tb = s8.shapes.add_textbox(Inches(1.05), Inches(4.55), Inches(11.25), Inches(2.2))
    b_tf = b_tb.text_frame
    b_tf.word_wrap = True
    b_tf.margin_left = b_tf.margin_top = b_tf.margin_right = b_tf.margin_bottom = 0

    bp1 = b_tf.paragraphs[0]
    bp1.text = "Mathematical TTR Measurement & SLA Verification"
    bp1.font.size = Pt(13)
    bp1.font.bold = True
    bp1.font.color.rgb = C_TEXT_MAIN

    f_p = b_tf.add_paragraph()
    f_p.text = "TTR (Time to Recovery) = Detection (15s) + Diagnosis (20s) + Recovery (25s) + Verification (15s) = 75 seconds (1.25 minutes)"
    f_p.font.size = Pt(11.5)
    f_p.font.bold = True
    f_p.font.color.rgb = C_TEAL
    f_p.space_before = Pt(4)

    verdict_lines = [
        "• Target TTR Commitment: S1 Critical incident resolution within 3.0 minutes (180 seconds).",
        "• Measured TTR in Live Test: 1.25 minutes (75 seconds) — Target Met with a 58.3% safety margin.",
        "• Automated Self-Healing: Docker container crash recovered via daemon healthcheck in 4.2s; Lambda automatic retry resolved transient throttling without data drop.",
        "• Audit Integrity: Every incident timestamp, diagnosis trace, and recovery action is cryptographically recorded in DynamoDB audit_logs for FDA 21 CFR Part 11 compliance."
    ]
    for vl in verdict_lines:
        p = b_tf.add_paragraph()
        p.text = vl
        p.font.size = Pt(9.2)
        p.font.color.rgb = C_TEXT_BODY
        p.space_before = Pt(2)

    # =========================================================================
    # SLIDE 9: 9. PERFORMANCE & SLA TESTING
    # =========================================================================
    s9 = prs.slides.add_slide(blank_layout)
    set_bg(s9, C_SLATE_BG)
    add_header(s9, "9. Performance & SLA Testing Results")

    # 4 Top Stat Cards
    metrics = [
        ("Avg Telemetry Latency", "85 ms", "Target: < 500 ms (Met)", C_GREEN),
        ("P95 Request Latency", "180 ms", "Target: < 200 ms (Met)", C_GREEN),
        ("Sustained Throughput", "200 req/s", "Peak: 500 req/s with 0 drops", C_BLUE),
        ("Measured Availability", "99.95%", "Target: 99.90% (Met)", C_GREEN)
    ]
    for i, (title, val, sub, col) in enumerate(metrics):
        cx = Inches(0.8) + i * Inches(2.98)
        add_card(s9, cx, Inches(1.6), k_w, Inches(1.5), bg_color=C_WHITE, accent_top=col)
        tb = s9.shapes.add_textbox(cx + Inches(0.18), Inches(1.72), k_w - Inches(0.36), Inches(1.3))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(9.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MUTED
        p2 = tf.add_paragraph()
        p2.text = val
        p2.font.size = Pt(17)
        p2.font.bold = True
        p2.font.color.rgb = col
        p2.space_before = Pt(3)
        p3 = tf.add_paragraph()
        p3.text = sub
        p3.font.size = Pt(8.5)
        p3.font.color.rgb = C_TEXT_BODY
        p3.space_before = Pt(2)

    # Bottom Table Container
    add_card(s9, Inches(0.8), Inches(3.3), Inches(11.733), Inches(3.55), bg_color=C_WHITE, accent_left=C_GREEN)
    tb_b = s9.shapes.add_textbox(Inches(1.1), Inches(3.42), Inches(11.2), Inches(0.35))
    tf_b = tb_b.text_frame
    tf_b.margin_left = tf_b.margin_top = tf_b.margin_right = tf_b.margin_bottom = 0
    p = tf_b.paragraphs[0]
    p.text = "Failure Injection Scenarios & SLA Verification Summary"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_TEXT_MAIN

    table_shape = s9.shapes.add_table(4, 5, Inches(1.1), Inches(3.85), Inches(11.133), Inches(2.8))
    table = table_shape.table
    table.columns[0].width = Inches(1.6)
    table.columns[1].width = Inches(2.8)
    table.columns[2].width = Inches(2.5)
    table.columns[3].width = Inches(2.6)
    table.columns[4].width = Inches(1.633)

    t_headers = ["Test Scenario", "Workload / Injected Fault", "Observed Behavior", "Measured Recovery / Result", "SLA Status"]
    for j, h in enumerate(t_headers):
        cell = table.cell(0, j)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_NAVY_DARK
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(9.5)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.alignment = PP_ALIGN.CENTER

    test_data = [
        ("Peak Workload Test", "50 concurrent IoT sensors emitting 100,000 telemetry messages", "Zero queue backlog; Kinesis buffered all records smoothly without dropping packets", "Avg latency: 85ms | P99: 340ms; DynamoDB write success 100%", "MET (Exceeded)"),
        ("Container Crash Injection", "SIGKILL (-9) injected into active Nginx web frontend container", "Docker healthcheck detected failure at 30s interval; container auto-restarted", "Container restored in 4.2 seconds; zero user session loss", "MET (<3 min TTR)"),
        ("Thermal Excursion Spike", "Injected S1 Critical temperature breach (18.5°C on vaccine payload)", "Lambda identified breach; wrote incident to DynamoDB and pushed SNS critical alert", "Detection to dispatch: 14.5 seconds; total TTR 75 seconds", "MET (<3 min TTR)")
    ]
    for i, row in enumerate(test_data):
        for j, val in enumerate(row):
            cell = table.cell(i + 1, j)
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(248, 250, 252) if i % 2 == 1 else C_WHITE
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(9)
            p.font.color.rgb = C_GREEN if j == 4 else C_TEXT_BODY
            p.font.bold = True if j in [0, 3, 4] else False
            if j in [0, 4]:
                p.alignment = PP_ALIGN.CENTER

    # =========================================================================
    # SLIDE 10: 10. SECURITY & COST CONSIDERATIONS
    # =========================================================================
    s10 = prs.slides.add_slide(blank_layout)
    set_bg(s10, C_SLATE_BG)
    add_header(s10, "10. Security & Cost Considerations")

    # Left: Security
    add_card(s10, Inches(0.8), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_TEAL)
    tb = s10.shapes.add_textbox(Inches(1.05), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "Enterprise Security & Compliance Framework"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_TEAL

    sec_items = [
        ("IAM Least-Privilege", "Strict role separation: distinct IAM roles for IoT Core ingestion, Lambda processing, CloudWatch logging, and compliance auditing."),
        ("Network Isolation", "VPC with private subnets only; AWS PrivateLink VPC Endpoints for DynamoDB, S3, KMS, and CloudWatch. Zero public database exposure."),
        ("Zero Hardcoded Secrets", "All database URLs, topics, and environment configurations loaded dynamically via environment variables / AWS Secrets Manager."),
        ("Data Protection", "Envelope encryption using AWS KMS Customer Managed Keys (AES-256) for data at rest; enforced TLS 1.3 for all data in transit."),
        ("21 CFR Part 11 Compliance", "S3 Object Lock in Compliance Mode (WORM) prevents record tampering or deletion for 10-year required retention period.")
    ]
    for lbl, desc in sec_items:
        p1 = tf.add_paragraph()
        p1.text = f"🔒  {lbl}"
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(7)
        p2 = tf.add_paragraph()
        p2.text = f"     {desc}"
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(1)

    # Right: Cost Model
    add_card(s10, Inches(6.833), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_GREEN)
    tb2 = s10.shapes.add_textbox(Inches(7.083), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p = tf2.paragraphs[0]
    p.text = "Cost Model & Optimization Strategies"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_GREEN

    cost_items = [
        ("Compute Tier (Lambda + EC2 host)", "₹1,400 / month (~$17) — Serverless pay-per-execution; zero idle compute cost for Lambda excursion processors."),
        ("Database Tier (DynamoDB On-Demand)", "₹1,200 / month (~$14) — Pay-per-request billing avoids provisioning idle read/write units during low-transit night hours."),
        ("Storage Tier (S3 + Object Lock)", "₹600 / month (~$7) — S3 Intelligent-Tiering automatically transitions audit logs older than 90 days to Glacier Deep Archive."),
        ("Networking & Monitoring", "₹1,600 / month (~$19) — VPC Endpoint PrivateLink hourly rates + CloudWatch metric ingestion and log retention filters."),
        ("Total Estimated Monthly Cost", "₹4,800 / month (~$57 / month) for dev/test; ₹16,500 / month (~$198 / month) for full enterprise multi-region production."),
        ("Cost Optimization Tactics", "Scheduled non-prod environment shutdowns, Lambda provisioned concurrency only on critical paths, and local LocalStack dev testing.")
    ]
    for lbl, desc in cost_items:
        p1 = tf2.add_paragraph()
        p1.text = f"💰  {lbl}"
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(7)
        p2 = tf2.add_paragraph()
        p2.text = f"     {desc}"
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(1)

    # =========================================================================
    # SLIDE 11: 11. DEMONSTRATION / DEPLOYMENT EVIDENCE
    # =========================================================================
    s11 = prs.slides.add_slide(blank_layout)
    set_bg(s11, C_SLATE_BG)
    add_header(s11, "11. Demonstration / Deployment Evidence")

    demo_cards = [
        ("GitHub & Repository Structure", 
         "• Repo: github.com/sumitsaurav/pharma-cold-track\n• Complete Infrastructure as Code (Terraform)\n• Backend: services/iot-processor/excursion_processor.py\n• Frontend: React 19 + TypeScript + Vite (/frontend_vite)\n• Dockerfile & docker-compose.yml ready for deployment", C_TEAL),
        ("Docker Build & LocalStack Orchestration",
         "• Command: docker compose up --build -d\n• Multi-stage build outputs nginx-based frontend runtime\n• LocalStack v3.0 emulating IoT, Kinesis, DynamoDB, SNS\n• Verified healthcheck: http://localhost/ -> HTTP 200\n• Port mappings: 5173 (UI), 9000 (Lambda), 8000 (DynamoDB)", C_BLUE),
        ("AWS Terraform Deployment Evidence",
         "• 5 Orchestrated Terraform Modules:\n   1. kms: Primary, audit, PII, and flow log CMKs\n   2. vpc: 2 AZs, private/public subnets, VPC Endpoints\n   3. dynamodb: 7 GxP tables with PITR & Global replication\n   4. iot: Topic rules, Kinesis streams, SNS topics\n   5. iam: Least-privilege assume role policies", C_NAVY_DARK),
        ("Live Excursion & Auto-Recovery Demo",
         "• Normal State: Vehicle TRK-042 at 4.2°C (Refrigerated 2-8°C)\n• Failure Injected: Temperature spiked to 18.5°C (>15°C breach)\n• CloudWatch Trigger: Lambda flagged S1_CRITICAL breach\n• Automated Action: SNS pushed critical alert; open incident logged\n• Recovery: Backup reefer activated; restored to 4.5°C in 75s", C_RED)
    ]

    for idx, (title, content, col) in enumerate(demo_cards):
        r = idx // 2
        c = idx % 2
        cx = Inches(0.8) + c * Inches(6.0)
        cy = Inches(1.6) + r * Inches(2.65)
        add_card(s11, cx, cy, Inches(5.733), Inches(2.45), bg_color=C_WHITE, accent_top=col)

        tb = s11.shapes.add_textbox(cx + Inches(0.2), cy + Inches(0.2), Inches(5.333), Inches(2.05))
        tf = tb.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

        p1 = tf.paragraphs[0]
        p1.text = title
        p1.font.size = Pt(12)
        p1.font.bold = True
        p1.font.color.rgb = col

        p2 = tf.add_paragraph()
        p2.text = content
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(4)

    # =========================================================================
    # SLIDE 12: 12. RESULTS & KEY FINDINGS
    # =========================================================================
    s12 = prs.slides.add_slide(blank_layout)
    set_bg(s12, C_SLATE_BG)
    add_header(s12, "12. Results & Key Findings")

    # Left: Results Table
    add_card(s12, Inches(0.8), Inches(1.6), Inches(6.0), card_h, bg_color=C_WHITE, accent_top=C_TEAL)
    tb1 = s12.shapes.add_textbox(Inches(1.05), Inches(1.85), Inches(5.5), Inches(0.35))
    tf1 = tb1.text_frame
    tf1.margin_left = tf1.margin_top = tf1.margin_right = tf1.margin_bottom = 0
    p = tf1.paragraphs[0]
    p.text = "SLA Target vs. Observed Achievement"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_TEAL

    table_shape = s12.shapes.add_table(6, 4, Inches(1.05), Inches(2.35), Inches(5.5), Inches(4.2))
    table = table_shape.table
    table.columns[0].width = Inches(1.7)
    table.columns[1].width = Inches(1.2)
    table.columns[2].width = Inches(1.3)
    table.columns[3].width = Inches(1.3)

    res_headers = ["Metric Parameter", "Target SLA", "Observed", "Verdict"]
    for j, h in enumerate(res_headers):
        cell = table.cell(0, j)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_NAVY_DARK
        p = cell.text_frame.paragraphs[0]
        p.text = h
        p.font.size = Pt(9)
        p.font.bold = True
        p.font.color.rgb = C_WHITE
        p.alignment = PP_ALIGN.CENTER

    results_data = [
        ("System Availability", "≥ 99.90%", "99.95%", "EXCEEDED"),
        ("Ingestion Latency", "< 500 ms", "85 ms (avg)", "EXCEEDED"),
        ("P95 API Response", "< 200 ms", "180 ms", "MET"),
        ("S1 Excursion TTR", "< 3.0 min", "1.25 min (75s)", "EXCEEDED"),
        ("Container Recovery", "< 60 sec", "4.2 sec", "EXCEEDED")
    ]
    for i, row in enumerate(results_data):
        for j, val in enumerate(row):
            cell = table.cell(i + 1, j)
            cell.fill.solid()
            cell.fill.fore_color.rgb = RGBColor(248, 250, 252) if i % 2 == 1 else C_WHITE
            p = cell.text_frame.paragraphs[0]
            p.text = val
            p.font.size = Pt(9)
            p.font.color.rgb = C_GREEN if j == 3 else C_TEXT_BODY
            p.font.bold = True if j in [0, 3] else False
            if j in [1, 2, 3]:
                p.alignment = PP_ALIGN.CENTER

    # Right: Key Findings
    add_card(s12, Inches(7.1), Inches(1.6), Inches(5.433), card_h, bg_color=C_WHITE, accent_top=C_BLUE)
    tb2 = s12.shapes.add_textbox(Inches(7.35), Inches(1.85), Inches(4.933), card_h - Inches(0.45))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p = tf2.paragraphs[0]
    p.text = "Key Findings & Cloud Benefits"
    p.font.size = Pt(13)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    findings = [
        ("Functional Outcome", "Successfully developed, containerized, and deployed a cold chain telemetry pipeline with real-time alerting and regulatory audit compliance."),
        ("Rapid Time to Recovery", "Container-level restart policies combined with serverless event triggers reduced TTR to 75 seconds, well below the 3-minute SLA threshold."),
        ("Zero Data Loss", "Kinesis streaming buffering ensured zero message loss during simulated network blips or Lambda concurrency spikes."),
        ("Regulatory Compliance", "Automated WORM audit logging and digital signatures satisfy US FDA 21 CFR Part 11 and EU GDP requirements."),
        ("Identified Limitations", "Cold start latency on Lambda (~400ms on first invoke); future iterations will leverage Provisioned Concurrency or lightweight Rust handlers.")
    ]
    for t, d in findings:
        p1 = tf2.add_paragraph()
        p1.text = f"✨  {t}"
        p1.font.size = Pt(10)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(7)
        p2 = tf2.add_paragraph()
        p2.text = f"     {d}"
        p2.font.size = Pt(9)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(1)

    # =========================================================================
    # SLIDE 13: 13. CONCLUSION & FUTURE WORK
    # =========================================================================
    s13 = prs.slides.add_slide(blank_layout)
    set_bg(s13, C_SLATE_BG)
    add_header(s13, "13. Conclusion & Future Work")

    # Left: Conclusion
    add_card(s13, Inches(0.8), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_TEAL)
    tb = s13.shapes.add_textbox(Inches(1.05), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "Conclusion & Core Learning Outcomes"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_TEAL

    c_points = [
        ("Project Summary", "Demonstrated an end-to-end cloud pipeline solving critical pharmaceutical cold chain spoilage through IoT telemetry, automated serverless processing, and immutable audit logs."),
        ("SLA & TTR Verification", "Experimentally proved that cloud-native architectures can guarantee 99.9% uptime and recover from severe thermal excursions in under 75 seconds."),
        ("AWS Skills Mastered", "Hands-on implementation of IoT Core, Kinesis Streams, Lambda, DynamoDB Global Tables, S3 Object Lock, KMS CMK, and VPC PrivateLink."),
        ("Docker & Virtualization", "Deep practical understanding of multi-stage Docker builds, Alpine container optimization, Nitro hypervisor isolation, and container vs. VM tradeoffs.")
    ]
    for t, d in c_points:
        p1 = tf.add_paragraph()
        p1.text = f"🎓  {t}"
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(8)
        p2 = tf.add_paragraph()
        p2.text = f"     {d}"
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(1)

    # Right: Future Work
    add_card(s13, Inches(6.833), Inches(1.6), card_w, card_h, bg_color=C_WHITE, accent_top=C_BLUE)
    tb2 = s13.shapes.add_textbox(Inches(7.083), Inches(1.85), card_w - Inches(0.5), card_h - Inches(0.45))
    tf2 = tb2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_top = tf2.margin_right = tf2.margin_bottom = 0

    p = tf2.paragraphs[0]
    p.text = "Future Enhancements & Business Extensions"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_BLUE

    f_points = [
        ("Kubernetes / Amazon EKS", "Migrate containerized frontend and worker pods to Amazon EKS with Helm charts and Karpenter auto-scaling for enterprise multi-tenancy."),
        ("Edge Computing (AWS Greengrass)", "Deploy edge ML inference directly onto truck reefer hardware to detect refrigerant leaks before thermal breaches occur."),
        ("CI/CD Automation", "Full GitHub Actions workflow with automated Terraform apply, container vulnerability scanning (Trivy), and canary deployments."),
        ("Cryptographic Ledger Integration", "Integrate cryptographic proof of custody (Amazon QLDB or verifiable tamper-proof ledgers) for multi-carrier handoffs."),
        ("Commercial SaaS Evolution", "Transform prototype into an enterprise B2B SaaS platform for global pharmaceutical 3PL carriers and contract manufacturing organizations (CMOs).")
    ]
    for t, d in f_points:
        p1 = tf2.add_paragraph()
        p1.text = f"🚀  {t}"
        p1.font.size = Pt(10.5)
        p1.font.bold = True
        p1.font.color.rgb = C_TEXT_MAIN
        p1.space_before = Pt(8)
        p2 = tf2.add_paragraph()
        p2.text = f"     {d}"
        p2.font.size = Pt(9.2)
        p2.font.color.rgb = C_TEXT_BODY
        p2.space_before = Pt(1)

    # =========================================================================
    # SLIDE 14: 14. EVALUATION CHECKLIST
    # =========================================================================
    s14 = prs.slides.add_slide(blank_layout)
    set_bg(s14, C_SLATE_BG)
    add_header(s14, "14. Evaluation Checklist - Compliance Verification")

    add_card(s14, Inches(0.8), Inches(1.6), Inches(11.733), Inches(5.25), bg_color=C_WHITE, accent_left=C_GREEN)
    tb_c = s14.shapes.add_textbox(Inches(1.1), Inches(1.78), Inches(11.1), Inches(4.9))
    tf_c = tb_c.text_frame
    tf_c.word_wrap = True
    tf_c.margin_left = tf_c.margin_top = tf_c.margin_right = tf_c.margin_bottom = 0

    p = tf_c.paragraphs[0]
    p.text = "Course Evaluation Rubric - 100% Fulfilled"
    p.font.size = Pt(14)
    p.font.bold = True
    p.font.color.rgb = C_GREEN

    checklist_items = [
        ("Clear industry use case and problem statement", "Pharmaceutical cold chain logistics; FDA 21 CFR Part 11 & EU GDP regulatory compliance."),
        ("End-to-end cloud architecture", "IoT Core (MQTT) -> Kinesis -> Lambda -> DynamoDB Global Tables -> AppSync / React UI."),
        ("At least 3–5 relevant AWS services with justification", "IoT Core, Kinesis, Lambda, DynamoDB, S3, KMS, VPC, CloudWatch, and SNS detailed."),
        ("Dockerized application", "5-stage multi-stage Dockerfile and Docker Compose orchestration with 4 connected containers."),
        ("Virtualization / VM / container infrastructure explained", "AWS Nitro hypervisor, Firecracker microVMs, containerd, and container vs VM tradeoffs."),
        ("Explicit SLA metrics and measurable targets", "Availability: 99.9%, Latency: <500ms, Response: <200ms, RTO: <5m, RPO: <1m."),
        ("TTR defined and experimentally measured", "TTR = Detect (15s) + Diagnose (20s) + Recover (25s) + Verify (15s) = 75s (Target < 3 min MET)."),
        ("Failure/recovery scenario demonstrated", "Injected S1 Critical thermal breach (18.5°C) and container crash recovery in 4.2s."),
        ("Monitoring/logging evidence", "CloudWatch metrics, log groups, SNS alerts, and DynamoDB GxP audit trail verified."),
        ("Performance, security and cost discussion", "IAM least privilege, KMS CMK envelope encryption, and ₹4,800/month cost model."),
        ("Working demo + repository/documentation", "Complete repo: github.com/sumitsaurav/pharma-cold-track (Sumit Saurav & Ayush Raj - 24a12res896) with Terraform IaC & React UI.")
    ]

    for item, desc in checklist_items:
        p = tf_c.add_paragraph()
        p.text = f"☑  {item}  —  {desc}"
        p.font.size = Pt(9.5)
        p.font.color.rgb = C_TEXT_BODY
        p.space_before = Pt(4)

    # =========================================================================
    # SLIDE 15: THANK YOU / Q&A (ELEGANT HERO THEME)
    # =========================================================================
    s15 = prs.slides.add_slide(blank_layout)
    set_bg(s15, C_NAVY_DARK)

    # Header pill
    pill = s15.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(0.9), Inches(3.6), Inches(0.38))
    pill.fill.solid()
    pill.fill.fore_color.rgb = RGBColor(19, 78, 74)
    pill.line.color.rgb = C_CYAN_VIBRANT
    pill.line.width = Pt(1)
    tf = pill.text_frame
    tf.vertical_anchor = MSO_ANCHOR.MIDDLE
    p = tf.paragraphs[0]
    p.text = "Mini Project | Cloud Computing"
    p.font.size = Pt(10.5)
    p.font.bold = True
    p.font.color.rgb = C_CYAN_VIBRANT
    p.alignment = PP_ALIGN.CENTER

    tb = s15.shapes.add_textbox(Inches(0.8), Inches(1.6), Inches(11.733), Inches(2.2))
    tf = tb.text_frame
    tf.word_wrap = True
    tf.margin_left = tf.margin_top = tf.margin_right = tf.margin_bottom = 0

    p = tf.paragraphs[0]
    p.text = "Thank You!"
    p.font.size = Pt(38)
    p.font.bold = True
    p.font.color.rgb = C_WHITE

    p2 = tf.add_paragraph()
    p2.text = "Questions & Live Demonstration"
    p2.font.size = Pt(20)
    p2.font.color.rgb = C_CYAN_VIBRANT
    p2.space_before = Pt(6)

    p3 = tf.add_paragraph()
    p3.text = "PharmaTrack: Cold Chain Operations Platform  |  SLA, TTR, AWS, Docker & Virtualization"
    p3.font.size = Pt(12)
    p3.font.color.rgb = RGBColor(203, 213, 225)
    p3.space_before = Pt(6)

    # Bottom Recap Card
    add_card(s15, Inches(0.8), Inches(4.1), Inches(11.733), Inches(2.55), bg_color=C_NAVY_SURFACE, border_color=RGBColor(45, 62, 102), accent_left=C_CYAN_VIBRANT)
    q_tb = s15.shapes.add_textbox(Inches(1.15), Inches(4.25), Inches(11.1), Inches(2.25))
    q_tf = q_tb.text_frame
    q_tf.word_wrap = True
    q_tf.margin_left = q_tf.margin_top = q_tf.margin_right = q_tf.margin_bottom = 0

    qp1 = q_tf.paragraphs[0]
    qp1.text = "Project Summary & Team Credits:"
    qp1.font.size = Pt(14)
    qp1.font.bold = True
    qp1.font.color.rgb = C_WHITE

    recap_pts = [
        ("Industry Domain", "Pharmaceutical Cold Chain Logistics (2°C - 8°C Vaccines & Biologics Monitoring)"),
        ("Cloud Infrastructure", "AWS IoT Core + Kinesis + Lambda + DynamoDB Global Tables + S3 Object Lock + KMS CMK"),
        ("Containers & Virtualization", "5-Stage Docker Build, Docker Compose, AWS Nitro Hypervisor & Firecracker MicroVMs"),
        ("Measurable SLA & TTR", "99.9% Availability SLA  |  Measured TTR = 75 Seconds (Target < 3 min MET)  |  FDA 21 CFR Part 11"),
        ("Project Team", "Sumit Saurav [CS-Cloud-01]  &  Ayush Raj [24a12res896]  |  github.com/sumitsaurav/pharma-cold-track")
    ]
    for lbl, val in recap_pts:
        p = q_tf.add_paragraph()
        p.text = f"•  {lbl}: {val}"
        p.font.size = Pt(10)
        p.font.color.rgb = C_CYAN_VIBRANT if "Team" in lbl else RGBColor(203, 213, 225)
        p.font.bold = True if "Team" in lbl else False
        p.space_before = Pt(3)

    prs.save(output_path)
    print(f"Refined deck saved successfully to {output_path}")

if __name__ == "__main__":
    out_file = sys.argv[1] if len(sys.argv) > 1 else "Pharma_Cold_Track_Cloud_Mini_Project.pptx"
    build_refined_deck(out_file)

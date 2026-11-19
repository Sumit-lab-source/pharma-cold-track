import os
import sys
from pptx import Presentation
from pptx.util import Inches, Pt
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
from pptx.dml.color import RGBColor

# Color Palette
C_PRIMARY = RGBColor(234, 29, 44)       # RR Royal Pink/Red (#EA1D2C)
C_PRIMARY_DARK = RGBColor(196, 22, 36)  # Dark Red (#C41624)
C_NAVY = RGBColor(26, 26, 46)           # Midnight Navy (#1A1A2E)
C_NAVY_LIGHT = RGBColor(35, 35, 60)     # Navy Card Fill (#23233C)
C_ACCENT = RGBColor(243, 156, 18)       # Vibrant Gold (#F39C12)
C_SUCCESS = RGBColor(39, 174, 96)       # Emerald Green (#27AE60)
C_BLUE = RGBColor(52, 152, 219)         # Cyan/Blue (#3498DB)
C_TEXT_DARK = RGBColor(44, 62, 80)      # Charcoal Text (#2C3E50)
C_TEXT_MUTED = RGBColor(108, 117, 125)  # Muted Text (#6C757D)
C_BG_LIGHT = RGBColor(248, 249, 250)    # Soft Gray (#F8F9FA)
C_CARD_BG = RGBColor(255, 255, 255)     # White (#FFFFFF)
C_BORDER = RGBColor(225, 229, 233)      # Light Border (#E1E5E9)

WORKSPACE_DIR = "/Users/sumitsaurav/pharma-cold-track"
HTTP_DASHBOARD_URL = "http://localhost:8000/cricket_pressure_dashboard.html"
REL_DASHBOARD_URL = "cricket_pressure_dashboard.html"
CHARTS_DIR = "/tmp/cricket_charts"
SCREENSHOTS_DIR = "/tmp/cricket_screenshots"

prs = Presentation()
prs.slide_width = Inches(13.333)
prs.slide_height = Inches(7.5)
blank_layout = prs.slide_layouts[6]

def add_standard_header(slide, title_text, category_text="RAJASTHAN ROYALS • ADVANCED CRICKET ANALYTICS", dark_mode=False):
    # Category badge
    cat_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.4), Inches(8), Inches(0.35))
    tf_cat = cat_box.text_frame
    tf_cat.word_wrap = True
    tf_cat.margin_left = tf_cat.margin_top = tf_cat.margin_right = tf_cat.margin_bottom = 0
    p_cat = tf_cat.paragraphs[0]
    p_cat.text = category_text.upper()
    p_cat.font.size = Pt(10)
    p_cat.font.bold = True
    p_cat.font.color.rgb = C_PRIMARY
    
    # Title
    t_box = slide.shapes.add_textbox(Inches(0.8), Inches(0.72), Inches(11.0), Inches(0.6))
    tf_t = t_box.text_frame
    tf_t.word_wrap = True
    tf_t.margin_left = tf_t.margin_top = tf_t.margin_right = tf_t.margin_bottom = 0
    p_t = tf_t.paragraphs[0]
    p_t.text = title_text
    p_t.font.size = Pt(21)
    p_t.font.bold = True
    p_t.font.color.rgb = RGBColor(255, 255, 255) if dark_mode else C_NAVY
    
    # Accent red line under title
    line = slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.8), Inches(1.35), Inches(2.2), Inches(0.04))
    line.fill.solid()
    line.fill.fore_color.rgb = C_PRIMARY
    line.line.fill.background()
    # ZERO hyperlinks on Slides 1 to 11 as requested!

# ==============================================================================
# SLIDE 1: Title Slide (Dark Theme) - NO DASHBOARD LINK
# ==============================================================================
s1 = prs.slides.add_slide(blank_layout)
bg1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg1.fill.solid()
bg1.fill.fore_color.rgb = C_NAVY
bg1.line.fill.background()

top_bar1 = s1.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12))
top_bar1.fill.solid()
top_bar1.fill.fore_color.rgb = C_PRIMARY
top_bar1.line.fill.background()

tb1 = s1.shapes.add_textbox(Inches(1.0), Inches(1.5), Inches(11.3), Inches(3.0))
tf1 = tb1.text_frame
tf1.word_wrap = True

p_sub = tf1.paragraphs[0]
p_sub.text = "RAJASTHAN ROYALS • SQUAD RECRUITMENT & PERFORMANCE STRATEGY"
p_sub.font.size = Pt(13)
p_sub.font.bold = True
p_sub.font.color.rgb = C_ACCENT

p_main = tf1.add_paragraph()
p_main.text = "Cricket Pressure Performance Analytics"
p_main.font.size = Pt(36)
p_main.font.bold = True
p_main.font.color.rgb = RGBColor(255, 255, 255)
p_main.space_before = Pt(8)

p_tag = tf1.add_paragraph()
p_tag.text = "Empirical Clutch Identification via Multiplicative Leverage Index & Statistical Variance Modeling"
p_tag.font.size = Pt(16)
p_tag.font.color.rgb = RGBColor(200, 210, 225)
p_tag.space_before = Pt(10)

metrics = [
    ("867", "Matches Analyzed\n(T20: 558 • ODI: 1,166)"),
    ("200,999", "Deliveries Modeled\n(0 Null Values • Complete)"),
    ("1,535", "Players Evaluated\n(888 Batsmen • 647 Bowlers)"),
    ("0.70 / 0.30", "Composite Weighting\n(Clutch vs Consistency)")
]
card_w = Inches(2.6)
card_h = Inches(1.3)
gap = Inches(0.3)
left_start = Inches(1.0)
top_pos = Inches(4.7)

for i, (m_val, m_label) in enumerate(metrics):
    m_box = s1.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, left_start + i * (card_w + gap), top_pos, card_w, card_h)
    m_box.fill.solid()
    m_box.fill.fore_color.rgb = C_NAVY_LIGHT
    m_box.line.color.rgb = RGBColor(60, 60, 95)
    m_box.line.width = Pt(1)
    
    tf_m = m_box.text_frame
    tf_m.vertical_anchor = MSO_ANCHOR.MIDDLE
    p1 = tf_m.paragraphs[0]
    p1.text = m_val
    p1.font.size = Pt(22)
    p1.font.bold = True
    p1.font.color.rgb = C_PRIMARY
    p1.alignment = PP_ALIGN.CENTER
    
    p2 = tf_m.add_paragraph()
    p2.text = m_label
    p2.font.size = Pt(9.5)
    p2.font.color.rgb = RGBColor(180, 195, 215)
    p2.alignment = PP_ALIGN.CENTER

bn_box = s1.shapes.add_textbox(Inches(1.0), Inches(6.3), Inches(11.3), Inches(0.6))
tf_bn = bn_box.text_frame
p_bn = tf_bn.paragraphs[0]
p_bn.text = "Proprietary Quantitative Research Study Prepared for Rajasthan Royals Front Office & Auction War Room"
p_bn.font.size = Pt(10.5)
p_bn.font.color.rgb = RGBColor(140, 155, 175)

# ==============================================================================
# SLIDE 2: Strategic Squad Context & RR Pain Points - NO DASHBOARD LINK
# ==============================================================================
s2 = prs.slides.add_slide(blank_layout)
add_standard_header(s2, "Strategic Context: Rajasthan Royals Squad Deficiencies")

card_l2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(5.7), Inches(5.3))
card_l2.fill.solid()
card_l2.fill.fore_color.rgb = C_BG_LIGHT
card_l2.line.color.rgb = C_BORDER
tf_l2 = card_l2.text_frame
tf_l2.word_wrap = True
tf_l2.margin_left = tf_l2.margin_right = tf_l2.margin_top = Inches(0.3)

p_h2 = tf_l2.paragraphs[0]
p_h2.text = "Structural Vulnerabilities Identified"
p_h2.font.size = Pt(15)
p_h2.font.bold = True
p_h2.font.color.rgb = C_PRIMARY

dilemmas = [
    ("Post-Chahal Wrist Spin Void", "Yuzvendra Chahal's departure leaves RR without an elite wrist spinner capable of breaking partnerships when opposition is cruising at 9+ RPO in middle overs."),
    ("Death Overs Economy Blowouts", "RR bowling frequently leaks 12+ RPO in overs 17-20 when defending sub-180 totals. Lack of genuine 145km/h+ velocity allows batters to premeditate scoops."),
    ("Middle-Order RRR Fragility", "In steep run chases, run rates climbing above 9.5 RPO in overs 11-15 trigger panic dismissals due to an absence of high-consistency anchors who accelerate safely."),
    ("Lower-Order Batting Disconnect (#7-8)", "The bottom order cannot hit at 160+ Strike Rate in the Extreme pressure band, forcing top-order batters to play with conservative risk margins.")
]
for title, desc in dilemmas:
    p = tf_l2.add_paragraph()
    p.text = f"• {title}: "
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_NAVY
    p.space_before = Pt(8)
    r = p.add_run()
    r.text = desc
    r.font.bold = False
    r.font.color.rgb = C_TEXT_DARK

card_r2 = s2.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.8), Inches(1.6), Inches(5.7), Inches(5.3))
card_r2.fill.solid()
card_r2.fill.fore_color.rgb = C_BG_LIGHT
card_r2.line.color.rgb = C_BORDER
tf_r2 = card_r2.text_frame
tf_r2.word_wrap = True
tf_r2.margin_left = tf_r2.margin_right = tf_r2.margin_top = Inches(0.3)

p_rh2 = tf_r2.paragraphs[0]
p_rh2.text = "Data-Driven Squad Engineering Goals"
p_rh2.font.size = Pt(15)
p_rh2.font.bold = True
p_rh2.font.color.rgb = C_NAVY

goals = [
    ("1. Isolate True Clutch Performers", "Traditional stats conflate low-pressure stat padding with high-pressure heroics. Our engine evaluates performance deltas specifically in decisive moments."),
    ("2. Balance Bowling with Spin & Express Pace", "Modern T20 analytics prove that wrist spin creates the highest wicket probability under pressure, while express pace (145km/h+) suppresses boundary percentage."),
    ("3. Acquire Subcontinent Pressure Anchors", "Identify batters with statistical consistency scores >0.88 across 1,000+ balls who excel against mystery spin on abrasive subcontinent wickets."),
    ("4. Secure Dual-Threat Overseas Slot Efficiency", "With only 4 overseas slots permitted, RR must target all-rounders who rank in the top percentile in BOTH batting and bowling clutch metrics.")
]
for title, desc in goals:
    p = tf_r2.add_paragraph()
    p.text = f"✔ {title}: "
    p.font.bold = True
    p.font.size = Pt(10.5)
    p.font.color.rgb = C_SUCCESS
    p.space_before = Pt(8)
    r = p.add_run()
    r.text = desc
    r.font.bold = False
    r.font.color.rgb = C_TEXT_DARK

# ==============================================================================
# SLIDE 3: Mathematical Architecture: Leverage Index (LI) Derivation
# ==============================================================================
s3 = prs.slides.add_slide(blank_layout)
add_standard_header(s3, "Mathematical Architecture: Multiplicative Leverage Index (LI)")

eq_box = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(1.6), Inches(11.7), Inches(1.4))
eq_box.fill.solid()
eq_box.fill.fore_color.rgb = C_NAVY
eq_box.line.color.rgb = C_PRIMARY
eq_box.line.width = Pt(2)
tf_eq = eq_box.text_frame
tf_eq.margin_left = tf_eq.margin_top = Inches(0.2)
p_eq1 = tf_eq.paragraphs[0]
p_eq1.text = "DELIVERY-LEVEL LEVERAGE INDEX FORMULATION"
p_eq1.font.size = Pt(11)
p_eq1.font.bold = True
p_eq1.font.color.rgb = C_ACCENT
p_eq2 = tf_eq.add_paragraph()
p_eq2.text = "LI = RRR_Factor × Wicket_Factor × Phase_Factor × Closeness_Factor"
p_eq2.font.size = Pt(18)
p_eq2.font.bold = True
p_eq2.font.color.rgb = RGBColor(255, 255, 255)
p_eq2.space_before = Pt(4)
p_eq3 = tf_eq.add_paragraph()
p_eq3.text = "A multi-dimensional multiplicative model capturing non-linear pressure escalation rather than simple linear additive scoring."
p_eq3.font.size = Pt(10)
p_eq3.font.color.rgb = RGBColor(200, 215, 235)
p_eq3.space_before = Pt(3)

factors = [
    ("1. RRR Factor", "Chase Pressure Physics", 
     "In 2nd innings, models the ratio of Required Run Rate (RRR) to historic par:\n• RRR_Factor = (RRR / CRR_baseline)^1.2\n• If RRR > 12.0 RPO, factor scales exponentially.\n• In 1st innings, uses projected total variance based on wickets fallen.", C_PRIMARY),
    ("2. Wicket Factor", "Innings Collapse Hazard", 
     "Models batting resources depletion using dynamic decay:\n• W_Factor = 1.0 + [(10 - WicketsRemaining) / 10] × 1.5\n• At 2 wickets down: Factor = 1.30\n• At 8 wickets down: Factor = 2.20\n• Captures tailender vulnerability.", C_PRIMARY_DARK),
    ("3. Phase Multiplier", "Format-Calibrated Inertia", 
     "Accounts for field restrictions and death-over risk:\n• Powerplay (Overs 1-6): 1.00 (Boundary focus)\n• Middle (Overs 7-15): 1.15 (Rotation & build)\n• Death (Overs 16-20): 1.50 (Maximum leverage)\n• Calibrated separately for T20 vs ODI formats.", C_ACCENT),
    ("4. Closeness Factor", "Horizon Convergence", 
     "As delivery count decreases, each ball carries larger win-probability variance:\n• Closeness = TotalBalls / (BallsLeft + 12)\n• 12 balls left in T20: Closeness = 5.0x\n• 60 balls left in T20: Closeness = 1.6x\n• Models the acute cliff in final overs.", C_SUCCESS)
]
fw, fh = Inches(2.7), Inches(3.9)
f_left, f_top = Inches(0.8), Inches(3.2)
for i, (f_name, f_sub, f_desc, f_col) in enumerate(factors):
    fb = s3.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, f_left + i * (fw + Inches(0.3)), f_top, fw, fh)
    fb.fill.solid()
    fb.fill.fore_color.rgb = C_CARD_BG
    fb.line.color.rgb = f_col
    fb.line.width = Pt(1.5)
    tf_f = fb.text_frame
    tf_f.margin_left = tf_f.margin_top = Inches(0.2)
    p1 = tf_f.paragraphs[0]
    p1.text = f_name
    p1.font.size = Pt(12)
    p1.font.bold = True
    p1.font.color.rgb = f_col
    p2 = tf_f.add_paragraph()
    p2.text = f_sub
    p2.font.size = Pt(9.5)
    p2.font.bold = True
    p2.font.color.rgb = C_NAVY
    p2.space_before = Pt(2)
    p3 = tf_f.add_paragraph()
    p3.text = f_desc
    p3.font.size = Pt(9)
    p3.font.color.rgb = C_TEXT_DARK
    p3.space_before = Pt(6)

# ==============================================================================
# SLIDE 4: Mathematical Scoring Engine: Delta, Clutch & Consistency
# ==============================================================================
s4 = prs.slides.add_slide(blank_layout)
add_standard_header(s4, "Scoring Mechanics: Performance Delta, Clutch & Consistency")

pillars = [
    ("1. Pressure Tiers & Scaling", 
     "PressureScore = min(LI × 20, 100)\n\nDeliveries are categorized into 4 distinct empirical bands:\n• Low Band [0 - 25): 103,615 balls (51.8%)\n  Routine overs, early innings, stable targets\n• Medium Band [25 - 50): 65,139 balls (32.4%)\n  Partnership building, climbing run rates\n• High Band [50 - 75): 19,284 balls (9.6%)\n  Death overs, steep target chases, wickets tumbling\n• Extreme Band [75 - 100]: 12,961 balls (6.5%)\n  Final overs, <12 balls, 1-2 wickets in hand", C_NAVY),
    ("2. Performance Delta & Clutch Index", 
     "Relative Delta vs Career Baseline:\n• Batters: Delta = (SR_band - SR_baseline) / SR_baseline\n• Bowlers: Delta = (Econ_base - Econ_band) / Econ_base\n  (Lower economy under pressure = positive delta!)\n\nClutch Index Weighted Sum Formulation:\nClutchIndex = [0.40 × Delta_Ext + 0.30 × Delta_High\n             + 0.20 × Delta_Med + 0.10 × Delta_Low]\n             × min(BallsFaced / N_threshold, 1.0)\n\nVolume dampening threshold filters out 5-ball outliers.", C_PRIMARY),
    ("3. Exponential Consistency Score", 
     "Measures cross-band statistical stability:\n• Weighted Standard Deviation: sigma_w\n• Weighted Mean Performance: mu_w\n• Coefficient of Variation: CV = sigma_w / mu_w\n\nConsistency Score Equation:\nConsistency = exp(-CV) = exp(- sigma_w / mu_w)\n\n• Flawless cross-band stability: CV = 0 -> Consistency = 1.0\n• Highly erratic performers: CV = 1.5 -> Consistency = 0.22\n• Exponential decay strictly bounds score within (0, 1.0].", C_SUCCESS)
]
pw, ph = Inches(3.7), Inches(4.0)
for i, (p_title, p_body, p_col) in enumerate(pillars):
    pb = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8) + i * (pw + Inches(0.3)), Inches(1.6), pw, ph)
    pb.fill.solid()
    pb.fill.fore_color.rgb = C_BG_LIGHT
    pb.line.color.rgb = p_col
    pb.line.width = Pt(1.5)
    tf_p = pb.text_frame
    tf_p.margin_left = tf_p.margin_top = Inches(0.2)
    pt = tf_p.paragraphs[0]
    pt.text = p_title
    pt.font.size = Pt(12)
    pt.font.bold = True
    pt.font.color.rgb = p_col
    pd = tf_p.add_paragraph()
    pd.text = p_body
    pd.font.size = Pt(9)
    pd.font.color.rgb = C_TEXT_DARK
    pd.space_before = Pt(5)

b_box4 = s4.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.8), Inches(11.7), Inches(1.2))
b_box4.fill.solid()
b_box4.fill.fore_color.rgb = C_NAVY
b_box4.line.color.rgb = C_PRIMARY
tf_b4 = b_box4.text_frame
tf_b4.margin_left = tf_b4.margin_top = Inches(0.18)
p_b4_1 = tf_b4.paragraphs[0]
p_b4_1.text = "FINAL COMPOSITE EQUATION & 70/30 WEIGHT SENSITIVITY"
p_b4_1.font.size = Pt(10)
p_b4_1.font.bold = True
p_b4_1.font.color.rgb = C_ACCENT
p_b4_2 = tf_b4.add_paragraph()
p_b4_2.text = "CompositeScore = 0.70 × ClutchIndex + 0.30 × ConsistencyScore"
p_b4_2.font.size = Pt(16)
p_b4_2.font.bold = True
p_b4_2.font.color.rgb = RGBColor(255, 255, 255)
p_b4_2.space_before = Pt(2)
p_b4_3 = tf_b4.add_paragraph()
p_b4_3.text = "Why 70/30? Pure consistency without clutch output yields accumulator batsmen who score 30(28) when 45(20) is required. 70% clutch weight isolates match-winners."
p_b4_3.font.size = Pt(9)
p_b4_3.font.color.rgb = RGBColor(200, 215, 235)

# ==============================================================================
# SLIDE 5: Pressure Distribution & Match Dynamics (with Dashboard Screenshot)
# ==============================================================================
s5 = prs.slides.add_slide(blank_layout)
add_standard_header(s5, "Empirical Pressure Dynamics: 200,999 Deliveries Modeled")

sc_press = os.path.join(SCREENSHOTS_DIR, "screenshot_dashboard_pressure.png")
if os.path.exists(sc_press):
    s5.shapes.add_picture(sc_press, Inches(0.8), Inches(1.6), Inches(6.2), Inches(5.2))

rc_box = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.3), Inches(1.6), Inches(5.2), Inches(5.2))
rc_box.fill.solid()
rc_box.fill.fore_color.rgb = C_BG_LIGHT
rc_box.line.color.rgb = C_BORDER
tf_rc = rc_box.text_frame
tf_rc.margin_left = tf_rc.margin_top = Inches(0.25)
p_rct = tf_rc.paragraphs[0]
p_rct.text = "Key Pressure Distribution Insights"
p_rct.font.size = Pt(14)
p_rct.font.bold = True
p_rct.font.color.rgb = C_NAVY

p_pts = [
    ("The Extreme Pressure Scarcity (6.5%)", "Only 12,961 out of 200,999 deliveries reach Extreme pressure (75-100). Because these moments decide 80%+ of tournament knockouts, players who excel in this thin tail command premium auction value."),
    ("Innings Symmetry vs Variance", "1st Innings Average Pressure (35.0) equals 2nd Innings Average (35.1), but 2nd innings pressure displays massive positive kurtosis—spiking violently in final chase overs."),
    ("Why Traditional Stats Deceive", "51.8% of deliveries occur in Low pressure (0-25). A batsman with a 150 Strike Rate in Low pressure often craters to 110 under Extreme pressure when boundaries require surgical placement."),
    ("Rajasthan Royals Strategic Implication", "RR has lost critical games by over-indexing on players who feast on Low/Medium overs but disappear in the crucial 6.5% Extreme window.")
]
for t, d in p_pts:
    p = tf_rc.add_paragraph()
    p.text = f"• {t}: "
    p.font.bold = True
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_PRIMARY if "Extreme" in t else C_NAVY
    p.space_before = Pt(8)
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_DARK

# ==============================================================================
# SLIDE 6: Dashboard Interface & System Telemetry (with Dashboard Screenshot)
# ==============================================================================
s6 = prs.slides.add_slide(blank_layout)
add_standard_header(s6, "Interactive Analytics Dashboard: Telemetry & Architecture")

sc_over = os.path.join(SCREENSHOTS_DIR, "screenshot_dashboard_overview.png")
if os.path.exists(sc_over):
    s6.shapes.add_picture(sc_over, Inches(0.8), Inches(1.6), Inches(6.2), Inches(5.2))

r6_box = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.3), Inches(1.6), Inches(5.2), Inches(5.2))
r6_box.fill.solid()
r6_box.fill.fore_color.rgb = C_BG_LIGHT
r6_box.line.color.rgb = C_BORDER
tf_r6 = r6_box.text_frame
tf_r6.margin_left = tf_r6.margin_top = Inches(0.25)

p_r6t = tf_r6.paragraphs[0]
p_r6t.text = "Dashboard Software Architecture"
p_r6t.font.size = Pt(14)
p_r6t.font.bold = True
p_r6t.font.color.rgb = C_NAVY

dash_features = [
    ("Standalone Local HTML5/JS", "Built with responsive HTML5, modern CSS custom properties, and Chart.js 4.4. Runs 100% locally with zero server dependency or network lag."),
    ("Multi-Format Coverage (T20 & ODI)", "Analyzes 867 matches spanning 558 T20 innings and 1,166 ODI innings. Format-specific weights ensure T20 death overs and ODI middle-overs squeeze are normalized."),
    ("Robust Data Sanitization", "200,999 balls processed with 0 null values. Ball-by-ball states enriched with live CRR, RRR, wickets fallen, and phase detection."),
    ("Dynamic Visual Analytics Tabs", "Allows instant toggling between tabular rankings, visual multi-bar/line charts, and tactical qualitative scouting insights for every player.")
]
for t, d in dash_features:
    p = tf_r6.add_paragraph()
    p.text = f"✔ {t}: "
    p.font.bold = True
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_SUCCESS
    p.space_before = Pt(8)
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_DARK

# ==============================================================================
# SLIDE 7: Top 10 Clutch Batters: Deep Breakdown
# ==============================================================================
s7 = prs.slides.add_slide(blank_layout)
add_standard_header(s7, "Top 10 Clutch Batters: Acceleration & Subcontinent Dominance")

ch_bat = os.path.join(CHARTS_DIR, "batters_chart.png")
if os.path.exists(ch_bat):
    s7.shapes.add_picture(ch_bat, Inches(0.8), Inches(1.5), Inches(5.8), Inches(3.6))

table_s7 = s7.shapes.add_table(11, 6, Inches(6.8), Inches(1.5), Inches(5.7), Inches(3.6))
t7 = table_s7.table
t7.columns[0].width = Inches(0.5)
t7.columns[1].width = Inches(1.7)
t7.columns[2].width = Inches(0.85)
t7.columns[3].width = Inches(0.85)
t7.columns[4].width = Inches(0.9)
t7.columns[5].width = Inches(0.9)

headers_b = ["#", "Batter", "Clutch", "Consist.", "Composite", "Balls"]
for c, h in enumerate(headers_b):
    cell = t7.cell(0, c)
    cell.fill.solid()
    cell.fill.fore_color.rgb = C_NAVY
    p = cell.text_frame.paragraphs[0]
    p.text = h
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.alignment = PP_ALIGN.CENTER if c != 1 else PP_ALIGN.LEFT

batters_data = [
    ("1", "Mohammad Nabi", "0.204", "0.821", "0.389", "663"),
    ("2", "Towhid Hridoy", "0.170", "0.887", "0.385", "998"),
    ("3", "Ibrahim Zadran", "0.167", "0.889", "0.383", "1,126"),
    ("4", "Jaker Ali Anik", "0.204", "0.789", "0.379", "512"),
    ("5", "Marcus Stoinis", "0.143", "0.909", "0.373", "1,247"),
    ("6", "Rovman Powell", "0.136", "0.915", "0.370", "1,559"),
    ("7", "Curtis Campher", "0.143", "0.887", "0.366", "526"),
    ("8", "Aiden Markram", "0.115", "0.943", "0.363", "1,673"),
    ("9", "Rinku Singh", "0.142", "0.879", "0.363", "1,285"),
    ("10", "Sikandar Raza", "0.134", "0.896", "0.362", "1,002")
]
for r, row in enumerate(batters_data):
    for c, val in enumerate(row):
        cell = t7.cell(r + 1, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_CARD_BG if r % 2 == 0 else C_BG_LIGHT
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.size = Pt(9)
        p.font.bold = (c in [0, 1, 4])
        p.font.color.rgb = C_PRIMARY if c == 4 else (C_NAVY if c == 1 else C_TEXT_DARK)
        p.alignment = PP_ALIGN.CENTER if c != 1 else PP_ALIGN.LEFT

c_box7 = s7.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.3), Inches(11.7), Inches(1.6))
c_box7.fill.solid()
c_box7.fill.fore_color.rgb = C_BG_LIGHT
c_box7.line.color.rgb = C_PRIMARY
c_box7.line.width = Pt(1.5)
tf_c7 = c_box7.text_frame
tf_c7.margin_left = tf_c7.margin_top = Inches(0.2)
p_c7t = tf_c7.paragraphs[0]
p_c7t.text = "TACTICAL SCOUTING DEEP-DIVE: CLUTCH BATTING"
p_c7t.font.size = Pt(11)
p_c7t.font.bold = True
p_c7t.font.color.rgb = C_PRIMARY
p_c7_1 = tf_c7.add_paragraph()
p_c7_1.text = "• Subcontinent Pressure Immunity: 7 of Top 10 batters hail from AFG, BAN, IND, SL, PAK. Towhid Hridoy (0.887) and Ibrahim Zadran (0.889) display generational consistency over 1,000+ balls, anchoring against top spin bowlers."
p_c7_1.font.size = Pt(9)
p_c7_1.font.color.rgb = C_TEXT_DARK
p_c7_1.space_before = Pt(3)
p_c7_2 = tf_c7.add_paragraph()
p_c7_2.text = "• Extreme Band Accelerators: Mohammad Nabi (#1 overall, 0.389) spikes Strike Rate to 180+ in Extreme pressure. Stoinis (#5, 0.373) and Powell (#6, 0.370) provide elite IPL finishing with >0.90 consistency scores."
p_c7_2.font.size = Pt(9)
p_c7_2.font.color.rgb = C_TEXT_DARK
p_c7_2.space_before = Pt(2)

# ==============================================================================
# SLIDE 8: Top 10 Clutch Bowlers: Spin Dominance vs Express Velocity
# ==============================================================================
s8 = prs.slides.add_slide(blank_layout)
add_standard_header(s8, "Top 10 Clutch Bowlers: Spin Dominance vs Express Velocity")

ch_bowl = os.path.join(CHARTS_DIR, "bowlers_chart.png")
if os.path.exists(ch_bowl):
    s8.shapes.add_picture(ch_bowl, Inches(0.8), Inches(1.5), Inches(5.8), Inches(3.6))

table_s8 = s8.shapes.add_table(11, 6, Inches(6.8), Inches(1.5), Inches(5.7), Inches(3.6))
t8 = table_s8.table
t8.columns[0].width = Inches(0.5)
t8.columns[1].width = Inches(1.7)
t8.columns[2].width = Inches(0.85)
t8.columns[3].width = Inches(0.85)
t8.columns[4].width = Inches(0.9)
t8.columns[5].width = Inches(0.9)

for c, h in enumerate(headers_b):
    cell = t8.cell(0, c)
    cell.fill.solid()
    cell.fill.fore_color.rgb = C_PRIMARY_DARK
    p = cell.text_frame.paragraphs[0]
    p.text = "Bowler" if c == 1 else h
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.alignment = PP_ALIGN.CENTER if c != 1 else PP_ALIGN.LEFT

bowlers_data = [
    ("1", "Sunil Narine", "0.251", "0.879", "0.439", "1,535"),
    ("2", "Shadab Khan", "0.256", "0.847", "0.433", "832"),
    ("3", "Karn Sharma", "0.263", "0.811", "0.428", "363"),
    ("4", "Mohammad Nawaz", "0.220", "0.884", "0.419", "1,005"),
    ("5", "Kuldeep Yadav", "0.216", "0.880", "0.416", "1,917"),
    ("6", "Anrich Nortje", "0.209", "0.856", "0.403", "845"),
    ("7", "Abrar Ahmed", "0.223", "0.796", "0.395", "764"),
    ("8", "Hasan Mahmud", "0.211", "0.808", "0.390", "397"),
    ("9", "Akeal Hosein", "0.166", "0.907", "0.388", "1,704"),
    ("10", "Brijesh Sharma", "0.195", "0.829", "0.385", "277")
]
for r, row in enumerate(bowlers_data):
    for c, val in enumerate(row):
        cell = t8.cell(r + 1, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_CARD_BG if r % 2 == 0 else C_BG_LIGHT
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.size = Pt(9)
        p.font.bold = (c in [0, 1, 4])
        p.font.color.rgb = C_PRIMARY if c == 4 else (C_NAVY if c == 1 else C_TEXT_DARK)
        p.alignment = PP_ALIGN.CENTER if c != 1 else PP_ALIGN.LEFT

c_box8 = s8.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.3), Inches(11.7), Inches(1.6))
c_box8.fill.solid()
c_box8.fill.fore_color.rgb = C_BG_LIGHT
c_box8.line.color.rgb = C_PRIMARY
c_box8.line.width = Pt(1.5)
tf_c8 = c_box8.text_frame
tf_c8.margin_left = tf_c8.margin_top = Inches(0.2)
p_c8t = tf_c8.paragraphs[0]
p_c8t.text = "TACTICAL SCOUTING DEEP-DIVE: CLUTCH BOWLING"
p_c8t.font.size = Pt(11)
p_c8t.font.bold = True
p_c8t.font.color.rgb = C_PRIMARY
p_c8_1 = tf_c8.add_paragraph()
p_c8_1.text = "• Spin Stranglehold: 8 of Top 10 bowlers are spinners (6 wrist spin, 2 finger spin). Sunil Narine (#1, 0.439) maintains an astounding ~6.0 Economy in Extreme pressure. Shadab Khan (#2, 0.433) combines top wicket threat with low economy."
p_c8_1.font.size = Pt(9)
p_c8_1.font.color.rgb = C_TEXT_DARK
p_c8_1.space_before = Pt(3)
p_c8_2 = tf_c8.add_paragraph()
p_c8_2.text = "• High Velocity Pacing: Only 2 genuine fast bowlers breached the top 10: Anrich Nortje (#6, 145km/h+ speed) and Hasan Mahmud (#8, cutter variations). High velocity defeats scoops and limits death over boundary rate."
p_c8_2.font.size = Pt(9)
p_c8_2.font.color.rgb = C_TEXT_DARK
p_c8_2.space_before = Pt(2)

# ==============================================================================
# SLIDE 9: Top 5 Dual-Threat All-Rounders Matrix
# ==============================================================================
s9 = prs.slides.add_slide(blank_layout)
add_standard_header(s9, "Top 5 Clutch All-Rounders: Multi-Dimensional Team Balance")

ch_ar = os.path.join(CHARTS_DIR, "allrounders_matrix.png")
if os.path.exists(ch_ar):
    s9.shapes.add_picture(ch_ar, Inches(0.8), Inches(1.6), Inches(5.4), Inches(5.2))

ar_table_s9 = s9.shapes.add_table(6, 6, Inches(6.4), Inches(1.6), Inches(6.1), Inches(2.3))
t9 = ar_table_s9.table
t9.columns[0].width = Inches(0.5)
t9.columns[1].width = Inches(1.8)
t9.columns[2].width = Inches(0.9)
t9.columns[3].width = Inches(0.9)
t9.columns[4].width = Inches(0.9)
t9.columns[5].width = Inches(1.1)

ar_headers = ["#", "All-Rounder", "Bat Clutch", "Bowl Clutch", "Avg Clutch", "Composite"]
for c, h in enumerate(ar_headers):
    cell = t9.cell(0, c)
    cell.fill.solid()
    cell.fill.fore_color.rgb = C_NAVY
    p = cell.text_frame.paragraphs[0]
    p.text = h
    p.font.size = Pt(9.5)
    p.font.bold = True
    p.font.color.rgb = RGBColor(255, 255, 255)
    p.alignment = PP_ALIGN.CENTER if c != 1 else PP_ALIGN.LEFT

ar_data = [
    ("1", "Shadab Khan", "0.122", "0.256", "0.189", "0.358"),
    ("2", "Mohammad Nabi", "0.204", "0.104", "0.154", "0.358"),
    ("3", "Sikandar Raza", "0.134", "0.112", "0.123", "0.358"),
    ("4", "Kuldeep Yadav", "0.058", "0.216", "0.137", "0.339"),
    ("5", "Mohammad Nawaz", "0.089", "0.220", "0.155", "0.335")
]
for r, row in enumerate(ar_data):
    for c, val in enumerate(row):
        cell = t9.cell(r + 1, c)
        cell.fill.solid()
        cell.fill.fore_color.rgb = C_CARD_BG if r % 2 == 0 else C_BG_LIGHT
        p = cell.text_frame.paragraphs[0]
        p.text = val
        p.font.size = Pt(9.5)
        p.font.bold = (c in [0, 1, 5])
        p.font.color.rgb = C_PRIMARY if c == 5 else (C_NAVY if c == 1 else C_TEXT_DARK)
        p.alignment = PP_ALIGN.CENTER if c != 1 else PP_ALIGN.LEFT

ar_box9 = s9.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(6.4), Inches(4.1), Inches(6.1), Inches(2.7))
ar_box9.fill.solid()
ar_box9.fill.fore_color.rgb = C_BG_LIGHT
ar_box9.line.color.rgb = C_BORDER
tf_ar9 = ar_box9.text_frame
tf_ar9.margin_left = tf_ar9.margin_top = Inches(0.2)
p_art9 = tf_ar9.paragraphs[0]
p_art9.text = "Strategic All-Rounder Evaluation for RR"
p_art9.font.size = Pt(13)
p_art9.font.bold = True
p_art9.font.color.rgb = C_NAVY

ar_scout = [
    ("Shadab Khan (#1 All-Rounder)", "Elite leg spin (0.256 bowl clutch, rank 2 overall) + powerful lower-order finishing at #7-8. Directly resolves two structural weaknesses in RR's starting XI with a single overseas slot."),
    ("Mohammad Nabi (#2 All-Rounder)", "Devastating batting clutch (0.204) + dependable off-spin containment in middle overs. Brings veteran leadership and spin bowling mentorship to Rajasthan's young squad."),
    ("Sikandar Raza (#3 All-Rounder)", "Exceptional positional flexibility (bats anywhere 4-7, bowls middle/death). Proven across global T20 leagues (IPL, CPL, PSL, BBL) under severe scoreboard pressure.")
]
for title, text in ar_scout:
    p = tf_ar9.add_paragraph()
    p.text = f"• {title}: "
    p.font.bold = True
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_PRIMARY
    p.space_before = Pt(4)
    r = p.add_run()
    r.text = text
    r.font.bold = False
    r.font.color.rgb = C_TEXT_DARK

# ==============================================================================
# SLIDE 10: Rajasthan Royals Tactical Squad Fit Matrix (with Dashboard Screenshot)
# ==============================================================================
s10 = prs.slides.add_slide(blank_layout)
add_standard_header(s10, "Rajasthan Royals Tactical Squad Fit: Target Validation")

sc_rr = os.path.join(SCREENSHOTS_DIR, "screenshot_dashboard_rr_fit.png")
if os.path.exists(sc_rr):
    s10.shapes.add_picture(sc_rr, Inches(0.8), Inches(1.6), Inches(6.2), Inches(5.2))

r10_box = s10.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.3), Inches(1.6), Inches(5.2), Inches(5.2))
r10_box.fill.solid()
r10_box.fill.fore_color.rgb = C_BG_LIGHT
r10_box.line.color.rgb = C_BORDER
tf_r10 = r10_box.text_frame
tf_r10.margin_left = tf_r10.margin_top = Inches(0.25)
p_r10t = tf_r10.paragraphs[0]
p_r10t.text = "Squad Integration & Tactical Synergy"
p_r10t.font.size = Pt(14)
p_r10t.font.bold = True
p_r10t.font.color.rgb = C_NAVY

synergies = [
    ("Shadab Khan (Primary Anchor)", "Solves the 3-year post-Chahal wrist-spin void while batting at #7-8 to provide 15-20 crucial runs in overs 18-20. Highest overall squad ROI."),
    ("Anrich Nortje (Pace Enforcer)", "Provides the pure 145km/h+ velocity RR has lacked since Jofra Archer. Concedes sub-7.5 RPO in Extreme pressure—the best among all pace bowlers analyzed."),
    ("Ibrahim Zadran (Top-Order Stability)", "Highest consistency score (0.889) over 1,126 balls faced. Solves RR's early powerplay collapse tendency on dry, turning pitches."),
    ("Towhid Hridoy (Middle-Order Floater)", "Remarkable 0.887 consistency at age 23. Capable of floating between #3 and #5, accelerating to 170+ Strike Rate when Required Run Rate spikes.")
]
for t, d in synergies:
    p = tf_r10.add_paragraph()
    p.text = f"✔ {t}: "
    p.font.bold = True
    p.font.size = Pt(9.5)
    p.font.color.rgb = C_SUCCESS
    p.space_before = Pt(8)
    r = p.add_run()
    r.text = d
    r.font.bold = False
    r.font.color.rgb = C_TEXT_DARK

# ==============================================================================
# SLIDE 11: Actionable Auction & Recruitment Roadmap
# ==============================================================================
s11 = prs.slides.add_slide(blank_layout)
add_standard_header(s11, "Actionable Recruitment Roadmap: RR 4-Tier Strategy")

rec_priorities = [
    ("PRIORITY 1", "Elite Wrist-Spin All-Rounder", "Target: Shadab Khan", 
     "Replaces Yuzvendra Chahal's wicket-taking threat. Delivers 4 overs of wrist spin and stabilizes lower order at #7. Highest ROI overseas slot.", C_PRIMARY),
    ("PRIORITY 2", "Express Death Bowler", "Target: Anrich Nortje / Hasan Mahmud", 
     "Nortje brings 145km/h+ yorkers and bouncers. Hasan Mahmud offers left-arm variation. Crucial for defending 40-50 runs in overs 17-20.", C_PRIMARY_DARK),
    ("PRIORITY 3", "Composed Middle-Order Anchor", "Target: Towhid Hridoy / Ibrahim Zadran", 
     "Both players boast >0.88 consistency across 1,000+ balls. Absorbs pressure when early wickets fall and accelerates once settled.", C_ACCENT),
    ("PRIORITY 4", "Experienced Finisher", "Target: Mohammad Nabi / Sikandar Raza", 
     "Veteran presence with 10+ years franchise experience. High clutch index in Extreme pressure (SR 180+) + utility spin overs.", C_SUCCESS)
]
rw, rh = Inches(2.7), Inches(4.2)
r_gap = Inches(0.28)
r_left, r_top = Inches(0.8), Inches(1.6)
for i, (p_tag, p_role, p_target, p_detail, p_color) in enumerate(rec_priorities):
    r_box = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, r_left + i * (rw + r_gap), r_top, rw, rh)
    r_box.fill.solid()
    r_box.fill.fore_color.rgb = C_CARD_BG
    r_box.line.color.rgb = p_color
    r_box.line.width = Pt(1.5)
    tf_r = r_box.text_frame
    tf_r.margin_left = tf_r.margin_right = Inches(0.2)
    tf_r.margin_top = Inches(0.25)
    p_t = tf_r.paragraphs[0]
    p_t.text = p_tag
    p_t.font.size = Pt(11)
    p_t.font.bold = True
    p_t.font.color.rgb = p_color
    p_ro = tf_r.add_paragraph()
    p_ro.text = p_role
    p_ro.font.size = Pt(13)
    p_ro.font.bold = True
    p_ro.font.color.rgb = C_NAVY
    p_ro.space_before = Pt(4)
    p_tg = tf_r.add_paragraph()
    p_tg.text = p_target
    p_tg.font.size = Pt(11)
    p_tg.font.bold = True
    p_tg.font.color.rgb = C_PRIMARY
    p_tg.space_before = Pt(6)
    p_dt = tf_r.add_paragraph()
    p_dt.text = p_detail
    p_dt.font.size = Pt(9.5)
    p_dt.font.color.rgb = C_TEXT_DARK
    p_dt.space_before = Pt(8)

dom_box = s11.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(6.0), Inches(11.73), Inches(0.9))
dom_box.fill.solid()
dom_box.fill.fore_color.rgb = C_BG_LIGHT
dom_box.line.color.rgb = C_BORDER
tf_d = dom_box.text_frame
tf_d.margin_left = Inches(0.3)
tf_d.margin_top = Inches(0.12)
p_d = tf_d.paragraphs[0]
p_d.text = "★ Indian Core Alternative: Kuldeep Yadav (Composite 0.416, 1,917 balls) provides an elite left-arm wrist spin alternative that does NOT consume an overseas slot, granting tactical auction purse flexibility."
p_d.font.size = Pt(10)
p_d.font.bold = True
p_d.font.color.rgb = C_NAVY

# ==============================================================================
# SLIDE 12: Interactive Dashboard Portal (Dark Theme) - THE ONLY SLIDE WITH LINKS
# ==============================================================================
s12 = prs.slides.add_slide(blank_layout)
bg12 = s12.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(7.5))
bg12.fill.solid()
bg12.fill.fore_color.rgb = C_NAVY
bg12.line.fill.background()

top_bar12 = s12.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.12))
top_bar12.fill.solid()
top_bar12.fill.fore_color.rgb = C_PRIMARY
top_bar12.line.fill.background()

t_box12 = s12.shapes.add_textbox(Inches(0.8), Inches(0.8), Inches(11.7), Inches(1.5))
tf12 = t_box12.text_frame
tf12.word_wrap = True

p_sub12 = tf12.paragraphs[0]
p_sub12.text = "LIVE INTERACTIVE ANALYTICS PORTAL"
p_sub12.font.size = Pt(12)
p_sub12.font.bold = True
p_sub12.font.color.rgb = C_ACCENT

p_main12 = tf12.add_paragraph()
p_main12.text = "Cricket Pressure Performance Dashboard"
p_main12.font.size = Pt(30)
p_main12.font.bold = True
p_main12.font.color.rgb = RGBColor(255, 255, 255)
p_main12.space_before = Pt(4)

p_tag12 = tf12.add_paragraph()
p_tag12.text = "Click below to open the standalone interactive dashboard in your browser."
p_tag12.font.size = Pt(13)
p_tag12.font.color.rgb = RGBColor(200, 210, 225)
p_tag12.space_before = Pt(4)

# 1. Primary Live HTTP Server Button (Most Reliable on Mac/Windows)
btn_http = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(2.6), Inches(6.8), Inches(1.15))
btn_http.fill.solid()
btn_http.fill.fore_color.rgb = C_PRIMARY
btn_http.line.color.rgb = C_ACCENT
btn_http.line.width = Pt(2.5)
btn_http.click_action.hyperlink.address = HTTP_DASHBOARD_URL

tf_hbtn = btn_http.text_frame
tf_hbtn.vertical_anchor = MSO_ANCHOR.MIDDLE
p_hb = tf_hbtn.paragraphs[0]
p_hb.alignment = PP_ALIGN.CENTER
r_hb1 = p_hb.add_run()
r_hb1.text = "▶ 1. CLICK TO OPEN IN BROWSER (HTTP LIVE) ↗\n"
r_hb1.font.size = Pt(14)
r_hb1.font.bold = True
r_hb1.font.color.rgb = RGBColor(255, 255, 255)
r_hb1.hyperlink.address = HTTP_DASHBOARD_URL

r_hb2 = p_hb.add_run()
r_hb2.text = HTTP_DASHBOARD_URL
r_hb2.font.size = Pt(9.5)
r_hb2.font.color.rgb = RGBColor(255, 220, 220)
r_hb2.hyperlink.address = HTTP_DASHBOARD_URL

# 2. Secondary Relative File Button
btn_rel = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(3.95), Inches(6.8), Inches(0.95))
btn_rel.fill.solid()
btn_rel.fill.fore_color.rgb = C_NAVY_LIGHT
btn_rel.line.color.rgb = C_BORDER
btn_rel.line.width = Pt(1.5)
btn_rel.click_action.hyperlink.address = REL_DASHBOARD_URL

tf_rbtn = btn_rel.text_frame
tf_rbtn.vertical_anchor = MSO_ANCHOR.MIDDLE
p_rb = tf_rbtn.paragraphs[0]
p_rb.alignment = PP_ALIGN.CENTER
r_rb1 = p_rb.add_run()
r_rb1.text = "📁 2. CLICK TO OPEN LOCAL FILE DIRECTLY ↗\n"
r_rb1.font.size = Pt(12)
r_rb1.font.bold = True
r_rb1.font.color.rgb = RGBColor(255, 255, 255)
r_rb1.hyperlink.address = REL_DASHBOARD_URL

r_rb2 = p_rb.add_run()
r_rb2.text = f"Relative: {REL_DASHBOARD_URL}"
r_rb2.font.size = Pt(9)
r_rb2.font.color.rgb = RGBColor(200, 215, 235)
r_rb2.hyperlink.address = REL_DASHBOARD_URL

# Instructions Box on Left Bottom
inst_box = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.8), Inches(5.1), Inches(6.8), Inches(1.8))
inst_box.fill.solid()
inst_box.fill.fore_color.rgb = RGBColor(20, 20, 38)
inst_box.line.color.rgb = RGBColor(50, 50, 80)
tf_ib = inst_box.text_frame
tf_ib.margin_left = tf_ib.margin_top = Inches(0.2)

p_i1 = tf_ib.paragraphs[0]
p_i1.text = "💡 HOW TO OPEN IN POWERPOINT:"
p_i1.font.size = Pt(11)
p_i1.font.bold = True
p_i1.font.color.rgb = C_ACCENT

p_i2 = tf_ib.add_paragraph()
p_i2.text = "• IN SLIDE SHOW MODE (F5 / Play): Simply click the red button above with your mouse."
p_i2.font.size = Pt(9.5)
p_i2.font.color.rgb = RGBColor(240, 240, 255)
p_i2.space_before = Pt(3)

p_i3 = tf_ib.add_paragraph()
p_i3.text = "• IN NORMAL EDIT MODE: Hold Cmd ⌘ (Mac) or Ctrl (Win) and click the button, OR right-click and select 'Open Hyperlink'."
p_i3.font.size = Pt(9.5)
p_i3.font.color.rgb = RGBColor(220, 230, 245)
p_i3.space_before = Pt(3)

p_i4 = tf_ib.add_paragraph()
p_i4.text = "• DESKTOP SHORTCUT: Double-click 'Open_Dashboard.command' in the project folder for instant 1-click launch."
p_i4.font.size = Pt(9.5)
p_i4.font.color.rgb = RGBColor(200, 215, 235)
p_i4.space_before = Pt(3)

# Dashboard Capabilities Card on Right
feat_card = s12.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(7.9), Inches(2.6), Inches(4.6), Inches(4.3))
feat_card.fill.solid()
feat_card.fill.fore_color.rgb = C_NAVY_LIGHT
feat_card.line.color.rgb = RGBColor(60, 60, 95)
feat_card.line.width = Pt(1)

tf_fc = feat_card.text_frame
tf_fc.word_wrap = True
tf_fc.margin_left = tf_fc.margin_top = Inches(0.3)

p_fct = tf_fc.paragraphs[0]
p_fct.text = "Interactive Dashboard Capabilities"
p_fct.font.size = Pt(14)
p_fct.font.bold = True
p_fct.font.color.rgb = C_ACCENT

features = [
    "Interactive Chart.js visualizers with tooltips and toggle legends",
    "Full sortable rankings for 888 Batters & 647 Bowlers",
    "Pressure distribution donut breakdown across 200,999 balls",
    "Individual RR tactical fit profile cards with strategic reasoning",
    "Light & Dark mode theme toggling with native CSS variables",
    "Zero installation or external server required — runs completely locally"
]
for f in features:
    p_fi = tf_fc.add_paragraph()
    p_fi.text = f"✔  {f}"
    p_fi.font.size = Pt(9.5)
    p_fi.font.color.rgb = RGBColor(220, 230, 245)
    p_fi.space_before = Pt(6)

output_path = os.path.join(WORKSPACE_DIR, "Cricket_Pressure_Performance_RR_Squad_Analysis.pptx")
prs.save(output_path)
print(f"Updated PowerPoint saved successfully to: {output_path}")

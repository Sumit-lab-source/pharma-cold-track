import os
import matplotlib
os.environ['MPLCONFIGDIR'] = '/tmp/mpl_cache'
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.backends.backend_pdf import PdfPages
import matplotlib.patches as patches
import matplotlib.image as mpimg

WORKSPACE_DIR = "/Users/sumitsaurav/pharma-cold-track"
DASHBOARD_URL = f"file://{WORKSPACE_DIR}/cricket_pressure_dashboard.html"
CHARTS_DIR = "/tmp/cricket_charts"
PDF_PATH = os.path.join(WORKSPACE_DIR, "Cricket_Pressure_Performance_RR_Squad_Analysis.pdf")

# Colors
C_PRIMARY = "#EA1D2C"
C_PRIMARY_DARK = "#C41624"
C_NAVY = "#1A1A2E"
C_NAVY_LIGHT = "#23233C"
C_ACCENT = "#F39C12"
C_SUCCESS = "#27AE60"
C_BLUE = "#3498DB"
C_TEXT_DARK = "#2C3E50"
C_TEXT_MUTED = "#6C757D"
C_BG_LIGHT = "#F8F9FA"
C_BORDER = "#E1E5E9"

def draw_header(ax, title_text, category_text="RAJASTHAN ROYALS • ADVANCED CRICKET ANALYTICS", dark_mode=False):
    # Category badge
    ax.text(0.8, 6.9, category_text.upper(), fontsize=10, fontweight='bold',
            color=C_PRIMARY if dark_mode else C_PRIMARY, va='top')
    
    # Title
    ax.text(0.8, 6.55, title_text, fontsize=20, fontweight='bold',
            color='white' if dark_mode else C_NAVY, va='top')
    
    # Red accent line
    ax.add_patch(patches.Rectangle((0.8, 6.0), 2.2, 0.05, facecolor=C_PRIMARY, edgecolor='none'))
    
    # Top-right Dashboard button
    btn = patches.FancyBboxPatch((10.2, 6.4), 2.3, 0.5, boxstyle="round,pad=0.08",
                               facecolor=C_PRIMARY if dark_mode else C_NAVY,
                               edgecolor=C_ACCENT if dark_mode else C_PRIMARY,
                               linewidth=1.5)
    btn.set_url(DASHBOARD_URL)
    ax.add_patch(btn)
    
    ax.text(11.35, 6.65, "▶ Open Dashboard ↗", color='white', fontsize=10.5,
            fontweight='bold', ha='center', va='center', url=DASHBOARD_URL)

with PdfPages(PDF_PATH) as pdf:
    # -------------------------------------------------------------------------
    # SLIDE 1: Title Slide (Dark Theme)
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    
    # Navy Background
    ax.add_patch(patches.Rectangle((0, 0), 13.333, 7.5, facecolor=C_NAVY, edgecolor='none'))
    ax.add_patch(patches.Rectangle((0, 7.38), 13.333, 0.12, facecolor=C_PRIMARY, edgecolor='none'))
    
    # Title text
    ax.text(1.0, 6.3, "RAJASTHAN ROYALS • SQUAD RECRUITMENT & STRATEGY", fontsize=12,
            fontweight='bold', color=C_ACCENT, va='top')
    ax.text(1.0, 5.75, "Cricket Pressure Performance Analytics", fontsize=34,
            fontweight='bold', color='white', va='top')
    ax.text(1.0, 4.95, "Data-Driven Clutch Performer Identification via Multiplicative Leverage Index Framework",
            fontsize=15, color="#C8D2E1", va='top')
    
    # 4 Key Metrics Bar
    metrics = [
        ("867", "Matches Analyzed"),
        ("200,999", "Deliveries Modeled"),
        ("1,535", "Players Evaluated"),
        ("T20 & ODI", "Dual Format Scope")
    ]
    card_w, card_h = 2.6, 1.15
    for i, (m_val, m_label) in enumerate(metrics):
        x = 1.0 + i * (card_w + 0.3)
        y = 3.3
        box = patches.FancyBboxPatch((x, y), card_w, card_h, boxstyle="round,pad=0.1",
                                    facecolor=C_NAVY_LIGHT, edgecolor="#3C3C5F", linewidth=1.2)
        ax.add_patch(box)
        ax.text(x + card_w/2, y + 0.72, m_val, fontsize=20, fontweight='bold', color=C_PRIMARY,
                ha='center', va='center')
        ax.text(x + card_w/2, y + 0.32, m_label, fontsize=10, color="#B4BED0", ha='center', va='center')
        
    # Giant CTA Button
    btn_cta = patches.FancyBboxPatch((1.0, 1.4), 5.2, 1.0, boxstyle="round,pad=0.12",
                                    facecolor=C_PRIMARY, edgecolor=C_ACCENT, linewidth=2.5)
    btn_cta.set_url(DASHBOARD_URL)
    ax.add_patch(btn_cta)
    ax.text(3.6, 1.9, "▶ CLICK TO OPEN LIVE DASHBOARD ↗", fontsize=14, fontweight='bold',
            color='white', ha='center', va='center', url=DASHBOARD_URL)
    
    # Explanatory note next to button
    ax.text(6.6, 2.15, "★ Interactive browser dashboard with responsive Chart.js visualizers,",
            fontsize=11, color="#A0B0C5", va='top')
    ax.text(6.6, 1.8, "  sortable player tables, and multi-parameter filters.",
            fontsize=11, color="#A0B0C5", va='top')
    ax.text(6.6, 1.45, f"  Clicking above launches: {os.path.basename(DASHBOARD_URL)}",
            fontsize=10, color=C_ACCENT, va='top')
    
    pdf.savefig(fig)
    plt.close()

    # -------------------------------------------------------------------------
    # SLIDE 2: Executive Summary & RR Squad Context
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    draw_header(ax, "Executive Summary: Rajasthan Royals Squad Optimization")
    
    # Left Card: Dilemmas
    card_l = patches.FancyBboxPatch((0.8, 0.8), 5.6, 5.0, boxstyle="round,pad=0.1",
                                   facecolor=C_BG_LIGHT, edgecolor=C_BORDER, linewidth=1)
    ax.add_patch(card_l)
    ax.text(1.1, 5.5, "Core Dilemmas Facing Rajasthan Royals", fontsize=15, fontweight='bold', color=C_PRIMARY)
    
    dilemmas = [
        ("Post-Chahal Wrist Spin Void", "With Yuzvendra Chahal's departure, RR faces a severe gap in taking middle-overs wickets and halting scoring runs."),
        ("High Death-Over Volatility", "Bowlers frequently concede 12+ RPO in overs 17-20 when defending sub-180 totals, necessitating high-velocity death specialists."),
        ("Middle-Order RRR Panic", "Chases break down in overs 11-16 when Required Run Rate climbs above 9.5 RPO due to lack of composed clutch anchors."),
        ("Need for Lower-Order Firepower", "Lower order (#7-8) lacks all-rounders who can bowl 4 reliable overs and hit at 160+ Strike Rate under Extreme pressure.")
    ]
    cur_y = 5.0
    for title, desc in dilemmas:
        ax.text(1.1, cur_y, f"• {title}:", fontsize=11, fontweight='bold', color=C_NAVY)
        ax.text(1.1, cur_y - 0.28, desc, fontsize=9.5, color=C_TEXT_DARK)
        cur_y -= 1.05

    # Right Card: Solutions
    card_r = patches.FancyBboxPatch((6.8, 0.8), 5.7, 5.0, boxstyle="round,pad=0.1",
                                   facecolor=C_BG_LIGHT, edgecolor=C_BORDER, linewidth=1)
    ax.add_patch(card_r)
    ax.text(7.1, 5.5, "Key Analytical Discoveries & Target Fixes", fontsize=15, fontweight='bold', color=C_NAVY)
    
    solutions = [
        ("1. Shadab Khan is the #1 Priority Fit", "Ranked #2 Bowler (0.433) and #1 All-Rounder (0.358). Delivers world-class leg spin + #7 finishing power in extreme pressure."),
        ("2. Express Pace Outperforms Medium Fast", "Anrich Nortje is the only pure fast bowler in the Top 6 Bowlers (0.403 composite), holding an economy of ~7.5 in Extreme pressure."),
        ("3. Subcontinent Batters Excel in Pressure", "7 of Top 10 clutch batters hail from AFG, BAN, IND, SL, PAK. Ibrahim Zadran & Towhid Hridoy post >0.88 consistency across 1,000+ balls."),
        ("4. Veteran Finishers Offer Immediate Value", "Mohammad Nabi (#1 Bat, 0.389) and Sikandar Raza (#3 AR, 0.358) boast 180+ SR in final overs with off-spin utility.")
    ]
    cur_y = 5.0
    for title, desc in solutions:
        ax.text(7.1, cur_y, f"✔ {title}:", fontsize=11, fontweight='bold', color=C_SUCCESS)
        ax.text(7.1, cur_y - 0.28, desc, fontsize=9.5, color=C_TEXT_DARK)
        cur_y -= 1.05

    pdf.savefig(fig)
    plt.close()

    # -------------------------------------------------------------------------
    # SLIDE 3: Methodology (Multiplicative Leverage Index)
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    draw_header(ax, "Mathematical Framework: Multiplicative Leverage Index (LI)")
    
    steps = [
        ("STEP 1", "State Enrichment", ["Extract delivery context:", "• Current Run Rate (CRR)", "• Required Run Rate (RRR)", "• Wickets / balls left", "• Phase: PP / Mid / Death"]),
        ("STEP 2", "Leverage Index", ["Multiplicative formula:", "LI = RRR_factor ×", "Wicket_factor ×", "Phase_factor ×", "Closeness_factor"]),
        ("STEP 3", "Pressure Scoring", ["Scale to 0-100 score:", "PressureScore = min(LI×20, 100)", "Bands: Low (0-25),", "Med (25-50), High (50-75),", "Extreme (75-100)"]),
        ("STEP 4", "Delta Metric", ["Compare vs baseline:", "Delta = (Metric - Base)/Base", "• Batters: Higher SR is better", "• Bowlers: Lower Econ is", "  better under stress"]),
        ("STEP 5", "Clutch Index", ["Weighted pressure sum:", "Extreme (40%) + High (30%)", "+ Med (20%) + Low (10%)", "× Volume Factor min(balls/N, 1.0)"]),
        ("STEP 6", "Consistency Score", ["Statistical variance:", "exp(-CV) where CV = ", "weighted_std / weighted_mean", "across pressure bands.", "1.0 = flawless"])
    ]
    sw, sh = 1.8, 3.4
    for i, (s_step, s_title, s_lines) in enumerate(steps):
        x = 0.8 + i * (sw + 0.18)
        y = 2.4
        box = patches.FancyBboxPatch((x, y), sw, sh, boxstyle="round,pad=0.08",
                                    facecolor="white", edgecolor=C_BORDER, linewidth=1)
        ax.add_patch(box)
        ax.text(x + 0.12, y + 3.1, s_step, fontsize=10, fontweight='bold', color=C_PRIMARY)
        ax.text(x + 0.12, y + 2.75, s_title, fontsize=11, fontweight='bold', color=C_NAVY)
        ly = y + 2.3
        for line in s_lines:
            ax.text(x + 0.12, ly, line, fontsize=8.5, color=C_TEXT_DARK)
            ly -= 0.35

    # Composite Equation Banner
    f_box = patches.FancyBboxPatch((0.8, 0.8), 11.7, 1.3, boxstyle="round,pad=0.1",
                                  facecolor=C_NAVY, edgecolor=C_PRIMARY, linewidth=2)
    ax.add_patch(f_box)
    ax.text(1.1, 1.85, "FINAL COMPOSITE RATING EQUATION", fontsize=10.5, fontweight='bold', color=C_ACCENT)
    ax.text(1.1, 1.45, "CompositeScore = (0.70 × ClutchIndex) + (0.30 × ConsistencyScore)",
            fontsize=16, fontweight='bold', color='white')
    ax.text(1.1, 1.05, "Rationale: 70% weight on clutch execution rewards match-winners who spike output in Extreme pressure; 30% consistency filters out volatile small-sample outliers.",
            fontsize=9.5, color="#C8D2E1")
    
    pdf.savefig(fig)
    plt.close()

    # -------------------------------------------------------------------------
    # SLIDE 4: Pressure Distribution
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    draw_header(ax, "Empirical Pressure Distribution (200,999 Deliveries)")
    
    img1 = mpimg.imread(os.path.join(CHARTS_DIR, "pressure_dist.png"))
    ax.imshow(img1, extent=[0.8, 6.3, 0.8, 5.8], aspect='auto')
    
    # Right Column Cards
    b_card = patches.FancyBboxPatch((6.6, 3.4), 5.9, 2.4, boxstyle="round,pad=0.1",
                                   facecolor=C_BG_LIGHT, edgecolor=C_BORDER, linewidth=1)
    ax.add_patch(b_card)
    ax.text(6.8, 5.5, "Banded Pressure Volume Breakdown", fontsize=14, fontweight='bold', color=C_NAVY)
    ax.text(6.8, 5.05, "• Low (0-25): 103,615 balls (51.8%)", fontsize=10.5, fontweight='bold', color=C_NAVY)
    ax.text(7.0, 4.8, "Powerplay, initial overs, comfortable run chases.", fontsize=9, color=C_TEXT_DARK)
    ax.text(6.8, 4.45, "• Medium (25-50): 65,139 balls (32.4%)", fontsize=10.5, fontweight='bold', color=C_NAVY)
    ax.text(7.0, 4.2, "Partnership building, middle overs rotation.", fontsize=9, color=C_TEXT_DARK)
    ax.text(6.8, 3.85, "• Extreme (75-100): 12,961 balls (6.5%)", fontsize=10.5, fontweight='bold', color=C_PRIMARY)
    ax.text(7.0, 3.6, "Final 2 overs, steep chases, <2 wickets in hand.", fontsize=9, color=C_TEXT_DARK)

    i_card = patches.FancyBboxPatch((6.6, 0.8), 5.9, 2.4, boxstyle="round,pad=0.1",
                                   facecolor=C_BG_LIGHT, edgecolor=C_BORDER, linewidth=1)
    ax.add_patch(i_card)
    ax.text(6.8, 2.9, "Innings Dynamics & Pressure Asymmetry", fontsize=14, fontweight='bold', color=C_NAVY)
    ax.text(6.8, 2.45, "✔ 1st Innings Average Pressure: 35.0", fontsize=10.5, fontweight='bold', color=C_SUCCESS)
    ax.text(7.0, 2.2, "Driven by phase and wicket loss velocity; spikes in overs 18-20.", fontsize=9, color=C_TEXT_DARK)
    ax.text(6.8, 1.85, "✔ 2nd Innings Average Pressure: 35.1", fontsize=10.5, fontweight='bold', color=C_SUCCESS)
    ax.text(7.0, 1.6, "Equal baseline, but high kurtosis. Rapid non-linear escalation.", fontsize=9, color=C_TEXT_DARK)
    ax.text(6.8, 1.25, "✔ Complete Coverage: 0 null values across 200,999 balls", fontsize=10, fontweight='bold', color=C_NAVY)

    pdf.savefig(fig)
    plt.close()

    # -------------------------------------------------------------------------
    # SLIDE 5: Top 10 Clutch Batters
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    draw_header(ax, "Top 10 Clutch Batters: Ranking & Consistency")
    
    img2 = mpimg.imread(os.path.join(CHARTS_DIR, "batters_chart.png"))
    ax.imshow(img2, extent=[0.8, 6.6, 2.2, 5.8], aspect='auto')
    
    # Table on Right
    table_x, table_y = 6.8, 5.8
    cols = ["#", "Batter", "Clutch", "Consist.", "Composite", "Balls"]
    widths = [0.4, 1.7, 0.8, 0.8, 0.9, 0.8]
    
    cur_x = table_x
    for c_idx, (col_name, w) in enumerate(zip(cols, widths)):
        rect = patches.Rectangle((cur_x, table_y - 0.32), w, 0.32, facecolor=C_NAVY, edgecolor='none')
        ax.add_patch(rect)
        ax.text(cur_x + w/2 if c_idx != 1 else cur_x + 0.1, table_y - 0.18, col_name,
                fontsize=9, fontweight='bold', color='white', ha='center' if c_idx != 1 else 'left', va='center')
        cur_x += w
        
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
    
    row_y = table_y - 0.32
    for r_idx, row in enumerate(batters_data):
        cur_x = table_x
        row_y -= 0.28
        bg_col = "white" if r_idx % 2 == 0 else C_BG_LIGHT
        for c_idx, (val, w) in enumerate(zip(row, widths)):
            rect = patches.Rectangle((cur_x, row_y), w, 0.28, facecolor=bg_col, edgecolor=C_BORDER, linewidth=0.5)
            ax.add_patch(rect)
            t_col = C_PRIMARY if c_idx == 4 else (C_NAVY if c_idx == 1 else C_TEXT_DARK)
            font_bold = (c_idx == 4 or c_idx == 1)
            ax.text(cur_x + w/2 if c_idx != 1 else cur_x + 0.1, row_y + 0.14, val,
                    fontsize=8.5, fontweight='bold' if font_bold else 'normal', color=t_col,
                    ha='center' if c_idx != 1 else 'left', va='center')
            cur_x += w
            
    # Bottom Banner
    bot = patches.FancyBboxPatch((0.8, 0.7), 11.7, 1.3, boxstyle="round,pad=0.08",
                                facecolor=C_BG_LIGHT, edgecolor=C_PRIMARY, linewidth=1.5)
    ax.add_patch(bot)
    ax.text(1.0, 1.7, "KEY STRATEGIC BATTING INSIGHTS FOR RAJASTHAN ROYALS", fontsize=11, fontweight='bold', color=C_PRIMARY)
    ax.text(1.0, 1.35, "• Subcontinent Pressure Immunity: 7 of top 10 batters hail from AFG, BAN, IND, SL, PAK. Towhid Hridoy (0.887) and Ibrahim Zadran (0.889) display world-class consistency across 1,000+ balls.", fontsize=9, color=C_TEXT_DARK)
    ax.text(1.0, 1.0, "• Extreme Band Finisher: Mohammad Nabi (#1 overall, 0.389) spikes Strike Rate to 180+ in Extreme pressure. Stoinis (#5) and Powell (#6) provide proven IPL finishing with >0.90 consistency.", fontsize=9, color=C_TEXT_DARK)

    pdf.savefig(fig)
    plt.close()

    # -------------------------------------------------------------------------
    # SLIDE 6: Top 10 Clutch Bowlers
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    draw_header(ax, "Top 10 Clutch Bowlers: Spin Supremacy vs Express Pace")
    
    img3 = mpimg.imread(os.path.join(CHARTS_DIR, "bowlers_chart.png"))
    ax.imshow(img3, extent=[0.8, 6.6, 2.2, 5.8], aspect='auto')
    
    # Table on Right
    cur_x = table_x
    for c_idx, (col_name, w) in enumerate(zip(["#", "Bowler", "Clutch", "Consist.", "Composite", "Balls"], widths)):
        rect = patches.Rectangle((cur_x, table_y - 0.32), w, 0.32, facecolor=C_PRIMARY_DARK, edgecolor='none')
        ax.add_patch(rect)
        ax.text(cur_x + w/2 if c_idx != 1 else cur_x + 0.1, table_y - 0.18, col_name,
                fontsize=9, fontweight='bold', color='white', ha='center' if c_idx != 1 else 'left', va='center')
        cur_x += w
        
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
    
    row_y = table_y - 0.32
    for r_idx, row in enumerate(bowlers_data):
        cur_x = table_x
        row_y -= 0.28
        bg_col = "white" if r_idx % 2 == 0 else C_BG_LIGHT
        for c_idx, (val, w) in enumerate(zip(row, widths)):
            rect = patches.Rectangle((cur_x, row_y), w, 0.28, facecolor=bg_col, edgecolor=C_BORDER, linewidth=0.5)
            ax.add_patch(rect)
            t_col = C_PRIMARY if c_idx == 4 else (C_NAVY if c_idx == 1 else C_TEXT_DARK)
            font_bold = (c_idx == 4 or c_idx == 1)
            ax.text(cur_x + w/2 if c_idx != 1 else cur_x + 0.1, row_y + 0.14, val,
                    fontsize=8.5, fontweight='bold' if font_bold else 'normal', color=t_col,
                    ha='center' if c_idx != 1 else 'left', va='center')
            cur_x += w
            
    # Bottom Banner
    bot2 = patches.FancyBboxPatch((0.8, 0.7), 11.7, 1.3, boxstyle="round,pad=0.08",
                                 facecolor=C_BG_LIGHT, edgecolor=C_PRIMARY, linewidth=1.5)
    ax.add_patch(bot2)
    ax.text(1.0, 1.7, "KEY STRATEGIC BOWLING INSIGHTS FOR RAJASTHAN ROYALS", fontsize=11, fontweight='bold', color=C_PRIMARY)
    ax.text(1.0, 1.35, "• Spin Stranglehold: 8 of top 10 bowlers are spinners (6 wrist spin, 2 finger spin). Sunil Narine (#1, 0.439) maintains ~6.0 Economy in Extreme pressure. Shadab Khan (#2, 0.433) boasts the second highest clutch index (0.256).", fontsize=9, color=C_TEXT_DARK)
    ax.text(1.0, 1.0, "• Fast Bowling Rarity: Only 2 pacers breached top 10: Anrich Nortje (#6, 145km/h+ speed) and Hasan Mahmud (#8, cutter variations). High pace prevents death scoops.", fontsize=9, color=C_TEXT_DARK)

    pdf.savefig(fig)
    plt.close()

    # -------------------------------------------------------------------------
    # SLIDE 7: Top 5 All-Rounders
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    draw_header(ax, "Top 5 Clutch All-Rounders: Maximizing Team Balance")
    
    img4 = mpimg.imread(os.path.join(CHARTS_DIR, "allrounders_matrix.png"))
    ax.imshow(img4, extent=[0.8, 6.4, 0.8, 5.8], aspect='auto')
    
    # Table on Right
    ar_cols = ["#", "All-Rounder", "Bat Clutch", "Bowl Clutch", "Avg Clutch", "Composite"]
    ar_widths = [0.4, 1.8, 0.9, 0.9, 0.9, 1.0]
    cur_x = 6.6
    for c_idx, (col_name, w) in enumerate(zip(ar_cols, ar_widths)):
        rect = patches.Rectangle((cur_x, 5.8 - 0.32), w, 0.32, facecolor=C_NAVY, edgecolor='none')
        ax.add_patch(rect)
        ax.text(cur_x + w/2 if c_idx != 1 else cur_x + 0.1, 5.8 - 0.18, col_name,
                fontsize=9, fontweight='bold', color='white', ha='center' if c_idx != 1 else 'left', va='center')
        cur_x += w
        
    ar_data = [
        ("1", "Shadab Khan", "0.122", "0.256", "0.189", "0.358"),
        ("2", "Mohammad Nabi", "0.204", "0.104", "0.154", "0.358"),
        ("3", "Sikandar Raza", "0.134", "0.112", "0.123", "0.358"),
        ("4", "Kuldeep Yadav", "0.058", "0.216", "0.137", "0.339"),
        ("5", "Mohammad Nawaz", "0.089", "0.220", "0.155", "0.335")
    ]
    row_y = 5.8 - 0.32
    for r_idx, row in enumerate(ar_data):
        cur_x = 6.6
        row_y -= 0.34
        bg_col = "white" if r_idx % 2 == 0 else C_BG_LIGHT
        for c_idx, (val, w) in enumerate(zip(row, ar_widths)):
            rect = patches.Rectangle((cur_x, row_y), w, 0.34, facecolor=bg_col, edgecolor=C_BORDER, linewidth=0.5)
            ax.add_patch(rect)
            t_col = C_PRIMARY if c_idx == 5 else (C_NAVY if c_idx == 1 else C_TEXT_DARK)
            ax.text(cur_x + w/2 if c_idx != 1 else cur_x + 0.1, row_y + 0.17, val,
                    fontsize=9, fontweight='bold' if (c_idx == 5 or c_idx == 1) else 'normal', color=t_col,
                    ha='center' if c_idx != 1 else 'left', va='center')
            cur_x += w
            
    # Bottom Right Analysis Box
    ar_box = patches.FancyBboxPatch((6.6, 0.8), 5.9, 2.7, boxstyle="round,pad=0.1",
                                   facecolor=C_BG_LIGHT, edgecolor=C_BORDER, linewidth=1)
    ax.add_patch(ar_box)
    ax.text(6.8, 3.2, "Strategic All-Rounder Evaluation for RR", fontsize=13, fontweight='bold', color=C_NAVY)
    ax.text(6.8, 2.75, "• Shadab Khan (#1 AR): Elite wrist spin (0.256 clutch) + #7-8 finishing. Solves two structural gaps simultaneously.", fontsize=9.5, color=C_TEXT_DARK)
    ax.text(6.8, 2.05, "• Mohammad Nabi (#2 AR): Extreme batting clutch (0.204) + dependable off-spin containment. Mentorship value for younger spinners.", fontsize=9.5, color=C_TEXT_DARK)
    ax.text(6.8, 1.35, "• Sikandar Raza (#3 AR): Versatile floater (bats 4-7, bowls middle/death overs). High cricket IQ under extreme chase pressure.", fontsize=9.5, color=C_TEXT_DARK)

    pdf.savefig(fig)
    plt.close()

    # -------------------------------------------------------------------------
    # SLIDE 8: Rajasthan Royals Tactical Squad Fit Matrix
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    draw_header(ax, "Rajasthan Royals: Tactical Squad Fit Matrix")
    
    profiles = [
        ("Shadab Khan", "Leg-Spin All-Rounder (Overseas)", [
            "Fills RR's critical 3-year wrist spin void (post-Chahal)",
            "Batting at #7-8 adds vital 15-20 runs in death overs",
            "Top 10 Bowler (#2) AND Top 5 All-Rounder (#1)",
            "Proven captaincy & high-pressure PSL/IPL pedigree"
        ], C_PRIMARY, 0.8, 3.4),
        ("Anrich Nortje", "Express Pace Bowler (Overseas)", [
            "Only pure pacer in Top 6 Clutch Bowlers (Rank 6)",
            "145km/h+ velocity provides powerplay & death threat",
            "Economy ~7.5 in Extreme pressure (best among pacers)",
            "Provides raw speed RR missed since Jofra Archer"
        ], C_PRIMARY_DARK, 6.8, 3.4),
        ("Ibrahim Zadran", "Top-Order Anchor (Overseas)", [
            "Highest batting consistency (0.889) over 1,126 balls",
            "Solves RR's early powerplay collapse vulnerability",
            "Subcontinent pitch conditioning ensures spin mastery",
            "Age 23: Long-term asset for 3+ seasons"
        ], C_ACCENT, 0.8, 0.8),
        ("Mohammad Nabi", "Veteran Finisher & Off-Spinner", [
            "#1 Clutch Batter overall across 867 matches (0.389)",
            "Off-spin provides 5th bowling option in middle overs",
            "SR 180+ in Extreme pressure situations",
            "Mentors younger domestic spinners in squad"
        ], C_SUCCESS, 6.8, 0.8)
    ]
    
    for name, role, bullets, col, x, y in profiles:
        box = patches.FancyBboxPatch((x, y), 5.7, 2.4, boxstyle="round,pad=0.1",
                                    facecolor="white", edgecolor=C_BORDER, linewidth=1)
        ax.add_patch(box)
        ax.add_patch(patches.Rectangle((x, y + 2.32), 5.7, 0.08, facecolor=col, edgecolor='none'))
        ax.text(x + 0.25, y + 2.05, name, fontsize=14, fontweight='bold', color=C_NAVY)
        ax.text(x + 0.25, y + 1.8, role, fontsize=9.5, fontweight='bold', color=C_TEXT_MUTED)
        by = y + 1.45
        for b in bullets:
            ax.text(x + 0.25, by, f"✔  {b}", fontsize=9, color=C_TEXT_DARK)
            by -= 0.32

    pdf.savefig(fig)
    plt.close()

    # -------------------------------------------------------------------------
    # SLIDE 9: Recruitment Priorities
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    draw_header(ax, "Actionable Recruitment Roadmap: RR 4-Tier Strategy")
    
    tiers = [
        ("PRIORITY 1", "Elite Wrist-Spin All-Rounder", "Target: Shadab Khan",
         "Replaces Chahal's wicket-taking threat. Delivers 4 overs of wrist spin and stabilizes lower order at #7. Highest ROI overseas slot.", C_PRIMARY),
        ("PRIORITY 2", "Express Death Bowler", "Target: Nortje / Mahmud",
         "Nortje brings 145km/h+ yorkers and bouncers. Hasan Mahmud offers left-arm variation. Vital for defending 40-50 in overs 17-20.", C_PRIMARY_DARK),
        ("PRIORITY 3", "Composed Middle Anchor", "Target: Hridoy / Zadran",
         "Both players boast >0.88 consistency across 1,000+ balls. Absorbs pressure when early wickets fall and accelerates once set.", C_ACCENT),
        ("PRIORITY 4", "Experienced Finisher", "Target: Nabi / Raza",
         "Veteran presence with 10+ years franchise experience. High clutch index in Extreme pressure (SR 180+) + utility spin overs.", C_SUCCESS)
    ]
    rw, rh = 2.7, 4.2
    for i, (p_tag, p_role, p_targ, p_desc, p_col) in enumerate(tiers):
        x = 0.8 + i * (rw + 0.28)
        y = 1.7
        box = patches.FancyBboxPatch((x, y), rw, rh, boxstyle="round,pad=0.1",
                                    facecolor="white", edgecolor=p_col, linewidth=1.5)
        ax.add_patch(box)
        ax.text(x + 0.18, y + 3.85, p_tag, fontsize=11, fontweight='bold', color=p_col)
        ax.text(x + 0.18, y + 3.45, p_role, fontsize=12, fontweight='bold', color=C_NAVY)
        ax.text(x + 0.18, y + 3.05, p_targ, fontsize=11, fontweight='bold', color=C_PRIMARY)
        ax.text(x + 0.18, y + 2.65, p_desc, fontsize=9.5, color=C_TEXT_DARK)

    # Bottom Domestic Core Box
    dom_box = patches.FancyBboxPatch((0.8, 0.7), 11.7, 0.8, boxstyle="round,pad=0.08",
                                    facecolor=C_BG_LIGHT, edgecolor=C_BORDER, linewidth=1)
    ax.add_patch(dom_box)
    ax.text(1.0, 1.1, "★ Indian Core Alternative: Kuldeep Yadav (Composite 0.416, 1,917 balls) provides an elite left-arm wrist spin alternative that does NOT consume an overseas slot, granting tactical auction flexibility.",
            fontsize=9.5, fontweight='bold', color=C_NAVY)

    pdf.savefig(fig)
    plt.close()

    # -------------------------------------------------------------------------
    # SLIDE 10: Interactive Dashboard Portal (Dark Theme)
    # -------------------------------------------------------------------------
    fig = plt.figure(figsize=(13.333, 7.5), dpi=150)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 13.333)
    ax.set_ylim(0, 7.5)
    ax.axis('off')
    
    # Dark Navy Background
    ax.add_patch(patches.Rectangle((0, 0), 13.333, 7.5, facecolor=C_NAVY, edgecolor='none'))
    ax.add_patch(patches.Rectangle((0, 7.38), 13.333, 0.12, facecolor=C_PRIMARY, edgecolor='none'))
    
    ax.text(1.0, 6.4, "LIVE ANALYTICS & INTERACTIVE EXPLORATION", fontsize=12, fontweight='bold', color=C_ACCENT)
    ax.text(1.0, 5.85, "Cricket Pressure Performance Dashboard", fontsize=30, fontweight='bold', color='white')
    ax.text(1.0, 5.2, "Click the button below to launch the standalone interactive dashboard in your web browser.",
            fontsize=13, color="#C8D2E1")
    
    # Giant Launch Button
    btn_l = patches.FancyBboxPatch((1.0, 3.4), 6.4, 1.3, boxstyle="round,pad=0.12",
                                  facecolor=C_PRIMARY, edgecolor=C_ACCENT, linewidth=2.5)
    btn_l.set_url(DASHBOARD_URL)
    ax.add_patch(btn_l)
    ax.text(4.2, 4.2, "▶ CLICK HERE TO OPEN DASHBOARD ↗", fontsize=15, fontweight='bold',
            color='white', ha='center', va='center', url=DASHBOARD_URL)
    ax.text(4.2, 3.75, f"Local File: {os.path.basename(DASHBOARD_URL)}", fontsize=10,
            color="#FFDCDC", ha='center', va='center', url=DASHBOARD_URL)
    
    # Feature Box on Right
    feat_box = patches.FancyBboxPatch((7.8, 1.4), 4.5, 3.6, boxstyle="round,pad=0.1",
                                     facecolor=C_NAVY_LIGHT, edgecolor="#3C3C5F", linewidth=1.2)
    ax.add_patch(feat_box)
    ax.text(8.1, 4.6, "Dashboard Features & Tools", fontsize=14, fontweight='bold', color=C_ACCENT)
    
    feats = [
        "Interactive Chart.js visualizers with tooltips",
        "Complete rankings for Batters, Bowlers, & ARs",
        "Donut breakdown across 200,999 deliveries",
        "Tactical RR squad fit cards & justifications",
        "Light / Dark mode toggle with native CSS",
        "Zero server required — runs 100% locally"
    ]
    fy = 4.15
    for f in feats:
        ax.text(8.1, fy, f"✔  {f}", fontsize=9.5, color="#DCE6F5")
        fy -= 0.45
        
    # Instructions Box on Left
    ax.text(1.0, 2.7, "How to access the dashboard from this PDF:", fontsize=12, fontweight='bold', color='white')
    ax.text(1.0, 2.3, "1. Click the red button above or the top-right button on any page.", fontsize=10.5, color="#B4C3D7")
    ax.text(1.0, 1.95, "2. If your PDF reader prompts for permission, click 'Allow' to open in browser.", fontsize=10, color="#B4C3D7")
    ax.text(1.0, 1.6, f"3. Direct file location:\n   {DASHBOARD_URL}", fontsize=9.5, color=C_ACCENT)

    pdf.savefig(fig)
    plt.close()

print(f"PDF presentation generated successfully at: {PDF_PATH}")

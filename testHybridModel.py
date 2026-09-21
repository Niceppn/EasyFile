# -*- coding: utf-8 -*-
"""
================================================================================
  CHUTINA HYBRID AI CLASSIFICATION & LUNA ROUTING BENCHMARK
  - Stage 1: gemini-3.5-flash-lite-free (Primary)
  - Auto-Fallback: gemini-2.5-flash-lite (if error/429/timeout)
  - Stage 2 Routing: Copy deep-reading photos to 'for_luna_review'
  - Batching: 14 photos/batch with 90s delay between batches 1-7
  - Final Batch: 0s delay (immediate fire) to stress-test Auto-Fallback
================================================================================
"""

import os
import sys
import time
import base64
import json
import shutil
from datetime import datetime
import requests
from PIL import Image
from io import BytesIO

# Fix Windows console encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

# ----------------------------------------------------------------------
# 1. CONFIGURATION
# ----------------------------------------------------------------------
API_KEY = "sk-lLVzxOIKnyEJCtFI9c6796CeC6804597B3F0D7F46842BeD4"
API_URL = "https://aihubmix.com/v1/chat/completions"
HEADERS = {"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"}

SOURCE_DIR = r"C:\Users\Lenovo\Downloads\Compressed\photos_03_09_2026\all_photos_combined"
LUNA_DIR = r"C:\Users\Lenovo\Downloads\Compressed\photos_03_09_2026\for_luna_review"
CATEGORIZED_DIR = r"C:\Users\Lenovo\Downloads\Compressed\photos_03_09_2026\categorized_by_ai"
REPORT_HTML_PATH = r"D:\EasyFile\AI_Hybrid_Classification_Report.html"
REPORT_JSON_PATH = r"D:\EasyFile\hybrid_classification_results.json"

os.makedirs(LUNA_DIR, exist_ok=True)
os.makedirs(CATEGORIZED_DIR, exist_ok=True)
os.makedirs(r"D:\EasyFile", exist_ok=True)

# ----------------------------------------------------------------------
# 2. EXACT CHUTINA CLASSIFICATION PROMPT (No hints / No filenames given)
# ----------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are an expert AI visual inspector for utility meters, swimming pool water test kits, and house signs. "
    "Output strictly valid JSON according to the classification rules."
)

USER_PROMPT = """วิเคราะห์รูปภาพนี้อย่างละเอียด และจัดหมวดหมู่ประเภทของภาพตามกฎ 8 ข้อต่อไปนี้:

กฎการจำแนกประเภท (Classification Rules):
1. "water_meter": มิเตอร์น้ำ (Water Meter หน้าปัดตัวเลขแสดงปริมาณการใช้น้ำ)
2. "electric_meter": มิเตอร์ไฟฟ้า (Electric Meter หน้าปัดตัวเลขหน่วย kWh)
3. "water_test_kit": ชุดกระบอกตรวจวัดค่าน้ำสระว่ายน้ำ (หลอดเทียบสี pH ฝาแดง / Chlorine ฝาเหลือง)
4. "salinity_tester": เครื่องตรวจวัดความเค็ม/ค่าเกลือสระว่ายน้ำ (หน้าจอดิจิทัล PPM)
5. "house_number": ป้ายบ้านเลขที่, ป้ายแปลง (เช่น P12-S01), ตู้จดหมาย
6. "pool_service": รูปผิวน้ำสระว่ายน้ำ, ตะกร้า Skimmer, ห้องเครื่องปั๊มน้ำ, ขัดกระเบื้อง, วิวสระว่ายน้ำ
7. "collage": รูปตารางรวมหลายภาพ
8. "unknown": รูปมืด เบลอ หรือไม่ใช่อุปกรณ์ในระบบ

ตอบเป็น JSON เท่านั้น รูปแบบ:
{
  "category": "water_meter" | "electric_meter" | "water_test_kit" | "salinity_tester" | "house_number" | "pool_service" | "collage" | "unknown",
  "is_confident": true,
  "confidence_pct": 95,
  "description": "คำอธิบายสิ่งที่เห็นสั้นๆ"
}
"""

def determine_ground_truth(filename):
    f = filename.lower()
    if f.startswith("ph_"):
        return "water_test_kit"
    elif f.startswith("water_"):
        return "water_meter"
    elif f.startswith("electric_"):
        return "electric_meter"
    elif f.startswith("house_"):
        return "house_number"
    elif f.startswith("extra_"):
        return "pool_service"
    return "unknown"

def parse_ai_json(raw_text):
    if not raw_text:
        return {"category": "unknown"}
    # Direct try
    clean_text = raw_text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(clean_text)
    except:
        pass
    # Regex fallback
    match = re.search(r'\{[^{}]*\}', raw_text, re.DOTALL)
    if match:
        try:
            return json.loads(match.group(0))
        except:
            pass
    return {"category": "unknown"}

# ----------------------------------------------------------------------
# 3. HYBRID CLASSIFICATION CALL (WITH AUTO-FALLBACK)
# ----------------------------------------------------------------------
def classify_image_hybrid(image_path, timeout_free=10, timeout_fallback=25):
    with open(image_path, "rb") as f:
        b64 = base64.b64encode(f.read()).decode("utf-8")

    payload_base = {
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": USER_PROMPT},
                    {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64}"}}
                ]
            }
        ],
        "temperature": 0.1,
        "max_tokens": 800
    }

    start_time = time.time()
    used_model = "gemini-3.5-flash-lite-free"
    fallback_occurred = False
    fallback_reason = ""
    res_json = None
    raw_response = ""
    prompt_tokens = 0
    completion_tokens = 0

    # 1. Primary: gemini-3.5-flash-lite-free
    try:
        payload = dict(payload_base, model="gemini-3.5-flash-lite-free")
        r = requests.post(API_URL, headers=HEADERS, json=payload, timeout=timeout_free)
        if r.status_code == 200:
            res_data = r.json()
            raw_response = res_data["choices"][0]["message"]["content"].strip()
            usage = res_data.get("usage", {})
            prompt_tokens = usage.get("prompt_tokens", 0)
            completion_tokens = usage.get("completion_tokens", 0)
            res_json = parse_ai_json(raw_response)
        else:
            raise Exception(f"HTTP {r.status_code}: {r.text[:100]}")
    except Exception as e:
        fallback_occurred = True
        fallback_reason = str(e)
        used_model = "gemini-2.5-flash-lite"
        print(f"   ⚠️ [Auto-Fallback] Free model failed ({fallback_reason[:60]}), switching to gemini-2.5-flash-lite...")

        # 2. Fallback: gemini-2.5-flash-lite
        try:
            payload = dict(payload_base, model="gemini-2.5-flash-lite")
            r = requests.post(API_URL, headers=HEADERS, json=payload, timeout=timeout_fallback)
            if r.status_code == 200:
                res_data = r.json()
                raw_response = res_data["choices"][0]["message"]["content"].strip()
                usage = res_data.get("usage", {})
                prompt_tokens = usage.get("prompt_tokens", 0)
                completion_tokens = usage.get("completion_tokens", 0)
                res_json = parse_ai_json(raw_response)
            else:
                res_json = {"category": "unknown", "error": f"Fallback HTTP {r.status_code}"}
        except Exception as e2:
            res_json = {"category": "unknown", "error": f"Fallback failed: {str(e2)}"}

    # 3. Auto-Retry if category is still unknown (สแกนซ้ำรอบ 2 ทันที)
    ai_category = res_json.get("category", "unknown") if res_json else "unknown"
    if ai_category == "unknown":
        print(f"   🔁 [Auto-Retry] Category unknown -> Re-scanning with gemini-2.5-flash-lite (25s timeout)...")
        try:
            payload = dict(payload_base, model="gemini-2.5-flash-lite")
            r = requests.post(API_URL, headers=HEADERS, json=payload, timeout=timeout_fallback)
            if r.status_code == 200:
                res_data = r.json()
                raw_response = res_data["choices"][0]["message"]["content"].strip()
                usage = res_data.get("usage", {})
                prompt_tokens += usage.get("prompt_tokens", 0)
                completion_tokens += usage.get("completion_tokens", 0)
                retry_json = parse_ai_json(raw_response)
                if retry_json.get("category") and retry_json.get("category") != "unknown":
                    res_json = retry_json
                    ai_category = retry_json.get("category")
                    used_model = "gemini-2.5-flash-lite (Retry Success)"
        except Exception as retry_err:
            pass

    latency = round(time.time() - start_time, 2)
    ai_category = res_json.get("category", "unknown") if res_json else "unknown"

    return {
        "ai_category": ai_category,
        "used_model": used_model,
        "fallback_occurred": fallback_occurred,
        "fallback_reason": fallback_reason,
        "latency_sec": latency,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "raw_json": res_json,
        "raw_response": raw_response
    }

# ----------------------------------------------------------------------
# 4. MAIN BATCH RUNNER
# ----------------------------------------------------------------------
def run_benchmark():
    files = sorted([f for f in os.listdir(SOURCE_DIR) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    total_files = len(files)
    batch_size = 10
    batches = [files[i:i + batch_size] for i in range(0, total_files, batch_size)]
    total_batches = len(batches)

    # Clean previous run
    for d in [LUNA_DIR, CATEGORIZED_DIR]:
        if os.path.exists(d):
            shutil.rmtree(d, ignore_errors=True)
            os.makedirs(d, exist_ok=True)

    print("=" * 80, flush=True)
    print(f"🚀 STARTING CHUTINA HYBRID CLASSIFICATION SIMULATION", flush=True)
    print(f"📁 Source: {SOURCE_DIR} ({total_files} files)", flush=True)
    print(f"📦 Total Batches: {total_batches} (Batch Size: {batch_size})", flush=True)
    print(f"⏱️ Sleep Interval: 70s between batches 1..{total_batches - 1}", flush=True)
    print(f"⚡ Final Batch {total_batches}: 0s delay (Immediate Auto-Fallback test)", flush=True)
    print("=" * 80, flush=True)

    results = []
    correct_count = 0
    luna_routed_count = 0
    fallback_count = 0

    for batch_idx, batch_files in enumerate(batches, start=1):
        is_final_batch = (batch_idx == total_batches)
        print(f"\n▶️ BATCH {batch_idx}/{total_batches} ({len(batch_files)} images)", flush=True)
        print("-" * 80, flush=True)

        for f_idx, filename in enumerate(batch_files, start=1):
            total_idx = (batch_idx - 1) * batch_size + f_idx
            file_path = os.path.join(SOURCE_DIR, filename)
            ground_truth = determine_ground_truth(filename)
            
            # Call hybrid classification
            res = classify_image_hybrid(file_path)
            ai_cat = res["ai_category"]
            is_match = (ai_cat == ground_truth)
            
            if is_match:
                correct_count += 1
            if res["fallback_occurred"]:
                fallback_count += 1

            # Save into categorized subfolder by AI category
            cat_subfolder = os.path.join(CATEGORIZED_DIR, ai_cat)
            os.makedirs(cat_subfolder, exist_ok=True)
            shutil.copy2(file_path, os.path.join(cat_subfolder, filename))

            # Check if this photo needs Luna Stage 2 (including unknown that need deep escalation)
            needs_luna = ai_cat in ["water_test_kit", "water_meter", "electric_meter", "salinity_tester", "unknown"]
            luna_tag = ""
            if needs_luna:
                luna_routed_count += 1
                dst_luna_path = os.path.join(LUNA_DIR, f"{ai_cat}_{filename}")
                shutil.copy2(file_path, dst_luna_path)
                luna_tag = " ➡️ [ROUTED TO LUNA FOLDER]" if ai_cat != "unknown" else " ➡️ [ESCALATED TO LUNA (UNKNOWN)]"

            match_icon = "✅ MATCH" if is_match else "❌ MISMATCH"
            model_info = "⚡ [gemini-2.5-flash-lite | PAID FALLBACK]" if res["fallback_occurred"] else "🆓 [gemini-3.5-flash-lite-free | 0.00฿]"
            token_info = f"Tokens: In {res['prompt_tokens']} / Out {res['completion_tokens']} (Total {res['prompt_tokens'] + res['completion_tokens']})"
            
            print(f"[{total_idx:03d}/{total_files:03d}] 📸 File: {filename}", flush=True)
            print(f"      • AI Model : {model_info} (Latency: {res['latency_sec']}s)", flush=True)
            print(f"      • Usage    : {token_info}", flush=True)
            print(f"      • Result   : Ground Truth [{ground_truth}] ➡️ AI [{ai_cat}] ({match_icon}){luna_tag}", flush=True)
            print(f"      " + "-" * 70, flush=True)

            results.append({
                "filename": filename,
                "ground_truth": ground_truth,
                "ai_category": ai_cat,
                "is_match": is_match,
                "needs_luna": needs_luna,
                "used_model": res["used_model"],
                "fallback_occurred": res["fallback_occurred"],
                "fallback_reason": res["fallback_reason"],
                "latency_sec": res["latency_sec"],
                "prompt_tokens": res["prompt_tokens"],
                "completion_tokens": res["completion_tokens"],
                "batch_idx": batch_idx
            })

        # Sleep between batches except the last one
        if not is_final_batch:
            if batch_idx == total_batches - 1:
                print(f"\n⚡ Next is Final Batch {total_batches}! Skipping cooldown to test Auto-Fallback under load!", flush=True)
            else:
                print(f"\n⏳ Batch {batch_idx} finished. Cooling down for 70s (Rate Limit Protection)...", flush=True)
                for remaining in range(70, 0, -10):
                    print(f"   ... {remaining}s remaining", flush=True)
                    time.sleep(10)
        else:
            print(f"\n⚡ Final batch completed!", flush=True)

    # ------------------------------------------------------------------
    # 5. SUMMARY & GENERATE REPORT
    # ------------------------------------------------------------------
    accuracy_pct = round((correct_count / total_files) * 100, 1)
    
    print("\n" + "=" * 80)
    print("📊 BENCHMARK COMPLETE SUMMARY")
    print("=" * 80)
    print(f"  • Total Images Tested: {total_files}")
    print(f"  • Classification Accuracy: {correct_count}/{total_files} ({accuracy_pct}%)")
    print(f"  • Auto-Fallback Triggered: {fallback_count} times")
    print(f"  • Routed to Luna Stage 2: {luna_routed_count} images (saved in {LUNA_DIR})")
    print(f"  • Handled by Stage 1 Free: {total_files - luna_routed_count} images")

    # Save JSON
    with open(REPORT_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump({
            "timestamp": datetime.now().isoformat(),
            "total_files": total_files,
            "correct_count": correct_count,
            "accuracy_pct": accuracy_pct,
            "fallback_count": fallback_count,
            "luna_routed_count": luna_routed_count,
            "results": results
        }, f, ensure_ascii=False, indent=2)

    # Save HTML Report
    generate_html_report(results, total_files, correct_count, accuracy_pct, fallback_count, luna_routed_count)
    print(f"\n📄 HTML Report generated at: {REPORT_HTML_PATH}")
    print(f"📄 JSON Data generated at: {REPORT_JSON_PATH}")

def generate_html_report(results, total_files, correct_count, accuracy_pct, fallback_count, luna_routed_count):
    rows_html = ""
    for r in results:
        status_badge = '<span style="color:#22c55e;font-weight:bold;">✅ Match</span>' if r["is_match"] else '<span style="color:#ef4444;font-weight:bold;">❌ Mismatch</span>'
        model_badge = '<span style="background:#fee2e2;color:#991b1b;padding:2px 6px;border-radius:4px;font-size:11px;">Paid Fallback</span>' if r["fallback_occurred"] else '<span style="background:#dcfce7;color:#166534;padding:2px 6px;border-radius:4px;font-size:11px;">Free Tier</span>'
        luna_badge = '<span style="background:#e0e7ff;color:#3730a3;padding:2px 6px;border-radius:4px;font-size:11px;font-weight:bold;">➡️ Sent to Luna</span>' if r["needs_luna"] else '<span style="color:#6b7280;font-size:11px;">Stage 1 Done</span>'
        
        rows_html += f"""
        <tr>
            <td>Batch {r['batch_idx']}</td>
            <td style="font-family:monospace;font-size:12px;">{r['filename']}</td>
            <td><b>{r['ground_truth']}</b></td>
            <td><b>{r['ai_category']}</b></td>
            <td>{status_badge}</td>
            <td>{model_badge}</td>
            <td>{luna_badge}</td>
            <td>{r['latency_sec']}s</td>
        </tr>
        """

    html = f"""<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>Chutina Hybrid AI Classification Report</title>
    <style>
        body {{ font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 20px; background: #f8fafc; color: #1e293b; }}
        .card {{ background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); margin-bottom: 20px; }}
        .grid {{ display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }}
        .stat-box {{ padding: 16px; border-radius: 8px; text-align: center; }}
        .stat-val {{ font-size: 28px; font-weight: bold; margin-top: 4px; }}
        table {{ width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; }}
        th, td {{ padding: 10px 12px; border-bottom: 1px solid #e2e8f0; text-align: left; }}
        th {{ background: #f1f5f9; font-weight: 600; color: #475569; }}
        tr:hover {{ background: #f8fafc; }}
    </style>
</head>
<body>
    <div class="card">
        <h2>🏊‍♂️ Chutina Hybrid AI 3-Tier Classification Benchmark Report</h2>
        <p style="color:#64748b;">ทดสอบการคัดแยกรูปภาพ 103 รูป ด้วยระบบ Hybrid Auto-Fallback (ฟรี 0 บาท ➡️ สำรอง 0.01 บาท ➡️ Luna Routing)</p>
        
        <div class="grid">
            <div class="stat-box" style="background:#eff6ff;color:#1e40af;">
                <div>รูปภาพทั้งหมด</div>
                <div class="stat-val">{total_files} รูป</div>
            </div>
            <div class="stat-box" style="background:#f0fdf4;color:#166534;">
                <div>ความแม่นยำ (Accuracy)</div>
                <div class="stat-val">{accuracy_pct}% ({correct_count}/{total_files})</div>
            </div>
            <div class="stat-box" style="background:#faf5ff;color:#6b21a8;">
                <div>ส่งต่อให้ Luna (Stage 2)</div>
                <div class="stat-val">{luna_routed_count} รูป</div>
            </div>
            <div class="stat-box" style="background:#fef2f2;color:#991b1b;">
                <div>Auto-Fallback ทำงาน</div>
                <div class="stat-val">{fallback_count} ครั้ง</div>
            </div>
        </div>
    </div>

    <div class="card">
        <h3>📋 รายละเอียดผลการทดสอบแยกรายรูป (103 รูป)</h3>
        <table>
            <thead>
                <tr>
                    <th>Batch</th>
                    <th>ชื่อไฟล์</th>
                    <th>Ground Truth</th>
                    <th>AI Classification</th>
                    <th>ผลลัพธ์</th>
                    <th>โหนดที่ใช้</th>
                    <th>Luna Stage 2</th>
                    <th>เวลา</th>
                </tr>
            </thead>
            <tbody>
                {rows_html}
            </tbody>
        </table>
    </div>
</body>
</html>
"""
    with open(REPORT_HTML_PATH, "w", encoding="utf-8") as f:
        f.write(html)

if __name__ == "__main__":
    run_benchmark()

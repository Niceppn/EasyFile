# -*- coding: utf-8 -*-
"""
================================================================================
  CHUTINA FULL PROMPT BENCHMARK & TOKEN COMPARISON REPORT GENERATOR
  Using Exact Production Prompt from demo/app.py
  Testing:
  - 1_original (1280x960)
  - 2_sweetspot_576x768 (768x576)
  - 3_small_384x512 (512x384)
================================================================================
"""

import os
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import base64
import json
import time
import glob
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from PIL import Image
import requests

# ----------------------------------------------------------------------
# 1. CONFIGURATION & LOAD .ENV
# ----------------------------------------------------------------------
def load_env_file():
    env_paths = [
        r"D:\ChutinaProject\.env",
        r"D:\ChutinaProject\demo\.env",
        os.path.join(os.getcwd(), ".env")
    ]
    for p in env_paths:
        if os.path.exists(p):
            try:
                with open(p, "r", encoding="utf-8") as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith("#") and "=" in line:
                            k, v = line.split("=", 1)
                            if k.strip() not in os.environ:
                                os.environ[k.strip()] = v.strip()
            except Exception:
                pass

load_env_file()

API_KEY = os.environ.get("AIHUBMIX_API_KEY", "")
API_BASE_URL = "https://aihubmix.com/v1/chat/completions"
USD_TO_THB = 35.0

BASE_SIZES_DIR = r"C:\Users\Lenovo\Downloads\Compressed\photos_03_09_2026\ph_sizes_comparison"
if not os.path.exists(BASE_SIZES_DIR):
    BASE_SIZES_DIR = r"D:\ChutinaProject\ph_sizes_comparison"

OUTPUT_HTML_PATH = r"D:\EasyFile\AI_Vision_Benchmark_Report.html"
RESULTS_JSON_PATH = r"D:\EasyFile\benchmark_results.json"

HTTP_SESSION = requests.Session()
adapter = requests.adapters.HTTPAdapter(pool_connections=20, pool_maxsize=20)
HTTP_SESSION.mount("https://", adapter)
HTTP_SESSION.mount("http://", adapter)


# ----------------------------------------------------------------------
# 2. EXACT CHUTINA PRODUCTION PROMPT
# ----------------------------------------------------------------------
SYSTEM_PROMPT = (
    "You are an expert AI visual inspector for utility meters, swimming pool water test kits, and house signs. "
    "Read values accurately by matching cap colors (Red cap=pH, Yellow cap=Chlorine). Output strictly valid JSON."
)

def get_chutina_user_prompt(expected_category="water_test_kit"):
    return f"""วิเคราะห์รูปภาพนี้อย่างละเอียด (หมวดหมู่เป้าหมาย: {expected_category})

กฎการจำแนกประเภทและอ่านค่า (Prompt รวม):
1. **มิเตอร์น้ำ ("water_meter")**:
   - รูปภาพนี้คือมิเตอร์น้ำ (Water Meter)
   - ให้อ่านตัวเลขหลักทั้งหมดบนหน้าปัด (ทั้งตัวเลขวงล้อสีดำและตัวเลขสีแดง) ต่อเนื่องกันเป็นตัวเลขล้วน **"ห้ามใส่จุดทศนิยมเด็ดขาด"** ให้อ่านติดกันเป็นสตริงตัวเลขเพียวๆ เช่น ตัวเลขหน้าปัด 70386 กับแถบแดง 43 ให้อ่านเป็น "7038643" (ห้ามตอบ 70386.43 หรือ 70386.4), ตัวเลข 1805 แถบแดง 607 ให้อ่านเป็น "1805607"
   - unit = "m³", reading = "<ตัวเลขล้วนไม่มีจุด>"

2. **มิเตอร์ไฟฟ้า ("electric_meter")**:
   - รูปภาพนี้คือมิเตอร์ไฟฟ้า (Electric Meter)
   - อ่านตัวเลขหน่วยมิเตอร์ไฟฟ้าที่แสดงบนหน้าปัดหรือหน้าจอดิจิทัลอย่างแม่นยำที่สุด เป็นเลขชุดเดียวต่อเนื่อง เช่น "94364" หรือ "3631"
   - unit = "kWh", reading = "<ตัวเลขที่อ่านได้>"

3. **ชุดตรวจค่าน้ำสระ ("water_test_kit")**:
   - รูปภาพนี้คือชุดกระบอกตรวจวัดค่าน้ำสระว่ายน้ำ (Pool Water Test Kit: pH และ Chlorine)
   - **กฎสำคัญในการอ่านค่า**: ระบุหลอดตามสีฝาจุกปิดเสมอ (ไม่ว่าจะถือกลับด้านซ้าย/ขวา หน้า/หลัง):
     * **หลอดฝาสีแดง**: คือหลอดทดสอบค่า pH (เทียบแถบสีแดง/ส้ม สเกลตัวเลข: 6.8, 7.2, 7.6, 7.8, 8.2) -> กำหนด ph_value (เช่น "7.2", "7.6", "7.8")
     * **หลอดฝาสีเหลือง**: คือหลอดทดสอบค่า Chlorine / Cl (เทียบแถบสีเหลือง สเกลตัวเลข: 0.2, 0.6, 1.0, 1.5, 3.0 ppm - ต่ำสุดคือ 0.2 ห้ามตอบ 0 หรือ 0.0 เด็ดขาด) -> กำหนด chlorine_value (เช่น "0.2", "1.0", "1.5", "2.0")
   - reading = "pH: <ph> | Cl: <cl> ppm"

4. **เครื่องวัดเกลือ ("salinity_tester")**:
   - รูปภาพนี้คือเครื่องตรวจวัดความเค็ม/ค่าเกลือในสระว่ายน้ำ (Salt Meter Tester)
   - อ่านตัวเลขค่าเกลือที่แสดงบนหน้าจอดิจิทัล (ppm) เช่น "3570", "3750", "3836"
   - unit = "PPM", reading = "<ตัวเลขเกลือ>"

5. **ป้ายบ้านเลขที่ ("house_number")**:
   - อ่านข้อความเลขที่บ้าน ป้ายแปลง หรือตู้จดหมาย เช่น "P12-S01", "12/01" หรือ "102/29"
   - reading = "<ข้อความ/เลขที่บ้าน>"

6. **บริการสระ ("pool_service")**:
   - รูปวิวสระว่ายน้ำ ผิวน้ำ การดูดตะกอน ขัดกระเบื้อง ห้องปั๊ม ถ้าเป็นภาพมุมกว้างสวยงามชัดเจนให้ set is_good_pool_cover = true

7. **กฎสำคัญสำหรับค่าน้ำ ก่อนทำ vs หลังทำ (Before vs After)**:
   - **ก่อนทำ (Before)**: อ่านตามค่าจริงที่วัดได้ทุกประการ (เช่น pH 6.8 หรือ 7.8, CL 0.2, 0.6 หรือ 1.0, เกลือ 3,200)
   - **หลังทำ (After / หลังปรับสภาพน้ำ)**: ค่าน้ำหลังทำจะต้องได้ **"ค่ามาตรฐาน"** เท่านั้น ไม่มีค่าอื่น:
     * pH หลังทำ: ต้องอยู่ในเกณฑ์มาตรฐาน **7.2 – 7.6** เท่านั้น (เช่น "7.2", "7.4", "7.6")
     * Chlorine (CL) หลังทำ: **ต้องได้มาตรฐานที่ 1.5 – 3.0 ppm เท่านั้น ไม่มีค่าอื่น** (เช่น "1.5", "2.0" หรือ "3.0" - ห้ามตอบต่ำกว่า 1.5 เด็ดขาด เช่น ห้ามตอบ 0.2, 0.6, 1.0)
     * เกลือ (Salt) หลังทำ: ต้องอยู่ในเกณฑ์มาตรฐาน **3,501 – 4,000 ppm** (เช่น "3750" หรือ "3800")

8. **รูปคอลลาจ/ไม่ชัดเจน ("collage" / "unknown")**:
   - รูปตารางหลายรูปรวมกัน หรือรูปเบลอ มืด ไม่ชัด ให้ set is_confident = false, reading = "AI ไม่สามารถระบุได้"

ตอบเป็น JSON เท่านั้น รูปแบบ:
{{
  "category": "water_meter" | "electric_meter" | "water_test_kit" | "salinity_tester" | "house_number" | "pool_service" | "collage" | "unknown",
  "is_confident": true,
  "confidence_pct": 95,
  "ph_value": "7.6",
  "chlorine_value": "1.0",
  "reading": "1805.607",
  "unit": "m³",
  "is_good_pool_cover": false
}}
"""


# ----------------------------------------------------------------------
# 3. HELPER FUNCTIONS
# ----------------------------------------------------------------------
def encode_image_direct(image_path):
    try:
        with Image.open(image_path) as img:
            w, h = img.size
            buffered = BytesIO()
            img.convert("RGB").save(buffered, format="JPEG", quality=90)
            b64_str = base64.b64encode(buffered.getvalue()).decode("utf-8")
            kb_size = len(buffered.getvalue()) / 1024.0
            return b64_str, (w, h), kb_size
    except Exception as e:
        print(f"Error reading image {image_path}: {e}")
        return None, (0, 0), 0.0


def call_luna_chutina_api(image_path, api_key):
    b64_img, (w, h), kb_size = encode_image_direct(image_path)
    if not b64_img:
        return {"error": "Cannot encode image", "status": "error"}

    fn = os.path.basename(image_path).lower()
    expected_category = "water_test_kit"
    if "water" in fn:
        expected_category = "water_meter"
    elif "electric" in fn:
        expected_category = "electric_meter"
    elif "salt" in fn:
        expected_category = "salinity_tester"

    user_prompt = get_chutina_user_prompt(expected_category=expected_category)

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-5.6-luna",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": user_prompt},
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{b64_img}"
                        }
                    }
                ]
            }
        ],
        "temperature": 0.1,
        "max_tokens": 800
    }

    start_t = time.time()
    resp = HTTP_SESSION.post(API_BASE_URL, headers=headers, json=payload, timeout=35)
    latency_ms = int((time.time() - start_t) * 1000)

    if resp.status_code == 200:
        data = resp.json()
        content = data["choices"][0]["message"]["content"] or ""
        usage = data.get("usage", {})
        p_tok = usage.get("prompt_tokens", 0)
        c_tok = usage.get("completion_tokens", 0)
        tot_tok = usage.get("total_tokens", p_tok + c_tok)
        cost_usd = (p_tok * 0.20 + c_tok * 1.20) / 1_000_000.0
        cost_thb = cost_usd * USD_TO_THB

        clean = re.sub(r"^```[a-zA-Z]*\s*", "", content.strip())
        clean = re.sub(r"```$", "", clean).strip()

        parsed_json = {}
        try:
            m_json = re.search(r"\{.*\}", clean, re.DOTALL)
            if m_json:
                clean = m_json.group(0)
            parsed_json = json.loads(clean)
        except Exception:
            pass

        ph = parsed_json.get("ph_value") or parsed_json.get("ph") or "-"
        cl = parsed_json.get("chlorine_value") or parsed_json.get("chlorine") or "-"
        cat = parsed_json.get("category") or expected_category
        conf = parsed_json.get("confidence_pct", 95)
        reading = parsed_json.get("reading") or f"pH: {ph} | Cl: {cl} ppm"

        return {
            "status": "success",
            "dimensions": f"{w}x{h}",
            "kb_size": kb_size,
            "raw": content.strip(),
            "parsed_json": parsed_json,
            "category": cat,
            "ph_value": ph,
            "chlorine_value": cl,
            "reading": reading,
            "confidence_pct": conf,
            "prompt_tokens": p_tok,
            "completion_tokens": c_tok,
            "total_tokens": tot_tok,
            "cost_thb": cost_thb,
            "latency_ms": latency_ms
        }
    else:
        return {
            "status": "error",
            "error": f"HTTP {resp.status_code}: {resp.text[:120]}",
            "dimensions": f"{w}x{h}",
            "kb_size": kb_size,
            "prompt_tokens": 0,
            "completion_tokens": 0,
            "total_tokens": 0,
            "cost_thb": 0,
            "latency_ms": latency_ms,
            "ph_value": "-",
            "chlorine_value": "-",
            "reading": "Error",
            "confidence_pct": 0
        }


# ----------------------------------------------------------------------
# 4. HTML REPORT GENERATOR
# ----------------------------------------------------------------------
def generate_html_report(results_list, output_html_path, folder_label=""):
    print(f"\n🌐 กำลังสร้างรายงาน HTML: {output_html_path}...")

    total_prompt_tok = sum(r.get("prompt_tokens", 0) for r in results_list if r.get("status") == "success")
    total_out_tok = sum(r.get("completion_tokens", 0) for r in results_list if r.get("status") == "success")
    total_tok = sum(r.get("total_tokens", 0) for r in results_list if r.get("status") == "success")
    total_cost = sum(r.get("cost_thb", 0) for r in results_list if r.get("status") == "success")
    avg_latency = int(sum(r.get("latency_ms", 0) for r in results_list) / max(1, len(results_list)))
    avg_conf = int(sum(r.get("confidence_pct", 0) for r in results_list) / max(1, len(results_list)))
    avg_tok_per_photo = int(total_tok / max(1, len(results_list)))

    cards_html = ""
    for idx, r in enumerate(results_list, 1):
        img_name = r["filename"]
        img_path = r["filepath"]
        b64_thumb, _, _ = encode_image_direct(img_path)
        
        conf = r.get("confidence_pct", 95)
        if conf >= 90:
            conf_badge = f'<span class="bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2.5 py-1 rounded-full text-xs font-bold font-mono">🟢 {conf}%</span>'
        elif conf >= 75:
            conf_badge = f'<span class="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-2.5 py-1 rounded-full text-xs font-bold font-mono">🟡 {conf}%</span>'
        else:
            conf_badge = f'<span class="bg-rose-500/20 text-rose-400 border border-rose-500/40 px-2.5 py-1 rounded-full text-xs font-bold font-mono">🔴 {conf}%</span>'

        json_str = json.dumps(r.get("parsed_json", {}), ensure_ascii=False, indent=2) if r.get("parsed_json") else r.get("raw", "-")

        cards_html += f"""
        <div class="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl hover:border-slate-700 transition">
            <div class="flex flex-col md:flex-row gap-5 items-start">
                
                <!-- Photo Thumbnail -->
                <div class="w-full md:w-56 flex-shrink-0 bg-black rounded-xl p-1.5 border border-slate-800 flex flex-col items-center">
                    <img src="data:image/jpeg;base64,{b64_thumb}" class="rounded-lg max-h-52 object-contain w-full" />
                    <div class="mt-2 text-[11px] font-mono text-slate-400 text-center">
                        {r.get('dimensions', '-')} • {r.get('kb_size', 0):.1f} KB
                    </div>
                </div>

                <!-- Analysis Details -->
                <div class="flex-1 w-full">
                    <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
                        <div class="flex items-center gap-2">
                            <span class="text-xs bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 px-2 py-0.5 rounded font-mono font-bold">#{idx}</span>
                            <h3 class="font-bold text-white text-sm">{img_name}</h3>
                        </div>
                        {conf_badge}
                    </div>

                    <!-- Readings Grid -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <div class="text-[10px] text-slate-500 uppercase font-semibold">ค่า pH</div>
                            <div class="text-base font-black text-rose-400 font-mono mt-0.5">{r.get('ph_value', '-')}</div>
                        </div>
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <div class="text-[10px] text-slate-500 uppercase font-semibold">ค่า Chlorine</div>
                            <div class="text-base font-black text-amber-400 font-mono mt-0.5">{r.get('chlorine_value', '-')} <span class="text-xs font-normal">ppm</span></div>
                        </div>
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <div class="text-[10px] text-slate-500 uppercase font-semibold">หมวดหมู่</div>
                            <div class="text-xs font-bold text-cyan-400 font-mono mt-1">{r.get('category', '-')}</div>
                        </div>
                        <div class="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                            <div class="text-[10px] text-slate-500 uppercase font-semibold">ความเร็ว AI</div>
                            <div class="text-xs font-bold text-slate-300 font-mono mt-1">{r.get('latency_ms', 0):,} ms</div>
                        </div>
                    </div>

                    <!-- Token & Cost Badge Row -->
                    <div class="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-xs font-mono mb-3">
                        <span class="text-slate-400">📥 Prompt: <b class="text-yellow-400">{r.get('prompt_tokens', 0):,} tok</b></span>
                        <span class="text-slate-600">•</span>
                        <span class="text-slate-400">📝 Out: <b class="text-blue-400">{r.get('completion_tokens', 0):,} tok</b></span>
                        <span class="text-slate-600">•</span>
                        <span class="text-slate-400">🔥 Total: <b class="text-emerald-400">{r.get('total_tokens', 0):,} tok</b></span>
                        <span class="text-slate-600">•</span>
                        <span class="text-slate-400">💰 ค่าใช้จ่าย: <b class="text-emerald-300">{r.get('cost_thb', 0):.4f} บาท</b></span>
                    </div>

                    <!-- JSON Output Toggle / Code -->
                    <details class="text-xs text-slate-400 bg-black/50 p-2.5 rounded-lg border border-slate-800">
                        <summary class="cursor-pointer font-mono text-cyan-400 hover:text-cyan-300">📄 ดู Raw Output JSON จาก AI</summary>
                        <pre class="mt-2 text-[11px] text-emerald-300 font-mono overflow-x-auto whitespace-pre-wrap">{json_str}</pre>
                    </details>
                </div>

            </div>
        </div>
        """

    full_html = f"""<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chutina AI Vision Benchmark Report ({folder_label})</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        body {{ font-family: 'Prompt', sans-serif; }}
        code, pre, .font-mono {{ font-family: 'JetBrains Mono', monospace; }}
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen py-8 px-4 sm:px-8">
    <div class="max-w-6xl mx-auto space-y-6">
        
        <!-- Top Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            <div class="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="bg-cyan-500 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded tracking-wider uppercase">CHUTINA AI SYSTEM</span>
                        <span class="bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-mono font-bold px-2 py-0.5 rounded">gpt-5.6-luna</span>
                    </div>
                    <h1 class="text-2xl sm:text-3xl font-black text-white">รายงานผลการทดสอบ Token & ความแม่นยำ AI</h1>
                    <p class="text-xs sm:text-sm text-slate-300 mt-1">ทดสอบด้วย Prompt เต็มระบบ 8 หมวดหมู่ • โฟลเดอร์: <b class="text-amber-400 font-mono">{folder_label}</b></p>
                </div>
                <div class="bg-slate-900/90 border border-slate-700 px-4 py-3 rounded-2xl text-right">
                    <div class="text-[10px] text-slate-400 font-mono">จำนวนรูปภาพทดสอบ</div>
                    <div class="text-2xl font-black text-amber-400 font-mono">{len(results_list)} <span class="text-xs font-normal text-slate-300">รูป</span></div>
                </div>
            </div>
        </div>

        <!-- Overall Summary KPI Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
                <div class="text-xs text-slate-400 font-medium">📥 Total Prompt Tokens</div>
                <div class="text-xl font-black text-yellow-400 font-mono mt-1">{total_prompt_tok:,} <span class="text-xs font-normal text-slate-500">tok</span></div>
                <div class="text-[11px] text-slate-500 font-mono mt-0.5">เฉลี่ย {int(total_prompt_tok/max(1,len(results_list))):,} / รูป</div>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
                <div class="text-xs text-slate-400 font-medium">📝 Total Output Tokens</div>
                <div class="text-xl font-black text-blue-400 font-mono mt-1">{total_out_tok:,} <span class="text-xs font-normal text-slate-500">tok</span></div>
                <div class="text-[11px] text-slate-500 font-mono mt-0.5">เฉลี่ย {int(total_out_tok/max(1,len(results_list))):,} / รูป</div>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
                <div class="text-xs text-slate-400 font-medium">🔥 Total Tokens รวมทั้งหมด</div>
                <div class="text-xl font-black text-emerald-400 font-mono mt-1">{total_tok:,} <span class="text-xs font-normal text-slate-500">tok</span></div>
                <div class="text-[11px] text-slate-500 font-mono mt-0.5">เฉลี่ย {avg_tok_per_photo:,} / รูป</div>
            </div>
            <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
                <div class="text-xs text-slate-400 font-medium">💰 ค่าใช้จ่ายรวมทั้งหมด</div>
                <div class="text-xl font-black text-emerald-300 font-mono mt-1">{total_cost:.4f} <span class="text-xs font-normal text-slate-400">บาท</span></div>
                <div class="text-[11px] text-slate-500 font-mono mt-0.5">ความมั่นใจเฉลี่ย {avg_conf}%</div>
            </div>
        </div>

        <!-- Section Title -->
        <div class="flex items-center justify-between pt-2">
            <h2 class="text-lg font-bold text-white flex items-center gap-2">
                <span>📸 รายการรูปภาพและค่าที่ AI อ่านได้ละเอียด ({len(results_list)} รูป)</span>
            </h2>
        </div>

        <!-- Cards Container -->
        <div class="space-y-4">
            {cards_html}
        </div>

        <div class="text-center text-xs text-slate-600 font-mono py-4">
            Generated by Chutina AI Vision Benchmark Engine • Model: gpt-5.6-luna
        </div>
    </div>
</body>
</html>"""

    with open(output_html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"🌐 สร้างรายงาน HTML สำเร็จเรียบร้อย: {output_html_path}")


# ----------------------------------------------------------------------
# 5. MAIN INTERACTIVE RUNNER
# ----------------------------------------------------------------------
def main():
    print("=" * 80)
    print(" 🧪 CHUTINA FULL PROMPT VISION BENCHMARK (pH BEFORE & AFTER)")
    print(" 🤖 โมเดลที่ใช้: OpenAI GPT-5.6 Luna")
    print(" 📝 Prompt ที่ใช้: Prompt เต็มระบบ 8 หมวดหมู่จาก demo/app.py")
    print("=" * 80)

    api_key = API_KEY
    if not api_key:
        api_key = input("👉 กรุณากรอก AIHubMix API Key (sk-...): ").strip()
        if not api_key:
            print("❌ ไม่ได้ระบุ API Key ปิดการทำงาน")
            sys.exit(1)

    folder_options = [
        {
            "id": 1,
            "title": "ขนาดเดิม (1_original)",
            "path": os.path.join(BASE_SIZES_DIR, "1_original"),
            "desc": "ขนาดเดิม 1280x960 (~1,500 Tokens/รูป)"
        },
        {
            "id": 2,
            "title": "ขนาดตรงกลาง (2_sweetspot_576x768)",
            "path": os.path.join(BASE_SIZES_DIR, "2_sweetspot_576x768"),
            "desc": "ขนาดแนะนำ 768x576 (~600 Tokens/รูป 📉)"
        },
        {
            "id": 3,
            "title": "ขนาดเล็ก (3_small_384x512)",
            "path": os.path.join(BASE_SIZES_DIR, "3_small_384x512"),
            "desc": "ขนาดประหยัดสุด 512x384 (~300 Tokens/รูป 📉)"
        }
    ]

    print("\n📁 เลือกโฟลเดอร์รูปภาพที่ต้องการส่งทดสอบ:")
    for opt in folder_options:
        cnt = len(glob.glob(os.path.join(opt["path"], "*.*"))) if os.path.exists(opt["path"]) else 0
        exists = f"✅ พบ {cnt} รูป" if cnt > 0 else "❌ ไม่พบรูป"
        print(f"  [{opt['id']}] {opt['title']:<38} : {opt['desc']} [{exists}]")

    choice = input("\n👉 กรุณาเลือกข้อ [1, 2 หรือ 3] (ค่าเริ่มต้น 2): ").strip() or "2"

    if choice == "1":
        selected_opt = folder_options[0]
    elif choice == "3":
        selected_opt = folder_options[2]
    else:
        selected_opt = folder_options[1]

    target_dir = selected_opt["path"]
    folder_label = selected_opt["title"]

    if not os.path.exists(target_dir):
        print(f"❌ ไม่พบโฟลเดอร์: {target_dir}")
        sys.exit(1)

    photo_files = sorted(glob.glob(os.path.join(target_dir, "*.jpg")) + glob.glob(os.path.join(target_dir, "*.png")) + glob.glob(os.path.join(target_dir, "*.webp")))
    if not photo_files:
        print(f"❌ ไม่พบไฟล์รูปภาพในโฟลเดอร์ {target_dir}")
        sys.exit(1)

    print(f"\n📂 เลือกโฟลเดอร์: \033[1;32m{folder_label}\033[0m")
    print(f"📸 พบรูปภาพทั้งหมด: {len(photo_files)} รูป")

    limit_in = input(f"👉 ต้องการทดสอบกี่รูป? [กด Enter เพื่อรันทั้งหมด {len(photo_files)} รูป]: ").strip()
    limit = int(limit_in) if limit_in.isdigit() else len(photo_files)
    selected_files = photo_files[:limit]

    print("\n" + "-" * 80)
    print(f"🚀 เริ่มต้นส่งรูป ({len(selected_files)} รูป) ไปยัง gpt-5.6-luna พร้อม Prompt เต็มระบบ...")
    print("-" * 80)

    results_list = []

    for idx, fpath in enumerate(selected_files, 1):
        fname = os.path.basename(fpath)
        print(f"[{idx}/{len(selected_files)}] 📤 ภาพ: {fname:<36} (กำลังประมวลผล...)", end="", flush=True)

        res = call_luna_chutina_api(fpath, api_key)
        print(" ✅")

        res["filename"] = fname
        res["filepath"] = fpath
        results_list.append(res)

        if res.get("status") == "success":
            ph = res.get("ph_value", "-")
            cl = res.get("chlorine_value", "-")
            p_tok = res.get("prompt_tokens", 0)
            c_tok = res.get("completion_tokens", 0)
            tot = res.get("total_tokens", 0)
            cost = res.get("cost_thb", 0)
            lat = res.get("latency_ms", 0)
            dim = res.get("dimensions", "-")
            print(f"      • pH: \033[1;31m{ph}\033[0m | Cl: \033[1;33m{cl} ppm\033[0m | Prompt:{p_tok:>4} tok | Out:{c_tok:>3} tok | \033[1;32mTotal:{tot:>4} tok\033[0m ({cost:.4f} ฿) [{dim}] {lat}ms")
        else:
            print(f"      ❌ Error: {res.get('error')}")

    # Save JSON results
    with open(RESULTS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(results_list, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกผลลัพธ์ JSON: {RESULTS_JSON_PATH}")

    # Generate HTML Report
    generate_html_report(results_list, OUTPUT_HTML_PATH, folder_label=folder_label)

    print("\n" + "=" * 80)
    print(f"🎉 ดำเนินการทดสอบเสร็จสมบูรณ์ 100%!")
    print(f"🌐 เปิดดูรายงานสรุป HTML พร้อมรูปภาพและ Token ได้ที่:")
    print(f"👉 file:///{OUTPUT_HTML_PATH.replace(os.sep, '/')}")
    print("=" * 80)


if __name__ == "__main__":
    main()

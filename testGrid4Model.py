# -*- coding: utf-8 -*-
"""
================================================================================
  4-GRID / 2-GRID VISION BENCHMARK & COST ANALYSIS TOOL
  Auto-Grouping:
  - Grid 1 (Utilities 4-Grid): Water Before/After + Electric Before/After
  - Grid 2 (Pool Chemistry):
      * Salt Pool -> 4-Grid (pH/Cl Before/After + Salt Before/After)
      * Chlorine Pool -> 2-Grid (pH/Cl Before/After)
  Models: OpenAI GPT-5.6 Luna | Claude Haiku 4.5 | Claude Sonnet 5
================================================================================
"""

import os
import sys
import base64
import json
import time
import glob
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import requests

API_KEY = os.environ.get("AIHUBMIX_API_KEY", "")
API_BASE_URL = "https://aihubmix.com/v1/chat/completions"

USD_TO_THB = 35.0

BENCHMARK_MODELS = [
    {
        "id": "gpt-5.6-luna",
        "name": "OpenAI GPT-5.6 Luna",
        "provider": "OpenAI",
        "input_price_per_m": 0.20,
        "output_price_per_m": 1.20
    },
    {
        "id": "claude-haiku-4-5",
        "name": "Anthropic Claude Haiku 4.5",
        "provider": "Anthropic",
        "input_price_per_m": 1.10,
        "output_price_per_m": 5.50
    },
    {
        "id": "claude-sonnet-5",
        "name": "Anthropic Claude Sonnet 5",
        "provider": "Anthropic",
        "input_price_per_m": 2.00,
        "output_price_per_m": 10.00
    },
]

DEFAULT_PHOTOS_DIR = r"C:\Users\Lenovo\Downloads\Compressed\complete_photos_17_25_aug"
GRID_CACHE_DIR = r"D:\EasyFile\grid_composites"
OUTPUT_JSON = r"D:\EasyFile\grid4_benchmark_results.json"
OUTPUT_HTML = r"D:\EasyFile\grid4_benchmark_report.html"


# ----------------------------------------------------------------------
# IMAGE COMPOSITE GENERATORS (4-GRID & 2-GRID)
# ----------------------------------------------------------------------
def create_2x2_grid(items, main_title):
    tile_w, tile_h = 650, 650
    header_h = 60
    slot_label_h = 35
    padding = 16
    
    total_w = (tile_w * 2) + (padding * 3)
    total_h = header_h + (slot_label_h * 2) + (tile_h * 2) + (padding * 3)
    
    canvas = Image.new('RGB', (total_w, total_h), color=(248, 250, 252))
    draw = ImageDraw.Draw(canvas)
    
    try:
        font_title = ImageFont.truetype('tahoma.ttf', 24)
        font_label = ImageFont.truetype('tahoma.ttf', 17)
    except:
        font_title = ImageFont.load_default()
        font_label = ImageFont.load_default()
        
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(15, 23, 42))
    draw.text((padding, 16), main_title, fill=(255, 255, 255), font=font_title)
    
    positions = [(0, 0), (1, 0), (0, 1), (1, 1)]
    for idx, (img_path, label, color) in enumerate(items):
        col, row = positions[idx]
        x = padding + col * (tile_w + padding)
        y_label = header_h + padding + row * (slot_label_h + tile_h + padding)
        y_img = y_label + slot_label_h
        
        draw.text((x + 6, y_label + 6), label, fill=color, font=font_label)
        if os.path.exists(img_path):
            img = Image.open(img_path).convert('RGB')
            img = img.resize((tile_w, tile_h), Image.Resampling.LANCZOS)
            canvas.paste(img, (x, y_img))
            draw.rectangle([(x-1, y_img-1), (x+tile_w, y_img+tile_h)], outline=(203, 213, 225), width=2)
            
    return canvas


def create_1x2_grid(items, main_title):
    tile_w, tile_h = 650, 650
    header_h = 60
    slot_label_h = 35
    padding = 16
    
    total_w = (tile_w * 2) + (padding * 3)
    total_h = header_h + slot_label_h + tile_h + (padding * 2)
    
    canvas = Image.new('RGB', (total_w, total_h), color=(248, 250, 252))
    draw = ImageDraw.Draw(canvas)
    
    try:
        font_title = ImageFont.truetype('tahoma.ttf', 24)
        font_label = ImageFont.truetype('tahoma.ttf', 17)
    except:
        font_title = ImageFont.load_default()
        font_label = ImageFont.load_default()
        
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(15, 23, 42))
    draw.text((padding, 16), main_title, fill=(255, 255, 255), font=font_title)
    
    for idx, (img_path, label, color) in enumerate(items):
        x = padding + idx * (tile_w + padding)
        y_label = header_h + padding
        y_img = y_label + slot_label_h
        
        draw.text((x + 6, y_label + 6), label, fill=color, font=font_label)
        if os.path.exists(img_path):
            img = Image.open(img_path).convert('RGB')
            img = img.resize((tile_w, tile_h), Image.Resampling.LANCZOS)
            canvas.paste(img, (x, y_img))
            draw.rectangle([(x-1, y_img-1), (x+tile_w, y_img+tile_h)], outline=(203, 213, 225), width=2)
            
    return canvas


def encode_image_to_base64(image_path, max_size=(1400, 1400), quality=88):
    try:
        with Image.open(image_path) as img:
            img = img.convert("RGB")
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            buffered = BytesIO()
            img.save(buffered, format="JPEG", quality=quality)
            return base64.b64encode(buffered.getvalue()).decode("utf-8")
    except Exception as e:
        print(f"Error encoding image {image_path}: {e}")
        return None


# ----------------------------------------------------------------------
# PROMPTS
# ----------------------------------------------------------------------
def get_prompt_utilities_4grid():
    return (
        "รูปภาพนี้คือภาพ Grid รวมมิเตอร์สาธารณูปโภค 4 ช่อง (2x2):\n"
        "1. [บนซ้าย] มิเตอร์น้ำ (ก่อนปฏิบัติงาน)\n"
        "2. [บนขวา] มิเตอร์น้ำ (หลังปฏิบัติงาน)\n"
        "3. [ล่างซ้าย] มิเตอร์ไฟฟ้า (ก่อนปฏิบัติงาน)\n"
        "4. [ล่างขวา] มิเตอร์ไฟฟ้า (หลังปฏิบัติงาน)\n\n"
        "กรุณาอ่านตัวเลขมิเตอร์น้ำ (รวมทศนิยม m3) และมิเตอร์ไฟฟ้า (kWh) ของทั้งก่อนและหลังอย่างละเอียด\n"
        "ตอบเป็น JSON รูปแบบ:\n"
        "{\n"
        '  "water": {"before": "1805.607", "after": "1806.020", "unit": "m3"},\n'
        '  "electric": {"before": "94364", "after": "94362", "unit": "kWh"},\n'
        '  "confidence": "high/medium/low"\n'
        "}"
    )


def get_prompt_pool_chemistry_4grid():
    return (
        "รูปภาพนี้คือภาพ Grid รวมการตรวจวัดค่าน้ำสระว่ายน้ำระบบเกลือ 4 ช่อง (2x2):\n"
        "1. [บนซ้าย] ค่าน้ำ pH/คลอรีน (ก่อนปฏิบัติงาน)\n"
        "2. [บนขวา] ค่าน้ำ pH/คลอรีน (หลังปฏิบัติงาน)\n"
        "3. [ล่างซ้าย] ค่าเกลือ Salt (ก่อนปฏิบัติงาน)\n"
        "4. [ล่างขวา] ค่าเกลือ Salt (หลังปฏิบัติงาน)\n\n"
        "กฎการอ่านชุดวัดค่าน้ำ:\n"
        "- หลอดฝาสีแดง = ค่า pH (สเกลบนแถบ: 6.8, 7.2, 7.6, 7.8, 8.2)\n"
        "- หลอดฝาสีเหลือง = ค่า Chlorine/Cl (สเกลบนแถบ: 0.2, 0.6, 1.0, 1.5, 3.0 ppm - ต่ำสุดคือ 0.2 ห้ามตอบ 0 หรือ 0.0 เด็ดขาด)\n"
        "- จอดิจิทัลวัดเกลือ = ตัวเลขค่า Salt (ppm)\n\n"
        "ตอบเป็น JSON รูปแบบ:\n"
        "{\n"
        '  "water_chemistry": {\n'
        '    "before": {"ph": "8.2", "cl": "0.2"},\n'
        '    "after": {"ph": "7.6", "cl": "1.0"}\n'
        "  },\n"
        '  "salt": {"before": "3570", "after": "3570", "unit": "ppm"},\n'
        '  "confidence": "high/medium/low"\n'
        "}"
    )


def get_prompt_pool_chemistry_2grid():
    return (
        "รูปภาพนี้คือภาพ Grid ตรวจวัดค่าน้ำสระว่ายน้ำระบบคลอรีน 2 ช่อง (1x2):\n"
        "1. [ฝั่งซ้าย] ค่าน้ำ pH/คลอรีน (ก่อนปฏิบัติงาน)\n"
        "2. [ฝั่งขวา] ค่าน้ำ pH/คลอรีน (หลังปฏิบัติงาน)\n\n"
        "กฎการอ่านชุดวัดค่าน้ำ:\n"
        "- หลอดฝาสีแดง = ค่า pH (สเกลบนแถบ: 6.8, 7.2, 7.6, 7.8, 8.2)\n"
        "- หลอดฝาสีเหลือง = ค่า Chlorine/Cl (สเกลบนแถบ: 0.2, 0.6, 1.0, 1.5, 3.0 ppm - ต่ำสุดคือ 0.2 ห้ามตอบ 0 หรือ 0.0 เด็ดขาด)\n\n"
        "ตอบเป็น JSON รูปแบบ:\n"
        "{\n"
        '  "water_chemistry": {\n'
        '    "before": {"ph": "7.2", "cl": "0.2"},\n'
        '    "after": {"ph": "7.6", "cl": "1.0"}\n'
        "  },\n"
        '  "confidence": "high/medium/low"\n'
        "}"
    )


# ----------------------------------------------------------------------
# API CALL & PARSING
# ----------------------------------------------------------------------
def call_vision_model(model_info, image_path, prompt, api_key):
    model_id = model_info["id"]
    model_name = model_info["name"]
    start_time = time.time()
    
    b64_img = encode_image_to_base64(image_path)
    if not b64_img:
        return {"model_id": model_id, "model_name": model_name, "reading": "Error loading img", "latency_ms": 0, "total_tokens": 0, "cost_thb": 0}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model_id,
        "messages": [
            {"role": "system", "content": "You are an expert AI visual inspector for utility meters and pool water chemistry. Read multi-slot grid images accurately. Return concise valid JSON directly."},
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}}
            ]}
        ],
        "temperature": 0.1,
        "max_tokens": 500
    }
    
    try:
        resp = requests.post(API_BASE_URL, headers=headers, json=payload, timeout=30)
        elapsed_ms = int((time.time() - start_time) * 1000)
        
        if resp.status_code == 200:
            res_data = resp.json()
            content = res_data["choices"][0]["message"]["content"] or ""
            usage = res_data.get("usage", {})
            prompt_tokens = usage.get("prompt_tokens", 0)
            completion_tokens = usage.get("completion_tokens", 0)
            total_tokens = usage.get("total_tokens", prompt_tokens + completion_tokens)
            
            cost_usd = (prompt_tokens * model_info["input_price_per_m"] + completion_tokens * model_info["output_price_per_m"]) / 1_000_000.0
            cost_thb = cost_usd * USD_TO_THB
            
            clean = re.sub(r"^```[a-zA-Z]*\s*", "", content.strip())
            clean = re.sub(r"```$", "", clean).strip()
            
            parsed_summary = clean
            try:
                # Extract first JSON object if surrounded by text
                m_json = re.search(r"\{.*\}", clean, re.DOTALL)
                if m_json:
                    clean = m_json.group(0)
                pj = json.loads(clean)
                
                parts = []
                if "water" in pj:
                    wb = pj["water"].get("before", "-")
                    wa = pj["water"].get("after", "-")
                    parts.append(f"💧น้ำ: [{wb} -> {wa}]")
                if "electric" in pj:
                    eb = pj["electric"].get("before", "-")
                    ea = pj["electric"].get("after", "-")
                    parts.append(f"⚡ไฟ: [{eb} -> {ea}]")
                if "water_chemistry" in pj:
                    cb = pj["water_chemistry"].get("before", {})
                    ca = pj["water_chemistry"].get("after", {})
                    b_ph = cb.get("ph", "-")
                    b_cl = cb.get("cl", cb.get("chlorine", "-"))
                    a_ph = ca.get("ph", "-")
                    a_cl = ca.get("cl", ca.get("chlorine", "-"))
                    parts.append(f"🧪ค่าน้ำ: ก่อน(pH:{b_ph}, Cl:{b_cl}) | หลัง(pH:{a_ph}, Cl:{a_cl})")
                if "salt" in pj:
                    sb = pj["salt"].get("before", "-")
                    sa = pj["salt"].get("after", "-")
                    parts.append(f"🧂เกลือ: [{sb} -> {sa} ppm]")
                    
                if parts:
                    parsed_summary = "  |  ".join(parts)
            except:
                pass
                
            return {
                "model_id": model_id,
                "model_name": model_name,
                "reading": parsed_summary,
                "raw": content,
                "latency_ms": elapsed_ms,
                "prompt_tokens": prompt_tokens,
                "completion_tokens": completion_tokens,
                "total_tokens": total_tokens,
                "cost_usd": cost_usd,
                "cost_thb": cost_thb,
                "status": "success"
            }
        else:
            return {
                "model_id": model_id,
                "model_name": model_name,
                "reading": f"API Error {resp.status_code}",
                "latency_ms": int((time.time()-start_time)*1000),
                "total_tokens": 0,
                "cost_thb": 0,
                "status": "error"
            }
    except Exception as e:
        return {
            "model_id": model_id,
            "model_name": model_name,
            "reading": f"Exception: {str(e)[:40]}",
            "latency_ms": 0,
            "total_tokens": 0,
            "cost_thb": 0,
            "status": "error"
        }


# ----------------------------------------------------------------------
# HTML REPORT GENERATOR
# ----------------------------------------------------------------------
def generate_grid4_html_report(all_results, out_html_path):
    html_cards = ""
    model_stats = {m["id"]: {"name": m["name"], "total_tokens": 0, "total_cost_thb": 0.0, "total_ms": 0, "count": 0} for m in BENCHMARK_MODELS}
    
    for house_item in all_results:
        house_name = house_item["house"]
        date_str = house_item["date"]
        pool_type = house_item.get("pool_type", "สระคลอรีน")
        
        house_cards = ""
        for g_item in house_item["grid_jobs"]:
            g_title = g_item["title"]
            g_path = g_item["image_path"]
            b64_thumb = encode_image_to_base64(g_path, max_size=(800, 800), quality=80)
            
            rows = ""
            for m in g_item["results"]:
                mid = m["model_id"]
                if mid in model_stats and m.get("status") == "success":
                    model_stats[mid]["total_tokens"] += m.get("total_tokens", 0)
                    model_stats[mid]["total_cost_thb"] += m.get("cost_thb", 0.0)
                    model_stats[mid]["total_ms"] += m.get("latency_ms", 0)
                    model_stats[mid]["count"] += 1
                    
                badge_color = "bg-blue-100 text-blue-800" if "Luna" in m["model_name"] else ("bg-purple-100 text-purple-800" if "Sonnet" in m["model_name"] else "bg-amber-100 text-amber-800")
                cost_str = f"{m.get('cost_thb', 0):.4f} ฿" if m.get('cost_thb') else "-"
                token_str = f"{m.get('total_tokens', 0):,} tok" if m.get('total_tokens') else "-"
                
                rows += f"""
                <tr class="border-b hover:bg-gray-50">
                    <td class="py-3 px-3"><span class="font-medium {badge_color} px-2.5 py-1 rounded text-xs whitespace-nowrap">{m['model_name']}</span></td>
                    <td class="py-3 px-3 font-mono font-bold text-gray-900 text-sm">{m['reading']}</td>
                    <td class="py-3 px-3 text-xs text-center text-gray-600 font-mono">{token_str}</td>
                    <td class="py-3 px-3 text-xs text-center font-bold text-emerald-700 font-mono">{cost_str}</td>
                    <td class="py-3 px-3 text-xs text-center text-gray-500">{m['latency_ms']} ms</td>
                </tr>
                """
                
            house_cards += f"""
            <div class="border rounded-xl p-4 mb-6 bg-slate-50">
                <h4 class="font-bold text-slate-800 text-base mb-3 flex items-center gap-2">
                    <span>📌 {g_title}</span>
                </h4>
                <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                    <div class="lg:col-span-5 bg-white rounded-lg p-2 flex justify-center border shadow-sm">
                        <img src="data:image/jpeg;base64,{b64_thumb}" class="rounded max-h-96 object-contain" />
                    </div>
                    <div class="lg:col-span-7 overflow-x-auto">
                        <table class="w-full text-left text-sm border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                            <thead>
                                <tr class="bg-gray-100 text-gray-700 text-xs uppercase">
                                    <th class="py-2 px-3">โมเดล</th>
                                    <th class="py-2 px-3">สรุปค่าที่อ่านได้</th>
                                    <th class="py-2 px-3 text-center">Tokens</th>
                                    <th class="py-2 px-3 text-center">Cost</th>
                                    <th class="py-2 px-3 text-center">Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            """
            
        html_cards += f"""
        <div class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden mb-10">
            <div class="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-lg">🏡 {house_name}</h3>
                    <p class="text-xs text-slate-400">วันที่: {date_str} • ประเภท: <span class="text-cyan-300 font-medium">{pool_type}</span></p>
                </div>
                <span class="text-xs bg-slate-800 text-slate-300 px-3 py-1.5 rounded-full border border-slate-700">2 Composite Images</span>
            </div>
            <div class="p-6">
                {house_cards}
            </div>
        </div>
        """

    summary_rows = ""
    for mid, s in model_stats.items():
        cnt = max(1, s["count"])
        avg_ms = int(s["total_ms"] / cnt)
        summary_rows += f"""
        <tr class="border-b">
            <td class="py-3 px-4 font-semibold text-gray-800">{s['name']}</td>
            <td class="py-3 px-4 text-center font-mono">{s['total_tokens']:,} tokens</td>
            <td class="py-3 px-4 text-center font-mono font-bold text-emerald-700">{s['total_cost_thb']:.4f} บาท</td>
            <td class="py-3 px-4 text-center text-gray-600">{avg_ms} ms</td>
        </tr>
        """

    full_html = f"""<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>4-Grid & 2-Grid Vision Benchmark Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>body {{ font-family: 'Sarabun', sans-serif; }}</style>
</head>
<body class="bg-slate-100 min-h-screen py-10 px-4 sm:px-8">
    <div class="max-w-7xl mx-auto">
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-8 mb-8 shadow-xl">
            <h1 class="text-2xl sm:text-3xl font-bold mb-2">⚡ 4-Grid & 2-Grid Vision AI Benchmark</h1>
            <p class="text-blue-200 text-sm">รวมรูปภาพบ้าน 1 หลังเหลือเพียง 2 ภาพ (มิเตอร์น้ำ/ไฟ 4-Grid + ค่าน้ำ pH/เกลือ 4-Grid/2-Grid) เพื่อประหยัด Token และยิง API เพียง 2 ครั้ง/บ้าน</p>
        </div>
        
        <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 class="text-lg font-bold text-gray-800 mb-4">💰 สรุปต้นทุนรวมและความเร็วของแต่ละโมเดล (Total Benchmark Summary)</h2>
            <table class="w-full text-left text-sm border-collapse">
                <thead>
                    <tr class="bg-gray-100 text-gray-700 text-xs uppercase">
                        <th class="py-2 px-4">โมเดล</th>
                        <th class="py-2 px-4 text-center">Total Tokens ที่ใช้</th>
                        <th class="py-2 px-4 text-center">ค่าใช้จ่ายรวม (บาท)</th>
                        <th class="py-2 px-4 text-center">ความเร็วเฉลี่ย</th>
                    </tr>
                </thead>
                <tbody>
                    {summary_rows}
                </tbody>
            </table>
        </div>
        
        {html_cards}
    </div>
</body>
</html>"""
    with open(out_html_path, "w", encoding="utf-8") as f:
        f.write(full_html)
    print(f"🌐 สร้างรายงาน HTML สำเร็จ: {out_html_path}")


# ----------------------------------------------------------------------
# MAIN RUNNER
# ----------------------------------------------------------------------
def main():
    print("=" * 80)
    print(" 🚀 4-GRID & 2-GRID VISION BENCHMARK (2 IMAGES PER HOUSE)")
    print(" 1. Grid 1: มิเตอร์น้ำ (ก่อน/หลัง) + มิเตอร์ไฟฟ้า (ก่อน/หลัง) [4-Grid]")
    print(" 2. Grid 2: ค่าน้ำ pH/Cl (ก่อน/หลัง) + เกลือ (ก่อน/หลัง) [4-Grid หรือ 2-Grid]")
    print("=" * 80)
    
    api_key = API_KEY
    if not api_key:
        api_key = input("👉 กรุณากรอก AIHubMix API Key (sk-...): ").strip()
        if not api_key:
            print("❌ ไม่ได้ระบุ API Key ปิดการทำงาน")
            sys.exit(1)
            
    photos_dir = DEFAULT_PHOTOS_DIR
    if not os.path.exists(photos_dir):
        print(f"❌ ไม่พบโฟลเดอร์ {photos_dir}")
        sys.exit(1)
        
    os.makedirs(GRID_CACHE_DIR, exist_ok=True)
    
    # Discover houses
    house_dirs = []
    for d in sorted(os.listdir(photos_dir)):
        dp = os.path.join(photos_dir, d)
        if os.path.isdir(dp):
            for h in sorted(os.listdir(dp)):
                hp = os.path.join(dp, h)
                if os.path.isdir(hp):
                    house_dirs.append({"date": d, "house": h, "path": hp})
                    
    print(f"\n🏡 พบข้อมูลบ้านทั้งหมด: {len(house_dirs)} แปลง")
    limit_input = input(f"👉 ต้องการทดสอบกี่แปลง? [กด Enter เพื่อทดสอบ 1 แปลงตัวอย่าง]: ").strip()
    limit = int(limit_input) if limit_input.isdigit() else 1
    selected_houses = house_dirs[:limit]
    
    all_results = []
    
    for h_idx, h_info in enumerate(selected_houses, 1):
        house_name = h_info["house"]
        date_str = h_info["date"]
        h_path = h_info["path"]
        
        print(f"\n[{h_idx}/{len(selected_houses)}] 🏡 กำลังประกอบภาพ Grid สำหรับบ้าน: {house_name} ({date_str})...")
        
        # Check files
        w_before = glob.glob(os.path.join(h_path, "*มิเตอร์น้ำ_ก่อน*.*"))
        w_after = glob.glob(os.path.join(h_path, "*มิเตอร์น้ำ_หลัง*.*"))
        e_before = glob.glob(os.path.join(h_path, "*มิเตอร์ไฟ_ก่อน*.*"))
        e_after = glob.glob(os.path.join(h_path, "*มิเตอร์ไฟ_หลัง*.*"))
        
        ph_before = glob.glob(os.path.join(h_path, "*วัดค่าน้ำpHคลอรีน_ก่อน*.*"))
        ph_after = glob.glob(os.path.join(h_path, "*วัดค่าน้ำpHคลอรีน_หลัง*.*"))
        salt_before = glob.glob(os.path.join(h_path, "*วัดเกลือ_ก่อน*.*"))
        salt_after = glob.glob(os.path.join(h_path, "*วัดเกลือ_หลัง*.*"))
        
        has_salt = bool(salt_before and salt_after)
        pool_type = "สระว่ายน้ำระบบเกลือ (4-Grid)" if has_salt else "สระว่ายน้ำระบบคลอรีน (2-Grid)"
        
        grid_jobs = []
        
        # 1. Utility 4-Grid
        if w_before and w_after and e_before and e_after:
            util_items = [
                (w_before[0], "[1] บนซ้าย: มิเตอร์น้ำ (ก่อน)", (220, 38, 38)),
                (w_after[0], "[2] บนขวา: มิเตอร์น้ำ (หลัง)", (22, 163, 74)),
                (e_before[0], "[3] ล่างซ้าย: มิเตอร์ไฟ (ก่อน)", (220, 38, 38)),
                (e_after[0], "[4] ล่างขวา: มิเตอร์ไฟ (หลัง)", (22, 163, 74)),
            ]
            grid_util_img = create_2x2_grid(util_items, f"มิเตอร์น้ำและไฟฟ้า (Water & Electric 4-Grid) - {house_name}")
            util_out = os.path.join(GRID_CACHE_DIR, f"{date_str}_{house_name}_utilities_4grid.jpg")
            grid_util_img.save(util_out, quality=90)
            grid_jobs.append({
                "title": "มิเตอร์น้ำ & มิเตอร์ไฟฟ้า (4-Grid)",
                "image_path": util_out,
                "prompt": get_prompt_utilities_4grid()
            })
            
        # 2. Pool Chemistry Grid (4-Grid if Salt, 2-Grid if Chlorine)
        if has_salt and ph_before and ph_after:
            pool_items = [
                (ph_before[0], "[1] บนซ้าย: ค่าน้ำ pH/คลอรีน (ก่อน)", (220, 38, 38)),
                (ph_after[0], "[2] บนขวา: ค่าน้ำ pH/คลอรีน (หลัง)", (22, 163, 74)),
                (salt_before[0], "[3] ล่างซ้าย: ค่าวัดเกลือ Salt (ก่อน)", (220, 38, 38)),
                (salt_after[0], "[4] ล่างขวา: ค่าวัดเกลือ Salt (หลัง)", (22, 163, 74)),
            ]
            grid_pool_img = create_2x2_grid(pool_items, f"ค่าน้ำ pH/คลอรีน & เกลือ (Pool Chemistry 4-Grid) - {house_name}")
            pool_out = os.path.join(GRID_CACHE_DIR, f"{date_str}_{house_name}_pool_salt_4grid.jpg")
            grid_pool_img.save(pool_out, quality=90)
            grid_jobs.append({
                "title": "ค่าน้ำ pH/คลอรีน & เกลือ (4-Grid)",
                "image_path": pool_out,
                "prompt": get_prompt_pool_chemistry_4grid()
            })
        elif ph_before and ph_after:
            pool_items = [
                (ph_before[0], "[1] ฝั่งซ้าย: ค่าน้ำ pH/คลอรีน (ก่อน)", (220, 38, 38)),
                (ph_after[0], "[2] ฝั่งขวา: ค่าน้ำ pH/คลอรีน (หลัง)", (22, 163, 74)),
            ]
            grid_pool_img = create_1x2_grid(pool_items, f"ค่าน้ำ pH/คลอรีน (Pool Chemistry 2-Grid) - {house_name}")
            pool_out = os.path.join(GRID_CACHE_DIR, f"{date_str}_{house_name}_pool_cl_2grid.jpg")
            grid_pool_img.save(pool_out, quality=90)
            grid_jobs.append({
                "title": "ค่าน้ำ pH/คลอรีน (2-Grid)",
                "image_path": pool_out,
                "prompt": get_prompt_pool_chemistry_2grid()
            })
            
        # Run vision AI on both grid images
        for g_job in grid_jobs:
            print(f"   📸 กำลังส่งภาพ: {g_job['title']} ให้ 3 โมเดลวิเคราะห์...", end="", flush=True)
            res_models = []
            with ThreadPoolExecutor(max_workers=len(BENCHMARK_MODELS)) as executor:
                futures = {
                    executor.submit(call_vision_model, m, g_job["image_path"], g_job["prompt"], api_key): m
                    for m in BENCHMARK_MODELS
                }
                for fut in as_completed(futures):
                    res_models.append(fut.result())
                    
            order = {m["id"]: i for i, m in enumerate(BENCHMARK_MODELS)}
            res_models.sort(key=lambda x: order.get(x["model_id"], 99))
            print(" ✅ เสร็จสิ้น")
            
            for m in res_models:
                tok = m.get("total_tokens", 0)
                cost = m.get("cost_thb", 0)
                print(f"      • {m['model_name']:<28} -> {m['reading'][:50]} | {tok:>5} tok | {cost:.4f} THB ({m['latency_ms']} ms)")
                
            g_job["results"] = res_models
            
        all_results.append({
            "date": date_str,
            "house": house_name,
            "pool_type": pool_type,
            "grid_jobs": grid_jobs
        })
        
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกผลลัพธ์ JSON: {OUTPUT_JSON}")
    
    generate_grid4_html_report(all_results, OUTPUT_HTML)
    print("\n" + "=" * 80)
    print("🎉 ดำเนินการเสร็จสมบูรณ์ 100%!")
    print(f"🌐 รายงาน HTML: {OUTPUT_HTML}")
    print("=" * 80)


if __name__ == "__main__":
    main()

# -*- coding: utf-8 -*-
"""
================================================================================
  6-GRID VISION BENCHMARK & COST ANALYSIS TOOL (1 IMAGE PER HOUSE)
  3x2 Layout:
  - Top Row: [1] Water Before | [2] Electric Before | [3] pH/Cl Before
  - Bottom Row: [4] Water After  | [5] Electric After  | [6] pH/Cl After
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
GRID6_CACHE_DIR = r"D:\EasyFile\grid6_composites"
OUTPUT_JSON = r"D:\EasyFile\grid6_benchmark_results.json"
OUTPUT_HTML = r"D:\EasyFile\grid6_benchmark_report.html"


def create_3x2_grid(items, main_title):
    tile_w, tile_h = 600, 600
    header_h = 60
    slot_label_h = 35
    padding = 16
    
    total_w = (tile_w * 3) + (padding * 4)
    total_h = header_h + (slot_label_h * 2) + (tile_h * 2) + (padding * 3)
    
    canvas = Image.new('RGB', (total_w, total_h), color=(248, 250, 252))
    draw = ImageDraw.Draw(canvas)
    
    try:
        font_title = ImageFont.truetype('tahoma.ttf', 24)
        font_label = ImageFont.truetype('tahoma.ttf', 16)
    except:
        font_title = ImageFont.load_default()
        font_label = ImageFont.load_default()
        
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(15, 23, 42))
    draw.text((padding, 16), main_title, fill=(255, 255, 255), font=font_title)
    
    positions = [
        (0, 0), (1, 0), (2, 0),
        (0, 1), (1, 1), (2, 1)
    ]
    
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


def encode_image_to_base64(image_path, max_size=(1600, 1600), quality=88):
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


def get_prompt_6grid():
    return (
        "รูปภาพนี้คือภาพ Grid รวม 6 ช่อง (3 แถวแนวตั้ง x 2 แถวแนวนอน) สำหรับสรุปผลการปฏิบัติงานบ้าน:\n\n"
        "--- แถวบน: ก่อนปฏิบัติงาน (Before) ---\n"
        "1. [บนซ้าย]: มิเตอร์น้ำ (ก่อน) -> อ่านตัวเลขทศนิยมลูกบาศก์เมตร (m3)\n"
        "2. [บนกลาง]: มิเตอร์ไฟฟ้า (ก่อน) -> อ่านตัวเลขหน่วยไฟฟ้า (kWh)\n"
        "3. [บนขวา]: ค่าน้ำสระว่ายน้ำ (ก่อน) -> ฝาแดง=pH (6.8-8.2), ฝาเหลือง=Chlorine/Cl (สเกล 0.2, 0.6, 1.0, 1.5, 3.0 ppm ห้ามตอบ 0.0 เด็ดขาด ต่ำสุดคือ 0.2)\n\n"
        "--- แถวล่าง: หลังปฏิบัติงาน (After) ---\n"
        "4. [ล่างซ้าย]: มิเตอร์น้ำ (หลัง) -> อ่านตัวเลขทศนิยมลูกบาศก์เมตร (m3)\n"
        "5. [ล่างกลาง]: มิเตอร์ไฟฟ้า (หลัง) -> อ่านตัวเลขหน่วยไฟฟ้า (kWh)\n"
        "6. [ล่างขวา]: ค่าน้ำสระว่ายน้ำ (หลัง) -> ฝาแดง=pH (6.8-8.2), ฝาเหลือง=Chlorine/Cl (สเกล 0.2-3.0 ppm ต่ำสุดคือ 0.2)\n\n"
        "กรุณาตอบเป็น JSON รูปแบบ:\n"
        "{\n"
        '  "water": {"before": "1805.607", "after": "1806.020", "unit": "m3"},\n'
        '  "electric": {"before": "94364", "after": "94362", "unit": "kWh"},\n'
        '  "water_chemistry": {\n'
        '    "before": {"ph": "8.2", "chlorine": "0.2"},\n'
        '    "after": {"ph": "7.6", "chlorine": "1.0"}\n'
        "  },\n"
        '  "confidence": "high/medium/low"\n'
        "}"
    )


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
            {"role": "system", "content": "You are an expert AI visual inspector for utility meters and pool water chemistry. Read all 6 slots in the 3x2 grid accurately. Return concise valid JSON directly without long explanation."},
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}}
            ]}
        ],
        "temperature": 0.1,
        "max_tokens": 2500
    }
    
    try:
        resp = requests.post(API_BASE_URL, headers=headers, json=payload, timeout=35)
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
                    b_ph = cb.get("ph", cb.get("pH", "-"))
                    b_cl = cb.get("cl", cb.get("chlorine", cb.get("Chlorine", "-")))
                    a_ph = ca.get("ph", ca.get("pH", "-"))
                    a_cl = ca.get("cl", ca.get("chlorine", ca.get("Chlorine", "-")))
                    parts.append(f"🧪ค่าน้ำ: ก่อน(pH:{b_ph}, Cl:{b_cl}) | หลัง(pH:{a_ph}, Cl:{a_cl})")
                    
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


def generate_grid6_html_report(all_results, out_html_path):
    html_cards = ""
    model_stats = {m["id"]: {"name": m["name"], "total_tokens": 0, "total_cost_thb": 0.0, "total_ms": 0, "count": 0} for m in BENCHMARK_MODELS}
    
    for house_item in all_results:
        house_name = house_item["house"]
        date_str = house_item["date"]
        g_path = house_item["image_path"]
        b64_thumb = encode_image_to_base64(g_path, max_size=(1000, 1000), quality=80)
        
        rows = ""
        for m in house_item["results"]:
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
            
        html_cards += f"""
        <div class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden mb-10">
            <div class="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-lg">🏡 {house_name}</h3>
                    <p class="text-xs text-slate-400">วันที่: {date_str} • รวม 6 รูปใน 1 ภาพ Grid</p>
                </div>
                <span class="text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-full font-bold">1 Request per House!</span>
            </div>
            <div class="p-6">
                <div class="mb-6 bg-slate-100 rounded-xl p-3 flex justify-center border shadow-inner">
                    <img src="data:image/jpeg;base64,{b64_thumb}" class="rounded-lg max-h-[500px] object-contain shadow-md" />
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead>
                            <tr class="bg-gray-100 text-gray-700 text-xs uppercase">
                                <th class="py-2 px-3">โมเดล</th>
                                <th class="py-2 px-3">สรุปค่าที่อ่านได้ทั้งหมด 6 ช่อง</th>
                                <th class="py-2 px-3 text-center">Tokens</th>
                                <th class="py-2 px-3 text-center">Cost ต่อบ้าน</th>
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
    <title>6-Grid Vision Benchmark Report (1 Request per House)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>body {{ font-family: 'Sarabun', sans-serif; }}</style>
</head>
<body class="bg-slate-100 min-h-screen py-10 px-4 sm:px-8">
    <div class="max-w-7xl mx-auto">
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-8 mb-8 shadow-xl">
            <h1 class="text-2xl sm:text-3xl font-bold mb-2">⚡ 6-Grid Vision AI Benchmark (1 ภาพ จบทั้งหลัง)</h1>
            <p class="text-blue-200 text-sm">รวมรูปภาพหลัก 6 ใบ (มิเตอร์น้ำ ก่อน/หลัง, มิเตอร์ไฟ ก่อน/หลัง, ค่าน้ำสระ ก่อน/หลัง) เข้าด้วยกันเป็นภาพ 3x2 Grid เดียว ยิง API เพียง 1 ครั้งต่อ 1 หลัง!</p>
        </div>
        
        <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 class="text-lg font-bold text-gray-800 mb-4">💰 สรุปต้นทุนรวมและความเร็วของแต่ละโมเดล (Total Cost & Usage)</h2>
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


def main():
    print("=" * 80)
    print(" 🚀 6-GRID ALL-IN-ONE VISION BENCHMARK (1 IMAGE PER HOUSE)")
    print(" 1. OpenAI GPT-5.6 Luna ($0.20/M)")
    print(" 2. Anthropic Claude Haiku 4.5 ($1.10/M)")
    print(" 3. Anthropic Claude Sonnet 5 ($2.00/M)")
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
        
    os.makedirs(GRID6_CACHE_DIR, exist_ok=True)
    
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
        
        print(f"\n[{h_idx}/{len(selected_houses)}] 🏡 กำลังสร้างภาพ 6-Grid สำหรับ: {house_name} ({date_str})...")
        
        w_before = glob.glob(os.path.join(h_path, "*มิเตอร์น้ำ_ก่อน*.*"))
        w_after = glob.glob(os.path.join(h_path, "*มิเตอร์น้ำ_หลัง*.*"))
        e_before = glob.glob(os.path.join(h_path, "*มิเตอร์ไฟ_ก่อน*.*"))
        e_after = glob.glob(os.path.join(h_path, "*มิเตอร์ไฟ_หลัง*.*"))
        ph_before = glob.glob(os.path.join(h_path, "*วัดค่าน้ำpHคลอรีน_ก่อน*.*"))
        ph_after = glob.glob(os.path.join(h_path, "*วัดค่าน้ำpHคลอรีน_หลัง*.*"))
        
        if not (w_before and w_after and e_before and e_after and ph_before and ph_after):
            print(f"⚠️ รูปภาพหลัก 6 ใบไม่ครบสำหรับบ้านนี้ ข้ามไป")
            continue
            
        items_6grid = [
            (w_before[0], "[1] บนซ้าย: มิเตอร์น้ำ (ก่อน)", (220, 38, 38)),
            (e_before[0], "[2] บนกลาง: มิเตอร์ไฟ (ก่อน)", (220, 38, 38)),
            (ph_before[0], "[3] บนขวา: ค่าน้ำ pH/คลอรีน (ก่อน)", (220, 38, 38)),
            (w_after[0], "[4] ล่างซ้าย: มิเตอร์น้ำ (หลัง)", (22, 163, 74)),
            (e_after[0], "[5] ล่างกลาง: มิเตอร์ไฟ (หลัง)", (22, 163, 74)),
            (ph_after[0], "[6] ล่างขวา: ค่าน้ำ pH/คลอรีน (หลัง)", (22, 163, 74)),
        ]
        
        grid6_img = create_3x2_grid(items_6grid, f"สรุปตรวจวัด 6-Grid (น้ำ, ไฟ, pH/Cl ก่อน vs หลัง) - {house_name}")
        out_img_path = os.path.join(GRID6_CACHE_DIR, f"{date_str}_{house_name}_grid6.jpg")
        grid6_img.save(out_img_path, quality=90)
        
        prompt = get_prompt_6grid()
        print(f"   📸 กำลังส่งภาพ 6-Grid ให้ 3 โมเดลวิเคราะห์...", end="", flush=True)
        
        res_models = []
        with ThreadPoolExecutor(max_workers=len(BENCHMARK_MODELS)) as executor:
            futures = {
                executor.submit(call_vision_model, m, out_img_path, prompt, api_key): m
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
            print(f"      • {m['model_name']:<28} -> {m['reading'][:60]} | {tok:>5} tok | {cost:.4f} THB ({m['latency_ms']} ms)")
            
        all_results.append({
            "date": date_str,
            "house": house_name,
            "image_path": out_img_path,
            "results": res_models
        })
        
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกผลลัพธ์ JSON: {OUTPUT_JSON}")
    
    generate_grid6_html_report(all_results, OUTPUT_HTML)
    print("\n" + "=" * 80)
    print("🎉 ดำเนินการเสร็จสมบูรณ์ 100%!")
    print(f"🌐 รายงาน HTML: {OUTPUT_HTML}")
    print("=" * 80)


if __name__ == "__main__":
    main()

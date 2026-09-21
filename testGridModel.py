# -*- coding: utf-8 -*-
"""
================================================================================
  GRID VISION BENCHMARK AND COMPARISON TOOL (BEFORE vs AFTER)
  Models: OpenAI GPT-5.6 Luna | Claude Haiku 4.5 | Claude Sonnet 5
  With Token Usage & Exact Cost Measurement (USD & THB)
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
from PIL import Image
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

GRID_DIR = r"D:\EasyFile\grid_samples"
OUTPUT_JSON = r"D:\EasyFile\grid_benchmark_results.json"
OUTPUT_HTML = r"D:\EasyFile\grid_benchmark_report.html"


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


def get_grid_prompt(filename):
    fn = filename.lower()
    if "water" in fn or "น้ำ" in fn:
        return (
            "รูปภาพนี้คือ Grid ภาพเปรียบเทียบมิเตอร์น้ำ มี 2 ช่องแบ่งชัดเจน:\n"
            "- ฝั่งซ้าย [1] ก่อนปฏิบัติงาน (Before)\n"
            "- ฝั่งขวา [2] หลังปฏิบัติงาน (After)\n"
            "กรุณาอ่านตัวเลขมิเตอร์น้ำของทั้ง 2 ฝั่งอย่างละเอียด (รวมทศนิยมลูกบาศก์เมตร m3)\n"
            "ตอบเป็น JSON รูปแบบ:\n"
            '{"before": "1805.607", "after": "1805.620", "unit": "m3", "confidence": "high/medium/low"}'
        )
    elif "electric" in fn or "ไฟ" in fn:
        return (
            "รูปภาพนี้คือ Grid ภาพเปรียบเทียบมิเตอร์ไฟฟ้า มี 2 ช่องแบ่งชัดเจน:\n"
            "- ฝั่งซ้าย [1] ก่อนปฏิบัติงาน (Before)\n"
            "- ฝั่งขวา [2] หลังปฏิบัติงาน (After)\n"
            "กรุณาอ่านตัวเลขมิเตอร์ไฟฟ้าของทั้ง 2 ฝั่งอย่างละเอียด\n"
            "ตอบเป็น JSON รูปแบบ:\n"
            '{"before": "94364", "after": "94364", "unit": "kWh", "confidence": "high/medium/low"}'
        )
    elif "ph" in fn or "chlorine" in fn or "คลอรีน" in fn:
        return (
            "รูปภาพนี้คือ Grid ชุดตรวจวัดค่าน้ำสระว่ายน้ำ (pH and Chlorine) มี 2 ช่องแบ่งชัดเจน:\n"
            "- ฝั่งซ้าย [1] ก่อนปฏิบัติงาน (Before)\n"
            "- ฝั่งขวา [2] หลังปฏิบัติงาน (After)\n"
            "กฎการอ่านค่าในแต่ละช่อง:\n"
            "1. หลอดฝาสีแดง = ค่า pH (สเกลบนแถบ: 6.8, 7.2, 7.6, 7.8, 8.2)\n"
            "2. หลอดฝาสีเหลือง = ค่า Chlorine/Cl (สเกลบนแถบ: 0.2, 0.6, 1.0, 1.5, 3.0 ppm - ต่ำสุดคือ 0.2 ห้ามตอบ 0 หรือ 0.0 เด็ดขาด)\n"
            "ตอบเป็น JSON รูปแบบ:\n"
            '{"before": {"ph": "7.2", "cl": "0.2"}, "after": {"ph": "7.6", "cl": "1.0"}, "confidence": "high/medium/low"}'
        )
    elif "salt" in fn or "เกลือ" in fn:
        return (
            "รูปภาพนี้คือ Grid เครื่องตรวจวัดความเค็ม/ค่าเกลือในสระ มี 2 ช่องแบ่งชัดเจน:\n"
            "- ฝั่งซ้าย [1] ก่อนปฏิบัติงาน (Before)\n"
            "- ฝั่งขวา [2] หลังปฏิบัติงาน (After)\n"
            "กรุณาอ่านตัวเลขค่าเกลือบนหน้าจอดิจิทัลทั้ง 2 ฝั่ง\n"
            "ตอบเป็น JSON รูปแบบ:\n"
            '{"before": "3570", "after": "3570", "unit": "ppm", "confidence": "high/medium/low"}'
        )
    else:
        return (
            "รูปภาพนี้มี 2 ช่อง: ฝั่งซ้าย [ก่อน] และ ฝั่งขวา [หลัง] กรุณาอ่านตัวเลขหรือข้อความสำคัญของทั้ง 2 ฝั่ง\n"
            'ตอบเป็น JSON รูปแบบ: {"before": "...", "after": "..."}'
        )


def call_vision_model(model_info, image_path, prompt, api_key):
    model_id = model_info["id"]
    model_name = model_info["name"]
    start_time = time.time()
    
    b64_img = encode_image_to_base64(image_path)
    if not b64_img:
        return {"model_id": model_id, "model_name": model_name, "reading": "Error loading img", "latency_ms": 0, "tokens": 0, "cost_thb": 0}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model_id,
        "messages": [
            {"role": "system", "content": "You are an expert AI visual inspector for utility meters and pool water. Analyze Before and After channels accurately. Return concise valid JSON directly."},
            {"role": "user", "content": [
                {"type": "text", "text": prompt},
                {"type": "image_url", "image_url": {"url": f"data:image/jpeg;base64,{b64_img}"}}
            ]}
        ],
        "temperature": 0.1,
        "max_tokens": 400
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
            
            # Calculate exact cost
            cost_usd = (prompt_tokens * model_info["input_price_per_m"] + completion_tokens * model_info["output_price_per_m"]) / 1_000_000.0
            cost_thb = cost_usd * USD_TO_THB
            
            clean = re.sub(r"^```[a-zA-Z]*\s*", "", content.strip())
            clean = re.sub(r"```$", "", clean).strip()
            
            parsed_summary = clean
            try:
                pj = json.loads(clean)
                if isinstance(pj.get("before"), dict) and isinstance(pj.get("after"), dict):
                    b_ph = pj["before"].get("ph", "-")
                    b_cl = pj["before"].get("cl", pj["before"].get("chlorine", "-"))
                    a_ph = pj["after"].get("ph", "-")
                    a_cl = pj["after"].get("cl", pj["after"].get("chlorine", "-"))
                    parsed_summary = f"[ก่อน] pH:{b_ph}, Cl:{b_cl} | [หลัง] pH:{a_ph}, Cl:{a_cl}"
                elif "before" in pj and "after" in pj:
                    unit = pj.get("unit", "")
                    parsed_summary = f"[ก่อน] {pj['before']} {unit} | [หลัง] {pj['after']} {unit}".strip()
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


def generate_grid_html_report(all_results, out_html_path):
    html_cards = ""
    
    # Model Stats accumulator
    model_stats = {m["id"]: {"name": m["name"], "total_tokens": 0, "total_cost_thb": 0.0, "total_ms": 0, "count": 0} for m in BENCHMARK_MODELS}
    
    for item in all_results:
        img_name = os.path.basename(item["image_path"])
        b64_thumb = encode_image_to_base64(item["image_path"], max_size=(800, 800), quality=80)
        
        rows = ""
        for m in item["results"]:
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
                <td class="py-3 px-3"><pre class="text-[11px] bg-gray-100 p-2 rounded max-h-20 overflow-auto">{m.get('raw', '')}</pre></td>
            </tr>
            """
            
        html_cards += f"""
        <div class="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-8">
            <div class="bg-slate-800 text-white px-6 py-3 font-semibold text-base flex justify-between items-center">
                <span>🖼️ {img_name}</span>
                <span class="text-xs bg-slate-700 px-2 py-1 rounded">2-in-1 Before/After Grid</span>
            </div>
            <div class="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                <div class="lg:col-span-4 bg-gray-100 rounded-lg p-2 flex justify-center border">
                    <img src="data:image/jpeg;base64,{b64_thumb}" class="rounded max-h-80 object-contain shadow-sm" />
                </div>
                <div class="lg:col-span-8 overflow-x-auto">
                    <table class="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr class="bg-gray-100 text-gray-700 text-xs uppercase">
                                <th class="py-2 px-3">Model</th>
                                <th class="py-2 px-3">ค่าอ่าน (Before | After)</th>
                                <th class="py-2 px-3 text-center">Tokens</th>
                                <th class="py-2 px-3 text-center">Cost (THB)</th>
                                <th class="py-2 px-3 text-center">Latency</th>
                                <th class="py-2 px-3">Raw JSON</th>
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

    # Summary Stats Table
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
    <title>3-Model Grid Vision Benchmark Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>body {{ font-family: 'Sarabun', sans-serif; }}</style>
</head>
<body class="bg-slate-50 min-h-screen py-10 px-4 sm:px-8">
    <div class="max-w-7xl mx-auto">
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 text-white rounded-2xl p-8 mb-8 shadow-lg">
            <h1 class="text-2xl sm:text-3xl font-bold mb-2">⚡ 3-Model Grid Vision Benchmark & Cost Analysis</h1>
            <p class="text-blue-200 text-sm">เปรียบเทียบความแม่นยำ, Token Usage และค่าใช้จ่ายจริงระหว่าง Luna vs Haiku 4.5 vs Sonnet 5</p>
        </div>
        
        <!-- Summary Stats Card -->
        <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 class="text-lg font-bold text-gray-800 mb-4">💰 สรุปค่าใช้จ่ายและประสิทธิภาพรวมทั้งหมด (Total Cost & Usage)</h2>
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
    print(" 🚀 3-MODEL GRID VISION BENCHMARK & COST ANALYSIS")
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
            
    grid_files = sorted(glob.glob(os.path.join(GRID_DIR, "*.jpg")) + glob.glob(os.path.join(GRID_DIR, "*.png")))
    if not grid_files:
        print(f"❌ ไม่พบไฟล์ในโฟลเดอร์ {GRID_DIR}")
        sys.exit(1)
        
    print(f"\n📁 พบภาพ Grid ทั้งหมด {len(grid_files)} รูปใน {GRID_DIR}")
    
    all_results = []
    for idx, g_path in enumerate(grid_files, 1):
        g_name = os.path.basename(g_path)
        prompt = get_grid_prompt(g_name)
        print(f"\n📸 [{idx}/{len(grid_files)}] กำลังส่งภาพ Grid: {g_name}...")
        
        item_results = []
        with ThreadPoolExecutor(max_workers=len(BENCHMARK_MODELS)) as executor:
            futures = {
                executor.submit(call_vision_model, m, g_path, prompt, api_key): m
                for m in BENCHMARK_MODELS
            }
            for fut in as_completed(futures):
                res = fut.result()
                item_results.append(res)
                
        order = {m["id"]: i for i, m in enumerate(BENCHMARK_MODELS)}
        item_results.sort(key=lambda x: order.get(x["model_id"], 99))
        
        for m in item_results:
            tok = m.get("total_tokens", 0)
            cost = m.get("cost_thb", 0)
            print(f"   • {m['model_name']:<28} -> {m['reading']:<40} | {tok:>5} tok | {cost:.4f} THB ({m['latency_ms']} ms)")
            
        all_results.append({
            "image_path": g_path,
            "results": item_results
        })
        
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกผลลัพธ์ JSON: {OUTPUT_JSON}")
    
    generate_grid_html_report(all_results, OUTPUT_HTML)
    print("\n🎉 ทดสอบ Grid ทั้งหมดเสร็จสิ้น 100%!")


if __name__ == "__main__":
    main()

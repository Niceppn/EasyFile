# -*- coding: utf-8 -*-
"""
================================================================================
  ADAPTIVE 8-GRID / 6-GRID VISION BENCHMARK & COST ANALYSIS TOOL
  (1 SINGLE COMPOSITE IMAGE PER HOUSE - 1 REQUEST ONLY!)
  - Salt Pool (8 Photos)     -> 8-Grid (4 columns x 2 rows)
  - Chlorine Pool (6 Photos) -> 6-Grid (3 columns x 2 rows)
  With Per-Slot Confidence Percentages (0-100%) & Cost Tracking
  Models: OpenAI GPT-5.6 Luna | Claude Haiku 4.5 | Claude Sonnet 5
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
GRID_CACHE_DIR = r"D:\EasyFile\grid_adaptive_composites"
OUTPUT_JSON = r"D:\EasyFile\adaptive_grid_benchmark_results.json"
OUTPUT_HTML = r"D:\EasyFile\adaptive_grid_benchmark_report.html"


# ----------------------------------------------------------------------
# ADAPTIVE GRID BUILDER (8-GRID / 6-GRID)
# ----------------------------------------------------------------------
def create_adaptive_grid(items, num_cols, main_title):
    tile_w, tile_h = 420, 420
    header_h = 50
    slot_label_h = 30
    padding = 12
    
    total_w = (tile_w * num_cols) + (padding * (num_cols + 1))
    total_h = header_h + (slot_label_h * 2) + (tile_h * 2) + (padding * 3)
    
    canvas = Image.new('RGB', (total_w, total_h), color=(248, 250, 252))
    draw = ImageDraw.Draw(canvas)
    
    try:
        font_title = ImageFont.truetype('tahoma.ttf', 20)
        font_label = ImageFont.truetype('tahoma.ttf', 14)
    except:
        font_title = ImageFont.load_default()
        font_label = ImageFont.load_default()
        
    draw.rectangle([(0, 0), (total_w, header_h)], fill=(15, 23, 42))
    draw.text((padding + 4, 14), main_title, fill=(255, 255, 255), font=font_title)
    
    for idx, (img_path, label, color) in enumerate(items):
        col = idx % num_cols
        row = idx // num_cols
        
        x = padding + col * (tile_w + padding)
        y_label = header_h + padding + row * (slot_label_h + tile_h + padding)
        y_img = y_label + slot_label_h
        
        draw.text((x + 4, y_label + 4), label, fill=color, font=font_label)
        if os.path.exists(img_path):
            img = Image.open(img_path).convert('RGB')
            img = img.resize((tile_w, tile_h), Image.Resampling.LANCZOS)
            canvas.paste(img, (x, y_img))
            draw.rectangle([(x-1, y_img-1), (x+tile_w, y_img+tile_h)], outline=(203, 213, 225), width=2)
            
    return canvas


def encode_image_to_base64(image_path, max_size=(1600, 1600), quality=84):
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
# PROMPTS WITH PER-SLOT CONFIDENCE PERCENTAGES (0-100%)
# ----------------------------------------------------------------------
def get_prompt_8grid_salt():
    return (
        "รูปภาพนี้คือภาพ Grid รวม 8 ช่อง (4 คอลัมน์ x 2 แถว) สำหรับสรุปผลการปฏิบัติงานบ้านสระเกลือ:\n\n"
        "--- แถวบน: ก่อนปฏิบัติงาน (Before) ---\n"
        "[1] มิเตอร์น้ำ (ก่อน) -> อ่านทศนิยมลูกบาศก์เมตร (m3)\n"
        "[2] มิเตอร์ไฟ (ก่อน) -> อ่านหน่วยไฟฟ้า (kWh)\n"
        "[3] ค่าน้ำ pH/คลอรีน (ก่อน) -> ฝาแดง=pH (6.8-8.2), ฝาเหลือง=Chlorine (สเกล 0.2-3.0 ppm ต่ำสุด 0.2 ห้ามตอบ 0.0)\n"
        "[4] ค่าเกลือ (ก่อน) -> อ่านตัวเลขหน้าจอดิจิทัล (ppm)\n\n"
        "--- แถวล่าง: หลังปฏิบัติงาน (After) ---\n"
        "[5] มิเตอร์น้ำ (หลัง) -> อ่านทศนิยมลูกบาศก์เมตร (m3)\n"
        "[6] มิเตอร์ไฟ (หลัง) -> อ่านหน่วยไฟฟ้า (kWh)\n"
        "[7] ค่าน้ำ pH/คลอรีน (หลัง) -> ฝาแดง=pH (6.8-8.2), ฝาเหลือง=Chlorine (สเกล 0.2-3.0 ppm ต่ำสุด 0.2)\n"
        "[8] ค่าเกลือ (หลัง) -> อ่านตัวเลขหน้าจอดิจิทัล (ppm)\n\n"
        "กรุณาระบุเปอร์เซ็นต์ความมั่นใจ (confidence 0-100%) ในแต่ละช่องและภาพรวม\n"
        "ตอบเป็น JSON รูปแบบ:\n"
        "{\n"
        '  "water": {\n'
        '    "before": "1805.607", "after": "1806.020", "unit": "m3",\n'
        '    "confidence_pct": {"before": 98, "after": 95}\n'
        '  },\n'
        '  "electric": {\n'
        '    "before": "94364", "after": "94362", "unit": "kWh",\n'
        '    "confidence_pct": {"before": 99, "after": 95}\n'
        '  },\n'
        '  "water_chemistry": {\n'
        '    "before": {"ph": "8.2", "chlorine": "0.2"},\n'
        '    "after": {"ph": "7.6", "chlorine": "1.0"},\n'
        '    "confidence_pct": {"before": 95, "after": 95}\n'
        '  },\n'
        '  "salt": {\n'
        '    "before": "3570", "after": "3570", "unit": "ppm",\n'
        '    "confidence_pct": {"before": 99, "after": 99}\n'
        '  },\n'
        '  "overall_confidence_pct": 97\n'
        "}"
    )


def get_prompt_6grid_chlorine():
    return (
        "รูปภาพนี้คือภาพ Grid รวม 6 ช่อง (3 คอลัมน์ x 2 แถว) สำหรับสรุปผลการปฏิบัติงานบ้านสระคลอรีน:\n\n"
        "--- แถวบน: ก่อนปฏิบัติงาน (Before) ---\n"
        "[1] มิเตอร์น้ำ (ก่อน) -> อ่านทศนิยมลูกบาศก์เมตร (m3)\n"
        "[2] มิเตอร์ไฟ (ก่อน) -> อ่านหน่วยไฟฟ้า (kWh)\n"
        "[3] ค่าน้ำ pH/คลอรีน (ก่อน) -> ฝาแดง=pH (6.8-8.2), ฝาเหลือง=Chlorine (สเกล 0.2-3.0 ppm ต่ำสุด 0.2 ห้ามตอบ 0.0)\n\n"
        "--- แถวล่าง: หลังปฏิบัติงาน (After) ---\n"
        "[4] มิเตอร์น้ำ (หลัง) -> อ่านทศนิยมลูกบาศก์เมตร (m3)\n"
        "[5] มิเตอร์ไฟ (หลัง) -> อ่านหน่วยไฟฟ้า (kWh)\n"
        "[6] ค่าน้ำ pH/คลอรีน (หลัง) -> ฝาแดง=pH (6.8-8.2), ฝาเหลือง=Chlorine (สเกล 0.2-3.0 ppm ต่ำสุด 0.2)\n\n"
        "กรุณาระบุเปอร์เซ็นต์ความมั่นใจ (confidence 0-100%) ในแต่ละช่องและภาพรวม\n"
        "ตอบเป็น JSON รูปแบบ:\n"
        "{\n"
        '  "water": {\n'
        '    "before": "1805.607", "after": "1806.020", "unit": "m3",\n'
        '    "confidence_pct": {"before": 98, "after": 95}\n'
        '  },\n'
        '  "electric": {\n'
        '    "before": "94364", "after": "94362", "unit": "kWh",\n'
        '    "confidence_pct": {"before": 99, "after": 95}\n'
        '  },\n'
        '  "water_chemistry": {\n'
        '    "before": {"ph": "8.2", "chlorine": "0.2"},\n'
        '    "after": {"ph": "7.6", "chlorine": "1.0"},\n'
        '    "confidence_pct": {"before": 95, "after": 95}\n'
        '  },\n'
        '  "overall_confidence_pct": 97\n'
        "}"
    )


# ----------------------------------------------------------------------
# API VISION CALL & PARSING
# ----------------------------------------------------------------------
def call_vision_model(model_info, image_path, prompt, api_key):
    model_id = model_info["id"]
    model_name = model_info["name"]
    start_time = time.time()
    
    b64_img = encode_image_to_base64(image_path)
    if not b64_img:
        return {"model_id": model_id, "model_name": model_name, "reading": "Error loading img", "latency_ms": 0, "total_tokens": 0, "cost_thb": 0, "overall_confidence": 0}

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": model_id,
        "messages": [
            {"role": "system", "content": "You are an expert AI visual inspector for utility meters and pool water chemistry. Read all grid slots accurately. Provide confidence percentage (0-100%) for each slot. Return concise valid JSON directly."},
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
            overall_conf = 0
            conf_breakdown = {}
            
            try:
                m_json = re.search(r"\{.*\}", clean, re.DOTALL)
                if m_json:
                    clean = m_json.group(0)
                pj = json.loads(clean)
                
                parts = []
                conf_list = []
                
                if "water" in pj:
                    wb = pj["water"].get("before", "-")
                    wa = pj["water"].get("after", "-")
                    w_conf = pj["water"].get("confidence_pct", {})
                    if isinstance(w_conf, dict):
                        w_cb = w_conf.get("before", "")
                        w_ca = w_conf.get("after", "")
                        w_str = f"💧น้ำ: [{wb} ({w_cb}%) -> {wa} ({w_ca}%)]" if (w_cb and w_ca) else f"💧น้ำ: [{wb} -> {wa}]"
                        if isinstance(w_cb, (int, float)): conf_list.append(w_cb)
                        if isinstance(w_ca, (int, float)): conf_list.append(w_ca)
                    else:
                        w_str = f"💧น้ำ: [{wb} -> {wa}]"
                    parts.append(w_str)
                    
                if "electric" in pj:
                    eb = pj["electric"].get("before", "-")
                    ea = pj["electric"].get("after", "-")
                    e_conf = pj["electric"].get("confidence_pct", {})
                    if isinstance(e_conf, dict):
                        e_cb = e_conf.get("before", "")
                        e_ca = e_conf.get("after", "")
                        e_str = f"⚡ไฟ: [{eb} ({e_cb}%) -> {ea} ({e_ca}%)]" if (e_cb and e_ca) else f"⚡ไฟ: [{eb} -> {ea}]"
                        if isinstance(e_cb, (int, float)): conf_list.append(e_cb)
                        if isinstance(e_ca, (int, float)): conf_list.append(e_ca)
                    else:
                        e_str = f"⚡ไฟ: [{eb} -> {ea}]"
                    parts.append(e_str)
                    
                if "water_chemistry" in pj:
                    cb = pj["water_chemistry"].get("before", {})
                    ca = pj["water_chemistry"].get("after", {})
                    b_ph = cb.get("ph", cb.get("pH", "-"))
                    b_cl = cb.get("chlorine", cb.get("cl", cb.get("Chlorine", "-")))
                    a_ph = ca.get("ph", ca.get("pH", "-"))
                    a_cl = ca.get("chlorine", ca.get("cl", ca.get("Chlorine", "-")))
                    c_conf = pj["water_chemistry"].get("confidence_pct", {})
                    if isinstance(c_conf, dict):
                        c_cb = c_conf.get("before", "")
                        c_ca = c_conf.get("after", "")
                        c_str = f"🧪ค่าน้ำ: ก่อน({b_ph}, {b_cl} [{c_cb}%]) | หลัง({a_ph}, {a_cl} [{c_ca}%])" if (c_cb and c_ca) else f"🧪ค่าน้ำ: ก่อน({b_ph}, {b_cl}) | หลัง({a_ph}, {a_cl})"
                        if isinstance(c_cb, (int, float)): conf_list.append(c_cb)
                        if isinstance(c_ca, (int, float)): conf_list.append(c_ca)
                    else:
                        c_str = f"🧪ค่าน้ำ: ก่อน({b_ph}, {b_cl}) | หลัง({a_ph}, {a_cl})"
                    parts.append(c_str)
                    
                if "salt" in pj:
                    sb = pj["salt"].get("before", "-")
                    sa = pj["salt"].get("after", "-")
                    s_conf = pj["salt"].get("confidence_pct", {})
                    if isinstance(s_conf, dict):
                        s_cb = s_conf.get("before", "")
                        s_ca = s_conf.get("after", "")
                        s_str = f"🧂เกลือ: [{sb} ({s_cb}%) -> {sa} ({s_ca}%) ppm]" if (s_cb and s_ca) else f"🧂เกลือ: [{sb} -> {sa} ppm]"
                        if isinstance(s_cb, (int, float)): conf_list.append(s_cb)
                        if isinstance(s_ca, (int, float)): conf_list.append(s_ca)
                    else:
                        s_str = f"🧂เกลือ: [{sb} -> {sa} ppm]"
                    parts.append(s_str)
                    
                if "overall_confidence_pct" in pj and isinstance(pj["overall_confidence_pct"], (int, float)):
                    overall_conf = int(pj["overall_confidence_pct"])
                elif conf_list:
                    overall_conf = int(sum(conf_list) / len(conf_list))
                else:
                    overall_conf = 95
                    
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
                "overall_confidence": overall_conf,
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
                "overall_confidence": 0,
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
            "overall_confidence": 0,
            "status": "error"
        }


# ----------------------------------------------------------------------
# HTML REPORT GENERATOR WITH CONFIDENCE VISUALIZATIONS
# ----------------------------------------------------------------------
def generate_adaptive_html_report(all_results, out_html_path):
    html_cards = ""
    model_stats = {m["id"]: {"name": m["name"], "total_tokens": 0, "total_cost_thb": 0.0, "total_ms": 0, "count": 0, "conf_sum": 0} for m in BENCHMARK_MODELS}
    
    for house_item in all_results:
        house_name = house_item["house"]
        date_str = house_item["date"]
        pool_type = house_item.get("pool_type", "สระคลอรีน")
        grid_mode = house_item.get("grid_mode", "6-Grid")
        g_path = house_item["image_path"]
        b64_thumb = encode_image_to_base64(g_path, max_size=(1100, 1100), quality=80)
        
        rows = ""
        for m in house_item["results"]:
            mid = m["model_id"]
            if mid in model_stats and m.get("status") == "success":
                model_stats[mid]["total_tokens"] += m.get("total_tokens", 0)
                model_stats[mid]["total_cost_thb"] += m.get("cost_thb", 0.0)
                model_stats[mid]["total_ms"] += m.get("latency_ms", 0)
                model_stats[mid]["conf_sum"] += m.get("overall_confidence", 95)
                model_stats[mid]["count"] += 1
                
            badge_color = "bg-blue-100 text-blue-800" if "Luna" in m["model_name"] else ("bg-purple-100 text-purple-800" if "Sonnet" in m["model_name"] else "bg-amber-100 text-amber-800")
            cost_str = f"{m.get('cost_thb', 0):.4f} ฿" if m.get('cost_thb') else "-"
            token_str = f"{m.get('total_tokens', 0):,} tok" if m.get('total_tokens') else "-"
            
            conf_val = m.get("overall_confidence", 0)
            if conf_val >= 90:
                conf_badge = f'<span class="bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold px-2 py-0.5 rounded text-xs">🟢 {conf_val}%</span>'
            elif conf_val >= 75:
                conf_badge = f'<span class="bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded text-xs">🟡 {conf_val}%</span>'
            elif conf_val > 0:
                conf_badge = f'<span class="bg-rose-100 text-rose-800 border border-rose-300 font-bold px-2 py-0.5 rounded text-xs">🔴 {conf_val}%</span>'
            else:
                conf_badge = '<span class="text-gray-400 text-xs">-</span>'
                
            rows += f"""
            <tr class="border-b hover:bg-gray-50">
                <td class="py-3 px-3"><span class="font-medium {badge_color} px-2.5 py-1 rounded text-xs whitespace-nowrap">{m['model_name']}</span></td>
                <td class="py-3 px-3 font-mono font-bold text-gray-900 text-sm">{m['reading']}</td>
                <td class="py-3 px-3 text-center whitespace-nowrap">{conf_badge}</td>
                <td class="py-3 px-3 text-xs text-center text-gray-600 font-mono">{token_str}</td>
                <td class="py-3 px-3 text-xs text-center font-bold text-emerald-700 font-mono">{cost_str}</td>
                <td class="py-3 px-3 text-xs text-center text-gray-500">{m['latency_ms']} ms</td>
            </tr>
            """
            
        badge_mode = "bg-purple-600" if "8-Grid" in grid_mode else "bg-blue-600"
        
        html_cards += f"""
        <div class="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden mb-10">
            <div class="bg-slate-900 text-white px-6 py-4 flex justify-between items-center">
                <div>
                    <h3 class="font-bold text-lg">🏡 {house_name}</h3>
                    <p class="text-xs text-slate-400">วันที่: {date_str} • ประเภท: <span class="text-cyan-300 font-medium">{pool_type}</span></p>
                </div>
                <span class="text-xs {badge_mode} text-white px-3 py-1.5 rounded-full font-bold shadow-sm">{grid_mode} (1 Request)</span>
            </div>
            <div class="p-6">
                <div class="mb-6 bg-slate-100 rounded-xl p-3 flex justify-center border shadow-inner">
                    <img src="data:image/jpeg;base64,{b64_thumb}" class="rounded-lg max-h-[520px] object-contain shadow-md" />
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-left text-sm border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
                        <thead>
                            <tr class="bg-gray-100 text-gray-700 text-xs uppercase">
                                <th class="py-2 px-3">โมเดล</th>
                                <th class="py-2 px-3">สรุปค่าที่อ่านได้ (+ Confidence รายช่อง)</th>
                                <th class="py-2 px-3 text-center">ความมั่นใจ</th>
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
        avg_conf = int(s["conf_sum"] / cnt) if s["count"] > 0 else 0
        summary_rows += f"""
        <tr class="border-b">
            <td class="py-3 px-4 font-semibold text-gray-800">{s['name']}</td>
            <td class="py-3 px-4 text-center font-mono font-bold text-emerald-700">{avg_conf}%</td>
            <td class="py-3 px-4 text-center font-mono">{s['total_tokens']:,} tokens</td>
            <td class="py-3 px-4 text-center font-mono font-bold text-emerald-700">{s['total_cost_thb']:.4f} บาท</td>
            <td class="py-3 px-4 text-center text-gray-600">{avg_ms} ms</td>
        </tr>
        """

    full_html = f"""<!DOCTYPE html>
<html lang="th">
<head>
    <meta charset="UTF-8">
    <title>Adaptive 8-Grid & 6-Grid Vision Benchmark Report</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>body {{ font-family: 'Sarabun', sans-serif; }}</style>
</head>
<body class="bg-slate-100 min-h-screen py-10 px-4 sm:px-8">
    <div class="max-w-7xl mx-auto">
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white rounded-2xl p-8 mb-8 shadow-xl">
            <h1 class="text-2xl sm:text-3xl font-bold mb-2">⚡ Adaptive 8-Grid & 6-Grid Vision AI Benchmark</h1>
            <p class="text-blue-200 text-sm">รวมรูปภาพทั้งหลังเหลือ 1 รูปเดียว พร้อมระบบประเมินค่า Confidence % รายช่อง และคำนวณต้นทุนจริง</p>
        </div>
        
        <div class="bg-white rounded-xl shadow-md border border-gray-200 p-6 mb-8">
            <h2 class="text-lg font-bold text-gray-800 mb-4">💰 สรุปต้นทุนรวม, ความเร็ว และระดับความมั่นใจเฉลี่ย (Total Benchmark Summary)</h2>
            <table class="w-full text-left text-sm border-collapse">
                <thead>
                    <tr class="bg-gray-100 text-gray-700 text-xs uppercase">
                        <th class="py-2 px-4">โมเดล</th>
                        <th class="py-2 px-4 text-center">ความมั่นใจเฉลี่ย (%)</th>
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
    print(" 🚀 ADAPTIVE 8-GRID / 6-GRID VISION BENCHMARK (WITH CONFIDENCE %)")
    print(" 1. สระเกลือ    -> 8-Grid (น้ำ, ไฟ, pH/Cl, เกลือ ก่อน/หลัง) [4x2]")
    print(" 2. สระคลอรีน  -> 6-Grid (น้ำ, ไฟ, pH/Cl ก่อน/หลัง) [3x2]")
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
    
    house_dirs = []
    for d in sorted(os.listdir(photos_dir)):
        dp = os.path.join(photos_dir, d)
        if os.path.isdir(dp):
            for h in sorted(os.listdir(dp)):
                hp = os.path.join(dp, h)
                if os.path.isdir(hp):
                    house_dirs.append({"date": d, "house": h, "path": hp})
                    
    print(f"\n🏡 พบข้อมูลบ้านทั้งหมด: {len(house_dirs)} แปลง")
    limit_input = input(f"👉 ต้องการทดสอบกี่แปลง? [กด Enter เพื่อรันทั้งหมด {len(house_dirs)} แปลง]: ").strip()
    limit = int(limit_input) if limit_input.isdigit() else len(house_dirs)
    selected_houses = house_dirs[:limit]
    
    all_results = []
    
    for h_idx, h_info in enumerate(selected_houses, 1):
        house_name = h_info["house"]
        date_str = h_info["date"]
        h_path = h_info["path"]
        
        w_before = glob.glob(os.path.join(h_path, "*มิเตอร์น้ำ_ก่อน*.*"))
        w_after = glob.glob(os.path.join(h_path, "*มิเตอร์น้ำ_หลัง*.*"))
        e_before = glob.glob(os.path.join(h_path, "*มิเตอร์ไฟ_ก่อน*.*"))
        e_after = glob.glob(os.path.join(h_path, "*มิเตอร์ไฟ_หลัง*.*"))
        ph_before = glob.glob(os.path.join(h_path, "*วัดค่าน้ำpHคลอรีน_ก่อน*.*"))
        ph_after = glob.glob(os.path.join(h_path, "*วัดค่าน้ำpHคลอรีน_หลัง*.*"))
        salt_before = glob.glob(os.path.join(h_path, "*วัดเกลือ_ก่อน*.*"))
        salt_after = glob.glob(os.path.join(h_path, "*วัดเกลือ_หลัง*.*"))
        
        if not (w_before and w_after and e_before and e_after and ph_before and ph_after):
            print(f"⚠️ [{h_idx}/{len(selected_houses)}] รูปภาพหลักไม่ครบสำหรับ {house_name} ข้ามไป")
            continue
            
        has_salt = bool(salt_before and salt_after)
        
        if has_salt:
            grid_mode = "8-Grid (สระเกลือ)"
            pool_type = "สระว่ายน้ำระบบเกลือ (Salt Pool)"
            items = [
                # แถวบน: ก่อน
                (w_before[0], "[1] น้ำ (ก่อน)", (220, 38, 38)),
                (e_before[0], "[2] ไฟ (ก่อน)", (220, 38, 38)),
                (ph_before[0], "[3] pH/Cl (ก่อน)", (220, 38, 38)),
                (salt_before[0], "[4] เกลือ (ก่อน)", (220, 38, 38)),
                # แถวล่าง: หลัง
                (w_after[0], "[5] น้ำ (หลัง)", (22, 163, 74)),
                (e_after[0], "[6] ไฟ (หลัง)", (22, 163, 74)),
                (ph_after[0], "[7] pH/Cl (หลัง)", (22, 163, 74)),
                (salt_after[0], "[8] เกลือ (หลัง)", (22, 163, 74)),
            ]
            grid_img = create_adaptive_grid(items, 4, f"สรุปตรวจวัด 8-Grid (น้ำ, ไฟ, pH/Cl, เกลือ) - {house_name}")
            out_img_path = os.path.join(GRID_CACHE_DIR, f"{date_str}_{house_name}_grid8.jpg")
            grid_img.save(out_img_path, quality=84)
            prompt = get_prompt_8grid_salt()
        else:
            grid_mode = "6-Grid (สระคลอรีน)"
            pool_type = "สระว่ายน้ำระบบคลอรีน (Chlorine Pool)"
            items = [
                (w_before[0], "[1] น้ำ (ก่อน)", (220, 38, 38)),
                (e_before[0], "[2] ไฟ (ก่อน)", (220, 38, 38)),
                (ph_before[0], "[3] pH/Cl (ก่อน)", (220, 38, 38)),
                (w_after[0], "[4] น้ำ (หลัง)", (22, 163, 74)),
                (e_after[0], "[5] ไฟ (หลัง)", (22, 163, 74)),
                (ph_after[0], "[6] pH/Cl (หลัง)", (22, 163, 74)),
            ]
            grid_img = create_adaptive_grid(items, 3, f"สรุปตรวจวัด 6-Grid (น้ำ, ไฟ, pH/Cl) - {house_name}")
            out_img_path = os.path.join(GRID_CACHE_DIR, f"{date_str}_{house_name}_grid6.jpg")
            grid_img.save(out_img_path, quality=84)
            prompt = get_prompt_6grid_chlorine()
            
        print(f"\n[{h_idx}/{len(selected_houses)}] 🏡 {house_name} ({grid_mode})...", end="", flush=True)
        
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
            conf = m.get("overall_confidence", 0)
            print(f"      • {m['model_name']:<28} -> {m['reading'][:60]} | Conf: {conf}% | {tok:>5} tok | {cost:.4f} THB ({m['latency_ms']} ms)")
            
        all_results.append({
            "date": date_str,
            "house": house_name,
            "pool_type": pool_type,
            "grid_mode": grid_mode,
            "image_path": out_img_path,
            "results": res_models
        })
        
    with open(OUTPUT_JSON, "w", encoding="utf-8") as f:
        json.dump(all_results, f, ensure_ascii=False, indent=2)
    print(f"\n💾 บันทึกผลลัพธ์ JSON: {OUTPUT_JSON}")
    
    generate_adaptive_html_report(all_results, OUTPUT_HTML)
    print("\n" + "=" * 80)
    print("🎉 ดำเนินการเสร็จสมบูรณ์ 100%!")
    print(f"🌐 รายงาน HTML: {OUTPUT_HTML}")
    print("=" * 80)


if __name__ == "__main__":
    main()

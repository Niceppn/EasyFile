from PIL import Image

def process_logo(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    datas = img.getdata()

    newData = []
    for item in datas:
        # Check for white / near-white background pixels
        if item[0] > 235 and item[1] > 235 and item[2] > 235:
            newData.append((255, 255, 255, 0))
        else:
            newData.append(item)

    img.putdata(newData)

    # Crop to non-transparent bounding box
    bbox = img.getbbox()
    if bbox:
        # Add small padding around cropped logo
        padding = 10
        left = max(0, bbox[0] - padding)
        top = max(0, bbox[1] - padding)
        right = min(img.width, bbox[2] + padding)
        bottom = min(img.height, bbox[3] + padding)
        img = img.crop((left, top, right, bottom))

    img.save(output_path, "PNG")
    print(f"Processed logo saved to {output_path} with dimensions {img.size}")

if __name__ == "__main__":
    src = r"C:\Users\Lenovo\Downloads\ChatGPT Image Aug 30, 2026, 02_46_22 PM.png"
    process_logo(src, r"d:\EasyFile\public\logo.png")
    process_logo(src, r"d:\EasyFile\public\logo_transparent.png")
    process_logo(src, r"d:\EasyFile\public\icon.png")

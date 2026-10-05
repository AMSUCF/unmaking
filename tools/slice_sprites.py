#!/usr/bin/env python3
"""Sprite tools for the UnMaking deck.

sheet   find sprites on a flat-colour sheet, key out the background, save blob_NN.png
frame   normalise one sprite into a 120x180 frame and write its cross-stitch twin
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw

FRAME_W, FRAME_H = 120, 180
STITCH_SCALE = 2

# Thread palette for the textile act (keep in sync with css/craft-textile.css accents).
THREADS = [
    "#1b1b1b", "#f4f1ea", "#e9b48f", "#d98a7a", "#e2b33c", "#d6c25a", "#7b4fb3",
    "#a98bd6", "#2c3e6b", "#3f8f8a", "#b8332f", "#6b4a2e", "#8a8a8a", "#5a8a3c",
]


def _rgb(hexstr):
    return tuple(int(hexstr[i:i + 2], 16) for i in (1, 3, 5))


THREAD_RGB = [_rgb(h) for h in THREADS]


def key_background(img, key=None, tolerance=60):
    """Return RGBA with every pixel near `key` (default: top-left colour) made transparent."""
    src = img.convert("RGBA")
    if key is None:
        key = src.getpixel((0, 0))[:3]
    tol2 = tolerance * tolerance
    out = Image.new("RGBA", src.size, (0, 0, 0, 0))
    data = [
        (r, g, b, 255) if a and (r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2 > tol2 else (0, 0, 0, 0)
        for (r, g, b, a) in src.getdata()
    ]
    out.putdata(data)
    return out


def _runs(flags, min_gap):
    runs, start, end, gap = [], None, None, 0
    for i, f in enumerate(flags):
        if f:
            if start is None:
                start = i
            end, gap = i, 0
        elif start is not None:
            gap += 1
            if gap > min_gap:
                runs.append((start, end))
                start, gap = None, 0
    if start is not None:
        runs.append((start, end))
    return runs


def find_sprites(keyed, min_gap=12, min_height=120, min_pixels=3):
    """Boxes of sprites in row-major order, found by row then column projections."""
    alpha = keyed.getchannel("A")
    w, h = keyed.size
    rows = [alpha.crop((0, y, w, y + 1)).histogram()[255] >= min_pixels for y in range(h)]
    boxes = []
    for y0, y1 in _runs(rows, min_gap):
        band = alpha.crop((0, y0, w, y1 + 1))
        bh = y1 - y0 + 1
        cols = [band.crop((x, 0, x + 1, bh)).histogram()[255] >= min_pixels for x in range(w)]
        for x0, x1 in _runs(cols, min_gap):
            bb = alpha.crop((x0, y0, x1 + 1, y1 + 1)).getbbox()
            if bb is None:
                continue
            box = (x0 + bb[0], y0 + bb[1], x0 + bb[2], y0 + bb[3])
            if box[3] - box[1] >= min_height:
                boxes.append(box)
    return boxes


def normalize(sprite):
    """Scale (nearest-neighbour) to fit 120x180 and anchor bottom-centre."""
    sprite = sprite.convert("RGBA")
    bb = sprite.getchannel("A").getbbox()
    if bb:
        sprite = sprite.crop(bb)
    w, h = sprite.size
    scale = min((FRAME_W - 4) / w, (FRAME_H - 2) / h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    sprite = sprite.resize((nw, nh), Image.NEAREST)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    frame.paste(sprite, ((FRAME_W - nw) // 2, FRAME_H - nh), sprite)
    return frame


def _nearest_thread(rgb):
    return min(THREAD_RGB, key=lambda t: (t[0] - rgb[0]) ** 2 + (t[1] - rgb[1]) ** 2 + (t[2] - rgb[2]) ** 2)


def stitchify(frame, cell=4):
    """Render a 120x180 frame as cross-stitch at 2x: one X per opaque cell."""
    frame = frame.convert("RGBA")
    size = cell * STITCH_SCALE
    out = Image.new("RGBA", (FRAME_W * STITCH_SCALE, FRAME_H * STITCH_SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    half = cell // 2
    for row in range(FRAME_H // cell):
        for col in range(FRAME_W // cell):
            r, g, b, a = frame.getpixel((col * cell + half, row * cell + half))
            if a < 128:
                continue
            thread = _nearest_thread((r, g, b))
            shade = tuple(max(0, c - 60) for c in thread)
            x, y, p = col * size, row * size, 1
            for colour, off in ((shade, 1), (thread, 0)):
                draw.line((x + p + off, y + p + off, x + size - p + off, y + size - p + off), fill=colour + (255,), width=2)
                draw.line((x + size - p + off, y + p + off, x + p + off, y + size - p + off), fill=colour + (255,), width=2)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("sheet")
    s.add_argument("sheet")
    s.add_argument("outdir")
    s.add_argument("--tolerance", type=int, default=60)
    s.add_argument("--min-height", type=int, default=120)
    s.add_argument("--min-gap", type=int, default=12)
    f = sub.add_parser("frame")
    f.add_argument("src")
    f.add_argument("name")
    f.add_argument("outdir")
    args = ap.parse_args()

    if args.cmd == "sheet":
        keyed = key_background(Image.open(args.sheet), tolerance=args.tolerance)
        out = Path(args.outdir)
        out.mkdir(parents=True, exist_ok=True)
        for i, box in enumerate(find_sprites(keyed, min_gap=args.min_gap, min_height=args.min_height)):
            keyed.crop(box).save(out / f"blob_{i:02d}.png")
            print(f"blob_{i:02d}.png  box={box}  size={box[2] - box[0]}x{box[3] - box[1]}")
    else:
        src = Image.open(args.src).convert("RGBA")
        if src.getpixel((0, 0))[3] == 255:
            src = key_background(src)
        frame = normalize(src)
        out = Path(args.outdir)
        out.mkdir(parents=True, exist_ok=True)
        frame.save(out / f"{args.name}.png")
        stitchify(frame).save(out / f"{args.name}.stitch.png")
        print(f"wrote {args.name}.png and {args.name}.stitch.png")


if __name__ == "__main__":
    main()

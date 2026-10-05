import sys
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import slice_sprites as ss  # noqa: E402

CYAN = (140, 227, 227)


def sheet():
    img = Image.new("RGB", (400, 400), CYAN)
    d = ImageDraw.Draw(img)
    d.rectangle((20, 20, 60, 170), fill=(255, 0, 0))     # row 1, left
    d.rectangle((120, 20, 160, 170), fill=(0, 0, 255))   # row 1, right
    d.rectangle((20, 220, 60, 380), fill=(0, 160, 0))    # row 2
    d.rectangle((300, 250, 303, 253), fill=(0, 0, 0))    # speck: dropped
    return img


class SliceTests(unittest.TestCase):
    def test_key_background_makes_corner_transparent(self):
        keyed = ss.key_background(sheet())
        self.assertEqual(keyed.getpixel((0, 0))[3], 0)
        self.assertEqual(keyed.getpixel((40, 100)), (255, 0, 0, 255))

    def test_find_sprites_row_major_and_drops_small_blobs(self):
        keyed = ss.key_background(sheet())
        boxes = ss.find_sprites(keyed, min_height=100)
        self.assertEqual(len(boxes), 3)
        colours = [keyed.getpixel(((b[0] + b[2]) // 2, (b[1] + b[3]) // 2))[:3] for b in boxes]
        self.assertEqual(colours, [(255, 0, 0), (0, 0, 255), (0, 160, 0)])

    def test_normalize_bottom_centres_into_frame(self):
        keyed = ss.key_background(sheet())
        box = ss.find_sprites(keyed, min_height=100)[0]
        frame = ss.normalize(keyed.crop(box))
        self.assertEqual(frame.size, (ss.FRAME_W, ss.FRAME_H))
        self.assertEqual(frame.getpixel((ss.FRAME_W // 2, ss.FRAME_H - 1))[3], 255)
        self.assertEqual(frame.getpixel((0, 0))[3], 0)

    def test_stitchify_doubles_size_and_keeps_transparency(self):
        frame = Image.new("RGBA", (ss.FRAME_W, ss.FRAME_H), (0, 0, 0, 0))
        ImageDraw.Draw(frame).rectangle((40, 100, 80, 179), fill=(123, 79, 179, 255))
        out = ss.stitchify(frame)
        self.assertEqual(out.size, (ss.FRAME_W * 2, ss.FRAME_H * 2))
        self.assertEqual(out.getpixel((2, 2))[3], 0)
        self.assertIsNotNone(out.getchannel("A").getbbox())


if __name__ == "__main__":
    unittest.main()

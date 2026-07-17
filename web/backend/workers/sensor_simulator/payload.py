import math
import random


def build_payload(index):
    wave = math.sin(index / 4)
    nh3_ppm = 18 + (wave * 6) + random.uniform(-1.2, 1.2)
    ch4_ppm = 520 + (math.cos(index / 5) * 80) + random.uniform(-18, 18)
    h2s_ppm = 2.2 + (math.sin(index / 3) * 1.2) + random.uniform(-0.25, 0.25)

    if index > 0 and index % 17 == 0:
        nh3_ppm += random.uniform(12, 24)
        ch4_ppm += random.uniform(120, 220)
        h2s_ppm += random.uniform(2.5, 5.0)

    return {
        "nh3_ppm": round(max(nh3_ppm, 0), 2),
        "ch4_ppm": round(max(ch4_ppm, 0), 2),
        "h2s_ppm": round(max(h2s_ppm, 0), 2),
    }

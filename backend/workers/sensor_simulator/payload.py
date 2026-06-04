import math
import random


def build_payload(index):
    wave = math.sin(index / 4)
    nh3_ppm = 18 + (wave * 6) + random.uniform(-1.2, 1.2)
    co2_ppm = 520 + (math.cos(index / 5) * 80) + random.uniform(-18, 18)

    if index > 0 and index % 17 == 0:
        nh3_ppm += random.uniform(12, 24)
        co2_ppm += random.uniform(120, 220)

    return {
        "nh3_ppm": round(max(nh3_ppm, 0), 2),
        "co2_ppm": round(max(co2_ppm, 0), 2),
    }

import argparse
import os
import sys
from dataclasses import dataclass


@dataclass(frozen=True)
class WorkerConfig:
    url: str
    interval: float
    count: int
    timeout: float


def positive_float(value):
    parsed = float(value)
    if parsed <= 0:
        raise argparse.ArgumentTypeError("nilai harus lebih besar dari 0")
    return parsed


def non_negative_int(value):
    parsed = int(value)
    if parsed < 0:
        raise argparse.ArgumentTypeError("nilai tidak boleh negatif")
    return parsed


def read_env(name, default, parser_type):
    value = os.getenv(name, default)
    try:
        return parser_type(value)
    except (argparse.ArgumentTypeError, ValueError):
        print(f"Konfigurasi {name} tidak valid: {value}", file=sys.stderr)
        sys.exit(2)


def parse_args():
    default_url = os.getenv("SENSOR_API_URL", "http://127.0.0.1:8080/api/sensors")
    default_interval = read_env("SENSOR_INTERVAL", "5", positive_float)
    default_count = read_env("SENSOR_COUNT", "0", non_negative_int)
    default_timeout = read_env("SENSOR_TIMEOUT", "5", positive_float)

    parser = argparse.ArgumentParser(
        description="Worker Python untuk simulasi pengiriman data sensor udara ke API Node."
    )
    parser.add_argument(
        "--url",
        default=default_url,
        help="URL endpoint API sensor Node. Bisa juga pakai env SENSOR_API_URL.",
    )
    parser.add_argument(
        "--interval",
        type=positive_float,
        default=default_interval,
        help="Jeda antar pengiriman dalam detik. Bisa juga pakai env SENSOR_INTERVAL.",
    )
    parser.add_argument(
        "--count",
        type=non_negative_int,
        default=default_count,
        help="Jumlah data yang dikirim. Isi 0 untuk berjalan terus. Bisa juga pakai env SENSOR_COUNT.",
    )
    parser.add_argument(
        "--timeout",
        type=positive_float,
        default=default_timeout,
        help="Timeout request HTTP dalam detik. Bisa juga pakai env SENSOR_TIMEOUT.",
    )

    args = parser.parse_args()
    return WorkerConfig(
        url=args.url,
        interval=args.interval,
        count=args.count,
        timeout=args.timeout,
    )

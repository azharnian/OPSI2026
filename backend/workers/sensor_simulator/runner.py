import signal
import sys
import time
from datetime import datetime
from urllib.error import HTTPError, URLError

from sensor_simulator.http_client import post_json
from sensor_simulator.payload import build_payload


class SensorWorker:
    def __init__(self, config):
        self.config = config
        self.running = True

    def stop(self, _signum, _frame):
        self.running = False

    def register_signals(self):
        signal.signal(signal.SIGINT, self.stop)
        signal.signal(signal.SIGTERM, self.stop)

    def run(self):
        self.register_signals()
        self.print_startup()

        sent = 0
        while self.running and (self.config.count == 0 or sent < self.config.count):
            payload = build_payload(sent)
            self.send_payload(payload)

            sent += 1
            if self.running and (self.config.count == 0 or sent < self.config.count):
                time.sleep(self.config.interval)

        print("Worker sensor berhenti.")

    def print_startup(self):
        print(f"Worker sensor berjalan: {self.config.url}")
        print(f"Interval pengiriman: {self.config.interval} detik")
        print("Tekan Ctrl+C untuk berhenti.")

    def send_payload(self, payload):
        timestamp = datetime.now().strftime("%H:%M:%S")

        try:
            status, response_body = post_json(
                self.config.url,
                payload,
                self.config.timeout,
            )
            print(
                f"[{timestamp}] POST {status} "
                f"nh3={payload['nh3_ppm']} ppm co2={payload['co2_ppm']} ppm"
            )
            if status >= 400:
                print(response_body)
        except HTTPError as error:
            print(f"[{timestamp}] HTTP {error.code}: {error.reason}", file=sys.stderr)
        except URLError as error:
            print(f"[{timestamp}] Gagal konek: {error.reason}", file=sys.stderr)
        except TimeoutError:
            print(f"[{timestamp}] Request timeout", file=sys.stderr)

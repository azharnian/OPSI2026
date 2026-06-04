#!/usr/bin/env python3
from sensor_simulator.config import parse_args
from sensor_simulator.runner import SensorWorker


def main():
    SensorWorker(parse_args()).run()


if __name__ == "__main__":
    main()

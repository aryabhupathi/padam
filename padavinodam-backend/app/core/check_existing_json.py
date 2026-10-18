# -*- coding: utf-8 -*-
import sys
import os
import json

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from app.core.verify_puzzle_integrity import verify_puzzle

for name in ["verified_5x5.json", "verified_7x7.json", "verified_9x9.json", "verified_11x11.json", "verified_12x12.json"]:
    path = os.path.join(os.path.dirname(__file__), name)
    if os.path.exists(path):
        data = json.load(open(path, 'r', encoding='utf-8'))
        ok, errs = verify_puzzle(data)
        na = len(data.get("clues", {}).get("across", []))
        nd = len(data.get("clues", {}).get("down", []))
        size = data.get("size")
        mask = data.get("mask", [])
        white = sum(row.count(True) for row in mask)
        tot = size * size
        print(f"=== {name} (size {size}x{size}) ===")
        print(f"  Clues: {na} across, {nd} down (total {na+nd})")
        print(f"  Letters: {white}/{tot} ({white/tot*100:.1f}%)")
        print(f"  Integrity ok: {ok}, errors: {len(errs)}")
        if not ok:
            for e in errs[:5]:
                print(f"    - {e}")

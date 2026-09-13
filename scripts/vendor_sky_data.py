#!/usr/bin/env python3
import csv
import io
import json
import pathlib
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
OUT = ROOT / "data"
OUT.mkdir(exist_ok=True)

WESTERN_URL = "https://raw.githubusercontent.com/Stellarium/stellarium-skycultures/master/western/index.json"
STARS_URL = "https://raw.githubusercontent.com/devtx-labs-kr/aidlc-workshop-stargazer/main/data/stars.csv"

TARGETS = {
    "polaris": {"iau": "UMi", "hip": 11767},
    "canopus": {"iau": "Car", "hip": 30438},
    "acrux": {"iau": "Cru", "hip": 60718},
    "sirius": {"iau": "CMa", "hip": 32349},
    "fomalhaut": {"iau": "PsA", "hip": 113368},
    "spica": {"iau": "Vir", "hip": 65474},
    "vega": {"iau": "Lyr", "hip": 91262},
    "capella": {"iau": "Aur", "hip": 24608},
    "arcturus": {"iau": "Boo", "hip": 69673},
    "rigel": {"iau": "Ori", "hip": 24436},
    "antares": {"iau": "Sco", "hip": 80763},
    "betelgeuse": {"iau": "Ori", "hip": 27989},
    "hamal": {"iau": "Ari", "hip": 9884},
    "deneb": {"iau": "Cyg", "hip": 102098},
    "algol": {"iau": "Per", "hip": 14576},
    "alpheratz": {"iau": "And", "hip": 677},
}


def get_text(url):
    req = urllib.request.Request(url, headers={"User-Agent": "KUAAA-Stellar16-data-vendor"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode("utf-8")


def line_hips(lines):
    out = set()
    for line in lines:
        for item in line:
            if isinstance(item, int):
                out.add(item)
    return out


western = json.loads(get_text(WESTERN_URL))
needed_iau = {v["iau"] for v in TARGETS.values()}
selected = []
hips = {v["hip"] for v in TARGETS.values()}
for c in western.get("constellations", []):
    if c.get("iau") in needed_iau:
        entry = {
            "id": c.get("id"),
            "iau": c.get("iau"),
            "common_name": c.get("common_name"),
            "lines": c.get("lines", []),
        }
        selected.append(entry)
        hips.update(line_hips(entry["lines"]))

if {c["iau"] for c in selected} != needed_iau:
    missing = needed_iau - {c["iau"] for c in selected}
    raise SystemExit(f"Missing Stellarium constellations: {sorted(missing)}")

western_out = {
    "id": "western-stellar16",
    "source": "Stellarium western sky culture",
    "license": "CC BY-SA",
    "constellations": selected,
}
(OUT / "western-stellar16.json").write_text(
    json.dumps(western_out, ensure_ascii=False, separators=(",", ":")),
    encoding="utf-8",
)

stars_text = get_text(STARS_URL)
reader = csv.DictReader(io.StringIO(stars_text))
rows = []
for row in reader:
    try:
        hip = int(row.get("hip") or 0)
    except ValueError:
        continue
    if hip in hips:
        rows.append(row)
found = {int(r["hip"]) for r in rows}
missing = hips - found
if missing:
    raise SystemExit(f"Missing HYG/HIP rows: {sorted(missing)}")

fieldnames = reader.fieldnames
buf = io.StringIO(newline="")
writer = csv.DictWriter(buf, fieldnames=fieldnames, lineterminator="\n")
writer.writeheader()
writer.writerows(sorted(rows, key=lambda r: int(r["hip"])))
(OUT / "stars-stellar16.csv").write_text(buf.getvalue(), encoding="utf-8")

print(f"Wrote {len(selected)} constellations and {len(rows)} stars")

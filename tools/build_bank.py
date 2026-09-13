"""bank.bin = gzip(JSON)  —  run fetch_bank.py then normalize.py first."""
import json, gzip, os
bank = json.load(open("bank.json"))
raw = json.dumps(bank, ensure_ascii=False, separators=(",", ":")).encode()
open("bank.bin", "wb").write(gzip.compress(raw, 9))
print(len(bank), "questions ->", round(os.path.getsize("bank.bin")/1e6, 2), "MB")

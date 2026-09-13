import json, re, ast, gzip, base64, sys
import xml.etree.ElementTree as ET
from collections import Counter

MML="http://www.w3.org/1998/Math/MathML"

import html as _html
_ENT=re.compile(r'&([a-zA-Z][a-zA-Z0-9]*);')
def _numeric_entities(s):
    def rep(m):
        ch=_html.unescape(m.group(0))
        if ch==m.group(0): return '&amp;'+m.group(1)+';'
        return ''.join('&#%d;'%ord(c) for c in ch)
    return _ENT.sub(rep, s)

def fix_mfenced(mathblob):
    """Chrome's MathML Core dropped <mfenced>. Rewrite to <mrow><mo>(</mo>..<mo>)</mo></mrow>."""
    orig=mathblob
    blob=_numeric_entities(mathblob)
    if 'xmlns' not in blob[:200]:
        blob=re.sub(r'^<math\b', '<math xmlns="http://www.w3.org/1998/Math/MathML"', blob, count=1)
    try:
        root=ET.fromstring(blob)
    except ET.ParseError:
        return orig
    def strip_ns(t): return t.split('}',1)[1] if '}' in t else t
    def walk(parent):
        for i,ch in enumerate(list(parent)):
            walk(ch)
            if strip_ns(ch.tag)=='mfenced':
                op=ch.get('open','('); cl=ch.get('close',')')
                seps=ch.get('separators',',')
                row=ET.Element(f'{{{MML}}}mrow')
                mo=ET.SubElement(row,f'{{{MML}}}mo'); mo.text=op
                kids=list(ch)
                for k,kid in enumerate(kids):
                    row.append(kid)
                    if k<len(kids)-1 and seps:
                        s=ET.SubElement(row,f'{{{MML}}}mo')
                        s.text=seps[k] if k<len(seps) else seps[-1]
                mo2=ET.SubElement(row,f'{{{MML}}}mo'); mo2.text=cl
                if ch.text and ch.text.strip():
                    mo.tail=ch.text
                parent.remove(ch); parent.insert(i,row)
                row.tail=ch.tail
    walk(root)
    ET.register_namespace('', MML)
    return ET.tostring(root, encoding='unicode')

MATH_RE=re.compile(r'<math\b.*?</math>', re.S|re.I)
def clean(html):
    if not html: return ""
    s=str(html)
    if 'mfenced' in s:
        s=MATH_RE.sub(lambda m: fix_mfenced(m.group(0)), s)
    return s.strip()

def parse_ans(c):
    a=c.get('correct_answer')
    if a is None: a=c.get('keys')
    if isinstance(a,list): return [str(x) for x in a]
    if isinstance(a,str):
        try:
            v=ast.literal_eval(a)
            return [str(x) for x in v] if isinstance(v,(list,tuple)) else [str(v)]
        except Exception:
            return [a]
    return []

raw=json.load(open('raw.json'))
out=[]; skipped=Counter()
for m in raw:
    c=m.get('content') or {}
    if '_error' in c: skipped['fetch_error']+=1; continue
    if not m.get('external_id'): skipped['legacy_ibn']+=1; continue
    if 'stem' not in c: skipped['no_stem']+=1; continue
    opts=[clean(o.get('content')) for o in (c.get('answerOptions') or [])]
    qtype=(c.get('type') or ('mcq' if opts else 'spr')).lower()
    ans=parse_ans(c)
    if not ans: skipped['no_answer']+=1; continue
    rat=clean(c.get('rationale'))
    if not rat: skipped['no_rationale']+=1; continue
    out.append({
        "id": m["questionId"],
        "eid": m["external_id"],
        "sec": m["_test"],                       # 1=RW 2=Math
        "dom": m["primary_class_cd"],
        "domName": m["primary_class_cd_desc"],
        "sk": (m.get("skill_desc") or "").strip(),
        "skc": m.get("skill_cd"),
        "df": m.get("difficulty"),
        "bd": m.get("score_band_range_cd"),
        "ty": qtype,
        "sti": clean(c.get('stimulus')),
        "ste": clean(c.get('stem')),
        "op": opts,
        "an": ans,
        "ra": rat,
    })

# normalize the one skill-name typo variant
for q in out:
    if q["sk"]=="Cross-text Connections": q["sk"]="Cross-Text Connections"
    q["sk"]=re.sub(r'\s+',' ',q["sk"]).strip()

print("kept:",len(out),"skipped:",dict(skipped))
print("by section:",Counter(q['sec'] for q in out))
print("types:",Counter(q['ty'] for q in out))
print("bands:",dict(sorted(Counter(q['bd'] for q in out).items(), key=lambda kv:(kv[0] is None,kv[0]))))
print("mfenced remaining:", sum(1 for q in out if 'mfenced' in (q['sti']+q['ste']+q['ra']+''.join(q['op']))))
json.dump(out, open('bank.json','w'), ensure_ascii=False, separators=(',',':'))
js=json.dumps(out,ensure_ascii=False,separators=(',',':')).encode('utf-8')
gz=gzip.compress(js,9)
b64=base64.b64encode(gz).decode()
open('bank.b64','w').write(b64)
print(f"raw json {len(js)/1e6:.1f} MB -> gzip {len(gz)/1e6:.1f} MB -> b64 {len(b64)/1e6:.1f} MB")

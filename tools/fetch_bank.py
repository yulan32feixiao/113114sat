import json, urllib.request, concurrent.futures, threading, sys, time
BASE="https://qbank-api.collegeboard.org/msreportingquestionbank-prod/questionbank/digital/"
def post(path, payload, tries=4):
    for a in range(tries):
        try:
            req=urllib.request.Request(BASE+path, data=json.dumps(payload).encode(),
                headers={"Content-Type":"application/json","User-Agent":"Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=45) as r:
                return json.loads(r.read().decode())
        except Exception as e:
            if a==tries-1: raise
            time.sleep(1.5*(a+1))
DOMAINS=[(1,"INI"),(1,"CAS"),(1,"EOI"),(1,"SEC"),(2,"H"),(2,"P"),(2,"Q"),(2,"S")]
meta=[]
for t,d in DOMAINS:
    lst=post("get-questions",{"asmtEventId":99,"test":t,"domain":d})
    for it in lst: it["_test"]=t
    meta.extend(lst); print(f"{d}: {len(lst)}", flush=True)
print("meta total", len(meta), flush=True)
lock=threading.Lock(); out=[]; done=[0]
def grab(m):
    eid = m.get("external_id") or m.get("ibn")   # ibn IS the external_id value
    try:
        c=post("get-question",{"external_id":eid})
    except Exception as e:
        c={"_error":str(e)}
    m["content"]=c
    with lock:
        out.append(m); done[0]+=1
        if done[0]%250==0: print("fetched",done[0],flush=True)
with concurrent.futures.ThreadPoolExecutor(max_workers=12) as ex:
    list(ex.map(grab, meta))
json.dump(out, open("raw.json","w"))
err=sum(1 for m in out if "_error" in m.get("content",{}))
print("DONE", len(out), "errors", err)

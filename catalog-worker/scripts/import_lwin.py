"""Read the supplied XLSX without Excel; create a fresh SQLite catalog and D1 SQL chunks.
No network requests. Never modifies the source workbook or overwrites an existing database.
"""
import argparse, collections, datetime, hashlib, json, pathlib, re, sqlite3, unicodedata, zipfile
import xml.etree.ElementTree as ET

NS='{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
def clean(value):
    value=str(value or '').strip()
    return '' if value in ('NA','N/A','NULL') else value
def normalize(value):
    value=value.casefold().replace('œ','oe').replace('æ','ae').replace('ß','ss')
    return ' '.join(re.findall(r'[^\W_]+',''.join(c for c in unicodedata.normalize('NFKD',value) if not unicodedata.combining(c)),re.UNICODE))
def rows(filename):
    with zipfile.ZipFile(filename) as z:
        strings=[]
        if 'xl/sharedStrings.xml' in z.namelist():
            for _,el in ET.iterparse(z.open('xl/sharedStrings.xml'),events=('end',)):
                if el.tag==NS+'si':
                    strings.append(''.join(t.text or '' for t in el.iter(NS+'t')));el.clear()
        book=ET.fromstring(z.read('xl/workbook.xml'))
        sheet=next(s for s in book.find(NS+'sheets') if s.attrib.get('name')=='LWINdatabase')
        rid=sheet.attrib['{http://schemas.openxmlformats.org/officeDocument/2006/relationships}id']
        rels=ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        target=next(r.attrib['Target'] for r in rels if r.attrib['Id']==rid)
        target=target.lstrip('/') if target.startswith('/') else 'xl/'+target
        with z.open(target) as stream:
            for _,el in ET.iterparse(stream,events=('end',)):
                if el.tag!=NS+'row':continue
                result=['']*22
                for c in el:
                    if c.tag!=NS+'c':continue
                    col=0
                    for letter in re.match('[A-Z]+',c.attrib['r'])[0]:col=col*26+ord(letter)-64
                    v=c.find(NS+'v');value=v.text if v is not None else ''
                    if c.attrib.get('t')=='s':value=strings[int(value)] if value else ''
                    elif c.attrib.get('t')=='inlineStr':value=''.join(t.text or '' for t in c.iter(NS+'t'))
                    if col<=22:result[col-1]=value or ''
                yield result
                el.clear()
def sqlval(v):
    if v is None:return 'NULL'
    if isinstance(v,int):return str(v)
    return "'"+str(v).replace("'","''")+"'"
def main():
    p=argparse.ArgumentParser();p.add_argument('xlsx');p.add_argument('--out',required=True);a=p.parse_args()
    out=pathlib.Path(a.out).resolve();out.mkdir(parents=True,exist_ok=True)
    dbfile=out/'catalog.sqlite';
    if dbfile.exists():raise SystemExit('Output database already exists. Choose a new output folder for this catalog version.')
    schema=(pathlib.Path(__file__).resolve().parents[1]/'schema.sql').read_text()
    db=sqlite3.connect(dbfile);db.executescript(schema)
    source=rows(a.xlsx);headers=next(source)
    if headers[0]!='LWIN' or headers[16]!='VINTAGE_CONFIG':raise SystemExit('Unexpected workbook columns; import stopped.')
    count=0;active=0;terms=collections.Counter();statuses=collections.Counter();types=collections.Counter();configs=collections.Counter();samples=[]
    stmt='INSERT INTO catalog VALUES('+','.join('?'*17)+')'
    for row in source:
        if not row[0]:continue
        raw=dict(zip(headers,row));r={k:clean(v) for k,v in raw.items()};lwin=str(int(float(r['LWIN'])))
        if len(lwin)!=7:raise ValueError('Unexpected LWIN identifier length: '+lwin)
        def year(key):
            v=r[key]
            return int(float(v)) if re.fullmatch(r'\d{4}(\.0)?',v) and 1000<=int(float(v))<=2200 else None
        name=r['DISPLAY_NAME'];producer=' '.join(filter(None,[r['PRODUCER_TITLE'],r['PRODUCER_NAME']]))
        search=normalize(' '.join([name,producer,r['WINE'],r['COUNTRY'],r['REGION'],r['SUB_REGION']]))
        values=(lwin,r['STATUS'],name,producer,r['WINE'],r['COUNTRY'],r['REGION'],r['SUB_REGION'],r['COLOUR'],r['TYPE'],r['SUB_TYPE'],r['VINTAGE_CONFIG'],year('FIRST_VINTAGE'),year('FINAL_VINTAGE'),r['REFERENCE'],r['DATE_UPDATED'],search)
        cursor=db.execute(stmt,values);count+=1;statuses[r['STATUS']]+=1;types[r['TYPE']]+=1
        if r['STATUS']=='Live' and r['TYPE'] in ('Wine','Fortified Wine'):
            active+=1;configs[r['VINTAGE_CONFIG']]+=1
            db.execute('INSERT INTO wine_search(rowid,search_text) VALUES(?,?)',(cursor.lastrowid,search))
            terms.update(set(t for t in search.split() if len(t)>=4 and not t.isdigit()))
            if len(samples)<5:samples.append({'lwin':lwin,'name':name})
        if count%50000==0:print(f'Read {count:,} catalog entries',flush=True)
    db.executemany('INSERT INTO search_terms VALUES(?,?,?)',[(t,t[:2],n) for t,n in terms.items()])
    meta={'source':'LWIN © Liv-ex','source_url':'https://www.liv-ex.com/lwin/','workbook_sha256':hashlib.sha256(pathlib.Path(a.xlsx).read_bytes()).hexdigest(),'imported_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'total_records':count,'searchable_wines':active,'statuses':dict(statuses),'types':dict(types),'vintage_configs':dict(configs)}
    db.executemany('INSERT INTO catalog_meta VALUES(?,?)',[(k,json.dumps(v) if not isinstance(v,str) else v) for k,v in meta.items()]);db.commit()
    # D1 imports regular tables first, then bounded FTS inserts. No writable_schema or transaction wrappers.
    (out/'000-schema.sql').write_text(schema,encoding='utf-8')
    part=1
    for table,select in [('catalog','SELECT * FROM catalog ORDER BY rowid'),('search_terms','SELECT * FROM search_terms'),('catalog_meta','SELECT * FROM catalog_meta')]:
        batch=[]
        for record in db.execute(select):
            batch.append('INSERT INTO '+table+' VALUES('+','.join(sqlval(v) for v in record)+');\n')
            if len(batch)>=4000:
                (out/f'{part:03}-{table}.sql').write_text(''.join(batch),encoding='utf-8');batch=[];part+=1
        if batch:(out/f'{part:03}-{table}.sql').write_text(''.join(batch),encoding='utf-8');part+=1
    batch=[]
    for rowid,search in db.execute("SELECT rowid,search_text FROM catalog WHERE status='Live' AND type IN ('Wine','Fortified Wine')"):
        batch.append('INSERT INTO wine_search(rowid,search_text) VALUES('+str(rowid)+','+sqlval(search)+');\n')
        if len(batch)>=4000:(out/f'{part:03}-search.sql').write_text(''.join(batch),encoding='utf-8');batch=[];part+=1
    if batch:(out/f'{part:03}-search.sql').write_text(''.join(batch),encoding='utf-8')
    (out/'manifest.json').write_text(json.dumps(meta,indent=2),encoding='utf-8');db.execute('PRAGMA optimize');db.close()
    print(json.dumps({**meta,'database_bytes':dbfile.stat().st_size,'sql_files':len(list(out.glob('*.sql')))},indent=2),flush=True)
if __name__=='__main__':main()

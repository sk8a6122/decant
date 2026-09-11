from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import json,os
os.chdir(Path(__file__).resolve().parents[2])
class Handler(SimpleHTTPRequestHandler):
 def do_GET(self):
  if self.path=='/catalog-config.js':
   self.send_response(200);self.send_header('Content-Type','text/javascript');self.end_headers();self.wfile.write(b'window.DECANT_CATALOG_URL="http://127.0.0.1:8767";');return
  if self.path.startswith('/v1/wines?'):
   data={'items':[{'lwin':'test-barolo','displayName':'Marchesi di Barolo, Barolo','name':'Marchesi di Barolo, Barolo','producer':'Marchesi di Barolo','region':'Piedmont','country':'Italy','colour':'Red','style':'Red'}], 'vintageHint':'2019'}
   self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(json.dumps(data).encode());return
  super().do_GET()
ThreadingHTTPServer(('127.0.0.1',8767),Handler).serve_forever()

"""Run against `npm run dev -- --local --ip 127.0.0.1 --port 8787`."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import build_opener, HTTPRedirectHandler, urlopen
from urllib.error import HTTPError
from urllib.parse import urljoin, urlsplit
import json
import re

ROOT = Path(__file__).resolve().parents[3]
BASE = 'http://127.0.0.1:8787'

class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, *args):
        return None

class Page(HTMLParser):
    def __init__(self, text):
        super().__init__()
        self.ids, self.links = [], []
        self.feed(text)
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'a':
            self.links.append(attrs['href'])

def fetch(path):
    try:
        response = build_opener(NoRedirect).open(BASE + path)
    except HTTPError as error:
        response = error
    return response.status, response.headers, response.read()

expected = {
    '/': (200, 'index.html'),
    '/links': (200, 'links.html'),
    '/links/': (307, None),
    '/links.html': (307, None),
    '/not-a-page': (404, '404.html'),
    '/study/': (200, 'study/index.html'),
    '/service-agent-patterns': (200, 'service-agent-patterns.html'),
    '/api/chat': (405, None),
}
for path, (status, filename) in expected.items():
    actual, headers, body = fetch(path)
    assert actual == status, (path, actual)
    if filename:
        assert body == (ROOT / 'public' / filename).read_bytes(), path
    if status == 307:
        assert urlsplit(headers['Location']).path == '/links'
        with urlopen(BASE + path) as response:
            assert response.status == 200
            assert response.read() == (ROOT / 'public/links.html').read_bytes()
    print(f'PASS {path}: {actual}' + (f' -> {headers["Location"]}' if status == 307 else ''))

hub = Page((ROOT / 'public/links.html').read_text())
assert len(hub.ids) == len(set(hub.ids)), 'duplicate IDs'
internal = 0
for href in hub.links:
    if urlsplit(href).scheme or urlsplit(href).netloc:
        continue
    url = urlsplit(urljoin(BASE + '/links', href))
    with urlopen(BASE + url.path) as response:
        page = Page(response.read().decode())
        assert response.status == 200
        if url.fragment:
            assert url.fragment in page.ids, href
    internal += 1
print(f'PASS {internal} internal links and fragment targets')

index = (ROOT / 'public/index.html').read_text()
entity = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', index, re.S)[1])
for item in entity['@graph']:
    if item['@type'] == 'Person':
        assert 'https://www.linkedin.com/in/hemayethossain/' in item['sameAs']
        assert 'https://www.linkedin.com/company/hossain-consulting' not in item['sameAs']
    if item['@type'] == 'ProfessionalService':
        assert 'https://www.linkedin.com/company/hossain-consulting' in item['sameAs']
print('PASS structured data parses and separates personal/agency LinkedIn identities')

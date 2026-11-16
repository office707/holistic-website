"""Prepare exact Dutch BAG coordinates via PDOK for the Google overview map.

This sends street addresses and postal codes to PDOK. Run only after the data
owner explicitly authorises that destination and export. It does not retrieve
Google reviews or replace the Google map provider. No API keys are used here.
"""
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import argparse
import json
import re
import threading
import time
import unicodedata
import urllib.parse
import urllib.request

ROOT = Path(__file__).resolve().parents[1]
ENDPOINT = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free'


def normalize(value):
    value = unicodedata.normalize('NFKD', str(value or ''))
    return re.sub(r'[^a-z0-9]', '', value.encode('ascii', 'ignore').decode().lower())


def address_parts(profile):
    postcode = normalize(profile.get('postalCode')).upper()
    if not re.fullmatch(r'[1-9]\d{3}[A-Z]{2}', postcode):
        return None
    match = re.fullmatch(r'(.+?)\s+(\d+)\s*([A-Za-z]?)', profile.get('address', '').strip())
    if not match:
        return None
    street, number, letter = match.groups()
    return postcode, normalize(street), str(int(number)), letter.lower()


def exact_match(docs, parts):
    postcode, street, number, letter = parts
    matches = [doc for doc in docs if normalize(doc.get('straatnaam')) == street and normalize(doc.get('postcode')).upper() == postcode and str(doc.get('huisnummer')) == number and normalize(doc.get('huisletter')) == letter and not normalize(doc.get('huisnummertoevoeging'))]
    if len(matches) != 1:
        return None
    doc = matches[0]
    point = re.fullmatch(r'POINT\(([-\d.]+) ([-\d.]+)\)', doc.get('centroide_ll', ''))
    if not point:
        return None
    lng, lat = map(float, point.groups())
    if not (50 <= lat <= 54 and 3 <= lng <= 8):
        return None
    return {'lat': lat, 'lng': lng, 'sourceId': doc['id']}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--allow-pdok-export', action='store_true', help='Confirm that the data owner explicitly authorised transmitting addresses to PDOK')
    parser.add_argument('--cache', type=Path, default=Path('/tmp/norbu-pdok-address-cache.json'))
    args = parser.parse_args()
    if not args.allow_pdok_export:
        parser.error('No addresses sent. Obtain explicit data-owner authorisation before using --allow-pdok-export.')
    source = (ROOT / 'practitioners-data.js').read_text()
    profiles = json.loads(source[source.index('['):source.rindex(']') + 1])
    cache = json.loads(args.cache.read_text()) if args.cache.exists() else {}
    unique = {parts for profile in profiles if (parts := address_parts(profile))}
    pending = [parts for parts in sorted(unique) if '|'.join(parts) not in cache]
    lock = threading.Lock()
    next_request = [0.0]

    def locate(parts):
        postcode, street, number, letter = parts
        params = [('fq', 'type:adres'), ('fq', f'postcode:{postcode}'), ('fq', f'huisnummer:{number}'), ('rows', '100'), ('fl', 'id,straatnaam,huisnummer,huisletter,huisnummertoevoeging,postcode,centroide_ll')]
        url = ENDPOINT + '?' + urllib.parse.urlencode(params)
        error = None
        for attempt in range(3):
            with lock:
                delay = max(0, next_request[0] - time.monotonic())
                next_request[0] = max(time.monotonic(), next_request[0]) + .35
            if delay:
                time.sleep(delay)
            try:
                request = urllib.request.Request(url, headers={'User-Agent': 'NorbuCompass-AddressPreparation/1.0 (https://norbu-compass.com)'})
                with urllib.request.urlopen(request, timeout=15) as response:
                    docs = json.loads(response.read())['response']['docs']
                return '|'.join(parts), exact_match(docs, parts), None
            except Exception as exc:
                error = str(exc)
                if attempt < 2:
                    time.sleep(1 + attempt)
        return '|'.join(parts), None, error

    print(f'{len(profiles)} profiles; {len(unique)} distinct complete addresses; {len(pending)} lookups remaining', flush=True)
    errors = []
    with ThreadPoolExecutor(max_workers=3) as pool:
        for i, future in enumerate(as_completed([pool.submit(locate, parts) for parts in pending]), 1):
            key, result, error = future.result()
            if error:
                errors.append((key, error))
            else:
                cache[key] = result
            if i % 40 == 0 or i == len(pending):
                args.cache.write_text(json.dumps(cache))
                print(f'Checked {i}/{len(pending)}; {sum(bool(v) for v in cache.values())} exact matches; {len(errors)} request errors', flush=True)
    locations = {}
    for profile in profiles:
        parts = address_parts(profile)
        if parts and (location := cache.get('|'.join(parts))):
            locations[profile['id']] = location
    payload = {'source': 'PDOK Locatieserver / BAG', 'sourceUrl': 'https://www.pdok.nl/introductie/-/article/basisregistratie-adressen-en-gebouwen-ba-1', 'totalProfiles': len(profiles), 'locations': locations}
    (ROOT / 'practitioner-locations.js').write_text('// Exact address matches from the Dutch BAG register via PDOK.\nwindow.norbuPracticeLocations = ' + json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + ';\n')
    print(f'Finished: {len(locations)}/{len(profiles)} profiles placed; {len(errors)} request errors.', flush=True)
    if errors:
        print('Request errors are not cached and can be retried.', flush=True)


if __name__ == '__main__':
    main()

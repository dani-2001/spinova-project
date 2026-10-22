import sys
import json
import requests

BASE = 'http://127.0.0.1:8000/api'
file_path = 'backend/media/studies/18.dcm'

print('Uploading file:', file_path)
with open(file_path, 'rb') as f:
    files = {'image': ('18.dcm', f, 'application/dicom')}
    r = requests.post(f'{BASE}/studies/', files=files)
    print('upload status', r.status_code)
    try:
        print('upload response', r.json())
    except Exception:
        print('upload body:', r.text)
    if not r.ok:
        sys.exit(1)
    study = r.json()
    study_id = study.get('id')

print('Calling detect-levels for study', study_id)
r = requests.get(f'{BASE}/studies/{study_id}/detect-levels/')
print('detect status', r.status_code)
print('detect body', r.json())
if not r.ok:
    sys.exit(1)
levels = r.json().get('levels', [])

print('Calling predict with detected levels')
r = requests.post(f'{BASE}/studies/{study_id}/predict/', json={'detected_levels': levels})
print('predict status', r.status_code)
try:
    print(json.dumps(r.json(), indent=2))
except Exception:
    print('predict body:', r.text)
    sys.exit(1)

print('smoke test done')

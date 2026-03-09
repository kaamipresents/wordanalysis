import urllib.request
import json
import ssl

url = "http://localhost:5000/api/analytics/analyze"
data = json.dumps({"text": "Apple banana orange test text"}).encode('utf-8')
headers = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer test-token'
}

req = urllib.request.Request(url, data=data, headers=headers, method='POST')

try:
    with urllib.request.urlopen(req) as response:
        print("Status Code:", response.getcode())
        print("Response:", response.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", str(e))

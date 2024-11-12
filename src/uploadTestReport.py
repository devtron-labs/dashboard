import requests 

# token
TOKEN = ''
URL = 'https://slack.com/api/files.upload'
filepath = '../report.txt'
file = open(filepath,"r") 
content = file.read()
file.close()
data = dict(token=TOKEN, filename="test-summary.txt", content=content, channels=['dashboard-test-report'])
resp = requests.post(URL, data=data)
if resp.status_code == 200:
   print(resp.json())
else:
   print("Request failed:", resp.status_code, resp.reason)

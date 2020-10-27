import json
import sys

files={}
warnings=0
f=None
try:
    f=open('build-log','r')
except Exception as e:
    print('build-log file not found')
    sys.exit(1)

currentFile=None
for line in f.readlines():
    line=line.strip()
    if line.startswith('./src'):
        currentFile=line
    else:
        if not line.startswith('Line'):
            continue
        tokens=line.split(" ")
        if len(tokens) <= 1:
            continue
        line_number=tokens[1]
        error=tokens[-1]
        try:
            files[currentFile][error].append(line_number)
        except Exception as e:
            try:
                files[currentFile][error]=[line_number]
            except Exception as e2:
                files[currentFile]={error:[line_number]}
        finally:
            warnings = warnings + 1
print(json.dumps({'total_warnings': warnings, 'result':files}))

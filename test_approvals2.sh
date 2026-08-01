#!/bin/bash
set -e
URL=https://hcrtkzvdsoektpotetvx.supabase.co
KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcnRrenZkc29la3Rwb3RldHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTI0MDMsImV4cCI6MjEwMDg4ODQwM30.T4cdCCc_lXucTRC6DgdT4-vyfrc-spsM1IzvfvRiyN8

EMAIL="head-qa-1785430015@wellness.local"
PW="HeadQA2025!"

echo "=== Reject the test head admin ==="
TOKEN=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"email":"wellness1@smail.iitm.ac.in","password":"0&nMlqX3&yFkkHVx"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
user_id=$(curl -s -X GET "$URL/rest/v1/profiles?email=eq.$EMAIL&select=id" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
curl -s -X PATCH "$URL/rest/v1/profiles?id=eq.$user_id" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"rejected"}'

echo "=== Verify profile is rejected ==="
status=$(curl -s "$URL/rest/v1/profiles?id=eq.$user_id&select=status" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['status'])")
echo "Status: $status"

echo "=== Test student registration ==="
reg_email="student-register-demo@wellness.local"
reg_payload=$(python3 -c "import json; print(json.dumps({'email':'$reg_email','password':'StudentDemo1!','role':'student','full_name':'Demo Student','student_id':'DEMO2026002','phone':'+91 98765 43210'}))")
reg=$(curl -s -X POST "$URL/functions/v1/register" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d "$reg_payload")
echo "Registration response: $reg"

echo "=== Clean up registration test profile ==="
reg_id=$(echo "$reg" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user_id',''))")
if [ -n "$reg_id" ]; then
  curl -s -X DELETE "$URL/rest/v1/profiles?id=eq.$reg_id" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN"
fi

echo "=== Clean up head admin test profile ==="
curl -s -X DELETE "$URL/rest/v1/profiles?id=eq.$user_id" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN"

echo "=== Done ==="

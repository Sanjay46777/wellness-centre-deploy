#!/bin/bash
set -e
URL=https://hcrtkzvdsoektpotetvx.supabase.co
KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcnRrenZkc29la3Rwb3RldHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTI0MDMsImV4cCI6MjEwMDg4ODQwM30.T4cdCCc_lXucTRC6DgdT4-vyfrc-spsM1IzvfvRiyN8

echo "=== 1. Register new head admin via Edge Function ==="
EMAIL="head-qa-1785430015@wellness.local"
PW="HeadQA2025!"
reg_resp=$(curl -s -X POST "$URL/functions/v1/register" -H "apikey: $KEY" -H "Authorization: Bearer $KEY" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\",\"role\":\"head_counsellor\",\"full_name\":\"QA Head Admin\",\"phone\":\"+91 98765 43210\"}")
echo "$reg_resp" | python3 -m json.tool || true

uid=$(echo "$reg_resp" | python3 -c "import sys,json; print(json.load(sys.stdin).get('user_id',''))")
if [ -z "$uid" ]; then echo "Registration failed"; exit 1; fi
echo "Registered user id: $uid"

echo "=== 2. Verify profile status is pending ==="
TOKEN=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"email":"wellness1@smail.iitm.ac.in","password":"0&nMlqX3&yFkkHVx"}' | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
status=$(curl -s "$URL/rest/v1/profiles?id=eq.$uid&select=status" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['status'])")
echo "Profile status: $status"

echo "=== 3. Approve head admin via admin ==="
appr=$(curl -s -X PATCH "$URL/rest/v1/profiles?id=eq.$uid" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"approved"}')
echo "Approval response length: ${#appr}"

echo "=== 4. Verify approved head admin can login ==="
head_token=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $KEY" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\"}" | python3 -c "import sys,json; print(json.load(sys.stdin).get('access_token','FAILED'))")
echo "Head admin token: ${head_token:0:30}..."

echo "=== 5. Verify rejected head admin is blocked (simulate rejection) ==="
# Reject the same user to test blocked status
curl -s -X PATCH "$URL/rest/v1/profiles?id=eq.$uid" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"status":"rejected"}'
reject_login=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $KEY" -H "Content-Type: application/json" -d "{\"email\":\"$EMAIL\",\"password\":\"$PW\"}")
echo "Rejected login response: $(echo "$reject_login" | python3 -c "import sys,json; print('OK' if 'access_token' in json.load(sys.stdin) else json.load(sys.stdin))")

echo "=== 6. Clean up: delete test head admin account ==="
# Delete the profile first (auth admin requires service key, can't delete from here)
curl -s -X DELETE "$URL/rest/v1/profiles?id=eq.$uid" -H "apikey: $KEY" -H "Authorization: Bearer $TOKEN"
echo "Test complete"

#!/bin/bash
set -e
URL=https://hcrtkzvdsoektpotetvx.supabase.co
KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcnRrenZkc29la3Rwb3RldHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTI0MDMsImV4cCI6MjEwMDg4ODQwM30.T4cdCCc_lXucTRC6DgdT4-vyfrc-spsM1IzvfvRiyN8

echo "=== 1. Admin login ==="
admin_resp=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"email":"wellness1@smail.iitm.ac.in","password":"0&nMlqX3&yFkkHVx"}')
admin_token=$(echo "$admin_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "Admin token: ${admin_token:0:20}..."

echo "=== 2. Create test counsellor ==="
new_resp=$(curl -s -X POST "$URL/rest/v1/counsellors" -H "apikey: $KEY" -H "Authorization: Bearer $admin_token" -H "Content-Type: application/json" -d '{"name":"QA Test Counsellor","designation":"Team QA","email":"qa@wellness.local"}' -H "Prefer: return=representation")
new_id=$(echo "$new_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
echo "Created counsellor id: $new_id"

echo "=== 3. Update test counsellor ==="
up_resp=$(curl -s -X PATCH "$URL/rest/v1/counsellors?id=eq.$new_id" -H "apikey: $KEY" -H "Authorization: Bearer $admin_token" -H "Content-Type: application/json" -d '{"specialization":"QA Specialization"}')
echo "Update response: ${#up_resp} bytes"

echo "=== 4. Delete test counsellor ==="
del_resp=$(curl -s -X DELETE "$URL/rest/v1/counsellors?id=eq.$new_id" -H "apikey: $KEY" -H "Authorization: Bearer $admin_token")
echo "Delete response: ${#del_resp} bytes"

echo "=== 5. Student login ==="
stu_resp=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"email":"student-demo@wellness.local","password":"StudentDemo1!"}')
stu_token=$(echo "$stu_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "Student token: ${stu_token:0:20}..."

echo "=== 6. Counsellors list (authenticated) ==="
curl -s "$URL/rest/v1/counsellors?select=id,name,designation&limit=3" -H "apikey: $KEY" -H "Authorization: Bearer $stu_token" | python3 -c "import sys,json; print('count:', len(json.load(sys.stdin)))"

echo "=== 7. Head admin login ==="
head_resp=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"email":"wo@smail.iitm.ac.in","password":"6hxkTs&1*CuE&ot@"}')
head_token=$(echo "$head_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
echo "Head admin token: ${head_token:0:20}..."

echo "=== QA complete ==="

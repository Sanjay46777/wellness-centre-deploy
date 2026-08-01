#!/bin/bash
set -e
URL=https://hcrtkzvdsoektpotetvx.supabase.co
KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjcnRrenZkc29la3Rwb3RldHZ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUzMTI0MDMsImV4cCI6MjEwMDg4ODQwM30.T4cdCCc_lXucTRC6DgdT4-vyfrc-spsM1IzvfvRiyN8

echo "=== Student login ==="
stu_resp=$(curl -s -X POST "$URL/auth/v1/token?grant_type=password" -H "apikey: $KEY" -H "Content-Type: application/json" -d '{"email":"student-demo@wellness.local","password":"StudentDemo1!"}')
stu_token=$(echo "$stu_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")
stu_id=$(echo "$stu_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)['user']['id'])")

echo "=== Get active counsellor ==="
cid=$(curl -s "$URL/rest/v1/counsellors?select=id&is_active=eq.true&limit=1" -H "apikey: $KEY" -H "Authorization: Bearer $stu_token" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
echo "Counsellor id: $cid"

echo "=== Submit test feedback ==="
fb_resp=$(curl -s -X POST "$URL/rest/v1/feedback" -H "apikey: $KEY" -H "Authorization: Bearer $stu_token" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"user_id\":\"$stu_id\",\"counsellor_id\":\"$cid\",\"q1_comfort\":4,\"q2_understood\":5,\"q3_time\":4,\"q4_quality\":5,\"q5_respected\":5,\"q6_supported\":4,\"q7_hopeful\":5,\"q8_safe\":5,\"q9_communication\":4,\"q10_overall\":5,\"comments\":\"QA test feedback\",\"is_anonymous\":false}")
fb_id=$(echo "$fb_resp" | python3 -c "import sys,json; print(json.load(sys.stdin)[0]['id'])")
echo "Feedback id: $fb_id"

echo "=== Delete test feedback ==="
curl -s -X DELETE "$URL/rest/v1/feedback?id=eq.$fb_id" -H "apikey: $KEY" -H "Authorization: Bearer $stu_token"
echo "Deleted"

echo "=== Feedback submission QA complete ==="

#!/bin/bash

echo "=============================================="
echo "       TOOL DAY CODE LEN CA 2 GIT SERVER"
echo "=============================================="
# chmod +x push.sh
# Lấy tham số đầu vào làm message nếu có
msg="$1"

# Nếu không truyền tham số, sẽ hiện nhắc nhở nhập
if [ -z "$msg" ]; then
    read -p "Nhap noi dung ghi chu (nhan Enter de dung mac dinh 'Update code'): " msg
fi

# Nếu ấn Enter không nhập gì, gán mặc định
if [ -z "$msg" ]; then
    msg="Update code"
fi

echo ""
echo "[+] Buoc 1: Add tat ca thay doi..."
git add .

echo ""
echo "[+] Buoc 2: Tao commit voi noi dung: \"$msg\""
git commit -m "$msg"

echo ""
echo "[+] Buoc 3: Day len server cu (Origin)..."
git push origin HEAD

echo ""
echo "[+] Buoc 4: Day len Github (Github)..."
git push github HEAD

echo ""
echo "=============================================="
echo "               DA DAY THANH CONG!"
echo "=============================================="

@echo off
echo ==============================================
echo        TOOL DAY CODE LEN CA 2 GIT SERVER
echo ==============================================

rem Lay tham so dau vao lam message neu co
set msg=%~1

rem Neu khong truyen tham so, se hien nhac nho nhap
if "%msg%"=="" (
    set /p msg="Nhap noi dung ghi chu (nhan Enter de dung mac dinh 'Update code'): "
)

rem Neu an Enter khong nhap gi, gan mac dinh
if "%msg%"=="" set msg=Update code

echo.
echo [+] Buoc 1: Add tat ca thay doi...
git add .

echo.
echo [+] Buoc 2: Tao commit voi noi dung: "%msg%"
git commit -m "%msg%"

echo.
echo [+] Buoc 3: Day len server cu (Origin)...
git push origin HEAD

echo.
echo [+] Buoc 4: Day len Github (Github)...
git push github HEAD

echo.
echo ==============================================
echo               DA DAY THANH CONG!
echo ==============================================
pause

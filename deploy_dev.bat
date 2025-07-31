@echo off
echo Dang ket noi toi server...

ssh -o StrictHostKeyChecking=no root@49.13.117.14 ^
    "cd /home/sources/9prx-private-cms-be && git checkout dev && git pull && yarn install && yarn build && pm2 restart analysis-9proxy-backend"

echo Trien khai hoan tat!
pause

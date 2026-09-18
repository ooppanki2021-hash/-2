#!/bin/bash
set -e

echo "=== 1. Сборка Web-приложения GitHub Lite ==="
cd /home/user/github-lite
npm run build

echo "=== 2. Копирование скомпилированных файлов в Android Assets ==="
mkdir -p /home/user/apk-build/assets/dist
rm -rf /home/user/apk-build/assets/dist/*
cp -r /home/user/github-lite/dist/* /home/user/apk-build/assets/dist/

echo "=== 3. Генерация иконки GitHub ==="
python3 /home/user/make_github_final.py

echo "=== 4. Компиляция R.java и Java-кода Android ==="
cd /home/user/apk-build
rm -rf gen/* build/* bin/*
mkdir -p gen build bin

aapt package -f -m -J gen/ -M AndroidManifest.xml -S res/ -I /home/user/android-tools/android.jar

javac -encoding UTF-8 -cp /home/user/android-tools/android.jar \
  -d build \
  gen/com/githublite/app/R.java \
  src/com/githublite/app/MainActivity.java

echo "=== 5. Преобразование Java байткода в Dalvik DEX (D8) ==="
java -cp /home/user/android-tools/d8.jar com.android.tools.r8.D8 \
  --lib /home/user/android-tools/android.jar \
  --output bin/ \
  $(find build -name "*.class")

echo "=== 6. Создание базового APK пакета ==="
aapt package -f -m -F bin/app.unsigned.apk \
  -M AndroidManifest.xml \
  -S res/ \
  -I /home/user/android-tools/android.jar \
  -A assets/

cd bin
aapt add app.unsigned.apk classes.dex
cd ..

echo "=== 7. Оптимизация и выравнивание (Zipalign) ==="
zipalign -v -p 4 bin/app.unsigned.apk bin/app.aligned.apk

echo "=== 8. Подписание APK (Apksigner) ==="
apksigner sign --ks debug.keystore \
  --ks-pass pass:android \
  --ks-key-alias androiddebugkey \
  --key-pass pass:android \
  --out /home/user/github-lite.apk \
  bin/app.aligned.apk

mkdir -p /home/user/github-lite/public /home/user/github-lite/dist
cp /home/user/github-lite.apk /home/user/github-lite/public/github-lite.apk

echo "=== 9. Создание полного архива github-apk.zip ==="
cd /home/user
rm -f github-apk.zip
zip -r github-apk.zip \
  github-lite \
  apk-build \
  android-tools \
  github-lite.apk \
  build-github.sh \
  ИНСТРУКЦИЯ_ANDROID.md \
  -x "*/node_modules/*" "*/.git/*" "*/dist/*" "*/build/*" "*/bin/*" "*github-apk.zip*"

echo "✅ Сборка GitHub Lite с официальной иконкой успешно завершена!"
ls -lh /home/user/github-lite.apk /home/user/github-apk.zip

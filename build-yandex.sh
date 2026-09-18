#!/bin/bash
set -e

echo "=== 1. Сборка Web-приложения Яндекс Вебмастер Lite ==="
cd /home/user/yandex-webmaster-lite
npm run build

echo "=== 2. Копирование скомпилированных файлов в Android Assets ==="
mkdir -p /home/user/yandex-apk-build/assets/dist
rm -rf /home/user/yandex-apk-build/assets/dist/*
cp -r /home/user/yandex-webmaster-lite/dist/* /home/user/yandex-apk-build/assets/dist/

echo "=== 3. Компиляция R.java и Java-кода Android ==="
cd /home/user/yandex-apk-build
rm -rf gen/* build/* bin/*
mkdir -p gen build bin

aapt package -f -m -J gen/ -M AndroidManifest.xml -S res/ -I /home/user/android-tools/android.jar

javac -encoding UTF-8 -cp /home/user/android-tools/android.jar \
  -d build \
  gen/com/yandexwebmaster/app/R.java \
  src/com/yandexwebmaster/app/MainActivity.java

echo "=== 4. Преобразование Java байткода в Dalvik DEX (D8) ==="
java -cp /home/user/android-tools/d8.jar com.android.tools.r8.D8 \
  --lib /home/user/android-tools/android.jar \
  --output bin/ \
  $(find build -name "*.class")

echo "=== 5. Создание базового APK пакета ==="
aapt package -f -m -F bin/app.unsigned.apk \
  -M AndroidManifest.xml \
  -S res/ \
  -I /home/user/android-tools/android.jar \
  -A assets/

cd bin
aapt add app.unsigned.apk classes.dex
cd ..

echo "=== 6. Оптимизация и выравнивание (Zipalign) ==="
zipalign -v -p 4 bin/app.unsigned.apk bin/app.aligned.apk

echo "=== 7. Подписание APK (Apksigner) ==="
apksigner sign --ks debug.keystore \
  --ks-pass pass:android \
  --ks-key-alias androiddebugkey \
  --key-pass pass:android \
  --out /home/user/yandex-webmaster.apk \
  bin/app.aligned.apk

# Also copy to web public & dist so user can download directly from web interface
mkdir -p /home/user/yandex-webmaster-lite/public /home/user/yandex-webmaster-lite/dist
cp /home/user/yandex-webmaster.apk /home/user/yandex-webmaster-lite/public/yandex-webmaster.apk
cp /home/user/yandex-webmaster.apk /home/user/yandex-webmaster-lite/dist/yandex-webmaster.apk

echo "=== 8. Создание полного архива yandex-webmaster-apk.zip ==="
cd /home/user
rm -f yandex-webmaster-apk.zip
zip -r yandex-webmaster-apk.zip \
  yandex-webmaster-lite \
  yandex-apk-build \
  android-tools \
  yandex-webmaster.apk \
  build-yandex.sh \
  ИНСТРУКЦИЯ_ЯНДЕКС_ВЕБМАСТЕР.md \
  -x "*/node_modules/*" "*/.git/*" "*/dist/*" "*/build/*" "*/bin/*" "*yandex-webmaster-apk.zip*"

echo "✅ Сборка успешно завершена!"
ls -lh /home/user/yandex-webmaster.apk /home/user/yandex-webmaster-apk.zip

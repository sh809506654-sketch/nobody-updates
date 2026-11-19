#!/usr/bin/env python3
# Робить маленький пакет «лише код» з повного zip NOBODY:
# бере NOBODY.app/Contents/Resources/app/** і кладе як app/** (права і посилання зберігаються).
# Також друкує версію Electron з повного zip (для поля appOnly.electron у latest.json).
# Використання: scripts/make-app-only.py <повний.zip> <вихідний-app-only.zip>
import sys, zipfile, plistlib

src, out = sys.argv[1], sys.argv[2]
PREFIX = 'NOBODY.app/Contents/Resources/'
FW_PLIST = 'NOBODY.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Resources/Info.plist'
n = 0
with zipfile.ZipFile(src) as zin, zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as zout:
    names = zin.namelist()
    electron = ''
    if FW_PLIST in names:
        electron = plistlib.loads(zin.read(FW_PLIST)).get('CFBundleVersion', '')
    for info in zin.infolist():
        if not info.filename.startswith(PREFIX + 'app/'):
            continue
        z = zipfile.ZipInfo(info.filename[len(PREFIX):], info.date_time)
        z.create_system = info.create_system
        z.external_attr = info.external_attr
        data = zin.read(info)
        is_link = ((info.external_attr >> 16) & 0o170000) == 0o120000
        z.compress_type = zipfile.ZIP_STORED if (is_link or info.filename.endswith('/')) else zipfile.ZIP_DEFLATED
        zout.writestr(z, data)
        n += 1
if n == 0 or 'app/package.json' not in zipfile.ZipFile(out).namelist():
    sys.exit('У zip немає NOBODY.app/Contents/Resources/app')
print(electron)

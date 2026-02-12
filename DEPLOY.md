# cPanel deployment package

برای جلوگیری از مشکل "Binary files are not supported" در PR، فایل ZIP در Git commit نمی‌شود.

## ساخت ZIP نهایی

از ریشه پروژه اجرا کنید:

```bash
bash scripts/build_cpanel_zip.sh
```

خروجی:
- `bersad-dist-cpanel.zip` (برای آپلود در `public_html`)
- `ZIP_CONTENTS.txt` (فهرست فایل‌های داخل ZIP برای review در PR)

## آپلود در cPanel
1. فایل `bersad-dist-cpanel.zip` را در `public_html` آپلود کنید.
2. روی فایل، Extract بزنید.
3. فایل ZIP را حذف کنید.
4. مطمئن شوید `.htaccess` در `public_html` باقی مانده است.

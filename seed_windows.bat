@echo off
chcp 65001 > nul
REM ============================================================
REM ACHROMATIC — Seed Data Import Script (Windows)
REM ============================================================

SET PGCLIENTENCODING=UTF8

REM === Sửa thông tin kết nối nếu cần ===
SET PGHOST=localhost
SET PGPORT=5432
SET PGUSER=postgres
SET PGDATABASE=web_fashion

echo === ACHROMATIC SEED DATA ===
echo Database: %PGDATABASE% @ %PGHOST%:%PGPORT%
echo.

echo [0/6] Creating database schema (tables + enums)...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f "d:/Nhap/web-fashion/sql.sql"
if %ERRORLEVEL% NEQ 0 (
  echo ERROR: Schema creation failed. Check connection settings.
  pause
  exit /b 1
)

echo [1/6] Importing foundation data (categories, brands, products)...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f "d:/Nhap/web-fashion/seed_achromatic.sql"

echo [2/6] Importing product variants (300)...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f "d:/Nhap/web-fashion/seed_variants.sql"

echo [3/6] Importing inventory...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f "d:/Nhap/web-fashion/seed_inventory.sql"

echo [4/6] Importing users and addresses...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f "d:/Nhap/web-fashion/seed_users.sql"

echo [5/6] Importing orders, coupons, banners...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f "d:/Nhap/web-fashion/seed_orders.sql"

echo [6/6] Importing reviews, wishlists, carts...
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -f "d:/Nhap/web-fashion/seed_reviews_wishlists.sql"

echo.
echo === Summary ===
psql -U %PGUSER% -h %PGHOST% -p %PGPORT% -d %PGDATABASE% -c ^
"SELECT table_name, (SELECT count(*) FROM information_schema.tables WHERE table_name=t.table_name) FROM information_schema.tables t WHERE table_schema='public' ORDER BY table_name LIMIT 20;"

echo.
echo Done! Press any key...
pause

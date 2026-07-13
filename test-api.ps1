# API Test Script for Achromatic Backend
# Run this to verify all endpoints are working

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   ACHROMATIC API TEST SUITE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3001/api"

# Test 1: Products
Write-Host "[TEST 1] Products List..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products?limit=5" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✓ Products API working" -ForegroundColor Green
    Write-Host "  Total: $($json.data.meta.total) products" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Products API failed" -ForegroundColor Red
    Write-Host "  Error: $_" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Product Detail
Write-Host "[TEST 2] Product Detail..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products/low-top-sneaker-navy" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    $product = $json.data
    Write-Host "✓ Product Detail API working" -ForegroundColor Green
    Write-Host "  Product: $($product.name)" -ForegroundColor Gray
    Write-Host "  Price: $($product.basePrice) VND" -ForegroundColor Gray
    Write-Host "  Variants: $($product.variants.Count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Product Detail API failed" -ForegroundColor Red
    Write-Host ""
}

# Test 3: Categories
Write-Host "[TEST 3] Categories..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/categories" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✓ Categories API working" -ForegroundColor Green
    Write-Host "  Total: $($json.data.Count) categories" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Categories API failed" -ForegroundColor Red
    Write-Host ""
}

# Test 4: Brands
Write-Host "[TEST 4] Brands..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/brands" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✓ Brands API working" -ForegroundColor Green
    Write-Host "  Total: $($json.data.Count) brands" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Brands API failed" -ForegroundColor Red
    Write-Host ""
}

# Test 5: Banners
Write-Host "[TEST 5] Banners..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/banners" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✓ Banners API working" -ForegroundColor Green
    Write-Host "  Total: $($json.data.Count) banners" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Banners API failed" -ForegroundColor Red
    Write-Host ""
}

# Test 6: Product Filters
Write-Host "[TEST 6] Filter Options..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/products/filters" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    $filters = $json.data
    Write-Host "✓ Filters API working" -ForegroundColor Green
    Write-Host "  Colors: $($filters.colors.Count)" -ForegroundColor Gray
    Write-Host "  Sizes: $($filters.sizes.Count)" -ForegroundColor Gray
    Write-Host "  Brands: $($filters.brands.Count)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Filters API failed" -ForegroundColor Red
    Write-Host ""
}

# Test 7: Collections
Write-Host "[TEST 7] Collections..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/collections" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✓ Collections API working" -ForegroundColor Green
    Write-Host "  Total: $($json.data.Count) collections" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Collections API failed" -ForegroundColor Red
    Write-Host ""
}

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   TEST SUMMARY" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend URL: $baseUrl" -ForegroundColor White
Write-Host "Frontend URL: http://localhost:3000" -ForegroundColor White
Write-Host "Swagger Docs: $baseUrl/docs" -ForegroundColor White
Write-Host ""
Write-Host "✓ All critical endpoints tested!" -ForegroundColor Green
Write-Host ""
Write-Host "Next: Open http://localhost:3000 in browser to test UI" -ForegroundColor Cyan
Write-Host ""

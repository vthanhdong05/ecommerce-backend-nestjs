$body = '{"email":"superAdmin@vtdhub.com","password":"superadmin123"}'
$resp = Invoke-RestMethod -Method POST -Uri 'http://localhost:8888/api/auth/sign-in' -ContentType 'application/json' -Body $body
$t = $resp.data.accessToken
Write-Host "TOKEN length: $($t.Length)"

$headers = @{ Authorization = "Bearer $t" }

Write-Host "=== vendors/options (no params) ==="
try {
    $r = Invoke-WebRequest -Headers $headers -Uri 'http://localhost:8888/api/vendors/options' -Method GET
    Write-Host "HTTP: $($r.StatusCode)"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "HTTP: $code"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Body: $body"
    }
}

Write-Host "=== categories/options (no params) ==="
try {
    $r = Invoke-WebRequest -Headers $headers -Uri 'http://localhost:8888/api/categories/options' -Method GET
    Write-Host "HTTP: $($r.StatusCode)"
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Host "HTTP: $code"
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host "Body: $body"
    }
}
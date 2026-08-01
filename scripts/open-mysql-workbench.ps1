# Open MySQL Workbench and start the MySQL service if needed
# Run this script in PowerShell as Administrator

$serviceName = "MySQL80"
$workbenchPath = "C:\Program Files\MySQL\MySQL Workbench 8.0\MySQLWorkbench.exe"

# Check if MySQL service exists and start it
$service = Get-Service | Where-Object { $_.Name -like "*mysql*" } | Select-Object -First 1
if ($service) {
    if ($service.Status -ne 'Running') {
        Write-Host "Starting MySQL service: $($service.Name) ..."
        Start-Service $service.Name
    } else {
        Write-Host "MySQL service is already running: $($service.Name)"
    }
} else {
    Write-Host "MySQL service not found. Please check your MySQL installation."
}

# Open MySQL Workbench
if (Test-Path $workbenchPath) {
    Write-Host "Opening MySQL Workbench..."
    Start-Process $workbenchPath
} else {
    Write-Host "MySQL Workbench not found at: $workbenchPath"
    Write-Host "Please check the installation path or update the workbenchPath variable in this script."
}

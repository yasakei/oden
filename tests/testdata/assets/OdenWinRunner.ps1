$Source = [IO.File]::ReadAllText("$PSScriptRoot\OdenWinRunner.cs")
$odenExePath = $args[0]
$scriptPath = $args[1]
$constraints = $args[2]
$timeout = 5000;
Add-Type -TypeDefinition $Source -Language CSharp
Write-Output("Running Oden script: " + $args[1])
$code = [OdenWinRunner]::RunOdenScript($odenExePath, $scriptPath, $constraints, $timeout)
Write-Output("Oden.exe or the test wrapper has exited with code: $code")
exit $code

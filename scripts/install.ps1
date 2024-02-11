<#
.SYNOPSIS
  Installs .exe on windows.

.PARAMETER force
  Optional. Override existing binary.
  Defaults to false

.PARAMETER tag
  Optional. Specify tag to install.
  Defaults to the latest version

.PARAMETER to
  Optional. Specify location to install the binary.
  Defaults to ~/bin/

.EXAMPLE
  install

.NOTES
  View help with
  Get-Help ./PATH_TO_SCRIPT -Detailed
#>


param(
  [Parameter(
    Mandatory=$false,
    ValueFromPipeline=$false,
    ValueFromPipelineByPropertyName=$true,
    HelpMessage="Force override existing binary in output location."
  )]
  [switch] $force,

  [Parameter(
    Mandatory=$false,
    ValueFromPipeline=$false,
    ValueFromPipelineByPropertyName=$true,
    HelpMessage="Specify TAG version to install. Defaults to latest version."
  )]
  [string] $tag = "",

  [Parameter(
    Mandatory=$false,
    ValueFromPipeline=$false,
    ValueFromPipelineByPropertyName=$true,
    HelpMessage="Specify install location."
  )]
  [string[]] $to = "$HOME\bin"
)

# Set up a trap (handler for when terminating errors occur).
Trap {
  if ($tempDir -and (Test-Path $tempDir -PathType Container)) {
    Remove-Item $tempDir -r -force
  }

  Write-Error $_ -ErrorAction Continue
  exit 1
}

$ErrorActionPreference = "Stop"


$cwd = $(Get-Location).Path


function checkError($cmdName) {
  if ($LASTEXITCODE -ne 0) {
    throw "${cmdName} failed with exit code ${LASTEXITCODE}"
  }
}

function require($cmdName) {
  try {
    Get-Command $cmdName -ErrorAction Stop > $null
  } catch {
    throw "${cmdName} cannot be found. Please ensure it is installed and available on your path."
  }
}

function toPath($p) {
  if (-Not ([IO.PATH]::IsPathRooted($p))) {
    $p = [IO.PATH]::GetFullPath(
      $(Join-Path -Path $cwd -ChildPath $p)
    )
  }

  if(-Not (Test-Path -Path $p -IsValid)) {
    throw "${p} is not a valid path."
  }

  return $p
}

require curl
require Expand-Archive

$to = toPath "${to}"

if((Test-Path $to) -and (-Not (Test-Path $to -PathType Container))) {
  throw "${to} exists and is not a directory."
}

$archive="scf_{PLATFORM}_{ARCH}{ARCHIVE_EXT}"
$repoUrl="https://github.com/dworthen/scf"
$releasesUrl="${repoUrl}/releases"
$downloadUrl="${releasesUrl}/download/{TAG}/${archive}"
$platformKey = "Windows"
$archKey = [Environment]::GetEnvironmentVariable('PROCESSOR_ARCHITECTURE')
$tempLocation = [Environment]::GetEnvironmentVariable('TEMP')

do {
  $tempDirName = [System.Guid]::NewGuid()
  $tempDir = Join-Path -Path $tempLocation -ChildPath $tempDirName
} while (Test-Path $tempDir)


$platformDict = @{ 
	Windows = "Windows"
  # Windows = "Windows"
}

$archDict = @{ 
	AMD64 = "x86_64"
  # windows_AMD64 = "x86_64"
}

if (-not $tag) {
  $latestReleaseInfo = $(curl -sSfLH "Accept: application/json" "${releasesUrl}/latest")
  checkError "curl ${releasesUrl}/latest"
  $jsonData = ConvertFrom-Json $latestReleaseInfo
  $tag = $jsonData.tag_name
}

if (-Not ($platformDict.ContainsKey($platformKey))) {
  throw "${platformKey} not supported."
} else {
  $platform = $platformDict[$platformKey]
}

if (-Not ($archDict.ContainsKey($archKey))) {
  throw "${archKey} not supported."
} else {
  $arch = $archDict[$archKey]
}

$downloadUrl = $downloadUrl.
  replace("{PLATFORM}", $platform).
  replace("{ARCH}", $arch).
  replace("{TAG}", $tag).
  replace("{ARCHIVE_EXT}", ".zip").
  replace("{BINARY_EXT}", ".exe")


$(New-Item -ItemType Directory $tempDir) > $null

if ($downloadUrl.EndsWith(".zip")) {
  $(curl -sSfL "${downloadUrl}" -o "${tempDir}/download.zip")
  checkError "curl ${downloadUrl}"
  $(Expand-Archive -Path "${tempDir}/download.zip" -DestinationPath $tempDir)
  checkError "Expand-Archive ${tempDir}/download.zip"
  Remove-Item "${tempDir}/download.zip" -force
}

if (-Not (Test-Path $to -PathType Container)) {
  $(New-Item $to -ItemType Directory) > $null
}

$contents = Get-ChildItem "${tempDir}/*" -Recurse

if ($force) {
  Get-ChildItem "${tempDir}/*" -Recurse | Move-Item -Force -Destination "${to}"
} else {
  Get-ChildItem "${tempDir}/*" -Recurse | Move-Item -Destination "${to}"
}

foreach ($p in $contents) {
  Write-Host "Wrote $([IO.PATH]::GetFileName($p)) to ${to}"
}

if ($tempDir -and (Test-Path $tempDir)) {
  Remove-Item $tempDir -r -force
}

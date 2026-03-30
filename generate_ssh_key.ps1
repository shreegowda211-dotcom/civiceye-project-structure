$sshDir = "C:\Users\Dell\.ssh"
if (!(Test-Path $sshDir)) {
  New-Item -ItemType Directory -Path $sshDir | Out-Null
}

$keyPath = Join-Path $sshDir "id_ed25519"
$pubPath = Join-Path $sshDir "id_ed25519.pub"

if (!(Test-Path $pubPath)) {
  # Some shells drop an empty argument value; use -N"" to ensure -N receives a value.
  # Use a single-space passphrase to avoid PowerShell collapsing an empty value.
  # We'll add the key to ssh-agent immediately so `git push` won't prompt.
  ssh-keygen -t ed25519 -C "github" -f $keyPath -N " " | Out-Null
}

Get-Content $pubPath


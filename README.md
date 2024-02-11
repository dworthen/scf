# SCF - Simple project and file scaffolding

## Installation

### NPM

```
npm install @d-dev/scf -g
```

### Binaries

#### Windows

```powershell
curl -sSfL https://raw.githubusercontent.com/dworthen/scf/main/scripts/install.ps1 | pwsh -Command -
```

or with additional flags:

```powershell
curl -sSfL https://raw.githubusercontent.com/dworthen/scf/main/scripts/install.ps1 -o install.ps1 &&
pwsh -File install.ps1 -force -tag v0.0.1 -to ~/bin &&
rm install.ps1
```

#### Linux/Darwin

```bash
curl -sSfL https://raw.githubusercontent.com/dworthen/scf/main/scripts/install.sh | bash
```

or with additional flags:

```bash
curl -sSfL https://raw.githubusercontent.com/dworthen/scf/main/scripts/install.sh | bash -s -- --force --tag v0.0.1 --to ~/bin
```

### From Source with [Go](https://go.dev/)

```bash
go install github.com/dworthen/scf@latest
```

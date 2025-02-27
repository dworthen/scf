#!/usr/bin/env bash

set -euo pipefail

archive=scf_{PLATFORM}_{ARCH}{ARCHIVE_EXT}
repoUrl=https://github.com/dworthen/scf
releasesUrl=$repoUrl/releases
downloadUrl=$releasesUrl/download/{TAG}/$archive


declare -A platformDict=(
	["Darwin"]="Darwin"
	["Linux"]="Linux"
    # ["Linux"]="Linux"
    # ["Darwin"]="Darwin"
)

declare -A archDict=(
    ["amd64"]="x86_64"
	["x86_64"]="x86_64"
    ["arm64"] = "arm64"
    ["aarch64"] = "arm64"
    # ["x86_64"]="x86_64"
)

help() {
  cat <<'EOF'
Install scf

USAGE:
    install [options]

FLAGS:
    -h, --help      Display this message
    -f, --force     Force overwriting an existing binary

OPTIONS:
    --tag TAG       Tag (version) of the binary to install, defaults to latest release
    --to LOCATION   Where to install the binary [default: ~/bin]
EOF
}


say() {
  echo "$@"
}

say_err() {
  say "$@" >&2
}

err() {
  if [ ! -z ${td-} ]; then
    rm -rf $td
  fi

  say_err "error: $@"
  exit 1
}

need() {
  if ! command -v $1 > /dev/null 2>&1; then
    err "need $1 (command not found)"
  fi
}

force=false
while test $# -gt 0; do
  case $1 in
    --force | -f)
      force=true
      ;;
    --help | -h)
      help
      exit 0
      ;;
    --tag)
      tag=$2
      shift
      ;;
    --to)
      dest=$2
      shift
      ;;
    *)
      ;;
  esac
  shift
done

# Dependencies
need curl
need install
need mkdir
need mktemp
need tar
need sed
need grep
need cut

if [ -z ${dest-} ]; then
  dest="$HOME/bin"
fi

if [ -z ${tag-} ]; then
  tag=$(curl -sSLH 'Accept: application/json' ${releasesUrl}/latest |
    sed -E 's/,/\n/gI' |
    grep tag_name |
    cut -d'"' -f4
  )
fi


platform=$(uname -s | cut -d- -f1)
arch=$(uname -m)

if [ ! ${platformDict[$platform]+_} ]; then
    err "$plaform not supported"
    exit 1
fi
platform=${platformDict[$platform]}

if [ ! ${archDict[$arch]+_} ]; then
    err "$arch not supported"
    exit 1
fi
arch=${archDict[$arch]}

downloadUrl=$(echo $downloadUrl |
    sed -E "s/\{PLATFORM\}/${platform}/g" |
    sed -E "s/\{ARCH\}/${arch}/g" |
    sed -E "s/\{TAG\}/${tag}/g" |
    sed -E "s/\{ARCHIVE_EXT\}/.tar.gz/g" |
    sed -E "s/\{BINARY_EXT\}//g"
)

say_err "Downloading $downloadUrl"

td=$(mktemp -d || mktemp -d -t tmp)

say_err "Temp dir: $td"

if [[ $downloadUrl = *.tar.gz ]]; then
    curl -sSL $downloadUrl | tar -C $td -xz
else
    curl -sSL: $downloadUrl -O $td
fi


for f in $(ls $td); do
  test -x $td/$f || continue

  if [ -e "$dest/$f" ] && [ $force = false ]; then
    err "$f already exists in $dest"
  else
    mkdir -p $dest
    install -m 755 $td/$f $dest
  fi
done

rm -rf $td

package lib

import (
	"fmt"
	"path/filepath"
	"strings"

	"github.com/dworthen/scf/internal/globals"
)

func IsLocalPath(path string) bool {
	return strings.HasPrefix(path, ".")
}

func GetRepoData(path string) (*globals.RepoData, error) {
	repoData := globals.RepoData{
		Repo:               "",
		SubDirectoryToCopy: ".",
		Ref:                "",
	}

	refPaths := strings.Split(path, "@")
	if len(refPaths) > 2 {
		return nil, fmt.Errorf("Invalid repo specifier. Expected single @ but got %s", path)
	}

	if len(refPaths) == 2 {
		repoData.Ref = refPaths[1]
	}

	paths := strings.Split(refPaths[0], "/")
	if len(paths) < 2 {
		return nil, fmt.Errorf("Path is not valid. Expecting OWNER/REPO</SUB/PATH> but got %s", path)
	}

	repoData.Repo = strings.Join(paths[0:2], "/")

	if len(paths) > 2 {
		repoData.SubDirectoryToCopy = filepath.FromSlash(strings.Join(paths[2:], "/"))
	}

	return &repoData, nil
}

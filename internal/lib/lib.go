package lib

import (
	"fmt"
	"path/filepath"
	"strings"
)

func IsLocalPath(path string) bool {
	return strings.HasPrefix(path, ".")
}

func GetRepoAndSubDirectory(path string) (string, string, error) {
	paths := strings.Split(path, "/")
	if len(paths) < 2 {
		return "", "", fmt.Errorf("Path is not valid. Expecting OWNER/REPO</SUB/PATH> but got %s", path)
	}

	repo := strings.Join(paths[0:2], "/")
	subDirectoryToCopy := ""

	if len(paths) > 2 {
		subDirectoryToCopy = strings.Join(paths[2:], "/")
	}

	return repo, filepath.FromSlash(subDirectoryToCopy), nil
}

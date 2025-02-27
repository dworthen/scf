package githubservice

import (
	"fmt"
	"path/filepath"
	"strings"
)

type RepoData struct {
	Repo               string
	SubDirectoryToCopy string
	Ref                string
}

func NewRepoData(source string) (*RepoData, error) {
	source = filepath.ToSlash(source)
	repoData := &RepoData{}

	refPaths := strings.Split(source, "@")
	if len(refPaths) > 2 {
		return nil, fmt.Errorf("Invalid repo specifier. Expected single @ but got %s", source)
	}

	if len(refPaths) == 2 {
		repoData.Ref = refPaths[1]
	}

	paths := strings.Split(refPaths[0], "/")
	if len(paths) < 2 {
		return nil, fmt.Errorf("Path is not valid. Expecting OWNER/REPO</SUB/PATH> but got %s", source)
	}

	repoData.Repo = strings.Join(paths[0:2], "/")

	if len(paths) > 2 {
		repoData.SubDirectoryToCopy = filepath.FromSlash(strings.Join(paths[2:], "/"))
	}

	return repoData, nil
}

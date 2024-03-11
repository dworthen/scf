package scaffolder

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/bmatcuk/doublestar/v4"
	"github.com/dworthen/scf/internal/githubservice"
	"github.com/dworthen/scf/internal/lib"
	"github.com/dworthen/scf/internal/prompts"
	"github.com/mailgun/raymond/v2"
)

type Scaffolder struct {
	Src              string
	Dest             string
	LocalProjectRoot string
	ContentsToCopy   string
	Repo             string
	CommitHash       string
}

func New(src string, dest string) (*Scaffolder, error) {
	scaffolder := Scaffolder{
		Src: src,
	}

	cwd, err := os.Getwd()
	if err != nil {
		return nil, err
	}

	scaffolder.Dest = filepath.Join(cwd, dest)

	if lib.IsLocalPath(src) {
		_, err := os.Stat(src)
		if err != nil {
			return nil, err
		}

		scaffolder.LocalProjectRoot = src
		scaffolder.ContentsToCopy = "."
	} else {
		err = setLocalPaths(&scaffolder)
		if err != nil {
			return nil, err
		}
		err = downloadArchive(&scaffolder)
		if err != nil {
			return nil, err
		}
	}

	return &scaffolder, nil
}

func setLocalPaths(scf *Scaffolder) error {

	repo, subDirectory, err := lib.GetRepoAndSubDirectory(scf.Src)
	if err != nil {
		return err
	}

	homeDir, err := os.UserHomeDir()
	if err != nil {
		return nil
	}

	commitHash, err := githubservice.GetCommit(repo)
	if err != nil {
		return err
	}

	repoPath := filepath.FromSlash(repo)

	scf.CommitHash = commitHash
	scf.Repo = repo
	scf.LocalProjectRoot = filepath.Join(homeDir, ".scf", "github", repoPath, commitHash)
	scf.ContentsToCopy = subDirectory

	return nil
}

func downloadArchive(scf *Scaffolder) error {
	return githubservice.DownloadArchive(scf.Repo, scf.CommitHash, scf.LocalProjectRoot)
}

func (scf *Scaffolder) Scaffold() error {
	source := filepath.Join(scf.LocalProjectRoot, scf.ContentsToCopy)

	fileInfo, err := os.Stat(source)
	if err != nil {
		return err
	}

	if fileInfo.Mode().IsRegular() {
		return copyFile(source, filepath.Join(scf.Dest, filepath.Base(source)), true, map[string]interface{}{})
	}

	if fileInfo.IsDir() {
		return copyDir(source, scf.Dest)
	}

	return nil
}

func copyFile(source string, dest string, parse bool, data map[string]interface{}) error {
	destination := dest
	if parse {
		dest = filepath.ToSlash(strings.TrimSuffix(dest, ".hbs"))

		dest, err := raymond.Render(dest, data)

		if err != nil {
			return err
		}

		if strings.Contains(destination, "//") || strings.HasSuffix(destination, "/") {
			return nil
		}
		destination = dest
	}

	destination = filepath.FromSlash(destination)

	sourceFile, err := os.ReadFile(source)
	if err != nil {
		return err
	}

	err = os.MkdirAll(filepath.Dir(destination), 0755)
	if err != nil {
		return err
	}

	var fileContents string
	ext := filepath.Ext(source)
	if parse && ext == ".hbs" {
		fileContents, err = raymond.Render(string(sourceFile), data)
		if err != nil {
			return err
		}
	} else {
		fileContents = string(sourceFile)
	}

	err = os.WriteFile(destination, []byte(fileContents), 0644)

	return err
}

func copyDir(source string, destination string) error {
	var data map[string]interface{}
	var files []prompts.FileConditions

	promptsFilePath := filepath.ToSlash(filepath.Join(source, "scf.config.json"))
	promptFileMatches, err := doublestar.FilepathGlob(promptsFilePath, doublestar.WithFilesOnly())
	if err != nil {
		return err
	}

	if len(promptFileMatches) > 0 {
		prompts, err := prompts.New(promptFileMatches[0])
		if err != nil {
			return err
		}
		data = prompts.Answers
		files = prompts.Files
	} else {
		data = map[string]interface{}{}
		files = []prompts.FileConditions{
			{Files: []string{"**/*"}},
		}
	}

	if len(files) == 0 {
		return fmt.Errorf("No files specified to scaffold")
	}

	matched := false

	for _, fileCondition := range files {
		workingDir := "./"
		if fileCondition.WorkingDirectory != "" {
			workingDir = fileCondition.WorkingDirectory
		}
		workingDir = filepath.Join(source, workingDir)
		workingDir = filepath.FromSlash(workingDir)

		includeGlob := ""
		excludeGlob := ""

		if fileCondition.Parse.Include != "" {
			filePattern := filepath.FromSlash(fileCondition.Parse.Include)
			fullSource := filepath.Join(workingDir, filePattern)
			includeGlob = filepath.ToSlash(fullSource)
		}

		if fileCondition.Parse.Exclude != "" {
			filePattern := filepath.FromSlash(fileCondition.Parse.Exclude)
			fullSource := filepath.Join(workingDir, filePattern)
			excludeGlob = filepath.ToSlash(fullSource)
		}

		for _, fileGlob := range fileCondition.Files {

			filePattern := filepath.FromSlash(fileGlob)
			fullSource := filepath.Join(workingDir, filePattern)
			fullSourceGlobPattern := filepath.ToSlash(fullSource)

			matches, err := doublestar.FilepathGlob(fullSourceGlobPattern, doublestar.WithFilesOnly())
			if err != nil {
				return err
			}

			if len(matches) > 0 {
				matched = true
			}

			for _, fullPath := range matches {
				relativePath, err := filepath.Rel(workingDir, fullPath)
				if err != nil {
					return err
				}

				if relativePath == "scf.config.json" {
					continue
				}

				parse := true
				if includeGlob != "" {
					parse, err = doublestar.Match(includeGlob, fullPath)
					if err != nil {
						return err
					}
				}

				if excludeGlob != "" {
					match, err := doublestar.Match(excludeGlob, fullPath)
					if err != nil {
						return err
					}
					parse = !match
				}

				err = copyFile(fullPath, filepath.Join(destination, relativePath), parse, data)
				if err != nil {
					return err
				}
			}
		}
	}

	if !matched {
		return fmt.Errorf("No files matched the provided globs to scaffold. Globs: %v, Directory: %s", files, source)
	}

	return nil
}

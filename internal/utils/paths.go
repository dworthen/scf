package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

func ToPath(path string) string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to load user home dir.")
		os.Exit(1)
	}
	return filepath.Clean(strings.ReplaceAll(path, "~", homeDir))
}

func JoinPaths(paths ...string) string {
	resolvedPaths := []string{}
	for _, path := range paths {
		resolvedPaths = append(resolvedPaths, ToPath(path))
	}
	return filepath.Clean(filepath.Join(resolvedPaths...))
}

func ToFullPath(path string) string {
	fullPath, err := filepath.Abs(ToPath(path))
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to get absolute path.")
		os.Exit(1)
	}
	return fullPath
}

func GetCWD() string {
	cwd, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error())
		os.Exit(1)
	}
	return ToFullPath(cwd)
}

func GetHomeDir() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		fmt.Fprintf(os.Stderr, err.Error())
		os.Exit(1)
	}
	return ToFullPath(homeDir)
}

func GetScfDirPath() string {
	return JoinPaths(GetHomeDir(), ".scf")
}

func GetLogsFilePath() string {
	return JoinPaths(GetScfDirPath(), "logs.json")
}

func GetTemplatesDirPath() string {
	return JoinPaths(GetScfDirPath(), "templates")
}

func GetArchiveDownloadDirPath() string {
	return JoinPaths(GetScfDirPath(), "archives")
}

func IsLocalPath(filePath string) bool {
	if strings.HasPrefix(filePath, ".") || strings.HasPrefix(filePath, "~") {
		return true
	}

	fullPath := ToFullPath(filePath)
	_, err := os.Stat(fullPath)
	if os.IsNotExist(err) {
		return false
	} else if err == nil {
		return true
	}

	return false
}

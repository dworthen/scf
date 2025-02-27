package main

import (
	"io"
	"os"
	"path/filepath"
)

func main() {

	mapping := map[string][]string{
		"dist/scf_windows_arm64_v8.0/scf.exe": {"js/win32-arm64/bin/scf.exe", "python/win32-arm64/src/python_scaffolder_win32_arm64/bin/scf.exe"},
		"dist/scf_windows_amd64_v1/scf.exe":   {"js/win32-x64/bin/scf.exe", "python/win32-x64/src/python_scaffolder_win32_x64/bin/scf.exe"},
		"dist/scf_darwin_arm64_v8.0/scf":      {"js/darwin-arm64/bin/scf", "python/darwin-arm64/src/python_scaffolder_darwin_arm64/bin/scf"},
		"dist/scf_darwin_amd64_v1/scf":        {"js/darwin-x64/bin/scf", "python/darwin-x64/src/python_scaffolder_darwin_x64/bin/scf"},
		"dist/scf_linux_arm64_v8.0/scf":       {"js/linux-arm64/bin/scf", "python/linux-arm64/src/python_scaffolder_linux_arm64/bin/scf"},
		"dist/scf_linux_amd64_v1/scf":         {"js/linux-x64/bin/scf", "python/linux-x64/src/python_scaffolder_linux_x64/bin/scf"},
	}

	cwd, err := os.Getwd()
	if err != nil {
		panic(err)
	}

	for src, destinations := range mapping {
		for _, dest := range destinations {
			srcPath := filepath.Join(cwd, src)
			destPath := filepath.Join(cwd, dest)
			destDir := filepath.Dir(destPath)

			err = os.RemoveAll(destDir)
			if err != nil {
				panic(err)
			}
			err = os.MkdirAll(destDir, 0755)
			if err != nil {
				panic(err)
			}

			sourceFile, err := os.Open(srcPath)
			if err != nil {
				panic(err)
			}

			destFile, err := os.Create(destPath)
			if err != nil {
				panic(err)
			}
			defer destFile.Close()
			_, err = io.Copy(destFile, sourceFile)
			if err != nil {
				panic(err)
			}
		}
	}

}

package archive

import (
	"archive/zip"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dworthen/scf/internal/iowriters"
)

func ExtractZip(archivePath string, destination string, progressWriterFunc iowriters.ProgressWriterFunc) error {
	err := os.MkdirAll(destination, 0755)
	if err != nil {
		return fmt.Errorf("Failed extracting archive. Error creating destination directory: %w", err)
	}

	zipReader, err := zip.OpenReader(archivePath)
	if err != nil {
		return fmt.Errorf("Failed extracting archive. Error opening archive: %s %w", archivePath, err)
	}

	totalFiles := len(zipReader.File)
	incAmount := 1.0 / float64(totalFiles)

	for _, file := range zipReader.File {
		rc, err := file.Open()
		if err != nil {
			return fmt.Errorf("Failed extracting archive. Error opening file: %s %w", file.Name, err)
		}

		path := filepath.Join(destination, getPath(file.Name))

		if file.FileInfo().IsDir() {
			err = os.MkdirAll(path, 0755)
			if err != nil {
				return fmt.Errorf("Failed extracting archive. Error creating directory: %s %w", path, err)
			}
			progressWriterFunc(incAmount)
		} else {
			err = os.MkdirAll(filepath.Dir(path), 0755)
			if err != nil {
				return fmt.Errorf("Failed extracting archive. Error creating directory: %s %w", filepath.Dir(path), err)
			}

			outFile, err := os.Create(path)
			if err != nil {
				return fmt.Errorf("Failed extracting archive. Error creating file: %s %w", path, err)
			}
			defer outFile.Close()

			_, err = outFile.ReadFrom(rc)
			if err != nil {
				return fmt.Errorf("Failed extracting archive. Error reading file: %s %w", path, err)
			}

			progressWriterFunc(incAmount)
			// err = outFile.Close()
			// if err != nil {
			// 	return fmt.Errorf("Failed extracting archive. Error closing file: %s %w", path, err)
			// }
		}
	}
	return nil
}

func getPath(path string) string {
	slashedPath := filepath.ToSlash(path)
	paths := strings.Split(slashedPath, "/")
	return filepath.FromSlash(strings.Join(paths[1:], "/"))
}

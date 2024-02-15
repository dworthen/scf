package githubservice

import (
	"archive/tar"
	"archive/zip"
	"compress/gzip"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"

	"github.com/dworthen/scf/internal/globals"
)

const apiUrl string = "https://api.github.com"

func getAuthHeader() string {
	if strings.TrimSpace(globals.GithubToken) != "" {
		return fmt.Sprintf("Bearer %s", globals.GithubToken)
	}
	ghToken := os.Getenv("SCF_GH_TOKEN")
	if strings.TrimSpace(ghToken) != "" {
		return fmt.Sprintf("Bearer %s", ghToken)
	}

	return ""
}

type commit struct {
	Sha string `json:"sha"`
}

type commitResponse = []commit

func GetCommit(repo string) (string, error) {
	requestUrl := fmt.Sprintf("%s/repos/%s/commits", apiUrl, repo)
	authHeader := getAuthHeader()

	request, err := http.NewRequest("GET", requestUrl, nil)
	if err != nil {
		return "", err
	}
	if authHeader != "" {
		request.Header.Set("Authorization", authHeader)
	}

	httpClient := &http.Client{}
	resp, err := httpClient.Do(request)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return "", fmt.Errorf("Error getting repo commit. Status Code: %d, Response: %#v", resp.StatusCode, resp)
	}

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	var commitData commitResponse
	err = json.Unmarshal(responseBody, &commitData)
	if err != nil {
		return "", nil
	}

	if len(commitData) == 0 {
		return "", fmt.Errorf("No commits found for %s", repo)
	}

	return commitData[0].Sha, nil
}

func DownloadArchive(repo string, commitHash string, destination string) error {
	fileInfo, err := os.Stat(destination)
	if err == nil {
		if fileInfo.IsDir() {
			return nil
		} else {
			return fmt.Errorf("%s exists but is not a directory", destination)
		}
	}

	archiveFormat := "tarball"
	archiveExtension := ".tar.gz"
	if runtime.GOOS == "windows" {
		archiveFormat = "zipball"
		archiveExtension = ".zip"
	}

	tempDir := os.TempDir()
	downloadDest := filepath.Join(tempDir, "scf", fmt.Sprintf("%s%s", commitHash, archiveExtension))
	requestUrl := fmt.Sprintf("%s/repos/%s/%s/%s", apiUrl, repo, archiveFormat, commitHash)
	authHeader := getAuthHeader()

	err = os.MkdirAll(filepath.Dir(downloadDest), 0755)
	if err != nil {
		return err
	}

	request, err := http.NewRequest("GET", requestUrl, nil)
	if err != nil {
		return err
	}
	if authHeader != "" {
		request.Header.Set("Authorization", authHeader)
	}

	httpClient := &http.Client{}
	resp, err := httpClient.Do(request)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != 200 {
		return fmt.Errorf("Error getting repo commit. Status Code: %d, Response: %#v", resp.StatusCode, resp)
	}

	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return err
	}

	err = os.WriteFile(downloadDest, responseBody, 0644)
	if err != nil {
		return err
	}

	if archiveFormat == "tarball" {
		return extractTarball(downloadDest, destination)
	} else {
		return extractZip(downloadDest, destination)
	}

}

func extractZip(src string, destination string) error {
	err := os.MkdirAll(destination, 0755)
	if err != nil {
		return err
	}

	uncompressedStream, err := zip.OpenReader(src)
	if err != nil {
		return fmt.Errorf("ExtractZip: NewReader failed %w", err)
	}

	for _, f := range uncompressedStream.File {
		rc, err := f.Open()
		if err != nil {
			return fmt.Errorf("ExtractZip: failed to open file %w", err)
		}

		path := filepath.Join(destination, getPath(f.Name))

		if f.FileInfo().IsDir() {
			err = os.MkdirAll(path, 0755)
			if err != nil {
				return fmt.Errorf("ExtractZip: failed to mkdir file %w", err)
			}
		} else {
			err = os.MkdirAll(filepath.Dir(path), 0755)
			if err != nil {
				return fmt.Errorf("ExtractZip: failed to mkdir file %w", err)
			}
			file, err := os.Create(path)
			if err != nil {
				return fmt.Errorf("ExtractZip: failed to open file %w", err)
			}

			_, err = io.Copy(file, rc)
			if err != nil {
				return fmt.Errorf("ExtractZip: failed to copy file %w", err)
			}
			file.Close()
			rc.Close()
		}
	}

	return nil
}

func extractTarball(src string, destination string) error {
	err := os.MkdirAll(destination, 0755)
	if err != nil {
		return err
	}

	file, err := os.Open(src)
	if err != nil {
		return err
	}

	uncompressedStream, err := gzip.NewReader(file)
	if err != nil {
		return fmt.Errorf("ExtractTarGz: NewReader failed %w", err)
	}

	tarReader := tar.NewReader(uncompressedStream)

	for {
		header, err := tarReader.Next()

		if err == io.EOF {
			break
		}

		if err != nil {
			return fmt.Errorf("ExtractTarGz: Next() failed: %w", err)
		}

		path := filepath.Join(destination, getPath(header.Name))

		switch header.Typeflag {
		case tar.TypeDir:
			if err := os.MkdirAll(path, 0755); err != nil {
				return fmt.Errorf("ExtractTarGz: Mkdir() failed: %w", err)
			}
		case tar.TypeReg:
			outFile, err := os.Create(path)
			if err != nil {
				return fmt.Errorf("ExtractTarGz: Create() failed: %w", err)
			}
			if _, err := io.Copy(outFile, tarReader); err != nil {
				return fmt.Errorf("ExtractTarGz: Copy() failed: %w", err)
			}
			err = outFile.Close()
			if err != nil {
				return fmt.Errorf("Failed to close file. %w", err)
			}

		default:
			fmt.Printf(
				"ExtractTarGz: unknown type %s\n", string(header.Typeflag))
		}

	}

	return os.Remove(src)
}

func getPath(path string) string {
	slashedPath := filepath.ToSlash(path)
	paths := strings.Split(slashedPath, "/")
	return filepath.FromSlash(strings.Join(paths[1:], "/"))
}

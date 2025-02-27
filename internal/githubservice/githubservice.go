package githubservice

import (
	"encoding/json"
	"fmt"
	"io"
	"log/slog"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/dworthen/scf/internal/cliflags"
	"github.com/dworthen/scf/internal/iowriters"
	"github.com/dworthen/scf/internal/utils"
)

const apiUrl string = "https://api.github.com"

func GetAuthHeader() string {
	if strings.TrimSpace(cliflags.GithubToken) != "" {
		return fmt.Sprintf("Bearer %s", cliflags.GithubToken)
	}
	return ""
}

type commit struct {
	Sha string `json:"sha"`
}

type commitResponse = []commit

func getSingleCommit(repo string, ref string) (string, error) {
	requestUrl := fmt.Sprintf("%s/repos/%s/commits/%s", apiUrl, repo, ref)
	authHeader := GetAuthHeader()

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

	var commitData commit
	err = json.Unmarshal(responseBody, &commitData)
	if err != nil {
		return "", nil
	}

	return commitData.Sha, nil
}

func GetCommit(repo string, ref string) (string, error) {
	if ref != "" {
		return getSingleCommit(repo, ref)
	}

	requestUrl := fmt.Sprintf("%s/repos/%s/commits", apiUrl, repo)
	authHeader := GetAuthHeader()

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

func DownloadArchive(repo string, commitHash string, progressWriterFunc iowriters.ProgressWriterFunc) (string, error) {
	archiveDir := utils.GetArchiveDownloadDirPath()
	stats, err := os.Stat(archiveDir)
	if err != nil && !os.IsNotExist(err) {
		return "", fmt.Errorf("Failed downloading archive. Error checking archive directory: %s %w", archiveDir, err)
	}
	if stats != nil && !stats.IsDir() {
		return "", fmt.Errorf("FAiled downloading archive. Archive directory is not a directory, %s", archiveDir)
	}
	err = os.MkdirAll(archiveDir, 0755)
	if err != nil {
		return "", fmt.Errorf("Failed downloading archive. Error creating archive directory: %w", err)
	}

	archivePath := filepath.Join(archiveDir, fmt.Sprintf("%s.zip", commitHash))
	stats, _ = os.Stat(archivePath)
	if stats != nil && !stats.IsDir() {
		return archivePath, nil
	}

	requestUrl := fmt.Sprintf("%s/repos/%s/zipball/%s", apiUrl, repo, commitHash)
	authHeader := GetAuthHeader()

	request, err := http.NewRequest("GET", requestUrl, nil)
	if err != nil {
		return "", err
	}
	request.Header.Set("Accept-Encoding", "None")
	request.Header.Set("Content-Encoding", "gzip")
	request.Header.Set("Accept", "application/vnd.github.raw+json")
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
		return "", fmt.Errorf("Failed downloading archive. Status Code: %d, Response: %#v", resp.StatusCode, resp)
	}

	slog.Info("Downloading archive", "url", requestUrl, "status", resp.Status, "Content-Length", resp.ContentLength)

	archiveFile, err := os.Create(archivePath)
	if err != nil {
		return "", fmt.Errorf("Failed downloading archive. Error creating archive file: %w", err)
	}
	defer archiveFile.Close()

	// GH API does not always return a content-length.
	if resp.ContentLength > 0 {
		total := int(resp.ContentLength)
		progressWriter := iowriters.NewProgressWriter(total, progressWriterFunc)
		_, err = io.Copy(archiveFile, io.TeeReader(resp.Body, progressWriter))
		if err != nil {
			return "", fmt.Errorf("Failed downloading archive. Error writing archive file: %w", err)
		}
	} else {
		_, err = io.Copy(archiveFile, resp.Body)
		if err != nil {
			return "", fmt.Errorf("Failed downloading archive. Error writing archive file: %w", err)
		}
		progressWriterFunc(100)
	}

	return archivePath, nil
}

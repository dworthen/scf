package sourceloader

import (
	"fmt"
	"os"
	"path/filepath"
	"time"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/dworthen/scf/internal/archive"
	"github.com/dworthen/scf/internal/githubservice"
	"github.com/dworthen/scf/internal/globals"
	"github.com/dworthen/scf/internal/iowriters"
	"github.com/dworthen/scf/internal/models/common"
	"github.com/dworthen/scf/internal/scfconfig"
	"github.com/dworthen/scf/internal/utils"
)

func LoadSourceCmd(source string, destination string) tea.Cmd {
	return func() tea.Msg {
		if !utils.IsLocalPath(source) {
			repoData, err := githubservice.NewRepoData(source)
			if err != nil {
				return common.ErrorMsg{Err: err}
			}
			commitHash, err := githubservice.GetCommit(repoData.Repo, repoData.Ref)
			if err != nil {
				return common.ErrorMsg{Err: err}
			}

			templatesPath := filepath.Clean(
				filepath.Join(
					utils.GetTemplatesDirPath(),
					filepath.FromSlash(repoData.Repo),
					commitHash,
				),
			)
			stats, _ := os.Stat(templatesPath)
			if stats != nil {
				if stats.IsDir() {
					source = filepath.Clean(filepath.Join(templatesPath, repoData.SubDirectoryToCopy))
					globals.Program.Send(SourceLoaderSetModelStateMsg{State: SourceLoaderModelStateLoadingPrompts})
				} else {
					return common.ErrorMsg{Err: fmt.Errorf("Template directory exists and is not a directory %s", templatesPath)}
				}
			} else {
				err = RemoveOldTemplates(templatesPath)
				if err != nil {
					return common.ErrorMsg{Err: err}
				}
				globals.Program.Send(SourceLoaderSetModelStateMsg{State: SourceLoaderModelStateDownloadingArchive})
				downloadedArchivePath, err := DownloadArchive(repoData.Repo, commitHash)
				if err != nil {
					return common.ErrorMsg{Err: err}
				}

				time.Sleep(2 * time.Second)
				globals.Program.Send(SourceLoaderSetModelStateMsg{State: SourceLoaderModelStateExtractingArchive})
				globals.Program.Send(SourceLoaderResetProgressMsg{})

				err = ExtractArchive(downloadedArchivePath, templatesPath)
				if err != nil {
					return common.ErrorMsg{Err: err}
				}

				time.Sleep(2 * time.Second)
				globals.Program.Send(SourceLoaderSetModelStateMsg{State: SourceLoaderModelStateLoadingPrompts})

				source = filepath.Clean(filepath.Join(templatesPath, repoData.SubDirectoryToCopy))
				time.Sleep(2 * time.Second)
			}

		}

		source := utils.ToFullPath(source)
		scfConfig, err := scfconfig.NewScfConfig(source)
		if err != nil {
			return common.ErrorMsg{Err: err}
		}

		return SourceLoaderFinishedMsg{
			Source:      source,
			Destination: destination,
			ScfConfig:   scfConfig,
		}

	}
}

func RemoveOldTemplates(templatesPath string) error {
	repoDir := filepath.Dir(templatesPath)
	err := os.RemoveAll(repoDir)
	if err != nil {
		return fmt.Errorf("Failed removing old templates: %w", err)
	}
	return nil
}

func DownloadArchive(repo string, commitHash string) (string, error) {
	var progressWriterFunc iowriters.ProgressWriterFunc = func(progress float64) {
		globals.Program.Send(SourceLoaderIncrementProgressMsg{Increment: progress})
	}

	downloadPath, err := githubservice.DownloadArchive(repo, commitHash, progressWriterFunc)
	if err != nil {
		return "", err
	}
	return downloadPath, nil
}

func ExtractArchive(archivePath string, destination string) error {
	var progressWriterFunc iowriters.ProgressWriterFunc = func(progress float64) {
		globals.Program.Send(SourceLoaderIncrementProgressMsg{Increment: progress})
	}

	err := archive.ExtractZip(archivePath, destination, progressWriterFunc)
	if err != nil {
		return fmt.Errorf("Failed extracting archive: %w", err)
	}
	// err = os.Remove(archivePath)
	// if err != nil {
	// 	return fmt.Errorf("Failed removing archive: %w", err)
	// }
	return nil
}

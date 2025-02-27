package scaffolder

import (
	"errors"
	"fmt"
	"log/slog"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"sync"

	"github.com/bmatcuk/doublestar/v4"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/dworthen/scf/internal/globals"
	"github.com/dworthen/scf/internal/iowriters"
	"github.com/dworthen/scf/internal/models/common"
	"github.com/dworthen/scf/internal/scfconfig"
	"github.com/dworthen/scf/internal/utils"
)

func ScaffolderSetCmd(source string, destination string, scfconfig *scfconfig.ScfConfig, formAnswers map[string]interface{}) tea.Cmd {
	return func() tea.Msg {
		return ScaffolderSetMsg{
			Source:      source,
			Destination: destination,
			ScfConfig:   scfconfig,
			FormAnswers: formAnswers,
		}
	}
}

func ScaffolderRunCommands(destination string, commands []*scfconfig.CommandsToRun) tea.Cmd {
	return func() tea.Msg {
		var stdioWriterFunc iowriters.StdioWriterFunc = func(output string) {
			globals.Program.Send(ScaffolderAppendCommandsOutputMsg{
				Output: output,
			})
		}
		stdioWriter := iowriters.NewStdioWriter(stdioWriterFunc)

		totalCommands := 0
		for _, commandInfo := range commands {
			totalCommands += len(commandInfo.PostScaffold)
		}
		incAmount := 1.0 / float64(totalCommands)

	outerloop:
		for _, commandInfo := range commands {
			directoryToRunIn := filepath.Clean(filepath.Join(destination, commandInfo.WorkingDirectory))
			stats, err := os.Stat(directoryToRunIn)
			if err != nil {
				return common.ErrorMsg{Err: err}
			}
			if !stats.IsDir() {
				err = fmt.Errorf("cmd: Working directory is not a directory")
				return common.ErrorMsg{Err: err}
			}
			for _, command := range commandInfo.PostScaffold {
				stdioWriterFunc(theme.Focused.Title.Render(command + "\n"))
				commandList := strings.Split(command, " ")
				cmd := exec.Command(commandList[0], commandList[1:]...)
				cmd.Dir = directoryToRunIn
				cmd.Stdout = stdioWriter
				cmd.Stderr = stdioWriter
				err = cmd.Run()
				if err != nil {
					stdioWriterFunc(theme.Focused.ErrorIndicator.Render(err.Error() + "\n"))
					break outerloop
				} else {
					globals.Program.Send(ScaffolderIncrementProgressMsg{
						Increment: incAmount,
					})
				}
			}
		}
		return ScaffolderSetModelStateMsg{
			State: ScaffolderModelStateFinished,
		}
	}
}

func ScaffolderCmd(source string, destination string, scfconfig *scfconfig.ScfConfig, formAnswers map[string]interface{}, force bool) tea.Cmd {
	return func() tea.Msg {

		fileToScaffold, err := GetAllFiles(source, destination, scfconfig, formAnswers)
		if err != nil {
			return common.ErrorMsg{Err: err}
		}
		slog.Info("Files to scaffold", "files", fileToScaffold)

		existsAndNotForce := false
		if !force {
			for file, info := range fileToScaffold {
				exists, err := info.DoesDestinationExist(file)
				if err != nil {
					return common.ErrorMsg{Err: err}
				}
				if exists {
					existsAndNotForce = true
				}
			}
		}

		if existsAndNotForce {
			return ScaffolderSetModelStateMsg{
				State: ScaffolderModelStateFilesExist,
			}
		}

		incAmount := 1 / float64(len(fileToScaffold))
		var lock sync.Mutex
		var wg sync.WaitGroup
		errs := []error{}

		run := func(relPathMatch string, fileToScaffold FileScaffoldInfo) {
			defer wg.Done()
			err := fileToScaffold.CopyToDestination(relPathMatch, incAmount, formAnswers)
			if err != nil {
				lock.Lock()
				defer lock.Unlock()
				errs = append(errs, err)
			}
		}

		for file, info := range fileToScaffold {
			wg.Add(1)
			go run(file, info)
		}
		wg.Wait()

		if len(errs) > 0 {
			return common.ErrorMsg{Err: errors.Join(errs...)}
		}

		commands, err := GetCommandsToRun(scfconfig, formAnswers)
		if err != nil {
			return common.ErrorMsg{Err: err}
		}

		globals.Program.Send(ScaffolderSetCommandsToRunMsg{
			Commands: commands,
		})

		return ScaffolderSetModelStateMsg{
			State: ScaffolderModelStateWaitingToRunCommands,
		}
	}
}

func GetCommandsToRun(scfConfig *scfconfig.ScfConfig, formAnswers map[string]interface{}) ([]*scfconfig.CommandsToRun, error) {
	commands := []*scfconfig.CommandsToRun{}

	for _, command := range scfConfig.Commands {
		if len(command.PostScaffold) == 0 {
			continue
		}

		if strings.TrimSpace(command.Condition) != "" {
			conditionValue, err := utils.GetCondition(command.Condition, formAnswers)
			if err != nil {
				return nil, err
			}

			if !conditionValue {
				continue
			}
		}

		workingDir := "."
		if strings.TrimSpace(command.WorkingDirectory) != "" {
			newWorkingDir, err := utils.ParseString(command.WorkingDirectory, formAnswers)
			if err != nil {
				return nil, fmt.Errorf("Error parsing working directory: %s with values %v, %w", command.WorkingDirectory, formAnswers, err)
			}
			workingDir = newWorkingDir
		}

		postScaffoldCommands := []string{}
		for _, postScaffold := range command.PostScaffold {
			postScaffold, err := utils.ParseString(postScaffold, formAnswers)
			if err != nil {
				return nil, fmt.Errorf("Error parsing command: %s with values %v, %w", postScaffold, formAnswers, err)
			}
			postScaffoldCommands = append(postScaffoldCommands, postScaffold)
		}

		commands = append(commands, &scfconfig.CommandsToRun{
			Condition:        command.Condition,
			WorkingDirectory: workingDir,
			PostScaffold:     postScaffoldCommands,
		})
	}
	return commands, nil
}

type FileScaffoldInfo struct {
	Source      string
	Destination string
	Parse       bool
}

func (f *FileScaffoldInfo) CopyToDestination(relMatchPath string, incAmount float64, formAnswers map[string]interface{}) error {
	globals.Program.Send(ScaffolderUpdateFileStatusMsg{
		File:   relMatchPath,
		Status: "Processing...",
	})

	fullSource := f.Source
	fullDestination := f.Destination

	fileBytes, err := os.ReadFile(fullSource)
	if err != nil {
		return utils.NewWithStackTraceError(fmt.Errorf("Error reading file: %s, %w", fullSource, err))
	}
	fileContents := string(fileBytes)
	if f.Parse {
		fileContents, err = utils.ParseString(fileContents, formAnswers)
		if err != nil {
			return fmt.Errorf("Error parsing file: %s with values %v, %w", fullSource, formAnswers, err)
		}
	}

	err = os.MkdirAll(filepath.Dir(fullDestination), 0755)
	if err != nil {
		return utils.NewWithStackTraceError(fmt.Errorf("Error creating directory: %s, %w", filepath.Dir(fullDestination), err))
	}
	err = os.WriteFile(fullDestination, []byte(fileContents), 0644)
	if err != nil {
		return utils.NewWithStackTraceError(fmt.Errorf("Error writing file: %s, %w", fullDestination, err))
	}
	globals.Program.Send(ScaffolderIncrementProgressMsg{
		Increment: incAmount,
	})
	globals.Program.Send(ScaffolderUpdateFileStatusMsg{
		File:   relMatchPath,
		Status: theme.Focused.Title.Render("Done"),
	})

	return nil
}

func (f *FileScaffoldInfo) DoesDestinationExist(relMatchPath string) (bool, error) {
	fullDestination := f.Destination
	_, err := os.Stat(fullDestination)
	if os.IsNotExist(err) {
		return false, nil
	} else if err != nil {
		return false, utils.NewWithStackTraceError(err)
	}

	globals.Program.Send(ScaffolderUpdateFileStatusMsg{
		File:   relMatchPath,
		Status: "Exists",
	})

	return true, nil
}

func GetAllFiles(source string, destination string, scfconfig *scfconfig.ScfConfig, formAnswers map[string]interface{}) (map[string]FileScaffoldInfo, error) {

	if scfconfig == nil || len(scfconfig.Scaffold) == 0 {
		return GetFiles(source, source, destination, []string{"**/*"}, []string{}, formAnswers)
	}

	files := map[string]FileScaffoldInfo{}

	for workingDir, scaffoldBlock := range scfconfig.Scaffold {
		workingDir = filepath.FromSlash(workingDir)
		for _, scaffold := range scaffoldBlock {

			if strings.TrimSpace(scaffold.Condition) != "" {
				conditionValue, err := utils.GetCondition(scaffold.Condition, formAnswers)
				if err != nil {
					return nil, err
				}

				if !conditionValue {
					continue
				}
			}
			fullSourceDir := filepath.Join(source, workingDir)
			fileGlobs := []string{}
			parseGlobs := []string{}

			fileGlobs = append(fileGlobs, scaffold.Files...)
			if len(fileGlobs) == 0 {
				fileGlobs = append(fileGlobs, "**/*")
			}

			parseGlobs = append(parseGlobs, scaffold.Parse...)

			filesToAdd, err := GetFiles(source, fullSourceDir, destination, fileGlobs, parseGlobs, formAnswers)
			if err != nil {
				return nil, err
			}
			for file, info := range filesToAdd {
				files[file] = info
			}

		}
	}

	return files, nil
}

func GetFiles(rootSource string, source string, destination string, sourceGlob []string, parseGlob []string, formAnswers map[string]interface{}) (map[string]FileScaffoldInfo, error) {
	files := map[string]FileScaffoldInfo{}
	destination = filepath.FromSlash(destination)

	for _, glob := range sourceGlob {
		filePattern := ToGlob(source, glob)
		matches, err := doublestar.FilepathGlob(filePattern, doublestar.WithFilesOnly())
		if err != nil {
			return nil, utils.NewWithStackTraceError(err)
		}
		for _, match := range matches {
			pathMatch := filepath.FromSlash(match)
			base := filepath.Base(pathMatch)
			if base == "scf.config.yaml" {
				continue
			}

			slashMatch := filepath.ToSlash(match)
			parse := false
			for _, parseGlob := range parseGlob {
				parsePattern := ToGlob(source, parseGlob)
				parseMatch, err := doublestar.Match(parsePattern, slashMatch)
				if err != nil {
					return nil, utils.NewWithStackTraceError(err)
				}
				if parseMatch {
					parse = true
					break
				}
			}
			parsedMatchPath := slashMatch
			// if parse {
			parsedMatchPath, err = utils.ParsePath(parsedMatchPath, formAnswers)
			if err != nil {
				return nil, fmt.Errorf("Error parsing file path: %s, %w", slashMatch, err)
			}
			// }
			if strings.TrimSpace(parsedMatchPath) != "" {
				relDestinationPath, err := filepath.Rel(source, filepath.FromSlash(parsedMatchPath))
				if err != nil {
					return nil, utils.NewWithStackTraceError(fmt.Errorf("Error getting relative path: %s, %w", parsedMatchPath, err))
				}
				files[relDestinationPath] = FileScaffoldInfo{
					Source:      pathMatch,
					Destination: filepath.Clean(filepath.Join(destination, relDestinationPath)),
					Parse:       parse,
				}
				globals.Program.Send(ScaffolderUpdateFileStatusMsg{
					File:   relDestinationPath,
					Status: "Waiting...",
				})
			}
		}

	}

	return files, nil
}

func ToGlob(source string, glob string) string {
	pattern := filepath.FromSlash(glob)
	source = filepath.FromSlash(source)
	return filepath.ToSlash(filepath.Join(source, pattern))
}

package cmd

import (
	"log/slog"
	"os"
	"path/filepath"
	"strings"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/dworthen/scf/internal/app"
	"github.com/dworthen/scf/internal/cliflags"
	"github.com/dworthen/scf/internal/cmd/updatecmd"
	"github.com/dworthen/scf/internal/cmd/versioncmd"
	"github.com/dworthen/scf/internal/globals"
	"github.com/dworthen/scf/internal/utils"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   "scf <SOURCE> <DESTINATION>",
	Short: "Scaffold out project files from GitHub or local Directory.",
	Args:  cobra.ExactArgs(2),
	Run: func(cmd *cobra.Command, args []string) {
		source := args[0]
		destination := utils.ToFullPath(args[1])
		slog.Info("cmd: Scaffolding project", "source", source, "destination", destination)
		globals.Program = tea.NewProgram(app.NewAppModel(source, destination), tea.WithAltScreen(), tea.WithMouseCellMotion())
		_, err := globals.Program.Run()
		utils.CheckError(err)
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	cobra.CheckErr(err)
}

func init() {
	cobra.OnInitialize(initialize)

	rootCmd.PersistentFlags().BoolVarP(&cliflags.Force, "force", "", false, "Force overwrite of existing files.")
	rootCmd.PersistentFlags().StringVarP(&cliflags.GithubToken, "gh-token", "", "", "Specify GitHub token to use. (default $SCF_GH_TOKEN)")
	rootCmd.PersistentFlags().BoolVarP(&cliflags.Debug, "debug", "", false, "Debug logging.")

	rootCmd.AddCommand(versioncmd.VersionCmd)
	rootCmd.AddCommand(updatecmd.UpdateCmd)
}

func initialize() {
	configDir := utils.GetScfDirPath()
	logsFilePath := utils.GetLogsFilePath()
	directory := filepath.Dir(logsFilePath)
	_, err := os.Stat(directory)
	if err != nil {
		if os.IsNotExist(err) {
			err = os.MkdirAll(directory, 0755)
			utils.CheckError(err)
		} else {
			utils.CheckError(err)
		}
	}

	logFileWriter, err := os.OpenFile(logsFilePath, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, 0644)
	utils.CheckError(err)

	opts := &slog.HandlerOptions{
		AddSource: true,
		Level:     slog.LevelInfo,
	}

	if cliflags.Debug {
		opts.Level = slog.LevelDebug
	}

	logger := slog.New(slog.NewJSONHandler(logFileWriter, opts))
	slog.SetDefault(logger)

	if strings.TrimSpace(cliflags.GithubToken) == "" {
		cliflags.GithubToken = strings.TrimSpace(os.Getenv("SCF_GH_TOKEN"))
	}

	slog.Info("cmd: Starting scf", "configDir", configDir, "logsFilePath", logsFilePath)
}

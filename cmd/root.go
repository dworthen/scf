package cmd

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dworthen/goscf/internal/globals"
	"github.com/dworthen/goscf/internal/scaffolder"
	"github.com/spf13/cobra"
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "scf [SRC] <DEST>",
	Short: "Scaffold out project files from GitHub",
	Args:  cobra.MinimumNArgs(1),
	Run: func(cmd *cobra.Command, args []string) {
		dest := "."
		if len(args) > 1 && strings.TrimSpace(args[1]) != "" {
			dest = filepath.FromSlash(args[1])
		}
		scaffolder, err := scaffolder.New(args[0], dest)
		cobra.CheckErr(err)
		fmt.Println(os.TempDir())
		fmt.Printf("%#v\n", scaffolder)
		err = scaffolder.Scaffold()
		cobra.CheckErr(err)
	},
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func init() {
	// Here you will define your flags and configuration settings.
	// Cobra supports persistent flags, which, if defined here,
	// will be global for your application.

	// rootCmd.PersistentFlags().StringVar(&cfgFile, "config", "", "config file (default is $HOME/.goscf.yaml)")

	// Cobra also supports local flags, which will only run
	// when this action is called directly.
	rootCmd.PersistentFlags().StringVarP(&globals.GithubToken, "gh-token", "", "", "Specify GitHub token to use. (default $SCF_GH_TOKEN)")
}

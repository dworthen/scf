package versioncmd

import (
	"fmt"

	"github.com/dworthen/scf/internal/utils"
	"github.com/dworthen/scf/internal/versioninfo"
	"github.com/spf13/cobra"
)

var VersionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the current version of scf",
	Long:  "Print the current version of scf",
	Run: func(cmd *cobra.Command, args []string) {
		version, err := versioninfo.GetVersion()
		utils.CheckError(err)
		fmt.Printf("Scf Version: %s\n", version)
		err = versioninfo.PrintAvailableUpdate()
		utils.CheckError(err)
	},
}

func init() {
	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// serveCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// serveCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

/*
Copyright © 2024 Derek Worthen <worthend.derek@gmail.com>
*/
package cmd

import (
	"fmt"

	"github.com/dworthen/scf/internal/versioninfo"
	"github.com/spf13/cobra"
)

// versionCmd represents the version command
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print version",
	Long:  `Print Version`,
	Run: func(cmd *cobra.Command, args []string) {
		version, err := versioninfo.GetVersion()
		cobra.CheckErr(err)
		fmt.Println(version)
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)

	// Here you will define your flags and configuration settings.

	// Cobra supports Persistent Flags which will work for this command
	// and all subcommands, e.g.:
	// versionCmd.PersistentFlags().String("foo", "", "A help for foo")

	// Cobra supports local flags which will only run when this command
	// is called directly, e.g.:
	// versionCmd.Flags().BoolP("toggle", "t", false, "Help message for toggle")
}

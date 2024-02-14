package versioninfo

import (
	_ "embed"
	"encoding/json"
)

//go:embed updater.config.json
var versionFileContents string

type VersionInfo struct {
	Version string `json:"version"`
}

func GetVersion() (string, error) {
	var versionInfo VersionInfo

	err := json.Unmarshal([]byte(versionFileContents), &versionInfo)
	if err != nil {
		return "", err
	}

	return versionInfo.Version, nil
}

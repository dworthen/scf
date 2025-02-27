package scaffolder

import "github.com/dworthen/scf/internal/scfconfig"

type ScaffolderSetMsg struct {
	Source      string
	Destination string
	ScfConfig   *scfconfig.ScfConfig
	FormAnswers map[string]interface{}
}

type ScaffolderUpdateFileStatusMsg struct {
	File   string
	Status string
}

type ScaffolderSetModelStateMsg struct {
	State ScaffolderModelState
}

type ScaffolderIncrementProgressMsg struct {
	Increment float64
}

type ScaffolderSetCommandsToRunMsg struct {
	Commands []*scfconfig.CommandsToRun
}

type ScaffolderAppendCommandsOutputMsg struct {
	Output string
}

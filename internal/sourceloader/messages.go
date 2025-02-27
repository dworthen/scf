package sourceloader

import "github.com/dworthen/scf/internal/scfconfig"

type SourceLoaderFinishedMsg struct {
	Source      string
	Destination string
	ScfConfig   *scfconfig.ScfConfig
}

type SourceLoaderSetModelStateMsg struct {
	State SourceLoaderModelState
}

type SourceLoaderIncrementProgressMsg struct {
	Increment float64
}

type SourceLoaderResetProgressMsg struct{}

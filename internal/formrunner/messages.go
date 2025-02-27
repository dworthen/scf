package formrunner

import "github.com/dworthen/scf/internal/scfconfig"

type FormRunnerLoadedMsg struct {
}

type FormRunnerSetScfConfigMsg struct {
	ScfConfig *scfconfig.ScfConfig
}

type FormRunnerFinishedMsg struct {
	Answers map[string]interface{}
}

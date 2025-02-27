package formrunner

import (
	tea "github.com/charmbracelet/bubbletea"
	"github.com/dworthen/scf/internal/scfconfig"
)

func FormRunnerSetScfConfigCmd(scfConfig *scfconfig.ScfConfig) tea.Cmd {
	return func() tea.Msg {
		return FormRunnerSetScfConfigMsg{ScfConfig: scfConfig}
	}
}

func FormRunnerFinishedCmd(answers map[string]interface{}) tea.Cmd {
	return func() tea.Msg {
		return FormRunnerFinishedMsg{Answers: answers}
	}
}

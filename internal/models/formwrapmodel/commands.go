package formwrapmodel

import tea "github.com/charmbracelet/bubbletea"

func FormWrapWithHelpCmd(showHelp bool) tea.Cmd {
	return func() tea.Msg { return FormWrapWithHelpMsg{ShowHelp: showHelp} }
}

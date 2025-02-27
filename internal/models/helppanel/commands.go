package helppanel

import (
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
)

func HelpPanelWithKeysCmd(keys []key.Binding) tea.Cmd {
	return func() tea.Msg { return HelpPanelWithKeysMsg{Keys: keys} }
}

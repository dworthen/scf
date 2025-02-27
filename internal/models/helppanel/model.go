package helppanel

import (
	"log/slog"

	"github.com/charmbracelet/bubbles/help"
	"github.com/charmbracelet/bubbles/key"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/davecgh/go-spew/spew"
)

type helpPanelKeys struct {
	keys []key.Binding
}

func (h helpPanelKeys) ShortHelp() []key.Binding  { return h.keys }
func (h helpPanelKeys) FullHelp() [][]key.Binding { return [][]key.Binding{h.keys} }

type helpPanelModel struct {
	help help.Model
	keys helpPanelKeys
}

func NewHelpPanelModel(keys []key.Binding) helpPanelModel {
	return helpPanelModel{
		help: help.New(),
		keys: helpPanelKeys{keys: keys},
	}
}

func (m helpPanelModel) Init() tea.Cmd {
	return nil
}

func (m helpPanelModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	switch msg := msg.(type) {
	case HelpPanelWithKeysMsg:
		slog.Debug("helppanel: helpPanelModel.Update: received msg", "msg", spew.Sdump(msg))
		m.keys = helpPanelKeys{msg.Keys}
	}
	return m, nil
}

func (m helpPanelModel) View() string { return m.help.View(m.keys) }

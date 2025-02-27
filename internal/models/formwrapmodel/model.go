package formwrapmodel

import (
	"log/slog"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/huh"
	"github.com/davecgh/go-spew/spew"
)

type formWrapModel struct {
	form       *huh.Form
	onComplete func() tea.Cmd
}

func (m formWrapModel) Init() tea.Cmd {
	return m.form.Init()
}

func (m formWrapModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	slog.Debug("formwrapmodel: formwrapmodel.Update: received msg", "msg", spew.Sdump(msg))

	switch msg := msg.(type) {
	case FormWrapWithHelpMsg:
		m.form = m.form.WithShowHelp(msg.ShowHelp)
		return m, nil
	}

	form, cmd := m.form.Update(msg)
	if f, ok := form.(*huh.Form); ok {
		m.form = f
		if f.State == huh.StateCompleted {
			return m, tea.Batch(cmd, m.onComplete())
		}
	}
	return m, cmd
}

func (m formWrapModel) View() string {
	return m.form.View()
}

package formrunner

import (
	"log/slog"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/huh"
	"github.com/davecgh/go-spew/spew"
	"github.com/dworthen/scf/internal/forms"
	"github.com/dworthen/scf/internal/models/scrollwindow"
)

var _formResults = forms.GetFormResultsSingleton()

type FormRunnerModel struct {
	ScrollWindowModel tea.Model
	Form              *huh.Form
}

func NewFormRunnerModel() *FormRunnerModel {

	scrollWindowModel := scrollwindow.NewScrollWindowModelBuilder().
		WithTitle("Scaffold Prompts").
		Build()

	return &FormRunnerModel{
		ScrollWindowModel: scrollWindowModel,
	}

}

func (m FormRunnerModel) Init() tea.Cmd {
	return m.ScrollWindowModel.Init()
}

func (m FormRunnerModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	slog.Debug("formrunner: FormRunnerModel.Update: received msg", "msg", spew.Sdump(msg))

	switch msg := msg.(type) {
	case FormRunnerSetScfConfigMsg:
		m.Form = forms.BuildForm(msg.ScfConfig)
		return m, tea.Batch(m.Form.Init(), scrollwindow.ScrollWindowSetContentCmd(m.Form.View()))
	case tea.WindowSizeMsg:
		return m, scrollwindow.ScrollWindowResizeCmd(msg.Width, msg.Height)
	case tea.KeyMsg:
		switch msg.String() {
		case "up", "down":
			newScrollWindow, cmd := m.ScrollWindowModel.Update(msg)
			m.ScrollWindowModel = newScrollWindow
			if m.Form == nil {
				return m, cmd
			}
			newForm, cmd2 := m.Form.Update(msg)
			m.Form = newForm.(*huh.Form)
			return m, tea.Batch(cmd, cmd2, scrollwindow.ScrollWindowSetContentCmd(m.Form.View()))
		}
	case tea.MouseMsg:
		newScrollWindow, cmd := m.ScrollWindowModel.Update(msg)
		m.ScrollWindowModel = newScrollWindow
		return m, cmd
	case scrollwindow.ScrollWindowResizeMsg, scrollwindow.ScrollWindowSetContentMsg:
		newScrollWindow, cmd := m.ScrollWindowModel.Update(msg)
		m.ScrollWindowModel = newScrollWindow
		return m, cmd
	}

	if m.Form == nil {
		return m, nil
	}

	newForm, cmd := m.Form.Update(msg)
	if f, ok := newForm.(*huh.Form); ok {
		m.Form = f
		if f.State == huh.StateCompleted {
			return m, FormRunnerFinishedCmd(_formResults.Results)
		}
	}
	return m, tea.Batch(cmd, scrollwindow.ScrollWindowSetContentCmd(m.Form.View()))
}

func (m FormRunnerModel) View() string {
	if m.Form == nil {
		return ""
	}
	return m.ScrollWindowModel.View()
}

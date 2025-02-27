package app

import (
	"log/slog"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/davecgh/go-spew/spew"
	"github.com/dworthen/scf/internal/formrunner"
	"github.com/dworthen/scf/internal/models/common"
	"github.com/dworthen/scf/internal/scaffolder"
	"github.com/dworthen/scf/internal/scfconfig"
	"github.com/dworthen/scf/internal/sourceloader"
)

type AppModel struct {
	CurrentState  AppModelState
	Source        string
	Destination   string
	ActiveModel   AppActiveModel
	SourceLoader  tea.Model
	PromptsForm   tea.Model
	Scaffolder    tea.Model
	ScfConfig     *scfconfig.ScfConfig
	CommandsToRun []*scfconfig.CommandsToRun
	Err           error
	Width         int
	Height        int
}

func NewAppModel(source string, destination string) *AppModel {
	sl := sourceloader.NewSourceLoaderModel(source, destination)
	pf := formrunner.NewFormRunnerModel()
	sf := scaffolder.NewScaffolderModel()

	return &AppModel{
		CurrentState: AppModelStateStateRunning,
		Source:       source,
		Destination:  destination,
		ActiveModel:  AppActiveModelSourceLoader,
		SourceLoader: sl,
		PromptsForm:  pf,
		Scaffolder:   sf,
	}
}

func (m AppModel) Init() tea.Cmd {
	return tea.Batch(m.SourceLoader.Init(), m.PromptsForm.Init(), m.Scaffolder.Init())
}

func (m AppModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	slog.Debug("app: AppModel.Update: received msg", "msg", spew.Sdump(msg))
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.Width = msg.Width
		m.Height = msg.Height
		// newSourceLoader, cmd := m.SourceLoader.Update(msg)
		// m.SourceLoader = newSourceLoader
		// newPromptsForm, cmd2 := m.PromptsForm.Update(msg)
		// m.PromptsForm = newPromptsForm
		// newScaffolder, cmd3 := m.Scaffolder.Update(msg)
		// m.Scaffolder = newScaffolder
		// return m, tea.Batch(cmd, cmd2, cmd3)
	case common.ErrorMsg:
		m.Err = msg.Err
		m.CurrentState = AppModelStateStateError
		return m, nil
	case sourceloader.SourceLoaderFinishedMsg:
		m.Source = msg.Source
		m.Destination = msg.Destination
		m.ScfConfig = msg.ScfConfig

		slog.Info("app: config loaded", "config", m.ScfConfig)

		if m.ScfConfig != nil && len(m.ScfConfig.Forms) > 0 {
			m.ActiveModel = AppActiveModelPromptsForm
			return m, tea.Batch(formrunner.FormRunnerSetScfConfigCmd(m.ScfConfig), common.ResizeWindowCmd(m.Width, m.Height))
		}

		m.ActiveModel = AppActiveModelScaffolder
		return m, tea.Batch(common.ResizeWindowCmd(m.Width, m.Height), scaffolder.ScaffolderSetCmd(m.Source, m.Destination, m.ScfConfig, map[string]interface{}{}))
	case formrunner.FormRunnerFinishedMsg:
		m.ActiveModel = AppActiveModelScaffolder

		slog.Info("app: form answers", "answers", msg.Answers)

		return m, tea.Batch(common.ResizeWindowCmd(m.Width, m.Height), scaffolder.ScaffolderSetCmd(m.Source, m.Destination, m.ScfConfig, msg.Answers))
	case tea.KeyMsg:
		if m.CurrentState == AppModelStateStateComplete || m.CurrentState == AppModelStateStateError {
			return m, tea.Quit
		}
		switch msg.String() {
		case "ctrl+c", "esc":
			return m, tea.Quit
		}
	}

	switch m.ActiveModel {
	case AppActiveModelSourceLoader:
		newSourceLoader, cmd := m.SourceLoader.Update(msg)
		m.SourceLoader = newSourceLoader
		return m, cmd
	case AppActiveModelPromptsForm:
		newPromptsForm, cmd := m.PromptsForm.Update(msg)
		m.PromptsForm = newPromptsForm
		return m, cmd
	default:
		newScaffolder, cmd := m.Scaffolder.Update(msg)
		m.Scaffolder = newScaffolder
		return m, cmd
	}
}

func (m AppModel) View() string {

	if m.CurrentState == AppModelStateStateError {
		return m.Err.Error()
	}
	if m.CurrentState == AppModelStateStateComplete {
		return "Success! Scaffolding complete. Press any key to exit."
	}
	switch m.ActiveModel {
	case AppActiveModelSourceLoader:
		return m.SourceLoader.View()
	case AppActiveModelPromptsForm:
		return m.PromptsForm.View()
	default:
		return m.Scaffolder.View()
	}
}

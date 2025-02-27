package scaffolder

import (
	"fmt"
	"log/slog"

	"github.com/charmbracelet/bubbles/progress"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/huh"
	"github.com/charmbracelet/lipgloss"
	"github.com/davecgh/go-spew/spew"
	"github.com/dworthen/scf/internal/cliflags"
	"github.com/dworthen/scf/internal/models/scrollwindow"
	"github.com/dworthen/scf/internal/scfconfig"
)

var theme = huh.ThemeBase16()

type ScaffolderModel struct {
	CurrentState      ScaffolderModelState
	CompletionMessage string
	Source            string
	Destination       string
	ScfConfig         *scfconfig.ScfConfig
	FormAnswers       map[string]interface{}
	ScrollWindowModel tea.Model
	ProgressModel     progress.Model
	FileStatus        *FileStatus
	CommandsToRun     []*scfconfig.CommandsToRun
	CommandsOutput    string
	ShowScrollWindow  bool
	ProgressWidth     int
	Width             int
	Height            int
}

func NewScaffolderModel() *ScaffolderModel {
	scrollWindowModel := scrollwindow.NewScrollWindowModelBuilder().
		WithTitle("Files").
		Build()

	return &ScaffolderModel{
		CurrentState:      ScaffolderModelStateScaffolding,
		ScrollWindowModel: scrollWindowModel,
		ProgressModel:     progress.New(progress.WithDefaultGradient()),
		FileStatus:        NewFileStatus(),
		CompletionMessage: "",
		ShowScrollWindow:  false,
	}
}

func (m ScaffolderModel) Init() tea.Cmd {
	return tea.Batch(m.ScrollWindowModel.Init(), m.ProgressModel.Init())
}

var maxProgressWidth = 80

func (m ScaffolderModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	slog.Debug("scaffolder: ScaffolderModel.Update: received msg", "msg", spew.Sdump(msg))
	switch msg := msg.(type) {
	case ScaffolderSetMsg:
		m.Source = msg.Source
		m.Destination = msg.Destination
		m.ScfConfig = msg.ScfConfig
		m.FormAnswers = msg.FormAnswers
		return m, ScaffolderCmd(m.Source, m.Destination, m.ScfConfig, m.FormAnswers, cliflags.Force)
	case ScaffolderSetModelStateMsg:
		m.CurrentState = msg.State
		if m.CurrentState == ScaffolderModelStateRunningCommands {
			return m, scrollwindow.ScrollWindowSetTitleCmd("Commands")
		}
		return m, nil
	case ScaffolderUpdateFileStatusMsg:
		m.ShowScrollWindow = true
		m.FileStatus.Set(msg.File, msg.Status)
		return m, scrollwindow.ScrollWindowSetContentCmd(m.FileStatus.ToString())
	case ScaffolderSetCommandsToRunMsg:
		m.CommandsToRun = msg.Commands
		return m, nil
	case ScaffolderAppendCommandsOutputMsg:
		m.ShowScrollWindow = true
		m.CommandsOutput += msg.Output
		return m, scrollwindow.ScrollWindowSetContentCmd(m.CommandsOutput)
	case ScaffolderIncrementProgressMsg:
		cmd := m.ProgressModel.IncrPercent(msg.Increment)
		return m, cmd
	case progress.FrameMsg:
		progressModel, cmd := m.ProgressModel.Update(msg)
		m.ProgressModel = progressModel.(progress.Model)
		return m, cmd
	case tea.WindowSizeMsg:
		m.Width = msg.Width
		m.Height = msg.Height
		m.ProgressWidth = min(msg.Width, maxProgressWidth)
		m.ProgressModel.Width = m.ProgressWidth
		return m, scrollwindow.ScrollWindowResizeCmd(msg.Width, m.GetScrollWindowHeight())
	case tea.KeyMsg:
		if m.CurrentState == ScaffolderModelStateFinished ||
			(m.CurrentState == ScaffolderModelStateFilesExist && msg.String() == "n") {
			return m, tea.Quit
		}

		if m.CurrentState == ScaffolderModelStateWaitingToRunCommands {
			if len(m.CommandsToRun) > 0 {
				m.CurrentState = ScaffolderModelStateRunningCommands
				m.ProgressModel = progress.New(progress.WithDefaultGradient())
				m.ProgressModel.Width = m.ProgressWidth
				return m, tea.Batch(scrollwindow.ScrollWindowSetTitleCmd("Commands"), ScaffolderRunCommands(m.Destination, m.CommandsToRun))
			}
			m.CurrentState = ScaffolderModelStateFinished
			return m, nil
		}

		switch msg.String() {
		case "up", "down":
			newScrollWindow, cmd := m.ScrollWindowModel.Update(msg)
			m.ScrollWindowModel = newScrollWindow
			return m, cmd
		case "y":
			if m.CurrentState == ScaffolderModelStateFilesExist {
				m.CurrentState = ScaffolderModelStateScaffolding
				return m, ScaffolderCmd(m.Source, m.Destination, m.ScfConfig, m.FormAnswers, true)
			}
		}
	case tea.MouseMsg, scrollwindow.ScrollWindowResizeMsg, scrollwindow.ScrollWindowSetContentMsg, scrollwindow.ScrollWiindowSetTitleMsg:
		newScrollWindow, cmd := m.ScrollWindowModel.Update(msg)
		m.ScrollWindowModel = newScrollWindow
		return m, cmd
	}

	return m, nil
}

func (m ScaffolderModel) TitleView() string {
	return theme.Focused.Title.Render(string(m.CurrentState))
}

func (m ScaffolderModel) HeaderView() string {
	if ShowProgress(m.CurrentState) {
		return lipgloss.JoinVertical(
			lipgloss.Top,
			m.TitleView(),
			"",
			m.ProgressModel.View(),
			"",
		)
	}
	return m.TitleView()
}

func (m ScaffolderModel) ProgressView() string {
	title := fmt.Sprintf("Scaffolding files to %s", m.Destination)
	if m.CompletionMessage != "" {
		title = m.CompletionMessage
	}
	return lipgloss.JoinVertical(lipgloss.Top, title, m.ProgressModel.View(), " ")
}

func (m ScaffolderModel) GetHeaderViewHeight() int {
	return lipgloss.Height(m.HeaderView())
}

func (m ScaffolderModel) GetScrollWindowHeight() int {
	height := m.Height - m.GetHeaderViewHeight()
	return height
}

func (m ScaffolderModel) View() string {
	if m.ShowScrollWindow {
		return lipgloss.JoinVertical(
			lipgloss.Top,
			m.HeaderView(),
			m.ScrollWindowModel.View(),
		)
	}
	return m.HeaderView()
}

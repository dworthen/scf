package sourceloader

import (
	"fmt"

	"github.com/charmbracelet/bubbles/progress"
	"github.com/charmbracelet/bubbles/spinner"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/huh"
	"github.com/dworthen/scf/internal/scfconfig"
)

var theme = huh.ThemeBase16()

type SourceLoaderModel struct {
	CurrentState  SourceLoaderModelState
	Source        string
	Destination   string
	ScfConfig     *scfconfig.ScfConfig
	Content       string
	Spinner       spinner.Model
	Progress      progress.Model
	ProgressWidth int
}

func NewSourceLoaderModel(source string, destination string) *SourceLoaderModel {
	s := spinner.New()
	s.Spinner = spinner.Dot

	return &SourceLoaderModel{
		CurrentState: SourceLoaderModelStateLoading,
		Source:       source,
		Destination:  destination,
		Content:      "Loading...",
		Spinner:      s,
		Progress:     progress.New(progress.WithDefaultGradient()),
	}
}

func (m SourceLoaderModel) Init() tea.Cmd {
	return tea.Batch(m.Spinner.Tick, m.Progress.Init(), LoadSourceCmd(m.Source, m.Destination))
}

var maxProgressWidth = 80

func (m SourceLoaderModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {

	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.ProgressWidth = min(msg.Width, maxProgressWidth)
		m.Progress.Width = m.ProgressWidth
		return m, nil
	case progress.FrameMsg:
		progressModel, cmd := m.Progress.Update(msg)
		m.Progress = progressModel.(progress.Model)
		return m, cmd
	case SourceLoaderIncrementProgressMsg:
		cmd := m.Progress.IncrPercent(msg.Increment)
		return m, cmd
	case SourceLoaderResetProgressMsg:
		m.Progress = progress.New(progress.WithDefaultGradient())
		m.Progress.Width = m.ProgressWidth
		return m, m.Progress.Init()
	case SourceLoaderSetModelStateMsg:
		m.CurrentState = msg.State
		return m, nil
	}

	switch GetActiveSubModel(m.CurrentState) {
	case SourceLoaderActiveSubModelSpinner:
		newSpinner, cmd := m.Spinner.Update(msg)
		m.Spinner = newSpinner
		return m, cmd
	case SourceLoaderActiveSubModelProgress:
		newProgress, cmd := m.Progress.Update(msg)
		m.Progress = newProgress.(progress.Model)
		return m, cmd
	}

	newSpinner, cmd := m.Spinner.Update(msg)
	m.Spinner = newSpinner
	return m, cmd
}

func (m SourceLoaderModel) View() string {
	switch GetActiveSubModel(m.CurrentState) {
	case SourceLoaderActiveSubModelSpinner:
		return m.Spinner.View() + " " + theme.Focused.Title.Height(30).Render(string(m.CurrentState))
	case SourceLoaderActiveSubModelProgress:
		return fmt.Sprintf("%s\n\n%s", theme.Focused.Title.Render(string(m.CurrentState)), m.Progress.View())
	}
	return string(m.CurrentState)
}

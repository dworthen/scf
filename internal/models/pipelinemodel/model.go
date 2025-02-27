package pipelinemodel

import (
	"log/slog"
	"reflect"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/davecgh/go-spew/spew"
	"github.com/dworthen/scf/internal/models/common"
)

type pipelineModel struct {
	index             int
	models            []func() (tea.Model, error)
	currentModel      tea.Model
	complete          bool
	onComplete        func() tea.Cmd
	stepCompletionMsg tea.Msg
	width             int
	height            int
}

func (m *pipelineModel) changeIndex(amount int) error {
	newIndex := m.index + amount
	if newIndex < 0 {
		return NewOutOfPipelineIndexError(newIndex)
	}
	if newIndex >= len(m.models) {
		return NewOutOfPipelineIndexError(newIndex)
	}
	m.index = newIndex
	newModel, err := m.models[newIndex]()
	if err != nil {
		return err
	}
	m.currentModel = newModel
	return nil
}

func (m pipelineModel) Init() tea.Cmd {
	return m.currentModel.Init()
}

func (m pipelineModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	slog.Debug("pipelinemodel: update received msg", "msg", spew.Sdump(msg))

	stepCompletionMsgType := reflect.TypeOf(m.stepCompletionMsg)
	switch msg := msg.(type) {
	case tea.WindowSizeMsg:
		m.width = msg.Width
		m.height = msg.Height
	case PipelineModelChangeIndexMsg:
		err := m.changeIndex(msg.Amount)
		if err != nil {
			slog.Error("Unable to change index", "err", err)
			return m, common.ErrorMsgCmd(err)
		}
		return m, tea.Batch(m.currentModel.Init(), common.ResizeWindowCmd(m.width, m.height))
	case tea.KeyMsg:
		switch msg.String() {
		case "esc":
			if m.index == 0 {
				return m, tea.Quit
			}
			return m, PipelineModelChangeIndexCmd(-1)
		}
	}
	if reflect.TypeOf(msg) == stepCompletionMsgType {
		if m.index == len(m.models)-1 {
			return m, m.onComplete()
		}
		return m, PipelineModelChangeIndexCmd(1)
	}
	model, cmd := m.currentModel.Update(msg)
	m.currentModel = model
	return m, cmd
}

func (m pipelineModel) View() string {
	return m.currentModel.View()
}

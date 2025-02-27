package pipelinemodel

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"
)

type pipelineModelBuilder struct {
	pipelineModelState *pipelineModel
}

func NewPipelineModelBuilder() *pipelineModelBuilder {
	return &pipelineModelBuilder{
		pipelineModelState: &pipelineModel{},
	}
}

func (b *pipelineModelBuilder) WithModels(models []func() (tea.Model, error)) *pipelineModelBuilder {
	b.pipelineModelState.models = models
	return b
}

func (b *pipelineModelBuilder) WithOnComplete(onComplete func() tea.Cmd) *pipelineModelBuilder {
	b.pipelineModelState.onComplete = onComplete
	return b
}

func (b *pipelineModelBuilder) WithStepCompletionMsg(stepCompletionMsg tea.Msg) *pipelineModelBuilder {
	b.pipelineModelState.stepCompletionMsg = stepCompletionMsg
	return b
}

func (b *pipelineModelBuilder) Build() (*pipelineModel, error) {
	if len(b.pipelineModelState.models) == 0 {
		return nil, fmt.Errorf("Error: pipelinemodel.pipelineModelBuilder - models are required")
	}
	if b.pipelineModelState.onComplete == nil {
		return nil, fmt.Errorf("Error: pipelinemodel.pipelineModelBuilder - onComplete is required")
	}
	if b.pipelineModelState.stepCompletionMsg == nil {
		return nil, fmt.Errorf("Error: pipelinemodel.pipelineModelBuilder - stepCompletionMsg is required")
	}
	b.pipelineModelState.index = 0
	b.pipelineModelState.complete = false
	newModel, err := b.pipelineModelState.models[0]()
	if err != nil {
		return nil, err
	}
	b.pipelineModelState.currentModel = newModel
	return b.pipelineModelState, nil
}

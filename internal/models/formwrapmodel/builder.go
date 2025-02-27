package formwrapmodel

import (
	"fmt"

	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/huh"
)

type formWrapModelBuilder struct {
	formWrapModel *formWrapModel
}

func NewFormWrapModelBuilder() *formWrapModelBuilder {
	return &formWrapModelBuilder{
		formWrapModel: &formWrapModel{},
	}
}

func (b *formWrapModelBuilder) WithForm(form *huh.Form) *formWrapModelBuilder {
	b.formWrapModel.form = form
	return b
}

func (b *formWrapModelBuilder) WithOnComplete(onComplete func() tea.Cmd) *formWrapModelBuilder {
	b.formWrapModel.onComplete = onComplete
	return b
}

func (b *formWrapModelBuilder) WithShowHelp(showHelp bool) *formWrapModelBuilder {
	b.formWrapModel.form = b.formWrapModel.form.WithShowHelp(showHelp)
	return b
}

func (b *formWrapModelBuilder) Build() (*formWrapModel, error) {
	if b.formWrapModel.form == nil {
		return nil, fmt.Errorf("Error: formwrapmodel.formWrapModelBuilder - form is required")
	}
	if b.formWrapModel.onComplete == nil {
		return nil, fmt.Errorf("Error: formwrapmodel.formWrapModelBuilder - onComplete is required")
	}
	return b.formWrapModel, nil
}

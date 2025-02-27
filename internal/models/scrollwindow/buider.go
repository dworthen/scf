package scrollwindow

import (
	"github.com/charmbracelet/bubbles/viewport"
	"github.com/charmbracelet/lipgloss"
)

type scrollWindowModelBuilder struct {
	scrollWindowModel *scrollWindowModel
}

func NewScrollWindowModelBuilder() *scrollWindowModelBuilder {
	return &scrollWindowModelBuilder{
		scrollWindowModel: &scrollWindowModel{},
	}
}

func (b *scrollWindowModelBuilder) WithTitle(title string) *scrollWindowModelBuilder {
	b.scrollWindowModel.title = title
	return b
}

func (b *scrollWindowModelBuilder) Build() *scrollWindowModel {
	headerHeight := lipgloss.Height(b.scrollWindowModel.headerView())

	b.scrollWindowModel.viewport = viewport.New(0, 0)
	b.scrollWindowModel.viewport.YPosition = headerHeight
	b.scrollWindowModel.viewport.HighPerformanceRendering = false
	b.scrollWindowModel.viewport.SetContent(b.scrollWindowModel.content)

	return b.scrollWindowModel
}

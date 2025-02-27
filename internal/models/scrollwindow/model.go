package scrollwindow

import (
	"fmt"
	"log/slog"
	"strings"

	"github.com/charmbracelet/bubbles/viewport"
	tea "github.com/charmbracelet/bubbletea"
	"github.com/charmbracelet/lipgloss"
	"github.com/davecgh/go-spew/spew"
)

type scrollWindowModel struct {
	title    string
	content  string
	viewport viewport.Model
}

func (m scrollWindowModel) Init() tea.Cmd {
	return m.viewport.Init()
}

func (m scrollWindowModel) Update(msg tea.Msg) (tea.Model, tea.Cmd) {
	slog.Debug("scrollwindow.Update: received msg", "msg", spew.Sdump(msg))

	switch msg := msg.(type) {
	case ScrollWindowSetContentMsg:
		m.content = msg.Content
		m.viewport.SetContent(m.content)
		return m, nil
	case ScrollWiindowSetTitleMsg:
		m.title = msg.Title
		return m, nil
	case ScrollWindowResizeMsg:
		headerHeight := lipgloss.Height(m.headerView())
		footerHeight := lipgloss.Height(m.footerView())
		verticalMarginHeight := headerHeight + footerHeight

		m.viewport.Width = msg.Width
		m.viewport.Height = msg.Height - verticalMarginHeight
		return m, nil
	}

	newViewport, cmd := m.viewport.Update(msg)
	m.viewport = newViewport
	return m, cmd
}

func (m scrollWindowModel) View() string {
	return lipgloss.JoinVertical(lipgloss.Top,
		m.headerView(),
		m.viewport.View(),
		m.footerView(),
	)
}

func (m scrollWindowModel) headerView() string {
	title := titleStyle.Render(m.title)
	line := strings.Repeat("─", max(0, m.viewport.Width-lipgloss.Width(title)))
	return lipgloss.JoinHorizontal(lipgloss.Center, title, line)
}

func (m scrollWindowModel) footerView() string {
	info := infoStyle.Render(fmt.Sprintf("%3.f%%", m.viewport.ScrollPercent()*100))
	line := strings.Repeat("─", max(0, m.viewport.Width-lipgloss.Width(info)))
	return lipgloss.JoinHorizontal(lipgloss.Center, line, info)
}

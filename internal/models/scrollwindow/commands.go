package scrollwindow

import (
	tea "github.com/charmbracelet/bubbletea"
)

func ScrollWindowResizeCmd(width int, height int) tea.Cmd {
	return func() tea.Msg {
		returnMsg := ScrollWindowResizeMsg{Width: width, Height: height}
		return returnMsg
	}
}

func ScrollWindowSetContentCmd(content string) tea.Cmd {
	return func() tea.Msg {
		returnMsg := ScrollWindowSetContentMsg{Content: content}
		return returnMsg
	}
}

func ScrollWindowSetTitleCmd(title string) tea.Cmd {
	return func() tea.Msg {
		returnMsg := ScrollWiindowSetTitleMsg{Title: title}
		return returnMsg
	}
}

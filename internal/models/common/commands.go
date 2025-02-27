package common

import (
	tea "github.com/charmbracelet/bubbletea"
)

func ErrorMsgCmd(err error) tea.Cmd {
	return func() tea.Msg {
		returnMsg := ErrorMsg{
			Err: err,
		}
		return returnMsg
	}
}

func ResizeWindowCmd(width int, height int) tea.Cmd {
	return func() tea.Msg {
		returnMsg := tea.WindowSizeMsg{
			Width:  width,
			Height: height,
		}
		return returnMsg
	}
}

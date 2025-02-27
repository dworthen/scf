package pipelinemodel

import (
	tea "github.com/charmbracelet/bubbletea"
)

func PipelineModelChangeIndexCmd(amount int) tea.Cmd {
	return func() tea.Msg {
		return PipelineModelChangeIndexMsg{
			Amount: amount,
		}
	}
}

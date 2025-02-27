package scrollwindow

type ScrollWindowResizeMsg struct {
	Width  int
	Height int
}

type ScrollWindowSetContentMsg struct {
	Content string
}

type ScrollWiindowSetTitleMsg struct {
	Title string
}

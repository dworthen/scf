package app

type AppModelState int

const (
	AppModelStateStateRunning AppModelState = iota
	AppModelStateStateComplete
	AppModelStateStateError
)

type AppActiveModel string

const (
	AppActiveModelSourceLoader AppActiveModel = "SourceLoader"
	AppActiveModelPromptsForm  AppActiveModel = "PromptsForm"
	AppActiveModelScaffolder   AppActiveModel = "Scaffolder"
)

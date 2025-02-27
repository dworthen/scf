package scaffolder

type ScaffolderModelState string

const (
	ScaffolderModelStateScaffolding          ScaffolderModelState = "Scaffolding Files..."
	ScaffolderModelStateFilesExist           ScaffolderModelState = "Files already exist. Overwrite? (y/n)"
	ScaffolderModelStateWaitingToRunCommands ScaffolderModelState = "Scaffolding complete. Press any key to continue."
	ScaffolderModelStateRunningCommands      ScaffolderModelState = "Running Post Scaffolding Commands..."
	ScaffolderModelStateFinished             ScaffolderModelState = "Finished. Press any key to exit."
)

func ShowProgress(scaffolderModelState ScaffolderModelState) bool {
	return scaffolderModelState == ScaffolderModelStateScaffolding ||
		scaffolderModelState == ScaffolderModelStateWaitingToRunCommands ||
		scaffolderModelState == ScaffolderModelStateRunningCommands ||
		scaffolderModelState == ScaffolderModelStateFinished
}

package sourceloader

type SourceLoaderModelState string

const (
	SourceLoaderModelStateLoading            SourceLoaderModelState = "Loading..."
	SourceLoaderModelStateDownloadingArchive SourceLoaderModelState = "Downloading Template..."
	SourceLoaderModelStateExtractingArchive  SourceLoaderModelState = "Extracting Template..."
	SourceLoaderModelStateLoadingPrompts     SourceLoaderModelState = "Loading Prompts..."
	SourceLoaderModelStateFinished           SourceLoaderModelState = "Finished"
)

func ShowSpinner(sourceLoaderModelState SourceLoaderModelState) bool {
	return sourceLoaderModelState == SourceLoaderModelStateLoading || sourceLoaderModelState == SourceLoaderModelStateLoadingPrompts
}

func ShowProgress(sourceLoaderModelState SourceLoaderModelState) bool {
	return sourceLoaderModelState == SourceLoaderModelStateDownloadingArchive || sourceLoaderModelState == SourceLoaderModelStateExtractingArchive
}

type SourceLoaderActiveSubModel string

const (
	SourceLoaderActiveSubModelSpinner  SourceLoaderActiveSubModel = "Spinner"
	SourceLoaderActiveSubModelProgress SourceLoaderActiveSubModel = "Progress"
)

func GetActiveSubModel(sourceLoaderModelState SourceLoaderModelState) SourceLoaderActiveSubModel {
	if ShowSpinner(sourceLoaderModelState) {
		return SourceLoaderActiveSubModelSpinner
	} else if ShowProgress(sourceLoaderModelState) {
		return SourceLoaderActiveSubModelProgress
	}
	return ""
}

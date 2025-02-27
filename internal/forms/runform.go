package forms

import (
	"github.com/dworthen/scf/internal/scfconfig"
	"github.com/dworthen/scf/internal/utils"
)

func RunForm(scfConfig *scfconfig.ScfConfig) (map[string]interface{}, error) {

	form := BuildForm(scfConfig)
	if form == nil {
		return nil, nil
	}

	err := form.Run()
	if err != nil {
		return nil, utils.NewWithStackTraceError(err)
	}

	_formResults := GetFormResultsSingleton()
	return _formResults.Results, nil
}

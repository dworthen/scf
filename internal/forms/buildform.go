package forms

import (
	"fmt"
	"log/slog"
	"strings"

	"github.com/charmbracelet/huh"
	"github.com/dworthen/scf/internal/scfconfig"
	"github.com/dworthen/scf/internal/utils"
)

var _formResults = *GetFormResultsSingleton()

func BuildForm(scfConfig *scfconfig.ScfConfig) *huh.Form {

	groups := make([]*huh.Group, len(scfConfig.Forms))
	for i, form := range scfConfig.Forms {
		groups[i] = buildGroup(form, i == 0)
	}

	return huh.NewForm(groups...)
}

func buildGroup(group *scfconfig.Form, skipCondition bool) *huh.Group {
	fields := make([]huh.Field, len(group.Fields))
	for i, field := range group.Fields {
		fields[i] = buildField(field)
	}
	returnGroup := huh.NewGroup(fields...)
	if !skipCondition && strings.TrimSpace(group.Condition) != "" {
		returnGroup = returnGroup.WithHideFunc(func() bool {

			conditionalValue, err := utils.GetCondition(group.Condition, _formResults.Results)
			if err != nil {
				panic(err)
			}
			return !conditionalValue
		})
	}
	return returnGroup
}

func buildField(field *scfconfig.FormField) huh.Field {
	switch field.Type {
	case scfconfig.FormFieldTypeInput:
		return buildInputField(field)
	case scfconfig.FormFieldTypeText:
		return buildTextField(field)
	case scfconfig.FormFieldTypeSelect:
		return buildSelectField(field)
	case scfconfig.FormFieldTypeMultiSelect:
		return buildMultiSelectField(field)
	case scfconfig.FormFieldTypeConfirm:
		return buildConfirmField(field)
	default:
		return nil
	}
}

func buildInputField(field *scfconfig.FormField) huh.Field {
	formField := huh.NewInput().
		Title(field.Title).
		Description(field.Description).
		Validate(func(value string) error {
			if field.Required && strings.TrimSpace(value) == "" {
				return fmt.Errorf("Required.")
			}
			_formResults.Set(field.VariableName, value)
			return nil
		})
	if field.Default != nil {
		val, ok := field.Default.(string)
		if !ok {
			val = ""
		}
		formField = formField.Value(&val)
	}
	return formField
}

func buildTextField(field *scfconfig.FormField) huh.Field {
	formField := huh.NewText().
		Title(field.Title).
		Description(field.Description).
		Validate(func(value string) error {
			if field.Required && strings.TrimSpace(value) == "" {
				return fmt.Errorf("Required.")
			}
			_formResults.Set(field.VariableName, value)
			return nil
		})
	if field.Default != nil {
		val, ok := field.Default.(string)
		if !ok {
			val = ""
		}
		formField = formField.Value(&val)
	}
	return formField
}

func buildSelectField(field *scfconfig.FormField) huh.Field {
	formField := huh.NewSelect[string]().
		Title(field.Title).
		Description(field.Description).
		Options(huh.NewOptions[string](field.Options...)...).
		Validate(func(value string) error {
			_formResults.Set(field.VariableName, value)
			return nil
		})
	if field.Default != nil {
		val, ok := field.Default.(string)
		if !ok {
			val = ""
		}
		formField = formField.Value(&val)
	}
	return formField
}

func buildMultiSelectField(field *scfconfig.FormField) huh.Field {
	formField := huh.NewMultiSelect[string]().
		Title(field.Title).
		Description(field.Description).
		Options(huh.NewOptions[string](field.Options...)...).
		Validate(func(value []string) error {
			_formResults.Set(field.VariableName, value)
			return nil
		})
	if field.Default != nil {
		val, ok := field.Default.([]string)
		if !ok {
			slog.Info("default value is not a string array", "default", field.Default)
			slog.Info("default value is of type", "type", fmt.Sprintf("%T", field.Default))
			val = []string{}
		}
		formField = formField.Value(&val)
	}
	return formField
}

func buildConfirmField(field *scfconfig.FormField) huh.Field {
	formField := huh.NewConfirm().
		Title(field.Title).
		Description(field.Description).
		Affirmative("Yes").
		Negative("No").
		Validate(func(value bool) error {
			_formResults.Set(field.VariableName, value)
			return nil
		})
	if field.Default != nil {
		val, ok := field.Default.(bool)
		if !ok {
			val = false
		}
		formField = formField.Value(&val)
	}
	return formField
}

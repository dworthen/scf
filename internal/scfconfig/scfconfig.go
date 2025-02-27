package scfconfig

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"

	"github.com/dworthen/scf/internal/utils"
	"gopkg.in/yaml.v3"
)

type FormFieldType string

const (
	FormFieldTypeInput       FormFieldType = "input"
	FormFieldTypeText        FormFieldType = "text"
	FormFieldTypeSelect      FormFieldType = "select"
	FormFieldTypeMultiSelect FormFieldType = "multiselect"
	FormFieldTypeConfirm     FormFieldType = "confirm"
)

type FormField struct {
	VariableName string        `yaml:"variableName"`
	Title        string        `yaml:"title"`
	Description  string        `yaml:"description"`
	Type         FormFieldType `yaml:"type"`
	Required     bool          `yaml:"required"`
	Default      interface{}   `yaml:"default"`
	Options      []string      `yaml:"options"`
}

func (f *FormField) Validate() error {
	errs := []error{}
	if strings.TrimSpace(f.VariableName) == "" {
		errs = append(errs, fmt.Errorf("VariableName is required."))
	}
	if strings.TrimSpace(f.Title) == "" {
		errs = append(errs, fmt.Errorf("Title is required."))
	}
	f.Type = FormFieldType(strings.TrimSpace(strings.ToLower(string(f.Type))))
	switch f.Type {
	case FormFieldTypeInput, FormFieldTypeText, FormFieldTypeSelect, FormFieldTypeMultiSelect, FormFieldTypeConfirm:
	default:
		errs = append(errs, fmt.Errorf("Invalid FormFieldType. Expecting one of [Input, Text, Select, MultiSelect, Confirm]."))
	}
	if f.Type == FormFieldTypeSelect || f.Type == FormFieldTypeMultiSelect {
		if len(f.Options) == 0 {
			errs = append(errs, fmt.Errorf("Options is required for Select and MultiSelect types."))
		}
	}

	if len(errs) > 0 {
		return utils.NewWithStackTraceError(errors.Join(errs...))
	}

	return nil
}

type Form struct {
	Condition string       `yaml:"condition"`
	Fields    []*FormField `yaml:"fields"`
}

func (f *Form) Validate() error {
	errs := []error{}
	if len(f.Fields) == 0 {
		return utils.NewWithStackTraceError(fmt.Errorf("Fields is required."))
	} else {
		for _, field := range f.Fields {
			err := field.Validate()
			if err != nil {
				errs = append(errs, err)
			}
		}
	}

	if len(errs) > 0 {
		return errors.Join(errs...)
	}

	return nil
}

type Scaffold struct {
	Condition string   `yaml:"condition"`
	Files     []string `yaml:"files"`
	Parse     []string `yaml:"parse"`
}

type CommandsToRun struct {
	WorkingDirectory string   `yaml:"workingDirectory"`
	Condition        string   `yaml:"condition"`
	PostScaffold     []string `yaml:"postScaffold"`
}

type ScfConfig struct {
	Forms    []*Form                `yaml:"forms"`
	Scaffold map[string][]*Scaffold `yaml:"scaffold"`
	Commands []*CommandsToRun       `yaml:"commands"`
}

func (s *ScfConfig) Validate() error {
	errs := []error{}
	for _, form := range s.Forms {
		err := form.Validate()
		if err != nil {
			errs = append(errs, err)
		}
	}

	if len(errs) > 0 {
		return errors.Join(errs...)
	}

	return nil
}

func NewScfConfig(source string) (*ScfConfig, error) {
	stats, err := os.Stat(source)
	if err != nil {
		return nil, nil
	}

	if stats.IsDir() {
		source = filepath.Join(source, "scf.config.yaml")
	}

	base := filepath.Base(source)
	if base != "scf.config.yaml" {
		return nil, nil
	}

	_, err = os.Stat(source)
	if err != nil {
		return nil, nil
	}

	fileBytes, err := os.ReadFile(source)
	if err != nil {
		return nil, utils.NewWithStackTraceError(err)
	}

	scfConfig := &ScfConfig{}
	err = yaml.Unmarshal(fileBytes, scfConfig)
	if err != nil {
		return nil, utils.NewWithStackTraceError(err)
	}

	err = scfConfig.Validate()
	if err != nil {
		return nil, err
	}

	return scfConfig, nil
}

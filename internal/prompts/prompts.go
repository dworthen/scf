package prompts

import (
	"encoding/json"
	"fmt"
	"os"
	"os/exec"
	"strings"

	"github.com/Songmu/prompter"
	"github.com/mailgun/raymond/v2"
)

type Prompt struct {
	VariableName string      `json:"variableName"`
	Type         string      `json:"type"`
	Default      interface{} `json:"default"`
	Message      string      `json:"message"`
	Options      []string    `json:"options"`
	Required     bool        `json:"required"`
}

type ParseOptions struct {
	Include string `json:"include"`
	Exclude string `json:"exclude"`
}

type FileConditions struct {
	Condition        string       `json:"condition"`
	Files            []string     `json:"files"`
	WorkingDirectory string       `json:"workingDirectory"`
	Parse            ParseOptions `json:"parse"`
}

type Commands struct {
	PreScaffold  []string `json:"preScaffold"`
	PostScaffold []string `json:"postScaffold"`
}

type PromptFile struct {
	Prompts  []Prompt         `json:"prompts"`
	Files    []FileConditions `json:"files"`
	Commands Commands         `json:"commands"`
}

type Prompts struct {
	Prompts  []Prompt
	Answers  map[string]interface{}
	Files    []FileConditions
	Commands Commands
}

func New(promptFilePath string) (*Prompts, error) {
	fileInfo, err := os.Stat(promptFilePath)
	if err != nil {
		return nil, err
	}

	if !fileInfo.Mode().IsRegular() {
		return nil, fmt.Errorf("%s is not a file", promptFilePath)
	}

	fileContents, err := os.ReadFile(promptFilePath)
	if err != nil {
		return nil, err
	}

	var promptFile PromptFile
	err = json.Unmarshal(fileContents, &promptFile)
	if err != nil {
		return nil, err
	}

	return promptFile.RunPrompts()
}

func (promptFile *PromptFile) RunPrompts() (*Prompts, error) {
	files := []FileConditions{}
	answers := map[string]interface{}{}

	for _, prompt := range promptFile.Prompts {
		err := prompt.Validate()
		if err != nil {
			return nil, err
		}
		promptType := strings.ToLower(prompt.Type)
		switch promptType {
		case "prompt":
			defaultValue, ok := prompt.Default.(string)
			if !ok {
				defaultValue = ""
			}
			answer := prompter.Prompt(prompt.Message, defaultValue)
			if prompt.Required && strings.TrimSpace(answer) == "" {
				for {
					answer = prompter.Prompt(prompt.Message, defaultValue)
					if strings.TrimSpace(answer) != "" {
						break
					}
				}
			}
			answers[prompt.VariableName] = answer
		case "choose":
			defaultValue, ok := prompt.Default.(string)
			if !ok {
				defaultValue = ""
			}
			answer := prompter.Choose(prompt.Message, prompt.Options, defaultValue)
			answers[prompt.VariableName] = answer
		case "password":
			answer := prompter.Password(prompt.Message)
			if prompt.Required && strings.TrimSpace(answer) == "" {
				for {
					answer = prompter.Password(prompt.Message)
					if strings.TrimSpace(answer) != "" {
						break
					}
				}
			}
			answers[prompt.VariableName] = answer
		case "yesno", "yn":
			defaultValue, ok := prompt.Default.(bool)
			if !ok {
				defaultValue = false
			}
			answer := prompter.YesNo(prompt.Message, defaultValue)
			answers[prompt.VariableName] = answer
		}
	}

	if len(promptFile.Files) == 0 {
		files = append(files, FileConditions{
			Files: []string{"**/*"},
		})
	}

	for _, file := range promptFile.Files {
		if strings.TrimSpace(file.Condition) == "" {
			files = append(files, file)
			continue
		}

		result, err := raymond.Render(file.Condition, answers)
		if err != nil {
			return nil, err
		}

		if strings.ToLower(strings.TrimSpace(result)) == "true" {
			files = append(files, file)
		}
	}

	preCommands, err := parseCommands(promptFile.Commands.PreScaffold, answers)
	if err != nil {
		return nil, err
	}
	postCommands, err := parseCommands(promptFile.Commands.PostScaffold, answers)
	if err != nil {
		return nil, err
	}

	prompts := Prompts{
		Prompts: promptFile.Prompts,
		Answers: answers,
		Files:   files,
		Commands: Commands{
			PreScaffold:  preCommands,
			PostScaffold: postCommands,
		},
	}

	return &prompts, nil
}

func parseCommands(cmds []string, data map[string]interface{}) ([]string, error) {
	parsedCmds := []string{}
	for _, rawCmd := range cmds {
		cmd, err := raymond.Render(rawCmd, data)
		if err != nil {
			return []string{}, err
		}
		parsedCmds = append(parsedCmds, cmd)
	}
	return parsedCmds, nil
}

func runCmds(cmds []string, directory string) error {
	if len(cmds) > 0 {
		fmt.Println("Running commands...")
	}
	for _, cmd := range cmds {
		fmt.Println(cmd)
		cmds := strings.Split(cmd, " ")
		cmdStructure := exec.Command(cmds[0], cmds[1:]...)
		cmdStructure.Dir = directory
		out, err := cmdStructure.Output()
		if err != nil {
			return err
		}
		fmt.Println(string(out))
	}
	return nil
}

func (prompts *Prompts) RunPreCommands(directory string) error {
	return runCmds(prompts.Commands.PreScaffold, directory)
}

func (prompts *Prompts) RunPostCommands(directory string) error {
	return runCmds(prompts.Commands.PostScaffold, directory)
}

func (prompt *Prompt) Validate() error {
	validPromptTypes := []string{
		"prompt",
		"choose",
		"password",
		"yn",
		"yesno",
	}

	if len(strings.TrimSpace(prompt.VariableName)) == 0 {
		return fmt.Errorf("Must provide prompt variable name for storing the result.")
	}

	if len(strings.TrimSpace(prompt.Message)) == 0 {
		return fmt.Errorf("Must provide prompt message.")
	}

	promptType := strings.ToLower(prompt.Type)
	if !contains(validPromptTypes, promptType) {
		return fmt.Errorf("%s is not a valid prompt type. Must be one of %v.", prompt.Type, validPromptTypes)
	}

	if promptType == "choose" && len(prompt.Options) == 0 {
		return fmt.Errorf("Must provide 'options' for choose prompt.")
	}

	return nil
}

func contains(slice []string, val string) bool {
	for _, item := range slice {
		if item == val {
			return true
		}
	}
	return false
}

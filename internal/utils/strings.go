package utils

import (
	"fmt"
	"log/slog"
	"regexp"
	"strconv"
	"strings"

	"github.com/mailgun/raymond/v2"
)

func ParseString(s string, values map[string]interface{}) (string, error) {
	parsedStr, err := raymond.Render(s, values)
	if err != nil {
		slog.Error("utils: failed to parse string", "string", s, "values", values, "error", err)
		return "", NewWithStackTraceError(fmt.Errorf("Failed to parse string: %s with values %v, %s", s, values, err))
	}
	return parsedStr, nil
}

func IsTruthy(s string) bool {
	val, err := strconv.ParseBool(s)
	if err != nil {
		return false
	}
	return val
}

func GetCondition(value string, answers map[string]interface{}) (bool, error) {
	if strings.HasPrefix(value, "{{") {
		parsedStr, err := ParseString(value, answers)
		if err != nil {
			return false, err
		}
		return IsTruthy(parsedStr), nil
	}

	conditionValue, ok := answers[value]
	if !ok {
		return false, fmt.Errorf("Condition value not found: %s in %v", value, answers)
	}
	conditionBool, ok := conditionValue.(bool)
	if !ok {
		return false, fmt.Errorf("Condition value is not a boolean: Key: %s, value: %s", value, conditionValue)
	}
	return conditionBool, nil
}

func ParsePath(filePath string, values map[string]interface{}) (string, error) {
	patternStr := `(?im)({{[^{]+}})`
	pathPattern, err := regexp.Compile(patternStr)
	if err != nil {
		return "", fmt.Errorf("Failed to compile regex: %s, %w", patternStr, err)
	}

	matches := pathPattern.FindAllStringSubmatchIndex(filePath, -1)
	if len(matches) == 0 {
		return strings.TrimSuffix(filePath, ".hbs"), nil
	}

	contentSegments := []string{}
	startIndex := 0
	endIndex := 0

	for _, match := range matches {
		endIndex = match[2]
		start, end := match[2], match[3]
		key := filePath[start:end]
		parsedStr, err := ParseString(key, values)
		if err != nil {
			return "", fmt.Errorf("Failed to parse string: %s, %w", key, err)
		}
		if strings.TrimSpace(parsedStr) == "" {
			return filePath, nil
		}
		contentSegments = append(contentSegments, filePath[startIndex:endIndex], parsedStr)
		startIndex = match[3]
	}
	contentSegments = append(contentSegments, filePath[startIndex:])
	newPath := strings.Join(contentSegments, "")
	newPath = strings.TrimSuffix(newPath, ".hbs")
	return newPath, nil
}
